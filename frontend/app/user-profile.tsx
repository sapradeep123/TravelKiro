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
    let isMounted = true;
    let timeoutId: any;
    
    const fetchData = async () => {
      if (!userId) {
        if (isMounted) {
          setLoading(false);
          setError('No user ID provided');
        }
        return;
      }

      try {
        if (!isMounted) return;
        
        setLoading(true);
        setError(null);
        
        // Load user profile with stats
        try {
          const profileData = await communityService.getUserProfile(userId);
          if (isMounted && profileData) {
            setUserProfile(profileData);
          }
        } catch (profileError) {
          console.error('Error loading profile:', profileError);
          if (isMounted) {
            setError('Failed to load profile');
          }
        }
        
        // Load user posts
        try {
          const postsResponse = await communityService.getUserPosts(userId, 1);
          if (isMounted) {
            const posts = postsResponse?.data;
            if (Array.isArray(posts)) {
              setUserPosts(posts);
            } else {
              setUserPosts([]);
            }
          }
        } catch (postsError) {
          console.error('Error loading posts:', postsError);
          if (isMounted) {
            setUserPosts([]);
          }
        }

      } catch (error: any) {
        console.error('Error loading user data:', error);
        if (isMounted) {
          setError(error?.message || 'Failed to load user data');
          setUserProfile(null);
          setUserPosts([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    // Small delay to ensure component is mounted
    timeoutId = setTimeout(() => {
      if (isMounted) {
        fetchData();
      }
    }, 50);

    return () => {
      isMounted = false;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
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
      {isMobile && (
        <View style={styles.mobileHeader}>
          <View style={styles.mobileHeaderContent}>
            <View style={styles.logoContainer}>
              <Text style={styles.logoEmoji}>🦋</Text>
            </View>
            <Text style={styles.appName}>Butterfliy</Text>
          </View>
          <TouchableOpacity style={styles.headerIcon} onPress={() => router.push('/(tabs)/locations')}>
            <MaterialCommunityIcons name="map-marker" size={20} color="#667eea" />
            <Text style={styles.headerIconText}>Locations</Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView
        style={styles.scrollView}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
      >

        {/* Cover Photo with Back Button and Profile Avatar */}
        <View style={styles.coverSection}>
          <Image 
            source={{ uri: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200' }}
            style={styles.coverImage}
          />
          {/* Back Button Overlay */}
          <TouchableOpacity 
            onPress={() => {
              if (router.canGoBack()) {
                router.back();
              } else {
                router.push('/(tabs)/community');
              }
            }} 
            style={styles.backButtonOverlay}
          >
            <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
            <Text style={styles.backButtonText}>Back to</Text>
          </TouchableOpacity>
          
          <View style={styles.profileAvatarContainer}>
            {userAvatar ? (
              <Avatar.Image
                size={100}
                source={{ uri: userAvatar }}
                style={styles.profileAvatar}
              />
            ) : (
              <Avatar.Text
                size={100}
                label={userInitials}
                style={styles.profileAvatar}
              />
            )}
          </View>
        </View>

        {/* Profile Info */}
        <View style={styles.profileInfo}>
          <View style={styles.profileNameRow}>
            <MaterialCommunityIcons name="fire" size={20} color="#FF6B6B" />
            <Text style={styles.profileName}>{userName}</Text>
          </View>
          <Text style={styles.profileBio}>{userBio}</Text>

          {/* Stats - Horizontal Layout */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <MaterialCommunityIcons name="account-group" size={24} color="#9ca3af" />
              <Text style={styles.statNumber}>{followersCount}</Text>
              <Text style={styles.statLabel}>followers</Text>
            </View>
            <View style={styles.statItem}>
              <MaterialCommunityIcons name="image-multiple" size={24} color="#9ca3af" />
              <Text style={styles.statNumber}>{postsCount}</Text>
              <Text style={styles.statLabel}>posts</Text>
            </View>
            <View style={styles.statItem}>
              <MaterialCommunityIcons name="heart" size={24} color="#9ca3af" />
              <Text style={styles.statNumber}>{likesCount}</Text>
              <Text style={styles.statLabel}>likes</Text>
            </View>
          </View>
        </View>

        {/* Navigation Tabs */}
        <View style={styles.navTabs}>
          <TouchableOpacity
            style={[styles.navTab, activeTab === 'posts' && styles.navTabActive]}
            onPress={() => setActiveTab('posts')}
          >
            <Text style={[styles.navTabText, activeTab === 'posts' && styles.navTabTextActive]}>
              Posts
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.navTab, activeTab === 'community' && styles.navTabActive]}
            onPress={() => setActiveTab('community')}
          >
            <View style={styles.navTabWithBadge}>
              <Text style={[styles.navTabText, activeTab === 'community' && styles.navTabTextActive]}>
                Community
              </Text>
              {postsCount > 0 && (
                <View style={styles.tabBadge}>
                  <Text style={styles.tabBadgeText}>{postsCount}</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        </View>

        {/* Content Layout - Responsive */}
        {isMobile ? (
          /* Mobile Layout - Single Column */
          <View style={styles.mobileContent}>
            {/* Posts Content */}
            <View style={styles.postsContent}>
              {activeTab === 'community' ? (
                <View style={styles.emptyState}>
                  <MaterialCommunityIcons name="account-group" size={64} color="#ccc" />
                  <Text style={styles.emptyText}>No community activity yet</Text>
                </View>
              ) : userPosts.length === 0 ? (
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
                          style={styles.postCardImage}
                          resizeMode="cover"
                        />
                      )}
                      <Card.Content style={styles.postCardContent}>
                        <Text style={styles.postCardTitle} numberOfLines={2}>
                          {post.caption || 'My travel post'}
                        </Text>
                        <View style={styles.postCardFooter}>
                          <View style={styles.postCardStat}>
                            <MaterialCommunityIcons name="heart-outline" size={16} color="#9ca3af" />
                            <Text style={styles.postCardStatText}>{post.likes?.length || 0}</Text>
                          </View>
                          <View style={styles.postCardStat}>
                            <MaterialCommunityIcons name="bookmark-outline" size={16} color="#9ca3af" />
                            <Text style={styles.postCardStatText}>{post.saves || 0}</Text>
                          </View>
                        </View>
                      </Card.Content>
                    </Card>
                  ))}
                </View>
              )}
            </View>

            {/* Friends Section - Mobile */}
            <View style={styles.mobileFriendsSection}>
              <View style={styles.friendsHeader}>
                <Text style={styles.friendsTitle}>Friends</Text>
                <TouchableOpacity>
                  <Text style={styles.viewAllText}>View All</Text>
                </TouchableOpacity>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {SAMPLE_FRIENDS.map((friend) => (
                  <TouchableOpacity key={friend.id} style={styles.mobileFriendItem}>
                    <Avatar.Text size={56} label={friend.avatar} style={styles.friendAvatar} />
                    <Text style={styles.friendName} numberOfLines={1}>{friend.name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        ) : (
          /* Desktop/Tablet Layout - Two Columns */
          <View style={styles.mainLayout}>
            {/* Left Sidebar - Friends */}
            <View style={styles.leftSidebar}>
              <View style={styles.friendsSection}>
                <View style={styles.friendsHeader}>
                  <Text style={styles.friendsTitle}>Friends</Text>
                  <TouchableOpacity>
                    <Text style={styles.viewAllText}>View All</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.friendsGrid}>
                  {SAMPLE_FRIENDS.map((friend) => (
                    <TouchableOpacity key={friend.id} style={styles.friendGridItem}>
                      <Avatar.Text size={56} label={friend.avatar} style={styles.friendAvatar} />
                      <Text style={styles.friendName} numberOfLines={1}>{friend.name}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>

            {/* Right Content - Posts */}
            <View style={styles.rightContent}>
              {/* Sort Dropdown */}
              <View style={styles.sortContainer}>
                <Text style={styles.sortLabel}>Sort by:</Text>
                <TouchableOpacity style={styles.sortButton}>
                  <Text style={styles.sortText}>Most popular</Text>
                  <MaterialCommunityIcons name="chevron-down" size={20} color="#6b7280" />
                </TouchableOpacity>
              </View>

              {/* Posts Content */}
              <View style={styles.postsContent}>
                {activeTab === 'community' ? (
                  <View style={styles.emptyState}>
                    <MaterialCommunityIcons name="account-group" size={64} color="#ccc" />
                    <Text style={styles.emptyText}>No community activity yet</Text>
                  </View>
                ) : userPosts.length === 0 ? (
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
                            <View style={styles.postCardTitleRow}>
                              <Text style={styles.postCardTitle} numberOfLines={1}>
                                {post.caption || 'My travel post'}
                              </Text>
                              {post.isPremium && (
                                <Chip style={styles.premiumBadge} textStyle={styles.premiumText}>
                                  Premium
                                </Chip>
                              )}
                            </View>
                            <Text style={styles.postCardTime}>
                              {new Date(post.createdAt).toLocaleDateString('en-US', { 
                                hour: 'numeric', 
                                minute: '2-digit',
                                hour12: true 
                              })}
                            </Text>
                          </View>
                          <Text style={styles.postCardDescription} numberOfLines={2}>
                            {post.caption || 'Exploring beautiful destinations...'}
                          </Text>
                          <View style={styles.postCardFooter}>
                            <View style={styles.postCardStat}>
                              <MaterialCommunityIcons name="heart-outline" size={16} color="#9ca3af" />
                              <Text style={styles.postCardStatText}>{post.likes?.length || 0} likes</Text>
                            </View>
                            <View style={styles.postCardStat}>
                              <MaterialCommunityIcons name="bookmark-outline" size={16} color="#9ca3af" />
                              <Text style={styles.postCardStatText}>{post.saves || 0} saved</Text>
                            </View>
                          </View>
                        </Card.Content>
                      </Card>
                    ))}
                  </View>
                )}
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
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
  scrollView: {
    flex: 1,
  },
  coverSection: {
    position: 'relative',
    height: 200,
    marginTop: 0,
  },
  coverImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#e5e7eb',
  },
  backButtonOverlay: {
    position: 'absolute',
    top: 16,
    left: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  profileAvatarContainer: {
    position: 'absolute',
    bottom: -50,
    left: 24,
    borderWidth: 5,
    borderColor: '#fff',
    borderRadius: 55,
    backgroundColor: '#fff',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    overflow: 'hidden',
  },
  profileAvatar: {
    backgroundColor: '#667eea',
    borderRadius: 50,
  },
  profileInfo: {
    backgroundColor: '#fff',
    paddingTop: 64,
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  profileNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  profileName: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111827',
    letterSpacing: -0.5,
  },
  profileBio: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 32,
    lineHeight: 20,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
    gap: 4,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
  },
  statLabel: {
    fontSize: 12,
    color: '#9ca3af',
    textTransform: 'lowercase',
  },
  navTabs: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingHorizontal: 24,
  },
  navTab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  navTabActive: {
    borderBottomColor: '#667eea',
  },
  navTabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9ca3af',
  },
  navTabTextActive: {
    color: '#667eea',
    fontWeight: '700',
  },
  navTabWithBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  tabBadge: {
    backgroundColor: '#FF6B6B',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: 'center',
  },
  tabBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  mainLayout: {
    flexDirection: 'row',
    backgroundColor: '#fafafa',
    padding: 16,
    gap: 16,
  },
  leftSidebar: {
    width: 280,
  },
  rightContent: {
    flex: 1,
  },
  sortContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    gap: 8,
  },
  sortLabel: {
    fontSize: 13,
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
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  postsContent: {
    flex: 1,
  },
  postsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  postCard: {
    width: '48%',
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#fff',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  postCardImage: {
    width: '100%',
    height: 220,
    backgroundColor: '#e5e7eb',
  },
  postCardContent: {
    padding: 14,
  },
  postCardHeader: {
    marginBottom: 8,
  },
  postCardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  postCardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    flex: 1,
  },
  premiumBadge: {
    backgroundColor: '#FF6B6B',
    height: 24,
  },
  premiumText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  postCardTime: {
    fontSize: 12,
    color: '#9ca3af',
  },
  postCardDescription: {
    fontSize: 13,
    color: '#6b7280',
    lineHeight: 18,
    marginBottom: 12,
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
    color: '#9ca3af',
  },
  friendsSection: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
  },
  friendsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  friendsTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
    letterSpacing: -0.5,
  },
  viewAllText: {
    fontSize: 13,
    color: '#667eea',
    fontWeight: '700',
  },
  friendsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  friendGridItem: {
    alignItems: 'center',
    width: '45%',
  },
  friendAvatar: {
    backgroundColor: '#667eea',
    marginBottom: 8,
  },
  friendName: {
    fontSize: 12,
    color: '#111827',
    textAlign: 'center',
    fontWeight: '600',
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
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  mobileHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  mobileContent: {
    flex: 1,
  },
  mobilePostsGrid: {
    padding: 12,
  },
  mobilePostCard: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  mobileFriendsSection: {
    backgroundColor: '#fff',
    padding: 16,
    marginTop: 8,
  },
  mobileFriendItem: {
    alignItems: 'center',
    marginRight: 16,
    width: 70,
  },
});
