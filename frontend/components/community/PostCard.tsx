import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Alert, useWindowDimensions, Platform } from 'react-native';
import { Avatar, IconButton, Menu, Divider } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Post } from '../../src/services/communityService';
import ReportModal from './ReportModal';
import { communityTheme, responsiveUtils } from '../../src/theme';

interface PostCardProps {
  post: Post;
  currentUserId?: string;
  onLike: (postId: string) => void;
  onComment: (postId: string) => void;
  onSave: (postId: string) => void;
  onDelete?: (postId: string) => void;
  onReport?: (postId: string) => void;
  onUserPress: (userId: string) => void;
  onPostPress: (postId: string) => void;
  onLocationPress?: (locationDisplay: string) => void;
}

export default function PostCard({
  post,
  currentUserId,
  onLike,
  onComment,
  onSave,
  onDelete,
  onReport,
  onUserPress,
  onPostPress,
  onLocationPress,
}: PostCardProps) {
  const [menuVisible, setMenuVisible] = useState(false);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const { width } = useWindowDimensions();

  const isOwnPost = currentUserId === post.userId;

  const formatTimestamp = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const handleMenuAction = (action: 'delete' | 'report') => {
    setMenuVisible(false);
    if (action === 'delete' && onDelete) {
      Alert.alert(
        'Delete Post',
        'Are you sure you want to delete this post?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Delete', style: 'destructive', onPress: () => onDelete(post.id) },
        ]
      );
    } else if (action === 'report') {
      setReportModalVisible(true);
    }
  };

  const handleReportSuccess = () => {
    onReport?.(post.id);
  };

  const handleScroll = (event: any) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollPosition / width);
    setCurrentMediaIndex(index);
  };

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.userInfo}
          onPress={() => onUserPress(post.userId)}
        >
          {post.user.avatar ? (
            <Avatar.Image size={48} source={{ uri: post.user.avatar }} />
          ) : (
            <Avatar.Text 
              size={48} 
              label={post.user.name.substring(0, 2).toUpperCase()} 
              style={styles.avatar}
            />
          )}
          <View style={styles.userDetails}>
            <Text style={styles.userName}>{post.user.name}</Text>
            <View style={styles.metaInfo}>
              <Text style={styles.timestamp}>{formatTimestamp(post.createdAt)}</Text>
              {post.locationDisplay && (
                <>
                  <Text style={styles.metaDot}>•</Text>
                  <TouchableOpacity onPress={() => onLocationPress?.(post.locationDisplay)}>
                    <View style={styles.locationContainer}>
                      <MaterialCommunityIcons name="map-marker" size={12} color="#667eea" />
                      <Text style={styles.location}>{post.locationDisplay}</Text>
                    </View>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
        </TouchableOpacity>

        <Menu
          visible={menuVisible}
          onDismiss={() => setMenuVisible(false)}
          anchor={
            <IconButton
              icon="dots-horizontal"
              size={20}
              onPress={() => setMenuVisible(true)}
            />
          }
        >
          {isOwnPost ? (
            <Menu.Item
              onPress={() => handleMenuAction('delete')}
              title="Delete Post"
              leadingIcon="delete"
            />
          ) : (
            <Menu.Item
              onPress={() => handleMenuAction('report')}
              title="Report Post"
              leadingIcon="flag"
            />
          )}
        </Menu>
      </View>

      {/* Caption */}
      {post.caption && (
        <TouchableOpacity onPress={() => onPostPress(post.id)}>
          <Text style={styles.caption}>{post.caption}</Text>
        </TouchableOpacity>
      )}

      {/* Media Gallery */}
      {post.mediaUrls && post.mediaUrls.length > 0 && (
        <View style={styles.mediaContainer}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
          >
            {post.mediaUrls.map((url, index) => (
              <TouchableOpacity
                key={index}
                activeOpacity={0.9}
                onPress={() => onPostPress(post.id)}
              >
                <Image
                  source={{ uri: url }}
                  style={[styles.mediaImage, { width }]}
                  resizeMode="cover"
                />
                {post.mediaTypes[index] === 'VIDEO' && (
                  <View style={styles.videoOverlay}>
                    <MaterialCommunityIcons name="play-circle" size={64} color="#fff" />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Pagination Dots */}
          {post.mediaUrls.length > 1 && (
            <View style={styles.pagination}>
              {post.mediaUrls.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.paginationDot,
                    index === currentMediaIndex && styles.paginationDotActive,
                  ]}
                />
              ))}
            </View>
          )}
        </View>
      )}

      {/* Interaction Bar */}
      <View style={styles.interactionBar}>
        <View style={styles.interactionCounts}>
          <View style={styles.reactionIcons}>
            <MaterialCommunityIcons name="heart" size={16} color="#F44336" />
            <MaterialCommunityIcons name="thumb-up" size={16} color="#2196F3" />
            <Text style={styles.countText}>{post.likeCount}</Text>
          </View>
          <View style={styles.rightCounts}>
            <Text style={styles.countText}>{post.commentCount} comments</Text>
            <Text style={styles.countText}>•</Text>
            <Text style={styles.countText}>{post.saveCount} saves</Text>
          </View>
        </View>

        <Divider style={styles.divider} />

        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => onLike(post.id)}
          >
            <MaterialCommunityIcons
              name={post.isLiked ? 'heart' : 'heart-outline'}
              size={22}
              color={post.isLiked ? '#F44336' : '#65676b'}
            />
            <Text style={[styles.actionText, post.isLiked && styles.actionTextActive]}>
              Like
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => onComment(post.id)}
          >
            <MaterialCommunityIcons name="comment-outline" size={22} color="#65676b" />
            <Text style={styles.actionText}>Comment</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => onSave(post.id)}
          >
            <MaterialCommunityIcons
              name={post.isSaved ? 'bookmark' : 'bookmark-outline'}
              size={22}
              color={post.isSaved ? '#667eea' : '#65676b'}
            />
            <Text style={[styles.actionText, post.isSaved && styles.actionTextSaved]}>
              Save
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Report Modal */}
      <ReportModal
        visible={reportModalVisible}
        postId={post.id}
        onClose={() => setReportModalVisible(false)}
        onSuccess={handleReportSuccess}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    ...communityTheme.components.postCard,
    maxWidth: communityTheme.responsive({
      mobile: '100%' as any,
      tablet: 600 as any,
      desktop: 600 as any,
    }),
    alignSelf: 'center',
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: communityTheme.spacing.base,
    paddingBottom: communityTheme.spacing.md,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    minHeight: communityTheme.touchTarget.min,
  },
  avatar: {
    backgroundColor: communityTheme.colors.primary,
  },
  userDetails: {
    marginLeft: communityTheme.spacing.md,
    flex: 1,
  },
  userName: {
    fontSize: communityTheme.typography.fontSize.lg,
    fontWeight: communityTheme.typography.fontWeight.bold,
    color: communityTheme.colors.text,
    marginBottom: 2,
  },
  metaInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: communityTheme.spacing.xs,
  },
  timestamp: {
    fontSize: communityTheme.typography.fontSize.sm,
    color: communityTheme.colors.textSecondary,
  },
  metaDot: {
    fontSize: communityTheme.typography.fontSize.sm,
    color: communityTheme.colors.textSecondary,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    ...Platform.select({
      web: {
        cursor: 'pointer',
      },
    }),
  },
  location: {
    fontSize: communityTheme.typography.fontSize.sm,
    color: communityTheme.colors.primary,
    fontWeight: communityTheme.typography.fontWeight.medium,
  },
  caption: {
    fontSize: communityTheme.typography.fontSize.md,
    lineHeight: 20,
    color: communityTheme.colors.text,
    paddingHorizontal: communityTheme.spacing.base,
    paddingBottom: communityTheme.spacing.md,
  },
  mediaContainer: {
    position: 'relative',
  },
  mediaImage: {
    height: communityTheme.responsive({
      mobile: 400,
      tablet: 500,
      desktop: 500,
    }),
    backgroundColor: communityTheme.colors.surfaceVariant,
  },
  videoOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: communityTheme.colors.overlayLight,
  },
  pagination: {
    position: 'absolute',
    bottom: communityTheme.spacing.md,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  paginationDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  paginationDotActive: {
    backgroundColor: communityTheme.colors.surface,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  interactionBar: {
    padding: communityTheme.spacing.base,
  },
  interactionCounts: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: communityTheme.spacing.md,
  },
  reactionIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: communityTheme.spacing.xs,
  },
  rightCounts: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  countText: {
    fontSize: communityTheme.typography.fontSize.sm,
    color: communityTheme.colors.textSecondary,
  },
  divider: {
    marginBottom: communityTheme.spacing.md,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: communityTheme.spacing.sm,
    paddingHorizontal: communityTheme.spacing.base,
    minHeight: communityTheme.touchTarget.min,
    borderRadius: communityTheme.borderRadius.base,
    ...Platform.select({
      web: {
        cursor: 'pointer',
        transition: 'background-color 0.2s ease',
        ':hover': {
          backgroundColor: communityTheme.colors.surfaceVariant,
        },
      },
    }),
  },
  actionText: {
    fontSize: communityTheme.typography.fontSize.base,
    fontWeight: communityTheme.typography.fontWeight.semibold,
    color: communityTheme.colors.textSecondary,
  },
  actionTextActive: {
    color: communityTheme.colors.like,
  },
  actionTextSaved: {
    color: communityTheme.colors.save,
  },
});
