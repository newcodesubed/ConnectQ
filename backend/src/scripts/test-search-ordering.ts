#!/usr/bin/env node
import { config } from 'dotenv';
import { searchCompanies } from '../services/embedding.service';

// Load environment variables
config();

async function testSearchOrdering() {
  try {
    console.log('🔍 Testing Search Result Ordering...\n');
    
    const query = 'React development';
    console.log(`Query: "${query}"`);
    console.log('─'.repeat(50));
    
    const result = await searchCompanies(query, 10);
    
    if (result.matches.length > 0) {
      console.log(`\n✅ Found ${result.matches.length} companies (should be ordered by relevance):`);
      
      result.matches.forEach((company, index) => {
        console.log(`\n${index + 1}. ${company.metadata.name}`);
        console.log(`   📊 Display Score: ${(company.score * 100).toFixed(1)}%`);
        console.log(`   🔄 Weighted Score: ${company.metadata.weighted_score.toFixed(4)}`);
        console.log(`   ⭐ Best Individual: ${company.metadata.best_individual_score.toFixed(4)}`);
        console.log(`   📦 Chunks: ${company.metadata.matching_chunks}`);
        console.log(`   🏢 Industry: ${company.metadata.industry}`);
        console.log(`   🔧 Services: ${company.metadata.services ? company.metadata.services.split(', ').slice(0, 2).join(', ') + '...' : 'None'}`);
      });
      
      // Verify ordering
      console.log('\n🔍 Verifying order is correct:');
      for (let i = 0; i < result.matches.length - 1; i++) {
        const current = result.matches[i].metadata.weighted_score;
        const next = result.matches[i + 1].metadata.weighted_score;
        
        if (current < next) {
          console.log(`❌ ORDER ERROR: Company ${i + 1} has lower weighted score than company ${i + 2}`);
        } else {
          console.log(`✅ ${result.matches[i].metadata.name} (${current.toFixed(4)}) > ${result.matches[i + 1].metadata.name} (${next.toFixed(4)})`);
        }
      }
    } else {
      console.log('❌ No companies found');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error testing search ordering:', error);
    process.exit(1);
  }
}

testSearchOrdering();