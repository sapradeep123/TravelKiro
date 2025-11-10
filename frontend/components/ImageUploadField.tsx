import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Alert, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

export interface SelectedImage {
  uri: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
}

interface ImageUploadFieldProps {
  images: SelectedImage[];
  onImagesChange: (images: SelectedImage[]) => void;
  maxImages?: number;
  maxSizeInMB?: number;
}

export default function ImageUploadField({
  images,
  onImagesChange,
  maxImages = 10,
  maxSizeInMB = 5
}: ImageUploadFieldProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const pickImages = async () => {
    try {
      // Request permission
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission Required', 'Please grant permission to access your photos');
          return;
        }
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 1,
        selectionLimit: maxImages - images.length,
      });

      if (!result.canceled && result.assets) {
        const newImages: SelectedImage[] = [];
        const errors: string[] = [];

        for (const asset of result.assets) {
          // Validate file size
          const fileSizeInMB = asset.fileSize ? asset.fileSize / (1024 * 1024) : 0;
          
          if (fileSizeInMB > maxSizeInMB) {
            errors.push(`${asset.fileName || 'Image'} is ${fileSizeInMB.toFixed(1)}MB (max ${maxSizeInMB}MB)`);
            continue;
          }

          // Validate file type
          const mimeType = asset.mimeType || asset.uri.split('.').pop()?.toLowerCase() || '';
          const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'jpeg', 'jpg', 'png', 'webp'];
          
          if (!validTypes.some(type => mimeType.includes(type))) {
            errors.push(`${asset.fileName || 'Image'} has invalid type (only JPEG, PNG, WebP allowed)`);
            continue;
          }

          newImages.push({
            uri: asset.uri,
            fileName: asset.fileName || `image-${Date.now()}.jpg`,
            fileSize: asset.fileSize || 0,
            mimeType: asset.mimeType || 'image/jpeg'
          });
        }

        if (errors.length > 0) {
          Alert.alert('Some images were skipped', errors.join('\n'));
        }

        if (newImages.length > 0) {
          onImagesChange([...images, ...newImages]);
        }
      }
    } catch (error) {
      console.error('Error picking images:', error);
      Alert.alert('Error', 'Failed to pick images. Please try again.');
    }
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);
  };

  const moveImage = (fromIndex: number, toIndex: number) => {
    const newImages = [...images];
    const [movedImage] = newImages.splice(fromIndex, 1);
    newImages.splice(toIndex, 0, movedImage);
    onImagesChange(newImages);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <View style={styles.container}>
      {/* Upload Button */}
      <TouchableOpacity
        style={styles.uploadButton}
        onPress={pickImages}
        disabled={images.length >= maxImages}
      >
        <Ionicons name="cloud-upload-outline" size={24} color="#6366f1" />
        <Text style={styles.uploadButtonText}>
          {images.length === 0 ? 'Upload Images' : `Add More Images (${images.length}/${maxImages})`}
        </Text>
        <Text style={styles.uploadHint}>
          JPEG, PNG, WebP • Max {maxSizeInMB}MB each
        </Text>
      </TouchableOpacity>

      {/* Image Preview Grid */}
      {images.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.previewScroll}>
          <View style={styles.previewGrid}>
            {images.map((image, index) => (
              <TouchableOpacity
                key={index}
                style={styles.previewCard}
                activeOpacity={1}
                onPressIn={() => setHoveredIndex(index)}
                onPressOut={() => setHoveredIndex(null)}
              >
                <Image source={{ uri: image.uri }} style={styles.previewImage} />
                
                {/* Remove Button Overlay */}
                {(hoveredIndex === index || Platform.OS !== 'web') && (
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => removeImage(index)}
                  >
                    <Ionicons name="close-circle" size={24} color="#ef4444" />
                  </TouchableOpacity>
                )}

                {/* Reorder Buttons */}
                {images.length > 1 && (
                  <View style={styles.reorderButtons}>
                    {index > 0 && (
                      <TouchableOpacity
                        style={styles.reorderButton}
                        onPress={() => moveImage(index, index - 1)}
                      >
                        <Ionicons name="chevron-back" size={16} color="#6366f1" />
                      </TouchableOpacity>
                    )}
                    {index < images.length - 1 && (
                      <TouchableOpacity
                        style={styles.reorderButton}
                        onPress={() => moveImage(index, index + 1)}
                      >
                        <Ionicons name="chevron-forward" size={16} color="#6366f1" />
                      </TouchableOpacity>
                    )}
                  </View>
                )}

                {/* Image Info */}
                <View style={styles.imageInfo}>
                  <Text style={styles.fileName} numberOfLines={1}>
                    {image.fileName}
                  </Text>
                  <Text style={styles.fileSize}>
                    {formatFileSize(image.fileSize)}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  uploadButton: {
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderStyle: 'dashed',
    borderRadius: 8,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f9fafb',
  },
  uploadButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6366f1',
    marginTop: 8,
  },
  uploadHint: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  previewScroll: {
    marginTop: 16,
  },
  previewGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  previewCard: {
    width: 150,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#ffffff',
    overflow: 'hidden',
  },
  previewImage: {
    width: '100%',
    height: 120,
    resizeMode: 'cover',
  },
  removeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#ffffff',
    borderRadius: 12,
  },
  reorderButtons: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  reorderButton: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  imageInfo: {
    padding: 8,
  },
  fileName: {
    fontSize: 12,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 2,
  },
  fileSize: {
    fontSize: 11,
    color: '#6b7280',
  },
});
