# Navigation Documentation

## Overview

This directory contains navigation configuration and helpers for the Travel Encyclopedia app, with a focus on the Community Module integration.

## Files

### `linking.ts`
Deep linking configuration for the app. Supports both custom URL schemes and web URLs.

**Supported Deep Links:**
- `travel-encyclopedia://community/posts/:id` - View a specific post
- `travel-encyclopedia://community/users/:userId` - View a user profile
- `travel-encyclopedia://community/locations/:locationId` - View location feed
- `travel-encyclopedia://community/create` - Create a new post
- `travel-encyclopedia://community/profile/edit` - Edit profile

### `navigationHelpers.ts`
Helper functions for programmatic navigation throughout the app.

**Community Navigation:**
```typescript
import { communityNavigation } from '@/navigation/navigationHelpers';

// Navigate to a post
communityNavigation.goToPost('post-id');

// Navigate to a user profile
communityNavigation.goToUserProfile('user-id');

// Navigate to a location feed
communityNavigation.goToLocationFeed('location-id', 'Location Name');

// Navigate to create post
communityNavigation.goToCreatePost();

// Navigate to edit profile
communityNavigation.goToEditProfile();
```

**App Navigation:**
```typescript
import { appNavigation } from '@/navigation/navigationHelpers';

// Navigate to login
appNavigation.goToLogin();

// Navigate to home
appNavigation.goToHome();

// Navigate to location detail
appNavigation.goToLocationDetail('location-id');
```

## Route Structure

### Community Routes

All community routes are nested under the `(tabs)` group:

```
(tabs)/
├── community.tsx              # Main community feed
├── post-detail.tsx           # Post detail view
├── post-composer.tsx         # Create new post (auth required)
├── user-profile.tsx          # User profile view
├── profile-edit.tsx          # Edit profile (auth required)
└── location-feed.tsx         # Location-specific feed
```

### Authentication Guards

Routes that require authentication:
- `post-composer` - Creating posts
- `profile-edit` - Editing profile
- `community` - Viewing community feed (optional, can be made public)

Use the `useAuthGuard` hook to protect routes:

```typescript
import { useAuthGuard } from '@/hooks/useAuthGuard';

export default function ProtectedScreen() {
  const { canAccess } = useAuthGuard({
    requireAuth: true,
    alertMessage: 'Please log in to access this feature',
  });

  if (!canAccess) {
    return null;
  }

  return <YourComponent />;
}
```

### Admin Guards

Routes that require admin access use the `useAdminGuard` hook:

```typescript
import { useAdminGuard } from '@/hooks/useAuthGuard';

export default function AdminScreen() {
  const { canAccess } = useAdminGuard();

  if (!canAccess) {
    return null;
  }

  return <AdminComponent />;
}
```

## Navigation Flow

### Creating a Post
1. User clicks FAB or "Create Post" button
2. `communityNavigation.goToCreatePost()` is called
3. `useAuthGuard` checks authentication
4. If authenticated, shows post composer
5. If not authenticated, redirects to login with alert

### Viewing a Post
1. User clicks on a post card
2. `communityNavigation.goToPost(postId)` is called
3. Post detail screen loads
4. User can interact (like, comment, share)

### Viewing a Profile
1. User clicks on username or avatar
2. `communityNavigation.goToUserProfile(userId)` is called
3. Profile screen loads with user info and posts
4. If own profile, shows edit button

### Viewing Location Feed
1. User clicks on location tag in post
2. `communityNavigation.goToLocationFeed(locationId, locationName)` is called
3. Location feed screen loads with filtered posts

## Deep Linking Examples

### Opening a Post from External Link
```
travel-encyclopedia://community/posts/abc123
```

### Opening a User Profile
```
travel-encyclopedia://community/users/user456
```

### Opening Location Feed
```
travel-encyclopedia://community/locations/loc789
```

### Web URLs (when deployed)
```
https://travel-encyclopedia.com/community/posts/abc123
https://travel-encyclopedia.com/community/users/user456
```

## Testing Navigation

Run navigation tests:
```bash
npm test -- navigation.test.ts
```

## Best Practices

1. **Always use navigation helpers** instead of direct `router.push()` calls
2. **Add authentication guards** to protected routes
3. **Handle navigation errors** gracefully with try-catch
4. **Provide user feedback** when navigation fails
5. **Test deep links** on both mobile and web platforms
6. **Use type-safe parameters** when navigating with data

## Troubleshooting

### Deep Links Not Working
- Check that the URL scheme is registered in `app.json`
- Verify the linking configuration in `linking.ts`
- Test with `npx uri-scheme open travel-encyclopedia://community/posts/123 --ios`

### Authentication Redirects Not Working
- Ensure `AuthProvider` wraps the entire app in `_layout.tsx`
- Check that `useAuthGuard` is called at the top of the component
- Verify token storage is working correctly

### Navigation Stack Issues
- Use `router.replace()` for authentication flows
- Use `router.push()` for normal navigation
- Use `router.back()` to go back in history
