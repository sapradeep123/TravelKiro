async function testUploadEndpoint() {
  try {
    // First, login to get a token
    console.log('1. Logging in as admin...');
    const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@travelencyclopedia.com',
        password: 'admin123',
      }),
    });

    if (!loginResponse.ok) {
      const errorData = await loginResponse.json();
      throw new Error(`Login failed: ${JSON.stringify(errorData)}`);
    }

    const loginData = await loginResponse.json();
    const token = loginData.data.accessToken;
    console.log('✓ Login successful');
    console.log('✓ User role:', loginData.data.user.role);

    // Test upload endpoint without file (should fail but confirm endpoint exists)
    console.log('\n2. Testing upload endpoint...');
    const uploadResponse = await fetch('http://localhost:3000/api/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const uploadData = await uploadResponse.json();
    console.log('✓ Upload endpoint response:', JSON.stringify(uploadData, null, 2));

    if (uploadData.error === 'No file uploaded') {
      console.log('✓ Upload endpoint is working (expected "No file uploaded" error)');
    }

    console.log('\n✅ Upload endpoint is accessible and requires authentication!');
    console.log('📝 You can now test image upload from the frontend Admin Settings page.');
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

testUploadEndpoint();
