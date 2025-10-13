import { index } from '../config/pinecone';

async function debugPineconeIndex() {
  try {
    console.log('🔍 Debugging Pinecone index contents...');
    
    // Get index stats
    const stats = await index.describeIndexStats();
    console.log('📊 Index Stats:', JSON.stringify(stats, null, 2));
    
    // Try to query for all vectors
    console.log('\n🔎 Fetching sample vectors...');
    const sampleQuery = await index.query({
      vector: new Array(1536).fill(0.1), // Dummy vector
      topK: 50, // Get more results to see patterns
      includeMetadata: true,
    });
    
    console.log(`\n📋 Found ${sampleQuery.matches?.length || 0} vectors in total`);
    
    if (sampleQuery.matches && sampleQuery.matches.length > 0) {
      // Group by company to see duplicates
      const companyGroups = new Map<string, any[]>();
      
      sampleQuery.matches.forEach((match: any) => {
        const companyId = match.metadata?.company_id || match.id;
        const companyName = match.metadata?.name || 'Unknown';
        const key = `${companyId}_${companyName}`;
        
        if (!companyGroups.has(key)) {
          companyGroups.set(key, []);
        }
        companyGroups.get(key)!.push(match);
      });
      
      console.log('\n🏢 Companies in index:');
      Array.from(companyGroups.entries()).forEach(([key, matches]) => {
        const [companyId, companyName] = key.split('_');
        console.log(`   ${companyName}: ${matches.length} vectors (Company ID: ${companyId})`);
        
        if (matches.length > 1) {
          console.log('     ⚠️  DUPLICATE DETECTED!');
          matches.forEach((match, index) => {
            console.log(`     Vector ${index + 1}: ID=${match.id}, Metadata Keys=[${Object.keys(match.metadata || {}).join(', ')}]`);
          });
        }
      });
      
      // Check for chunk-style IDs
      const chunkStyleIds = sampleQuery.matches.filter(m => 
        m.id && typeof m.id === 'string' && m.id.includes('_chunk_')
      );
      
      if (chunkStyleIds.length > 0) {
        console.log(`\n⚠️  Found ${chunkStyleIds.length} old chunk-style IDs that should be cleaned up`);
        console.log('   Sample chunk IDs:', chunkStyleIds.slice(0, 5).map(m => m.id));
      }
    }
    
  } catch (error) {
    console.error('❌ Error debugging index:', error);
  }
}

// Run the debug
debugPineconeIndex();