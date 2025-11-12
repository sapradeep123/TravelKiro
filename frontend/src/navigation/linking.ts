/**
 * Deep Linking Configuration for Community Module
 * 
 * Supported deep links:
 * - travel-encyclopedia://community/posts/:id - View a specific post
 * - travel-encyclopedia://community/users/:userId - View a user profile
 * - travel-encyclopedia://community/locations/:locationId - View location feed
 * - travel-encyclopedia://community/create - Create a new post
 */

export const linking = {
  prefixes: ['travel-encyclopedia://', 'https://travel-encyclopedia.com'],
  config: {
    screens: {
      '(tabs)': {
        screens: {
          // Community routes
          community: 'community',
          'post-detail': 'community/posts/:id',
          'user-profile': 'community/users/:userId',
          'location-feed': 'community/locations/:locationId',
          'post-composer': 'community/create',
          'profile-edit': 'community/profile/edit',
          
          // Other routes
          locations: 'explore',
          profile: 'profile',
          'location-detail': 'locations/:id',
          'event-detail': 'events/:id',
          'package-detail': 'packages/:id',
          'accommodation-detail': 'accommodations/:id',
        },
      },
      '(auth)': {
        screens: {
          login: 'login',
          register: 'register',
        },
      },
    },
  },
};

/**
 * Helper function to generate deep links
 */
export const generateDeepLink = {
  post: (postId: string) => `travel-encyclopedia://community/posts/${postId}`,
  userProfile: (userId: string) => `travel-encyclopedia://community/users/${userId}`,
  locationFeed: (locationId: string) => `travel-encyclopedia://community/locations/${locationId}`,
  createPost: () => 'travel-encyclopedia://community/create',
  editProfile: () => 'travel-encyclopedia://community/profile/edit',
};

/**
 * Helper function to parse deep links
 */
export const parseDeepLink = (url: string) => {
  const urlObj = new URL(url);
  const path = urlObj.pathname;
  
  // Parse community routes
  if (path.startsWith('/community/posts/')) {
    const postId = path.split('/').pop();
    return { screen: 'post-detail', params: { id: postId } };
  }
  
  if (path.startsWith('/community/users/')) {
    const userId = path.split('/').pop();
    return { screen: 'user-profile', params: { userId } };
  }
  
  if (path.startsWith('/community/locations/')) {
    const locationId = path.split('/').pop();
    return { screen: 'location-feed', params: { locationId } };
  }
  
  if (path === '/community/create') {
    return { screen: 'post-composer', params: {} };
  }
  
  if (path === '/community/profile/edit') {
    return { screen: 'profile-edit', params: {} };
  }
  
  return null;
};
