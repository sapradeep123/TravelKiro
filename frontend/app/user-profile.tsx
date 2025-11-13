import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  RefreshControl,
  useWindowDimensions,
} from 'react-native';
import { Text, Avatar, ActivityIndicator, Chip, Card } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { communityService } from '../src/services/communityService';

// Sample friends data
const SAMPLE_FRIENDS = [
  { id: '1', name: 'Brooklyn Simmons', avatar: 'BS' },
  { id: '2', name: 'Alisa Flores', avatar: 'AF' },
  { id: '3', name: 'Darrell Steward', avatar: 'DS' },
  { id: '4', name: 'Christina Guzman', avatar: 'CG' },
  { id: '5', name: 'Joann Holmes', avatar: 'JH' },
  { id: '6', name: 'Francisco Perry', avatar: 'FP' },
];

export default function UserProfileScreen() {
  const params = useLocalSearchParams();
  const userId = Array.isArray(params.userId) ? params.userId[0] : params.userId;
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  
  // Initialize all state with proper default values
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [userPosts, setUserPosts] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'posts' | 'community'>('posts');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      setError('No user ID provided');
      return;
    }

    let cancelled = false;
    
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Load user profile
        const profile = await communityService.getUserProfile(userId);
        if (cancelled) return;
        
        if (profile) {
          setUserProfile(profile);
        } else {
          setError('Profile not found');
        }
        
        // Load user posts
        const postsData = await communityService.getUserPosts(userId, 1);
        if (cancelled) return;
        
        if (postsData && postsData.data && Array.isArray(postsData.data)) {
          setUserPosts(postsData.data);
        } else {
          setUserPosts([]);
        }
        
      } catch (err: any) {
        if (cancelled) return;
        console.error('Error loading user data:', err);
        setError(err?.message || 'Failed to load user data');
        setUserProfile(null);
        setUserPosts([]);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      cancelled = true;
    };
  }, [userId]);

  const handleRefresh = async () => {
    if (!userId) return;
    
    setRefreshing(true);
    try {
      // Load user profile with stats
      const profileData = await communityService.getUserProfile(userId);
      setUserProfile(profileData);
      
      // Load user posts
      const postsResponse = await communityService.getUserPosts(userId, 1);
      const posts = postsResponse?.data || [];
      setUserPosts(Array.isArray(posts) ? posts : []);
    } catch (error) {
      console.error('Error refreshing user data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  if (!userId || error) {
    return (
      <View style={styles.loadingContainer}>
        <MaterialCommunityIcons name="alert-circle" size={64} color="#FF6B6B" />
        <Text style={styles.errorText}>{error || 'No user ID provided'}</Text>
        <TouchableOpacity 
          onPress={() => router.push('/(tabs)/community')} 
          style={styles.backToHomeButton}
        >
          <Text style={styles.backToHomeText}>Go to Community</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#667eea" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }
  
  if (!userProfile) {
    return (
      <View style={styles.loadingContainer}>
        <MaterialCommunityIcons name="account-off" size={64} color="#9ca3af" />
        <Text style={styles.errorText}>Profile not found</Text>
        <TouchableOpacity 
          onPress={() => router.push('/(tabs)/community')} 
          style={styles.backToHomeButton}
        >
          <Text style={styles.backToHomeText}>Go to Community</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const userName = userProfile?.name || 'User';
  const userBio = userProfile?.bio || 'Travel enthusiast';
  const userAvatar = userProfile?.avatar;
  const userInitials = userName.substring(0, 2).toUpperCase();

  // Get all stats from database
  const followersCount = userProfile?.followerCount || 0;
  const postsCount = userProfile?.postCount || 0;
  const likesCount = Array.isArray(userPosts) 
    ? userPosts.reduce((total, post) => {
        const postLikes = Array.isArray(post?.likes) ? post.likes.length : 0;
        return total + postLikes;
      }, 0)
    : 0;

  // Responsive design
  const isLargeScreen = width >= 1024;



  return (
    <View style={styles.container}>
      {/* Butterfliy Header - Desktop/Tablet */}
      {!isMobile && (
        <View style={styles.appHeader}>
          <View style={styles.headerLeft}>
            <View style={styles.logoContainer}>
              <Text style={styles.logoEmoji}>🦋</Text>
            </View>
            <Text style={styles.appName}>Butterfliy</Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.headerIcon} onPress={() => router.push('/(tabs)/locations')}>
              <MaterialCommunityIcons name="map-marker" size={20} color="#667eea" />
              <Text style={styles.headerIconText}>Locations</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerIcon} onPress={() => router.push('/(tabs)/events')}>
              <MaterialCommunityIcons name="calendar" size={20} color="#667eea" />
              <Text style={styles.headerIconText}>Events</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerIcon} onPress={() => router.push('/(tabs)/packages')}>
              <MaterialCommunityIcons name="package-variant" size={20} color="#667eea" />
              <Text style={styles.headerIconText}>Packages</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerIcon} onPress={() => router.push('/(tabs)/accommodations')}>
              <MaterialCommunityIcons name="bed" size={20} color="#667eea" />
              <Text style={styles.headerIconText}>Accommodations</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerIcon} onPress={() => router.push('/(tabs)/community')}>
              <MaterialCommunityIcons name="account-group" size={20} color="#667eea" />
              <Text style={styles.headerIconText}>Community</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerIcon} onPress={() => router.push('/(tabs)/travel')}>
              <MaterialCommunityIcons name="airplane" size={20} color="#667eea" />
              <Text style={styles.headerIconText}>Travel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.userButton}>
              <Avatar.Text size={36} label={userInitials} style={styles.headerAvatar} />
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{userName}</Text>
                <Text style={styles.userRole}>Administrator</Text>
              </View>
              <MaterialCommunityIcons name="chevron-down" size={20} color="#6b7280" />
            </TouchableOpacity>
          </View>
        </View>
      )}



      {/* Mobile Header */}
      {!isLargeScreen && (
        <View style={styles.mobileHeader}>
          <TouchableOpacity 
            onPress={() => {
              if (router.canGoBack()) {
                router.back();
              } else {
                router.push('/(tabs)/community');
              }
            }}
          >
            <MaterialCommunityIcons name="arrow-left" size={24} color="#667eea" />
          </TouchableOpacity>
          <Text style={styles.mobileHeaderTitle}>Profile</Text>
          <View style={{ width: 24 }} />
        </View>
      )}

      {/* Two Column Layout - Desktop / Single Column - Mobile */}
      <View style={[styles.mainContainer, !isLargeScreen && styles.mobileMainContainer]}>
        {/* Left Sidebar - Profile Info (Desktop) / Top Section (Mobile) */}
        {isLargeScreen && (
          <View style={styles.leftProfileSidebar}>
          <ScrollView 
            showsVerticalScrollIndicator={false}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
          >
            {/* Back Button */}
            <TouchableOpacity 
              onPress={() => {
                if (router.canGoBack()) {
                  router.back();
                } else {
                  router.push('/(tabs)/community');
                }
              }} 
              style={styles.backButton}
            >
              <MaterialCommunityIcons name="arrow-left" size={20} color="#667eea" />
              <Text style={styles.backButtonTextNew}>Back</Text>
            </TouchableOpacity>

            {/* Profile Avatar */}
            <View style={styles.profileAvatarSection}>
              {userAvatar ? (
                <Avatar.Image
                  size={120}
                  source={{ uri: userAvatar }}
                  style={styles.profileAvatar}
                />
              ) : (
                <Avatar.Text
                  size={120}
                  label={userInitials}
                  style={styles.profileAvatar}
                />
              )}
            </View>

            {/* Profile Name */}
            <View style={styles.profileNameSection}>
              <View style={styles.profileNameRow}>
                <Text style={styles.profileName}>{userName}</Text>
                <MaterialCommunityIcons name="fire" size={20} color="#FF6B6B" />
              </View>
              <Text style={styles.profileBio}>{userBio}</Text>
            </View>

            {/* Stats - Vertical Layout */}
            <View style={styles.statsColumn}>
              <View style={styles.statItemVertical}>
                <Text style={styles.statNumberLarge}>{postsCount}</Text>
                <Text style={styles.statLabelLarge}>Posts</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItemVertical}>
                <Text style={styles.statNumberLarge}>{followersCount}</Text>
                <Text style={styles.statLabelLarge}>Followers</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItemVertical}>
                <Text style={styles.statNumberLarge}>{userProfile?.followingCount || 0}</Text>
                <Text style={styles.statLabelLarge}>Following</Text>
              </View>
            </View>

            {/* Follow Button */}
            <TouchableOpacity style={styles.followButton}>
              <MaterialCommunityIcons name="account-plus" size={20} color="#fff" />
              <Text style={styles.followButtonText}>Follow</Text>
            </TouchableOpacity>

            {/* Additional Info */}
            <View style={styles.additionalInfo}>
              <View style={styles.infoRow}>
                <MaterialCommunityIcons name="heart" size={18} color="#9ca3af" />
                <Text style={styles.infoText}>{likesCount} total likes</Text>
              </View>
              <View style={styles.infoRow}>
                <MaterialCommunityIcons name="calendar" size={18} color="#9ca3af" />
                <Text style={styles.infoText}>Joined {new Date(userProfile?.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</Text>
              </View>
            </View>
          </ScrollView>
        </View>
        )}

        {/* Mobile Profile Section */}
        {!isLargeScreen && (
          <ScrollView 
            style={styles.mobileScrollView}
            showsVerticalScrollIndicator={false}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
          >
            {/* Profile Header */}
            <View style={styles.mobileProfileHeader}>
              {/* Avatar and Stats Row */}
              <View style={styles.mobileAvatarRow}>
                {userAvatar ? (
                  <Avatar.Image
                    size={80}
                    source={{ uri: userAvatar }}
                    style={styles.mobileAvatar}
                  />
                ) : (
                  <Avatar.Text
                    size={80}
                    label={userInitials}
                    style={styles.mobileAvatar}
                  />
                )}
                
                <View style={styles.mobileStatsRow}>
                  <View style={styles.mobileStatItem}>
                    <Text style={styles.mobileStatNumber}>{postsCount}</Text>
                    <Text style={styles.mobileStatLabel}>Posts</Text>
                  </View>
                  <View style={styles.mobileStatItem}>
                    <Text style={styles.mobileStatNumber}>{followersCount}</Text>
                    <Text style={styles.mobileStatLabel}>Followers</Text>
                  </View>
                  <View style={styles.mobileStatItem}>
                    <Text style={styles.mobileStatNumber}>{userProfile?.followingCount || 0}</Text>
                    <Text style={styles.mobileStatLabel}>Following</Text>
                  </View>
                </View>
              </View>

              {/* Name and Bio */}
              <View style={styles.mobileNameSection}>
                <View style={styles.mobileNameRow}>
                  <Text style={styles.mobileName}>{userName}</Text>
                  <MaterialCommunityIcons name="fire" size={18} color="#FF6B6B" />
                </View>
                <Text style={styles.mobileBio}>{userBio}</Text>
              </View>

              {/* Follow Button */}
              <TouchableOpacity style={styles.mobileFollowButton}>
                <MaterialCommunityIcons name="account-plus" size={18} color="#fff" />
                <Text style={styles.mobileFollowButtonText}>Follow</Text>
              </TouchableOpacity>
            </View>

            {/* Posts Section */}
            <View style={styles.mobilePostsSection}>
              <Text style={styles.mobilePostsTitle}>Posts</Text>
              {userPosts.length === 0 ? (
                <View style={styles.emptyState}>
                  <MaterialCommunityIcons name="post-outline" size={64} color="#ccc" />
                  <Text style={styles.emptyText}>No posts yet</Text>
                </View>
              ) : (
                <View style={styles.mobilePostsGrid}>
                  {userPosts.map((post) => (
                    <Card key={post.id} style={styles.mobilePostCard}>
                      {post.mediaUrls && post.mediaUrls.length > 0 && (
                        <Image 
                          source={{ uri: post.mediaUrls[0] }} 
                          style={styles.mobilePostImage}
                          resizeMode="cover"
                        />
                      )}
                      <Card.Content style={styles.mobilePostContent}>
                        <Text style={styles.mobilePostTitle} numberOfLines={2}>
                          {post.caption || 'My travel post'}
                        </Text>
                        <View style={styles.mobilePostFooter}>
                          <View style={styles.mobilePostStat}>
                            <MaterialCommunityIcons name="heart" size={14} color="#FF6B6B" />
                            <Text style={styles.mobilePostStatText}>{post.likes?.length || 0}</Text>
                          </View>
                          <View style={styles.mobilePostStat}>
                            <MaterialCommunityIcons name="comment" size={14} color="#667eea" />
                            <Text style={styles.mobilePostStatText}>{post.commentCount || 0}</Text>
                          </View>
                        </View>
                      </Card.Content>
                    </Card>
                  ))}
                </View>
              )}
            </View>
          </ScrollView>
        )}

        {/* Right Content - Posts (Desktop Only) */}
        {isLargeScreen && (
          <View style={styles.rightPostsContent}>
          <ScrollView 
            showsVerticalScrollIndicator={false}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
          >
            {/* Posts Header */}
            <View style={styles.postsHeader}>
              <Text style={styles.postsHeaderTitle}>Posts</Text>
              <View style={styles.sortContainer}>
                <Text style={styles.sortLabel}>Sort by:</Text>
                <TouchableOpacity style={styles.sortButton}>
                  <Text style={styles.sortText}>Most Recent</Text>
                  <MaterialCommunityIcons name="chevron-down" size={18} color="#6b7280" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Posts Grid */}
            {userPosts.length === 0 ? (
              <View style={styles.emptyState}>
                <MaterialCommunityIcons name="post-outline" size={64} color="#ccc" />
                <Text style={styles.emptyText}>No posts yet</Text>
              </View>
            ) : (
              <View style={styles.postsGrid}>
                {userPosts.map((post) => (
                  <Card key={post.id} style={styles.postCard}>
                    {post.mediaUrls && post.mediaUrls.length > 0 && (
                      <Image 
                        source={{ uri: post.mediaUrls[0] }} 
                        style={styles.postCardImage}
                        resizeMode="cover"
                      />
                    )}
                    <Card.Content style={styles.postCardContent}>
                      <View style={styles.postCardHeader}>
                        <Text style={styles.postCardTitle} numberOfLines={2}>
                          {post.caption || 'My travel post'}
                        </Text>
                        <Text style={styles.postCardTime}>
                          {new Date(post.createdAt).toLocaleDateString('en-US', { 
                            month: 'short',
                            day: 'numeric'
                          })}
                        </Text>
                      </View>
                      <View style={styles.postCardFooter}>
                        <View style={styles.postCardStat}>
                          <MaterialCommunityIcons name="heart" size={16} color="#FF6B6B" />
                          <Text style={styles.postCardStatText}>{post.likes?.length || 0}</Text>
                        </View>
                        <View style={styles.postCardStat}>
                          <MaterialCommunityIcons name="comment" size={16} color="#667eea" />
                          <Text style={styles.postCardStatText}>{post.commentCount || 0}</Text>
                        </View>
                        <View style={styles.postCardStat}>
                          <MaterialCommunityIcons name="bookmark" size={16} color="#f59e0b" />
                          <Text style={styles.postCardStatText}>{post.saveCount || 0}</Text>
                        </View>
                      </View>
                    </Card.Content>
                  </Card>
                ))}
              </View>
            )}
          </ScrollView>
        </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
  },
  mainContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  leftProfileSidebar: {
    width: 320,
    backgroundColor: '#fff',
    borderRightWidth: 1,
    borderRightColor: '#e5e7eb',
    padding: 24,
  },
  rightPostsContent: {
    flex: 1,
    backgroundColor: '#fafafa',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 24,
    paddingVertical: 8,
  },
  backButtonTextNew: {
    fontSize: 14,
    color: '#667eea',
    fontWeight: '600',
  },
  profileAvatarSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  profileNameSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  statsColumn: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  statItemVertical: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  statNumberLarge: {
    fontSize: 32,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 4,
  },
  statLabelLarge: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '600',
  },
  statDivider: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginVertical: 8,
  },
  followButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#667eea',
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 24,
    elevation: 2,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  followButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  additionalInfo: {
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoText: {
    fontSize: 13,
    color: '#6b7280',
  },
  postsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  postsHeaderTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
  },
  postsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 16,
  },
  postCard: {
    width: '31%',
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
  postCardImage: {
    width: '100%',
    height: 200,
    backgroundColor: '#e5e7eb',
  },
  postCardContent: {
    padding: 12,
  },
  postCardHeader: {
    marginBottom: 12,
  },
  postCardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  postCardTime: {
    fontSize: 11,
    color: '#9ca3af',
  },
  postCardFooter: {
    flexDirection: 'row',
    gap: 16,
  },
  postCardStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  postCardStatText: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 12,
  },
  sortContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sortLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  sortText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111827',
  },
  appHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoContainer: {
    width: 40,
    height: 40,
    backgroundColor: '#667eea',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  logoEmoji: {
    fontSize: 20,
  },
  appName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#667eea',
    letterSpacing: -0.5,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  headerIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  headerIconText: {
    fontSize: 13,
    color: '#6b7280',
    fontWeight: '600',
  },
  userButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingLeft: 16,
    borderLeftWidth: 1,
    borderLeftColor: '#e5e7eb',
  },
  headerAvatar: {
    backgroundColor: '#667eea',
  },
  userInfo: {
    alignItems: 'flex-start',
  },
  userName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  userRole: {
    fontSize: 11,
    color: '#9ca3af',
  },
  profileAvatar: {
    backgroundColor: '#667eea',
    elevation: 4,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  profileNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  profileName: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111827',
    letterSpacing: -0.5,
  },
  profileBio: {
    fontSize: 13,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 18,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fafafa',
  },
  loadingText: {
    marginTop: 12,
    color: '#6b7280',
    fontSize: 14,
  },
  errorText: {
    marginTop: 12,
    color: '#FF6B6B',
    fontSize: 16,
    fontWeight: '600',
  },
  backToHomeButton: {
    marginTop: 20,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#667eea',
    borderRadius: 8,
  },
  backToHomeText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  // Mobile Styles
  mobileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  mobileHeaderTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  mobileMainContainer: {
    flexDirection: 'column',
  },
  mobileScrollView: {
    flex: 1,
    backgroundColor: '#fafafa',
  },
  mobileProfileHeader: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  mobileAvatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  mobileAvatar: {
    backgroundColor: '#667eea',
    marginRight: 20,
  },
  mobileStatsRow: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  mobileStatItem: {
    alignItems: 'center',
  },
  mobileStatNumber: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 2,
  },
  mobileStatLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  mobileNameSection: {
    marginBottom: 16,
  },
  mobileNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  mobileName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  mobileBio: {
    fontSize: 13,
    color: '#6b7280',
    lineHeight: 18,
  },
  mobileFollowButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#667eea',
    paddingVertical: 10,
    borderRadius: 8,
  },
  mobileFollowButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  mobilePostsSection: {
    padding: 16,
  },
  mobilePostsTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 16,
  },
  mobilePostsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  mobilePostCard: {
    width: '48%',
    marginBottom: 0,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  mobilePostImage: {
    width: '100%',
    height: 140,
    backgroundColor: '#e5e7eb',
  },
  mobilePostContent: {
    padding: 10,
  },
  mobilePostTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  mobilePostFooter: {
    flexDirection: 'row',
    gap: 12,
  },
  mobilePostStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  mobilePostStatText: {
    fontSize: 11,
    color: '#6b7280',
    fontWeight: '600',
  },
});
