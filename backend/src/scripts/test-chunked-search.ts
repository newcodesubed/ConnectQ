import axios from 'axios';

async function testChunkedSearch() {
  try {
    console.log('🔍 Testing Chunked Search API...\n');
    
    const testQueries = [
      'React e-commerce website development',
      'School management system with authentication',
      'Mobile app development for iOS and Android',
      'AI and machine learning solutions',
      'Healthcare telemedicine platform'
    ];

    for (const query of testQueries) {
      console.log(`\n📝 Query: "${query}"`);
      console.log('─'.repeat(60));
      
      const response = await axios.post('http://localhost:5000/api/embedding/search-companies', {
        query
      });

      if (response.data.success && response.data.matches.length > 0) {
        console.log(`✅ Found ${response.data.matches.length} companies:`);
        
        response.data.matches.slice(0, 3).forEach((company: any, index: number) => {
          console.log(`\n${index + 1}. ${company.metadata.name}`);
          console.log(`   Score: ${(company.score * 100).toFixed(1)}%`);
          console.log(`   Industry: ${company.metadata.industry}`);
          console.log(`   Services: ${company.metadata.services.split(',').slice(0, 3).join(', ')}${company.metadata.services.split(',').length > 3 ? '...' : ''}`);
          
          if (company.metadata.matching_chunks) {
            console.log(`   Matching Chunks: ${company.metadata.matching_chunks}`);
            console.log(`   Weighted Score: ${company.metadata.weighted_score.toFixed(2)}`);
          }
        });
      } else {
        console.log('❌ No companies found');
      }
    }

  } catch (error: any) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testChunkedSearch();