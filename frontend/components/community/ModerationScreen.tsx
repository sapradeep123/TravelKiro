import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  RefreshControl,
  ScrollView,
} from 'react-native';
import { Avatar } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { communityService, PostReport } from '../../src/services/communityService';
import { useAuth } from '../../src/contexts/AuthContext';

export default function ModerationScreen() {
  const { user } = useAuth();
  const [reports, setReports] = useState<PostReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [processingReportId, setProcessingReportId] = useState<string | null>(null);

  // Check if user is admin
  const isAdmin = user?.role === 'SITE_ADMIN';

  useEffect(() => {
    if (isAdmin) {
      loadReports();
    }
  }, [isAdmin]);

  const loadReports = async (pageNum: number = 1, append: boolean = false) => {
    try {
      if (!append) {
        setLoading(true);
      }

      const response = await communityService.getReports(pageNum);
      
      if (append) {
        setReports((prev) => [...prev, ...response.data]);
      } else {
        setReports(response.data);
      }

      setHasMore(pageNum < response.pagination.totalPages);
      setPage(pageNum);
    } catch (error: any) {
      console.error('Error loading reports:', error);
      Alert.alert('Error', 'Failed to load reports. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  };

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    loadReports(1, false);
  }, []);

  const handleLoadMore = useCallback(() => {
    if (!loadingMore && hasMore && !loading) {
      setLoadingMore(true);
      loadReports(page + 1, true);
    }
  }, [loadingMore, hasMore, loading, page]);

  const handleHidePost = async (report: PostReport) => {
    Alert.alert(
      'Hide Post',
      'Are you sure you want to hide this post? It will be removed from all feeds.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Hide',
          style: 'destructive',
          onPress: async () => {
            setProcessingReportId(report.id);
            try {
              await communityService.hidePost(report.postId);
              Alert.alert('Success', 'Post has been hidden.');
              // Refresh the list
              loadReports(1, false);
            } catch (error: any) {
              console.error('Error hiding post:', error);
              Alert.alert('Error', error.response?.data?.message || 'Failed to hide post.');
            } finally {
              setProcessingReportId(null);
            }
          },
        },
      ]
    );
  };

  const handleUnhidePost = async (report: PostReport) => {
    Alert.alert(
      'Unhide Post',
      'Are you sure you want to unhide this post? It will be visible in feeds again.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Unhide',
          onPress: async () => {
            setProcessingReportId(report.id);
            try {
              await communityService.unhidePost(report.postId);
              Alert.alert('Success', 'Post has been unhidden.');
              // Refresh the list
              loadReports(1, false);
            } catch (error: any) {
              console.error('Error unhiding post:', error);
              Alert.alert('Error', error.response?.data?.message || 'Failed to unhide post.');
            } finally {
              setProcessingReportId(null);
            }
          },
        },
      ]
    );
  };

  const handleDismissReport = async (report: PostReport) => {
    Alert.alert(
      'Dismiss Report',
      'Are you sure you want to dismiss this report? The post will remain visible.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Dismiss',
          onPress: async () => {
            setProcessingReportId(report.id);
            try {
              await communityService.dismissReport(report.id);
              Alert.alert('Success', 'Report has been dismissed.');
              // Remove from list
              setReports((prev) => prev.filter((r) => r.id !== report.id));
            } catch (error: any) {
              console.error('Error dismissing report:', error);
              Alert.alert('Error', error.response?.data?.message || 'Failed to dismiss report.');
            } finally {
              setProcessingReportId(null);
            }
          },
        },
      ]
    );
  };

  const formatTimestamp = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'spam':
        return 'alert-circle';
      case 'harassment':
        return 'account-alert';
      case 'inappropriate':
        return 'eye-off';
      default:
        return 'flag';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'spam':
        return '#FF9800';
      case 'harassment':
        return '#F44336';
      case 'inappropriate':
        return '#9C27B0';
      default:
        return '#607D8B';
    }
  };

  const renderReportCard = ({ item: report }: { item: PostReport }) => {
    const isProcessing = processingReportId === report.id;
    const isPostHidden = report.post.isHidden;

    return (
      <View style={styles.reportCard}>
        {/* Report Header */}
        <View style={styles.reportHeader}>
          <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(report.category) + '20' }]}>
            <MaterialCommunityIcons
              name={getCategoryIcon(report.category)}
              size={16}
              color={getCategoryColor(report.category)}
            />
            <Text style={[styles.categoryText, { color: getCategoryColor(report.category) }]}>
              {report.category.toUpperCase()}
            </Text>
          </View>
          <Text style={styles.reportDate}>{formatTimestamp(report.createdAt)}</Text>
        </View>

        {/* Reporter Info */}
        <View style={styles.reporterInfo}>
          <Text style={styles.reporterLabel}>Reported by:</Text>
          <View style={styles.reporterDetails}>
            {report.reporter.avatar ? (
              <Avatar.Image size={24} source={{ uri: report.reporter.avatar }} />
            ) : (
              <Avatar.Text
                size={24}
                label={report.reporter.name.substring(0, 2).toUpperCase()}
                style={styles.reporterAvatar}
              />
            )}
            <Text style={styles.reporterName}>{report.reporter.name}</Text>
          </View>
        </View>

        {/* Report Reason */}
        {report.reason && (
          <View style={styles.reasonContainer}>
            <Text style={styles.reasonLabel}>Reason:</Text>
            <Text style={styles.reasonText}>{report.reason}</Text>
          </View>
        )}

        {/* Post Content */}
        <View style={styles.postContainer}>
          <View style={styles.postHeader}>
            <Text style={styles.postLabel}>Reported Post:</Text>
            {isPostHidden && (
              <View style={styles.hiddenBadge}>
                <MaterialCommunityIcons name="eye-off" size={14} color="#F44336" />
                <Text style={styles.hiddenText}>Hidden</Text>
              </View>
            )}
          </View>

          {/* Post Author */}
          <View style={styles.postAuthor}>
            {report.post.user.avatar ? (
              <Avatar.Image size={32} source={{ uri: report.post.user.avatar }} />
            ) : (
              <Avatar.Text
                size={32}
                label={report.post.user.name.substring(0, 2).toUpperCase()}
                style={styles.postAvatar}
              />
            )}
            <Text style={styles.postAuthorName}>{report.post.user.name}</Text>
          </View>

          {/* Post Caption */}
          {report.post.caption && (
            <Text style={styles.postCaption} numberOfLines={3}>
              {report.post.caption}
            </Text>
          )}

          {/* Post Media */}
          {report.post.mediaUrls && report.post.mediaUrls.length > 0 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.mediaScroll}>
              {report.post.mediaUrls.slice(0, 3).map((url, index) => (
                <Image key={index} source={{ uri: url }} style={styles.postMedia} />
              ))}
              {report.post.mediaUrls.length > 3 && (
                <View style={styles.moreMediaOverlay}>
                  <Text style={styles.moreMediaText}>+{report.post.mediaUrls.length - 3}</Text>
                </View>
              )}
            </ScrollView>
          )}

          {/* Post Stats */}
          <View style={styles.postStats}>
            <View style={styles.statItem}>
              <MaterialCommunityIcons name="heart" size={14} color="#65676b" />
              <Text style={styles.statText}>{report.post.likeCount}</Text>
            </View>
            <View style={styles.statItem}>
              <MaterialCommunityIcons name="comment" size={14} color="#65676b" />
              <Text style={styles.statText}>{report.post.commentCount}</Text>
            </View>
            <View style={styles.statItem}>
              <MaterialCommunityIcons name="bookmark" size={14} color="#65676b" />
              <Text style={styles.statText}>{report.post.saveCount}</Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          {isPostHidden ? (
            <TouchableOpacity
              style={[styles.actionButton, styles.unhideButton]}
              onPress={() => handleUnhidePost(report)}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <ActivityIndicator size="small" color="#4CAF50" />
              ) : (
                <>
                  <MaterialCommunityIcons name="eye" size={18} color="#4CAF50" />
                  <Text style={[styles.actionButtonText, styles.unhideButtonText]}>Unhide Post</Text>
                </>
              )}
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.actionButton, styles.hideButton]}
              onPress={() => handleHidePost(report)}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <ActivityIndicator size="small" color="#F44336" />
              ) : (
                <>
                  <MaterialCommunityIcons name="eye-off" size={18} color="#F44336" />
                  <Text style={[styles.actionButtonText, styles.hideButtonText]}>Hide Post</Text>
                </>
              )}
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.actionButton, styles.dismissButton]}
            onPress={() => handleDismissReport(report)}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <ActivityIndicator size="small" color="#65676b" />
            ) : (
              <>
                <MaterialCommunityIcons name="close-circle" size={18} color="#65676b" />
                <Text style={[styles.actionButtonText, styles.dismissButtonText]}>Dismiss</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <MaterialCommunityIcons name="shield-check" size={80} color="#e4e6eb" />
      <Text style={styles.emptyTitle}>No Pending Reports</Text>
      <Text style={styles.emptyText}>
        All reports have been reviewed. The community is looking good!
      </Text>
    </View>
  );

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color="#667eea" />
      </View>
    );
  };

  if (!isAdmin) {
    return (
      <View style={styles.unauthorizedContainer}>
        <MaterialCommunityIcons name="shield-lock" size={80} color="#e4e6eb" />
        <Text style={styles.unauthorizedTitle}>Access Denied</Text>
        <Text style={styles.unauthorizedText}>
          You need administrator privileges to access this page.
        </Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#667eea" />
        <Text style={styles.loadingText}>Loading reports...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <MaterialCommunityIcons name="shield-account" size={28} color="#667eea" />
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>Content Moderation</Text>
            <Text style={styles.headerSubtitle}>
              {reports.length} pending {reports.length === 1 ? 'report' : 'reports'}
            </Text>
          </View>
        </View>
      </View>

      {/* Reports List */}
      <FlatList
        data={reports}
        renderItem={renderReportCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContent,
          reports.length === 0 && styles.listContentEmpty,
        ]}
        ListEmptyComponent={renderEmptyState}
        ListFooterComponent={renderFooter}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={['#667eea']} />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f2f5',
  },
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e4e6eb',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1c1e21',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#65676b',
  },
  listContent: {
    padding: 16,
  },
  listContentEmpty: {
    flexGrow: 1,
  },
  reportCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '700',
  },
  reportDate: {
    fontSize: 12,
    color: '#8e8e93',
  },
  reporterInfo: {
    marginBottom: 12,
  },
  reporterLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#65676b',
    marginBottom: 6,
  },
  reporterDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  reporterAvatar: {
    backgroundColor: '#667eea',
  },
  reporterName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1c1e21',
  },
  reasonContainer: {
    marginBottom: 12,
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  reasonLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#65676b',
    marginBottom: 4,
  },
  reasonText: {
    fontSize: 14,
    color: '#1c1e21',
    lineHeight: 20,
  },
  postContainer: {
    borderTopWidth: 1,
    borderTopColor: '#e4e6eb',
    paddingTop: 12,
    marginBottom: 12,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  postLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#65676b',
  },
  hiddenBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#ffebee',
    borderRadius: 4,
  },
  hiddenText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#F44336',
  },
  postAuthor: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  postAvatar: {
    backgroundColor: '#667eea',
  },
  postAuthorName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1c1e21',
  },
  postCaption: {
    fontSize: 14,
    lineHeight: 20,
    color: '#1c1e21',
    marginBottom: 8,
  },
  mediaScroll: {
    marginBottom: 8,
  },
  postMedia: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginRight: 8,
    backgroundColor: '#f0f0f0',
  },
  moreMediaOverlay: {
    width: 100,
    height: 100,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  moreMediaText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  postStats: {
    flexDirection: 'row',
    gap: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 12,
    color: '#65676b',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  hideButton: {
    backgroundColor: '#ffebee',
    borderColor: '#F44336',
  },
  unhideButton: {
    backgroundColor: '#e8f5e9',
    borderColor: '#4CAF50',
  },
  dismissButton: {
    backgroundColor: '#f0f2f5',
    borderColor: '#e4e6eb',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  hideButtonText: {
    color: '#F44336',
  },
  unhideButtonText: {
    color: '#4CAF50',
  },
  dismissButtonText: {
    color: '#65676b',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1c1e21',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#65676b',
    textAlign: 'center',
    paddingHorizontal: 40,
    lineHeight: 20,
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f2f5',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#65676b',
  },
  unauthorizedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f2f5',
    paddingHorizontal: 40,
  },
  unauthorizedTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1c1e21',
    marginTop: 16,
    marginBottom: 8,
  },
  unauthorizedText: {
    fontSize: 14,
    color: '#65676b',
    textAlign: 'center',
    lineHeight: 20,
  },
});
