import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, RefreshControl, Alert, TouchableOpacity, Platform } from 'react-native';
import { Text, Card, Chip, Button, ActivityIndicator } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { eventService } from '../../src/services/eventService';
import { useAuth } from '../../src/contexts/AuthContext';
import { useRouter } from 'expo-router';
import WebHeader from '../../components/WebHeader';
import WebFooter from '../../components/WebFooter';
import { Ionicons } from '@expo/vector-icons';

// Declare window for web platform
declare const window: any;

interface CallbackRequest {
  id: string;
  eventId: string;
  name: string;
  phone: string;
  email?: string;
  message?: string;
  isContacted: boolean;
  createdAt: string;
}

interface Event {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  venue?: string;
  eventType: string;
}

export default function EventCallbackRequestsScreen() {
  const [requests, setRequests] = useState<CallbackRequest[]>([]);
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useAuth();
  const router = useRouter();
  const isWeb = Platform.OS === 'web';

  // Get eventId from URL
  const getEventId = () => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      return params.get('eventId');
    }
    return null;
  };

  useEffect(() => {
    if (!user || (user.role !== 'SITE_ADMIN' && user.role !== 'GOVT_DEPARTMENT' && user.role !== 'TOURIST_GUIDE')) {
      Alert.alert('Unauthorized', 'You do not have permission to view this page');
      router.back();
      return;
    }
    loadData();
  }, []);

  const loadData = async () => {
    const eventId = getEventId();
    if (!eventId) {
      console.error('No event ID found');
      setLoading(false);
      Alert.alert('Error', 'Event ID is required');
      return;
    }

    try {
      setLoading(true);
      console.log('Loading data for event:', eventId);
      
      // Load event details
      const eventData = await eventService.getEventById(eventId);
      console.log('Event data loaded:', eventData);
      setEvent(eventData);
      
      // Load callback requests for this event
      const requestsData = await eventService.getEventCallbackRequests(eventId);
      console.log('Callback requests loaded:', requestsData);
      setRequests(requestsData);
    } catch (error: any) {
      console.error('Error loading data:', error);
      console.error('Error details:', error.response?.data);
      setLoading(false);
      Alert.alert('Error', error.response?.data?.error || 'Failed to load callback requests');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleMarkContacted = async (requestId: string) => {
    try {
      await eventService.markAsContacted(requestId);
      Alert.alert('Success', 'Marked as contacted');
      loadData();
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

  const formatEventDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handleCallPhone = (phone: string) => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.open(`tel:${phone}`, '_self');
    }
  };

  const handleEmailContact = (email: string) => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.open(`mailto:${email}`, '_blank');
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        {isWeb && <WebHeader />}
        <LinearGradient colors={['#667eea', '#764ba2']} style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#ffffff" />
          <Text style={styles.loadingText}>Loading callback requests...</Text>
        </LinearGradient>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {isWeb && <WebHeader />}
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
      >
        <View style={[styles.content, isWeb && styles.webContent]}>
          {/* Back Button */}
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => {
              if (Platform.OS === 'web' && typeof window !== 'undefined') {
                window.location.href = '/manage-events';
              } else {
                router.push('/(admin)/manage-events' as any);
              }
            }}
          >
            <Ionicons name="arrow-back" size={20} color="#6366f1" />
            <Text style={styles.backButtonText}>Back to Events</Text>
          </TouchableOpacity>

          {/* Event Header */}
          {event && (
            <LinearGradient colors={['#667eea', '#764ba2']} style={styles.eventHeader}>
              <View style={styles.eventHeaderContent}>
                <Text variant="headlineMedium" style={styles.eventTitle}>
                  {event.title}
                </Text>
                <View style={styles.eventMeta}>
                  <View style={styles.eventMetaItem}>
                    <Ionicons name="calendar" size={16} color="rgba(255,255,255,0.9)" />
                    <Text style={styles.eventMetaText}>
                      {formatEventDate(event.startDate)} - {formatEventDate(event.endDate)}
                    </Text>
                  </View>
                  {event.venue && (
                    <View style={styles.eventMetaItem}>
                      <Ionicons name="location" size={16} color="rgba(255,255,255,0.9)" />
                      <Text style={styles.eventMetaText}>{event.venue}</Text>
                    </View>
                  )}
                  <View style={styles.eventMetaItem}>
                    <Ionicons name="pricetag" size={16} color="rgba(255,255,255,0.9)" />
                    <Text style={styles.eventMetaText}>{event.eventType}</Text>
                  </View>
                </View>
              </View>
            </LinearGradient>
          )}

          {/* Stats */}
          <View style={styles.statsRow}>
            <Card style={styles.statCard}>
              <Card.Content>
                <Text variant="titleLarge" style={styles.statNumber}>
                  {requests.length}
                </Text>
                <Text variant="bodyMedium" style={styles.statLabel}>
                  Total Requests
                </Text>
              </Card.Content>
            </Card>
            <Card style={styles.statCard}>
              <Card.Content>
                <Text variant="titleLarge" style={[styles.statNumber, { color: '#f59e0b' }]}>
                  {requests.filter(r => !r.isContacted).length}
                </Text>
                <Text variant="bodyMedium" style={styles.statLabel}>
                  Pending
                </Text>
              </Card.Content>
            </Card>
            <Card style={styles.statCard}>
              <Card.Content>
                <Text variant="titleLarge" style={[styles.statNumber, { color: '#10b981' }]}>
                  {requests.filter(r => r.isContacted).length}
                </Text>
                <Text variant="bodyMedium" style={styles.statLabel}>
                  Contacted
                </Text>
              </Card.Content>
            </Card>
          </View>

          {/* Requests List */}
          {requests.length === 0 ? (
            <Card style={styles.emptyCard}>
              <Card.Content style={styles.emptyContent}>
                <Ionicons name="call-outline" size={64} color="#d1d5db" />
                <Text variant="titleLarge" style={styles.emptyText}>
                  No callback requests yet
                </Text>
                <Text variant="bodyMedium" style={styles.emptySubtext}>
                  Callback requests will appear here when users express interest in this event
                </Text>
              </Card.Content>
            </Card>
          ) : (
            requests.map((request) => (
              <Card key={request.id} style={styles.requestCard}>
                <Card.Content>
                  <View style={styles.requestHeader}>
                    <View style={styles.requestHeaderLeft}>
                      <Ionicons name="person-circle" size={40} color="#6366f1" />
                      <View style={styles.requestHeaderInfo}>
                        <Text variant="titleMedium" style={styles.requestName}>
                          {request.name}
                        </Text>
                        <Text variant="bodySmall" style={styles.requestDate}>
                          {formatDate(request.createdAt)}
                        </Text>
                      </View>
                    </View>
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

                  <View style={styles.contactInfo}>
                    <View style={styles.contactRow}>
                      <Ionicons name="call" size={18} color="#6366f1" />
                      <Text style={styles.contactLabel}>Phone:</Text>
                      <TouchableOpacity onPress={() => handleCallPhone(request.phone)}>
                        <Text style={styles.contactValue}>{request.phone}</Text>
                      </TouchableOpacity>
                    </View>
                    {request.email && (
                      <View style={styles.contactRow}>
                        <Ionicons name="mail" size={18} color="#6366f1" />
                        <Text style={styles.contactLabel}>Email:</Text>
                        <TouchableOpacity onPress={() => handleEmailContact(request.email!)}>
                          <Text style={styles.contactValue}>{request.email}</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                    {request.message && (
                      <View style={styles.messageContainer}>
                        <Ionicons name="chatbox" size={18} color="#6366f1" />
                        <View style={styles.messageContent}>
                          <Text style={styles.contactLabel}>Message:</Text>
                          <Text style={styles.messageText}>{request.message}</Text>
                        </View>
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
        {isWeb && <WebFooter />}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    padding: 20,
  },
  webContent: {
    maxWidth: 1200,
    marginHorizontal: 'auto',
    width: '100%',
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
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
    alignSelf: 'flex-start',
  },
  backButtonText: {
    color: '#6366f1',
    fontSize: 16,
    fontWeight: '600',
  },
  eventHeader: {
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
  },
  eventHeaderContent: {
    gap: 12,
  },
  eventTitle: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  eventMeta: {
    gap: 8,
  },
  eventMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  eventMetaText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  statNumber: {
    color: '#6366f1',
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
    marginBottom: 16,
  },
  requestHeaderLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  requestHeaderInfo: {
    flex: 1,
  },
  requestName: {
    color: '#333',
    fontWeight: 'bold',
  },
  requestDate: {
    color: '#999',
    marginTop: 2,
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
  contactInfo: {
    gap: 12,
    marginBottom: 16,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  contactLabel: {
    fontWeight: '600',
    color: '#666',
    minWidth: 60,
  },
  contactValue: {
    color: '#6366f1',
    textDecorationLine: 'underline',
    fontSize: 15,
  },
  messageContainer: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-start',
  },
  messageContent: {
    flex: 1,
  },
  messageText: {
    color: '#333',
    marginTop: 4,
    fontStyle: 'italic',
    lineHeight: 20,
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
    padding: 48,
  },
  emptyText: {
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    color: '#666',
    textAlign: 'center',
  },
});
