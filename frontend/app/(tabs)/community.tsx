import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet, Image, RefreshControl, TouchableOpacity } from 'react-native';
import { Card, Text, ActivityIndicator, IconButton, Avatar, Divider } from 'react-native-paper';
import { communityService } from '../../src/services/communityService';
import { CommunityPost } from '../../src/types';
import { useAuth } from '../../src/contexts/AuthContext';

export default function CommunityScreen() {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    loadFeed();
  }, []);

  const loadFeed = async () => {
    try {
      setLoading(true);
      const data = await communityService.getFeed();
      setPosts(data);
    } catch (error) {
      console.error('Error loading feed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadFeed();
    setRefreshing(false);
  };

  const handleLike = async (postId: string) => {
    try {
      await communityService.likePost(postId);
      // Refresh to update like count
      await loadFeed();
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const renderPost = ({ item }: { item: CommunityPost }) => (
    <Card style={styles.card}>
      <Card.Content style={styles.header}>
        <View style={styles.userInfo}>
          <Avatar.Text
            size={40}
            label={item.user.profile.name.substring(0, 2).toUpperCase()}
            style={styles.avatar}
          />
          <View style={styles.userDetails}>
            <Text variant="titleMedium" style={styles.userName}>
              {item.user.profile.name}
            </Text>
            <Text variant="bodySmall" style={styles.timestamp}>
              {formatDate(item.createdAt)}
            </Text>
          </View>
        </View>
      </Card.Content>

      {item.mediaUrls && item.mediaUrls.length > 0 && (
        <Card.Cover source={{ uri: item.mediaUrls[0] }} style={styles.postImage} />
      )}

      <Card.Content style={styles.content}>
        <View style={styles.actions}>
          <TouchableOpacity onPress={() => handleLike(item.id)} style={styles.actionButton}>
            <IconButton
              icon={item.likes.some((like: any) => like.userId === user?.id) ? 'heart' : 'heart-outline'}
              iconColor={item.likes.some((like: any) => like.userId === user?.id) ? '#F44336' : '#666'}
              size={24}
              style={styles.iconButton}
            />
            <Text variant="bodyMedium" style={styles.actionText}>
              {item.likes.length}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <IconButton
              icon="comment-outline"
              iconColor="#666"
              size={24}
              style={styles.iconButton}
            />
            <Text variant="bodyMedium" style={styles.actionText}>
              {item.comments.length}
            </Text>
          </TouchableOpacity>
        </View>

        <Text variant="bodyMedium" style={styles.caption}>
          <Text style={styles.captionUser}>{item.user.profile.name}</Text> {item.caption}
        </Text>

        {item.comments.length > 0 && (
          <View style={styles.commentsPreview}>
            <Text variant="bodySmall" style={styles.viewComments}>
              View all {item.comments.length} comments
            </Text>
            <Text variant="bodySmall" style={styles.comment}>
              <Text style={styles.commentUser}>{item.comments[0].user.profile.name}</Text>{' '}
              {item.comments[0].text}
            </Text>
          </View>
        )}
      </Card.Content>
    </Card>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Loading feed...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={posts}
        renderItem={renderPost}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text variant="titleMedium" style={styles.emptyText}>
              No posts yet
            </Text>
            <Text variant="bodyMedium" style={styles.emptySubtext}>
              Be the first to share your travel experience!
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
  },
  listContent: {
    paddingVertical: 5,
  },
  card: {
    marginBottom: 10,
    elevation: 2,
  },
  header: {
    paddingBottom: 10,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    backgroundColor: '#2196F3',
  },
  userDetails: {
    marginLeft: 10,
  },
  userName: {
    fontWeight: 'bold',
  },
  timestamp: {
    color: '#999',
  },
  postImage: {
    height: 400,
  },
  content: {
    paddingTop: 5,
  },
  actions: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
  },
  iconButton: {
    margin: 0,
  },
  actionText: {
    color: '#666',
    marginLeft: -5,
  },
  caption: {
    lineHeight: 20,
    marginBottom: 5,
  },
  captionUser: {
    fontWeight: 'bold',
  },
  commentsPreview: {
    marginTop: 5,
  },
  viewComments: {
    color: '#999',
    marginBottom: 5,
  },
  comment: {
    color: '#666',
  },
  commentUser: {
    fontWeight: 'bold',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 50,
  },
  emptyText: {
    color: '#666',
    marginBottom: 5,
  },
  emptySubtext: {
    color: '#999',
  },
});
