import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Alert, Platform, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { communityTheme, responsiveUtils } from '../../src/theme';

export interface SelectedMedia {
  uri: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  type: 'IMAGE' | 'VIDEO';
  duration?: number;
}

interface MediaUploaderProps {
  media: SelectedMedia[];
  onMediaChange: (media: SelectedMedia[]) => void;
  maxMedia?: number;
  maxSizeInMB?: number;
  uploadProgress?: number;
}

export default function MediaUploader({
  media,
  onMediaChange,
  maxMedia = 10,
  maxSizeInMB = 10,
  uploadProgress
}: MediaUploaderProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const pickMedia = async () => {
    try {
      // Request permission
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission Required', 'Please grant permission to access your photos and videos');
          return;
        }
      }

      // Launch media picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsMultipleSelection: true,
        quality: 1,
        selectionLimit: maxMedia - media.length,
        videoMaxDuration: 60, // 60 seconds max for videos
      });

      if (!result.canceled && result.assets) {
        const newMedia: SelectedMedia[] = [];
        const errors: string[] = [];

        for (const asset of result.assets) {
          // Validate file size
          const fileSizeInMB = asset.fileSize ? asset.fileSize / (1024 * 1024) : 0;
          
          if (fileSizeInMB > maxSizeInMB) {
            errors.push(`${asset.fileName || 'File'} is ${fileSizeInMB.toFixed(1)}MB (max ${maxSizeInMB}MB)`);
            continue;
          }

          // Determine media type
          const mimeType = asset.mimeType || asset.uri.split('.').pop()?.toLowerCase() || '';
          let mediaType: 'IMAGE' | 'VIDEO' = 'IMAGE';
          
          if (asset.type === 'video' || mimeType.includes('video')) {
            mediaType = 'VIDEO';
            // Validate video types
            const validVideoTypes = ['video/mp4', 'video/quicktime', 'mp4', 'mov'];
            if (!validVideoTypes.some(type => mimeType.includes(type))) {
              errors.push(`${asset.fileName || 'Video'} has invalid type (only MP4, MOV allowed)`);
              continue;
            }
          } else {
            // Validate image types
            const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'jpeg', 'jpg', 'png', 'gif'];
            if (!validImageTypes.some(type => mimeType.includes(type))) {
              errors.push(`${asset.fileName || 'Image'} has invalid type (only JPEG, PNG, GIF allowed)`);
              continue;
            }
          }

          newMedia.push({
            uri: asset.uri,
            fileName: asset.fileName || `${mediaType.toLowerCase()}-${Date.now()}.${mediaType === 'VIDEO' ? 'mp4' : 'jpg'}`,
            fileSize: asset.fileSize || 0,
            mimeType: asset.mimeType || (mediaType === 'VIDEO' ? 'video/mp4' : 'image/jpeg'),
            type: mediaType,
            duration: asset.duration || undefined
          });
        }

        if (errors.length > 0) {
          Alert.alert('Some files were skipped', errors.join('\n'));
        }

        if (newMedia.length > 0) {
          onMediaChange([...media, ...newMedia]);
        }
      }
    } catch (error) {
      console.error('Error picking media:', error);
      Alert.alert('Error', 'Failed to pick media. Please try again.');
    }
  };

  const removeMedia = (index: number) => {
    const newMedia = media.filter((_, i) => i !== index);
    onMediaChange(newMedia);
  };

  const moveMedia = (fromIndex: number, toIndex: number) => {
    const newMedia = [...media];
    const [movedMedia] = newMedia.splice(fromIndex, 1);
    newMedia.splice(toIndex, 0, movedMedia);
    onMediaChange(newMedia);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDuration = (seconds?: number): string => {
    if (!seconds) return '';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      {/* Upload Button */}
      <TouchableOpacity
        style={styles.uploadButton}
        onPress={pickMedia}
        disabled={media.length >= maxMedia || uploadProgress !== undefined}
      >
        <Ionicons name="images-outline" size={24} color="#667eea" />
        <Text style={styles.uploadButtonText}>
          {media.length === 0 ? 'Add Photos or Videos' : `Add More (${media.length}/${maxMedia})`}
        </Text>
        <Text style={styles.uploadHint}>
          Images: JPG, PNG, GIF • Videos: MP4, MOV • Max {maxSizeInMB}MB each
        </Text>
      </TouchableOpacity>

      {/* Upload Progress */}
      {uploadProgress !== undefined && (
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${uploadProgress}%` }]} />
          </View>
          <Text style={styles.progressText}>{Math.round(uploadProgress)}%</Text>
        </View>
      )}

      {/* Media Preview Grid */}
      {media.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.previewScroll}>
          <View style={styles.previewGrid}>
            {media.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={styles.previewCard}
                activeOpacity={1}
                onPressIn={() => setHoveredIndex(index)}
                onPressOut={() => setHoveredIndex(null)}
              >
                <Image source={{ uri: item.uri }} style={styles.previewImage} />
                
                {/* Video Indicator */}
                {item.type === 'VIDEO' && (
                  <View style={styles.videoIndicator}>
                    <Ionicons name="play-circle" size={32} color="#fff" />
                    {item.duration && (
                      <Text style={styles.videoDuration}>{formatDuration(item.duration)}</Text>
                    )}
                  </View>
                )}

                {/* Remove Button Overlay */}
                {(hoveredIndex === index || Platform.OS !== 'web') && (
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => removeMedia(index)}
                  >
                    <Ionicons name="close-circle" size={24} color="#ef4444" />
                  </TouchableOpacity>
                )}

                {/* Reorder Buttons */}
                {media.length > 1 && (
                  <View style={styles.reorderButtons}>
                    {index > 0 && (
                      <TouchableOpacity
                        style={styles.reorderButton}
                        onPress={() => moveMedia(index, index - 1)}
                      >
                        <Ionicons name="chevron-back" size={16} color="#667eea" />
                      </TouchableOpacity>
                    )}
                    {index < media.length - 1 && (
                      <TouchableOpacity
                        style={styles.reorderButton}
                        onPress={() => moveMedia(index, index + 1)}
                      >
                        <Ionicons name="chevron-forward" size={16} color="#667eea" />
                      </TouchableOpacity>
                    )}
                  </View>
                )}

                {/* Media Info */}
                <View style={styles.mediaInfo}>
                  <View style={styles.mediaInfoHeader}>
                    <Ionicons 
                      name={item.type === 'VIDEO' ? 'videocam' : 'image'} 
                      size={12} 
                      color="#667eea" 
                    />
                    <Text style={styles.fileName} numberOfLines={1}>
                      {item.fileName}
                    </Text>
                  </View>
                  <Text style={styles.fileSize}>
                    {formatFileSize(item.fileSize)}
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
    marginBottom: communityTheme.spacing.base,
  },
  uploadButton: {
    borderWidth: 2,
    borderColor: communityTheme.colors.border,
    borderStyle: 'dashed',
    borderRadius: communityTheme.borderRadius.lg,
    padding: communityTheme.spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: communityTheme.colors.surfaceVariant,
    minHeight: communityTheme.touchTarget.min,
    ...Platform.select({
      web: {
        cursor: 'pointer',
        transition: 'background-color 0.2s ease, border-color 0.2s ease',
        ':hover': {
          backgroundColor: communityTheme.colors.surface,
          borderColor: communityTheme.colors.primary,
        },
      },
    }),
  },
  uploadButtonText: {
    fontSize: communityTheme.typography.fontSize.base,
    fontWeight: communityTheme.typography.fontWeight.semibold,
    color: communityTheme.colors.primary,
    marginTop: communityTheme.spacing.sm,
  },
  uploadHint: {
    fontSize: communityTheme.typography.fontSize.xs,
    color: communityTheme.colors.textSecondary,
    marginTop: communityTheme.spacing.xs,
    textAlign: 'center',
  },
  progressContainer: {
    marginTop: communityTheme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: communityTheme.spacing.md,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: communityTheme.colors.border,
    borderRadius: communityTheme.borderRadius.xs,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: communityTheme.colors.primary,
    borderRadius: communityTheme.borderRadius.xs,
  },
  progressText: {
    fontSize: communityTheme.typography.fontSize.sm,
    fontWeight: communityTheme.typography.fontWeight.semibold,
    color: communityTheme.colors.primary,
    minWidth: 40,
  },
  previewScroll: {
    marginTop: communityTheme.spacing.base,
  },
  previewGrid: {
    flexDirection: 'row',
    gap: communityTheme.spacing.md,
  },
  previewCard: {
    width: communityTheme.responsive({
      mobile: 150,
      tablet: 180,
      desktop: 200,
    }),
    borderRadius: communityTheme.borderRadius.lg,
    borderWidth: 1,
    borderColor: communityTheme.colors.border,
    backgroundColor: communityTheme.colors.surface,
    overflow: 'hidden',
    ...communityTheme.shadows.sm,
  },
  previewImage: {
    width: '100%',
    height: 120,
    resizeMode: 'cover',
  },
  videoIndicator: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: communityTheme.colors.overlayLight,
  },
  videoDuration: {
    position: 'absolute',
    bottom: communityTheme.spacing.sm,
    right: communityTheme.spacing.sm,
    backgroundColor: communityTheme.colors.overlay,
    color: communityTheme.colors.surface,
    fontSize: communityTheme.typography.fontSize.xs,
    fontWeight: communityTheme.typography.fontWeight.semibold,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: communityTheme.borderRadius.xs,
  },
  removeButton: {
    position: 'absolute',
    top: communityTheme.spacing.sm,
    right: communityTheme.spacing.sm,
    backgroundColor: communityTheme.colors.surface,
    borderRadius: communityTheme.borderRadius.md,
    ...communityTheme.shadows.sm,
    ...Platform.select({
      web: {
        cursor: 'pointer',
        transition: 'transform 0.2s ease',
        ':hover': {
          transform: 'scale(1.1)',
        },
      },
    }),
  },
  reorderButtons: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: communityTheme.spacing.sm,
  },
  reorderButton: {
    backgroundColor: communityTheme.colors.surface,
    borderRadius: communityTheme.borderRadius.md,
    padding: communityTheme.spacing.xs,
    borderWidth: 1,
    borderColor: communityTheme.colors.border,
    ...communityTheme.shadows.sm,
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
  mediaInfo: {
    padding: communityTheme.spacing.sm,
  },
  mediaInfoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: communityTheme.spacing.xs,
    marginBottom: 2,
  },
  fileName: {
    fontSize: communityTheme.typography.fontSize.sm,
    fontWeight: communityTheme.typography.fontWeight.medium,
    color: communityTheme.colors.text,
    flex: 1,
  },
  fileSize: {
    fontSize: communityTheme.typography.fontSize.xs,
    color: communityTheme.colors.textSecondary,
  },
});
