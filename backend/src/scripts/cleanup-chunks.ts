import { index } from '../config/pinecone';

async function cleanupOldChunks() {
  try {
    console.log('🧹 Cleaning up old chunk-style embeddings from Pinecone...');
    
    // Get all vectors with chunk-style IDs
    const allVectors = await index.query({
      vector: new Array(1536).fill(0.1),
      topK: 10000, // Get all vectors
      includeMetadata: true,
    });
    
    if (!allVectors.matches || allVectors.matches.length === 0) {
      console.log('📭 No vectors found in index');
      return;
    }
    
    console.log(`📊 Found ${allVectors.matches.length} total vectors in index`);
    
    // Identify old chunk-style IDs
    const chunkIds = allVectors.matches
      .filter(match => match.id && typeof match.id === 'string' && match.id.includes('_chunk_'))
      .map(match => match.id);
    
    console.log(`🔍 Found ${chunkIds.length} old chunk-style vectors to delete`);
    
    if (chunkIds.length === 0) {
      console.log('✅ No old chunks to clean up!');
      return;
    }
    
    // Show some examples
    console.log('📝 Sample chunk IDs to delete:');
    chunkIds.slice(0, 5).forEach(id => console.log(`   - ${id}`));
    if (chunkIds.length > 5) {
      console.log(`   ... and ${chunkIds.length - 5} more`);
    }
    
    console.log('\n🗑️  Deleting old chunk vectors...');
    
    // Delete in batches to avoid overwhelming Pinecone
    const batchSize = 100;
    let deleted = 0;
    
    for (let i = 0; i < chunkIds.length; i += batchSize) {
      const batch = chunkIds.slice(i, i + batchSize);
      
      try {
        await index.deleteMany(batch);
        deleted += batch.length;
        console.log(`   Deleted batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(chunkIds.length / batchSize)} (${deleted}/${chunkIds.length})`);
      } catch (batchError) {
        console.error(`   ❌ Error deleting batch:`, batchError);
      }
    }
    
    console.log(`\n✅ Cleanup complete! Deleted ${deleted} old chunk vectors`);
    
    // Verify cleanup by getting new stats
    console.log('\n📊 Verifying cleanup...');
    const newStats = await index.describeIndexStats();
    console.log('New index stats:', JSON.stringify(newStats, null, 2));
    
    // Check remaining vectors
    const remainingVectors = await index.query({
      vector: new Array(1536).fill(0.1),
      topK: 20,
      includeMetadata: true,
    });
    
    console.log(`\n📋 Remaining vectors: ${remainingVectors.matches?.length || 0}`);
    
    if (remainingVectors.matches && remainingVectors.matches.length > 0) {
      console.log('🏢 Remaining companies:');
      const companyNames = new Set();
      remainingVectors.matches.forEach(match => {
        const name = match.metadata?.name;
        if (name) companyNames.add(name);
      });
      Array.from(companyNames).forEach(name => console.log(`   - ${name}`));
    }
    
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
  }
}

// Run cleanup
cleanupOldChunks();