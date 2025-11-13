import React, { useState, useEffect } from 'react';
import {
  View,
  Modal,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { Text, IconButton, ActivityIndicator } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { communityService } from '../../src/services/communityService';

interface EditProfileModalProps {
  visible: boolean;
  onClose: () => void;
  onProfileUpdated: () => void;
  currentProfile?: {
    bio?: string;
  };
}

export default function EditProfileModal({
  visible,
  onClose,
  onProfileUpdated,
  currentProfile,
}: EditProfileModalProps) {
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      const bioText = currentProfile?.bio || '';
      console.log('[EditProfileModal] Loading bio:', bioText);
      setBio(bioText);
      setLocation('Mumbai, India'); // Default location for now
    }
  }, [visible, currentProfile]);

  const handleSave = async () => {
    try {
      setLoading(true);
      await communityService.updateProfile({
        bio: bio.trim() || undefined,
      });
      Alert.alert('Success', 'Profile updated successfully');
      onProfileUpdated();
      onClose();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <TouchableOpacity 
          style={styles.backdrop}
          activeOpacity={1} 
          onPress={handleClose}
        />
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <View style={styles.modalContainer}>
            {/* Drag Handle */}
            <View style={styles.dragHandle}>
              <View style={styles.dragHandleBar} />
            </View>

            {/* Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Profile</Text>
              <IconButton
                icon="close"
                size={24}
                onPress={handleClose}
                disabled={loading}
                iconColor="#6b7280"
              />
            </View>

            {/* Form */}
            <ScrollView style={styles.formContainer}>
              {/* Bio */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>About Me</Text>
                <Text style={styles.helperText}>
                  Share your travel story and interests with the community
                </Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Tell us about yourself and your travel interests..."
                  value={bio}
                  onChangeText={setBio}
                  multiline
                  numberOfLines={4}
                  maxLength={500}
                  textAlignVertical="top"
                  editable={!loading}
                  placeholderTextColor="#9ca3af"
                />
                <Text style={styles.charCount}>{bio.length}/500</Text>
              </View>

              {/* Location */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>Location</Text>
                <View style={styles.inputWithIcon}>
                  <MaterialCommunityIcons name="map-marker" size={20} color="#6b7280" />
                  <TextInput
                    style={styles.inputText}
                    placeholder="City, Country"
                    value={location}
                    onChangeText={setLocation}
                    maxLength={100}
                    editable={!loading}
                    placeholderTextColor="#9ca3af"
                  />
                </View>
              </View>

              {/* Info Note */}
              <View style={styles.infoBox}>
                <MaterialCommunityIcons name="information" size={20} color="#667eea" />
                <Text style={styles.infoText}>
                  Your profile information will be visible to other travelers based on your privacy settings.
                </Text>
              </View>
            </ScrollView>

            {/* Actions */}
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={handleClose}
                disabled={loading}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveButton, loading && styles.saveButtonDisabled]}
                onPress={handleSave}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.saveButtonText}>Save Changes</Text>
                )}
              </TouchableOpacity>
            </View>
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
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
  },
  keyboardView: {
    width: '100%',
    maxHeight: '90%',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '100%',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 20,
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
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
    letterSpacing: -0.5,
  },
  formContainer: {
    flex: 1,
    padding: 24,
  },
  formGroup: {
    marginBottom: 28,
  },
  label: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  helperText: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 12,
    lineHeight: 20,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#1a1a1a',
    borderWidth: 2,
    borderColor: '#d1d5db',
    fontWeight: '400',
  },
  textArea: {
    minHeight: 140,
    textAlignVertical: 'top',
    lineHeight: 24,
  },
  charCount: {
    fontSize: 13,
    color: '#6b7280',
    textAlign: 'right',
    marginTop: 8,
    fontWeight: '500',
  },
  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 2,
    borderColor: '#d1d5db',
    gap: 12,
  },
  inputText: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 16,
    color: '#1a1a1a',
    fontWeight: '400',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#eff6ff',
    padding: 16,
    borderRadius: 12,
    gap: 12,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#1e40af',
    lineHeight: 20,
    fontWeight: '500',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 16,
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    backgroundColor: '#fafafa',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: '#fff',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  cancelButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#374151',
  },
  saveButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: '#667eea',
    alignItems: 'center',
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  saveButtonDisabled: {
    opacity: 0.5,
    shadowOpacity: 0,
    elevation: 0,
  },
  saveButtonText: {
    fontSize: 17,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.3,
  },
});
