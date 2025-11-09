import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, RefreshControl, Alert } from 'react-native';
import { Text, Card, Chip, Button, ActivityIndicator, DataTable, IconButton } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { eventService } from '../../src/services/eventService';
import { useAuth } from '../../src/contexts/AuthContext';
import { useRouter } from 'expo-router';

interface CallbackRequest {
  id: string;
  eventId: string;
  name: string;
  phone: string;
  email?: string;
  message?: string;
  isContacted: boolean;
  createdAt: string;
  event?: {
    id: string;
    title: string;
    host: {
      profile: {
        name: string;
      };
    };
  };
}

export default function EventCallbacksScreen() {
  const [requests, setRequests] = useState<CallbackRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user || (user.role !== 'SITE_ADMIN' && user.role !== 'GOVT_DEPARTMENT' && user.role !== 'TOURIST_GUIDE')) {
      Alert.alert('Unauthorized', 'You do not have permission to view this page');
      router.back();
      return;
    }
    loadCallbackRequests();
  }, []);

  const loadCallbackRequests = async () => {
    try {
      setLoading(true);
      const data = await eventService.getAllCallbackRequests();
      setRequests(data);
    } catch (error) {
      console.error('Error loading callback requests:', error);
      Alert.alert('Error', 'Failed to load callback requests');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadCallbackRequests();
    setRefreshing(false);
  };

  const handleMarkContacted = async (requestId: string) => {
    try {
      await eventService.markAsContacted(requestId);
      Alert.alert('Success', 'Marked as contacted');
      loadCallbackRequests();
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error || 'Failed to update status');
    }
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

  const handleCallPhone = (phone: string) => {
    if (typeof window !== 'undefined' && window.open) {
      window.open(`tel:${phone}`, '_self');
    }
  };

  const handleEmailContact = (email: string) => {
    if (typeof window !== 'undefined' && window.open) {
      window.open(`mailto:${email}`, '_blank');
    }
  };

  if (loading) {
    return (
      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#ffffff" />
        <Text style={styles.loadingText}>Loading callback requests...</Text>
      </LinearGradient>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
    >
      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.header}>
        <Text variant="headlineMedium" style={styles.headerTitle}>
          Event Callback Requests
        </Text>
        <Text style={styles.headerSubtitle}>
          {requests.length} total request{requests.length !== 1 ? 's' : ''}
        </Text>
      </LinearGradient>

      <View style={styles.content}>
        <View style={styles.statsRow}>
          <Card style={styles.statCard}>
            <Card.Content>
              <Text variant="titleLarge" style={styles.statNumber}>
                {requests.filter(r => !r.isContacted).length}
              </Text>
              <Text variant="bodyMedium" style={styles.statLabel}>
                Pending
              </Text>
            </Card.Content>
          </Card>
          <Card style={styles.statCard}>
            <Card.Content>
              <Text variant="titleLarge" style={styles.statNumber}>
                {requests.filter(r => r.isContacted).length}
              </Text>
              <Text variant="bodyMedium" style={styles.statLabel}>
                Contacted
              </Text>
            </Card.Content>
          </Card>
        </View>

        {requests.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Card.Content style={styles.emptyContent}>
              <Text style={styles.emptyIcon}>📞</Text>
              <Text variant="titleLarge" style={styles.emptyText}>
                No callback requests yet
              </Text>
              <Text variant="bodyMedium" style={styles.emptySubtext}>
                Callback requests will appear here when users express interest in events
              </Text>
            </Card.Content>
          </Card>
        ) : (
          requests.map((request) => (
            <Card key={request.id} style={styles.requestCard}>
              <Card.Content>
                <View style={styles.requestHeader}>
                  <View style={styles.requestHeaderLeft}>
                    <Text variant="titleMedium" style={styles.requestName}>
                      {request.name}
                    </Text>
                    <Chip
                      icon={request.isContacted ? 'check-circle' : 'clock'}
                      style={[
                        styles.statusChip,
                        request.isContacted ? styles.contactedChip : styles.pendingChip,
                      ]}
                      textStyle={styles.statusChipText}
                      compact
                    >
                      {request.isContacted ? 'Contacted' : 'Pending'}
                    </Chip>
                  </View>
                  <Text variant="bodySmall" style={styles.requestDate}>
                    {formatDate(request.createdAt)}
                  </Text>
                </View>

                {request.event && (
                  <View style={styles.eventInfo}>
                    <Text variant="bodyMedium" style={styles.eventTitle}>
                      📅 {request.event.title}
                    </Text>
                    {user?.role === 'SITE_ADMIN' && (
                      <Text variant="bodySmall" style={styles.hostInfo}>
                        Host: {request.event.host.profile.name}
                      </Text>
                    )}
                  </View>
                )}

                <View style={styles.contactInfo}>
                  <View style={styles.contactRow}>
                    <Text style={styles.contactLabel}>Phone:</Text>
                    <TouchableOpacity onPress={() => handleCallPhone(request.phone)}>
                      <Text style={styles.contactValue}>{request.phone}</Text>
                    </TouchableOpacity>
                  </View>
                  {request.email && (
                    <View style={styles.contactRow}>
                      <Text style={styles.contactLabel}>Email:</Text>
                      <TouchableOpacity onPress={() => handleEmailContact(request.email!)}>
                        <Text style={styles.contactValue}>{request.email}</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                  {request.message && (
                    <View style={styles.messageContainer}>
                      <Text style={styles.contactLabel}>Message:</Text>
                      <Text style={styles.messageText}>{request.message}</Text>
                    </View>
                  )}
                </View>

                {!request.isContacted && (
                  <Button
                    mode="contained"
                    icon="check"
                    onPress={() => handleMarkContacted(request.id)}
                    style={styles.contactedButton}
                  >
                    Mark as Contacted
                  </Button>
                )}
              </Card.Content>
            </Card>
          ))
        )}
      </View>
    </ScrollView>
  );
}

import { TouchableOpacity } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '500',
  },
  header: {
    padding: 24,
    paddingTop: 40,
  },
  headerTitle: {
    color: '#ffffff',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  headerSubtitle: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 16,
  },
  content: {
    padding: 16,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  statNumber: {
    color: '#667eea',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    color: '#666',
  },
  requestCard: {
    marginBottom: 16,
    backgroundColor: '#ffffff',
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  requestHeaderLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  requestName: {
    color: '#333',
    fontWeight: 'bold',
  },
  requestDate: {
    color: '#999',
  },
  statusChip: {
    height: 28,
  },
  statusChipText: {
    fontSize: 11,
    fontWeight: '600',
  },
  contactedChip: {
    backgroundColor: '#d4edda',
  },
  pendingChip: {
    backgroundColor: '#fff3cd',
  },
  eventInfo: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  eventTitle: {
    color: '#333',
    fontWeight: '600',
    marginBottom: 4,
  },
  hostInfo: {
    color: '#666',
  },
  contactInfo: {
    marginBottom: 12,
  },
  contactRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  contactLabel: {
    fontWeight: '600',
    color: '#666',
    width: 80,
  },
  contactValue: {
    color: '#667eea',
    textDecorationLine: 'underline',
  },
  messageContainer: {
    marginTop: 8,
  },
  messageText: {
    color: '#333',
    marginTop: 4,
    fontStyle: 'italic',
  },
  contactedButton: {
    backgroundColor: '#10b981',
    marginTop: 8,
  },
  emptyCard: {
    marginTop: 24,
    backgroundColor: '#ffffff',
  },
  emptyContent: {
    alignItems: 'center',
    padding: 32,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    color: '#666',
    textAlign: 'center',
  },
});
