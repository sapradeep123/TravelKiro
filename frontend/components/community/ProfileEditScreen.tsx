import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import {
  Text,
  TextInput,
  Button,
  Switch,
  ActivityIndicator,
  Avatar,
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { communityService, UserProfile } from '../../src/services/communityService';
import { useAuth } from '../../src/contexts/AuthContext';
import { validateProfile } from '../../src/utils/validation';
import { toast } from '../../src/utils/toast';
import { useIsOnline } from '../../src/hooks/useNetworkStatus';
import OfflineIndicator from '../../src/components/OfflineIndicator';

export default function ProfileEditScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const isOnline = useIsOnline();

  // State management
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  
  // Form state
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [avatar, setAvatar] = useState<string | null>(null);
  const [isPrivate, setIsPrivate] = useState(false);
  
  // Validation state
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Load current profile on mount
  useEffect(() => {
    loadProfile();
  }, []);

  /**
   * Load current user profile
   */
  const loadProfile = async () => {
    try {
      if (!user?.id) return;
      
      const profileData = await communityService.getUserProfile(user.id);
      setProfile(profileData);
      
      // Initialize form with current values
      setName(profileData.name);
      setBio(profileData.bio || '');
      setAvatar(profileData.avatar);
      setIsPrivate(profileData.isPrivate);
    } catch (error: any) {
      console.error('Error loading profile:', error);
      toast.error(error.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Validate form inputs
   */
  const validateForm = (): boolean => {
    const validation = validateProfile({ name, bio });
    setValidationErrors(validation.errors);
    
    if (!validation.isValid) {
      const firstError = Object.values(validation.errors)[0];
      toast.error(firstError);
    }
    
    return validation.isValid;
  };

  /**
   * Handle avatar selection
   */
  const handleSelectAvatar = async () => {
    try {
      // Request permission
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          toast.error('Permission required to access your photos');
          return;
        }
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        // In a real app, you would upload the image to a server here
        // For now, we'll just use the local URI
        setAvatar(result.assets[0].uri);
      }
    } catch (error: any) {
      console.error('Error selecting avatar:', error);
      toast.error(error.message || 'Failed to select image');
    }
  };

  /**
   * Handle remove avatar
   */
  const handleRemoveAvatar = () => {
    setAvatar(null);
    toast.success('Avatar removed');
  };

  /**
   * Handle save profile
   */
  const handleSave = async () => {
    // Check network connectivity
    if (!isOnline) {
      toast.error('No internet connection. Please check your network and try again.');
      return;
    }

    if (!validateForm()) {
      return;
    }

    try {
      setSaving(true);

      // Update profile
      await communityService.updateProfile({
        name: name.trim(),
        bio: bio.trim() || undefined,
        avatar: avatar || undefined,
      });

      // Update privacy setting if changed
      if (isPrivate !== profile?.isPrivate) {
        await communityService.togglePrivateMode();
      }

      toast.success('Profile updated successfully');
      router.back();
    } catch (error: any) {
      console.error('Error saving profile:', error);
      toast.error(error.message || 'Failed to save profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  /**
   * Handle cancel
   */
  const handleCancel = () => {
    router.back();
  };

  // Show loading state
  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#667eea" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <View style={styles.wrapper}>
      <OfflineIndicator />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {/* Avatar Section */}
      <View style={styles.avatarSection}>
        <TouchableOpacity onPress={handleSelectAvatar}>
          {avatar ? (
            <Avatar.Image size={120} source={{ uri: avatar }} />
          ) : (
            <Avatar.Text
              size={120}
              label={name.substring(0, 2).toUpperCase() || 'U'}
              style={styles.avatar}
            />
          )}
          <View style={styles.avatarEditBadge}>
            <MaterialCommunityIcons name="camera" size={20} color="#fff" />
          </View>
        </TouchableOpacity>
        
        <View style={styles.avatarActions}>
          <Button
            mode="outlined"
            onPress={handleSelectAvatar}
            icon="image"
            style={styles.avatarButton}
          >
            Change Photo
          </Button>
          {avatar && (
            <Button
              mode="text"
              onPress={handleRemoveAvatar}
              textColor="#F44336"
            >
              Remove
            </Button>
          )}
        </View>
      </View>

      {/* Form Section */}
      <View style={styles.formSection}>
        {/* Name Input */}
        <View style={styles.inputContainer}>
          <TextInput
            label="Name"
            value={name}
            mode="outlined"
            error={!!validationErrors.name}
            maxLength={50}
            style={styles.input}
            disabled={saving || !isOnline}
            onChangeText={(text) => {
              setName(text);
              if (validationErrors.name) {
                setValidationErrors(prev => ({ ...prev, name: '' }));
              }
            }}
          />
          {validationErrors.name ? (
            <Text style={styles.errorText}>{validationErrors.name}</Text>
          ) : (
            <Text style={[styles.helperText, name.length > 45 && styles.helperTextWarning]}>
              {name.length}/50 characters
            </Text>
          )}
        </View>

        {/* Bio Input */}
        <View style={styles.inputContainer}>
          <TextInput
            label="Bio"
            value={bio}
            onChangeText={(text) => {
              setBio(text);
              if (validationErrors.bio) {
                setValidationErrors(prev => ({ ...prev, bio: '' }));
              }
            }}
            mode="outlined"
            multiline
            numberOfLines={4}
            error={!!validationErrors.bio}
            maxLength={500}
            style={[styles.input, styles.bioInput]}
            placeholder="Tell us about yourself..."
            disabled={saving || !isOnline}
          />
          {validationErrors.bio ? (
            <Text style={styles.errorText}>{validationErrors.bio}</Text>
          ) : (
            <Text style={[styles.helperText, bio.length > 450 && styles.helperTextWarning]}>
              {bio.length}/500 characters
            </Text>
          )}
        </View>

        {/* Privacy Toggle */}
        <View style={styles.privacySection}>
          <View style={styles.privacyInfo}>
            <View style={styles.privacyHeader}>
              <MaterialCommunityIcons name="lock" size={24} color="#667eea" />
              <Text style={styles.privacyTitle}>Private Account</Text>
            </View>
            <Text style={styles.privacyDescription}>
              When your account is private, only people you approve can see your posts and profile
            </Text>
          </View>
          <Switch
            value={isPrivate}
            onValueChange={setIsPrivate}
            color="#667eea"
          />
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionSection}>
        <Button
          mode="contained"
          onPress={handleSave}
          loading={saving}
          disabled={saving || !isOnline}
          style={styles.saveButton}
          labelStyle={styles.saveButtonLabel}
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
        <Button
          mode="outlined"
          onPress={handleCancel}
          disabled={saving}
          style={styles.cancelButton}
        >
          Cancel
        </Button>
      </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: '#f0f2f5',
  },
  content: {
    paddingBottom: 32,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f2f5',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6b7280',
  },
  avatarSection: {
    alignItems: 'center',
    paddingVertical: 32,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  avatar: {
    backgroundColor: '#667eea',
  },
  avatarEditBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#667eea',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  avatarActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 16,
  },
  avatarButton: {
    borderColor: '#d1d5db',
  },
  formSection: {
    backgroundColor: '#fff',
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  inputContainer: {
    marginBottom: 24,
  },
  input: {
    backgroundColor: '#fff',
  },
  bioInput: {
    minHeight: 100,
  },
  helperText: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
    marginLeft: 12,
  },
  helperTextWarning: {
    color: '#f59e0b',
    fontWeight: '600',
  },
  errorText: {
    fontSize: 12,
    color: '#F44336',
    marginTop: 4,
    marginLeft: 12,
  },
  privacySection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    gap: 16,
  },
  privacyInfo: {
    flex: 1,
  },
  privacyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  privacyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1c1e21',
  },
  privacyDescription: {
    fontSize: 13,
    color: '#6b7280',
    lineHeight: 18,
  },
  actionSection: {
    paddingHorizontal: 16,
    paddingTop: 24,
    gap: 12,
  },
  saveButton: {
    backgroundColor: '#667eea',
    paddingVertical: 8,
  },
  saveButtonLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    borderColor: '#d1d5db',
  },
});
