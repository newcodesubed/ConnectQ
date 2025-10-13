import { searchCompanies } from '../services/embedding.service';

async function testSearchQuality() {
  console.log('🔍 Testing search quality after simplification...\n');
  
  const testQueries = [
    'healthcare telemedicine patient management',
    'e-commerce online store platform',
    'fintech payment blockchain solutions',
    'mobile app development React Native',
    'web development React Node.js',
    'digital marketing SEO social media'
  ];
  
  for (const query of testQueries) {
    console.log(`🔎 Query: "${query}"`);
    console.log('─'.repeat(50));
    
    try {
      const results = await searchCompanies(query, 5);
      
      if (results.matches.length === 0) {
        console.log('❌ No results found\n');
        continue;
      }
      
      console.log(`📊 Found ${results.matches.length} results:`);
      
      results.matches.forEach((match, index) => {
        const score = (match.score * 100).toFixed(1);
        const rawScore = match.raw_similarity_score?.toFixed(4) || 'N/A';
        
        console.log(`${index + 1}. ${match.name}`);
        console.log(`   📈 Similarity: ${score}% (raw: ${rawScore})`);
        console.log(`   🏢 Industry: ${match.industry || 'N/A'}`);
        console.log(`   📍 Location: ${match.location || 'N/A'}`);
        
        if (match.services && typeof match.services === 'string' && match.services.length > 0) {
          const services = match.services.length > 80 ? 
            match.services.substring(0, 80) + '...' : 
            match.services;
          console.log(`   🛠️  Services: ${services}`);
        }
        
        console.log('');
      });
      
      // Check for artificial 100% matches
      const hundredPercentMatches = results.matches.filter(m => m.score >= 0.99);
      if (hundredPercentMatches.length > 1) {
        console.log(`⚠️  Warning: ${hundredPercentMatches.length} companies have 99%+ similarity - may indicate issues`);
      } else if (hundredPercentMatches.length === 1) {
        console.log(`✅ Good: Only 1 company has 99%+ similarity (likely exact match)`);
      } else {
        console.log(`✅ Good: No artificial 100% matches detected`);
      }
      
    } catch (error) {
      console.error(`❌ Error searching for "${query}":`, error);
    }
    
    console.log('\n' + '='.repeat(60) + '\n');
  }
}

// Run the test
testSearchQuality();