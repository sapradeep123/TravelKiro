import React, { useState } from 'react';
import { View, StyleSheet, Platform, TouchableOpacity, Text, ScrollView, TextInput, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthGuard } from '../../src/hooks/useAuthGuard';
import MediaUploader, { SelectedMedia } from '../../components/community/MediaUploader';
import LocationPicker, { LocationData } from '../../components/community/LocationPicker';
import { communityService } from '../../src/services/communityService';
import { validatePost } from '../../src/utils/validation';
import { toast } from '../../src/utils/toast';
import { useIsOnline } from '../../src/hooks/useNetworkStatus';
import OfflineIndicator from '../../src/components/OfflineIndicator';

// Declare window for web platform
declare const window: any;

export default function PostComposerRoute() {
  const router = useRouter();
  const { canAccess } = useAuthGuard({
    requireAuth: true,
    alertMessage: 'Please log in to create a post',
  });
  const isOnline = useIsOnline();
  const [caption, setCaption] = useState('');
  const [media, setMedia] = useState<SelectedMedia[]>([]);
  const [location, setLocation] = useState<LocationData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const handleBack = () => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.history.back();
    } else {
      router.back();
    }
  };

  const handleSubmit = async () => {
    // Clear previous validation errors
    setValidationErrors({});

    // Check network connectivity
    if (!isOnline) {
      toast.error('No internet connection. Please check your network and try again.');
      return;
    }

    // Prepare post data for validation
    const postData = {
      caption: caption.trim(),
      mediaUrls: media.map(m => m.uri),
      locationId: location?.locationId,
      customCountry: location?.customCountry,
      customState: location?.customState,
      customArea: location?.customArea,
    };

    // Validate post data
    const validation = validatePost(postData);
    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      
      // Show first error as toast
      const firstError = Object.values(validation.errors)[0];
      toast.error(firstError);
      return;
    }

    try {
      setIsSubmitting(true);
      
      const fullPostData = {
        ...postData,
        mediaTypes: media.map(m => m.type),
        latitude: location?.latitude,
        longitude: location?.longitude,
      };

      await communityService.createPost(fullPostData);
      
      toast.success('Post created successfully!');
      router.back();
    } catch (error: any) {
      console.error('Error creating post:', error);
      toast.error(error.message || 'Failed to create post. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!canAccess) {
    return null;
  }

  return (
    <View style={styles.container}>
      {/* Offline Indicator */}
      <OfflineIndicator />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.headerButton}>
          <Ionicons name="close" size={28} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Post</Text>
        <TouchableOpacity 
          onPress={handleSubmit} 
          style={[styles.headerButton, styles.submitButton, (isSubmitting || !isOnline) && styles.submitButtonDisabled]}
          disabled={isSubmitting || !isOnline}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.submitText}>Post</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Caption Input */}
        <View style={styles.section}>
          <Text style={styles.label}>Caption</Text>
          <View style={[styles.captionContainer, validationErrors.caption && styles.inputError]}>
            <TextInput
              style={styles.captionInput}
              value={caption}
              onChangeText={(text) => {
                setCaption(text);
                if (validationErrors.caption) {
                  setValidationErrors(prev => ({ ...prev, caption: '' }));
                }
              }}
              placeholder="Share your travel experience..."
              placeholderTextColor="#9ca3af"
              multiline
              numberOfLines={4}
              maxLength={2000}
              editable={!isSubmitting}
            />
            <Text style={[styles.charCount, caption.length > 1900 && styles.charCountWarning]}>
              {caption.length}/2000
            </Text>
          </View>
          {validationErrors.caption && (
            <Text style={styles.errorText}>{validationErrors.caption}</Text>
          )}
        </View>

        {/* Media Uploader */}
        <View style={styles.section}>
          <Text style={styles.label}>Photos & Videos *</Text>
          <MediaUploader
            media={media}
            onMediaChange={(newMedia) => {
              setMedia(newMedia);
              if (validationErrors.media) {
                setValidationErrors(prev => ({ ...prev, media: '' }));
              }
            }}
            maxMedia={10}
          />
          {validationErrors.media && (
            <Text style={styles.errorText}>{validationErrors.media}</Text>
          )}
        </View>

        {/* Location Picker */}
        <View style={styles.section}>
          <Text style={styles.label}>Location *</Text>
          <LocationPicker
            location={location}
            onLocationChange={(newLocation) => {
              setLocation(newLocation);
              if (validationErrors.location) {
                setValidationErrors(prev => ({ ...prev, location: '' }));
              }
            }}
          />
          {validationErrors.location && (
            <Text style={styles.errorText}>{validationErrors.location}</Text>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f2f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  submitButton: {
    backgroundColor: '#667eea',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  submitText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  content: {
    flex: 1,
  },
  section: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  captionContainer: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
  },
  captionInput: {
    fontSize: 16,
    color: '#111827',
    minHeight: 100,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'right',
    marginTop: 8,
  },
  charCountWarning: {
    color: '#f59e0b',
    fontWeight: '600',
  },
  inputError: {
    borderColor: '#ef4444',
    borderWidth: 2,
  },
  errorText: {
    fontSize: 12,
    color: '#ef4444',
    marginTop: 4,
  },
});
