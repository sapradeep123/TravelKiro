import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, Alert } from 'react-native';
import { Text, ActivityIndicator } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { communityService, Post } from '../../src/services/communityService';
import PostCard from './PostCard';

interface LocationFeedScreenProps {
  locationId: string;
  locationName?: string;
  currentUserId?: string;
  onUserPress: (userId: string) => void;
  onPostPress: (postId: string) => void;
  onLocationPress?: (locationDisplay: string) => void;
  onBack?: () => void;
}

export default function LocationFeedScreen({
  locationId,
  locationName,
  currentUserId,
  onUserPress,
  onPostPress,
  onLocationPress,
}: LocationFeedScreenProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalPosts, setTotalPosts] = useState(0);

  useEffect(() => {
    loadLocationFeed(true);
  }, [locationId]);

  const loadLocationFeed = async (reset: boolean = false) => {
    try {
      if (reset) {
        setLoading(true);
        setCurrentPage(1);
        setHasMore(true);
      }

      const page = reset ? 1 : currentPage;
      const response = await communityService.getLocationFeed(locationId, page);

      if (reset) {
        setPosts(response.data);
      } else {
        setPosts((prev) => [...prev, ...response.data]);
      }

      setTotalPosts(response.pagination.total);
      setHasMore(response.pagination.page < response.pagination.totalPages);
      setCurrentPage(page);
    } catch (error) {
      console.error('Error loading location feed:', error);
      Alert.alert('Error', 'Failed to load posts for this location');
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  };

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    loadLocationFeed(true);
  }, [locationId]);

  const handleLoadMore = useCallback(() => {
    if (!loadingMore && hasMore && !loading) {
      setLoadingMore(true);
      setCurrentPage((prev) => prev + 1);
      loadLocationFeed(false);
    }
  }, [loadingMore, hasMore, loading, currentPage]);

  const handleLike = async (postId: string) => {
    try {
      await communityService.toggleLike(postId);
      setPosts((prev) =>
        prev.map((post) =>
          post.id === postId
            ? {
                ...post,
                isLiked: !post.isLiked,
                likeCount: post.isLiked ? post.likeCount - 1 : post.likeCount + 1,
              }
            : post
        )
      );
    } catch (error) {
      console.error('Error toggling like:', error);
      Alert.alert('Error', 'Failed to like post');
    }
  };

  const handleSave = async (postId: string) => {
    try {
      await communityService.toggleSave(postId);
      setPosts((prev) =>
        prev.map((post) =>
          post.id === postId
            ? {
                ...post,
                isSaved: !post.isSaved,
                saveCount: post.isSaved ? post.saveCount - 1 : post.saveCount + 1,
              }
            : post
        )
      );
    } catch (error) {
      console.error('Error toggling save:', error);
      Alert.alert('Error', 'Failed to save post');
    }
  };

  const handleDelete = async (postId: string) => {
    try {
      await communityService.deletePost(postId);
      setPosts((prev) => prev.filter((post) => post.id !== postId));
      setTotalPosts((prev) => Math.max(0, prev - 1));
      Alert.alert('Success', 'Post deleted successfully');
    } catch (error) {
      console.error('Error deleting post:', error);
      Alert.alert('Error', 'Failed to delete post');
    }
  };

  const handleReport = (postId: string) => {
    Alert.alert(
      'Report Post',
      'Why are you reporting this post?',
      [
        {
          text: 'Spam',
          onPress: () => submitReport(postId, 'spam'),
        },
        {
          text: 'Harassment',
          onPress: () => submitReport(postId, 'harassment'),
        },
        {
          text: 'Inappropriate Content',
          onPress: () => submitReport(postId, 'inappropriate'),
        },
        {
          text: 'Other',
          onPress: () => submitReport(postId, 'other'),
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  };

  const submitReport = async (postId: string, category: 'spam' | 'harassment' | 'inappropriate' | 'other') => {
    try {
      await communityService.reportPost(postId, { category });
      Alert.alert('Success', 'Post reported. We will review it shortly.');
    } catch (error) {
      console.error('Error reporting post:', error);
      Alert.alert('Error', 'Failed to report post');
    }
  };

  const renderPost = ({ item }: { item: Post }) => (
    <PostCard
      post={item}
      currentUserId={currentUserId}
      onLike={handleLike}
      onComment={onPostPress}
      onSave={handleSave}
      onDelete={handleDelete}
      onReport={handleReport}
      onUserPress={onUserPress}
      onPostPress={onPostPress}
      onLocationPress={onLocationPress}
    />
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerIcon}>
        <MaterialCommunityIcons name="map-marker" size={32} color="#667eea" />
      </View>
      <Text style={styles.locationName}>{locationName || 'Location'}</Text>
      <Text style={styles.postCount}>
        {totalPosts} {totalPosts === 1 ? 'post' : 'posts'}
      </Text>
    </View>
  );

  const renderEmptyState = () => {
    if (loading) return null;

    return (
      <View style={styles.emptyState}>
        <MaterialCommunityIcons name="map-marker-off-outline" size={64} color="#d1d5db" />
        <Text style={styles.emptyStateText}>No posts for this location</Text>
        <Text style={styles.emptyStateSubtext}>
          Be the first to share your experience here!
        </Text>
      </View>
    );
  };

  const renderFooter = () => {
    if (!loadingMore) return null;

    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color="#667eea" />
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#667eea" />
        <Text style={styles.loadingText}>Loading posts...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={posts}
        renderItem={renderPost}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyState}
        ListFooterComponent={renderFooter}
        contentContainerStyle={styles.feedContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#667eea']}
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        showsVerticalScrollIndicator={false}
      />
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
    fontSize: 14,
    color: '#6b7280',
  },
  header: {
    backgroundColor: '#fff',
    padding: 24,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    marginBottom: 16,
  },
  headerIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#f0f4ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  locationName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1c1e21',
    marginBottom: 8,
    textAlign: 'center',
  },
  postCount: {
    fontSize: 14,
    color: '#65676b',
    fontWeight: '500',
  },
  feedContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
    paddingHorizontal: 32,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6b7280',
    marginTop: 16,
    textAlign: 'center',
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 8,
    textAlign: 'center',
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
  },
});
