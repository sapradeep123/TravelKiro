import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet, Image, RefreshControl, TouchableOpacity, useWindowDimensions, Platform, Alert, ScrollView, Modal, TextInput, KeyboardAvoidingView } from 'react-native';
import { Card, Text, ActivityIndicator, IconButton, Avatar, SegmentedButtons, Button, Chip, Divider, Snackbar, Portal } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { communityService } from '../../src/services/communityService';
import { groupTravelService } from '../../src/services/groupTravelService';
import { albumService } from '../../src/services/albumService';
import { CommunityPost, GroupTravel, Album } from '../../src/types';
import { useAuth } from '../../src/contexts/AuthContext';
import CreatePhotoPostModal from '../../components/community/CreatePhotoPostModal';
import CreateAlbumModal from '../../components/albums/CreateAlbumModal';
import PhotoManagementModal from '../../components/community/PhotoManagementModal';
import EditProfileModal from '../../components/community/EditProfileModal';

type TabType = 'posts' | 'groups';

// Sample data for sidebars
const SAMPLE_FRIENDS = [
  { id: '1', name: 'Priya Sharma', initials: 'PS', online: true },
  { id: '2', name: 'Rahul Kumar', initials: 'RK', online: true },
  { id: '3', name: 'Anita Desai', initials: 'AD', online: false },
  { id: '4', name: 'Vikram Singh', initials: 'VS', online: true },
  { id: '5', name: 'Meera Patel', initials: 'MP', online: false },
];

const SAMPLE_BADGES = [
  { icon: 'trophy', color: '#FFD700', name: 'Explorer' },
  { icon: 'star', color: '#667eea', name: 'Star Traveler' },
  { icon: 'medal', color: '#FF6B6B', name: 'Adventure Master' },
  { icon: 'crown', color: '#FFA500', name: 'Travel King' },
  { icon: 'shield', color: '#4ECDC4', name: 'Safety First' },
  { icon: 'fire', color: '#FF4757', name: 'Hot Streak' },
  { icon: 'heart', color: '#F44336', name: 'Community Hero' },
  { icon: 'airplane', color: '#667eea', name: 'Frequent Flyer' },
];

const SAMPLE_PHOTOS = [
  'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=200',
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200',
  'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=200',
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=200',
  'https://images.unsplash.com/photo-1493246507139-91e8fad9978e?w=200',
  'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=200',
  'https://images.unsplash.com/photo-1530789253388-582c481c54b0?w=200',
  'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=200',
  'https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=200',
];

const SAMPLE_ACTIVITIES = [
  { id: '1', user: 'Priya Sharma', action: 'liked your post', time: '2 hours ago', initials: 'PS' },
  { id: '2', user: 'Rahul Kumar', action: 'commented on your photo', time: '5 hours ago', initials: 'RK' },
  { id: '3', user: 'Anita Desai', action: 'shared your travel story', time: '1 day ago', initials: 'AD' },
  { id: '4', user: 'Vikram Singh', action: 'joined your group travel', time: '2 days ago', initials: 'VS' },
];

const SAMPLE_STREAM = {
  title: 'Exploring Kerala Backwaters - Live Tour!',
  streamer: 'Travel Vlogger',
  initials: 'TV',
  thumbnail: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=400',
  viewers: 234,
};

export default function CommunityScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('posts');
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [groupTravels, setGroupTravels] = useState<GroupTravel[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [commentModalVisible, setCommentModalVisible] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState<any[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [replyingTo, setReplyingTo] = useState<any>(null);
  const [showReactions, setShowReactions] = useState<string | null>(null);
  const [likedComments, setLikedComments] = useState<Set<string>>(new Set());
  const [commentReactions, setCommentReactions] = useState<{[key: string]: string}>({});
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [reportingPostId, setReportingPostId] = useState<string | null>(null);
  const [reportCategory, setReportCategory] = useState<string>('');
  const [reportReason, setReportReason] = useState('');
  const [createPostModalVisible, setCreatePostModalVisible] = useState(false);
  const [createAlbumModalVisible, setCreateAlbumModalVisible] = useState(false);
  const [photoManagementModalVisible, setPhotoManagementModalVisible] = useState(false);
  const [editProfileModalVisible, setEditProfileModalVisible] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<{ url: string; postId?: string } | null>(null);
  const [imageIndices, setImageIndices] = useState<{[key: string]: number}>({});
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loadingAlbums, setLoadingAlbums] = useState(false);
  const [userPhotos, setUserPhotos] = useState<Array<{ url: string; postId: string }>>([]);
  const { user } = useAuth();
  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === 'web';
  const isLargeScreen = width >= 1024;
  const showWebLayout = isWeb && isLargeScreen;

  const showMessage = (message: string) => {
    setSnackbarMessage(message);
    setSnackbarVisible(true);
  };

  useEffect(() => {
    loadData();
    if (user) {
      loadAlbums();
      loadUserPhotos();
    }
  }, [activeTab, user]);

  const loadData = async () => {
    try {
      setLoading(true);
      if (activeTab === 'posts') {
        const response = await communityService.getFeed();
        // communityService.getFeed returns { data: Post[], pagination: {...} }
        if (response && response.data && Array.isArray(response.data)) {
          const mappedPosts = response.data.map((post: any) => ({
            ...post,
            likes: [], // Will be populated from likeCount
            comments: [], // Will be populated from commentCount
          }));
          setPosts(mappedPosts);
        } else {
          console.error('Invalid response from getFeed:', response);
          setPosts([]);
        }
      } else {
        const response = await groupTravelService.getAllGroupTravels();
        // API returns { data: [...] }, and getAllGroupTravels() returns response.data which is { data: [...] }
        const travels = response?.data || [];
        setGroupTravels(Array.isArray(travels) ? travels : []);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      setPosts([]);
      setGroupTravels([]);
    } finally {
      setLoading(false);
    }
  };

  const loadAlbums = async () => {
    if (!user) return;
    try {
      setLoadingAlbums(true);
      const userAlbums = await albumService.getAlbums(user.id);
      setAlbums(userAlbums);
    } catch (error) {
      console.error('Error loading albums:', error);
    } finally {
      setLoadingAlbums(false);
    }
  };

  const loadUserPhotos = async () => {
    if (!user) return;
    try {
      const response = await communityService.getUserPosts(user.id, 1);
      const photos: Array<{ url: string; postId: string }> = [];
      
      response.data.forEach((post: any) => {
        if (post.mediaUrls && post.mediaUrls.length > 0) {
          post.mediaUrls.forEach((url: string) => {
            photos.push({ url, postId: post.id });
          });
        }
      });
      
      setUserPhotos(photos.slice(0, 9)); // Show only first 9 photos
    } catch (error) {
      console.error('Error loading user photos:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleLike = async (postId: string) => {
    console.log('Like button clicked for post:', postId);
    if (!user) {
      showMessage('Please login to like posts');
      return;
    }
    try {
      // Optimistically update the UI
      setPosts(prevPosts => {
        if (!Array.isArray(prevPosts)) {
          console.error('prevPosts is not an array:', prevPosts);
          return [];
        }
        return prevPosts.map(post => {
          if (post.id === postId) {
            const isCurrentlyLiked = (post as any).isLiked || false;
            return {
              ...post,
              isLiked: !isCurrentlyLiked,
              likeCount: isCurrentlyLiked ? (post as any).likeCount - 1 : (post as any).likeCount + 1
            } as any;
          }
          return post;
        });
      });
      
      await communityService.toggleLike(postId);
      // No message needed - visual feedback is enough
    } catch (error: any) {
      console.error('Error liking post:', error);
      showMessage('Failed to like post');
      // Revert the optimistic update
      await loadData();
    }
  };

  const handleComment = async (postId: string) => {
    console.log('Comment button clicked for post:', postId);
    if (!user) {
      showMessage('Please login to comment on posts');
      return;
    }
    setSelectedPostId(postId);
    setCommentModalVisible(true);
    await loadComments(postId);
  };

  const loadComments = async (postId: string) => {
    try {
      setLoadingComments(true);
      const post = await communityService.getPost(postId);
      const allComments = (post as any).comments || [];
      
      // Organize comments into threads (parent comments with their replies)
      const commentThreads = allComments.map((comment: any) => {
        // Check if this comment is a reply (starts with @username)
        const isReply = comment.text.startsWith('@');
        return {
          ...comment,
          isReply,
          replies: [] // We'll populate this if needed
        };
      });
      
      setComments(commentThreads);
    } catch (error) {
      console.error('Error loading comments:', error);
      setComments([]);
    } finally {
      setLoadingComments(false);
    }
  };

  const handleAddComment = async () => {
    if (!commentText.trim() || !selectedPostId) return;
    
    try {
      const finalText = replyingTo 
        ? `@${replyingTo.user.profile.name} ${commentText}`
        : commentText;
      
      await communityService.addComment(selectedPostId, finalText);
      
      // Update the comment count optimistically
      setPosts(prevPosts => {
        if (!Array.isArray(prevPosts)) {
          console.error('prevPosts is not an array:', prevPosts);
          return [];
        }
        return prevPosts.map(post => {
          if (post.id === selectedPostId) {
            return {
              ...post,
              commentCount: ((post as any).commentCount || 0) + 1
            } as any;
          }
          return post;
        });
      });
      
      setCommentText('');
      setReplyingTo(null);
      await loadComments(selectedPostId);
      showMessage('Comment added');
    } catch (error: any) {
      console.error('Error adding comment:', error);
      showMessage('Failed to add comment');
    }
  };

  const handleReply = (comment: any) => {
    setReplyingTo(comment);
    setCommentText('');
  };

  const cancelReply = () => {
    setReplyingTo(null);
  };

  const handleLikeComment = async (commentId: string) => {
    // Toggle like optimistically
    setLikedComments(prev => {
      const newSet = new Set(prev);
      if (newSet.has(commentId)) {
        newSet.delete(commentId);
      } else {
        newSet.add(commentId);
      }
      return newSet;
    });
    // Backend integration would go here
  };

  const handleReaction = async (commentId: string, reaction: string) => {
    setCommentReactions(prev => ({
      ...prev,
      [commentId]: reaction
    }));
    setShowReactions(null);
    showMessage(`Reacted with ${reaction}`);
  };

  const closeCommentModal = () => {
    setCommentModalVisible(false);
    setSelectedPostId(null);
    setCommentText('');
    setComments([]);
  };

  const handleReportPost = (postId: string) => {
    setReportingPostId(postId);
    setReportModalVisible(true);
  };

  const submitReport = async () => {
    if (!reportCategory || !reportingPostId) {
      showMessage('Please select a reason');
      return;
    }

    try {
      await communityService.reportPost(reportingPostId, {
        category: reportCategory as any,
        reason: reportReason
      });
      
      setReportModalVisible(false);
      setReportingPostId(null);
      setReportCategory('');
      setReportReason('');
      showMessage('Report submitted. Thank you for helping keep our community safe.');
    } catch (error: any) {
      console.error('Error reporting post:', error);
      showMessage('Failed to submit report');
    }
  };

  const closeReportModal = () => {
    setReportModalVisible(false);
    setReportingPostId(null);
    setReportCategory('');
    setReportReason('');
  };

  const handleShare = (postId: string, caption: string) => {
    console.log('Share button clicked for post:', postId);
    if (Platform.OS === 'web') {
      // For web, copy to clipboard
      try {
        const nav = navigator as any;
        const win = (global as any).window || (globalThis as any).window;
        if (nav?.clipboard) {
          const shareUrl = win?.location?.origin 
            ? `${win.location.origin}/community/post/${postId}`
            : `https://butterfliy.com/community/post/${postId}`;
          nav.clipboard.writeText(shareUrl).then(() => {
            showMessage('Link copied to clipboard!');
          }).catch(() => {
            showMessage('Failed to copy link');
          });
        } else {
          showMessage('Share feature coming soon!');
        }
      } catch (error) {
        showMessage('Share feature coming soon!');
      }
    } else {
      showMessage('Share feature coming soon!');
    }
  };

  const formatPostDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);

    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const LeftSidebar = () => (
    <View style={styles.sidebar}>
      {/* About Me */}
      <Card style={styles.sidebarCard}>
        <Card.Content>
          <View style={styles.sidebarHeader}>
            <Text variant="titleMedium" style={styles.sidebarTitle}>About Me</Text>
            <IconButton icon="pencil" size={18} onPress={() => setEditProfileModalVisible(true)} />
          </View>
          <Text variant="bodySmall" style={styles.aboutText}>
            {user?.profile?.bio || `Hi! My name is ${user?.profile?.name || 'Travel Enthusiast'}. I love traveling and exploring new places. Join me on my adventures across India and beyond! 🌍✈️`}
          </Text>
          <Divider style={styles.divider} />
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Joined</Text>
            <Text style={styles.infoValue}>March 20th, 2024</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Location</Text>
            <Text style={styles.infoValue}>Mumbai, India</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Trips</Text>
            <Text style={styles.infoValue}>12 trips</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Countries</Text>
            <Text style={styles.infoValue}>5 countries</Text>
          </View>
        </Card.Content>
      </Card>

      {/* Badges */}
      <Card style={styles.sidebarCard}>
        <Card.Content>
          <View style={styles.sidebarHeader}>
            <Text variant="titleMedium" style={styles.sidebarTitle}>Badges</Text>
            <Chip compact style={styles.badgeCount}>{SAMPLE_BADGES.length}</Chip>
          </View>
          <View style={styles.badgesGrid}>
            {SAMPLE_BADGES.map((badge, i) => (
              <TouchableOpacity 
                key={i} 
                style={[styles.badge, { backgroundColor: `${badge.color}15` }]}
                onPress={() => Alert.alert(badge.name, 'Achievement unlocked!')}
              >
                <MaterialCommunityIcons name={badge.icon as any} size={32} color={badge.color} />
              </TouchableOpacity>
            ))}
          </View>
        </Card.Content>
      </Card>

      {/* Messages */}
      <Card style={styles.sidebarCard}>
        <Card.Content>
          <TouchableOpacity 
            style={styles.messagesHeader}
            onPress={() => router.push('/(tabs)/messages')}
          >
            <View style={styles.sidebarHeader}>
              <MaterialCommunityIcons name="message" size={20} color="#667eea" />
              <Text variant="titleMedium" style={styles.sidebarTitle}>Messages</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={20} color="#999" />
          </TouchableOpacity>
        </Card.Content>
      </Card>

      {/* Friends */}
      <Card style={styles.sidebarCard}>
        <Card.Content>
          <View style={styles.sidebarHeader}>
            <Text variant="titleMedium" style={styles.sidebarTitle}>Friends</Text>
            <Chip compact style={styles.badgeCount}>{SAMPLE_FRIENDS.length}</Chip>
          </View>
          {SAMPLE_FRIENDS.map((friend) => (
            <TouchableOpacity key={friend.id} style={styles.friendItem}>
              <Avatar.Text size={40} label={friend.initials} style={styles.friendAvatar} />
              <View style={styles.friendInfo}>
                <Text variant="bodyMedium" style={styles.friendName}>{friend.name}</Text>
                <View style={styles.friendStatusContainer}>
                  {friend.online && <View style={styles.onlineDot} />}
                  <Text variant="bodySmall" style={styles.friendStatusText}>
                    {friend.online ? 'Online' : 'Offline'}
                  </Text>
                </View>
              </View>
              <IconButton 
                icon="message" 
                size={20} 
                onPress={() => router.push(`/chat?userId=${friend.id}&name=${friend.name}`)} 
              />
            </TouchableOpacity>
          ))}
        </Card.Content>
      </Card>
    </View>
  );

  const RightSidebar = () => (
    <View style={styles.sidebar}>
      {/* Stream Box */}
      <Card style={styles.sidebarCard}>
        <Card.Content>
          <View style={styles.sidebarHeader}>
            <Text variant="titleMedium" style={styles.sidebarTitle}>Live Streams</Text>
            <IconButton icon="dots-horizontal" size={18} onPress={() => {}} />
          </View>
          <TouchableOpacity 
            style={styles.streamBox}
            onPress={() => Alert.alert('Live Stream', `Join ${SAMPLE_STREAM.streamer}'s live stream!`)}
          >
            <Image 
              source={{ uri: SAMPLE_STREAM.thumbnail }} 
              style={styles.streamImage}
            />
            <View style={styles.streamOverlay}>
              <Chip icon="circle" style={styles.liveChip} textStyle={styles.liveText} compact>
                LIVE
              </Chip>
              <View style={styles.viewersChip}>
                <MaterialCommunityIcons name="eye" size={12} color="#fff" />
                <Text style={styles.viewersText}>{SAMPLE_STREAM.viewers}</Text>
              </View>
            </View>
            <View style={styles.streamInfo}>
              <Avatar.Text size={32} label={SAMPLE_STREAM.initials} style={styles.streamAvatar} />
              <View style={styles.streamTextInfo}>
                <Text variant="bodySmall" style={styles.streamTitle} numberOfLines={1}>
                  {SAMPLE_STREAM.title}
                </Text>
                <Text variant="bodySmall" style={styles.streamStreamer}>
                  {SAMPLE_STREAM.streamer}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        </Card.Content>
      </Card>

      {/* Albums */}
      <Card style={styles.sidebarCard}>
        <Card.Content>
          <View style={styles.sidebarHeader}>
            <Text variant="titleMedium" style={styles.sidebarTitle}>My Albums</Text>
            <IconButton 
              icon="plus" 
              size={18} 
              onPress={() => setCreateAlbumModalVisible(true)} 
            />
          </View>
          {loadingAlbums ? (
            <ActivityIndicator size="small" color="#667eea" style={{ marginVertical: 12 }} />
          ) : albums.length === 0 ? (
            <View style={styles.emptyAlbums}>
              <MaterialCommunityIcons name="image-album" size={48} color="#ccc" />
              <Text style={styles.emptyAlbumsText}>No albums yet</Text>
              <Button 
                mode="outlined" 
                onPress={() => setCreateAlbumModalVisible(true)}
                style={styles.createAlbumBtn}
                compact
              >
                Create Album
              </Button>
            </View>
          ) : (
            <View style={styles.albumsGrid}>
              {albums.slice(0, 6).map((album) => (
                <TouchableOpacity 
                  key={album.id}
                  style={styles.albumItem}
                  onPress={() => router.push(`/(tabs)/album-detail?id=${album.id}`)}
                >
                  <View style={styles.albumThumbnail}>
                    {album.coverPhotoUrl ? (
                      <Image 
                        source={{ uri: album.coverPhotoUrl }} 
                        style={styles.albumImage}
                      />
                    ) : (
                      <View style={styles.albumPlaceholder}>
                        <MaterialCommunityIcons name="image-multiple" size={32} color="#999" />
                      </View>
                    )}
                    <View style={styles.albumPhotoCount}>
                      <MaterialCommunityIcons name="image" size={12} color="#fff" />
                      <Text style={styles.albumPhotoCountText}>{album.photoCount}</Text>
                    </View>
                  </View>
                  <Text style={styles.albumName} numberOfLines={1}>{album.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
          {albums.length > 6 && (
            <TouchableOpacity 
              style={styles.viewAllAlbums}
              onPress={() => Alert.alert('Albums', 'View all albums')}
            >
              <Text style={styles.viewAllAlbumsText}>View all albums ({albums.length})</Text>
            </TouchableOpacity>
          )}
        </Card.Content>
      </Card>

      {/* Photos */}
      <Card style={styles.sidebarCard}>
        <Card.Content>
          <View style={styles.sidebarHeader}>
            <Text variant="titleMedium" style={styles.sidebarTitle}>Photos</Text>
            <TouchableOpacity onPress={() => Alert.alert('Photos', 'View all photos')}>
              <Text style={styles.photoCount}>{userPhotos.length}</Text>
            </TouchableOpacity>
          </View>
          {userPhotos.length === 0 ? (
            <View style={styles.emptyPhotos}>
              <MaterialCommunityIcons name="image-outline" size={48} color="#ccc" />
              <Text style={styles.emptyPhotosText}>No photos yet</Text>
            </View>
          ) : (
            <View style={styles.photosGrid}>
              {userPhotos.map((photo, i) => (
                <TouchableOpacity 
                  key={i}
                  onPress={() => {
                    setSelectedPhoto({ url: getImageUrl(photo.url), postId: photo.postId });
                    setPhotoManagementModalVisible(true);
                  }}
                >
                  <Image 
                    source={{ uri: getImageUrl(photo.url) }} 
                    style={styles.photoItem}
                  />
                </TouchableOpacity>
              ))}
            </View>
          )}
        </Card.Content>
      </Card>

      {/* Activity Feed */}
      <Card style={styles.sidebarCard}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sidebarTitle}>Recent Activity</Text>
          {SAMPLE_ACTIVITIES.map((activity) => (
            <TouchableOpacity 
              key={activity.id} 
              style={styles.activityItem}
              onPress={() => Alert.alert('Activity', `${activity.user} ${activity.action}`)}
            >
              <Avatar.Text size={32} label={activity.initials} style={styles.activityAvatar} />
              <View style={styles.activityInfo}>
                <Text variant="bodySmall" style={styles.activityText}>
                  <Text style={styles.activityUser}>{activity.user}</Text> {activity.action}
                </Text>
                <Text variant="bodySmall" style={styles.activityTime}>{activity.time}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </Card.Content>
      </Card>
    </View>
  );

  // Helper function to fix image URLs for web
  const getImageUrl = (url: string): string => {
    if (!url) {
      console.log('[getImageUrl] Empty URL');
      return url;
    }
    
    console.log('[getImageUrl] Input URL:', url);
    
    // If the URL is already absolute and not localhost, return as is
    if (url.startsWith('http') && !url.includes('localhost')) {
      console.log('[getImageUrl] Already absolute non-localhost URL');
      return url;
    }
    
    // For localhost URLs or relative paths, use the API base URL
    const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';
    console.log('[getImageUrl] API_URL:', API_URL);
    
    // If it's a full localhost URL, replace the host
    if (url.includes('localhost')) {
      const urlPath = url.split('/uploads/')[1];
      if (urlPath) {
        const finalUrl = `${API_URL}/uploads/${urlPath}`;
        console.log('[getImageUrl] Localhost URL converted to:', finalUrl);
        return finalUrl;
      }
    }
    
    // If it's a relative path
    if (url.startsWith('/uploads/')) {
      const finalUrl = `${API_URL}${url}`;
      console.log('[getImageUrl] Relative path converted to:', finalUrl);
      return finalUrl;
    }
    
    console.log('[getImageUrl] No conversion needed, returning:', url);
    return url;
  };

  const renderPost = ({ item }: { item: CommunityPost }) => {
    const isLiked = (item as any).isLiked || false;
    const likeCount = (item as any).likeCount || 0;
    const commentCount = (item as any).commentCount || 0;
    const currentImageIndex = imageIndices[item.id] || 0;
    
    // Debug logging
    console.log('Rendering post:', item.id, 'mediaUrls:', item.mediaUrls);
    
    const handleImageScroll = (event: any) => {
      const contentOffsetX = event.nativeEvent.contentOffset.x;
      const imageWidth = event.nativeEvent.layoutMeasurement.width;
      const index = Math.round(contentOffsetX / imageWidth);
      setImageIndices(prev => ({ ...prev, [item.id]: index }));
    };
    
    return (
      <Card style={styles.postCard}>
        {/* Post Header */}
        <View style={styles.postHeader}>
          <TouchableOpacity 
            style={styles.postUserInfo}
            onPress={() => router.push(`/user-profile?userId=${(item.user as any)?.id}`)}
            activeOpacity={0.7}
          >
            <Avatar.Text
              size={48}
              label={(item.user as any)?.profile?.name?.substring(0, 2).toUpperCase() || 'U'}
              style={styles.postAvatar}
            />
            <View style={styles.postUserDetails}>
              <Text variant="titleMedium" style={styles.postUserName}>
                {(item.user as any)?.profile?.name || 'User'}
              </Text>
              <Text variant="bodySmall" style={styles.postTimestamp}>
                {formatPostDate(item.createdAt)}
              </Text>
            </View>
          </TouchableOpacity>
          <IconButton 
            icon="dots-horizontal" 
            size={20} 
            onPress={() => handleReportPost(item.id)} 
          />
        </View>

        {/* Post Caption */}
        <Text variant="bodyMedium" style={styles.postCaption}>
          {item.caption}
        </Text>

        {/* Post Images - Carousel for multiple images */}
        {item.mediaUrls && item.mediaUrls.length > 0 && (
          <View style={styles.imageCarouselContainer}>
            {item.mediaUrls.map((url, index) => {
              const imageUrl = getImageUrl(url);
              console.log('Original URL:', url, '-> Fixed URL:', imageUrl);
              
              // Only show first image for now (simplified)
              if (index > 0) return null;
              
              return (
                <TouchableOpacity
                  key={`${item.id}-image-${index}`}
                  activeOpacity={0.9}
                  onPress={() => {
                    setSelectedPhoto({ url: imageUrl, postId: item.id });
                    setPhotoManagementModalVisible(true);
                  }}
                  style={{ width: '100%', height: 400 }}
                >
                  <Image 
                    source={{ uri: imageUrl }} 
                    style={styles.postImage}
                    resizeMode="cover"
                    onError={(error) => {
                      console.error('Image failed to load:', imageUrl, error.nativeEvent?.error);
                    }}
                    onLoad={() => {
                      console.log('Image loaded successfully:', imageUrl);
                    }}
                  />
                </TouchableOpacity>
              );
            })}
            
            {/* Image Counter for multiple images */}
            {item.mediaUrls.length > 1 && (
              <View style={styles.imageCounterBadge}>
                <Text style={styles.imageCounterText}>
                  {currentImageIndex + 1}/{item.mediaUrls.length}
                </Text>
              </View>
            )}
            
            {/* Pagination Dots for multiple images */}
            {item.mediaUrls.length > 1 && (
              <View style={styles.paginationDots}>
                {item.mediaUrls.map((_, index) => (
                  <View
                    key={`dot-${index}`}
                    style={[
                      styles.paginationDot,
                      index === currentImageIndex && styles.paginationDotActive,
                    ]}
                  />
                ))}
              </View>
            )}
          </View>
        )}

        {/* Reactions */}
        <View style={styles.postReactions}>
          <View style={styles.reactionIcons}>
            <MaterialCommunityIcons name="heart" size={16} color="#F44336" />
            <MaterialCommunityIcons name="thumb-up" size={16} color="#2196F3" />
            <MaterialCommunityIcons name="emoticon-happy" size={16} color="#FFC107" />
            <Text style={styles.reactionCount}>{likeCount}</Text>
          </View>
          <View style={styles.postStats}>
            <Text style={styles.statText}>{commentCount} Comments</Text>
            <Text style={styles.statText}>5 Shares</Text>
          </View>
        </View>

        <Divider style={styles.postDivider} />

        {/* Actions */}
        <View style={styles.postActions}>
          <TouchableOpacity 
            style={styles.postAction}
            onPress={() => {
              console.log('React button pressed!');
              handleLike(item.id);
            }}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons 
              name={isLiked ? 'heart' : 'heart-outline'} 
              size={20} 
              color={isLiked ? '#F44336' : '#666'} 
            />
            <Text style={[styles.actionText, isLiked && styles.actionTextActive]}>React</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.postAction}
            onPress={() => {
              console.log('Comment button pressed!');
              handleComment(item.id);
            }}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons name="comment-outline" size={20} color="#666" />
            <Text style={styles.actionText}>Comment</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.postAction}
            onPress={() => {
              console.log('Share button pressed!');
              handleShare(item.id, item.caption);
            }}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons name="share-outline" size={20} color="#666" />
            <Text style={styles.actionText}>Share</Text>
          </TouchableOpacity>
        </View>
      </Card>
    );
  };

  const handleExpressInterest = async (id: string, title: string) => {
    try {
      await groupTravelService.expressInterest(id);
      Alert.alert('Success', `You expressed interest in "${title}".`);
      await loadData();
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error || 'Could not express interest');
    }
  };

  const handleUserPress = (userId: string) => {
    if (userId === user?.id) {
      router.push('/(tabs)/profile');
    } else {
      router.push(`/user-profile?userId=${userId}&returnTo=community&tab=groups` as any);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    const weeks = Math.floor(days / 7);
    if (weeks < 4) return `${weeks}w ago`;
    return formatDate(dateString);
  };

  const renderGroupTravel = ({ item }: { item: any }) => {
    const isExpired = new Date(item.expiryDate) < new Date();
    const isInterested = item.interestedUsers?.some((u: any) => u.userId === user?.id);
    
    return (
      <Card style={styles.postCard}>
        <Card.Content>
          {/* Creator Profile Section */}
          <TouchableOpacity 
            style={styles.groupCreatorSection}
            onPress={() => handleUserPress(item.creator.id)}
          >
            <Avatar.Text 
              size={48} 
              label={item.creator.profile.name.charAt(0).toUpperCase()} 
              style={styles.creatorAvatar}
            />
            <View style={styles.creatorInfo}>
              <Text variant="titleMedium" style={styles.creatorName}>
                {item.creator.profile.name}
              </Text>
              <Text variant="bodySmall" style={styles.creatorRole}>
                {item.creator.role === 'TOURIST_GUIDE' ? 'Tourist Guide' : 'Traveler'}
              </Text>
              <Text variant="bodySmall" style={styles.postTime}>
                Posted {formatTimeAgo(item.createdAt)}
              </Text>
            </View>
          </TouchableOpacity>

          {/* Group Travel Header */}
          <View style={styles.groupTravelHeader}>
            <View style={styles.groupTitleSection}>
              <MaterialCommunityIcons name="airplane" size={24} color="#667eea" />
              <Text variant="titleLarge" style={styles.groupTitle}>{item.title}</Text>
            </View>
            {item.status === 'OPEN' && !isExpired ? (
              <Chip icon="check-circle" style={styles.openChip} textStyle={styles.chipText} compact>
                Open
              </Chip>
            ) : (
              <Chip icon="close-circle" style={styles.closedChip} textStyle={styles.chipText} compact>
                Closed
              </Chip>
            )}
          </View>

          {/* Location Info */}
          {(item.customCountry || item.customState || item.customArea) && (
            <View style={styles.locationInfo}>
              <MaterialCommunityIcons name="map-marker" size={16} color="#666" />
              <Text variant="bodySmall" style={styles.locationText}>
                {[item.customArea, item.customState, item.customCountry].filter(Boolean).join(', ')}
              </Text>
            </View>
          )}

          <Text variant="bodyMedium" style={styles.groupDescription}>
            {item.description}
          </Text>

          {/* Travel Details Grid */}
          <View style={styles.groupDetailsGrid}>
            <View style={styles.groupDetailCard}>
              <MaterialCommunityIcons name="calendar" size={24} color="#667eea" />
              <Text style={styles.detailLabel}>Travel Date</Text>
              <Text style={styles.detailValue}>{formatDate(item.travelDate)}</Text>
            </View>
            <View style={styles.groupDetailCard}>
              <MaterialCommunityIcons name="clock-outline" size={24} color="#FF9800" />
              <Text style={styles.detailLabel}>Expires</Text>
              <Text style={styles.detailValue}>{formatDate(item.expiryDate)}</Text>
            </View>
            <View style={styles.groupDetailCard}>
              <MaterialCommunityIcons name="account-multiple" size={24} color="#4CAF50" />
              <Text style={styles.detailLabel}>Interested</Text>
              <Text style={styles.detailValue}>{item.interestedUsers.length} people</Text>
            </View>
            <View style={styles.groupDetailCard}>
              <MaterialCommunityIcons name="briefcase" size={24} color="#9C27B0" />
              <Text style={styles.detailLabel}>Bids</Text>
              <Text style={styles.detailValue}>{item.bids.length} received</Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.groupActions}>
            {item.status === 'OPEN' && !isExpired && (
              <Button
                mode={isInterested ? 'outlined' : 'contained'}
                onPress={() => handleExpressInterest(item.id, item.title)}
                disabled={isInterested}
                style={[styles.groupButton, { flex: 1 }]}
                icon={isInterested ? 'check' : 'account-plus'}
              >
                {isInterested ? 'Already Joined' : 'Join Group'}
              </Button>
            )}
            <Button
              mode="outlined"
              onPress={() => router.push(`/group-travel-detail?id=${item.id}` as any)}
              style={[styles.groupButton, { flex: 1 }]}
              icon="eye"
            >
              View Details
            </Button>
          </View>
        </Card.Content>
      </Card>
    );
  };

  if (loading) {
    return (
      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#fff" />
        <Text style={styles.loadingText}>Loading community...</Text>
      </LinearGradient>
    );
  }

  if (showWebLayout) {
    return (
      <View style={styles.container}>
        <View style={styles.webLayout}>
          <View style={styles.sidebarColumn}>
            <ScrollView 
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.sidebarContent}
            >
              <LeftSidebar />
            </ScrollView>
          </View>
          
          <View style={styles.mainColumn}>
            <View style={styles.tabContainer}>
              <SegmentedButtons
                value={activeTab}
                onValueChange={(value) => setActiveTab(value as TabType)}
                buttons={[
                  { value: 'posts', label: 'Posts', icon: 'post' },
                  { value: 'groups', label: 'Group Travel', icon: 'account-multiple' },
                ]}
                style={styles.segmentedButtons}
              />
            </View>
            <FlatList
              data={activeTab === 'posts' ? posts : (groupTravels as any)}
              renderItem={activeTab === 'posts' ? renderPost : (renderGroupTravel as any)}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.feedContent}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
              }
              showsVerticalScrollIndicator={false}
            />
          </View>
          
          <View style={styles.sidebarColumn}>
            <ScrollView 
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.sidebarContent}
            >
              <RightSidebar />
            </ScrollView>
          </View>
        </View>

        {/* Floating Action Button */}
        {activeTab === 'posts' && user && (
          <TouchableOpacity
            style={styles.fab}
            onPress={() => setCreatePostModalVisible(true)}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons name="plus" size={28} color="#fff" />
          </TouchableOpacity>
        )}

        <Snackbar
          visible={snackbarVisible}
          onDismiss={() => setSnackbarVisible(false)}
          duration={3000}
          style={styles.snackbar}
        >
          {snackbarMessage}
        </Snackbar>

        {/* Report Modal - Web */}
        <Modal
          visible={reportModalVisible}
          transparent
          animationType="fade"
          onRequestClose={closeReportModal}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContainer, styles.webModalContainer, { maxHeight: '70%' }]}>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Report Post</Text>
                  <IconButton icon="close" size={24} onPress={closeReportModal} />
                </View>

                <ScrollView style={styles.reportContainer}>
                  <Text style={styles.reportDescription}>
                    Help us understand what's wrong with this post
                  </Text>

                  <View style={styles.reportCategories}>
                    {[
                      { value: 'spam', label: 'Spam', icon: 'alert-circle' },
                      { value: 'harassment', label: 'Harassment or Bullying', icon: 'account-alert' },
                      { value: 'inappropriate', label: 'Inappropriate Content', icon: 'eye-off' },
                      { value: 'violence', label: 'Violence or Dangerous', icon: 'alert-octagon' },
                      { value: 'hate_speech', label: 'Hate Speech', icon: 'message-alert' },
                      { value: 'false_info', label: 'False Information', icon: 'information' },
                      { value: 'other', label: 'Other', icon: 'dots-horizontal' },
                    ].map((category) => (
                      <TouchableOpacity
                        key={category.value}
                        style={[
                          styles.reportCategoryBtn,
                          reportCategory === category.value && styles.reportCategoryBtnActive
                        ]}
                        onPress={() => setReportCategory(category.value)}
                      >
                        <MaterialCommunityIcons 
                          name={category.icon as any} 
                          size={24} 
                          color={reportCategory === category.value ? '#667eea' : '#6b7280'} 
                        />
                        <Text style={[
                          styles.reportCategoryText,
                          reportCategory === category.value && styles.reportCategoryTextActive
                        ]}>
                          {category.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <Text style={styles.reportLabel}>Additional Details (Optional)</Text>
                  <TextInput
                    style={styles.reportTextInput}
                    placeholder="Provide more context..."
                    value={reportReason}
                    onChangeText={setReportReason}
                    multiline
                    numberOfLines={4}
                    maxLength={500}
                  />
                </ScrollView>

                <View style={styles.reportActions}>
                  <TouchableOpacity 
                    style={styles.reportCancelBtn}
                    onPress={closeReportModal}
                  >
                    <Text style={styles.reportCancelText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.reportSubmitBtn, !reportCategory && styles.reportSubmitBtnDisabled]}
                    onPress={submitReport}
                    disabled={!reportCategory}
                  >
                    <Text style={styles.reportSubmitText}>Submit Report</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </Modal>

        {/* Comment Modal */}
        <Modal
          visible={commentModalVisible}
          transparent
          animationType="fade"
          onRequestClose={closeCommentModal}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContainer, styles.webModalContainer]}>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Comments</Text>
                  <IconButton icon="close" size={24} onPress={closeCommentModal} />
                </View>

                <ScrollView style={styles.commentsContainer}>
                  {loadingComments ? (
                    <ActivityIndicator size="small" color="#667eea" style={{ marginTop: 20 }} />
                  ) : comments.length === 0 ? (
                    <View style={styles.noComments}>
                      <Text style={styles.noCommentsText}>No comments yet. Be the first to comment!</Text>
                    </View>
                  ) : (
                    comments.map((comment, index) => {
                      const isLiked = likedComments.has(comment.id);
                      const reaction = commentReactions[comment.id];
                      const isReply = comment.text.startsWith('@');
                      
                      return (
                        <View key={comment.id || index} style={[styles.commentItem, isReply && styles.commentReply]}>
                          <Avatar.Text 
                            size={isReply ? 28 : 32} 
                            label={comment.user?.profile?.name?.substring(0, 2).toUpperCase() || 'U'} 
                            style={styles.commentAvatar}
                          />
                          <View style={styles.commentContentWrapper}>
                            <View style={styles.commentContent}>
                              <Text style={styles.commentUser}>{comment.user?.profile?.name || 'User'}</Text>
                              <Text style={styles.commentText}>{comment.text}</Text>
                              {reaction && (
                                <View style={styles.commentReactionBadge}>
                                  <Text style={styles.commentReactionEmoji}>{reaction}</Text>
                                </View>
                              )}
                              <Text style={styles.commentTime}>
                                {new Date(comment.createdAt).toLocaleDateString('en-US', { 
                                  month: 'short', 
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </Text>
                            </View>
                            <View style={styles.commentActions}>
                              <TouchableOpacity 
                                style={styles.commentActionBtn}
                                onPress={() => handleLikeComment(comment.id)}
                              >
                                <MaterialCommunityIcons 
                                  name={isLiked ? "heart" : "heart-outline"} 
                                  size={16} 
                                  color={isLiked ? "#F44336" : "#6b7280"} 
                                />
                                <Text style={[styles.commentActionText, isLiked && styles.commentActionTextActive]}>
                                  {isLiked ? 'Liked' : 'Like'}
                                </Text>
                              </TouchableOpacity>
                              <TouchableOpacity 
                                style={styles.commentActionBtn}
                                onPress={() => handleReply(comment)}
                              >
                                <MaterialCommunityIcons name="reply" size={16} color="#6b7280" />
                                <Text style={styles.commentActionText}>Reply</Text>
                              </TouchableOpacity>
                              <TouchableOpacity 
                                style={styles.commentActionBtn}
                                onPress={() => setShowReactions(showReactions === comment.id ? null : comment.id)}
                              >
                                <MaterialCommunityIcons name="emoticon-happy-outline" size={16} color="#6b7280" />
                                <Text style={styles.commentActionText}>React</Text>
                              </TouchableOpacity>
                            </View>
                            {showReactions === comment.id && (
                              <View style={styles.reactionsPanel}>
                                {['❤️', '👍', '😂', '😮', '😢', '🔥'].map((emoji) => (
                                  <TouchableOpacity
                                    key={emoji}
                                    style={styles.reactionBtn}
                                    onPress={() => handleReaction(comment.id, emoji)}
                                  >
                                    <Text style={styles.reactionEmoji}>{emoji}</Text>
                                  </TouchableOpacity>
                                ))}
                              </View>
                            )}
                          </View>
                        </View>
                      );
                    })
                  )}
                </ScrollView>

                <View style={styles.commentInputSection}>
                  {replyingTo && (
                    <View style={styles.replyingToBar}>
                      <Text style={styles.replyingToText}>
                        Replying to <Text style={styles.replyingToUser}>@{replyingTo.user?.profile?.name}</Text>
                      </Text>
                      <TouchableOpacity onPress={cancelReply}>
                        <MaterialCommunityIcons name="close" size={20} color="#6b7280" />
                      </TouchableOpacity>
                    </View>
                  )}
                  <View style={styles.commentInputContainer}>
                    <TextInput
                      style={styles.commentInput}
                      placeholder={replyingTo ? "Write a reply..." : "Write a comment..."}
                      value={commentText}
                      onChangeText={setCommentText}
                      multiline
                      maxLength={500}
                    />
                    <TouchableOpacity 
                      style={[styles.sendButton, !commentText.trim() && styles.sendButtonDisabled]}
                      onPress={handleAddComment}
                      disabled={!commentText.trim()}
                    >
                      <MaterialCommunityIcons 
                        name="send" 
                        size={24} 
                        color={commentText.trim() ? '#667eea' : '#ccc'} 
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </Modal>

        {/* Create Photo Post Modal */}
        <CreatePhotoPostModal
          visible={createPostModalVisible}
          onClose={() => setCreatePostModalVisible(false)}
          onPostCreated={() => {
            showMessage('Post created successfully!');
            handleRefresh();
          }}
        />

        {/* Create Album Modal */}
        <CreateAlbumModal
          visible={createAlbumModalVisible}
          onClose={() => setCreateAlbumModalVisible(false)}
          onAlbumCreated={(album) => {
            showMessage('Album created successfully!');
            setCreateAlbumModalVisible(false);
            loadAlbums();
          }}
        />

        {/* Photo Management Modal */}
        <PhotoManagementModal
          visible={photoManagementModalVisible}
          photoUrl={selectedPhoto?.url || ''}
          postId={selectedPhoto?.postId}
          onClose={() => {
            setPhotoManagementModalVisible(false);
            setSelectedPhoto(null);
          }}
          currentUserId={user?.id}
          albums={albums}
          onRefresh={() => {
            loadAlbums();
            handleRefresh();
          }}
        />

        {/* Edit Profile Modal */}
        <EditProfileModal
          visible={editProfileModalVisible}
          onClose={() => setEditProfileModalVisible(false)}
          onProfileUpdated={() => {
            setEditProfileModalVisible(false);
            showMessage('Profile updated successfully!');
            // Optionally reload user data here
          }}
          currentProfile={{
            bio: user?.profile?.bio,
          }}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.mobileHeader}>
        <Text variant="headlineMedium" style={styles.headerTitle} numberOfLines={1}>Community</Text>
        <Text style={styles.headerSubtitle} numberOfLines={1}>Connect with fellow travelers</Text>
      </LinearGradient>
      
      <View style={styles.tabContainer}>
        <SegmentedButtons
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as TabType)}
          buttons={[
            { value: 'posts', label: 'Posts', icon: 'post' },
            { value: 'groups', label: 'Groups', icon: 'account-multiple' },
          ]}
          style={styles.segmentedButtons}
        />
      </View>

      <FlatList
        data={activeTab === 'posts' ? posts : (groupTravels as any)}
        renderItem={activeTab === 'posts' ? renderPost : (renderGroupTravel as any)}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.mobileListContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      />

      {/* Floating Action Button for Create Post */}
      {activeTab === 'posts' && user && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => setCreatePostModalVisible(true)}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons name="plus" size={28} color="#fff" />
        </TouchableOpacity>
      )}
      
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        style={styles.snackbar}
      >
        {snackbarMessage}
      </Snackbar>

      {/* Report Modal */}
      <Modal
        visible={reportModalVisible}
        transparent
        animationType="slide"
        onRequestClose={closeReportModal}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { maxHeight: '70%' }]}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Report Post</Text>
                <IconButton icon="close" size={24} onPress={closeReportModal} />
              </View>

              <ScrollView style={styles.reportContainer}>
                <Text style={styles.reportDescription}>
                  Help us understand what's wrong with this post
                </Text>

                <View style={styles.reportCategories}>
                  {[
                    { value: 'spam', label: 'Spam', icon: 'alert-circle' },
                    { value: 'harassment', label: 'Harassment or Bullying', icon: 'account-alert' },
                    { value: 'inappropriate', label: 'Inappropriate Content', icon: 'eye-off' },
                    { value: 'violence', label: 'Violence or Dangerous', icon: 'alert-octagon' },
                    { value: 'hate_speech', label: 'Hate Speech', icon: 'message-alert' },
                    { value: 'false_info', label: 'False Information', icon: 'information' },
                    { value: 'other', label: 'Other', icon: 'dots-horizontal' },
                  ].map((category) => (
                    <TouchableOpacity
                      key={category.value}
                      style={[
                        styles.reportCategoryBtn,
                        reportCategory === category.value && styles.reportCategoryBtnActive
                      ]}
                      onPress={() => setReportCategory(category.value)}
                    >
                      <MaterialCommunityIcons 
                        name={category.icon as any} 
                        size={24} 
                        color={reportCategory === category.value ? '#667eea' : '#6b7280'} 
                      />
                      <Text style={[
                        styles.reportCategoryText,
                        reportCategory === category.value && styles.reportCategoryTextActive
                      ]}>
                        {category.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={styles.reportLabel}>Additional Details (Optional)</Text>
                <TextInput
                  style={styles.reportTextInput}
                  placeholder="Provide more context..."
                  value={reportReason}
                  onChangeText={setReportReason}
                  multiline
                  numberOfLines={4}
                  maxLength={500}
                />
              </ScrollView>

              <View style={styles.reportActions}>
                <TouchableOpacity 
                  style={styles.reportCancelBtn}
                  onPress={closeReportModal}
                >
                  <Text style={styles.reportCancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.reportSubmitBtn, !reportCategory && styles.reportSubmitBtnDisabled]}
                  onPress={submitReport}
                  disabled={!reportCategory}
                >
                  <Text style={styles.reportSubmitText}>Submit Report</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>

      {/* Comment Modal */}
      <Modal
        visible={commentModalVisible}
        transparent
        animationType="slide"
        onRequestClose={closeCommentModal}
      >
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.modalContainer}
          >
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Comments</Text>
                <IconButton icon="close" size={24} onPress={closeCommentModal} />
              </View>

              <ScrollView style={styles.commentsContainer}>
                {loadingComments ? (
                  <ActivityIndicator size="small" color="#667eea" style={{ marginTop: 20 }} />
                ) : comments.length === 0 ? (
                  <View style={styles.noComments}>
                    <Text style={styles.noCommentsText}>No comments yet. Be the first to comment!</Text>
                  </View>
                ) : (
                  comments.map((comment, index) => (
                    <View key={comment.id || index} style={styles.commentItem}>
                      <Avatar.Text 
                        size={32} 
                        label={comment.user?.profile?.name?.substring(0, 2).toUpperCase() || 'U'} 
                        style={styles.commentAvatar}
                      />
                      <View style={styles.commentContentWrapper}>
                        <View style={styles.commentContent}>
                          <Text style={styles.commentUser}>{comment.user?.profile?.name || 'User'}</Text>
                          <Text style={styles.commentText}>{comment.text}</Text>
                          <Text style={styles.commentTime}>
                            {new Date(comment.createdAt).toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </Text>
                        </View>
                        <View style={styles.commentActions}>
                          <TouchableOpacity 
                            style={styles.commentActionBtn}
                            onPress={() => handleLikeComment(comment.id)}
                          >
                            <MaterialCommunityIcons name="heart-outline" size={16} color="#6b7280" />
                            <Text style={styles.commentActionText}>Like</Text>
                          </TouchableOpacity>
                          <TouchableOpacity 
                            style={styles.commentActionBtn}
                            onPress={() => handleReply(comment)}
                          >
                            <MaterialCommunityIcons name="reply" size={16} color="#6b7280" />
                            <Text style={styles.commentActionText}>Reply</Text>
                          </TouchableOpacity>
                          <TouchableOpacity 
                            style={styles.commentActionBtn}
                            onPress={() => setShowReactions(showReactions === comment.id ? null : comment.id)}
                          >
                            <MaterialCommunityIcons name="emoticon-happy-outline" size={16} color="#6b7280" />
                            <Text style={styles.commentActionText}>React</Text>
                          </TouchableOpacity>
                        </View>
                        {showReactions === comment.id && (
                          <View style={styles.reactionsPanel}>
                            {['❤️', '👍', '😂', '😮', '😢', '🔥'].map((emoji) => (
                              <TouchableOpacity
                                key={emoji}
                                style={styles.reactionBtn}
                                onPress={() => handleReaction(comment.id, emoji)}
                              >
                                <Text style={styles.reactionEmoji}>{emoji}</Text>
                              </TouchableOpacity>
                            ))}
                          </View>
                        )}
                      </View>
                    </View>
                  ))
                )}
              </ScrollView>

              <View style={styles.commentInputContainer}>
                <TextInput
                  style={styles.commentInput}
                  placeholder="Write a comment..."
                  value={commentText}
                  onChangeText={setCommentText}
                  multiline
                  maxLength={500}
                />
                <TouchableOpacity 
                  style={[styles.sendButton, !commentText.trim() && styles.sendButtonDisabled]}
                  onPress={handleAddComment}
                  disabled={!commentText.trim()}
                >
                  <MaterialCommunityIcons 
                    name="send" 
                    size={24} 
                    color={commentText.trim() ? '#667eea' : '#ccc'} 
                  />
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      {/* Create Photo Post Modal */}
      <CreatePhotoPostModal
        visible={createPostModalVisible}
        onClose={() => setCreatePostModalVisible(false)}
        onPostCreated={() => {
          showMessage('Post created successfully!');
          handleRefresh();
        }}
      />

      {/* Create Album Modal */}
      <CreateAlbumModal
        visible={createAlbumModalVisible}
        onClose={() => setCreateAlbumModalVisible(false)}
        onAlbumCreated={(album) => {
          showMessage('Album created successfully!');
          setCreateAlbumModalVisible(false);
          loadAlbums();
        }}
      />

      {/* Photo Management Modal */}
      <PhotoManagementModal
        visible={photoManagementModalVisible}
        photoUrl={selectedPhoto?.url || ''}
        postId={selectedPhoto?.postId}
        onClose={() => {
          setPhotoManagementModalVisible(false);
          setSelectedPhoto(null);
        }}
        currentUserId={user?.id}
        albums={albums}
        onRefresh={() => {
          loadAlbums();
          handleRefresh();
        }}
      />

      {/* Edit Profile Modal */}
      <EditProfileModal
        visible={editProfileModalVisible}
        onClose={() => setEditProfileModalVisible(false)}
        onProfileUpdated={() => {
          setEditProfileModalVisible(false);
          showMessage('Profile updated successfully!');
          // Optionally reload user data here
        }}
        currentProfile={{
          bio: user?.profile?.bio,
        }}
      />

      {/* Floating Action Button */}
      {activeTab === 'posts' && user && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => setCreatePostModalVisible(true)}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons name="plus" size={28} color="#fff" />
        </TouchableOpacity>
      )}


    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f2f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#fff',
  },
  webLayout: {
    flexDirection: 'row',
    flex: 1,
    maxWidth: 1400,
    marginHorizontal: 'auto',
    width: '100%',
    gap: 20,
    padding: 20,
  },
  sidebarColumn: {
    width: 280,
    flexShrink: 0,
  },
  sidebarContent: {
    paddingBottom: 20,
  },
  sidebar: {
    gap: 16,
  },
  mainColumn: {
    flex: 1,
    maxWidth: 600,
  },
  sidebarCard: {
    borderRadius: 12,
    elevation: 1,
    backgroundColor: '#fff',
  },
  sidebarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  messagesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  sidebarTitle: {
    fontWeight: '700',
    color: '#1c1e21',
  },
  aboutText: {
    color: '#65676b',
    lineHeight: 20,
    marginBottom: 12,
  },
  divider: {
    marginVertical: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  infoLabel: {
    color: '#65676b',
    fontSize: 13,
  },
  infoValue: {
    color: '#1c1e21',
    fontSize: 13,
    fontWeight: '600',
  },
  badgeCount: {
    backgroundColor: '#667eea',
    height: 24,
  },
  badgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  badge: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: '#f0f4ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  friendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  friendAvatar: {
    backgroundColor: '#667eea',
  },
  friendInfo: {
    flex: 1,
    marginLeft: 12,
  },
  friendName: {
    fontWeight: '600',
    color: '#1c1e21',
  },
  friendStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  friendStatusText: {
    color: '#65676b',
    fontSize: 12,
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4CAF50',
  },
  streamBox: {
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
  },
  streamImage: {
    width: '100%',
    height: 150,
  } as any,
  streamOverlay: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    gap: 8,
  },
  liveChip: {
    backgroundColor: '#F44336',
  },
  liveText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  viewersChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  viewersText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  streamInfo: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
    backgroundColor: 'rgba(0,0,0,0.7)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  streamAvatar: {
    backgroundColor: '#667eea',
  },
  streamTextInfo: {
    flex: 1,
  },
  streamTitle: {
    color: '#fff',
    fontWeight: '600',
    marginBottom: 2,
  },
  streamStreamer: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 11,
  },
  photoCount: {
    color: '#667eea',
    fontSize: 14,
    fontWeight: '600',
  },
  photosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  photoItem: {
    width: 84,
    height: 84,
    borderRadius: 8,
  } as any,
  emptyPhotos: {
    alignItems: 'center',
    paddingVertical: 24,
    gap: 8,
  },
  emptyPhotosText: {
    color: '#65676b',
    fontSize: 13,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  activityAvatar: {
    backgroundColor: '#667eea',
  },
  activityInfo: {
    flex: 1,
    marginLeft: 12,
  },
  activityText: {
    color: '#1c1e21',
    fontSize: 13,
  },
  activityUser: {
    fontWeight: '600',
  },
  activityTime: {
    color: '#65676b',
    fontSize: 12,
  },
  mobileHeader: {
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    width: '100%',
  },
  headerTitle: {
    color: '#fff',
    fontWeight: '800',
    marginBottom: 4,
    fontSize: 28,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    color: 'rgba(255,255,255,0.95)',
    fontSize: 15,
    fontWeight: '500',
  },
  tabContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    marginBottom: 8,
  },
  segmentedButtons: {
    backgroundColor: '#fff',
  },
  feedContent: {
    paddingBottom: 20,
    paddingTop: 0,
  },
  mobileListContent: {
    paddingBottom: 160,
  },
  postCard: {
    marginBottom: 16,
    marginHorizontal: 16,
    borderRadius: 12,
    elevation: 2,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    overflow: 'hidden',
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  postUserInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    minWidth: 0,
  },
  postAvatar: {
    backgroundColor: '#667eea',
  },
  postUserDetails: {
    marginLeft: 12,
    flex: 1,
    minWidth: 0,
  },
  postUserName: {
    fontWeight: '700',
    color: '#1c1e21',
    fontSize: 15,
  },
  postTimestamp: {
    color: '#65676b',
    fontSize: 12,
    marginTop: 2,
  },
  postCaption: {
    color: '#1c1e21',
    lineHeight: 22,
    marginBottom: 12,
    paddingHorizontal: 16,
    fontSize: 15,
  },
  imageCarouselContainer: {
    position: 'relative',
    width: '100%',
    height: 400,
  },
  imageCarousel: {
    width: '100%',
    height: 400,
  },
  postImage: {
    width: '100%',
    height: 400,
    backgroundColor: '#f0f0f0',
  } as any,
  imageCounterBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  imageCounterText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  paginationDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 6,
  },
  paginationDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#ddd',
  },
  paginationDotActive: {
    backgroundColor: '#667eea',
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  postReactions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 8,
    paddingHorizontal: 16,
  },
  reactionIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  reactionCount: {
    marginLeft: 4,
    color: '#65676b',
    fontSize: 13,
  },
  postStats: {
    flexDirection: 'row',
    gap: 12,
  },
  statText: {
    color: '#65676b',
    fontSize: 13,
  },
  postDivider: {
    marginVertical: 8,
  },
  postActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  postAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 16,
    cursor: 'pointer' as any,
  },
  actionText: {
    color: '#65676b',
    fontSize: 14,
    fontWeight: '600',
  },
  actionTextActive: {
    color: '#F44336',
  },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  groupAvatar: {
    backgroundColor: '#667eea',
  },
  groupHeaderInfo: {
    flex: 1,
    marginLeft: 12,
  },
  groupTitle: {
    fontWeight: '700',
    color: '#1c1e21',
  },
  groupCreator: {
    color: '#65676b',
    fontSize: 13,
  },
  groupDescription: {
    color: '#1c1e21',
    lineHeight: 20,
    marginBottom: 16,
  },
  groupDetails: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  groupDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  groupDetailText: {
    color: '#65676b',
    fontSize: 13,
  },
  groupButton: {
    backgroundColor: '#667eea',
  },
  openChip: {
    backgroundColor: '#4CAF50',
  },
  closedChip: {
    backgroundColor: '#F44336',
  },
  chipText: {
    color: '#fff',
    fontSize: 11,
  },
  groupCreatorSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
  },
  creatorAvatar: {
    backgroundColor: '#667eea',
  },
  creatorInfo: {
    flex: 1,
    marginLeft: 12,
  },
  creatorName: {
    fontWeight: '700',
    color: '#1c1e21',
    fontSize: 16,
  },
  creatorRole: {
    color: '#667eea',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  postTime: {
    color: '#65676b',
    fontSize: 11,
    marginTop: 2,
  },
  groupTravelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  groupTitleSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 12,
  },
  locationText: {
    color: '#65676b',
    fontSize: 13,
  },
  groupDetailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  groupDetailCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 11,
    color: '#65676b',
    marginTop: 4,
    fontWeight: '600',
  },
  detailValue: {
    fontSize: 14,
    color: '#1c1e21',
    fontWeight: '700',
    marginTop: 2,
  },
  groupActions: {
    flexDirection: 'row',
    gap: 8,
  },
  fab: {
    position: 'absolute',
    bottom: 90,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#667eea',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },

  snackbar: {
    backgroundColor: '#323232',
    bottom: 20,
    maxWidth: 300,
    alignSelf: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  webModalContainer: {
    maxWidth: 600,
    marginHorizontal: 'auto',
    width: '100%',
    borderRadius: 20,
    marginBottom: 'auto',
    marginTop: 'auto',
  },
  modalContent: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  commentsContainer: {
    flex: 1,
    padding: 16,
  },
  noComments: {
    padding: 40,
    alignItems: 'center',
  },
  noCommentsText: {
    color: '#6b7280',
    fontSize: 14,
  },
  commentItem: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 12,
  },
  commentReply: {
    marginLeft: 44,
    marginTop: -8,
  },
  commentContentWrapper: {
    flex: 1,
  },
  commentContent: {
    backgroundColor: '#f3f4f6',
    padding: 12,
    borderRadius: 12,
  },
  commentAvatar: {
    backgroundColor: '#667eea',
  },
  commentUser: {
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
    fontSize: 14,
  },
  commentText: {
    color: '#374151',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 4,
  },
  commentTime: {
    color: '#9ca3af',
    fontSize: 12,
  },
  commentActions: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 8,
    marginLeft: 12,
  },
  commentActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  commentActionText: {
    color: '#6b7280',
    fontSize: 12,
    fontWeight: '600',
  },
  commentActionTextActive: {
    color: '#F44336',
  },
  commentReactionBadge: {
    position: 'absolute',
    bottom: -8,
    right: 8,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  commentReactionEmoji: {
    fontSize: 16,
  },
  reactionsPanel: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
    marginLeft: 12,
    padding: 8,
    backgroundColor: '#fff',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    alignSelf: 'flex-start',
  },
  reactionBtn: {
    padding: 4,
  },
  reactionEmoji: {
    fontSize: 20,
  },
  commentInputSection: {
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  replyingToBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f9fafb',
  },
  replyingToText: {
    fontSize: 13,
    color: '#6b7280',
  },
  replyingToUser: {
    fontWeight: '600',
    color: '#667eea',
  },
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    gap: 12,
  },
  commentInput: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    maxHeight: 100,
    fontSize: 14,
    color: '#111827',
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  reportContainer: {
    padding: 16,
  },
  reportDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 20,
    lineHeight: 20,
  },
  reportCategories: {
    gap: 12,
    marginBottom: 20,
  },
  reportCategoryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    gap: 12,
  },
  reportCategoryBtnActive: {
    backgroundColor: '#eef2ff',
    borderColor: '#667eea',
  },
  reportCategoryText: {
    fontSize: 15,
    color: '#374151',
    fontWeight: '500',
  },
  reportCategoryTextActive: {
    color: '#667eea',
    fontWeight: '600',
  },
  reportLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  reportTextInput: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    color: '#111827',
    textAlignVertical: 'top',
    minHeight: 100,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  reportActions: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  reportCancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
  },
  reportCancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
  },
  reportSubmitBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#dc2626',
    alignItems: 'center',
  },
  reportSubmitBtnDisabled: {
    opacity: 0.5,
  },
  reportSubmitText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  // Album styles
  emptyAlbums: {
    alignItems: 'center',
    paddingVertical: 24,
    gap: 12,
  },
  emptyAlbumsText: {
    color: '#65676b',
    fontSize: 14,
  },
  createAlbumBtn: {
    marginTop: 8,
    borderColor: '#667eea',
  },
  albumsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  albumItem: {
    width: '31%',
  },
  albumThumbnail: {
    position: 'relative',
    width: '100%',
    aspectRatio: 1,
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 4,
  },
  albumImage: {
    width: '100%',
    height: '100%',
  } as any,
  albumPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f0f2f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  albumPhotoCount: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    gap: 2,
  },
  albumPhotoCountText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  albumName: {
    fontSize: 12,
    color: '#1c1e21',
    fontWeight: '600',
  },
  viewAllAlbums: {
    marginTop: 12,
    paddingVertical: 8,
    alignItems: 'center',
  },
  viewAllAlbumsText: {
    color: '#667eea',
    fontSize: 13,
    fontWeight: '600',
  },
});
