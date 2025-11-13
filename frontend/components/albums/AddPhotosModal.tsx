import React, { useState, useEffect } from 'react';
import {
  View,
  Modal,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Alert,
  FlatList,
} from 'react-native';
import { Text, IconButton, ActivityIndicator, Searchbar, Chip } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { albumService } from '../../src/services/albumService';
import { communityService, Post } from '../../src/services/communityService';

interface AddPhotosModalProps {
  visible: boolean;
  albumId: string;
  onClose: () => void;
  onPhotosAdded: () => void;
}

export default function AddPhotosModal({
  visible,
  albumId,
  onClose,
  onPhotosAdded,
}: AddPhotosModalProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedPostIds, setSelectedPostIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (visible) {
      loadUserPosts();
      setSelectedPostIds(new Set());
    }
  }, [visible]);

  const loadUserPosts = async () => {
    try {
      setLoading(true);
      // Get user's posts with images
      const response = await communityService.getFeed();
      const postsWithImages = response.data.filter(
        (post: Post) => post.mediaUrls && post.mediaUrls.length > 0
      );
      setPosts(postsWithImages);
    } catch (error: any) {
      console.error('Error loading posts:', error);
      Alert.alert('Error', 'Failed to load your posts');
    } finally {
      setLoading(false);
    }
  };

  const togglePostSelection = (postId: string) => {
    setSelectedPostIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(postId)) {
        newSet.delete(postId);
      } else {
        newSet.add(postId);
      }
      return newSet;
    });
  };

  const handleAddPhotos = async () => {
    if (selectedPostIds.size === 0) {
      Alert.alert('No Photos Selected', 'Please select at least one photo to add');
      return;
    }

    try {
      setSaving(true);
      await albumService.addPhotos(albumId, {
        postIds: Array.from(selectedPostIds),
      });
      Alert.alert(
        'Success',
        `Added ${selectedPostIds.size} photo${selectedPostIds.size > 1 ? 's' : ''} to album`
      );
      onPhotosAdded();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to add photos');
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    if (!saving) {
      onClose();
    }
  };

  const getImageUrl = (url: string): string => {
    if (!url) return url;
    if (url.startsWith('http') && !url.includes('localhost')) {
      return url;
    }
    const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';
    if (url.includes('localhost')) {
      const urlPath = url.split('/uploads/')[1];
      if (urlPath) {
        return `${API_URL}/uploads/${urlPath}`;
      }
    }
    if (url.startsWith('/uploads/')) {
      return `${API_URL}${url}`;
    }
    return url;
  };

  const filteredPosts = posts.filter((post) =>
    post.caption.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderPost = ({ item }: { item: Post }) => {
    const isSelected = selectedPostIds.has(item.id);
    const imageUrl = item.mediaUrls[0] ? getImageUrl(item.mediaUrls[0]) : '';

    return (
      <TouchableOpacity
        style={[styles.postItem, isSelected && styles.postItemSelected]}
        onPress={() => togglePostSelection(item.id)}
      >
        <Image source={{ uri: imageUrl }} style={styles.postImage} resizeMode="cover" />
        {isSelected && (
          <View style={styles.selectedOverlay}>
            <View style={styles.checkmarkContainer}>
              <MaterialCommunityIcons name="check" size={24} color="#fff" />
            </View>
          </View>
        )}
        {item.mediaUrls.length > 1 && (
          <View style={styles.multiplePhotosIndicator}>
            <MaterialCommunityIcons name="image-multiple" size={16} color="#fff" />
            <Text style={styles.multiplePhotosText}>{item.mediaUrls.length}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Photos</Text>
              <IconButton
                icon="close"
                size={24}
                onPress={handleClose}
                disabled={saving}
              />
            </View>

            {/* Search Bar */}
            <View style={styles.searchContainer}>
              <Searchbar
                placeholder="Search your posts..."
                onChangeText={setSearchQuery}
                value={searchQuery}
                style={styles.searchBar}
              />
            </View>

            {/* Selected Count */}
            {selectedPostIds.size > 0 && (
              <View style={styles.selectedCountContainer}>
                <Chip
                  icon="check-circle"
                  style={styles.selectedChip}
                  textStyle={styles.selectedChipText}
                >
                  {selectedPostIds.size} selected
                </Chip>
                <TouchableOpacity onPress={() => setSelectedPostIds(new Set())}>
                  <Text style={styles.clearSelectionText}>Clear</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Posts Grid */}
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#667eea" />
                <Text style={styles.loadingText}>Loading your posts...</Text>
              </View>
            ) : filteredPosts.length === 0 ? (
              <View style={styles.emptyContainer}>
                <MaterialCommunityIcons name="image-off" size={64} color="#ccc" />
                <Text style={styles.emptyText}>
                  {searchQuery ? 'No posts found' : 'No posts with photos yet'}
                </Text>
              </View>
            ) : (
              <FlatList
                data={filteredPosts}
                renderItem={renderPost}
                keyExtractor={(item) => item.id}
                numColumns={3}
                contentContainerStyle={styles.postsGrid}
                showsVerticalScrollIndicator={false}
              />
            )}

            {/* Actions */}
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={handleClose}
                disabled={saving}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.addButton,
                  (saving || selectedPostIds.size === 0) && styles.addButtonDisabled,
                ]}
                onPress={handleAddPhotos}
                disabled={saving || selectedPostIds.size === 0}
              >
                {saving ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.addButtonText}>
                    Add {selectedPostIds.size > 0 ? `(${selectedPostIds.size})` : ''}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 20,
    marginHorizontal: 20,
    width: '90%',
    maxWidth: 600,
    maxHeight: '90%',
  },
  modalContent: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  searchContainer: {
    padding: 16,
  },
  searchBar: {
    backgroundColor: '#f9fafb',
    elevation: 0,
  },
  selectedCountContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  selectedChip: {
    backgroundColor: '#eef2ff',
  },
  selectedChipText: {
    color: '#667eea',
    fontWeight: '600',
  },
  clearSelectionText: {
    color: '#667eea',
    fontSize: 14,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 12,
    color: '#6b7280',
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
  postsGrid: {
    padding: 16,
    paddingBottom: 0,
  },
  postItem: {
    flex: 1,
    aspectRatio: 1,
    margin: 4,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  postItemSelected: {
    borderColor: '#667eea',
  },
  postImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f0f2f5',
  },
  selectedOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(102, 126, 234, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#667eea',
    justifyContent: 'center',
    alignItems: 'center',
  },
  multiplePhotosIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  multiplePhotosText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
  },
  addButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#667eea',
    alignItems: 'center',
  },
  addButtonDisabled: {
    opacity: 0.5,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
