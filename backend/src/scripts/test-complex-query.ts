// Test script to demonstrate complex query embedding
import 'dotenv/config';
import { searchCompanies } from '../services/embedding.service';

async function testComplexQuery() {
  console.log('🔍 Testing Complex Query Embedding...\n');
  
  const complexQuery = "I need to develop website for my school management system, I need to make it reliable and scalable as well";
  
  console.log(`Query: "${complexQuery}"`);
  console.log(`Query Length: ${complexQuery.length} characters`);
  console.log(`Word Count: ${complexQuery.split(' ').length} words\n`);
  
  try {
    console.log('📡 Generating embedding for complex query...');
    const results = await searchCompanies(complexQuery, 5);
    
    console.log(`✅ ${results.message}\n`);
    
    if (results.matches && results.matches.length > 0) {
      console.log('🎯 Top Matching Companies:');
      results.matches.forEach((match, index) => {
        console.log(`\n${index + 1}. ${match.metadata?.name || 'Unknown Company'}`);
        console.log(`   Similarity: ${(match.score * 100).toFixed(1)}%`);
        console.log(`   Industry: ${match.metadata?.industry || 'Not specified'}`);
        console.log(`   Services: ${match.metadata?.services || 'Not specified'}`);
        if (match.metadata?.description) {
          console.log(`   Description: ${match.metadata.description.substring(0, 100)}...`);
        }
      });
    } else {
      console.log('📭 No matching companies found');
    }
    
  } catch (error) {
    console.error('❌ Error testing query:', error);
  }
}

// Run the test
testComplexQuery().catch(console.error);