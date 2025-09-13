import ai from '../config/gemini';
import { pinecone, index } from '../config/pinecone';
import { db } from '../db';
import { companies } from '../model/companies.model';
import { eq } from 'drizzle-orm';
import type { Company } from '../model/companies.model';
import config from '../config';

// Enhanced chunking function to create focused document chunks
function createCompanyChunks(company: Company): Array<{ text: string; type: string; importance: number }> {
  const chunks: Array<{ text: string; type: string; importance: number }> = [];
  
  const formatArray = (arr: string[] | null | undefined) => {
    if (!arr || !Array.isArray(arr)) return [];
    return arr.filter(item => item && item.trim() !== '');
  };
  
  const formatText = (text: string | null | undefined) => {
    if (!text || text.trim() === '') return '';
    return text.trim();
  };

  // Core business information (highest importance)
  if (company.name) {
    chunks.push({
      text: `${company.name} is a company specializing in ${company.industry || 'technology services'} located in ${company.location || 'various locations'}.`,
      type: 'core_info',
      importance: 1.0
    });
  }

  // Company description (high importance)
  if (company.description && company.description.length > 10) {
    // Split description into sentences and create focused chunks
    const sentences = company.description.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    if (sentences.length === 1) {
      chunks.push({
        text: `About ${company.name}: ${company.description}`,
        type: 'description',
        importance: 0.95
      });
    } else {
      // Group 2-3 sentences per chunk for better context
      for (let i = 0; i < sentences.length; i += 2) {
        const chunkSentences = sentences.slice(i, i + 3);
        const chunkText = chunkSentences.join('. ').trim();
        if (chunkText.length > 20) {
          chunks.push({
            text: `${company.name} description: ${chunkText}.`,
            type: 'description',
            importance: 0.95 - (i * 0.1) // Slightly decrease importance for later sentences
          });
        }
      }
    }
  }

  // Services offered (very high importance for matching)
  const services = formatArray(company.services);
  if (services.length > 0) {
    // Create focused chunks for services
    if (services.length <= 3) {
      chunks.push({
        text: `${company.name} offers the following services: ${services.join(', ')}.`,
        type: 'services',
        importance: 0.98
      });
    } else {
      // Split services into smaller groups
      for (let i = 0; i < services.length; i += 3) {
        const serviceGroup = services.slice(i, i + 3);
        chunks.push({
          text: `${company.name} provides: ${serviceGroup.join(', ')}.`,
          type: 'services',
          importance: 0.98
        });
      }
    }
  }

  // Technologies used (high importance for technical matching)
  const technologies = formatArray(company.technologiesUsed);
  if (technologies.length > 0) {
    if (technologies.length <= 4) {
      chunks.push({
        text: `${company.name} works with technologies including: ${technologies.join(', ')}.`,
        type: 'technologies',
        importance: 0.92
      });
    } else {
      // Group technologies by type or split into manageable chunks
      for (let i = 0; i < technologies.length; i += 4) {
        const techGroup = technologies.slice(i, i + 4);
        chunks.push({
          text: `Technical expertise at ${company.name}: ${techGroup.join(', ')}.`,
          type: 'technologies',
          importance: 0.92
        });
      }
    }
  }

  // Specializations (medium-high importance)
  const specializations = formatArray(company.specializations);
  if (specializations.length > 0) {
    chunks.push({
      text: `${company.name} specializes in: ${specializations.join(', ')}.`,
      type: 'specializations',
      importance: 0.88
    });
  }

  // Project scope and pricing (important for project matching)
  if (company.costRange || company.deliveryDuration) {
    const scopeInfo = [];
    if (company.costRange) scopeInfo.push(`budget range of ${company.costRange}`);
    if (company.deliveryDuration) scopeInfo.push(`typical delivery time of ${company.deliveryDuration}`);
    
    chunks.push({
      text: `${company.name} works with ${scopeInfo.join(' and ')}.`,
      type: 'project_scope',
      importance: 0.85
    });
  }

  // Company profile with tagline (medium importance)
  if (company.tagline) {
    chunks.push({
      text: `${company.name}: "${company.tagline}" - ${company.industry || 'technology'} company based in ${company.location || 'various locations'}.`,
      type: 'profile',
      importance: 0.80
    });
  }

  // Industry and location context (medium importance)
  if (company.industry && company.location) {
    chunks.push({
      text: `${company.name} is a ${company.industry} company located in ${company.location} with ${company.employeeCount || 'a team of'} employees.`,
      type: 'context',
      importance: 0.75
    });
  }

  // Customer reviews and feedback (lower importance but useful)
  const reviews = formatArray(company.reviews);
  if (reviews.length > 0) {
    reviews.forEach((review, index) => {
      if (review.length > 20) {
        chunks.push({
          text: `Client feedback for ${company.name}: "${review}"`,
          type: 'reviews',
          importance: 0.70 - (index * 0.05) // Decrease importance for additional reviews
        });
      }
    });
  }

  return chunks.filter(chunk => chunk.text.length > 20); // Filter out very short chunks
}

// Enhanced canonicalization that creates multiple focused documents per company
function createCompanyDocuments(company: Company): Array<{ text: string; metadata: any }> {
  const chunks = createCompanyChunks(company);
  
  // Helper function to safely convert values
  const safeValue = (value: any): string => {
    if (value === null || value === undefined) return '';
    if (Array.isArray(value)) return value.filter(v => v !== null && v !== undefined).join(', ');
    return String(value);
  };

  const safeNumber = (value: any): number => {
    if (value === null || value === undefined) return 0;
    return Number(value) || 0;
  };

  // Create base metadata for all chunks
  const baseMetadata = {
    company_id: company.id,
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
    embedded_at: new Date().toISOString(),
  };

  // Create documents with chunk-specific metadata
  return chunks.map((chunk, index) => ({
    text: chunk.text,
    metadata: {
      ...baseMetadata,
      id: `${company.id}_chunk_${index}`, // Unique ID for each chunk
      chunk_type: chunk.type,
      chunk_importance: chunk.importance,
      chunk_index: index,
      total_chunks: chunks.length,
      chunk_text: chunk.text, // Keep for debugging
    }
  }));
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

// Generate embeddings using Gemini with chunked documents
async function embedCompanies(companyList: Company[]): Promise<any[]> {
  if (companyList.length === 0) {
    console.log('No companies to embed');
    return [];
  }

  try {
    // Create chunked documents for all companies
    const allDocuments: Array<{ text: string; metadata: any }> = [];
    
    companyList.forEach(company => {
      const documents = createCompanyDocuments(company);
      allDocuments.push(...documents);
    });

    console.log(`Generated ${allDocuments.length} document chunks from ${companyList.length} companies`);
    console.log(`Average chunks per company: ${(allDocuments.length / companyList.length).toFixed(1)}`);
    
    // Extract texts for embedding
    const texts = allDocuments.map(doc => doc.text);
    
    // Generate embeddings using Gemini
    const embedRes = await ai.models.embedContent({
      model: 'gemini-embedding-001',
      contents: texts,
      config: {
        outputDimensionality: 1536,
        taskType: 'RETRIEVAL_DOCUMENT', // Optimized for search retrieval
      },
    });

    if (!embedRes.embeddings || embedRes.embeddings.length === 0) {
      throw new Error('Failed to generate embeddings - no embeddings returned');
    }

    // Format vectors for Pinecone
    const vectors = embedRes.embeddings.map((embedding: any, i: number) => {
      const document = allDocuments[i];
      
      return {
        id: document.metadata.id,
        values: embedding.values,
        metadata: document.metadata,
      };
    });

    console.log(`Successfully generated ${vectors.length} chunk embeddings`);
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
    
    // First, delete existing chunks for this company
    try {
      // Get all existing chunk IDs for this company
      const existingChunks = await index.query({
        vector: new Array(1536).fill(0), // Dummy vector
        topK: 1000,
        filter: { company_id: companyId },
        includeMetadata: true,
      });

      if (existingChunks.matches && existingChunks.matches.length > 0) {
        const chunkIds = existingChunks.matches.map(match => match.id);
        await index.deleteMany(chunkIds);
        console.log(`Deleted ${chunkIds.length} existing chunks for company ${companyId}`);
      }
    } catch (deleteError) {
      console.warn('Could not delete existing chunks, proceeding with new embedding:', deleteError);
    }
    
    // Fetch the specific company
    const company = await db.select().from(companies).where(eq(companies.id, companyId));
    
    if (!company || company.length === 0) {
      return {
        success: false,
        message: `Company with ID ${companyId} not found`
      };
    }
    
    // Generate embeddings for the company chunks
    const vectors = await embedCompanies([company[0]]);
    
    // Store in Pinecone
    await upsertCompanyEmbeddings(vectors);
    
    console.log(`Successfully embedded ${vectors.length} chunks for company: ${company[0].name}`);
    
    return {
      success: true,
      message: `Successfully embedded company: ${company[0].name} (${vectors.length} chunks)`
    };
    
  } catch (error) {
    console.error('Error embedding single company:', error);
    return {
      success: false,
      message: `Failed to embed company: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

// Function to remove a company's vectors when the company is deleted
export async function removeCompanyEmbeddings(companyId: string): Promise<{ success: boolean; message: string }> {
  try {
    console.log(`Removing embeddings for deleted company: ${companyId}`);
    
    // Get all existing chunk IDs for this company
    const existingChunks = await index.query({
      vector: new Array(1536).fill(0), // Dummy vector
      topK: 1000, // Get all chunks for this company
      filter: { company_id: companyId },
      includeMetadata: true,
    });

    if (!existingChunks.matches || existingChunks.matches.length === 0) {
      return {
        success: true,
        message: `No embeddings found for company ${companyId} - may have already been removed`
      };
    }

    // Delete all chunks for this company
    const chunkIds = existingChunks.matches.map(match => match.id);
    await index.deleteMany(chunkIds);
    
    console.log(`Successfully deleted ${chunkIds.length} embedding chunks for company ${companyId}`);
    
    return {
      success: true,
      message: `Successfully removed ${chunkIds.length} embeddings for deleted company`
    };
    
  } catch (error) {
    console.error('Error removing company embeddings:', error);
    return {
      success: false,
      message: `Failed to remove company embeddings: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

// Function to search companies using embeddings with chunk aggregation
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
    
    // Search in Pinecone with higher topK to get multiple chunks per company
    const searchResults = await index.query({
      vector: queryEmbedding.embeddings[0].values,
      topK: topK * 5, // Get more results to have multiple chunks per company
      includeMetadata: true,
    });
    
    if (!searchResults.matches || searchResults.matches.length === 0) {
      return {
        matches: [],
        message: 'No matching companies found'
      };
    }

    // Aggregate chunks by company and calculate weighted scores
    const companyMap = new Map<string, {
      company_id: string;
      best_score: number;
      weighted_score: number;
      total_chunks: number;
      matching_chunks: number;
      chunk_details: Array<{
        score: number;
        chunk_type: string;
        importance: number;
        text: string;
      }>;
      metadata: any;
    }>();

    searchResults.matches.forEach((match: any) => {
      const companyId = match.metadata?.company_id;
      if (!companyId) return;

      const score = match.score || 0;
      const chunkType = match.metadata?.chunk_type || 'unknown';
      const importance = match.metadata?.chunk_importance || 0.5;
      const chunkText = match.metadata?.chunk_text || '';

      if (!companyMap.has(companyId)) {
        companyMap.set(companyId, {
          company_id: companyId,
          best_score: score,
          weighted_score: score * importance,
          total_chunks: match.metadata?.total_chunks || 1,
          matching_chunks: 1,
          chunk_details: [],
          metadata: match.metadata
        });
      }

      const company = companyMap.get(companyId)!;
      
      // Update best score
      if (score > company.best_score) {
        company.best_score = score;
      }
      
      // Add to weighted score (with diminishing returns for additional chunks)
      const diminishingFactor = 1 / Math.sqrt(company.matching_chunks);
      company.weighted_score += (score * importance * diminishingFactor);
      company.matching_chunks++;
      
      // Store chunk details for debugging
      company.chunk_details.push({
        score,
        chunk_type: chunkType,
        importance,
        text: chunkText.substring(0, 100) + '...' // Truncate for debugging
      });
    });

    // Convert to array and sort by weighted score
    const rankedCompanies = Array.from(companyMap.values())
      .sort((a, b) => b.weighted_score - a.weighted_score)
      .slice(0, topK); // Limit to requested number of companies

    // Format results to match the original interface
    const formattedMatches = rankedCompanies.map(company => ({
      id: company.company_id,
      score: company.best_score, // Use best score for display
      metadata: {
        ...company.metadata,
        // Add aggregation info for debugging
        matching_chunks: company.matching_chunks,
        weighted_score: company.weighted_score,
        chunk_details: company.chunk_details
      }
    }));

    console.log(`Aggregated ${searchResults.matches.length} chunks into ${formattedMatches.length} companies`);
    console.log(`Top 3 companies with scores:`, formattedMatches.slice(0, 3).map(m => ({
      name: m.metadata.name,
      score: m.score,
      weighted_score: m.metadata.weighted_score,
      chunks: m.metadata.matching_chunks
    })));

    return {
      matches: formattedMatches,
      message: `Found ${formattedMatches.length} matching companies from ${searchResults.matches.length} relevant chunks`
    };
    
  } catch (error) {
    console.error('Error searching companies:', error);
    return {
      matches: [],
      message: `Search failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}