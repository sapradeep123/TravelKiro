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
import { communityService, ReportPostData } from '../../src/services/communityService';

interface ReportModalProps {
  visible: boolean;
  postId: string;
  onClose: () => void;
  onSuccess?: () => void;
}

type ReportCategory = 'spam' | 'harassment' | 'inappropriate' | 'other';

interface CategoryOption {
  value: ReportCategory;
  label: string;
  description: string;
  icon: string;
}

const REPORT_CATEGORIES: CategoryOption[] = [
  {
    value: 'spam',
    label: 'Spam',
    description: 'Misleading or repetitive content',
    icon: 'alert-circle-outline',
  },
  {
    value: 'harassment',
    label: 'Harassment',
    description: 'Bullying or threatening behavior',
    icon: 'account-alert-outline',
  },
  {
    value: 'inappropriate',
    label: 'Inappropriate Content',
    description: 'Offensive or explicit material',
    icon: 'eye-off-outline',
  },
  {
    value: 'other',
    label: 'Other',
    description: 'Something else that violates guidelines',
    icon: 'flag-outline',
  },
];

export default function ReportModal({ visible, postId, onClose, onSuccess }: ReportModalProps) {
  const [selectedCategory, setSelectedCategory] = useState<ReportCategory | null>(null);
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!selectedCategory) {
      Alert.alert('Select Category', 'Please select a reason for reporting this post.');
      return;
    }

    setSubmitting(true);
    try {
      const data: ReportPostData = {
        category: selectedCategory,
        reason: reason.trim() || undefined,
      };

      await communityService.reportPost(postId, data);

      Alert.alert(
        'Report Submitted',
        'Thank you for helping keep our community safe. We will review this report.',
        [
          {
            text: 'OK',
            onPress: () => {
              handleClose();
              onSuccess?.();
            },
          },
        ]
      );
    } catch (error: any) {
      console.error('Error submitting report:', error);
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to submit report. Please try again.'
      );
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
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Report Post</Text>
            <TouchableOpacity onPress={handleClose} disabled={submitting}>
              <MaterialCommunityIcons name="close" size={24} color="#1c1e21" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Instructions */}
            <Text style={styles.instructions}>
              Please select the reason for reporting this post. Your report will be reviewed by our
              moderation team.
            </Text>

            {/* Category Selection */}
            <View style={styles.categoriesContainer}>
              {REPORT_CATEGORIES.map((category) => (
                <TouchableOpacity
                  key={category.value}
                  style={[
                    styles.categoryCard,
                    selectedCategory === category.value && styles.categoryCardSelected,
                  ]}
                  onPress={() => setSelectedCategory(category.value)}
                  disabled={submitting}
                >
                  <View style={styles.categoryHeader}>
                    <MaterialCommunityIcons
                      name={category.icon as any}
                      size={24}
                      color={selectedCategory === category.value ? '#667eea' : '#65676b'}
                    />
                    <View style={styles.categoryTextContainer}>
                      <Text
                        style={[
                          styles.categoryLabel,
                          selectedCategory === category.value && styles.categoryLabelSelected,
                        ]}
                      >
                        {category.label}
                      </Text>
                      <Text style={styles.categoryDescription}>{category.description}</Text>
                    </View>
                  </View>
                  {selectedCategory === category.value && (
                    <MaterialCommunityIcons name="check-circle" size={20} color="#667eea" />
                  )}
                </TouchableOpacity>
              ))}
            </View>

            {/* Optional Reason */}
            <View style={styles.reasonContainer}>
              <Text style={styles.reasonLabel}>Additional Details (Optional)</Text>
              <TextInput
                style={styles.reasonInput}
                placeholder="Provide more context about why you're reporting this post..."
                placeholderTextColor="#8e8e93"
                multiline
                numberOfLines={4}
                maxLength={500}
                value={reason}
                onChangeText={setReason}
                editable={!submitting}
                textAlignVertical="top"
              />
              <Text style={styles.characterCount}>{reason.length}/500</Text>
            </View>

            {/* Disclaimer */}
            <View style={styles.disclaimer}>
              <MaterialCommunityIcons name="information-outline" size={16} color="#65676b" />
              <Text style={styles.disclaimerText}>
                Reports are anonymous. The post author will not be notified of your report.
              </Text>
            </View>
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleClose}
              disabled={submitting}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={submitting || !selectedCategory}
            >
              {submitting ? (
                <ActivityIndicator color="#fff" size="small" />
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
  modalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e4e6eb',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1c1e21',
  },
  content: {
    padding: 20,
  },
  instructions: {
    fontSize: 14,
    lineHeight: 20,
    color: '#65676b',
    marginBottom: 20,
  },
  categoriesContainer: {
    gap: 12,
    marginBottom: 24,
  },
  categoryCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e4e6eb',
    backgroundColor: '#fff',
  },
  categoryCardSelected: {
    borderColor: '#667eea',
    backgroundColor: '#f0f2ff',
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  categoryTextContainer: {
    flex: 1,
  },
  categoryLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1c1e21',
    marginBottom: 2,
  },
  categoryLabelSelected: {
    color: '#667eea',
  },
  categoryDescription: {
    fontSize: 13,
    color: '#65676b',
    lineHeight: 18,
  },
  reasonContainer: {
    marginBottom: 20,
  },
  reasonLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1c1e21',
    marginBottom: 8,
  },
  reasonInput: {
    borderWidth: 1,
    borderColor: '#e4e6eb',
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    color: '#1c1e21',
    minHeight: 100,
    backgroundColor: '#f8f9fa',
  },
  characterCount: {
    fontSize: 12,
    color: '#8e8e93',
    textAlign: 'right',
    marginTop: 4,
  },
  disclaimer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    padding: 12,
    backgroundColor: '#f0f2f5',
    borderRadius: 8,
    marginBottom: 20,
  },
  disclaimerText: {
    flex: 1,
    fontSize: 12,
    color: '#65676b',
    lineHeight: 16,
  },
  footer: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#e4e6eb',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#f0f2f5',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1c1e21',
  },
  submitButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#667eea',
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#b0b3c7',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
