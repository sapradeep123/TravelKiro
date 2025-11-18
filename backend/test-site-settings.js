async function testSiteSettings() {
  try {
    // 1. Login as admin
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
    console.log('✓ Login successful\n');

    // 2. Get current settings
    console.log('2. Getting current settings...');
    const getResponse = await fetch('http://localhost:3000/api/site-settings', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!getResponse.ok) {
      throw new Error('Failed to get settings');
    }

    const currentSettings = await getResponse.json();
    console.log('✓ Current settings:', JSON.stringify(currentSettings.data, null, 2));
    console.log('');

    // 3. Update settings
    console.log('3. Updating site title to "Test Title"...');
    const updateResponse = await fetch('http://localhost:3000/api/site-settings', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        siteName: currentSettings.data.siteName,
        siteTitle: 'Test Title',
        logoUrl: currentSettings.data.logoUrl,
        faviconUrl: currentSettings.data.faviconUrl,
        termsAndConditions: currentSettings.data.termsAndConditions,
        privacyPolicy: currentSettings.data.privacyPolicy,
      }),
    });

    if (!updateResponse.ok) {
      const errorData = await updateResponse.json();
      throw new Error(`Failed to update settings: ${JSON.stringify(errorData)}`);
    }

    const updateData = await updateResponse.json();
    console.log('✓ Settings updated:', JSON.stringify(updateData.data, null, 2));
    console.log('');

    // 4. Verify the update
    console.log('4. Verifying the update...');
    const verifyResponse = await fetch('http://localhost:3000/api/site-settings', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!verifyResponse.ok) {
      throw new Error('Failed to verify settings');
    }

    const verifiedSettings = await verifyResponse.json();
    console.log('✓ Verified settings:', JSON.stringify(verifiedSettings.data, null, 2));
    
    if (verifiedSettings.data.siteTitle === 'Test Title') {
      console.log('\n✅ SUCCESS! Site title was updated correctly!');
    } else {
      console.log('\n❌ FAILED! Site title was not updated correctly!');
      console.log('Expected: "Test Title"');
      console.log('Got:', verifiedSettings.data.siteTitle);
    }

    // 5. Restore original settings
    console.log('\n5. Restoring original settings...');
    await fetch('http://localhost:3000/api/site-settings', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        siteName: currentSettings.data.siteName,
        siteTitle: currentSettings.data.siteTitle,
        logoUrl: currentSettings.data.logoUrl,
        faviconUrl: currentSettings.data.faviconUrl,
        termsAndConditions: currentSettings.data.termsAndConditions,
        privacyPolicy: currentSettings.data.privacyPolicy,
      }),
    });
    console.log('✓ Original settings restored');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

testSiteSettings();
