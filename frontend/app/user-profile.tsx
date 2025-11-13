import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  RefreshControl,
  useWindowDimensions,
  Platform,
} from 'react-native';
import { Text, Avatar, Button, ActivityIndicator, Chip, Divider, Card } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { communityService } from '../src/services/communityService';
import { albumService } from '../src/services/albumService';
import { useAuth } from '../src/contexts/AuthContext';

// Sample badges data
const SAMPLE_BADGES = [
  { icon: 'trophy', color: '#FFD700', name: 'Explorer' },
  { icon: 'star', color: '#667eea', name: 'Star Traveler' },
  { icon: 'medal', color: '#FF6B6B', name: 'Adventure Master' },
  { icon: 'shield', color: '#4ECDC4', name: 'Safety First' },
];

export default function UserProfileScreen() {
  const { userId } = useLocalSearchParams();
  const router = useRouter();
  const { user: currentUser } = useAuth();
  const { width } = useWindowDimensions();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [userPosts, setUserPosts] = useState<any[]>([]);
  const [userAlbums, setUserAlbums] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'newsfeed' | 'about' | 'photos' | 'albums'>('newsfeed');

  const isOwnProfile = currentUser?.id === userId;
  const isWeb = Platform.OS === 'web';
  const isLargeScreen = width >= 1024;

  useEffect(() => {
    loadUserData();
  }, [userId]);

  const loadUserData = async () => {
    try {
      setLoading(true);
      
      // Load user posts
      const postsResponse = await communityService.getUserPosts(userId as string, 1);
      setUserPosts(Array.isArray(postsResponse.data) ? postsResponse.data : []);
      
      // Extract user profile from first post
      if (postsResponse.data && postsResponse.data.length > 0) {
        setUserProfile(postsResponse.data[0].user);
      }
      
      // Load user albums
      try {
        const albums = await albumService.getAlbums(userId as string);
        setUserAlbums(Array.isArray(albums) ? albums : []);
      } catch (error) {
        console.log('No albums found for user');
        setUserAlbums([]);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      setUserPosts([]);
      setUserAlbums([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadUserData();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#667eea" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  const userName = userProfile?.profile?.name || 'User';
  const userBio = userProfile?.profile?.bio || 'Travel enthusiast exploring the world';
  const userInitials = userName.substring(0, 2).toUpperCase();

  // Count photos from posts
  const photoCount = Array.isArray(userPosts) 
    ? userPosts.reduce((count, post) => count + (post.mediaUrls?.length || 0), 0)
    : 0;

  const renderContent = () => {
    switch (activeTab) {
      case 'about':
        return (
          <View style={styles.aboutSection}>
            <Card style={styles.infoCard}>
              <Card.Content>
                <Text style={styles.sectionTitle}>About Me</Text>
                <Text style={styles.bioText}>{userBio}</Text>
                <Divider style={styles.sectionDivider} />
                
                <View style={styles.infoRow}>
                  <MaterialCommunityIcons name="briefcase" size={20} color="#667eea" />
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Membership Level</Text>
                    <Text style={styles.infoValue}>Full Member</Text>
                  </View>
                </View>

                <View style={styles.infoRow}>
                  <MaterialCommunityIcons name="map-marker" size={20} color="#667eea" />
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Location</Text>
                    <Text style={styles.infoValue}>Mumbai, India</Text>
                  </View>
                </View>

                <View style={styles.infoRow}>
                  <MaterialCommunityIcons name="calendar" size={20} color="#667eea" />
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Member Since</Text>
                    <Text style={styles.infoValue}>March 2024</Text>
                  </View>
                </View>

                <View style={styles.infoRow}>
                  <MaterialCommunityIcons name="airplane" size={20} color="#667eea" />
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Trips Completed</Text>
                    <Text style={styles.infoValue}>12 trips</Text>
                  </View>
                </View>
              </Card.Content>
            </Card>
          </View>
        );

      case 'photos':
        return (
          <View style={styles.photosSection}>
            {photoCount === 0 ? (
              <View style={styles.emptyState}>
                <MaterialCommunityIcons name="image-outline" size={64} color="#ccc" />
                <Text style={styles.emptyText}>No photos yet</Text>
              </View>
            ) : (
              <View style={styles.photosGrid}>
                {userPosts.map((post) => {
                  if (!post.mediaUrls || !Array.isArray(post.mediaUrls)) {
                    return null;
                  }
                  return post.mediaUrls.map((url: string, index: number) => (
                    <TouchableOpacity
                      key={`${post.id}-${index}`}
                      style={styles.photoGridItem}
                      onPress={() => console.log('View photo', post.id)}
                    >
                      <Image source={{ uri: url }} style={styles.photoGridImage} />
                    </TouchableOpacity>
                  ));
                })}
              </View>
            )}
          </View>
        );

      case 'albums':
        return (
          <View style={styles.albumsSection}>
            {userAlbums.length === 0 ? (
              <View style={styles.emptyState}>
                <MaterialCommunityIcons name="image-album" size={64} color="#ccc" />
                <Text style={styles.emptyText}>No albums yet</Text>
              </View>
            ) : (
              <View style={styles.albumsList}>
                {userAlbums.map((album) => (
                  <TouchableOpacity
                    key={album.id}
                    style={styles.albumCard}
                    onPress={() => router.push(`/(tabs)/album-detail?id=${album.id}`)}
                  >
                    {album.coverPhotoUrl ? (
                      <Image source={{ uri: album.coverPhotoUrl }} style={styles.albumCover} />
                    ) : (
                      <View style={styles.albumPlaceholder}>
                        <MaterialCommunityIcons name="image-multiple" size={40} color="#999" />
                      </View>
                    )}
                    <View style={styles.albumInfo}>
                      <Text style={styles.albumName} numberOfLines={1}>
                        {album.name}
                      </Text>
                      <Text style={styles.albumCount}>{album.photoCount} photos</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        );

      case 'newsfeed':
      default:
        return (
          <View style={styles.newsfeedSection}>
            {userPosts.length === 0 ? (
              <View style={styles.emptyState}>
                <MaterialCommunityIcons name="post-outline" size={64} color="#ccc" />
                <Text style={styles.emptyText}>No posts yet</Text>
              </View>
            ) : (
              userPosts.map((post) => (
                <Card key={post.id} style={styles.postCard}>
                  <Card.Content>
                    <View style={styles.postHeader}>
                      <Avatar.Text size={40} label={userInitials} style={styles.postAvatar} />
                      <View style={styles.postHeaderInfo}>
                        <Text style={styles.postUserName}>{userName}</Text>
                        <Text style={styles.postTime}>
                          {new Date(post.createdAt).toLocaleDateString()}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.postCaption}>{post.caption}</Text>
                    {post.mediaUrls && post.mediaUrls.length > 0 && (
                      <Image 
                        source={{ uri: post.mediaUrls[0] }} 
                        style={styles.postImage}
                        resizeMode="cover"
                      />
                    )}
                    <View style={styles.postActions}>
                      <TouchableOpacity style={styles.postActionBtn}>
                        <MaterialCommunityIcons name="thumb-up-outline" size={20} color="#6b7280" />
                        <Text style={styles.postActionText}>Like</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.postActionBtn}>
                        <MaterialCommunityIcons name="comment-outline" size={20} color="#6b7280" />
                        <Text style={styles.postActionText}>Comment</Text>
                      </TouchableOpacity>
                    </View>
                  </Card.Content>
                </Card>
              ))
            )}
          </View>
        );
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{userName}</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
      >
        {/* Cover Photo */}
        <View style={styles.coverPhoto}>
          <Image 
            source={{ uri: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200' }}
            style={styles.coverImage}
          />
        </View>

        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.profileTop}>
            <Avatar.Text
              size={120}
              label={userInitials}
              style={styles.profileAvatar}
            />
            <View style={styles.profileActions}>
              <Chip icon="star" style={styles.personifyChip}>Personify</Chip>
              {isOwnProfile ? (
                <Button
                  mode="outlined"
                  onPress={() => router.back()}
                  style={styles.actionButton}
                  icon="pencil"
                  compact
                >
                  Edit Profile
                </Button>
              ) : (
                <>
                  <Button
                    mode="contained"
                    onPress={() => console.log('Add Friend')}
                    style={styles.addFriendButton}
                    icon="account-plus"
                    compact
                  >
                    Add Friend
                  </Button>
                  <Button
                    mode="outlined"
                    onPress={() => console.log('Message')}
                    style={styles.messageButton}
                    icon="message"
                    compact
                  >
                    Message
                  </Button>
                </>
              )}
            </View>
          </View>

          <Text style={styles.profileName}>{userName}</Text>
          
          {/* Badges */}
          <View style={styles.badgesContainer}>
            {SAMPLE_BADGES.map((badge, index) => (
              <View key={index} style={[styles.badgeIcon, { backgroundColor: `${badge.color}20` }]}>
                <MaterialCommunityIcons name={badge.icon as any} size={24} color={badge.color} />
              </View>
            ))}
          </View>
        </View>

        {/* Navigation Tabs */}
        <View style={styles.navTabs}>
          <TouchableOpacity
            style={[styles.navTab, activeTab === 'newsfeed' && styles.navTabActive]}
            onPress={() => setActiveTab('newsfeed')}
          >
            <Text style={[styles.navTabText, activeTab === 'newsfeed' && styles.navTabTextActive]}>
              NEWSFEED
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.navTab, activeTab === 'about' && styles.navTabActive]}
            onPress={() => setActiveTab('about')}
          >
            <Text style={[styles.navTabText, activeTab === 'about' && styles.navTabTextActive]}>
              ABOUT ME
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.navTab, activeTab === 'photos' && styles.navTabActive]}
            onPress={() => setActiveTab('photos')}
          >
            <Text style={[styles.navTabText, activeTab === 'photos' && styles.navTabTextActive]}>
              PHOTOS
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.navTab, activeTab === 'albums' && styles.navTabActive]}
            onPress={() => setActiveTab('albums')}
          >
            <Text style={[styles.navTabText, activeTab === 'albums' && styles.navTabTextActive]}>
              ALBUMS
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content Area */}
        <View style={styles.contentArea}>
          {isLargeScreen ? (
            <View style={styles.desktopLayout}>
              {/* Left Sidebar */}
              <View style={styles.leftSidebar}>
                <Card style={styles.sidebarCard}>
                  <Card.Content>
                    <Text style={styles.sidebarTitle}>My Friends</Text>
                    <Text style={styles.friendCount}>8 Friends</Text>
                  </Card.Content>
                </Card>

                <Card style={styles.sidebarCard}>
                  <Card.Content>
                    <Text style={styles.sidebarTitle}>My Badges</Text>
                    <View style={styles.badgesGrid}>
                      {SAMPLE_BADGES.map((badge, index) => (
                        <View key={index} style={[styles.badgeItem, { backgroundColor: `${badge.color}15` }]}>
                          <MaterialCommunityIcons name={badge.icon as any} size={32} color={badge.color} />
                        </View>
                      ))}
                    </View>
                  </Card.Content>
                </Card>
              </View>

              {/* Main Content */}
              <View style={styles.mainContent}>
                {renderContent()}
              </View>

              {/* Right Sidebar */}
              <View style={styles.rightSidebar}>
                <Card style={styles.sidebarCard}>
                  <Card.Content>
                    <Text style={styles.sidebarTitle}>My Groups</Text>
                    <Text style={styles.groupCount}>3 Groups</Text>
                  </Card.Content>
                </Card>
              </View>
            </View>
          ) : (
            <View style={styles.mobileContent}>
              {renderContent()}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f2f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f2f5',
  },
  loadingText: {
    marginTop: 12,
    color: '#6b7280',
    fontSize: 14,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  headerRight: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  profileHeader: {
    backgroundColor: '#fff',
    padding: 24,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  profileAvatar: {
    backgroundColor: '#667eea',
    marginBottom: 16,
  },
  profileName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  profileBio: {
    fontSize: 15,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  statItem: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  statLabel: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#e5e7eb',
  },
  actionButton: {
    width: '100%',
    borderColor: '#667eea',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  followButton: {
    flex: 1,
    backgroundColor: '#667eea',
  },
  messageButton: {
    flex: 1,
    borderColor: '#667eea',
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#667eea',
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#6b7280',
  },
  tabTextActive: {
    color: '#667eea',
  },
  content: {
    padding: 16,
  },
  postsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  photoItem: {
    width: '32.5%',
    aspectRatio: 1,
    borderRadius: 4,
    overflow: 'hidden',
  },
  photoImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f0f2f5',
  },
  albumsGrid: {
    gap: 12,
  },
  albumCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  albumCover: {
    width: '100%',
    height: 200,
    backgroundColor: '#f0f2f5',
  },
  albumPlaceholder: {
    width: '100%',
    height: 200,
    backgroundColor: '#f0f2f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  albumInfo: {
    padding: 16,
  },
  albumName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  albumCount: {
    fontSize: 13,
    color: '#6b7280',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 12,
  },
});
