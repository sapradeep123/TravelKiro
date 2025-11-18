const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

async function testUpload() {
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
      throw new Error('Login failed');
    }

    const loginData = await loginResponse.json();
    const token = loginData.data.accessToken;
    console.log('✓ Login successful');
    console.log('✓ Token:', token.substring(0, 20) + '...');

    // Create a test image file (1x1 pixel PNG)
    const testImagePath = path.join(__dirname, 'test-image.png');
    const pngBuffer = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      'base64'
    );
    fs.writeFileSync(testImagePath, pngBuffer);
    console.log('✓ Test image created');

    // Upload the image
    console.log('\n2. Uploading test image...');
    const formData = new FormData();
    formData.append('file', fs.createReadStream(testImagePath));

    const uploadResponse = await fetch('http://localhost:3000/api/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        ...formData.getHeaders(),
      },
      body: formData,
    });

    if (!uploadResponse.ok) {
      const errorData = await uploadResponse.json();
      throw new Error(`Upload failed: ${JSON.stringify(errorData)}`);
    }

    const uploadData = await uploadResponse.json();
    console.log('✓ Upload successful!');
    console.log('✓ Response:', JSON.stringify(uploadData, null, 2));

    // Verify the file exists
    const uploadedFilePath = path.join(__dirname, 'uploads', uploadData.filename);
    if (fs.existsSync(uploadedFilePath)) {
      console.log('✓ File exists on server:', uploadedFilePath);
    } else {
      console.log('✗ File not found on server:', uploadedFilePath);
    }

    // Clean up test image
    fs.unlinkSync(testImagePath);
    console.log('✓ Test image cleaned up');

    console.log('\n✅ All tests passed!');
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

testUpload();
