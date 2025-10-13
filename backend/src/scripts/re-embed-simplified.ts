import { embedAndStoreCompanies } from '../services/embedding.service';
import logger from '../utils/logger';

async function reEmbedAllCompanies() {
  try {
    console.log('🚀 Starting complete re-embedding of all companies with SIMPLIFIED approach...');
    console.log('📝 Changes made:');
    console.log('   - One document per company (no chunking)');
    console.log('   - Raw similarity scores (no artificial inflation)');
    console.log('   - Simplified ranking based purely on semantic similarity');
    console.log('   - Focused document content with key information');
    console.log('');
    
    const result = await embedAndStoreCompanies();
    
    if (result.success) {
      console.log('✅ SUCCESS!');
      console.log(`📊 Embedded ${result.count} companies`);
      console.log(`📋 ${result.message}`);
      console.log('');
      console.log('🎯 Expected improvements:');
      console.log('   - More accurate relevance scores');
      console.log('   - Better semantic matching');
      console.log('   - No more artificial 100% matches');
      console.log('   - Cleaner search results');
    } else {
      console.error('❌ FAILED!');
      console.error(`📋 ${result.message}`);
    }
    
  } catch (error) {
    console.error('💥 Unexpected error during re-embedding:', error);
    logger.error('Re-embedding failed:', error);
  }
  
  process.exit(0);
}

// Run the re-embedding
reEmbedAllCompanies();