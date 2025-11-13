import React, { useState } from 'react';
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
import { Text, IconButton, ActivityIndicator, RadioButton } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { albumService } from '../../src/services/albumService';
import { Album, AlbumPrivacy, CommentStatus } from '../../src/types';

interface CreateAlbumModalProps {
  visible: boolean;
  onClose: () => void;
  onAlbumCreated: (album: Album) => void;
}

export default function CreateAlbumModal({
  visible,
  onClose,
  onAlbumCreated,
}: CreateAlbumModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [privacy, setPrivacy] = useState<AlbumPrivacy>('PUBLIC');
  const [defaultCommentStatus, setDefaultCommentStatus] = useState<CommentStatus>('ENABLED');
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Album name is required');
      return;
    }

    try {
      setLoading(true);
      const newAlbum = await albumService.createAlbum({
        name: name.trim(),
        description: description.trim() || undefined,
        privacy,
        defaultCommentStatus,
      });
      
      // Reset form
      setName('');
      setDescription('');
      setPrivacy('PUBLIC');
      setDefaultCommentStatus('ENABLED');
      
      onAlbumCreated(newAlbum);
      Alert.alert('Success', 'Album created successfully');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to create album');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      // Reset form on close
      setName('');
      setDescription('');
      setPrivacy('PUBLIC');
      setDefaultCommentStatus('ENABLED');
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              {/* Header */}
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Create Album</Text>
                <IconButton
                  icon="close"
                  size={24}
                  onPress={handleClose}
                  disabled={loading}
                />
              </View>

              {/* Form */}
              <ScrollView style={styles.formContainer}>
                {/* Album Name */}
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Album Name *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter album name"
                    value={name}
                    onChangeText={setName}
                    maxLength={100}
                    editable={!loading}
                  />
                </View>

                {/* Description */}
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Description</Text>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="Add a description (optional)"
                    value={description}
                    onChangeText={setDescription}
                    multiline
                    numberOfLines={4}
                    maxLength={500}
                    textAlignVertical="top"
                    editable={!loading}
                  />
                </View>

                {/* Privacy Settings */}
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Privacy</Text>
                  <View style={styles.radioGroup}>
                    <TouchableOpacity
                      style={styles.radioOption}
                      onPress={() => setPrivacy('PUBLIC')}
                      disabled={loading}
                    >
                      <RadioButton
                        value="PUBLIC"
                        status={privacy === 'PUBLIC' ? 'checked' : 'unchecked'}
                        onPress={() => setPrivacy('PUBLIC')}
                        disabled={loading}
                      />
                      <View style={styles.radioLabel}>
                        <MaterialCommunityIcons name="earth" size={20} color="#667eea" />
                        <View style={styles.radioTextContainer}>
                          <Text style={styles.radioTitle}>Public</Text>
                          <Text style={styles.radioDescription}>
                            Anyone can view this album
                          </Text>
                        </View>
                      </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.radioOption}
                      onPress={() => setPrivacy('FRIENDS_ONLY')}
                      disabled={loading}
                    >
                      <RadioButton
                        value="FRIENDS_ONLY"
                        status={privacy === 'FRIENDS_ONLY' ? 'checked' : 'unchecked'}
                        onPress={() => setPrivacy('FRIENDS_ONLY')}
                        disabled={loading}
                      />
                      <View style={styles.radioLabel}>
                        <MaterialCommunityIcons
                          name="account-multiple"
                          size={20}
                          color="#667eea"
                        />
                        <View style={styles.radioTextContainer}>
                          <Text style={styles.radioTitle}>Friends Only</Text>
                          <Text style={styles.radioDescription}>
                            Only your friends can view
                          </Text>
                        </View>
                      </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.radioOption}
                      onPress={() => setPrivacy('PRIVATE')}
                      disabled={loading}
                    >
                      <RadioButton
                        value="PRIVATE"
                        status={privacy === 'PRIVATE' ? 'checked' : 'unchecked'}
                        onPress={() => setPrivacy('PRIVATE')}
                        disabled={loading}
                      />
                      <View style={styles.radioLabel}>
                        <MaterialCommunityIcons name="lock" size={20} color="#667eea" />
                        <View style={styles.radioTextContainer}>
                          <Text style={styles.radioTitle}>Private</Text>
                          <Text style={styles.radioDescription}>Only you can view</Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Default Comment Status */}
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Default Comment Settings</Text>
                  <View style={styles.radioGroup}>
                    <TouchableOpacity
                      style={styles.radioOption}
                      onPress={() => setDefaultCommentStatus('ENABLED')}
                      disabled={loading}
                    >
                      <RadioButton
                        value="ENABLED"
                        status={defaultCommentStatus === 'ENABLED' ? 'checked' : 'unchecked'}
                        onPress={() => setDefaultCommentStatus('ENABLED')}
                        disabled={loading}
                      />
                      <View style={styles.radioLabel}>
                        <View style={styles.radioTextContainer}>
                          <Text style={styles.radioTitle}>Comments Enabled</Text>
                          <Text style={styles.radioDescription}>
                            Everyone can comment on photos
                          </Text>
                        </View>
                      </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.radioOption}
                      onPress={() => setDefaultCommentStatus('DISABLED')}
                      disabled={loading}
                    >
                      <RadioButton
                        value="DISABLED"
                        status={defaultCommentStatus === 'DISABLED' ? 'checked' : 'unchecked'}
                        onPress={() => setDefaultCommentStatus('DISABLED')}
                        disabled={loading}
                      />
                      <View style={styles.radioLabel}>
                        <View style={styles.radioTextContainer}>
                          <Text style={styles.radioTitle}>Comments Disabled</Text>
                          <Text style={styles.radioDescription}>
                            No one can comment on photos
                          </Text>
                        </View>
                      </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.radioOption}
                      onPress={() => setDefaultCommentStatus('HIDDEN')}
                      disabled={loading}
                    >
                      <RadioButton
                        value="HIDDEN"
                        status={defaultCommentStatus === 'HIDDEN' ? 'checked' : 'unchecked'}
                        onPress={() => setDefaultCommentStatus('HIDDEN')}
                        disabled={loading}
                      />
                      <View style={styles.radioLabel}>
                        <View style={styles.radioTextContainer}>
                          <Text style={styles.radioTitle}>Comments Hidden</Text>
                          <Text style={styles.radioDescription}>
                            Only you can see comments
                          </Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  </View>
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
                  style={[styles.createButton, loading && styles.createButtonDisabled]}
                  onPress={handleCreate}
                  disabled={loading || !name.trim()}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.createButtonText}>Create Album</Text>
                  )}
                </TouchableOpacity>
              </View>
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  keyboardView: {
    width: '100%',
    maxWidth: 600,
    maxHeight: '90%',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 20,
    marginHorizontal: 20,
    maxHeight: '100%',
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
  formContainer: {
    flex: 1,
    padding: 20,
  },
  formGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#111827',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  radioGroup: {
    gap: 12,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  radioLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  radioTextContainer: {
    flex: 1,
  },
  radioTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  radioDescription: {
    fontSize: 13,
    color: '#6b7280',
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
  createButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#667eea',
    alignItems: 'center',
  },
  createButtonDisabled: {
    opacity: 0.5,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
