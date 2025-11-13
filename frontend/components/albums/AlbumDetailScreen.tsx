import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
  RefreshControl,
  useWindowDimensions,
  Platform,
} from 'react-native';
import { Text, ActivityIndicator, IconButton, Menu, Chip } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { albumService } from '../../src/services/albumService';
import { Album, AlbumPhoto } from '../../src/types';
import EditAlbumModal from './EditAlbumModal';
import AddPhotosModal from './AddPhotosModal';
import PhotoViewerModal from './PhotoViewerModal';

interface AlbumDetailScreenProps {
  albumId: string;
  currentUserId?: string;
  onBack: () => void;
}

export default function AlbumDetailScreen({
  albumId,
  currentUserId,
  onBack,
}: AlbumDetailScreenProps) {
  const [album, setAlbum] = useState<Album | null>(null);
  const [photos, setPhotos] = useState<AlbumPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [addPhotosModalVisible, setAddPhotosModalVisible] = useState(false);
  const [photoViewerVisible, setPhotoViewerVisible] = useState(false);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const { width } = useWindowDimensions();

  const isOwner = album?.userId === currentUserId;
  const isWeb = Platform.OS === 'web';
  const numColumns = width > 1200 ? 4 : width > 768 ? 3 : 2;

  useEffect(() => {
    loadAlbumData();
  }, [albumId]);

  const loadAlbumData = async () => {
    try {
      setLoading(true);
      const albumData = await albumService.getAlbum(albumId);
      setAlbum(albumData);
      setPhotos(albumData.photos || []);
    } catch (error: any) {
      console.error('Error loading album:', error);
      Alert.alert('Error', error.message || 'Failed to load album');
      onBack();
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadAlbumData();
    setRefreshing(false);
  };

  const handleEditAlbum = () => {
    setMenuVisible(false);
    setEditModalVisible(true);
  };

  const handleDeleteAlbum = () => {
    setMenuVisible(false);
    Alert.alert(
      'Delete Album',
      'Are you sure you want to delete this album? All photos will be removed from the album (but not deleted from posts).',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await albumService.deleteAlbum(albumId);
              Alert.alert('Success', 'Album deleted successfully');
              onBack();
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to delete album');
            }
          },
        },
      ]
    );
  };

  const handleRemovePhoto = (photoId: string) => {
    Alert.alert(
      'Remove Photo',
      'Remove this photo from the album? The original post will not be affected.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await albumService.removePhoto(albumId, photoId);
              setPhotos(photos.filter((p) => p.id !== photoId));
              setAlbum((prev) =>
                prev ? { ...prev, photoCount: prev.photoCount - 1 } : null
              );
              Alert.alert('Success', 'Photo removed from album');
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to remove photo');
            }
          },
        },
      ]
    );
  };

  const handleAlbumUpdated = (updatedAlbum: Album) => {
    setAlbum(updatedAlbum);
    setEditModalVisible(false);
  };

  const handlePhotosAdded = async () => {
    setAddPhotosModalVisible(false);
    await loadAlbumData();
  };

  const handlePhotoClick = (index: number) => {
    setSelectedPhotoIndex(index);
    setPhotoViewerVisible(true);
  };

  const handleCommentStatusChange = (photoId: string, status: any) => {
    setPhotos((prevPhotos) =>
      prevPhotos.map((p) => (p.id === photoId ? { ...p, commentStatus: status } : p))
    );
  };

  const getPrivacyIcon = (privacy: string) => {
    switch (privacy) {
      case 'PUBLIC':
        return 'earth';
      case 'FRIENDS_ONLY':
        return 'account-multiple';
      case 'PRIVATE':
        return 'lock';
      default:
        return 'earth';
    }
  };

  const getPrivacyLabel = (privacy: string) => {
    switch (privacy) {
      case 'PUBLIC':
        return 'Public';
      case 'FRIENDS_ONLY':
        return 'Friends Only';
      case 'PRIVATE':
        return 'Private';
      default:
        return 'Public';
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

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#667eea" />
        <Text style={styles.loadingText}>Loading album...</Text>
      </View>
    );
  }

  if (!album) {
    return (
      <View style={styles.centerContainer}>
        <MaterialCommunityIcons name="image-album" size={64} color="#ccc" />
        <Text style={styles.emptyText}>Album not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Album Header */}
        <View style={styles.albumHeader}>
          <View style={styles.albumHeaderTop}>
            <View style={styles.albumInfo}>
              <Text style={styles.albumName}>{album.name}</Text>
              <View style={styles.albumMeta}>
                <Chip
                  icon={getPrivacyIcon(album.privacy)}
                  style={styles.privacyChip}
                  textStyle={styles.chipText}
                  compact
                >
                  {getPrivacyLabel(album.privacy)}
                </Chip>
                <Text style={styles.photoCount}>
                  {album.photoCount} {album.photoCount === 1 ? 'photo' : 'photos'}
                </Text>
              </View>
            </View>

            {isOwner && (
              <Menu
                visible={menuVisible}
                onDismiss={() => setMenuVisible(false)}
                anchor={
                  <IconButton
                    icon="dots-vertical"
                    size={24}
                    onPress={() => setMenuVisible(true)}
                  />
                }
              >
                <Menu.Item
                  onPress={handleEditAlbum}
                  title="Edit Album"
                  leadingIcon="pencil"
                />
                <Menu.Item
                  onPress={handleDeleteAlbum}
                  title="Delete Album"
                  leadingIcon="delete"
                />
              </Menu>
            )}
          </View>

          {album.description && (
            <Text style={styles.albumDescription}>{album.description}</Text>
          )}

          {isOwner && (
            <TouchableOpacity
              style={styles.addPhotosButton}
              onPress={() => setAddPhotosModalVisible(true)}
            >
              <MaterialCommunityIcons name="plus" size={20} color="#fff" />
              <Text style={styles.addPhotosButtonText}>Add Photos</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Photos Grid */}
        {photos.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="image-multiple" size={64} color="#ccc" />
            <Text style={styles.emptyText}>No photos in this album yet</Text>
            {isOwner && (
              <TouchableOpacity
                style={styles.addPhotosButtonSecondary}
                onPress={() => setAddPhotosModalVisible(true)}
              >
                <Text style={styles.addPhotosButtonSecondaryText}>Add Photos</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <View style={styles.photosGrid}>
            {photos.map((photo) => (
              <View
                key={photo.id}
                style={[
                  styles.photoItem,
                  { width: `${100 / numColumns - 2}%` },
                ]}
              >
                <TouchableOpacity
                  style={styles.photoTouchable}
                  onPress={() => handlePhotoClick(photos.indexOf(photo))}
                >
                  <Image
                    source={{ uri: getImageUrl(photo.photoUrl) }}
                    style={styles.photoImage}
                    resizeMode="cover"
                  />
                  {isOwner && (
                    <TouchableOpacity
                      style={styles.removePhotoButton}
                      onPress={() => handleRemovePhoto(photo.id)}
                    >
                      <MaterialCommunityIcons name="close-circle" size={24} color="#fff" />
                    </TouchableOpacity>
                  )}
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Edit Album Modal */}
      <EditAlbumModal
        visible={editModalVisible}
        album={album}
        onClose={() => setEditModalVisible(false)}
        onAlbumUpdated={handleAlbumUpdated}
      />

      {/* Add Photos Modal */}
      <AddPhotosModal
        visible={addPhotosModalVisible}
        albumId={albumId}
        onClose={() => setAddPhotosModalVisible(false)}
        onPhotosAdded={handlePhotosAdded}
      />

      {/* Photo Viewer Modal */}
      {photos.length > 0 && (
        <PhotoViewerModal
          visible={photoViewerVisible}
          photos={photos}
          initialIndex={selectedPhotoIndex}
          albumOwnerId={album.userId}
          onClose={() => setPhotoViewerVisible(false)}
          onCommentStatusChange={handleCommentStatusChange}
        />
      )}
    </View>
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
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    color: '#6b7280',
    fontSize: 14,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  albumHeader: {
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 16,
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 16,
  },
  albumHeaderTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  albumInfo: {
    flex: 1,
  },
  albumName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  albumMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  privacyChip: {
    backgroundColor: '#eef2ff',
  },
  chipText: {
    fontSize: 12,
    color: '#667eea',
  },
  photoCount: {
    fontSize: 14,
    color: '#6b7280',
  },
  albumDescription: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    marginBottom: 16,
  },
  addPhotosButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#667eea',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    gap: 8,
  },
  addPhotosButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  addPhotosButtonSecondary: {
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: '#667eea',
    borderRadius: 8,
  },
  addPhotosButtonSecondaryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6b7280',
  },
  photosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 8,
  },
  photoItem: {
    aspectRatio: 1,
    marginBottom: 8,
  },
  photoTouchable: {
    width: '100%',
    height: '100%',
    position: 'relative',
    borderRadius: 8,
    overflow: 'hidden',
  },
  photoImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f0f2f5',
  },
  removePhotoButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 12,
  },
});
