import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { Text, Card, Avatar, Chip, Button, ActivityIndicator, Divider } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { communityService } from '../../src/services/communityService';
import { useAuth } from '../../src/contexts/AuthContext';

export default function ModerationScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'pending' | 'all'>('pending');

  useEffect(() => {
    if (user?.role !== 'SITE_ADMIN') {
      router.back();
      return;
    }
    loadReports();
  }, [filter]);

  const loadReports = async () => {
    try {
      setLoading(true);
      const data = await communityService.getReports();
      const filteredReports = filter === 'pending' 
        ? data.data.filter((r: any) => r.status === 'pending')
        : data.data;
      setReports(filteredReports);
    } catch (error) {
      console.error('Error loading reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadReports();
    setRefreshing(false);
  };

  const handleHidePost = async (postId: string, reportId: string) => {
    Alert.alert(
      'Hide Post',
      'Are you sure you want to hide this post from the community?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Hide Post',
          style: 'destructive',
          onPress: async () => {
            try {
              await communityService.hidePost(postId);
              Alert.alert('Success', 'Post has been hidden');
              await loadReports();
            } catch (error) {
              Alert.alert('Error', 'Failed to hide post');
            }
          }
        }
      ]
    );
  };

  const handleDismissReport = async (reportId: string) => {
    try {
      await communityService.dismissReport(reportId);
      Alert.alert('Success', 'Report dismissed');
      await loadReports();
    } catch (error) {
      Alert.alert('Error', 'Failed to dismiss report');
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: any = {
      spam: '#f59e0b',
      harassment: '#ef4444',
      inappropriate: '#ec4899',
      violence: '#dc2626',
      hate_speech: '#991b1b',
      false_info: '#f97316',
      other: '#6b7280',
    };
    return colors[category] || '#6b7280';
  };

  const getCategoryIcon = (category: string) => {
    const icons: any = {
      spam: 'alert-circle',
      harassment: 'account-alert',
      inappropriate: 'eye-off',
      violence: 'alert-octagon',
      hate_speech: 'message-alert',
      false_info: 'information',
      other: 'dots-horizontal',
    };
    return icons[category] || 'alert';
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#667eea" />
        <Text style={styles.loadingText}>Loading reports...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
          </TouchableOpacity>
          <View>
            <Text style={styles.headerTitle}>Content Moderation</Text>
            <Text style={styles.headerSubtitle}>{reports.length} reports to review</Text>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterBtn, filter === 'pending' && styles.filterBtnActive]}
          onPress={() => setFilter('pending')}
        >
          <Text style={[styles.filterText, filter === 'pending' && styles.filterTextActive]}>
            Pending
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterBtn, filter === 'all' && styles.filterBtnActive]}
          onPress={() => setFilter('all')}
        >
          <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>
            All Reports
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
      >
        {reports.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="check-circle" size={64} color="#10b981" />
            <Text style={styles.emptyTitle}>All Clear!</Text>
            <Text style={styles.emptyText}>No pending reports to review</Text>
          </View>
        ) : (
          reports.map((report) => (
            <Card key={report.id} style={styles.reportCard}>
              <Card.Content>
                {/* Report Header */}
                <View style={styles.reportHeader}>
                  <View style={styles.reportCategory}>
                    <MaterialCommunityIcons
                      name={getCategoryIcon(report.category)}
                      size={20}
                      color={getCategoryColor(report.category)}
                    />
                    <Text style={[styles.categoryText, { color: getCategoryColor(report.category) }]}>
                      {report.category.replace('_', ' ').toUpperCase()}
                    </Text>
                  </View>
                  <Chip
                    style={[
                      styles.statusChip,
                      report.status === 'pending' && styles.statusPending,
                      report.status === 'reviewed' && styles.statusReviewed,
                    ]}
                    textStyle={styles.statusText}
                  >
                    {report.status}
                  </Chip>
                </View>

                {/* Reporter Info */}
                <View style={styles.reporterInfo}>
                  <Avatar.Text
                    size={32}
                    label={report.reporter?.name?.substring(0, 2) || 'U'}
                    style={styles.reporterAvatar}
                  />
                  <View style={styles.reporterDetails}>
                    <Text style={styles.reporterName}>
                      Reported by {report.reporter?.name || 'User'}
                    </Text>
                    <Text style={styles.reportTime}>
                      {new Date(report.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Text>
                  </View>
                </View>

                {/* Report Reason */}
                {report.reason && (
                  <View style={styles.reasonContainer}>
                    <Text style={styles.reasonLabel}>Reason:</Text>
                    <Text style={styles.reasonText}>{report.reason}</Text>
                  </View>
                )}

                <Divider style={styles.divider} />

                {/* Reported Post */}
                <View style={styles.postPreview}>
                  <Text style={styles.postLabel}>Reported Post:</Text>
                  <View style={styles.postContent}>
                    <Avatar.Text
                      size={28}
                      label={report.post?.user?.name?.substring(0, 2) || 'U'}
                      style={styles.postAvatar}
                    />
                    <View style={styles.postDetails}>
                      <Text style={styles.postAuthor}>{report.post?.user?.name || 'User'}</Text>
                      <Text style={styles.postCaption} numberOfLines={2}>
                        {report.post?.caption}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Actions */}
                {report.status === 'pending' && (
                  <View style={styles.actions}>
                    <Button
                      mode="outlined"
                      onPress={() => handleDismissReport(report.id)}
                      style={styles.dismissBtn}
                      textColor="#6b7280"
                    >
                      Dismiss
                    </Button>
                    <Button
                      mode="contained"
                      onPress={() => handleHidePost(report.post.id, report.id)}
                      style={styles.hideBtn}
                      buttonColor="#dc2626"
                    >
                      Hide Post
                    </Button>
                  </View>
                )}
              </Card.Content>
            </Card>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    color: '#6b7280',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 4,
  },
  filterContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    backgroundColor: '#fff',
  },
  filterBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
  },
  filterBtnActive: {
    backgroundColor: '#667eea',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  filterTextActive: {
    color: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
    marginTop: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginTop: 16,
  },
  emptyText: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 8,
  },
  reportCard: {
    margin: 16,
    marginBottom: 0,
    borderRadius: 12,
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  reportCategory: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '700',
  },
  statusChip: {
    height: 24,
  },
  statusPending: {
    backgroundColor: '#fef3c7',
  },
  statusReviewed: {
    backgroundColor: '#d1fae5',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  reporterInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  reporterAvatar: {
    backgroundColor: '#667eea',
  },
  reporterDetails: {
    flex: 1,
  },
  reporterName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  reportTime: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  reasonContainer: {
    backgroundColor: '#fef3c7',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  reasonLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#92400e',
    marginBottom: 4,
  },
  reasonText: {
    fontSize: 13,
    color: '#78350f',
    lineHeight: 18,
  },
  divider: {
    marginVertical: 16,
  },
  postPreview: {
    marginBottom: 16,
  },
  postLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 8,
  },
  postContent: {
    flexDirection: 'row',
    gap: 12,
    padding: 12,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  postAvatar: {
    backgroundColor: '#9ca3af',
  },
  postDetails: {
    flex: 1,
  },
  postAuthor: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  postCaption: {
    fontSize: 13,
    color: '#374151',
    lineHeight: 18,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  dismissBtn: {
    flex: 1,
  },
  hideBtn: {
    flex: 1,
  },
});
