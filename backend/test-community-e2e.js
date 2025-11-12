// End-to-end integration tests for Community Module
const axios = require('axios');

const API_URL = process.env.API_URL || 'http://localhost:3000';
let authToken = '';
let authToken2 = '';
let userId = '';
let userId2 = '';
let postId = '';
let commentId = '';
let locationId = '';

// Test users
const testUser1 = {
  email: `test_community_${Date.now()}@example.com`,
  password: 'Test123!@#',
  name: 'Test User 1'
};

const testUser2 = {
  email: `test_community2_${Date.now()}@example.com`,
  password: 'Test123!@#',
  name: 'Test User 2'
};

// Helper function to make authenticated requests
const authRequest = (method, url, data = null, token = authToken) => {
  return axios({
    method,
    url: `${API_URL}${url}`,
    data,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
};

// Test 1: Authentication Setup
async function testAuthentication() {
  console.log('\n=== Test 1: Authentication Setup ===');
  
  try {
    // Register first user
    console.log('Registering test user 1...');
    const registerResponse1 = await axios.post(`${API_URL}/api/auth/register`, testUser1);
    authToken = registerResponse1.data.token;
    userId = registerResponse1.data.user.id;
    console.log(`✅ User 1 registered: ${userId}`);
    
    // Register second user
    console.log('Registering test user 2...');
    const registerResponse2 = await axios.post(`${API_URL}/api/auth/register`, testUser2);
    authToken2 = registerResponse2.data.token;
    userId2 = registerResponse2.data.user.id;
    console.log(`✅ User 2 registered: ${userId2}`);
    
    return true;
  } catch (error) {
    console.error('❌ Authentication failed:', error.response?.data || error.message);
    return false;
  }
}

// Test 2: Post Creation Flow
async function testPostCreation() {
  console.log('\n=== Test 2: Post Creation Flow ===');
  
  try {
    // Get a location first
    console.log('Fetching locations...');
    const locationsResponse = await axios.get(`${API_URL}/api/locations`);
    if (locationsResponse.data.data && locationsResponse.data.data.length > 0) {
      locationId = locationsResponse.data.data[0].id;
      console.log(`✅ Found location: ${locationId}`);
    }
    
    // Create post with location
    console.log('Creating post with location...');
    const postData = {
      locationId: locationId || undefined,
      customCountry: locationId ? undefined : 'India',
      customState: locationId ? undefined : 'Maharashtra',
      customArea: locationId ? undefined : 'Mumbai',
      caption: 'Testing community post creation! #travel #test',
      mediaUrls: ['https://example.com/image1.jpg', 'https://example.com/image2.jpg'],
      mediaTypes: ['IMAGE', 'IMAGE']
    };
    
    const createResponse = await authRequest('post', '/api/community/posts', postData);
    postId = createResponse.data.id;
    console.log(`✅ Post created: ${postId}`);
    console.log(`   Caption: ${createResponse.data.caption}`);
    console.log(`   Media count: ${createResponse.data.mediaUrls.length}`);
    
    // Try creating post without location (should fail)
    console.log('Testing post creation without location (should fail)...');
    try {
      await authRequest('post', '/api/community/posts', {
        caption: 'No location post',
        mediaUrls: [],
        mediaTypes: []
      });
      console.log('❌ Should have failed without location');
      return false;
    } catch (error) {
      if (error.response?.status === 400 || error.response?.status === 422) {
        console.log('✅ Correctly rejected post without location');
      } else {
        throw error;
      }
    }
    
    return true;
  } catch (error) {
    console.error('❌ Post creation failed:', error.response?.data || error.message);
    return false;
  }
}

// Test 3: Feed Browsing with Pagination
async function testFeedBrowsing() {
  console.log('\n=== Test 3: Feed Browsing with Pagination ===');
  
  try {
    // Get global feed
    console.log('Fetching global feed...');
    const feedResponse = await authRequest('get', '/api/community/posts?page=1&pageSize=10');
    console.log(`✅ Feed loaded: ${feedResponse.data.posts.length} posts`);
    console.log(`   Total posts: ${feedResponse.data.pagination.total}`);
    console.log(`   Total pages: ${feedResponse.data.pagination.totalPages}`);
    
    // Verify our post is in the feed
    const ourPost = feedResponse.data.posts.find(p => p.id === postId);
    if (ourPost) {
      console.log('✅ Our post found in feed');
      console.log(`   Like count: ${ourPost.likeCount || 0}`);
      console.log(`   Comment count: ${ourPost.commentCount || 0}`);
    } else {
      console.log('⚠️  Our post not found in first page');
    }
    
    // Get single post
    console.log('Fetching single post...');
    const postResponse = await authRequest('get', `/api/community/posts/${postId}`);
    console.log(`✅ Post details loaded: ${postResponse.data.caption}`);
    
    // Get location feed if we have a location
    if (locationId) {
      console.log('Fetching location-specific feed...');
      const locationFeedResponse = await authRequest('get', `/api/community/posts/location/${locationId}`);
      console.log(`✅ Location feed loaded: ${locationFeedResponse.data.posts.length} posts`);
    }
    
    return true;
  } catch (error) {
    console.error('❌ Feed browsing failed:', error.response?.data || error.message);
    return false;
  }
}

// Test 4: Interaction Types (Like, Comment, Save)
async function testInteractions() {
  console.log('\n=== Test 4: Interaction Types ===');
  
  try {
    // Like post
    console.log('Liking post...');
    const likeResponse = await authRequest('post', `/api/community/posts/${postId}/like`);
    console.log(`✅ Post liked: ${likeResponse.data.liked}`);
    
    // Verify like in post details
    const postAfterLike = await authRequest('get', `/api/community/posts/${postId}`);
    console.log(`   Like count: ${postAfterLike.data.likeCount}`);
    console.log(`   Is liked: ${postAfterLike.data.isLiked}`);
    
    // Unlike post
    console.log('Unliking post...');
    const unlikeResponse = await authRequest('post', `/api/community/posts/${postId}/like`);
    console.log(`✅ Post unliked: ${!unlikeResponse.data.liked}`);
    
    // Like again for further tests
    await authRequest('post', `/api/community/posts/${postId}/like`);
    
    // Add comment
    console.log('Adding comment...');
    const commentResponse = await authRequest('post', `/api/community/posts/${postId}/comment`, {
      text: 'Great post! This is a test comment.'
    });
    commentId = commentResponse.data.id;
    console.log(`✅ Comment added: ${commentId}`);
    console.log(`   Comment text: ${commentResponse.data.text}`);
    
    // Verify comment in post details
    const postAfterComment = await authRequest('get', `/api/community/posts/${postId}`);
    console.log(`   Comment count: ${postAfterComment.data.commentCount}`);
    console.log(`   Comments loaded: ${postAfterComment.data.comments?.length || 0}`);
    
    // Save post
    console.log('Saving post...');
    const saveResponse = await authRequest('post', `/api/community/posts/${postId}/save`);
    console.log(`✅ Post saved: ${saveResponse.data.saved}`);
    
    // Get saved posts
    console.log('Fetching saved posts...');
    const savedResponse = await authRequest('get', '/api/community/posts/saved');
    console.log(`✅ Saved posts loaded: ${savedResponse.data.posts.length}`);
    const savedPost = savedResponse.data.posts.find(p => p.id === postId);
    if (savedPost) {
      console.log('   Our post found in saved posts');
    }
    
    // Unsave post
    console.log('Unsaving post...');
    const unsaveResponse = await authRequest('post', `/api/community/posts/${postId}/save`);
    console.log(`✅ Post unsaved: ${!unsaveResponse.data.saved}`);
    
    return true;
  } catch (error) {
    console.error('❌ Interactions failed:', error.response?.data || error.message);
    return false;
  }
}

// Test 5: User Relationship Flows
async function testUserRelationships() {
  console.log('\n=== Test 5: User Relationship Flows ===');
  
  try {
    // Follow user (public profile)
    console.log('User 1 following User 2...');
    const followResponse = await authRequest('post', `/api/community/users/${userId2}/follow`);
    console.log(`✅ Follow successful: ${followResponse.data.message}`);
    console.log(`   Requires approval: ${followResponse.data.requiresApproval}`);
    
    // Get user profile
    console.log('Fetching User 2 profile...');
    const profileResponse = await authRequest('get', `/api/community/users/${userId2}/profile`);
    console.log(`✅ Profile loaded: ${profileResponse.data.name}`);
    console.log(`   Follower count: ${profileResponse.data.followerCount}`);
    console.log(`   Following count: ${profileResponse.data.followingCount}`);
    console.log(`   Is following: ${profileResponse.data.isFollowing}`);
    console.log(`   Is private: ${profileResponse.data.isPrivate}`);
    
    // Unfollow user
    console.log('User 1 unfollowing User 2...');
    const unfollowResponse = await authRequest('delete', `/api/community/users/${userId2}/follow`);
    console.log(`✅ Unfollow successful: ${unfollowResponse.data.message}`);
    
    // Test private profile flow
    console.log('Setting User 2 profile to private...');
    const privateResponse = await authRequest('patch', '/api/community/profile/privacy', null, authToken2);
    console.log(`✅ Privacy toggled: ${privateResponse.data.message}`);
    console.log(`   Is private: ${privateResponse.data.isPrivate}`);
    
    // Try to follow private profile
    console.log('User 1 requesting to follow private User 2...');
    const followPrivateResponse = await authRequest('post', `/api/community/users/${userId2}/follow`);
    console.log(`✅ Follow request sent: ${followPrivateResponse.data.message}`);
    console.log(`   Requires approval: ${followPrivateResponse.data.requiresApproval}`);
    
    // Get follow requests (as User 2)
    console.log('User 2 checking follow requests...');
    const requestsResponse = await authRequest('get', '/api/community/follow-requests', null, authToken2);
    console.log(`✅ Follow requests loaded: ${requestsResponse.data.length}`);
    
    if (requestsResponse.data.length > 0) {
      const requestId = requestsResponse.data[0].id;
      
      // Approve follow request
      console.log('User 2 approving follow request...');
      const approveResponse = await authRequest('post', `/api/community/follow-requests/${requestId}/approve`, null, authToken2);
      console.log(`✅ Follow request approved: ${approveResponse.data.message}`);
    }
    
    // Mute user
    console.log('User 1 muting User 2...');
    const muteResponse = await authRequest('post', `/api/community/users/${userId2}/mute`);
    console.log(`✅ User muted: ${muteResponse.data.message}`);
    
    // Unmute user
    console.log('User 1 unmuting User 2...');
    const unmuteResponse = await authRequest('delete', `/api/community/users/${userId2}/mute`);
    console.log(`✅ User unmuted: ${unmuteResponse.data.message}`);
    
    return true;
  } catch (error) {
    console.error('❌ User relationships failed:', error.response?.data || error.message);
    return false;
  }
}

// Test 6: Profile Viewing with Privacy Modes
async function testProfileViewing() {
  console.log('\n=== Test 6: Profile Viewing with Privacy Modes ===');
  
  try {
    // View own profile
    console.log('User 1 viewing own profile...');
    const ownProfileResponse = await authRequest('get', `/api/community/users/${userId}/profile`);
    console.log(`✅ Own profile loaded: ${ownProfileResponse.data.name}`);
    
    // Get own posts
    console.log('User 1 fetching own posts...');
    const ownPostsResponse = await authRequest('get', `/api/community/users/${userId}/posts`);
    console.log(`✅ Own posts loaded: ${ownPostsResponse.data.posts.length}`);
    
    // Update profile
    console.log('User 1 updating profile...');
    const updateResponse = await authRequest('patch', '/api/community/profile', {
      name: 'Updated Test User 1',
      bio: 'This is my updated bio for testing!'
    });
    console.log(`✅ Profile updated: ${updateResponse.data.name}`);
    console.log(`   Bio: ${updateResponse.data.bio}`);
    
    // View other user's public profile
    console.log('User 1 viewing User 2 profile...');
    const otherProfileResponse = await authRequest('get', `/api/community/users/${userId2}/profile`);
    console.log(`✅ Other profile loaded: ${otherProfileResponse.data.name}`);
    console.log(`   Is private: ${otherProfileResponse.data.isPrivate}`);
    
    return true;
  } catch (error) {
    console.error('❌ Profile viewing failed:', error.response?.data || error.message);
    return false;
  }
}

// Test 7: Blocking Enforcement
async function testBlockingEnforcement() {
  console.log('\n=== Test 7: Blocking Enforcement ===');
  
  try {
    // Block user
    console.log('User 1 blocking User 2...');
    const blockResponse = await authRequest('post', `/api/community/users/${userId2}/block`);
    console.log(`✅ User blocked: ${blockResponse.data.message}`);
    
    // Try to view blocked user's profile (should fail)
    console.log('User 1 trying to view blocked User 2 profile...');
    try {
      await authRequest('get', `/api/community/users/${userId2}/profile`);
      console.log('❌ Should not be able to view blocked user profile');
      return false;
    } catch (error) {
      if (error.response?.status === 403 || error.response?.status === 404) {
        console.log('✅ Correctly blocked from viewing profile');
      } else {
        throw error;
      }
    }
    
    // Create post as User 2
    console.log('User 2 creating a post...');
    const user2PostResponse = await authRequest('post', '/api/community/posts', {
      customCountry: 'India',
      caption: 'Post from User 2',
      mediaUrls: [],
      mediaTypes: []
    }, authToken2);
    const user2PostId = user2PostResponse.data.id;
    console.log(`✅ User 2 post created: ${user2PostId}`);
    
    // User 1 should not see User 2's post in feed
    console.log('User 1 checking feed (should not see User 2 post)...');
    const feedResponse = await authRequest('get', '/api/community/posts');
    const blockedUserPost = feedResponse.data.posts.find(p => p.userId === userId2);
    if (!blockedUserPost) {
      console.log('✅ Blocked user posts correctly filtered from feed');
    } else {
      console.log('❌ Blocked user post still visible in feed');
      return false;
    }
    
    // Try to interact with blocked user's post (should fail)
    console.log('User 1 trying to like blocked User 2 post...');
    try {
      await authRequest('post', `/api/community/posts/${user2PostId}/like`);
      console.log('❌ Should not be able to interact with blocked user post');
      return false;
    } catch (error) {
      if (error.response?.status === 403 || error.response?.status === 404) {
        console.log('✅ Correctly blocked from interacting with post');
      } else {
        throw error;
      }
    }
    
    // Unblock user
    console.log('User 1 unblocking User 2...');
    const unblockResponse = await authRequest('delete', `/api/community/users/${userId2}/block`);
    console.log(`✅ User unblocked: ${unblockResponse.data.message}`);
    
    // Verify can now see profile
    console.log('User 1 viewing unblocked User 2 profile...');
    const unblockedProfileResponse = await authRequest('get', `/api/community/users/${userId2}/profile`);
    console.log(`✅ Can now view profile: ${unblockedProfileResponse.data.name}`);
    
    return true;
  } catch (error) {
    console.error('❌ Blocking enforcement failed:', error.response?.data || error.message);
    return false;
  }
}

// Test 8: Reporting and Moderation Workflow
async function testReportingAndModeration() {
  console.log('\n=== Test 8: Reporting and Moderation Workflow ===');
  
  try {
    // Report post
    console.log('User 2 reporting User 1 post...');
    const reportResponse = await authRequest('post', `/api/community/posts/${postId}/report`, {
      category: 'spam',
      reason: 'This is a test report for spam content'
    }, authToken2);
    console.log(`✅ Post reported: ${reportResponse.data.id}`);
    console.log(`   Category: ${reportResponse.data.category}`);
    console.log(`   Status: ${reportResponse.data.status}`);
    
    // Try to report same post again (should fail)
    console.log('User 2 trying to report same post again...');
    try {
      await authRequest('post', `/api/community/posts/${postId}/report`, {
        category: 'inappropriate'
      }, authToken2);
      console.log('❌ Should not allow duplicate reports');
      return false;
    } catch (error) {
      if (error.response?.status === 400 || error.response?.status === 409) {
        console.log('✅ Correctly rejected duplicate report');
      } else {
        throw error;
      }
    }
    
    // Note: Admin endpoints require admin role
    console.log('⚠️  Skipping admin moderation tests (requires admin role)');
    console.log('   Admin endpoints to test manually:');
    console.log('   - GET /api/community/admin/reports');
    console.log('   - POST /api/community/admin/posts/:id/hide');
    console.log('   - POST /api/community/admin/posts/:id/unhide');
    console.log('   - POST /api/community/admin/reports/:id/dismiss');
    
    return true;
  } catch (error) {
    console.error('❌ Reporting and moderation failed:', error.response?.data || error.message);
    return false;
  }
}

// Test 9: Cleanup
async function testCleanup() {
  console.log('\n=== Test 9: Cleanup ===');
  
  try {
    // Delete comment
    console.log('Deleting comment...');
    await authRequest('delete', `/api/community/comments/${commentId}`);
    console.log('✅ Comment deleted');
    
    // Delete post
    console.log('Deleting post...');
    await authRequest('delete', `/api/community/posts/${postId}`);
    console.log('✅ Post deleted');
    
    return true;
  } catch (error) {
    console.error('❌ Cleanup failed:', error.response?.data || error.message);
    return false;
  }
}

// Main test runner
async function runTests() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║   Community Module End-to-End Integration Tests            ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log(`\nAPI URL: ${API_URL}`);
  console.log('Starting tests...\n');
  
  const results = {
    passed: 0,
    failed: 0,
    tests: []
  };
  
  const tests = [
    { name: 'Authentication Setup', fn: testAuthentication },
    { name: 'Post Creation Flow', fn: testPostCreation },
    { name: 'Feed Browsing with Pagination', fn: testFeedBrowsing },
    { name: 'Interaction Types', fn: testInteractions },
    { name: 'User Relationship Flows', fn: testUserRelationships },
    { name: 'Profile Viewing with Privacy Modes', fn: testProfileViewing },
    { name: 'Blocking Enforcement', fn: testBlockingEnforcement },
    { name: 'Reporting and Moderation', fn: testReportingAndModeration },
    { name: 'Cleanup', fn: testCleanup }
  ];
  
  for (const test of tests) {
    try {
      const result = await test.fn();
      results.tests.push({ name: test.name, passed: result });
      if (result) {
        results.passed++;
      } else {
        results.failed++;
      }
    } catch (error) {
      console.error(`\n❌ Test "${test.name}" threw an error:`, error.message);
      results.tests.push({ name: test.name, passed: false });
      results.failed++;
    }
  }
  
  // Print summary
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║                      TEST SUMMARY                          ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');
  
  results.tests.forEach(test => {
    const status = test.passed ? '✅ PASS' : '❌ FAIL';
    console.log(`${status} - ${test.name}`);
  });
  
  console.log(`\nTotal: ${results.tests.length} tests`);
  console.log(`Passed: ${results.passed}`);
  console.log(`Failed: ${results.failed}`);
  
  if (results.failed === 0) {
    console.log('\n🎉 All tests passed!');
  } else {
    console.log('\n⚠️  Some tests failed. Please review the output above.');
  }
  
  console.log('\n📝 Note: This test suite covers core functionality.');
  console.log('   For responsive design testing, please test manually on:');
  console.log('   - Mobile devices (iOS/Android)');
  console.log('   - Tablets');
  console.log('   - Desktop browsers (various screen sizes)');
  console.log('\n⚠️  Troubleshooting:');
  console.log('   1. Make sure backend is running: cd backend && npm run dev');
  console.log('   2. Check backend is on port 3000 (or set API_URL env var)');
  console.log('   3. Ensure database is migrated and running');
  console.log('   4. Check that all community module tables exist');
}

// Run tests
runTests().catch(error => {
  console.error('\n💥 Fatal error:', error.message);
  process.exit(1);
});
