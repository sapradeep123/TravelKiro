import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, FlatList, Platform } from 'react-native';
import { Avatar, ActivityIndicator } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Comment } from '../../src/services/communityService';
import { communityTheme } from '../../src/theme';
import { validateComment } from '../../src/utils/validation';
import { toast, showDestructiveDialog } from '../../src/utils/toast';
import { useIsOnline } from '../../src/hooks/useNetworkStatus';

interface CommentListProps {
  postId: string;
  comments: Comment[];
  currentUserId?: string;
  loading?: boolean;
  onAddComment: (postId: string, text: string) => Promise<void>;
  onDeleteComment: (commentId: string) => Promise<void>;
  onUserPress: (userId: string) => void;
}

const MAX_COMMENT_LENGTH = 500;

export default function CommentList({
  postId,
  comments,
  currentUserId,
  loading = false,
  onAddComment,
  onDeleteComment,
  onUserPress,
}: CommentListProps) {
  const isOnline = useIsOnline();
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string>('');

  const formatTimestamp = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const handleSubmitComment = async () => {
    // Clear previous validation error
    setValidationError('');

    // Check network connectivity
    if (!isOnline) {
      toast.error('No internet connection');
      return;
    }

    // Validate comment
    const validation = validateComment({ text: commentText });
    if (!validation.isValid) {
      const errorMessage = validation.errors.text || 'Invalid comment';
      setValidationError(errorMessage);
      toast.error(errorMessage);
      return;
    }

    setSubmitting(true);
    try {
      await onAddComment(postId, commentText.trim());
      setCommentText('');
      setValidationError('');
    } catch (error: any) {
      console.error('Error adding comment:', error);
      toast.error(error.message || 'Failed to add comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = (commentId: string, userName: string) => {
    showDestructiveDialog(
      'Delete Comment',
      `Delete comment by ${userName}?`,
      'Delete',
      async () => {
        try {
          await onDeleteComment(commentId);
          toast.success('Comment deleted');
        } catch (error: any) {
          console.error('Error deleting comment:', error);
          toast.error(error.message || 'Failed to delete comment');
        }
      }
    );
  };

  const renderComment = ({ item }: { item: Comment }) => {
    const isOwnComment = currentUserId === item.userId;

    return (
      <View style={styles.commentItem}>
        <TouchableOpacity onPress={() => onUserPress(item.userId)}>
          {item.user.avatar ? (
            <Avatar.Image size={36} source={{ uri: item.user.avatar }} />
          ) : (
            <Avatar.Text
              size={36}
              label={item.user.name.substring(0, 2).toUpperCase()}
              style={styles.avatar}
            />
          )}
        </TouchableOpacity>

        <View style={styles.commentContent}>
          <View style={styles.commentBubble}>
            <TouchableOpacity onPress={() => onUserPress(item.userId)}>
              <Text style={styles.commentUserName}>{item.user.name}</Text>
            </TouchableOpacity>
            <Text style={styles.commentText}>{item.text}</Text>
          </View>

          <View style={styles.commentMeta}>
            <Text style={styles.commentTimestamp}>{formatTimestamp(item.createdAt)}</Text>
            {isOwnComment && (
              <>
                <Text style={styles.metaDot}>•</Text>
                <TouchableOpacity
                  onPress={() => handleDeleteComment(item.id, item.user.name)}
                >
                  <Text style={styles.deleteButton}>Delete</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <MaterialCommunityIcons name="comment-outline" size={48} color="#d1d5db" />
      <Text style={styles.emptyStateText}>No comments yet</Text>
      <Text style={styles.emptyStateSubtext}>Be the first to comment!</Text>
    </View>
  );

  const remainingChars = MAX_COMMENT_LENGTH - commentText.length;
  const isNearLimit = remainingChars < 50;

  return (
    <View style={styles.container}>
      {/* Comment Input */}
      <View style={styles.inputContainer}>
        <TextInput
          style={[styles.input, validationError && styles.inputError]}
          placeholder="Write a comment..."
          value={commentText}
          onChangeText={(text) => {
            setCommentText(text);
            if (validationError) {
              setValidationError('');
            }
          }}
          multiline
          maxLength={MAX_COMMENT_LENGTH}
          editable={!submitting && isOnline}
        />
        <View style={styles.inputFooter}>
          <View style={styles.inputFooterLeft}>
            <Text
              style={[
                styles.charCount,
                isNearLimit && styles.charCountWarning,
                remainingChars < 0 && styles.charCountError,
              ]}
            >
              {remainingChars} characters left
            </Text>
            {validationError && (
              <Text style={styles.validationError}>{validationError}</Text>
            )}
            {!isOnline && (
              <Text style={styles.offlineText}>Offline - comments disabled</Text>
            )}
          </View>
          <TouchableOpacity
            style={[
              styles.submitButton,
              (!commentText.trim() || submitting || !isOnline) && styles.submitButtonDisabled,
            ]}
            onPress={handleSubmitComment}
            disabled={!commentText.trim() || submitting || !isOnline}
          >
            {submitting ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <MaterialCommunityIcons name="send" size={20} color="#fff" />
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Comments List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#667eea" />
          <Text style={styles.loadingText}>Loading comments...</Text>
        </View>
      ) : (
        <FlatList
          data={comments}
          renderItem={renderComment}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={renderEmptyState}
          contentContainerStyle={styles.commentsList}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: communityTheme.colors.surface,
  },
  inputContainer: {
    padding: communityTheme.spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: communityTheme.colors.border,
    backgroundColor: communityTheme.colors.surfaceVariant,
  },
  input: {
    ...communityTheme.components.input,
    minHeight: 80,
    maxHeight: 120,
    textAlignVertical: 'top',
  },
  inputFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: communityTheme.spacing.sm,
  },
  inputFooterLeft: {
    flex: 1,
    marginRight: communityTheme.spacing.sm,
  },
  charCount: {
    fontSize: communityTheme.typography.fontSize.sm,
    color: communityTheme.colors.textSecondary,
  },
  inputError: {
    borderColor: communityTheme.colors.error,
    borderWidth: 2,
  },
  validationError: {
    fontSize: communityTheme.typography.fontSize.xs,
    color: communityTheme.colors.error,
    marginTop: 4,
  },
  offlineText: {
    fontSize: communityTheme.typography.fontSize.xs,
    color: communityTheme.colors.warning,
    marginTop: 4,
    fontWeight: communityTheme.typography.fontWeight.semibold,
  },
  charCountWarning: {
    color: communityTheme.colors.warning,
    fontWeight: communityTheme.typography.fontWeight.semibold,
  },
  charCountError: {
    color: communityTheme.colors.error,
    fontWeight: communityTheme.typography.fontWeight.bold,
  },
  submitButton: {
    backgroundColor: communityTheme.colors.primary,
    paddingHorizontal: communityTheme.spacing.lg,
    paddingVertical: communityTheme.spacing.sm + 2,
    borderRadius: communityTheme.borderRadius.full,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 80,
    minHeight: communityTheme.touchTarget.min,
    ...Platform.select({
      web: {
        cursor: 'pointer',
        transition: 'background-color 0.2s ease',
        ':hover': {
          backgroundColor: communityTheme.colors.primaryDark,
        },
      },
    }),
  },
  submitButtonDisabled: {
    backgroundColor: communityTheme.colors.borderDark,
    opacity: 0.6,
  },
  commentsList: {
    padding: communityTheme.spacing.base,
  },
  commentItem: {
    flexDirection: 'row',
    marginBottom: communityTheme.spacing.base,
    gap: communityTheme.spacing.md,
  },
  avatar: {
    backgroundColor: communityTheme.colors.primary,
  },
  commentContent: {
    flex: 1,
  },
  commentBubble: {
    backgroundColor: communityTheme.colors.background,
    borderRadius: communityTheme.borderRadius.xl,
    padding: communityTheme.spacing.md,
    paddingHorizontal: communityTheme.spacing.base,
  },
  commentUserName: {
    fontSize: communityTheme.typography.fontSize.sm,
    fontWeight: communityTheme.typography.fontWeight.bold,
    color: communityTheme.colors.text,
    marginBottom: communityTheme.spacing.xs,
    ...Platform.select({
      web: {
        cursor: 'pointer',
        ':hover': {
          textDecorationLine: 'underline',
        },
      },
    }),
  },
  commentText: {
    fontSize: communityTheme.typography.fontSize.base,
    lineHeight: 18,
    color: communityTheme.colors.text,
  },
  commentMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: communityTheme.spacing.xs,
    marginLeft: communityTheme.spacing.base,
    gap: communityTheme.spacing.sm,
  },
  commentTimestamp: {
    fontSize: communityTheme.typography.fontSize.sm,
    color: communityTheme.colors.textSecondary,
  },
  metaDot: {
    fontSize: communityTheme.typography.fontSize.sm,
    color: communityTheme.colors.textSecondary,
  },
  deleteButton: {
    fontSize: communityTheme.typography.fontSize.sm,
    color: communityTheme.colors.error,
    fontWeight: communityTheme.typography.fontWeight.semibold,
    ...Platform.select({
      web: {
        cursor: 'pointer',
        ':hover': {
          textDecorationLine: 'underline',
        },
      },
    }),
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: communityTheme.spacing.huge,
  },
  emptyStateText: {
    fontSize: communityTheme.typography.fontSize.lg,
    fontWeight: communityTheme.typography.fontWeight.semibold,
    color: communityTheme.colors.textSecondary,
    marginTop: communityTheme.spacing.md,
  },
  emptyStateSubtext: {
    fontSize: communityTheme.typography.fontSize.base,
    color: communityTheme.colors.textTertiary,
    marginTop: communityTheme.spacing.xs,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: communityTheme.spacing.huge,
  },
  loadingText: {
    marginTop: communityTheme.spacing.md,
    fontSize: communityTheme.typography.fontSize.base,
    color: communityTheme.colors.textSecondary,
  },
});
