import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, RefreshControl } from 'react-native';
import { Text, ActivityIndicator } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { communityService, Post, Comment } from '../../src/services/communityService';
import PostCard from './PostCard';
import CommentList from './CommentList';

interface PostDetailScreenProps {
  postId: string;
  currentUserId?: string;
  onUserPress: (userId: string) => void;
  onLocationPress?: (locationDisplay: string) => void;
  onBack?: () => void;
}

export default function PostDetailScreen({
  postId,
  currentUserId,
  onUserPress,
  onLocationPress,
  onBack,
}: PostDetailScreenProps) {
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadPostDetails();
  }, [postId]);

  const loadPostDetails = async () => {
    try {
      setLoading(true);
      const postData = await communityService.getPost(postId);
      setPost(postData);
      
      // Extract comments from post data (backend includes them in getPost response)
      if ((postData as any).comments) {
        setComments((postData as any).comments);
      }
    } catch (error) {
      console.error('Error loading post details:', error);
      Alert.alert('Error', 'Failed to load post details');
      onBack?.();
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadPostDetails();
  };

  const handleLike = async (postId: string) => {
    if (!post) return;

    try {
      await communityService.toggleLike(postId);
      setPost({
        ...post,
        isLiked: !post.isLiked,
        likeCount: post.isLiked ? post.likeCount - 1 : post.likeCount + 1,
      });
    } catch (error) {
      console.error('Error toggling like:', error);
      Alert.alert('Error', 'Failed to like post');
    }
  };

  const handleSave = async (postId: string) => {
    if (!post) return;

    try {
      await communityService.toggleSave(postId);
      setPost({
        ...post,
        isSaved: !post.isSaved,
        saveCount: post.isSaved ? post.saveCount - 1 : post.saveCount + 1,
      });
    } catch (error) {
      console.error('Error toggling save:', error);
      Alert.alert('Error', 'Failed to save post');
    }
  };

  const handleDelete = async (postId: string) => {
    try {
      await communityService.deletePost(postId);
      Alert.alert('Success', 'Post deleted successfully');
      onBack?.();
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

  const handleAddComment = async (postId: string, text: string) => {
    try {
      const newComment = await communityService.addComment(postId, text);
      setComments((prev) => [...prev, newComment]);
      
      // Update comment count in post
      if (post) {
        setPost({
          ...post,
          commentCount: post.commentCount + 1,
        });
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      throw error;
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      await communityService.deleteComment(commentId);
      setComments((prev) => prev.filter((comment) => comment.id !== commentId));
      
      // Update comment count in post
      if (post) {
        setPost({
          ...post,
          commentCount: Math.max(0, post.commentCount - 1),
        });
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
      throw error;
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#667eea" />
        <Text style={styles.loadingText}>Loading post...</Text>
      </View>
    );
  }

  if (!post) {
    return (
      <View style={styles.errorContainer}>
        <MaterialCommunityIcons name="alert-circle-outline" size={64} color="#ef4444" />
        <Text style={styles.errorText}>Post not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#667eea']}
          />
        }
      >
        {/* Post Card */}
        <PostCard
          post={post}
          currentUserId={currentUserId}
          onLike={handleLike}
          onComment={() => {}} // Scroll to comments instead
          onSave={handleSave}
          onDelete={handleDelete}
          onReport={handleReport}
          onUserPress={onUserPress}
          onPostPress={() => {}} // Already on detail screen
          onLocationPress={onLocationPress}
        />

        {/* Comments Section */}
        <View style={styles.commentsSection}>
          <View style={styles.commentsSectionHeader}>
            <Text style={styles.commentsSectionTitle}>Comments</Text>
            <Text style={styles.commentsCount}>
              {post.commentCount} {post.commentCount === 1 ? 'comment' : 'comments'}
            </Text>
          </View>

          <CommentList
            postId={postId}
            comments={comments}
            currentUserId={currentUserId}
            loading={loading}
            onAddComment={handleAddComment}
            onDeleteComment={handleDeleteComment}
            onUserPress={onUserPress}
          />
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
  scrollView: {
    flex: 1,
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f2f5',
    padding: 32,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ef4444',
    marginTop: 16,
  },
  commentsSection: {
    backgroundColor: '#fff',
    marginTop: 8,
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 16,
    overflow: 'hidden',
  },
  commentsSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  commentsSectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1c1e21',
  },
  commentsCount: {
    fontSize: 14,
    color: '#65676b',
  },
});
