/**
 * Test data for photo management functionality
 * This file contains mock data to test the photo management modal
 */

export interface TestPhoto {
  id: string;
  url: string;
  postId: string;
  caption: string;
  userId: string;
  userName: string;
  createdAt: string;
}

export interface TestAlbum {
  id: string;
  name: string;
  description?: string;
  privacy: 'PUBLIC' | 'FRIENDS_ONLY' | 'PRIVATE';
  photoCount: number;
  coverPhotoUrl?: string;
  userId: string;
  defaultCommentStatus: 'ENABLED' | 'DISABLED' | 'HIDDEN';
  createdAt: string;
}

export interface TestComment {
  id: string;
  text: string;
  user: {
    id: string;
    profile: {
      name: string;
    };
  };
  createdAt: string;
}

// Sample photos with placeholder images (using data URIs for offline testing)
export const TEST_PHOTOS: TestPhoto[] = [
  {
    id: 'photo-1',
    url: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=400&h=400&fit=crop',
    postId: 'post-1',
    caption: 'Beautiful sunset at the beach',
    userId: 'user-1',
    userName: 'John Doe',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'photo-2',
    url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop',
    postId: 'post-2',
    caption: 'Mountain adventure',
    userId: 'user-1',
    userName: 'John Doe',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'photo-3',
    url: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=400&h=400&fit=crop',
    postId: 'post-3',
    caption: 'City lights at night',
    userId: 'user-1',
    userName: 'John Doe',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'photo-4',
    url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=400&fit=crop',
    postId: 'post-4',
    caption: 'Tropical paradise',
    userId: 'user-1',
    userName: 'John Doe',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'photo-5',
    url: 'https://images.unsplash.com/photo-1493246507139-91e8fad9978e?w=400&h=400&fit=crop',
    postId: 'post-5',
    caption: 'Desert landscape',
    userId: 'user-1',
    userName: 'John Doe',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'photo-6',
    url: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&h=400&fit=crop',
    postId: 'post-6',
    caption: 'Forest trail',
    userId: 'user-1',
    userName: 'John Doe',
    createdAt: new Date().toISOString(),
  },
];

// Sample albums for testing
export const TEST_ALBUMS: TestAlbum[] = [
  {
    id: 'album-1',
    name: 'Summer Vacation 2024',
    description: 'Amazing summer trip to the beach',
    privacy: 'PUBLIC',
    photoCount: 12,
    coverPhotoUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=200&h=200&fit=crop',
    userId: 'user-1',
    defaultCommentStatus: 'ENABLED',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'album-2',
    name: 'Mountain Adventures',
    description: 'Hiking and climbing in the mountains',
    privacy: 'FRIENDS_ONLY',
    photoCount: 8,
    coverPhotoUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200&h=200&fit=crop',
    userId: 'user-1',
    defaultCommentStatus: 'ENABLED',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'album-3',
    name: 'City Exploration',
    description: 'Urban photography collection',
    privacy: 'PUBLIC',
    photoCount: 15,
    coverPhotoUrl: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=200&h=200&fit=crop',
    userId: 'user-1',
    defaultCommentStatus: 'ENABLED',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'album-4',
    name: 'Private Memories',
    description: 'Personal collection',
    privacy: 'PRIVATE',
    photoCount: 5,
    userId: 'user-1',
    defaultCommentStatus: 'DISABLED',
    createdAt: new Date().toISOString(),
  },
];

// Sample comments for testing
export const TEST_COMMENTS: TestComment[] = [
  {
    id: 'comment-1',
    text: 'Wow! This is absolutely stunning! 😍',
    user: {
      id: 'user-2',
      profile: {
        name: 'Jane Smith',
      },
    },
    createdAt: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
  },
  {
    id: 'comment-2',
    text: 'Great shot! Where was this taken?',
    user: {
      id: 'user-3',
      profile: {
        name: 'Mike Johnson',
      },
    },
    createdAt: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
  },
  {
    id: 'comment-3',
    text: 'Love the colors in this photo! 🌅',
    user: {
      id: 'user-4',
      profile: {
        name: 'Sarah Williams',
      },
    },
    createdAt: new Date(Date.now() - 10800000).toISOString(), // 3 hours ago
  },
];

/**
 * Generate a placeholder image data URI
 * This creates a simple colored rectangle for testing without network requests
 */
export function generatePlaceholderImage(
  width: number = 400,
  height: number = 400,
  color: string = '#667eea'
): string {
  // Create a simple SVG placeholder
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="${color}"/>
      <text x="50%" y="50%" font-family="Arial" font-size="24" fill="white" text-anchor="middle" dy=".3em">
        ${width}x${height}
      </text>
    </svg>
  `;
  
  return `data:image/svg+xml;base64,${btoa(svg)}`;
}

/**
 * Get test photos with optional placeholder images
 */
export function getTestPhotos(usePlaceholders: boolean = false): TestPhoto[] {
  if (usePlaceholders) {
    return TEST_PHOTOS.map((photo, index) => ({
      ...photo,
      url: generatePlaceholderImage(400, 400, ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#43e97b'][index % 5]),
    }));
  }
  return TEST_PHOTOS;
}

/**
 * Mock API responses for testing
 */
export const mockPhotoAPI = {
  getPhotos: () => Promise.resolve(TEST_PHOTOS),
  getAlbums: () => Promise.resolve(TEST_ALBUMS),
  getComments: (postId: string) => Promise.resolve(TEST_COMMENTS),
  addToAlbum: (photoId: string, albumId: string) => {
    console.log(`[Mock API] Adding photo ${photoId} to album ${albumId}`);
    return Promise.resolve({ success: true });
  },
  addComment: (postId: string, text: string) => {
    console.log(`[Mock API] Adding comment to post ${postId}: ${text}`);
    const newComment: TestComment = {
      id: `comment-${Date.now()}`,
      text,
      user: {
        id: 'user-1',
        profile: {
          name: 'Current User',
        },
      },
      createdAt: new Date().toISOString(),
    };
    return Promise.resolve(newComment);
  },
};
