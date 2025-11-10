import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../src/services/api';

interface CallbackManagementModalProps {
  packageId: string;
  packageTitle: string;
  visible: boolean;
  onClose: () => void;
}

interface CallbackRequest {
  id: string;
  name: string;
  phone: string;
  email?: string;
  message?: string;
  status: string;
  notes?: string;
  rescheduleDate?: string;
  contactedAt?: string;
  createdAt: string;
  statusHistory?: Array<{
    status: string;
    notes?: string;
    createdAt: string;
    user: {
      profile: {
        name: string;
      };
    };
  }>;
}

const STATUS_OPTIONS = [
  { value: 'PENDING', label: 'Pending', color: '#f59e0b' },
  { value: 'CONTACTED', label: 'Contacted', color: '#3b82f6' },
  { value: 'RESCHEDULED', label: 'Rescheduled', color: '#8b5cf6' },
  { value: 'NOT_INTERESTED', label: 'Not Interested', color: '#ef4444' },
  { value: 'BOOKING_COMPLETED', label: 'Booking Completed', color: '#10b981' },
];

export default function CallbackManagementModal({
  packageId,
  packageTitle,
  visible,
  onClose,
}: CallbackManagementModalProps) {
  const [requests, setRequests] = useState<CallbackRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<CallbackRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [expandedRequest, setExpandedRequest] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const isWeb = Platform.OS === 'web';

  useEffect(() => {
    if (visible && packageId) {
      fetchCallbackRequests();
    }
  }, [visible, packageId]);

  useEffect(() => {
    filterRequests();
  }, [requests, statusFilter]);

  const fetchCallbackRequests = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/packages/${packageId}/callback-requests`);
      setRequests(response.data.data || []);
    } catch (error) {
      console.error('Error fetching callback requests:', error);
      Alert.alert('Error', 'Failed to load callback requests');
    } finally {
      setLoading(false);
    }
  };

  const filterRequests = () => {
    if (statusFilter === 'ALL') {
      setFilteredRequests(requests);
    } else {
      setFilteredRequests(requests.filter((req) => req.status === statusFilter));
    }
  };

  const updateCallbackStatus = async (
    requestId: string,
    status: string,
    notes?: string,
    rescheduleDate?: string
  ) => {
    try {
      setUpdatingStatus(requestId);
      await api.patch(`/packages/callback-requests/${requestId}/status`, {
        status,
        notes,
        rescheduleDate,
      });
      
      Alert.alert('Success', 'Callback status updated successfully');
      await fetchCallbackRequests();
      setExpandedRequest(null);
    } catch (error: any) {
      console.error('Error updating callback status:', error);
      Alert.alert('Error', error.response?.data?.error || 'Failed to update status');
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleStatusChange = (requestId: string, newStatus: string) => {
    const request = requests.find((r) => r.id === requestId);
    if (!request) return;

    if (newStatus === 'RESCHEDULED') {
      // Show date picker for rescheduling
      Alert.prompt(
        'Reschedule Callback',
        'Enter new callback date (YYYY-MM-DD):',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Schedule',
            onPress: (date?: string) => {
              if (date) {
                updateCallbackStatus(requestId, newStatus, undefined, date);
              }
            },
          },
        ],
        'plain-text'
      );
    } else {
      Alert.alert(
        'Update Status',
        `Change status to ${STATUS_OPTIONS.find((s) => s.value === newStatus)?.label}?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Confirm',
            onPress: () => updateCallbackStatus(requestId, newStatus),
          },
        ]
      );
    }
  };

  const getStatusColor = (status: string) => {
    return STATUS_OPTIONS.find((s) => s.value === status)?.color || '#6b7280';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, isWeb && styles.modalContentWeb]}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <View style={styles.headerLeft}>
              <Text style={styles.modalTitle}>Callback Requests</Text>
              <Text style={styles.packageTitle}>{packageTitle}</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#111827" />
            </TouchableOpacity>
          </View>

          {/* Status Filter */}
          <View style={styles.filterContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.filterButtons}>
                <TouchableOpacity
                  style={[styles.filterButton, statusFilter === 'ALL' && styles.filterButtonActive]}
                  onPress={() => setStatusFilter('ALL')}
                >
                  <Text
                    style={[
                      styles.filterButtonText,
                      statusFilter === 'ALL' && styles.filterButtonTextActive,
                    ]}
                  >
                    All ({requests.length})
                  </Text>
                </TouchableOpacity>
                {STATUS_OPTIONS.map((option) => {
                  const count = requests.filter((r) => r.status === option.value).length;
                  return (
                    <TouchableOpacity
                      key={option.value}
                      style={[
                        styles.filterButton,
                        statusFilter === option.value && styles.filterButtonActive,
                      ]}
                      onPress={() => setStatusFilter(option.value)}
                    >
                      <Text
                        style={[
                          styles.filterButtonText,
                          statusFilter === option.value && styles.filterButtonTextActive,
                        ]}
                      >
                        {option.label} ({count})
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#6366f1" />
            </View>
          ) : filteredRequests.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="call-outline" size={64} color="#d1d5db" />
              <Text style={styles.emptyText}>No callback requests found</Text>
            </View>
          ) : (
            <ScrollView style={styles.scrollContent}>
              {filteredRequests.map((request) => (
                <View key={request.id} style={styles.requestCard}>
                  {/* Request Header */}
                  <TouchableOpacity
                    style={styles.requestHeader}
                    onPress={() =>
                      setExpandedRequest(expandedRequest === request.id ? null : request.id)
                    }
                  >
                    <View style={styles.requestHeaderLeft}>
                      <Text style={styles.requestName}>{request.name}</Text>
                      <Text style={styles.requestPhone}>{request.phone}</Text>
                    </View>
                    <View style={styles.requestHeaderRight}>
                      <View
                        style={[
                          styles.statusBadge,
                          { backgroundColor: getStatusColor(request.status) + '20' },
                        ]}
                      >
                        <Text style={[styles.statusText, { color: getStatusColor(request.status) }]}>
                          {STATUS_OPTIONS.find((s) => s.value === request.status)?.label}
                        </Text>
                      </View>
                      <Ionicons
                        name={expandedRequest === request.id ? 'chevron-up' : 'chevron-down'}
                        size={20}
                        color="#6b7280"
                      />
                    </View>
                  </TouchableOpacity>

                  {/* Expanded Content */}
                  {expandedRequest === request.id && (
                    <View style={styles.requestDetails}>
                      {/* Contact Info */}
                      <View style={styles.detailSection}>
                        <Text style={styles.detailLabel}>Contact Information</Text>
                        {request.email && (
                          <Text style={styles.detailText}>Email: {request.email}</Text>
                        )}
                        {request.message && (
                          <Text style={styles.detailText}>Message: {request.message}</Text>
                        )}
                        <Text style={styles.detailText}>
                          Requested: {formatDate(request.createdAt)}
                        </Text>
                        {request.contactedAt && (
                          <Text style={styles.detailText}>
                            Contacted: {formatDate(request.contactedAt)}
                          </Text>
                        )}
                        {request.rescheduleDate && (
                          <Text style={styles.detailText}>
                            Rescheduled for: {formatDate(request.rescheduleDate)}
                          </Text>
                        )}
                      </View>

                      {/* Status Update */}
                      <View style={styles.detailSection}>
                        <Text style={styles.detailLabel}>Update Status</Text>
                        <View style={styles.statusButtons}>
                          {STATUS_OPTIONS.map((option) => (
                            <TouchableOpacity
                              key={option.value}
                              style={[
                                styles.statusButton,
                                request.status === option.value && styles.statusButtonActive,
                                { borderColor: option.color },
                              ]}
                              onPress={() => handleStatusChange(request.id, option.value)}
                              disabled={updatingStatus === request.id}
                            >
                              {updatingStatus === request.id ? (
                                <ActivityIndicator size="small" color={option.color} />
                              ) : (
                                <Text
                                  style={[
                                    styles.statusButtonText,
                                    request.status === option.value && { color: option.color },
                                  ]}
                                >
                                  {option.label}
                                </Text>
                              )}
                            </TouchableOpacity>
                          ))}
                        </View>
                      </View>

                      {/* Status History */}
                      {request.statusHistory && request.statusHistory.length > 0 && (
                        <View style={styles.detailSection}>
                          <Text style={styles.detailLabel}>Status History</Text>
                          {request.statusHistory.map((history, index) => (
                            <View key={index} style={styles.historyItem}>
                              <View style={styles.historyDot} />
                              <View style={styles.historyContent}>
                                <Text style={styles.historyStatus}>
                                  {STATUS_OPTIONS.find((s) => s.value === history.status)?.label}
                                </Text>
                                <Text style={styles.historyMeta}>
                                  by {history.user.profile.name} • {formatDate(history.createdAt)}
                                </Text>
                                {history.notes && (
                                  <Text style={styles.historyNotes}>{history.notes}</Text>
                                )}
                              </View>
                            </View>
                          ))}
                        </View>
                      )}
                    </View>
                  )}
                </View>
              ))}
            </ScrollView>
          )}
        </View>
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
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    width: '90%',
    maxHeight: '90%',
    overflow: 'hidden',
  },
  modalContentWeb: {
    width: '80%',
    maxWidth: 1000,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerLeft: {
    flex: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  packageTitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  closeButton: {
    padding: 4,
  },
  filterContainer: {
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  filterButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
  },
  filterButtonActive: {
    backgroundColor: '#6366f1',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: '#ffffff',
  },
  loadingContainer: {
    padding: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    padding: 60,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#9ca3af',
    marginTop: 16,
  },
  scrollContent: {
    flex: 1,
    padding: 20,
  },
  requestCard: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 12,
    overflow: 'hidden',
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  requestHeaderLeft: {
    flex: 1,
  },
  requestName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  requestPhone: {
    fontSize: 14,
    color: '#6b7280',
  },
  requestHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  requestDetails: {
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    padding: 16,
    backgroundColor: '#f9fafb',
  },
  detailSection: {
    marginBottom: 20,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  statusButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statusButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: '#ffffff',
    minWidth: 100,
    alignItems: 'center',
  },
  statusButtonActive: {
    backgroundColor: '#f3f4f6',
  },
  statusButtonText: {
    fontSize: 13,
    color: '#6b7280',
    fontWeight: '500',
  },
  historyItem: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  historyDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#6366f1',
    marginTop: 6,
    marginRight: 12,
  },
  historyContent: {
    flex: 1,
  },
  historyStatus: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  historyMeta: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  historyNotes: {
    fontSize: 13,
    color: '#374151',
    fontStyle: 'italic',
  },
});
