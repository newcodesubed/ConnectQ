import ai from '../config/gemini';
import { pinecone, index } from '../config/pinecone';
import { db } from '../db';
import { companies } from '../model/companies.model';
import { eq, sql } from 'drizzle-orm';
import type { Company } from '../model/companies.model';
import config from '../config';

// Simplified approach: ONE focused document per company
function createCompanyDocument(company: Company): string {
  const parts: string[] = [];
  
  // Company name and core info (always first)
  if (company.name) {
    parts.push(`${company.name} is a ${company.industry || 'technology'} company`);
  }
  
  // Location
  if (company.location) {
    parts.push(`located in ${company.location}`);
  }
  
  // Main description (most important)
  if (company.description && company.description.trim().length > 10) {
    parts.push(`Description: ${company.description.trim()}`);
  }
  
  // Services (critical for matching)
  if (company.services && Array.isArray(company.services) && company.services.length > 0) {
    const servicesList = company.services.filter(s => s && s.trim()).join(', ');
    if (servicesList) {
      parts.push(`Services: ${servicesList}`);
    }
  }
  
  // Technologies (important for tech matching)
  if (company.technologiesUsed && Array.isArray(company.technologiesUsed) && company.technologiesUsed.length > 0) {
    const techList = company.technologiesUsed.filter(t => t && t.trim()).join(', ');
    if (techList) {
      parts.push(`Technologies: ${techList}`);
    }
  }
  
  // Specializations
  if (company.specializations && Array.isArray(company.specializations) && company.specializations.length > 0) {
    const specList = company.specializations.filter(s => s && s.trim()).join(', ');
    if (specList) {
      parts.push(`Specializations: ${specList}`);
    }
  }
  
  // Company tagline
  if (company.tagline && company.tagline.trim()) {
    parts.push(`Tagline: ${company.tagline.trim()}`);
  }
  
  // Project info
  if (company.costRange || company.deliveryDuration) {
    const projectInfo = [];
    if (company.costRange) projectInfo.push(`Budget range: ${company.costRange}`);
    if (company.deliveryDuration) projectInfo.push(`Delivery time: ${company.deliveryDuration}`);
    parts.push(projectInfo.join(', '));
  }
  
  return parts.join('. ');
}

// Simple metadata creation
function createCompanyMetadata(company: Company) {
  const safeValue = (value: any): string => {
    if (value === null || value === undefined) return '';
    if (Array.isArray(value)) return value.filter(v => v !== null && v !== undefined && String(v).trim()).join(', ');
    return String(value).trim();
  };

  return {
    company_id: company.id,
    name: safeValue(company.name),
    email: safeValue(company.email),
    industry: safeValue(company.industry),
    location: safeValue(company.location),
    description: safeValue(company.description),
    website: safeValue(company.website),
    tagline: safeValue(company.tagline),
    employeeCount: Number(company.employeeCount) || 0,
    services: safeValue(company.services),
    technologiesUsed: safeValue(company.technologiesUsed),
    specializations: safeValue(company.specializations),
    costRange: safeValue(company.costRange),
    deliveryDuration: safeValue(company.deliveryDuration),
    logoUrl: safeValue(company.logoUrl),
    embedded_at: new Date().toISOString(),
  };
}

// Fetch all companies from PostgreSQL
async function getAllCompanies(): Promise<Company[]> {
  try {
    const allCompanies = await db.select().from(companies);
    return allCompanies;
  } catch (error) {
    console.error('Error fetching companies from database:', error);
    throw new Error('Failed to fetch companies from database');
  }
}

// Generate embeddings with ONE document per company
async function embedCompanies(companyList: Company[]): Promise<any[]> {
  if (companyList.length === 0) {
    console.log('No companies to embed');
    return [];
  }

  try {
    // Create ONE focused document per company
    const documents = companyList.map(company => ({
      text: createCompanyDocument(company),
      metadata: createCompanyMetadata(company)
    }));

    console.log(`Generated ${documents.length} documents from ${companyList.length} companies (1:1 ratio)`);
    
    // Extract texts for embedding
    const texts = documents.map(doc => doc.text);
    
    // Log sample document for debugging
    if (documents.length > 0) {
      console.log('Sample document:', {
        companyName: documents[0].metadata.name,
        textLength: documents[0].text.length,
        textPreview: documents[0].text.substring(0, 200) + '...'
      });
    }
    
    // Generate embeddings using Gemini
    const embedRes = await ai.models.embedContent({
      model: 'gemini-embedding-001',
      contents: texts,
      config: {
        outputDimensionality: 1536,
        taskType: 'RETRIEVAL_DOCUMENT',
      },
    });

    if (!embedRes.embeddings || embedRes.embeddings.length === 0) {
      throw new Error('Failed to generate embeddings - no embeddings returned');
    }

    // Format vectors for Pinecone
    const vectors = embedRes.embeddings.map((embedding: any, i: number) => {
      const document = documents[i];
      
      return {
        id: document.metadata.company_id, // Use company ID directly
        values: embedding.values,
        metadata: {
          ...document.metadata,
          document_text: document.text // Keep full text for debugging
        },
      };
    });

    console.log(`Successfully generated ${vectors.length} embeddings (1 per company)`);
    return vectors;
  } catch (error) {
    console.error('Error generating embeddings with Gemini:', error);
    throw new Error('Failed to generate embeddings');
  }
}

// Upsert embeddings into Pinecone
async function upsertCompanyEmbeddings(vectors: any[]): Promise<void> {
  if (vectors.length === 0) {
    console.log('No vectors to upsert');
    return;
  }

  try {
    console.log(`Upserting ${vectors.length} vectors to Pinecone...`);
    
    // Validate vectors before upserting
    for (let i = 0; i < vectors.length; i++) {
      const vector = vectors[i];
      if (!vector.id || !vector.values || !Array.isArray(vector.values)) {
        throw new Error(`Invalid vector at index ${i}: missing id or values`);
      }
      
      // Clean metadata
      if (vector.metadata) {
        for (const [key, value] of Object.entries(vector.metadata)) {
          if (value === null || value === undefined) {
            vector.metadata[key] = '';
          }
        }
      }
    }
    
    // Batch upsert
    const batchSize = 100;
    for (let i = 0; i < vectors.length; i += batchSize) {
      const batch = vectors.slice(i, i + batchSize);
      
      try {
        await index.upsert(batch);
        console.log(`Upserted batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(vectors.length / batchSize)}`);
      } catch (batchError: any) {
        console.error(`Error upserting batch ${Math.floor(i / batchSize) + 1}:`, batchError);
        throw batchError;
      }
    }
    
    console.log(`Successfully upserted ${vectors.length} company vectors into Pinecone`);
  } catch (error: any) {
    console.error('Error upserting vectors to Pinecone:', error);
    throw new Error(`Failed to upsert vectors to Pinecone: ${error.message}`);
  }
}

// Main function to orchestrate the embedding process
export async function embedAndStoreCompanies(): Promise<{ success: boolean; count: number; message: string }> {
  try {
    console.log('Starting SIMPLIFIED company embedding process...');
    
    // Step 1: Fetch companies from PostgreSQL
    const companyList = await getAllCompanies();
    
    if (companyList.length === 0) {
      return {
        success: true,
        count: 0,
        message: 'No companies found in database to embed'
      };
    }
    
    console.log(`Found ${companyList.length} companies in database`);
    
    // Step 2: Generate embeddings (1 per company)
    const vectors = await embedCompanies(companyList);
    
    // Step 3: Store in Pinecone
    await upsertCompanyEmbeddings(vectors);
    
    return {
      success: true,
      count: vectors.length,
      message: `Successfully embedded and stored ${vectors.length} companies in Pinecone (1:1 ratio)`
    };
    
  } catch (error) {
    console.error('Error in embedAndStoreCompanies:', error);
    return {
      success: false,
      count: 0,
      message: `Failed to embed companies: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

// Function to embed a single company
export async function embedSingleCompany(companyId: string): Promise<{ success: boolean; message: string }> {
  try {
    console.log(`Embedding single company: ${companyId}`);
    
    // Delete existing embedding for this company
    try {
      await index.deleteOne(companyId);
      console.log(`Deleted existing embedding for company ${companyId}`);
    } catch (deleteError) {
      console.warn('Could not delete existing embedding, proceeding with new embedding:', deleteError);
    }
    
    // Fetch the specific company
    const company = await db.select().from(companies).where(eq(companies.id, companyId));
    
    if (!company || company.length === 0) {
      return {
        success: false,
        message: `Company with ID ${companyId} not found`
      };
    }
    
    // Generate embeddings for the company
    const vectors = await embedCompanies([company[0]]);
    
    // Store in Pinecone
    await upsertCompanyEmbeddings(vectors);
    
    console.log(`Successfully embedded company: ${company[0].name}`);
    
    return {
      success: true,
      message: `Successfully embedded company: ${company[0].name}`
    };
    
  } catch (error) {
    console.error('Error embedding single company:', error);
    return {
      success: false,
      message: `Failed to embed company: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

// Function to remove a company's embeddings
export async function removeCompanyEmbeddings(companyId: string): Promise<{ success: boolean; message: string }> {
  try {
    console.log(`Removing embeddings for deleted company: ${companyId}`);
    
    await index.deleteOne(companyId);
    
    console.log(`Successfully deleted embedding for company ${companyId}`);
    
    return {
      success: true,
      message: `Successfully removed embedding for deleted company`
    };
    
  } catch (error) {
    console.error('Error removing company embeddings:', error);
    return {
      success: false,
      message: `Failed to remove company embeddings: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

// SIMPLIFIED search function with raw similarity scores
export async function searchCompanies(query: string, topK: number = 10): Promise<{ matches: any[]; message: string }> {
  try {
    console.log(`Searching companies with query: "${query}"`);
    
    // Generate embedding for the search query
    const queryEmbedding = await ai.models.embedContent({
      model: 'gemini-embedding-001',
      contents: [query],
      config: {
        outputDimensionality: 1536,
        taskType: 'RETRIEVAL_QUERY',
      },
    });
    
    if (!queryEmbedding.embeddings || queryEmbedding.embeddings.length === 0 || !queryEmbedding.embeddings[0].values) {
      throw new Error('Failed to generate query embedding');
    }
    
    // Search in Pinecone - simple and direct
    const searchResults = await index.query({
      vector: queryEmbedding.embeddings[0].values,
      topK: topK,
      includeMetadata: true,
    });
    
    if (!searchResults.matches || searchResults.matches.length === 0) {
      return {
        matches: [],
        message: 'No matching companies found'
      };
    }

    // Get company IDs from results
    const companyIds = searchResults.matches.map((match: any) => match.metadata?.company_id || match.id);
    
    // Fetch full company data
    const companiesData = await db.select().from(companies).where(
      sql`${companies.id} IN (${sql.join(companyIds.map(id => sql`${id}`), sql`, `)})`
    );
    
    // Create lookup map
    const companyDataMap = new Map();
    companiesData.forEach(company => {
      companyDataMap.set(company.id, company);
    });

    // Format results with RAW similarity scores (no artificial inflation)
    const formattedMatches = searchResults.matches.map((match: any, index: number) => {
      const companyId = match.metadata?.company_id || match.id;
      const fullCompanyData = companyDataMap.get(companyId);
      const rawScore = match.score || 0;
      
      // Convert cosine similarity to percentage (0.0 to 1.0 -> 0% to 100%)
      // Cosine similarity typically ranges from -1 to 1, but Pinecone normalizes to 0-1
      const percentageScore = Math.max(0, Math.min(1, rawScore));
      
      return {
        id: companyId,
        score: percentageScore, // RAW similarity score as percentage
        // Include all company fields directly
        name: fullCompanyData?.name,
        location: fullCompanyData?.location,
        employees: fullCompanyData?.employeeCount,
        industry: fullCompanyData?.industry,
        description: fullCompanyData?.description,
        email: fullCompanyData?.email,
        website: fullCompanyData?.website,
        logoUrl: fullCompanyData?.logoUrl,
        services: fullCompanyData?.services,
        technologiesUsed: fullCompanyData?.technologiesUsed,
        specializations: fullCompanyData?.specializations,
        costRange: fullCompanyData?.costRange,
        deliveryDuration: fullCompanyData?.deliveryDuration,
        tagline: fullCompanyData?.tagline,
        // Debug info
        raw_similarity_score: rawScore,
        search_rank: index + 1,
        document_preview: match.metadata?.document_text?.substring(0, 150) + '...',
        metadata: {
          ...match.metadata,
          raw_similarity_score: rawScore,
          search_rank: index + 1
        }
      };
    });

    console.log(`Found ${formattedMatches.length} companies. Top 3 results:`);
    formattedMatches.slice(0, 3).forEach((match, index) => {
      console.log(`${index + 1}. ${match.name}`);
      console.log(`   Similarity: ${(match.score * 100).toFixed(1)}%`);
      console.log(`   Raw Score: ${match.raw_similarity_score.toFixed(4)}`);
      console.log(`   Industry: ${match.industry}`);
      console.log(`   Preview: ${match.document_preview}`);
    });

    return {
      matches: formattedMatches,
      message: `Found ${formattedMatches.length} matching companies (sorted by similarity)`
    };
    
  } catch (error) {
    console.error('Error searching companies:', error);
    return {
      matches: [],
      message: `Search failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}