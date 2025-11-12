import { router } from 'expo-router';

/**
 * Navigation Helper Functions for Community Module
 * 
 * These functions provide a centralized way to navigate to community screens
 * with proper type safety and parameter handling.
 */

export const communityNavigation = {
  /**
   * Navigate to a specific post detail screen
   */
  goToPost: (postId: string) => {
    router.push(`/(tabs)/post-detail?id=${postId}` as any);
  },

  /**
   * Navigate to a user profile screen
   */
  goToUserProfile: (userId: string) => {
    router.push(`/(tabs)/user-profile?userId=${userId}` as any);
  },

  /**
   * Navigate to a location feed screen
   */
  goToLocationFeed: (locationId: string, locationName?: string) => {
    const params = locationName 
      ? `locationId=${locationId}&locationName=${encodeURIComponent(locationName)}`
      : `locationId=${locationId}`;
    router.push(`/(tabs)/location-feed?${params}` as any);
  },

  /**
   * Navigate to the post composer screen
   */
  goToCreatePost: () => {
    router.push('/(tabs)/post-composer' as any);
  },

  /**
   * Navigate to the profile edit screen
   */
  goToEditProfile: () => {
    router.push('/(tabs)/profile-edit' as any);
  },

  /**
   * Navigate to the community feed
   */
  goToCommunityFeed: () => {
    router.push('/(tabs)/community' as any);
  },

  /**
   * Navigate back
   */
  goBack: () => {
    router.back();
  },
};

/**
 * General navigation helpers
 */
export const appNavigation = {
  /**
   * Navigate to login screen
   */
  goToLogin: () => {
    router.replace('/(auth)/login' as any);
  },

  /**
   * Navigate to register screen
   */
  goToRegister: () => {
    router.replace('/(auth)/register' as any);
  },

  /**
   * Navigate to home screen (locations)
   */
  goToHome: () => {
    router.replace('/(tabs)/locations' as any);
  },

  /**
   * Navigate to profile screen
   */
  goToProfile: () => {
    router.push('/(tabs)/profile' as any);
  },

  /**
   * Navigate to a location detail screen
   */
  goToLocationDetail: (locationId: string) => {
    router.push(`/(tabs)/location-detail?id=${locationId}` as any);
  },

  /**
   * Navigate to an event detail screen
   */
  goToEventDetail: (eventId: string) => {
    router.push(`/(tabs)/event-detail?id=${eventId}` as any);
  },

  /**
   * Navigate to a package detail screen
   */
  goToPackageDetail: (packageId: string) => {
    router.push(`/(tabs)/package-detail?id=${packageId}` as any);
  },

  /**
   * Navigate to an accommodation detail screen
   */
  goToAccommodationDetail: (accommodationId: string) => {
    router.push(`/(tabs)/accommodation-detail?id=${accommodationId}` as any);
  },
};

/**
 * Check if a route requires authentication
 */
export const requiresAuth = (routeName: string): boolean => {
  const authRequiredRoutes = [
    'post-composer',
    'profile-edit',
    'community',
  ];
  
  return authRequiredRoutes.includes(routeName);
};

/**
 * Check if a route requires admin access
 */
export const requiresAdmin = (routeName: string): boolean => {
  const adminRoutes = [
    'manage-locations',
    'manage-events',
    'manage-packages',
    'manage-accommodations',
    'users',
    'approvals',
    'dashboard',
  ];
  
  return adminRoutes.includes(routeName);
};
