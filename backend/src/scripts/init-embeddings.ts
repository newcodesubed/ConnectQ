import 'dotenv/config';
import { pinecone } from '../config/pinecone';
import { embedAndStoreCompanies } from '../services/embedding.service';
import config from '../config';

async function initializePineconeIndex() {
  try {
    console.log('Initializing Pinecone index...');
    
    if (!config.pineconeIndexName) {
      throw new Error('Pinecone index name is not configured');
    }
    
    // Create index if it doesn't exist
    await pinecone.createIndex({
      name: config.pineconeIndexName,
      dimension: 1536, // Gemini embedding dimension
      metric: 'cosine', // Cosine similarity for semantic search
      spec: {
        serverless: { 
          cloud: 'aws', 
          region: 'us-east-1' 
        },
      },
      suppressConflicts: true, // Don't throw if index already exists
      waitUntilReady: true, // Wait until index is ready
    });
    
    console.log(`✅ Pinecone index "${config.pineconeIndexName}" is ready`);
    return true;
  } catch (error) {
    console.error('❌ Error creating Pinecone index:', error);
    return false;
  }
}

async function main() {
  console.log('🚀 Starting company embedding initialization...');
  
  try {
    // Step 1: Initialize Pinecone index
    const indexReady = await initializePineconeIndex();
    if (!indexReady) {
      console.error('Failed to initialize Pinecone index. Exiting...');
      process.exit(1);
    }
    
    // Step 2: Embed and store all companies
    console.log('📊 Starting to embed all companies...');
    const result = await embedAndStoreCompanies();
    
    if (result.success) {
      console.log(`✅ Successfully embedded ${result.count} companies!`);
      console.log(`📝 ${result.message}`);
    } else {
      console.error(`❌ Failed to embed companies: ${result.message}`);
      process.exit(1);
    }
    
  } catch (error) {
    console.error('❌ Fatal error during initialization:', error);
    process.exit(1);
  }
  
  console.log('🎉 Company embedding initialization completed successfully!');
  process.exit(0);
}

// Run the script
main().catch((error) => {
  console.error('❌ Unhandled error:', error);
  process.exit(1);
});