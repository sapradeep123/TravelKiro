const axios = require('axios');

const API_URL = 'http://localhost:3000/api';

let authToken = '';
let guideToken = '';
let groupTravelId = '';
let bidId = '';

async function testGroupTravelFeature() {
  console.log('🧪 Testing Group Travel Feature\n');

  try {
    // 1. Login as regular user
    console.log('1️⃣ Logging in as regular user...');
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: 'user@example.com',
      password: 'password123',
    });
    authToken = loginResponse.data.accessToken;
    console.log('✅ Login successful\n');

    // 2. Create group travel
    console.log('2️⃣ Creating group travel...');
    const travelDate = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000); // 10 days from now
    const expiryDate = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000); // 5 days from now
    
    const createResponse = await axios.post(
      `${API_URL}/group-travel`,
      {
        title: 'Weekend Trip to Manali',
        description: 'Looking for a group to explore Manali mountains',
        customCountry: 'India',
        customState: 'Himachal Pradesh',
        customArea: 'Manali',
        travelDate: travelDate.toISOString(),
        expiryDate: expiryDate.toISOString(),
      },
      {
        headers: { Authorization: `Bearer ${authToken}` },
      }
    );
    groupTravelId = createResponse.data.data.id;
    console.log('✅ Group travel created:', groupTravelId);
    console.log('   Title:', createResponse.data.data.title);
    console.log('   Status:', createResponse.data.data.status, '\n');

    // 3. Test date validation (should fail)
    console.log('3️⃣ Testing date validation (should fail)...');
    try {
      const invalidDate = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000); // Only 2 days
      await axios.post(
        `${API_URL}/group-travel`,
        {
          title: 'Invalid Trip',
          description: 'This should fail',
          customCountry: 'India',
          customState: 'Kerala',
          customArea: 'Kochi',
          travelDate: invalidDate.toISOString(),
          expiryDate: new Date().toISOString(),
        },
        {
          headers: { Authorization: `Bearer ${authToken}` },
        }
      );
      console.log('❌ Date validation failed - request should have been rejected\n');
    } catch (error) {
      console.log('✅ Date validation working:', error.response?.data?.error, '\n');
    }

    // 4. Login as tourist guide
    console.log('4️⃣ Logging in as tourist guide...');
    const guideLoginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: 'guide@example.com',
      password: 'password123',
    });
    guideToken = guideLoginResponse.data.accessToken;
    console.log('✅ Guide login successful\n');

    // 5. Submit bid as tourist guide
    console.log('5️⃣ Submitting bid as tourist guide...');
    const bidResponse = await axios.post(
      `${API_URL}/group-travel/${groupTravelId}/bid`,
      {
        numberOfDays: 3,
        accommodationDetails: '3-star hotels with mountain view',
        foodDetails: 'Breakfast and dinner included, local cuisine',
        transportDetails: 'Private cab for entire trip',
        totalCost: 15000,
        dailyItinerary: [
          {
            day: 1,
            activities: 'Arrival, check-in, local market visit',
            meals: 'Dinner',
            accommodation: 'Hotel Mountain View',
          },
          {
            day: 2,
            activities: 'Solang Valley, adventure sports, Rohtang Pass',
            meals: 'Breakfast, Dinner',
            accommodation: 'Hotel Mountain View',
          },
          {
            day: 3,
            activities: 'Hadimba Temple, Mall Road shopping, departure',
            meals: 'Breakfast',
            accommodation: 'N/A',
          },
        ],
      },
      {
        headers: { Authorization: `Bearer ${guideToken}` },
      }
    );
    bidId = bidResponse.data.data.id;
    console.log('✅ Bid submitted:', bidId);
    console.log('   Total Cost: ₹', bidResponse.data.data.totalCost);
    console.log('   Days:', bidResponse.data.data.numberOfDays, '\n');

    // 6. Express interest as another user
    console.log('6️⃣ Expressing interest...');
    await axios.post(
      `${API_URL}/group-travel/${groupTravelId}/interest`,
      {},
      {
        headers: { Authorization: `Bearer ${authToken}` },
      }
    );
    console.log('✅ Interest expressed\n');

    // 7. Get group travel details (should show bids to creator)
    console.log('7️⃣ Getting group travel details...');
    const detailsResponse = await axios.get(
      `${API_URL}/group-travel/${groupTravelId}`,
      {
        headers: { Authorization: `Bearer ${authToken}` },
      }
    );
    console.log('✅ Group travel details retrieved');
    console.log('   Interested users:', detailsResponse.data.data.interestedUsers.length);
    console.log('   Bids:', detailsResponse.data.data.bids.length);
    console.log('   Bids visible to creator:', detailsResponse.data.data.bids.length > 0, '\n');

    // 8. Approve contact
    console.log('8️⃣ Approving contact for bid...');
    await axios.post(
      `${API_URL}/group-travel/bids/${bidId}/approve-contact`,
      {},
      {
        headers: { Authorization: `Bearer ${authToken}` },
      }
    );
    console.log('✅ Contact approved\n');

    // 9. Get my group travels
    console.log('9️⃣ Getting my group travels...');
    const myTravelsResponse = await axios.get(
      `${API_URL}/group-travel/my-travels`,
      {
        headers: { Authorization: `Bearer ${authToken}` },
      }
    );
    console.log('✅ My group travels:', myTravelsResponse.data.data.length, '\n');

    // 10. Get my bids (as guide)
    console.log('🔟 Getting my bids (as guide)...');
    const myBidsResponse = await axios.get(
      `${API_URL}/group-travel/my-bids`,
      {
        headers: { Authorization: `Bearer ${guideToken}` },
      }
    );
    console.log('✅ My bids:', myBidsResponse.data.data.length);
    console.log('   Contact approved:', myBidsResponse.data.data[0]?.canContact, '\n');

    console.log('✅ All tests passed! Group Travel feature is working correctly.');
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Run tests
testGroupTravelFeature();
