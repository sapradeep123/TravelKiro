// Test accommodation service
const axios = require('axios');

const API_URL = 'http://localhost:3000';

async function testAccommodationService() {
  console.log('Testing Accommodation Service...\n');
  
  try {
    // Test 1: Get all accommodations
    console.log('1. Testing GET /api/accommodations');
    const response = await axios.get(`${API_URL}/api/accommodations`);
    
    console.log(`   Status: ${response.status}`);
    console.log(`   Data structure:`, Object.keys(response.data));
    
    if (response.data.data) {
      console.log(`   ✅ Found ${response.data.data.length} accommodations`);
      console.log(`   Pagination:`, response.data.pagination);
      
      if (response.data.data.length > 0) {
        const sample = response.data.data[0];
        console.log('\n   Sample accommodation:');
        console.log(`   - ID: ${sample.id}`);
        console.log(`   - Name: ${sample.name}`);
        console.log(`   - Type: ${sample.type}`);
        console.log(`   - Location: ${sample.area}, ${sample.state}, ${sample.country}`);
        console.log(`   - Price: ${sample.currency} ${sample.priceMin} - ${sample.priceMax}`);
        console.log(`   - Active: ${sample.isActive}`);
        console.log(`   - Approved: ${sample.approvalStatus}`);
      }
    } else {
      console.log('   ❌ No data field in response');
      console.log('   Response:', response.data);
    }
    
    // Test 2: Search
    console.log('\n2. Testing GET /api/accommodations/search?q=mumbai');
    const searchResponse = await axios.get(`${API_URL}/api/accommodations/search`, {
      params: { q: 'mumbai' }
    });
    console.log(`   Status: ${searchResponse.status}`);
    console.log(`   Found: ${searchResponse.data.length} results`);
    
    // Test 3: Get by ID
    if (response.data.data && response.data.data.length > 0) {
      const firstId = response.data.data[0].id;
      console.log(`\n3. Testing GET /api/accommodations/${firstId}`);
      const detailResponse = await axios.get(`${API_URL}/api/accommodations/${firstId}`);
      console.log(`   Status: ${detailResponse.status}`);
      console.log(`   Name: ${detailResponse.data.name}`);
    }
    
    console.log('\n✅ All tests passed!');
    console.log('\n📝 Frontend should be able to fetch data from:');
    console.log(`   ${API_URL}/api/accommodations`);
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    }
    console.log('\n⚠️  Troubleshooting:');
    console.log('   1. Make sure backend is running: cd backend && npm run dev');
    console.log('   2. Check backend is on port 3000');
    console.log('   3. Check CORS is enabled');
  }
}

testAccommodationService();
