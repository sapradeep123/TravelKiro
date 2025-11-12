import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Text } from 'react-native-paper';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { communityService, UserProfile, Post } from '../../src/services/communityService';
import { useAuth } from '../../src/contexts/AuthContext';
import ProfileHeader from './ProfileHeader';
import PostGrid from './PostGrid';

export default function UserProfileScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const params = useLocalSearchParams();
  
  // Get userId from params, default to current user
  const userId = (params.userId as string) || user?.id || '';
  const isOwnProfile = userId === user?.id;

  // State management
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Load profile and posts on mount
  useEffect(() => {
    loadProfile();
    loadPosts(true);
  }, [userId]);

  /**
   * Load user profile data
   */
  const loadProfile = async () => {
    try {
      const profileData = await communityService.getUserProfile(userId);
      setProfile(profileData);
    } catch (error: any) {
      console.error('Error loading profile:', error);
      
      // Handle specific error cases
      if (error.response?.status === 403) {
        Alert.alert('Access Denied', 'You do not have permission to view this profile.');
      } else if (error.response?.status === 404) {
        Alert.alert('Not Found', 'This user profile does not exist.');
      } else {
        Alert.alert('Error', 'Failed to load profile. Please try again.');
      }
    }
  };

  /**
   * Load user posts with pagination
   */
  const loadPosts = async (reset: boolean = false) => {
    try {
      if (reset) {
        setLoading(true);
        setCurrentPage(1);
        setHasMore(true);
      }

      const page = reset ? 1 : currentPage;
      const response = await communityService.getUserPosts(userId, page);

      if (reset) {
        setPosts(response.data);
      } else {
        setPosts((prev) => [...prev, ...response.data]);
      }

      setHasMore(page < response.pagination.totalPages);
    } catch (error: any) {
      console.error('Error loading posts:', error);
      
      // Handle private profile case
      if (error.response?.status === 403) {
        // Profile is private and user doesn't have access
        setPosts([]);
      } else {
        Alert.alert('Error', 'Failed to load posts. Please try again.');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  };

  /**
   * Handle pull-to-refresh
   */
  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    loadProfile();
    loadPosts(true);
  }, [userId]);

  /**
   * Handle infinite scroll - load more posts
   */
  const handleLoadMore = useCallback(() => {
    if (!loadingMore && hasMore && !loading) {
      setLoadingMore(true);
      setCurrentPage((prev) => prev + 1);
      loadPosts(false);
    }
  }, [loadingMore, hasMore, loading, currentPage]);

  /**
   * Handle follow/unfollow action
   */
  const handleFollowPress = async () => {
    if (!profile) return;

    try {
      if (profile.isFollowing) {
        await communityService.unfollowUser(userId);
        setProfile({
          ...profile,
          isFollowing: false,
          followerCount: profile.followerCount - 1,
        });
        Alert.alert('Success', `You unfollowed ${profile.name}`);
      } else if (profile.hasRequestedFollow) {
        // Cancel follow request (not implemented in backend yet)
        Alert.alert('Info', 'Follow request already sent');
      } else {
        await communityService.followUser(userId);
        
        if (profile.isPrivate) {
          setProfile({
            ...profile,
            hasRequestedFollow: true,
          });
          Alert.alert('Request Sent', `Follow request sent to ${profile.name}`);
        } else {
          setProfile({
            ...profile,
            isFollowing: true,
            followerCount: profile.followerCount + 1,
          });
          Alert.alert('Success', `You are now following ${profile.name}`);
        }
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
      Alert.alert('Error', 'Failed to update follow status. Please try again.');
    }
  };

  /**
   * Handle edit profile action
   */
  const handleEditPress = () => {
    router.push('/(tabs)/profile-edit');
  };

  /**
   * Handle block user action
   */
  const handleBlockPress = async () => {
    if (!profile) return;

    try {
      await communityService.blockUser(userId);
      setProfile({
        ...profile,
        isBlocked: true,
        isFollowing: false,
      });
      Alert.alert('Success', `You have blocked ${profile.name}`);
    } catch (error) {
      console.error('Error blocking user:', error);
      Alert.alert('Error', 'Failed to block user. Please try again.');
    }
  };

  /**
   * Handle unblock user action
   */
  const handleUnblockPress = async () => {
    if (!profile) return;

    try {
      await communityService.unblockUser(userId);
      setProfile({
        ...profile,
        isBlocked: false,
      });
      Alert.alert('Success', `You have unblocked ${profile.name}`);
    } catch (error) {
      console.error('Error unblocking user:', error);
      Alert.alert('Error', 'Failed to unblock user. Please try again.');
    }
  };

  /**
   * Handle mute user action
   */
  const handleMutePress = async () => {
    if (!profile) return;

    try {
      await communityService.muteUser(userId);
      setProfile({
        ...profile,
        isMuted: true,
      });
      Alert.alert('Success', `You have muted ${profile.name}`);
    } catch (error) {
      console.error('Error muting user:', error);
      Alert.alert('Error', 'Failed to mute user. Please try again.');
    }
  };

  /**
   * Handle unmute user action
   */
  const handleUnmutePress = async () => {
    if (!profile) return;

    try {
      await communityService.unmuteUser(userId);
      setProfile({
        ...profile,
        isMuted: false,
      });
      Alert.alert('Success', `You have unmuted ${profile.name}`);
    } catch (error) {
      console.error('Error unmuting user:', error);
      Alert.alert('Error', 'Failed to unmute user. Please try again.');
    }
  };

  /**
   * Handle post press - navigate to post detail
   */
  const handlePostPress = (postId: string) => {
    router.push(`/(tabs)/post-detail?id=${postId}`);
  };

  /**
   * Render loading state
   */
  if (loading && !profile) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#667eea" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  /**
   * Render error state if profile not found
   */
  if (!profile) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Profile not found</Text>
      </View>
    );
  }

  /**
   * Check if posts should be hidden (private profile without follow)
   */
  const shouldHidePosts = profile.isPrivate && !profile.isFollowing && !isOwnProfile;

  /**
   * Render footer loading indicator
   */
  const renderFooter = () => {
    if (!loadingMore) return null;

    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color="#667eea" />
        <Text style={styles.footerLoaderText}>Loading more posts...</Text>
      </View>
    );
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          colors={['#667eea']}
          tintColor="#667eea"
        />
      }
    >
      {/* Profile Header */}
      <ProfileHeader
        profile={profile}
        isOwnProfile={isOwnProfile}
        onFollowPress={handleFollowPress}
        onEditPress={handleEditPress}
        onBlockPress={handleBlockPress}
        onMutePress={handleMutePress}
        onUnblockPress={handleUnblockPress}
        onUnmutePress={handleUnmutePress}
      />

      {/* Posts Grid or Private Profile Message */}
      {shouldHidePosts ? (
        <View style={styles.privateMessage}>
          <Text style={styles.privateMessageTitle}>This Account is Private</Text>
          <Text style={styles.privateMessageSubtitle}>
            Follow this account to see their posts
          </Text>
        </View>
      ) : (
        <PostGrid
          posts={posts}
          loading={loading}
          onPostPress={handlePostPress}
          onEndReached={handleLoadMore}
          ListFooterComponent={renderFooter()}
        />
      )}
    </ScrollView>
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
    backgroundColor: '#f0f2f5',
    padding: 32,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6b7280',
  },
  errorText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
  privateMessage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 64,
    backgroundColor: '#fff',
  },
  privateMessageTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1c1e21',
    marginBottom: 8,
    textAlign: 'center',
  },
  privateMessageSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  footerLoader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    gap: 8,
  },
  footerLoaderText: {
    fontSize: 14,
    color: '#6b7280',
  },
});
