import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Image,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Avatar, Menu, Divider } from 'react-native-paper';
import { AlbumPhoto, PhotoComment, CommentStatus } from '../../src/types';
import { albumService } from '../../src/services/albumService';
import { useAuth } from '../../src/contexts/AuthContext';
import ReportCommentModal from './ReportCommentModal';

interface PhotoViewerModalProps {
  visible: boolean;
  photos: AlbumPhoto[];
  initialIndex: number;
  albumOwnerId: string;
  onClose: () => void;
  onCommentStatusChange?: (photoId: string, status: CommentStatus) => void;
}

export default function PhotoViewerModal({
  visible,
  photos,
  initialIndex,
  albumOwnerId,
  onClose,
  onCommentStatusChange,
}: PhotoViewerModalProps) {
  const { user } = useAuth();
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [comments, setComments] = useState<PhotoComment[]>([]);
  const [commentText, setCommentText] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [selectedCommentId, setSelectedCommentId] = useState<string | null>(null);

  const currentPhoto = photos[currentIndex];
  const isAlbumOwner = user?.id === albumOwnerId;
  const commentStatus = currentPhoto?.commentStatus || 'ENABLED';

  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

  useEffect(() => {
    if (visible && currentPhoto) {
      loadComments();
    }
  }, [visible, currentIndex, currentPhoto]);

  const loadComments = async () => {
    if (!currentPhoto) return;
    
    setLoading(true);
    try {
      const data = await albumService.getComments(currentPhoto.id);
      setComments(data);
    } catch (error) {
      console.error('Error loading comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!commentText.trim() || !currentPhoto) return;

    setSubmitting(true);
    try {
      const newComment = await albumService.addComment(currentPhoto.id, commentText.trim());
      setComments([...comments, newComment]);
      setCommentText('');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to add comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    Alert.alert(
      'Delete Comment',
      'Are you sure you want to delete this comment?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await albumService.deleteComment(commentId);
              setComments(comments.filter((c) => c.id !== commentId));
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to delete comment');
            }
          },
        },
      ]
    );
  };

  const handleReportComment = (commentId: string) => {
    setSelectedCommentId(commentId);
    setReportModalVisible(true);
  };

  const handleReportSuccess = () => {
    Alert.alert('Success', 'Comment reported successfully');
    loadComments(); // Reload to show report indicator
  };

  const handleCommentStatusChange = async (status: CommentStatus) => {
    if (!currentPhoto) return;

    setMenuVisible(false);
    try {
      await albumService.updateCommentStatus(currentPhoto.albumId, currentPhoto.id, status);
      onCommentStatusChange?.(currentPhoto.id, status);
      
      // Update local state
      const updatedPhotos = [...photos];
      updatedPhotos[currentIndex] = { ...currentPhoto, commentStatus: status };
      
      // Reload comments to reflect new status
      loadComments();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update comment status');
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < photos.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

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

  const getCommentStatusLabel = () => {
    switch (commentStatus) {
      case 'DISABLED':
        return 'Comments Disabled';
      case 'HIDDEN':
        return 'Comments Hidden';
      default:
        return 'Comments Enabled';
    }
  };

  const canComment = () => {
    if (commentStatus === 'DISABLED') return false;
    if (commentStatus === 'HIDDEN' && !isAlbumOwner) return false;
    return true;
  };

  const canViewComments = () => {
    if (commentStatus === 'HIDDEN' && !isAlbumOwner) return false;
    return true;
  };

  if (!currentPhoto) return null;

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <MaterialCommunityIcons name="close" size={28} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {currentIndex + 1} / {photos.length}
          </Text>
          {isAlbumOwner && (
            <Menu
              visible={menuVisible}
              onDismiss={() => setMenuVisible(false)}
              anchor={
                <TouchableOpacity onPress={() => setMenuVisible(true)} style={styles.menuButton}>
                  <MaterialCommunityIcons name="dots-vertical" size={24} color="#fff" />
                </TouchableOpacity>
              }
            >
              <Menu.Item
                onPress={() => handleCommentStatusChange('ENABLED')}
                title="Enable Comments"
                leadingIcon="comment-check"
              />
              <Menu.Item
                onPress={() => handleCommentStatusChange('DISABLED')}
                title="Disable Comments"
                leadingIcon="comment-off"
              />
              <Menu.Item
                onPress={() => handleCommentStatusChange('HIDDEN')}
                title="Hide Comments"
                leadingIcon="eye-off"
              />
            </Menu>
          )}
        </View>

        {/* Photo */}
        <View style={styles.photoContainer}>
          <Image source={{ uri: currentPhoto.photoUrl }} style={styles.photo} resizeMode="contain" />
          
          {/* Navigation Arrows */}
          {currentIndex > 0 && (
            <TouchableOpacity style={styles.prevButton} onPress={handlePrevious}>
              <MaterialCommunityIcons name="chevron-left" size={40} color="#fff" />
            </TouchableOpacity>
          )}
          {currentIndex < photos.length - 1 && (
            <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
              <MaterialCommunityIcons name="chevron-right" size={40} color="#fff" />
            </TouchableOpacity>
          )}
        </View>

        {/* Comments Section */}
        <View style={styles.commentsSection}>
          <View style={styles.commentsSectionHeader}>
            <Text style={styles.commentsTitle}>Comments</Text>
            {isAlbumOwner && (
              <Text style={styles.commentStatus}>{getCommentStatusLabel()}</Text>
            )}
          </View>
          <Divider />

          {!canViewComments() ? (
            <View style={styles.disabledMessage}>
              <MaterialCommunityIcons name="eye-off" size={48} color="#999" />
              <Text style={styles.disabledText}>Comments are hidden for this photo</Text>
            </View>
          ) : loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#667eea" />
            </View>
          ) : comments.length === 0 ? (
            <View style={styles.emptyComments}>
              <MaterialCommunityIcons name="comment-outline" size={48} color="#999" />
              <Text style={styles.emptyText}>No comments yet</Text>
              {canComment() && <Text style={styles.emptySubtext}>Be the first to comment!</Text>}
            </View>
          ) : (
            <ScrollView style={styles.commentsList}>
              {comments.map((comment) => (
                <View key={comment.id} style={styles.commentItem}>
                  <Avatar.Text
                    size={36}
                    label={comment.user.profile.name.substring(0, 2).toUpperCase()}
                    style={styles.commentAvatar}
                  />
                  <View style={styles.commentContent}>
                    <View style={styles.commentHeader}>
                      <Text style={styles.commentAuthor}>{comment.user.profile.name}</Text>
                      <Text style={styles.commentTime}>{formatTimestamp(comment.createdAt)}</Text>
                    </View>
                    <Text style={styles.commentText}>{comment.text}</Text>
                    {comment.reports && comment.reports.length > 0 && isAlbumOwner && (
                      <Text style={styles.reportedBadge}>Reported</Text>
                    )}
                  </View>
                  {comment.userId === user?.id || isAlbumOwner ? (
                    <TouchableOpacity
                      onPress={() => handleDeleteComment(comment.id)}
                      style={styles.deleteButton}
                    >
                      <MaterialCommunityIcons name="delete-outline" size={20} color="#F44336" />
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      onPress={() => handleReportComment(comment.id)}
                      style={styles.reportButton}
                    >
                      <MaterialCommunityIcons name="flag-outline" size={20} color="#999" />
                    </TouchableOpacity>
                  )}
                </View>
              ))}
            </ScrollView>
          )}

          {/* Comment Input */}
          {canComment() ? (
            <View style={styles.commentInputContainer}>
              <TextInput
                style={styles.commentInput}
                placeholder="Add a comment..."
                value={commentText}
                onChangeText={setCommentText}
                multiline
                maxLength={500}
              />
              <TouchableOpacity
                onPress={handleAddComment}
                disabled={!commentText.trim() || submitting}
                style={[styles.sendButton, (!commentText.trim() || submitting) && styles.sendButtonDisabled]}
              >
                {submitting ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <MaterialCommunityIcons name="send" size={20} color="#fff" />
                )}
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.disabledInputMessage}>
              <MaterialCommunityIcons name="comment-off" size={20} color="#999" />
              <Text style={styles.disabledInputText}>
                {commentStatus === 'DISABLED'
                  ? 'Comments are disabled by the album owner'
                  : 'Comments are hidden for this photo'}
              </Text>
            </View>
          )}
        </View>

        {/* Report Modal */}
        {selectedCommentId && (
          <ReportCommentModal
            visible={reportModalVisible}
            commentId={selectedCommentId}
            onClose={() => {
              setReportModalVisible(false);
              setSelectedCommentId(null);
            }}
            onSuccess={handleReportSuccess}
          />
        )}
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  closeButton: {
    padding: 8,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  menuButton: {
    padding: 8,
  },
  photoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  prevButton: {
    position: 'absolute',
    left: 16,
    top: '50%',
    transform: [{ translateY: -20 }],
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    padding: 8,
  },
  nextButton: {
    position: 'absolute',
    right: 16,
    top: '50%',
    transform: [{ translateY: -20 }],
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    padding: 8,
  },
  commentsSection: {
    backgroundColor: '#fff',
    maxHeight: '50%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  commentsSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  commentsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  commentStatus: {
    fontSize: 12,
    color: '#667eea',
    fontWeight: '600',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyComments: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 12,
    fontWeight: '600',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#bbb',
    marginTop: 4,
  },
  disabledMessage: {
    padding: 40,
    alignItems: 'center',
  },
  disabledText: {
    fontSize: 16,
    color: '#999',
    marginTop: 12,
    textAlign: 'center',
  },
  commentsList: {
    flex: 1,
    padding: 16,
  },
  commentItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  commentAvatar: {
    backgroundColor: '#667eea',
  },
  commentContent: {
    flex: 1,
    marginLeft: 12,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  commentAuthor: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1a1a1a',
    marginRight: 8,
  },
  commentTime: {
    fontSize: 12,
    color: '#999',
  },
  commentText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  reportedBadge: {
    fontSize: 11,
    color: '#F44336',
    fontWeight: '600',
    marginTop: 4,
  },
  deleteButton: {
    padding: 8,
  },
  reportButton: {
    padding: 8,
  },
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: '#fff',
  },
  commentInput: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 12,
    maxHeight: 100,
    fontSize: 14,
  },
  sendButton: {
    backgroundColor: '#667eea',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#ccc',
  },
  disabledInputMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#f5f5f5',
    gap: 8,
  },
  disabledInputText: {
    fontSize: 13,
    color: '#999',
  },
});
