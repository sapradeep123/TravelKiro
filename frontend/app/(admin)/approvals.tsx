import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, ActivityIndicator, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../../src/services/api';
import WebHeader from '../../components/WebHeader';
import WebFooter from '../../components/WebFooter';

interface ApprovalItem {
  id: string;
  contentType: string;
  contentId: string;
  submittedBy: string;
  submittedByRole: string;
  status: string;
  createdAt: string;
  content?: any;
}

export default function ApprovalsPage() {
  const [approvals, setApprovals] = useState<ApprovalItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const isWeb = Platform.OS === 'web';

  useEffect(() => {
    fetchApprovals();
  }, []);

  const fetchApprovals = async () => {
    try {
      const response = await api.get('/approvals/pending');
      setApprovals(response.data);
    } catch (error) {
      console.error('Error fetching approvals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await api.post(`/approvals/${id}/approve`);
      setApprovals(prev => prev.filter(item => item.id !== id));
    } catch (error) {
      console.error('Error approving:', error);
    }
  };

  const handleReject = async (id: string) => {
    try {
      await api.post(`/approvals/${id}/reject`, {
        reason: 'Does not meet quality standards'
      });
      setApprovals(prev => prev.filter(item => item.id !== id));
    } catch (error) {
      console.error('Error rejecting:', error);
    }
  };

  const filteredApprovals = selectedType === 'ALL' 
    ? approvals 
    : approvals.filter(item => item.contentType === selectedType);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {isWeb && <WebHeader />}
      <ScrollView style={styles.scrollContainer}>
        <View style={[styles.content, isWeb && styles.webContent]}>
        <View style={styles.header}>
          <Text style={styles.title}>Content Approvals</Text>
          <Text style={styles.subtitle}>Review and approve pending submissions</Text>
        </View>

        {/* Filters */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filters}>
          {['ALL', 'LOCATION', 'EVENT', 'PACKAGE', 'ACCOMMODATION'].map(type => (
            <TouchableOpacity
              key={type}
              style={[styles.filter, selectedType === type && styles.filterActive]}
              onPress={() => setSelectedType(type)}
            >
              <Text style={[styles.filterText, selectedType === type && styles.filterTextActive]}>
                {type}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Approvals List */}
        <View style={styles.approvalsList}>
          {filteredApprovals.map(item => (
            <View key={item.id} style={styles.approvalCard}>
              <View style={styles.approvalHeader}>
                <View style={[styles.typeBadge, { backgroundColor: getTypeColor(item.contentType) + '20' }]}>
                  <Text style={[styles.typeBadgeText, { color: getTypeColor(item.contentType) }]}>
                    {item.contentType}
                  </Text>
                </View>
                <Text style={styles.date}>
                  {new Date(item.createdAt).toLocaleDateString()}
                </Text>
              </View>

              <Text style={styles.submittedBy}>
                Submitted by: {item.submittedByRole}
              </Text>

              <View style={styles.actions}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.approveButton]}
                  onPress={() => handleApprove(item.id)}
                >
                  <Ionicons name="checkmark-circle" size={20} color="#ffffff" />
                  <Text style={styles.actionButtonText}>Approve</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, styles.rejectButton]}
                  onPress={() => handleReject(item.id)}
                >
                  <Ionicons name="close-circle" size={20} color="#ffffff" />
                  <Text style={styles.actionButtonText}>Reject</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}

          {filteredApprovals.length === 0 && (
            <View style={styles.emptyState}>
              <Ionicons name="checkmark-done-circle-outline" size={64} color="#d1d5db" />
              <Text style={styles.emptyStateText}>No pending approvals</Text>
            </View>
          )}
        </View>
      </View>
      </ScrollView>
      {isWeb && <WebFooter />}
    </View>
  );
}

function getTypeColor(type: string) {
  switch (type) {
    case 'LOCATION': return '#10b981';
    case 'EVENT': return '#ec4899';
    case 'PACKAGE': return '#8b5cf6';
    case 'ACCOMMODATION': return '#06b6d4';
    default: return '#6b7280';
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  scrollContainer: {
    flex: 1,
  },
  content: {
    padding: 20,
    minHeight: '100%',
  },
  webContent: {
    maxWidth: 1200,
    marginHorizontal: 'auto',
    width: '100%',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  filters: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  filter: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  filterActive: {
    backgroundColor: '#6366f1',
    borderColor: '#6366f1',
  },
  filterText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  filterTextActive: {
    color: '#ffffff',
  },
  approvalsList: {
    gap: 16,
  },
  approvalCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  approvalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  typeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  typeBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  date: {
    fontSize: 12,
    color: '#9ca3af',
  },
  submittedBy: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  approveButton: {
    backgroundColor: '#10b981',
  },
  rejectButton: {
    backgroundColor: '#ef4444',
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#9ca3af',
    marginTop: 16,
  },
});
