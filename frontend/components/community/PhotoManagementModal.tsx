import React, { useState, useEffect } from 'react';
import {
  View,
  Modal,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Text, IconButton, ActivityIndicator, Chip, Divider, Avatar } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { communityService } from '../../src/services/communityService';
import { albumService } from '../../src/services/albumService';
import { Album } from '../../src/types';
import { TEST_ALBUMS, TEST_COMMENTS } from '../../src/utils/testPhotoData';

interface PhotoManagementModalProps {
  visible: boolean;
  photoUrl: string;
  postId?: string;
  onClose: () => void;
  currentUserId?: string;
  albums?: Album[];
  onRefresh?: () => void;
}

export default function PhotoManagementModal({
  visible,
  photoUrl,
  postId,
  onClose,
  currentUserId,
  albums = [],
  onRefresh,
}: PhotoManagementModalProps) {
  const [activeTab, setActiveTab] = useState<'albums' | 'comments'>('albums');
  const [selectedAlbums, setSelectedAlbums] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [commentText, setCommentText] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);
  const { width } = require('react-native').useWindowDimensions();
  const isWeb = Platform.OS === 'web';
  const isLargeScreen = width >= 768;
  
  // Use test data if no albums provided (for testing)
  const displayAlbums = albums.length > 0 ? albums : (TEST_ALBUMS as any);

  useEffect(() => {
    if (visible && postId && activeTab === 'comments') {
      loadComments();
    }
  }, [visible, postId, activeTab]);

  const loadComments = async () => {
    if (!postId) {
      // Use test comments if no postId (for testing)
      setComments(TEST_COMMENTS);
      return;
    }
    try {
      setLoadingComments(true);
      const post = await communityService.getPost(postId);
      setComments((post as any).comments || []);
    } catch (error) {
      console.error('Error loading comments:', error);
      // Fallback to test comments on error
      setComments(TEST_COMMENTS);
    } finally {
      setLoadingComments(false);
    }
  };

  const handleAddToAlbums = async () => {
    if (selectedAlbums.size === 0) {
      Alert.alert('Error', 'Please select at least one album');
      return;
    }

    if (!postId) {
      Alert.alert('Error', 'Post ID is required');
      return;
    }

    try {
      setLoading(true);
      
      // Add photo to each selected album
      for (const albumId of Array.from(selectedAlbums)) {
        await albumService.addPhotos(albumId, {
          postIds: [postId],
        });
      }

      Alert.alert('Success', `Photo added to ${selectedAlbums.size} album(s)`);
      setSelectedAlbums(new Set());
      onRefresh?.();
      onClose();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to add photo to albums');
    } finally {
      setLoading(false);
    }
  };

  const toggleAlbumSelection = (albumId: string) => {
    const newSelection = new Set(selectedAlbums);
    if (newSelection.has(albumId)) {
      newSelection.delete(albumId);
    } else {
      newSelection.add(albumId);
    }
    setSelectedAlbums(newSelection);
  };

  const handleAddComment = async () => {
    if (!commentText.trim() || !postId) return;

    try {
      await communityService.addComment(postId, commentText.trim());
      setCommentText('');
      await loadComments();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to add comment');
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={[
        styles.modalOverlay,
        isWeb && isLargeScreen && styles.modalOverlayWeb
      ]}>
        <TouchableOpacity 
          style={styles.backdrop}
          activeOpacity={1} 
          onPress={onClose}
        />
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={[
            styles.keyboardView,
            isWeb && isLargeScreen && styles.keyboardViewWeb
          ]}
        >
          <View style={[
            styles.modalContainer,
            isWeb && isLargeScreen && styles.modalContainerWeb
          ]}>
              {/* Drag Handle */}
              <View style={styles.dragHandle}>
                <View style={styles.dragHandleBar} />
              </View>

              {/* Header */}
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Manage Photo</Text>
                <IconButton 
                  icon="close" 
                  size={24} 
                  onPress={onClose}
                  iconColor="#6b7280"
                />
              </View>

            {/* Main Content - Side by Side Layout */}
            <View style={[
              styles.mainContent,
              isWeb && isLargeScreen && styles.mainContentRow
            ]}>
              {/* Left Side - Photo */}
              <View style={[
                styles.photoSection,
                isWeb && isLargeScreen && styles.photoSectionSide
              ]}>
                <Image 
                  source={{ uri: photoUrl }} 
                  style={styles.photoImageFull} 
                  resizeMode="cover" 
                />
              </View>

              {/* Right Side - Tabs and Content */}
              <View style={[
                styles.contentSection,
                isWeb && isLargeScreen && styles.contentSectionSide
              ]}>
                {/* Tabs */}
                <View style={styles.tabsContainer}>
                  <TouchableOpacity
                    style={[styles.tab, activeTab === 'albums' && styles.tabActive]}
                    onPress={() => setActiveTab('albums')}
                    activeOpacity={0.7}
                  >
                    <MaterialCommunityIcons
                      name="image-album"
                      size={20}
                      color={activeTab === 'albums' ? '#fff' : '#6b7280'}
                    />
                    <Text style={[styles.tabText, activeTab === 'albums' && styles.tabTextActive]}>
                      Albums
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.tab, activeTab === 'comments' && styles.tabActive]}
                    onPress={() => setActiveTab('comments')}
                    activeOpacity={0.7}
                  >
                    <MaterialCommunityIcons
                      name="comment-text"
                      size={20}
                      color={activeTab === 'comments' ? '#fff' : '#6b7280'}
                    />
                    <Text style={[styles.tabText, activeTab === 'comments' && styles.tabTextActive]}>
                      Comments
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Scrollable Content */}
                <ScrollView 
                  style={styles.contentContainer}
                  showsVerticalScrollIndicator={true}
                  nestedScrollEnabled={true}
                  bounces={true}
                >
                  {activeTab === 'albums' ? (
                <View style={styles.albumsContent}>
                  {displayAlbums.length === 0 ? (
                    <View style={styles.emptyState}>
                      <MaterialCommunityIcons name="image-album" size={64} color="#ccc" />
                      <Text style={styles.emptyText}>No albums yet</Text>
                      <Text style={styles.emptySubtext}>Create an album first to add photos</Text>
                    </View>
                  ) : (
                    <>
                      {displayAlbums.map((album: Album) => (
                        <TouchableOpacity
                          key={album.id}
                          style={[
                            styles.albumItem,
                            selectedAlbums.has(album.id) && styles.albumItemSelected,
                          ]}
                          onPress={() => toggleAlbumSelection(album.id)}
                        >
                          <View style={styles.albumItemLeft}>
                            {album.coverPhotoUrl ? (
                              <Image
                                source={{ uri: album.coverPhotoUrl }}
                                style={styles.albumThumbnail}
                              />
                            ) : (
                              <View style={styles.albumPlaceholder}>
                                <MaterialCommunityIcons
                                  name="image-multiple"
                                  size={24}
                                  color="#999"
                                />
                              </View>
                            )}
                            <View style={styles.albumInfo}>
                              <Text style={styles.albumName}>{album.name}</Text>
                              <View style={styles.albumMeta}>
                                <MaterialCommunityIcons
                                  name={
                                    album.privacy === 'PUBLIC'
                                      ? 'earth'
                                      : album.privacy === 'FRIENDS_ONLY'
                                      ? 'account-multiple'
                                      : 'lock'
                                  }
                                  size={14}
                                  color="#6b7280"
                                />
                                <Text style={styles.albumPhotoCount}>
                                  {album.photoCount} photos
                                </Text>
                              </View>
                            </View>
                          </View>
                          <View style={[
                            styles.checkbox,
                            selectedAlbums.has(album.id) && styles.checkboxSelected
                          ]}>
                            {selectedAlbums.has(album.id) && (
                              <MaterialCommunityIcons
                                name="check"
                                size={18}
                                color="#fff"
                              />
                            )}
                          </View>
                        </TouchableOpacity>
                      ))}
                    </>
                  )}
                </View>
              ) : (
                <View style={styles.commentsContent}>
                  {loadingComments ? (
                    <ActivityIndicator size="small" color="#667eea" style={{ marginTop: 20 }} />
                  ) : comments.length === 0 ? (
                    <View style={styles.emptyState}>
                      <MaterialCommunityIcons name="comment-outline" size={64} color="#ccc" />
                      <Text style={styles.emptyText}>No comments yet</Text>
                      <Text style={styles.emptySubtext}>Be the first to comment!</Text>
                    </View>
                  ) : (
                    comments.map((comment) => (
                      <View key={comment.id} style={styles.commentItem}>
                        <Avatar.Text
                          size={32}
                          label={comment.user?.profile?.name?.substring(0, 2).toUpperCase() || 'U'}
                          style={styles.commentAvatar}
                        />
                        <View style={styles.commentContent}>
                          <Text style={styles.commentUser}>
                            {comment.user?.profile?.name || 'User'}
                          </Text>
                          <Text style={styles.commentText}>{comment.text}</Text>
                          <Text style={styles.commentTime}>
                            {new Date(comment.createdAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </Text>
                        </View>
                      </View>
                    ))
                  )}
                  </View>
                )}
              </ScrollView>
              </View>
            </View>

            {/* Footer Actions */}
            {activeTab === 'albums' ? (
              <View style={styles.footer}>
                <Text style={styles.selectedCount}>
                  {selectedAlbums.size} album{selectedAlbums.size !== 1 ? 's' : ''} selected
                </Text>
                <TouchableOpacity
                  style={[
                    styles.addButton,
                    (selectedAlbums.size === 0 || loading) && styles.addButtonDisabled,
                  ]}
                  onPress={handleAddToAlbums}
                  disabled={selectedAlbums.size === 0 || loading}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <>
                      <MaterialCommunityIcons name="plus" size={20} color="#fff" />
                      <Text style={styles.addButtonText}>Add to Albums</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.commentInputContainer}>
                <TextInput
                  style={styles.commentInput}
                  placeholder="Write a comment..."
                  value={commentText}
                  onChangeText={setCommentText}
                  multiline
                  maxLength={500}
                />
                <TouchableOpacity
                  style={[styles.sendButton, !commentText.trim() && styles.sendButtonDisabled]}
                  onPress={handleAddComment}
                  disabled={!commentText.trim()}
                >
                  <MaterialCommunityIcons
                    name="send"
                    size={24}
                    color={commentText.trim() ? '#667eea' : '#ccc'}
                  />
                </TouchableOpacity>
              </View>
            )}
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalOverlayWeb: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
  },
  dragHandle: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  dragHandleBar: {
    width: 40,
    height: 4,
    backgroundColor: '#d1d5db',
    borderRadius: 2,
  },
  keyboardView: {
    width: '100%',
    maxHeight: '95%',
  },
  keyboardViewWeb: {
    width: '90%',
    maxWidth: 900,
    maxHeight: '90%',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: '90%',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 20,
    display: 'flex',
    flexDirection: 'column',
  },
  modalContainerWeb: {
    borderRadius: 24,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    height: 600,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  mainContent: {
    flex: 1,
    flexDirection: 'column',
  },
  mainContentRow: {
    flexDirection: 'row',
  },
  photoSection: {
    width: '100%',
    height: 250,
    backgroundColor: '#000',
    overflow: 'hidden',
  },
  photoSectionSide: {
    width: '45%',
    height: 'auto',
    minHeight: 400,
    overflow: 'hidden',
  },
  photoImageFull: {
    width: '100%',
    height: '100%',
  },
  contentSection: {
    flex: 1,
    flexDirection: 'column',
  },
  contentSectionSide: {
    width: '55%',
    borderLeftWidth: 1,
    borderLeftColor: '#e5e7eb',
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 6,
    borderRadius: 10,
    backgroundColor: '#f5f5f5',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  tabActive: {
    backgroundColor: '#667eea',
    borderColor: '#667eea',
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#6b7280',
  },
  tabTextActive: {
    color: '#fff',
  },
  contentContainer: {
    flex: 1,
  },
  albumsContent: {
    padding: 16,
  },
  albumItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  albumItemSelected: {
    backgroundColor: '#eef2ff',
    borderColor: '#667eea',
    shadowColor: '#667eea',
    shadowOpacity: 0.15,
    elevation: 3,
  },
  albumItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  albumThumbnail: {
    width: 50,
    height: 50,
    borderRadius: 10,
  },
  albumPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 10,
    backgroundColor: '#e5e7eb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  albumInfo: {
    flex: 1,
  },
  albumName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  albumMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  albumPhotoCount: {
    fontSize: 13,
    color: '#6b7280',
    fontWeight: '500',
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#d1d5db',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  checkboxSelected: {
    backgroundColor: '#667eea',
    borderColor: '#667eea',
  },
  commentsContent: {
    padding: 16,
  },
  commentItem: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 10,
  },
  commentAvatar: {
    backgroundColor: '#667eea',
  },
  commentContent: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  commentUser: {
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 6,
    fontSize: 15,
  },
  commentText: {
    color: '#374151',
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 6,
  },
  commentTime: {
    color: '#9ca3af',
    fontSize: 12,
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 30,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#6b7280',
    marginTop: 12,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 6,
    textAlign: 'center',
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    backgroundColor: '#fff',
  },
  selectedCount: {
    fontSize: 15,
    color: '#374151',
    fontWeight: '600',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#667eea',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  addButtonDisabled: {
    opacity: 0.5,
    shadowOpacity: 0,
    elevation: 0,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    gap: 10,
    backgroundColor: '#fff',
  },
  commentInput: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingVertical: 12,
    maxHeight: 120,
    fontSize: 15,
    color: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#667eea',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  sendButtonDisabled: {
    opacity: 0.4,
    backgroundColor: '#e5e7eb',
    shadowOpacity: 0,
    elevation: 0,
  },
});
