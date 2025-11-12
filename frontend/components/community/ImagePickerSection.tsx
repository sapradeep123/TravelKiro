import React from 'react';
import { View, StyleSheet, Image, TouchableOpacity, Alert, FlatList } from 'react-native';
import { Button, Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

export interface SelectedImage {
  uri: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  width: number;
  height: number;
  order: number;
}

interface ImagePickerSectionProps {
  images: SelectedImage[];
  onImagesSelected: (images: SelectedImage[]) => void;
  onImageRemoved: (index: number) => void;
  onImagesReordered: (images: SelectedImage[]) => void;
  maxImages: number;
}

const ImagePickerSection = React.memo(function ImagePickerSection({
  images,
  onImagesSelected,
  onImageRemoved,
  onImagesReordered,
  maxImages = 10
}: ImagePickerSectionProps) {
  
  const requestPermissions = async (type: 'camera' | 'gallery') => {
    try {
      if (type === 'camera') {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert(
            'Camera Permission Required',
            'Please allow camera access in your device settings to capture photos.',
            [{ text: 'OK' }]
          );
          return false;
        }
      } else {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert(
            'Photo Library Permission Required',
            'Please allow photo library access in your device settings to select photos.',
            [{ text: 'OK' }]
          );
          return false;
        }
      }
      return true;
    } catch (error) {
      console.error('Permission error:', error);
      return false;
    }
  };

  const validateImage = (asset: ImagePicker.ImagePickerAsset): { valid: boolean; error?: string } => {
    // Check file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const mimeType = asset.mimeType || asset.uri.split('.').pop()?.toLowerCase();
    
    if (mimeType && !allowedTypes.includes(mimeType) && !['jpeg', 'jpg', 'png', 'webp'].includes(mimeType)) {
      return {
        valid: false,
        error: `Invalid file type. Only JPEG, PNG, and WebP are allowed.`
      };
    }

    // Check file size (10MB limit)
    const fileSizeInMB = (asset.fileSize || 0) / (1024 * 1024);
    if (asset.fileSize && fileSizeInMB > 10) {
      return {
        valid: false,
        error: `File "${asset.fileName || 'image'}" is ${fileSizeInMB.toFixed(1)}MB. Maximum size is 10MB.`
      };
    }

    return { valid: true };
  };

  const handleCameraPress = async () => {
    const hasPermission = await requestPermissions('camera');
    if (!hasPermission) return;

    if (images.length >= maxImages) {
      Alert.alert('Maximum Images Reached', `You can only upload up to ${maxImages} images per post.`);
      return;
    }

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.9,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const validation = validateImage(asset);
        
        if (!validation.valid) {
          Alert.alert('Invalid Image', validation.error || 'Please select a valid image.');
          return;
        }

        const newImage: SelectedImage = {
          uri: asset.uri,
          fileName: asset.fileName || `photo_${Date.now()}.jpg`,
          fileSize: asset.fileSize || 0,
          mimeType: asset.mimeType || 'image/jpeg',
          width: asset.width,
          height: asset.height,
          order: images.length
        };

        onImagesSelected([...images, newImage]);
      }
    } catch (error) {
      console.error('Camera error:', error);
      Alert.alert('Camera Error', 'Failed to capture photo. Please try again.');
    }
  };

  const handleGalleryPress = async () => {
    const hasPermission = await requestPermissions('gallery');
    if (!hasPermission) return;

    const remainingSlots = maxImages - images.length;
    if (remainingSlots <= 0) {
      Alert.alert('Maximum Images Reached', `You can only upload up to ${maxImages} images per post.`);
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.9,
        selectionLimit: remainingSlots,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const validImages: SelectedImage[] = [];
        const errors: string[] = [];

        for (const asset of result.assets) {
          const validation = validateImage(asset);
          
          if (validation.valid) {
            validImages.push({
              uri: asset.uri,
              fileName: asset.fileName || `photo_${Date.now()}.jpg`,
              fileSize: asset.fileSize || 0,
              mimeType: asset.mimeType || 'image/jpeg',
              width: asset.width,
              height: asset.height,
              order: images.length + validImages.length
            });
          } else {
            errors.push(validation.error || 'Invalid image');
          }
        }

        if (validImages.length > 0) {
          onImagesSelected([...images, ...validImages]);
        }

        if (errors.length > 0) {
          Alert.alert('Some Images Invalid', errors.join('\n'));
        }
      }
    } catch (error) {
      console.error('Gallery error:', error);
      Alert.alert('Gallery Error', 'Failed to select photos. Please try again.');
    }
  };

  const handleRemoveImage = (index: number) => {
    onImageRemoved(index);
  };

  const canAddMore = images.length < maxImages;

  return (
    <View style={styles.container}>
      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        <Button
          mode="contained"
          icon="camera"
          onPress={handleCameraPress}
          disabled={!canAddMore}
          style={[styles.button, !canAddMore && styles.buttonDisabled]}
        >
          Take Photo
        </Button>
        <Button
          mode="contained"
          icon="image-multiple"
          onPress={handleGalleryPress}
          disabled={!canAddMore}
          style={[styles.button, !canAddMore && styles.buttonDisabled]}
        >
          Choose from Gallery
        </Button>
      </View>

      {/* Image Counter */}
      {images.length > 0 && (
        <View style={styles.counterContainer}>
          <MaterialCommunityIcons name="image-multiple" size={20} color="#667eea" />
          <Text style={styles.counterText}>
            {images.length}/{maxImages} images selected
          </Text>
        </View>
      )}

      {/* Image Grid */}
      {images.length > 0 && (
        <View style={styles.imageListContainer}>
          <FlatList
            data={images}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item, index) => `${item.uri}-${index}`}
            renderItem={({ item, index }) => (
              <View style={styles.imageContainer}>
                <Image source={{ uri: item.uri }} style={styles.imageThumbnail} />
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => handleRemoveImage(index)}
                >
                  <MaterialCommunityIcons name="close-circle" size={24} color="#fff" />
                </TouchableOpacity>
                <View style={styles.imageNumber}>
                  <Text style={styles.imageNumberText}>{index + 1}</Text>
                </View>
              </View>
            )}
          />
        </View>
      )}

      {/* Empty State */}
      {images.length === 0 && (
        <View style={styles.emptyState}>
          <MaterialCommunityIcons name="image-plus" size={64} color="#ccc" />
          <Text style={styles.emptyText}>No images selected</Text>
          <Text style={styles.emptySubtext}>Tap a button above to add photos</Text>
        </View>
      )}
    </View>
  );
});

export default ImagePickerSection;

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  button: {
    flex: 1,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  counterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  counterText: {
    fontSize: 14,
    color: '#667eea',
    fontWeight: '600',
  },
  imageListContainer: {
    marginBottom: 16,
    height: 140,
  },
  imageContainer: {
    position: 'relative',
    width: 120,
    height: 120,
    borderRadius: 8,
    overflow: 'hidden',
    marginRight: 12,
  },
  imageThumbnail: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  removeButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 12,
  },
  imageNumber: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageNumberText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginTop: 12,
    fontWeight: '600',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 4,
  },
});
