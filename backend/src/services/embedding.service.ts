import ai from '../config/gemini';
import { pinecone, index } from '../config/pinecone';
import { db } from '../db';
import { companies } from '../model/companies.model';
import { eq } from 'drizzle-orm';
import type { Company } from '../model/companies.model';
import config from '../config';

// Canonicalize company data into a single string for embedding
function toDoc(company: Company): string {
  const formatArray = (arr: string[] | null | undefined) => {
    if (!arr || !Array.isArray(arr)) return 'Not specified';
    const filtered = arr.filter(item => item && item.trim() !== '');
    return filtered.length > 0 ? filtered.join(', ') : 'Not specified';
  };
  
  const formatDate = (date: Date | null | undefined) => {
    if (!date) return 'Not specified';
    try {
      return date.getFullYear().toString();
    } catch {
      return 'Not specified';
    }
  };
  
  const formatText = (text: string | null | undefined) => {
    if (!text || text.trim() === '') return 'Not specified';
    return text.trim();
  };
  
  const formatNumber = (num: number | null | undefined) => {
    if (num === null || num === undefined || isNaN(num)) return 'Not specified';
    return num.toString();
  };
  
  return [
    `Company: ${formatText(company.name)}`,
    `Email: ${formatText(company.email)}`,
    `Industry: ${formatText(company.industry)}`,
    `Location: ${formatText(company.location)}`,
    `Description: ${formatText(company.description)}`,
    `Tagline: ${formatText(company.tagline)}`,
    `Website: ${formatText(company.website)}`,
    `Founded: ${formatDate(company.foundedAt)}`,
    `Contact: ${formatText(company.contactNumber)}`,
    `Employee Count: ${formatNumber(company.employeeCount)}`,
    `Services: ${formatArray(company.services)}`,
    `Technologies Used: ${formatArray(company.technologiesUsed)}`,
    `Specializations: ${formatArray(company.specializations)}`,
    `Cost Range: ${formatText(company.costRange)}`,
    `Delivery Duration: ${formatText(company.deliveryDuration)}`,
    `Reviews: ${formatArray(company.reviews)}`,
    `LinkedIn: ${formatText(company.linkedinUrl)}`,
    `Twitter: ${formatText(company.twitterUrl)}`,
  ].join('\n');
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

// Generate embeddings using Gemini
async function embedCompanies(companyList: Company[]): Promise<any[]> {
  if (companyList.length === 0) {
    console.log('No companies to embed');
    return [];
  }

  try {
    const texts = companyList.map(toDoc);
    console.log(`Generating embeddings for ${texts.length} companies...`);
    
    // Generate embeddings using Gemini
    const embedRes = await ai.models.embedContent({
      model: 'gemini-embedding-001',
      contents: texts,
      config: {
        outputDimensionality: 1536, // Standard dimension for good balance
        taskType: 'RETRIEVAL_DOCUMENT', // Optimized for search retrieval
      },
    });

    if (!embedRes.embeddings || embedRes.embeddings.length === 0) {
      throw new Error('Failed to generate embeddings - no embeddings returned');
    }

    // Format vectors for Pinecone (filter out null values)
    const vectors = embedRes.embeddings.map((embedding: any, i: number) => {
      const company = companyList[i];
      
      // Helper function to safely convert values (Pinecone doesn't accept null)
      const safeValue = (value: any): string => {
        if (value === null || value === undefined) return '';
        if (Array.isArray(value)) return value.filter(v => v !== null && v !== undefined).join(', ');
        return String(value);
      };

      const safeNumber = (value: any): number => {
        if (value === null || value === undefined) return 0;
        return Number(value) || 0;
      };

      return {
        id: company.id.toString(),
        values: embedding.values,
        metadata: {
          // Include all company data in metadata for filtering (no null values)
          id: company.id,
          name: safeValue(company.name),
          email: safeValue(company.email),
          industry: safeValue(company.industry),
          location: safeValue(company.location),
          description: safeValue(company.description),
          website: safeValue(company.website),
          tagline: safeValue(company.tagline),
          foundedAt: company.foundedAt?.toISOString() || '',
          employeeCount: safeNumber(company.employeeCount),
          services: safeValue(company.services),
          technologiesUsed: safeValue(company.technologiesUsed),
          specializations: safeValue(company.specializations),
          costRange: safeValue(company.costRange),
          deliveryDuration: safeValue(company.deliveryDuration),
          contactNumber: safeValue(company.contactNumber),
          logoUrl: safeValue(company.logoUrl),
          linkedinUrl: safeValue(company.linkedinUrl),
          twitterUrl: safeValue(company.twitterUrl),
          reviews: safeValue(company.reviews),
          // Keep the text representation for debugging
          chunk_text: texts[i],
          // Add timestamp for tracking
          embedded_at: new Date().toISOString(),
        },
      };
    });

    console.log(`Successfully generated ${vectors.length} embeddings`);
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
      
      // Check for null values in metadata
      if (vector.metadata) {
        for (const [key, value] of Object.entries(vector.metadata)) {
          if (value === null || value === undefined) {
            console.warn(`Null value detected for metadata key '${key}' in vector ${vector.id}, converting to empty string`);
            vector.metadata[key] = '';
          }
        }
      }
    }
    
    // Batch upsert for better performance (Pinecone supports up to 100 vectors per batch)
    const batchSize = 100;
    for (let i = 0; i < vectors.length; i += batchSize) {
      const batch = vectors.slice(i, i + batchSize);
      
      try {
        await index.upsert(batch);
        console.log(`Upserted batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(vectors.length / batchSize)}`);
      } catch (batchError: any) {
        console.error(`Error upserting batch ${Math.floor(i / batchSize) + 1}:`, batchError);
        
        // Log problematic vectors for debugging
        console.error('Batch vectors that failed:', JSON.stringify(batch.map(v => ({
          id: v.id,
          metadataKeys: Object.keys(v.metadata || {}),
          hasNullValues: Object.values(v.metadata || {}).some(val => val === null || val === undefined)
        })), null, 2));
        
        throw batchError;
      }
    }
    
    console.log(`Successfully upserted ${vectors.length} company vectors into Pinecone index: ${config.pineconeIndexName}`);
  } catch (error: any) {
    console.error('Error upserting vectors to Pinecone:', error);
    
    // Additional debugging information
    if (vectors.length > 0) {
      console.error('Sample vector structure:', JSON.stringify({
        id: vectors[0].id,
        valuesLength: vectors[0].values?.length,
        metadataKeys: Object.keys(vectors[0].metadata || {}),
        sampleMetadata: Object.fromEntries(
          Object.entries(vectors[0].metadata || {}).slice(0, 3)
        )
      }, null, 2));
    }
    
    throw new Error(`Failed to upsert vectors to Pinecone: ${error.message}`);
  }
}

// Main function to orchestrate the embedding process
export async function embedAndStoreCompanies(): Promise<{ success: boolean; count: number; message: string }> {
  try {
    console.log('Starting company embedding process...');
    
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
    
    // Step 2: Generate embeddings
    const vectors = await embedCompanies(companyList);
    
    // Step 3: Store in Pinecone
    await upsertCompanyEmbeddings(vectors);
    
    return {
      success: true,
      count: vectors.length,
      message: `Successfully embedded and stored ${vectors.length} companies in Pinecone`
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

// Function to embed a single company (useful when a new company is created/updated)
export async function embedSingleCompany(companyId: string): Promise<{ success: boolean; message: string }> {
  try {
    console.log(`Embedding single company: ${companyId}`);
    
    // Fetch the specific company
    const company = await db.select().from(companies).where(eq(companies.id, companyId));
    
    if (!company || company.length === 0) {
      return {
        success: false,
        message: `Company with ID ${companyId} not found`
      };
    }
    
    // Generate embedding for single company
    const vectors = await embedCompanies([company[0]]);
    
    // Store in Pinecone
    await upsertCompanyEmbeddings(vectors);
    
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

// Function to search companies using embeddings
export async function searchCompanies(query: string, topK: number = 10): Promise<{ matches: any[]; message: string }> {
  try {
    console.log(`Searching companies with query: "${query}"`);
    
    // Generate embedding for the search query
    const queryEmbedding = await ai.models.embedContent({
      model: 'gemini-embedding-001',
      contents: [query],
      config: {
        outputDimensionality: 1536,
        taskType: 'RETRIEVAL_QUERY', // Optimized for search queries
      },
    });
    
    if (!queryEmbedding.embeddings || queryEmbedding.embeddings.length === 0 || !queryEmbedding.embeddings[0].values) {
      throw new Error('Failed to generate query embedding');
    }
    
    // Search in Pinecone
    const searchResults = await index.query({
      vector: queryEmbedding.embeddings[0].values,
      topK,
      includeMetadata: true,
    });
    
    return {
      matches: searchResults.matches || [],
      message: `Found ${searchResults.matches?.length || 0} matching companies`
    };
    
  } catch (error) {
    console.error('Error searching companies:', error);
    return {
      matches: [],
      message: `Search failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}