import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { accommodationService } from '../../src/services/accommodationService';
import { AccommodationCallRequest, CallRequestStatus, Priority } from '../../src/types';

const STATUS_COLUMNS: { status: CallRequestStatus; label: string; color: string }[] = [
  { status: 'NEW', label: 'New', color: '#2196F3' },
  { status: 'CONTACTED', label: 'Contacted', color: '#FF9800' },
  { status: 'QUALIFIED', label: 'Qualified', color: '#9C27B0' },
  { status: 'FOLLOW_UP', label: 'Follow Up', color: '#FFC107' },
  { status: 'SCHEDULED', label: 'Scheduled', color: '#00BCD4' },
  { status: 'CONVERTED', label: 'Converted', color: '#4CAF50' },
  { status: 'LOST', label: 'Lost', color: '#F44336' },
  { status: 'INVALID', label: 'Invalid', color: '#9E9E9E' },
];

const PRIORITY_COLORS = {
  LOW: '#4CAF50',
  MEDIUM: '#FF9800',
  HIGH: '#F44336',
  URGENT: '#9C27B0',
};

export default function CallRequests() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [callRequests, setCallRequests] = useState<AccommodationCallRequest[]>([]);
  const [filterStatus, setFilterStatus] = useState<CallRequestStatus | 'ALL'>('ALL');
  const [filterPriority, setFilterPriority] = useState<Priority | 'ALL'>('ALL');
  const [stats, setStats] = useState({
    total: 0,
    new: 0,
    contacted: 0,
    qualified: 0,
    followUp: 0,
    scheduled: 0,
    converted: 0,
    lost: 0,
    invalid: 0,
  });

  useEffect(() => {
    loadCallRequests();
  }, [filterStatus, filterPriority]);

  const loadCallRequests = async () => {
    try {
      setLoading(true);
      const filters: any = {};
      
      if (filterStatus !== 'ALL') {
        filters.status = filterStatus;
      }
      
      if (filterPriority !== 'ALL') {
        filters.priority = filterPriority;
      }

      const response = await accommodationService.getAllCallRequests(filters);
      setCallRequests(response.data);
      
      // Calculate stats
      const allRequests = await accommodationService.getAllCallRequests({});
      const data = allRequests.data;
      setStats({
        total: data.length,
        new: data.filter((r: AccommodationCallRequest) => r.status === 'NEW').length,
        contacted: data.filter((r: AccommodationCallRequest) => r.status === 'CONTACTED').length,
        qualified: data.filter((r: AccommodationCallRequest) => r.status === 'QUALIFIED').length,
        followUp: data.filter((r: AccommodationCallRequest) => r.status === 'FOLLOW_UP').length,
        scheduled: data.filter((r: AccommodationCallRequest) => r.status === 'SCHEDULED').length,
        converted: data.filter((r: AccommodationCallRequest) => r.status === 'CONVERTED').length,
        lost: data.filter((r: AccommodationCallRequest) => r.status === 'LOST').length,
        invalid: data.filter((r: AccommodationCallRequest) => r.status === 'INVALID').length,
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to load call requests');
    } finally {
      setLoading(false);
    }
  };

  const getRequestsByStatus = (status: CallRequestStatus) => {
    return callRequests.filter(req => req.status === status);
  };

  const renderCallRequestCard = (request: AccommodationCallRequest) => (
    <TouchableOpacity
      key={request.id}
      style={styles.card}
      onPress={() => router.push(`/(admin)/call-request-detail?id=${request.id}`)}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.cardName}>{request.name}</Text>
        <View style={[styles.priorityBadge, { backgroundColor: PRIORITY_COLORS[request.priority] }]}>
          <Text style={styles.priorityText}>{request.priority}</Text>
        </View>
      </View>
      
      <Text style={styles.cardPhone}>{request.phone}</Text>
      {request.email && <Text style={styles.cardEmail}>{request.email}</Text>}
      
      {request.accommodation && (
        <Text style={styles.cardAccommodation} numberOfLines={1}>
          {request.accommodation.name}
        </Text>
      )}
      
      {request.scheduledCallDate && (
        <Text style={styles.cardScheduled}>
          Scheduled: {new Date(request.scheduledCallDate).toLocaleDateString()}
        </Text>
      )}
      
      <Text style={styles.cardDate}>
        {new Date(request.createdAt).toLocaleDateString()}
      </Text>
      
      {request._count && request._count.interactions > 0 && (
        <View style={styles.interactionBadge}>
          <Text style={styles.interactionText}>
            {request._count.interactions} interaction{request._count.interactions > 1 ? 's' : ''}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );

  const renderStatusColumn = (column: typeof STATUS_COLUMNS[0]) => {
    const requests = getRequestsByStatus(column.status);
    const count = stats[column.status.toLowerCase() as keyof typeof stats] || 0;

    return (
      <View key={column.status} style={styles.column}>
        <View style={[styles.columnHeader, { backgroundColor: column.color }]}>
          <Text style={styles.columnTitle}>{column.label}</Text>
          <View style={styles.columnCount}>
            <Text style={styles.columnCountText}>{count}</Text>
          </View>
        </View>
        
        <ScrollView style={styles.columnContent}>
          {requests.map(request => renderCallRequestCard(request))}
          {requests.length === 0 && (
            <Text style={styles.emptyColumn}>No requests</Text>
          )}
        </ScrollView>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => router.push('/(admin)/manage-accommodations')} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Accommodations</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.refreshButton}
            onPress={loadCallRequests}
          >
            <Text style={styles.refreshButtonText}>↻ Refresh</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.title}>Call Requests CRM</Text>
        <Text style={styles.subtitle}>Manage leads and track conversions</Text>
      </View>

      {/* Stats Overview */}
      <ScrollView horizontal style={styles.statsContainer} showsHorizontalScrollIndicator={false}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.total}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statValue, { color: '#2196F3' }]}>{stats.new}</Text>
          <Text style={styles.statLabel}>New</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statValue, { color: '#FF9800' }]}>{stats.contacted}</Text>
          <Text style={styles.statLabel}>Contacted</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statValue, { color: '#FFC107' }]}>{stats.followUp}</Text>
          <Text style={styles.statLabel}>Follow Up</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statValue, { color: '#4CAF50' }]}>{stats.converted}</Text>
          <Text style={styles.statLabel}>Converted</Text>
        </View>
      </ScrollView>

      {/* Filters */}
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity
            style={[styles.filterButton, filterStatus === 'ALL' && styles.filterButtonActive]}
            onPress={() => setFilterStatus('ALL')}
          >
            <Text style={[styles.filterButtonText, filterStatus === 'ALL' && styles.filterButtonTextActive]}>
              All Status
            </Text>
          </TouchableOpacity>
          
          {STATUS_COLUMNS.map(col => (
            <TouchableOpacity
              key={col.status}
              style={[styles.filterButton, filterStatus === col.status && styles.filterButtonActive]}
              onPress={() => setFilterStatus(col.status)}
            >
              <Text style={[styles.filterButtonText, filterStatus === col.status && styles.filterButtonTextActive]}>
                {col.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Kanban Board */}
      <ScrollView 
        horizontal 
        style={styles.kanbanContainer}
        showsHorizontalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={loadCallRequests} />
        }
      >
        {STATUS_COLUMNS.map(column => renderStatusColumn(column))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    paddingBottom: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 16,
    color: '#3b82f6',
    fontWeight: '500',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  refreshButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  refreshButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  statsContainer: {
    backgroundColor: '#fff',
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  statCard: {
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderRadius: 8,
    marginHorizontal: 5,
    minWidth: 100,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  filterContainer: {
    backgroundColor: '#fff',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  filterButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#007AFF',
    marginRight: 10,
    backgroundColor: '#fff',
  },
  filterButtonActive: {
    backgroundColor: '#007AFF',
  },
  filterButtonText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '600',
  },
  filterButtonTextActive: {
    color: '#fff',
  },
  kanbanContainer: {
    flex: 1,
    padding: 16,
    minHeight: 600,
  },
  column: {
    width: 300,
    marginRight: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  columnHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
  },
  columnTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  columnCount: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  columnCountText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  columnContent: {
    padding: 10,
    maxHeight: 600,
  },
  emptyColumn: {
    textAlign: 'center',
    color: '#999',
    padding: 20,
    fontSize: 14,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  priorityText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  cardPhone: {
    fontSize: 14,
    color: '#007AFF',
    marginBottom: 4,
  },
  cardEmail: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  cardAccommodation: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
    marginTop: 8,
    marginBottom: 4,
  },
  cardScheduled: {
    fontSize: 12,
    color: '#FF9800',
    fontWeight: '600',
    marginTop: 4,
  },
  cardDate: {
    fontSize: 11,
    color: '#999',
    marginTop: 8,
  },
  interactionBadge: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  interactionText: {
    fontSize: 11,
    color: '#2196F3',
    fontWeight: '600',
  },
});
