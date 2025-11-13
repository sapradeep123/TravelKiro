import React, { useState } from 'react';
import { View, StyleSheet, Modal, ScrollView, KeyboardAvoidingView, Platform, Alert, Text, TouchableOpacity } from 'react-native';
import { Divider } from 'react-native-paper';
import ImagePickerSection, { SelectedImage } from './ImagePickerSection';
import LocationPickerSection from './LocationPickerSection';
import CaptionInputSection from './CaptionInputSection';
import PhotoPostPreview from './PhotoPostPreview';
import { Location } from '../../src/types';
import { useAuth } from '../../src/contexts/AuthContext';
import api from '../../src/services/api';

interface CreatePhotoPostModalProps {
  visible: boolean;
  onClose: () => void;
  onPostCreated: () => void;
}

export default function CreatePhotoPostModal({
  visible,
  onClose,
  onPostCreated,
}: CreatePhotoPostModalProps) {
  const { user } = useAuth();
  const [images, setImages] = useState<SelectedImage[]>([]);
  const [caption, setCaption] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [isPreview, setIsPreview] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const hasContent = images.length > 0 || caption.trim().length > 0 || selectedLocation !== null;

  const handleClose = () => {
    if (hasContent && !uploading) {
      Alert.alert(
        'Discard Post?',
        'You have unsaved changes. Are you sure you want to discard this post?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Discard',
            style: 'destructive',
            onPress: () => {
              resetForm();
              onClose();
            },
          },
        ]
      );
    } else {
      resetForm();
      onClose();
    }
  };

  const resetForm = () => {
    setImages([]);
    setCaption('');
    setSelectedLocation(null);
    setIsPreview(false);
    setUploading(false);
    setUploadProgress(0);
  };

  const handleImagesSelected = (newImages: SelectedImage[]) => {
    setImages(newImages);
  };

  const handleImageRemoved = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleImagesReordered = (reorderedImages: SelectedImage[]) => {
    setImages(reorderedImages);
  };

  const handleLocationSelected = (location: Location) => {
    setSelectedLocation(location);
  };

  const handleLocationRemoved = () => {
    setSelectedLocation(null);
  };

  const handleCaptionChange = (text: string) => {
    setCaption(text);
  };

  const handlePreview = () => {
    if (images.length === 0) {
      Alert.alert('No Images', 'Please select at least one image to preview.');
      return;
    }
    setIsPreview(true);
  };

  const handleEdit = () => {
    if (!uploading) {
      setIsPreview(false);
    }
  };

  const handleSubmit = async () => {
    console.log('handleSubmit called with images:', images.length);
    console.log(`Starting upload with ${images.length} images`);
    
    if (images.length === 0) {
      Alert.alert('No Images', 'Please select at least one image to post.');
      return;
    }

    try {
      setUploading(true);
      setUploadProgress(0.1);
      console.log('Starting upload process...');

      // Step 1: Upload images
      const formData = new FormData();
      
      if (Platform.OS === 'web') {
        // For web, convert URI to Blob
        console.log('Processing images for web upload...');
        for (let index = 0; index < images.length; index++) {
          const image = images[index];
          console.log(`Processing image ${index + 1}:`, { uri: image.uri, mimeType: image.mimeType });
          try {
            const response = await fetch(image.uri);
            const blob = await response.blob();
            const fileType = image.mimeType?.split('/')[1] || 'jpg';
            console.log(`Converted to blob:`, { size: blob.size, type: blob.type });
            formData.append('images', blob, image.fileName || `photo_${index}.${fileType}`);
          } catch (err) {
            console.error('Error converting image to blob:', err);
            throw new Error('Failed to process image for upload');
          }
        }
        console.log('All images processed for web');
      } else {
        // For mobile (iOS/Android)
        images.forEach((image, index) => {
          const uriParts = image.uri.split('.');
          const fileType = uriParts[uriParts.length - 1];
          
          formData.append('images', {
            uri: Platform.OS === 'ios' ? image.uri.replace('file://', '') : image.uri,
            name: image.fileName || `photo_${index}.${fileType}`,
            type: image.mimeType || `image/${fileType}`,
          } as any);
        });
      }

      setUploadProgress(0.3);

      console.log('Sending upload request to /community/upload-images...');
      const uploadResponse = await api.post('/community/upload-images', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log('Upload response received:', uploadResponse.data);

      setUploadProgress(0.6);

      const imageUrls = uploadResponse.data.urls;

      // Step 2: Create post
      const postData = {
        caption: caption.trim() || '',
        mediaUrls: imageUrls,
        mediaTypes: imageUrls.map(() => 'IMAGE' as const),
        locationId: selectedLocation?.id,
      };

      setUploadProgress(0.8);

      await api.post('/community/posts', postData);

      setUploadProgress(1.0);

      // Success
      Alert.alert('Success', 'Your post has been published!', [
        {
          text: 'OK',
          onPress: () => {
            resetForm();
            onClose();
            onPostCreated();
          },
        },
      ]);
    } catch (error: any) {
      console.error('Post creation error:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      
      let errorMessage = 'Failed to create post. Please try again.';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }

      Alert.alert('Upload Failed', errorMessage, [
        { text: 'OK' },
      ]);
      
      setUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.backdrop} />
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalContainer}
        >
          <View style={styles.container}>
            {/* Drag Handle */}
            <View style={styles.dragHandle}>
              <View style={styles.dragHandleBar} />
            </View>

            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity
                onPress={isPreview ? handleEdit : handleClose}
                disabled={uploading}
                style={styles.cancelButton}
              >
                <Text style={styles.cancelButtonText}>
                  {isPreview ? '← Back' : 'Cancel'}
                </Text>
              </TouchableOpacity>
              <View style={styles.headerTitle}>
                <Text style={styles.headerTitleText}>
                  {isPreview ? 'Preview' : 'Create Post'}
                </Text>
              </View>
              {!isPreview ? (
                <TouchableOpacity
                  onPress={handlePreview}
                  disabled={images.length === 0}
                  style={[styles.nextButton, images.length === 0 && styles.nextButtonDisabled]}
                >
                  <Text style={[styles.nextButtonText, images.length === 0 && styles.nextButtonTextDisabled]}>
                    Next
                  </Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  onPress={handleSubmit}
                  disabled={uploading}
                  style={[styles.postButtonHeader, uploading && styles.postButtonDisabled]}
                >
                  {uploading ? (
                    <Text style={styles.postButtonText}>Posting...</Text>
                  ) : (
                    <Text style={styles.postButtonText}>Post</Text>
                  )}
                </TouchableOpacity>
              )}
            </View>

        {/* Content */}
        {isPreview ? (
          <PhotoPostPreview
            images={images}
            caption={caption}
            location={selectedLocation}
            userName={user?.profile?.name || 'User'}
            userAvatar={user?.profile?.avatar || undefined}
            onEdit={handleEdit}
            onSubmit={handleSubmit}
            uploading={uploading}
            uploadProgress={uploadProgress}
          />
        ) : (
          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Image Picker Section */}
            <ImagePickerSection
              images={images}
              onImagesSelected={handleImagesSelected}
              onImageRemoved={handleImageRemoved}
              onImagesReordered={handleImagesReordered}
              maxImages={10}
            />

            <Divider />

            {/* Location Picker Section */}
            <LocationPickerSection
              selectedLocation={selectedLocation}
              onLocationSelected={handleLocationSelected}
              onLocationRemoved={handleLocationRemoved}
            />

            <Divider />

            {/* Caption Input Section */}
            <CaptionInputSection
              caption={caption}
              onCaptionChange={handleCaptionChange}
              maxLength={2000}
            />

            {/* Bottom Spacing */}
            <View style={styles.bottomSpacing} />
          </ScrollView>
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
    backgroundColor: 'transparent',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  modalContainer: {
    height: '95%',
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 20,
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  dragHandle: {
    alignItems: 'center',
    paddingVertical: 12,
    backgroundColor: '#fff',
  },
  dragHandleBar: {
    width: 40,
    height: 4,
    backgroundColor: '#d1d5db',
    borderRadius: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    backgroundColor: '#fff',
  },
  headerTitle: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  cancelButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
  },
  nextButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  nextButtonDisabled: {
    opacity: 0.4,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#667eea',
  },
  nextButtonTextDisabled: {
    color: '#9ca3af',
  },
  postButtonHeader: {
    backgroundColor: '#667eea',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  postButtonDisabled: {
    opacity: 0.6,
  },
  postButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  bottomSpacing: {
    height: 120,
  },
});
