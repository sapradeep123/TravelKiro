/**
 * Test component for PhotoManagementModal
 * This component demonstrates and tests the photo management functionality
 */

import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { Text, Button, Card } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import PhotoManagementModal from './PhotoManagementModal';
import { TEST_PHOTOS, TEST_ALBUMS, getTestPhotos } from '../../src/utils/testPhotoData';

export default function PhotoManagementTest() {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<{ url: string; postId: string } | null>(null);
  const [testMode, setTestMode] = useState<'online' | 'offline'>('online');

  const photos = testMode === 'offline' ? getTestPhotos(true) : TEST_PHOTOS;

  const handlePhotoClick = (photo: typeof TEST_PHOTOS[0]) => {
    setSelectedPhoto({ url: photo.url, postId: photo.postId });
    setModalVisible(true);
  };

  const handleClose = () => {
    setModalVisible(false);
    setSelectedPhoto(null);
  };

  const handleRefresh = () => {
    Alert.alert('Success', 'Photo added to album(s) successfully!');
    console.log('[Test] Refresh triggered');
  };

  return (
    <View style={styles.container}>
      <Card style={styles.headerCard}>
        <Card.Content>
          <Text variant="headlineSmall" style={styles.title}>
            Photo Management Test
          </Text>
          <Text variant="bodyMedium" style={styles.subtitle}>
            Click on any photo to test the management modal
          </Text>
          
          <View style={styles.modeToggle}>
            <Button
              mode={testMode === 'online' ? 'contained' : 'outlined'}
              onPress={() => setTestMode('online')}
              style={styles.modeButton}
            >
              Online (Unsplash)
            </Button>
            <Button
              mode={testMode === 'offline' ? 'contained' : 'outlined'}
              onPress={() => setTestMode('offline')}
              style={styles.modeButton}
            >
              Offline (Placeholders)
            </Button>
          </View>
        </Card.Content>
      </Card>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.photosGrid}>
          {photos.map((photo) => (
            <TouchableOpacity
              key={photo.id}
              style={styles.photoCard}
              onPress={() => handlePhotoClick(photo)}
              activeOpacity={0.8}
            >
              <Image source={{ uri: photo.url }} style={styles.photoImage} />
              <View style={styles.photoOverlay}>
                <MaterialCommunityIcons name="image-plus" size={32} color="#fff" />
              </View>
              <View style={styles.photoInfo}>
                <Text style={styles.photoCaption} numberOfLines={1}>
                  {photo.caption}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <Card style={styles.infoCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.infoTitle}>
              Test Instructions
            </Text>
            <View style={styles.instructionsList}>
              <View style={styles.instructionItem}>
                <MaterialCommunityIcons name="numeric-1-circle" size={24} color="#667eea" />
                <Text style={styles.instructionText}>
                  Click on any photo above to open the management modal
                </Text>
              </View>
              <View style={styles.instructionItem}>
                <MaterialCommunityIcons name="numeric-2-circle" size={24} color="#667eea" />
                <Text style={styles.instructionText}>
                  Test the "Add to Albums" tab - select albums and add the photo
                </Text>
              </View>
              <View style={styles.instructionItem}>
                <MaterialCommunityIcons name="numeric-3-circle" size={24} color="#667eea" />
                <Text style={styles.instructionText}>
                  Test the "Comments" tab - view and add comments
                </Text>
              </View>
              <View style={styles.instructionItem}>
                <MaterialCommunityIcons name="numeric-4-circle" size={24} color="#667eea" />
                <Text style={styles.instructionText}>
                  Toggle between online/offline mode to test with different image sources
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        <Card style={styles.infoCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.infoTitle}>
              Test Data Summary
            </Text>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <MaterialCommunityIcons name="image" size={32} color="#667eea" />
                <Text style={styles.statNumber}>{photos.length}</Text>
                <Text style={styles.statLabel}>Test Photos</Text>
              </View>
              <View style={styles.statItem}>
                <MaterialCommunityIcons name="image-album" size={32} color="#764ba2" />
                <Text style={styles.statNumber}>{TEST_ALBUMS.length}</Text>
                <Text style={styles.statLabel}>Test Albums</Text>
              </View>
              <View style={styles.statItem}>
                <MaterialCommunityIcons name="comment" size={32} color="#4facfe" />
                <Text style={styles.statNumber}>3</Text>
                <Text style={styles.statLabel}>Sample Comments</Text>
              </View>
            </View>
          </Card.Content>
        </Card>
      </ScrollView>

      {/* Photo Management Modal */}
      <PhotoManagementModal
        visible={modalVisible}
        photoUrl={selectedPhoto?.url || ''}
        postId={selectedPhoto?.postId}
        onClose={handleClose}
        currentUserId="user-1"
        albums={TEST_ALBUMS as any}
        onRefresh={handleRefresh}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f2f5',
  },
  headerCard: {
    margin: 16,
    marginBottom: 8,
  },
  title: {
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    color: '#6b7280',
    marginBottom: 16,
  },
  modeToggle: {
    flexDirection: 'row',
    gap: 12,
  },
  modeButton: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingTop: 8,
  },
  photosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  photoCard: {
    width: '48%',
    aspectRatio: 1,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  photoImage: {
    width: '100%',
    height: '100%',
  },
  photoOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0,
  },
  photoInfo: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 8,
  },
  photoCaption: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  infoCard: {
    marginBottom: 16,
  },
  infoTitle: {
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  instructionsList: {
    gap: 12,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  instructionText: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    gap: 8,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
});
