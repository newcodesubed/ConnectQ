import { db } from '../db';
import { companies } from '../model/companies.model';
import { index } from '../config/pinecone';
import '../config'; // Load environment variables

async function cleanupOrphanedEmbeddings() {
  console.log('🧹 Starting cleanup of orphaned embeddings...\n');

  try {
    // Get all company IDs from the database
    const existingCompanies = await db.select({ id: companies.id }).from(companies);
    const existingCompanyIds = new Set(existingCompanies.map(c => c.id));
    
    console.log(`📊 Found ${existingCompanyIds.size} companies in database`);

    // Get all embeddings from Pinecone
    console.log('🔍 Scanning Pinecone for all embeddings...');
    
    // Since Pinecone doesn't have a "list all" operation, we'll query with a dummy vector
    // and use a high topK to get as many as possible
    const allEmbeddings = await index.query({
      vector: new Array(1536).fill(0), // Dummy vector
      topK: 10000, // Maximum allowed
      includeMetadata: true,
    });

    if (!allEmbeddings.matches || allEmbeddings.matches.length === 0) {
      console.log('✅ No embeddings found in Pinecone');
      return;
    }

    console.log(`📊 Found ${allEmbeddings.matches.length} embeddings in Pinecone`);

    // Find orphaned embeddings
    const orphanedEmbeddings: string[] = [];
    const companyEmbeddingCounts = new Map<string, number>();

    for (const match of allEmbeddings.matches) {
      const companyId = match.metadata?.company_id;
      
      if (!companyId || typeof companyId !== 'string') {
        console.log(`⚠️  Found embedding without valid company_id: ${match.id}`);
        orphanedEmbeddings.push(match.id);
        continue;
      }

      // Count embeddings per company
      companyEmbeddingCounts.set(companyId, (companyEmbeddingCounts.get(companyId) || 0) + 1);

      // Check if company still exists in database
      if (!existingCompanyIds.has(companyId)) {
        console.log(`🗑️  Found orphaned embedding: ${match.id} (company: ${companyId})`);
        orphanedEmbeddings.push(match.id);
      }
    }

    // Report embedding counts per company
    console.log('\n📈 Embedding counts per company:');
    for (const [companyId, count] of companyEmbeddingCounts.entries()) {
      if (existingCompanyIds.has(companyId)) {
        console.log(`  ${companyId}: ${count} chunks`);
      }
    }

    if (orphanedEmbeddings.length === 0) {
      console.log('\n✅ No orphaned embeddings found!');
      return;
    }

    console.log(`\n🗑️  Found ${orphanedEmbeddings.length} orphaned embeddings to delete`);

    // Delete orphaned embeddings in batches
    const batchSize = 100;
    for (let i = 0; i < orphanedEmbeddings.length; i += batchSize) {
      const batch = orphanedEmbeddings.slice(i, i + batchSize);
      
      try {
        await index.deleteMany(batch);
        console.log(`✅ Deleted batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(orphanedEmbeddings.length / batchSize)} (${batch.length} embeddings)`);
      } catch (error) {
        console.error(`❌ Failed to delete batch ${Math.floor(i / batchSize) + 1}:`, error);
      }
    }

    console.log(`\n🎉 Cleanup completed! Removed ${orphanedEmbeddings.length} orphaned embeddings`);

  } catch (error) {
    console.error('❌ Error during cleanup:', error);
  }
}

// Allow running directly or as import
if (require.main === module) {
  cleanupOrphanedEmbeddings()
    .then(() => {
      console.log('\n✅ Cleanup script finished');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Cleanup script failed:', error);
      process.exit(1);
    });
}

export { cleanupOrphanedEmbeddings };