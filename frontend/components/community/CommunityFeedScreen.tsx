import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { Text, ActivityIndicator, SegmentedButtons } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { communityService, Post, FeedFilter } from '../../src/services/communityService';
import { useAuth } from '../../src/contexts/AuthContext';
import PostCard from './PostCard';
import { communityTheme } from '../../src/theme';
import { toast } from '../../src/utils/toast';
import { useIsOnline } from '../../src/hooks/useNetworkStatus';
import OfflineIndicator from '../../src/components/OfflineIndicator';
import ErrorBoundary from '../../src/components/ErrorBoundary';

type TabValue = 'global' | 'following' | 'saved';

export default function CommunityFeedScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const isOnline = useIsOnline();
  
  // State management
  const [activeTab, setActiveTab] = useState<TabValue>('global');
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Load initial feed data
  useEffect(() => {
    loadFeed(true);
  }, [activeTab]);

  /**
   * Load feed data with pagination support
   * @param reset - Whether to reset the feed (for tab changes or refresh)
   */
  const loadFeed = async (reset: boolean = false) => {
    try {
      if (reset) {
        setLoading(true);
        setCurrentPage(1);
        setHasMore(true);
      }

      const page = reset ? 1 : currentPage;
      let response;

      if (activeTab === 'saved') {
        response = await communityService.getSavedPosts(page);
      } else {
        const filter: FeedFilter = activeTab === 'global' ? 'global' : 'following';
        response = await communityService.getFeed(page, filter);
      }

      if (reset) {
        setPosts(response.data);
      } else {
        setPosts((prev) => [...prev, ...response.data]);
      }

      // Check if there are more pages
      setHasMore(page < response.pagination.totalPages);
    } catch (error: any) {
      console.error('Error loading feed:', error);
      if (!reset) {
        // Only show error toast for non-initial loads
        toast.error(error.message || 'Failed to load posts');
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
    loadFeed(true);
  }, [activeTab]);

  /**
   * Handle infinite scroll - load more posts
   */
  const handleLoadMore = useCallback(() => {
    if (!loadingMore && hasMore && !loading) {
      setLoadingMore(true);
      setCurrentPage((prev) => prev + 1);
      loadFeed(false);
    }
  }, [loadingMore, hasMore, loading, currentPage]);

  /**
   * Handle tab change
   */
  const handleTabChange = (value: string) => {
    setActiveTab(value as TabValue);
  };

  /**
   * Handle like action
   */
  const handleLike = async (postId: string) => {
    try {
      await communityService.toggleLike(postId);
      
      // Optimistically update the UI
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === postId
            ? {
                ...post,
                isLiked: !post.isLiked,
                likeCount: post.isLiked ? post.likeCount - 1 : post.likeCount + 1,
              }
            : post
        )
      );
    } catch (error: any) {
      console.error('Error toggling like:', error);
      toast.error(error.message || 'Failed to like post');
      // Revert optimistic update
      loadFeed(true);
    }
  };

  /**
   * Handle comment action - navigate to post detail
   */
  const handleComment = (postId: string) => {
    router.push(`/(tabs)/post-detail?id=${postId}`);
  };

  /**
   * Handle save action
   */
  const handleSave = async (postId: string) => {
    try {
      await communityService.toggleSave(postId);
      
      // Optimistically update the UI
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === postId
            ? {
                ...post,
                isSaved: !post.isSaved,
                saveCount: post.isSaved ? post.saveCount - 1 : post.saveCount + 1,
              }
            : post
        )
      );

      // If we're on the saved tab and unsaving, remove from list
      if (activeTab === 'saved') {
        setPosts((prevPosts) => prevPosts.filter((post) => post.id !== postId));
      }
    } catch (error: any) {
      console.error('Error toggling save:', error);
      toast.error(error.message || 'Failed to save post');
      // Revert optimistic update
      loadFeed(true);
    }
  };

  /**
   * Handle delete action
   */
  const handleDelete = async (postId: string) => {
    try {
      await communityService.deletePost(postId);
      
      // Remove from list
      setPosts((prevPosts) => prevPosts.filter((post) => post.id !== postId));
      
      toast.success('Post deleted successfully');
    } catch (error: any) {
      console.error('Error deleting post:', error);
      toast.error(error.message || 'Failed to delete post');
    }
  };

  /**
   * Handle report action
   */
  const handleReport = (postId: string) => {
    // This will be handled by the ReportModal in PostCard
    // Just a placeholder for the callback
  };

  /**
   * Submit report
   */
  const submitReport = async (postId: string, category: 'spam' | 'harassment' | 'inappropriate' | 'other') => {
    try {
      await communityService.reportPost(postId, { category });
      toast.success('Post reported. Thank you for helping keep our community safe.');
    } catch (error: any) {
      console.error('Error reporting post:', error);
      toast.error(error.message || 'Failed to report post');
    }
  };

  /**
   * Handle user press - navigate to user profile
   */
  const handleUserPress = (userId: string) => {
    router.push(`/(tabs)/user-profile?userId=${userId}`);
  };

  /**
   * Handle post press - navigate to post detail
   */
  const handlePostPress = (postId: string) => {
    router.push(`/(tabs)/post-detail?id=${postId}`);
  };

  /**
   * Handle location press - navigate to location feed
   */
  const handleLocationPress = (locationDisplay: string) => {
    // For now, just show a toast. Can be enhanced to navigate to location feed
    toast.info(`View all posts from ${locationDisplay}`);
  };

  /**
   * Handle create post button press
   */
  const handleCreatePost = () => {
    router.push('/(tabs)/post-composer');
  };

  /**
   * Render empty state based on active tab
   */
  const renderEmptyState = () => {
    let icon: any = 'post-outline';
    let title = 'No posts yet';
    let subtitle = 'Be the first to share your travel experience!';

    if (activeTab === 'following') {
      icon = 'account-multiple-outline';
      title = 'No posts from people you follow';
      subtitle = 'Follow other travelers to see their posts here';
    } else if (activeTab === 'saved') {
      icon = 'bookmark-outline';
      title = 'No saved posts';
      subtitle = 'Save posts you like to view them later';
    }

    return (
      <View style={styles.emptyState}>
        <MaterialCommunityIcons name={icon} size={80} color="#d1d5db" />
        <Text style={styles.emptyStateTitle}>{title}</Text>
        <Text style={styles.emptyStateSubtitle}>{subtitle}</Text>
        {activeTab === 'global' && (
          <TouchableOpacity style={styles.createPostButton} onPress={handleCreatePost}>
            <MaterialCommunityIcons name="plus" size={20} color="#fff" />
            <Text style={styles.createPostButtonText}>Create Post</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

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

  /**
   * Render post item
   */
  const renderPost = ({ item }: { item: Post }) => (
    <PostCard
      post={item}
      currentUserId={user?.id}
      onLike={handleLike}
      onComment={handleComment}
      onSave={handleSave}
      onDelete={handleDelete}
      onReport={handleReport}
      onUserPress={handleUserPress}
      onPostPress={handlePostPress}
      onLocationPress={handleLocationPress}
    />
  );

  // Show initial loading state
  if (loading && posts.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#667eea" />
        <Text style={styles.loadingText}>Loading posts...</Text>
      </View>
    );
  }

  return (
    <ErrorBoundary>
      <View style={styles.container}>
        <OfflineIndicator />
        
        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
        <SegmentedButtons
          value={activeTab}
          onValueChange={handleTabChange}
          buttons={[
            {
              value: 'global',
              label: 'Global',
              icon: 'earth',
            },
            {
              value: 'following',
              label: 'Following',
              icon: 'account-multiple',
            },
            {
              value: 'saved',
              label: 'Saved',
              icon: 'bookmark',
            },
          ]}
          style={styles.segmentedButtons}
        />
      </View>

      {/* Feed List */}
      <FlatList
        data={posts}
        renderItem={renderPost}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.feedContent,
          posts.length === 0 && styles.feedContentEmpty,
        ]}
        ListEmptyComponent={renderEmptyState}
        ListFooterComponent={renderFooter}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#667eea']}
            tintColor="#667eea"
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        showsVerticalScrollIndicator={false}
      />

      {/* Floating Action Button */}
      <TouchableOpacity 
        style={[styles.fab, !isOnline && styles.fabDisabled]} 
        onPress={handleCreatePost}
        disabled={!isOnline}
      >
        <MaterialCommunityIcons name="plus" size={28} color="#fff" />
      </TouchableOpacity>
      </View>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: communityTheme.colors.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: communityTheme.colors.background,
  },
  loadingText: {
    marginTop: communityTheme.spacing.md,
    fontSize: communityTheme.typography.fontSize.base,
    color: communityTheme.colors.textSecondary,
  },
  tabContainer: {
    paddingHorizontal: communityTheme.responsive({
      mobile: communityTheme.spacing.base,
      tablet: communityTheme.spacing.xl,
      desktop: communityTheme.spacing.xxl,
    }),
    paddingVertical: communityTheme.spacing.md,
    backgroundColor: communityTheme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: communityTheme.colors.border,
    ...Platform.select({
      web: {
        position: 'sticky' as any,
        top: 0,
        zIndex: communityTheme.zIndex.sticky,
      },
    }),
  },
  segmentedButtons: {
    backgroundColor: communityTheme.colors.surface,
    maxWidth: communityTheme.responsive({
      mobile: '100%' as any,
      tablet: 600 as any,
      desktop: 600 as any,
    }),
    alignSelf: 'center',
  },
  feedContent: {
    paddingHorizontal: communityTheme.responsive({
      mobile: communityTheme.spacing.base,
      tablet: communityTheme.spacing.xl,
      desktop: communityTheme.spacing.xxl,
    }),
    paddingTop: communityTheme.spacing.base,
    paddingBottom: communityTheme.responsive({
      mobile: 100,
      tablet: communityTheme.spacing.huge,
      desktop: communityTheme.spacing.xl,
    }),
  },
  feedContentEmpty: {
    flexGrow: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: communityTheme.spacing.xxl,
    paddingVertical: communityTheme.spacing.massive,
  },
  emptyStateTitle: {
    fontSize: communityTheme.responsive({
      mobile: communityTheme.typography.fontSize.xxl,
      tablet: communityTheme.typography.fontSize.xxxl,
      desktop: communityTheme.typography.fontSize.huge,
    }),
    fontWeight: communityTheme.typography.fontWeight.bold,
    color: communityTheme.colors.text,
    marginTop: communityTheme.spacing.xl,
    marginBottom: communityTheme.spacing.sm,
    textAlign: 'center',
  },
  emptyStateSubtitle: {
    fontSize: communityTheme.typography.fontSize.base,
    color: communityTheme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  createPostButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: communityTheme.colors.primary,
    paddingHorizontal: communityTheme.spacing.xl,
    paddingVertical: communityTheme.spacing.md,
    borderRadius: communityTheme.borderRadius.full,
    marginTop: communityTheme.spacing.xl,
    gap: communityTheme.spacing.sm,
    minHeight: communityTheme.touchTarget.min,
    ...Platform.select({
      web: {
        cursor: 'pointer',
        transition: 'background-color 0.2s ease, transform 0.1s ease',
        ':hover': {
          backgroundColor: communityTheme.colors.primaryDark,
          transform: 'scale(1.05)',
        },
        ':active': {
          transform: 'scale(0.98)',
        },
      },
    }),
  },
  createPostButtonText: {
    color: communityTheme.colors.surface,
    fontSize: communityTheme.typography.fontSize.lg,
    fontWeight: communityTheme.typography.fontWeight.semibold,
  },
  footerLoader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: communityTheme.spacing.lg,
    gap: communityTheme.spacing.sm,
  },
  footerLoaderText: {
    fontSize: communityTheme.typography.fontSize.base,
    color: communityTheme.colors.textSecondary,
  },
  fab: {
    ...communityTheme.components.fab,
    ...Platform.select({
      web: {
        cursor: 'pointer',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        ':hover': {
          transform: 'scale(1.1)',
          ...communityTheme.shadows.xl,
        },
        ':active': {
          transform: 'scale(1.05)',
        },
      },
    }),
  },
  fabDisabled: {
    opacity: 0.5,
  },
});
