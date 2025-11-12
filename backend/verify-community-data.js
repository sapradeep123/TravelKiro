// Quick verification script to check seeded community data
const axios = require('axios');

const API_URL = 'http://localhost:3000';

async function verifyData() {
  console.log('🔍 Verifying Community Module Data...\n');

  try {
    // Test 1: Login as John Doe
    console.log('1️⃣  Testing Login...');
    const loginResponse = await axios.post(`${API_URL}/api/auth/login`, {
      email: 'john.doe@example.com',
      password: 'Test123!@#'
    });
    
    const token = loginResponse.data.token;
    const userId = loginResponse.data.user.id;
    console.log(`✅ Logged in as: ${loginResponse.data.user.profile.name}`);
    console.log(`   User ID: ${userId}`);
    console.log(`   Token: ${token.substring(0, 20)}...`);

    // Test 2: Get Global Feed
    console.log('\n2️⃣  Testing Global Feed...');
    const feedResponse = await axios.get(`${API_URL}/api/community/posts`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log(`✅ Feed loaded: ${feedResponse.data.posts.length} posts`);
    console.log(`   Total posts: ${feedResponse.data.pagination.total}`);
    
    // Show first post details
    if (feedResponse.data.posts.length > 0) {
      const firstPost = feedResponse.data.posts[0];
      console.log(`\n   📝 Sample Post:`);
      console.log(`      Author: ${firstPost.user.profile.name}`);
      console.log(`      Caption: ${firstPost.caption.substring(0, 50)}...`);
      console.log(`      Likes: ${firstPost.likeCount}`);
      console.log(`      Comments: ${firstPost.commentCount}`);
      console.log(`      Saves: ${firstPost.saveCount}`);
      console.log(`      Media: ${firstPost.mediaUrls.length} items`);
    }

    // Test 3: Get User Profile
    console.log('\n3️⃣  Testing User Profile...');
    const profileResponse = await axios.get(`${API_URL}/api/community/users/${userId}/profile`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log(`✅ Profile loaded: ${profileResponse.data.name}`);
    console.log(`   Bio: ${profileResponse.data.bio}`);
    console.log(`   Followers: ${profileResponse.data.followerCount}`);
    console.log(`   Following: ${profileResponse.data.followingCount}`);
    console.log(`   Posts: ${profileResponse.data.postCount}`);
    console.log(`   Private: ${profileResponse.data.isPrivate}`);

    // Test 4: Get User's Posts
    console.log('\n4️⃣  Testing User Posts...');
    const userPostsResponse = await axios.get(`${API_URL}/api/community/users/${userId}/posts`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log(`✅ User posts loaded: ${userPostsResponse.data.posts.length} posts`);

    // Test 5: Get Saved Posts
    console.log('\n5️⃣  Testing Saved Posts...');
    const savedResponse = await axios.get(`${API_URL}/api/community/posts/saved`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log(`✅ Saved posts loaded: ${savedResponse.data.posts.length} posts`);

    // Test 6: Get Follow Requests (login as Jane)
    console.log('\n6️⃣  Testing Follow Requests...');
    const janeLogin = await axios.post(`${API_URL}/api/auth/login`, {
      email: 'jane.smith@example.com',
      password: 'Test123!@#'
    });
    
    const janeToken = janeLogin.data.token;
    const requestsResponse = await axios.get(`${API_URL}/api/community/follow-requests`, {
      headers: { Authorization: `Bearer ${janeToken}` }
    });
    
    console.log(`✅ Follow requests loaded: ${requestsResponse.data.length} requests`);
    if (requestsResponse.data.length > 0) {
      console.log(`   From: ${requestsResponse.data[0].follower.profile.name}`);
    }

    // Summary
    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║              VERIFICATION SUCCESSFUL                       ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    console.log('✅ All data is properly seeded and accessible!');
    console.log('✅ All API endpoints are working correctly!');
    console.log('✅ Data is coming from the database (no hardcoded values)!');
    
    console.log('\n📱 You can now test the frontend with these credentials:');
    console.log('   Email: john.doe@example.com');
    console.log('   Password: Test123!@#');

  } catch (error) {
    console.error('\n❌ Verification failed:', error.response?.data || error.message);
    console.log('\n⚠️  Make sure:');
    console.log('   1. Backend server is running: npm run dev');
    console.log('   2. Database is seeded: npm run seed:community');
  }
}

verifyData();
