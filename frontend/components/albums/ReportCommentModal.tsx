import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { albumService } from '../../src/services/albumService';

interface ReportCommentModalProps {
  visible: boolean;
  commentId: string;
  onClose: () => void;
  onSuccess: () => void;
}

const REPORT_CATEGORIES = [
  { value: 'SPAM', label: 'Spam', icon: 'email-alert' },
  { value: 'HARASSMENT', label: 'Harassment', icon: 'account-alert' },
  { value: 'INAPPROPRIATE_CONTENT', label: 'Inappropriate Content', icon: 'alert-circle' },
  { value: 'HATE_SPEECH', label: 'Hate Speech', icon: 'message-alert' },
  { value: 'OTHER', label: 'Other', icon: 'dots-horizontal' },
];

export default function ReportCommentModal({
  visible,
  commentId,
  onClose,
  onSuccess,
}: ReportCommentModalProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!selectedCategory) {
      Alert.alert('Error', 'Please select a report category');
      return;
    }

    setSubmitting(true);
    try {
      await albumService.reportComment(commentId, selectedCategory, reason.trim() || undefined);
      onSuccess();
      handleClose();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to report comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setSelectedCategory(null);
    setReason('');
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={handleClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Report Comment</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <MaterialCommunityIcons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content}>
            <Text style={styles.description}>
              Please select a reason for reporting this comment. Our team will review it shortly.
            </Text>

            {/* Categories */}
            <View style={styles.categoriesContainer}>
              {REPORT_CATEGORIES.map((category) => (
                <TouchableOpacity
                  key={category.value}
                  style={[
                    styles.categoryItem,
                    selectedCategory === category.value && styles.categoryItemSelected,
                  ]}
                  onPress={() => setSelectedCategory(category.value)}
                >
                  <MaterialCommunityIcons
                    name={category.icon as any}
                    size={24}
                    color={selectedCategory === category.value ? '#667eea' : '#666'}
                  />
                  <Text
                    style={[
                      styles.categoryLabel,
                      selectedCategory === category.value && styles.categoryLabelSelected,
                    ]}
                  >
                    {category.label}
                  </Text>
                  {selectedCategory === category.value && (
                    <MaterialCommunityIcons name="check-circle" size={20} color="#667eea" />
                  )}
                </TouchableOpacity>
              ))}
            </View>

            {/* Optional Reason */}
            <Text style={styles.reasonLabel}>Additional Details (Optional)</Text>
            <TextInput
              style={styles.reasonInput}
              placeholder="Provide more context about why you're reporting this comment..."
              value={reason}
              onChangeText={setReason}
              multiline
              numberOfLines={4}
              maxLength={500}
              textAlignVertical="top"
            />
            <Text style={styles.charCount}>{reason.length}/500</Text>
          </ScrollView>

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity style={styles.cancelButton} onPress={handleClose}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.submitButton, !selectedCategory && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={!selectedCategory || submitting}
            >
              {submitting ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.submitButtonText}>Submit Report</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    padding: 20,
  },
  description: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 20,
  },
  categoriesContainer: {
    marginBottom: 24,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#f5f5f5',
    marginBottom: 12,
    gap: 12,
  },
  categoryItemSelected: {
    backgroundColor: '#e8ebfa',
    borderWidth: 2,
    borderColor: '#667eea',
  },
  categoryLabel: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  categoryLabelSelected: {
    color: '#667eea',
    fontWeight: '600',
  },
  reasonLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  reasonInput: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    color: '#333',
    minHeight: 100,
  },
  charCount: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
    marginTop: 4,
  },
  actions: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  cancelButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  submitButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#667eea',
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#ccc',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
