#!/usr/bin/env node
import axios from 'axios';

async function testAPIOrdering() {
  try {
    console.log('🔍 Testing API Search Ordering...\n');
    
    const query = 'React development';
    console.log(`Query: "${query}"`);
    console.log('─'.repeat(50));
    
    const response = await axios.post('http://localhost:5000/api/embeddings/search-companies', {
      query,
      topK: 5
    });

    if (response.data.success && response.data.matches.length > 0) {
      console.log(`\n✅ Found ${response.data.matches.length} companies via API:`);
      
      response.data.matches.forEach((company: any, index: number) => {
        console.log(`\n${index + 1}. ${company.metadata.name}`);
        console.log(`   📊 API Score: ${(company.score * 100).toFixed(1)}%`);
        console.log(`   🔄 Weighted Score: ${company.metadata.weighted_score?.toFixed(4) || 'N/A'}`);
        console.log(`   ⭐ Best Individual: ${company.metadata.best_individual_score?.toFixed(4) || 'N/A'}`);
        console.log(`   📦 Chunks: ${company.metadata.matching_chunks || 'N/A'}`);
        console.log(`   🏢 Industry: ${company.metadata.industry}`);
      });
      
      // Verify API ordering
      console.log('\n🔍 Verifying API order (by display score):');
      for (let i = 0; i < response.data.matches.length - 1; i++) {
        const current = response.data.matches[i].score;
        const next = response.data.matches[i + 1].score;
        
        if (current < next) {
          console.log(`❌ ORDER ERROR: Company ${i + 1} has lower score than company ${i + 2}`);
        } else {
          console.log(`✅ ${response.data.matches[i].metadata.name} (${(current * 100).toFixed(1)}%) ≥ ${response.data.matches[i + 1].metadata.name} (${(next * 100).toFixed(1)}%)`);
        }
      }
    } else {
      console.log('❌ No companies found via API');
    }

    process.exit(0);
  } catch (error: any) {
    console.error('❌ Error testing API ordering:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
    process.exit(1);
  }
}

testAPIOrdering();