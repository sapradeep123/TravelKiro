// Quick API test script
const http = require('http');

console.log('Testing API endpoints...\n');

// Test 1: Get all accommodations
http.get('http://localhost:3000/api/accommodations', (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      console.log('✅ GET /api/accommodations');
      console.log(`   Status: ${res.statusCode}`);
      console.log(`   Found: ${json.data?.length || 0} accommodations`);
      
      if (json.data && json.data.length > 0) {
        console.log('\n📋 Sample Accommodation:');
        const sample = json.data[0];
        console.log(`   Name: ${sample.name}`);
        console.log(`   Type: ${sample.type}`);
        console.log(`   Location: ${sample.area}, ${sample.state}`);
        console.log(`   Price: ${sample.currency} ${sample.priceMin} - ${sample.priceMax}`);
      }
    } catch (e) {
      console.error('❌ Error parsing response:', e.message);
    }
  });
}).on('error', (err) => {
  console.error('❌ Connection error:', err.message);
  console.log('\n⚠️  Make sure the backend server is running:');
  console.log('   cd backend && npm run dev');
});

// Test 2: Health check
setTimeout(() => {
  http.get('http://localhost:3000/health', (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        const json = JSON.parse(data);
        console.log('\n✅ GET /health');
        console.log(`   Status: ${res.statusCode}`);
        console.log(`   Message: ${json.message}`);
      } catch (e) {
        console.error('❌ Error parsing response:', e.message);
      }
    });
  }).on('error', (err) => {
    console.error('❌ Health check failed:', err.message);
  });
}, 1000);
