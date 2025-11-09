import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Image, Platform, ActivityIndicator, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import api from '../../src/services/api';
import WebFooter from '../../components/WebFooter';

interface Event {
  id: string;
  title: string;
  description: string;
  eventType: string;
  venue?: string;
  customArea?: string;
  customState?: string;
  startDate: string;
  endDate: string;
  images: string[];
  approvalStatus: string;
  isActive: boolean;
}

export default function EventsScreen() {
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const isWeb = Platform.OS === 'web';
  const { width } = Dimensions.get('window');

  useEffect(() => {
    loadEvents();
  }, []);

  useEffect(() => {
    filterEvents();
  }, [events, searchQuery]);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const response = await api.get('/events');
      const data = response.data.data || [];
      // Filter only active and approved events
      const activeEvents = data.filter((e: Event) => 
        e.isActive && e.approvalStatus === 'APPROVED'
      );
      setEvents(activeEvents);
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterEvents = () => {
    if (!searchQuery.trim()) {
      setFilteredEvents(events);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = events.filter(event =>
      event.title.toLowerCase().includes(query) ||
      event.description.toLowerCase().includes(query) ||
      event.eventType.toLowerCase().includes(query)
    );
    setFilteredEvents(filtered);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const handleEventClick = (eventId: string) => {
    if (Platform.OS === 'web') {
      (window as any).location.href = `/event-detail?id=${eventId}`;
    }
  };

  const getGridColumns = () => {
    if (width >= 1400) return 4;
    if (width >= 1024) return 3;
    if (width >= 768) return 2;
    return 1;
  };

  const columns = getGridColumns();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366f1" />
        <Text style={styles.loadingText}>Loading events...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollContainer}>
        <View style={[styles.content, isWeb && styles.webContent]}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Events & Festivals</Text>
              <Text style={styles.subtitle}>
                Discover {filteredEvents.length} of {events.length} amazing events
              </Text>
            </View>
          </View>

          {/* Search */}
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#6b7280" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search events..."
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          {/* Events Grid */}
          <View style={styles.grid}>
            {filteredEvents.map((event) => (
              <TouchableOpacity
                key={event.id}
                style={[styles.eventCard, { width: `${100 / columns - 2}%` }]}
                onPress={() => handleEventClick(event.id)}
                activeOpacity={0.8}
              >
                {/* Image */}
                <View style={styles.imageContainer}>
                  {event.images && event.images[0] ? (
                    <Image 
                      source={{ uri: event.images[0] }} 
                      style={styles.eventImage}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={styles.placeholderImage}>
                      <Ionicons name="calendar" size={48} color="#d1d5db" />
                    </View>
                  )}
                  <View style={styles.imageOverlay}>
                    <Text style={styles.eventTitle} numberOfLines={2}>
                      {event.title}
                    </Text>
                    <View style={styles.dateTag}>
                      <Ionicons name="calendar-outline" size={14} color="#ffffff" />
                      <Text style={styles.dateText}>{formatDate(event.startDate)}</Text>
                    </View>
                  </View>
                </View>

                {/* Content */}
                <View style={styles.cardContent}>
                  <View style={styles.typeBadge}>
                    <Text style={styles.typeBadgeText}>{event.eventType}</Text>
                  </View>
                  
                  <Text style={styles.description} numberOfLines={3}>
                    {event.description}
                  </Text>

                  {event.venue && (
                    <View style={styles.locationRow}>
                      <Ionicons name="location" size={14} color="#6b7280" />
                      <Text style={styles.locationText} numberOfLines={1}>
                        {event.venue}
                      </Text>
                    </View>
                  )}

                  {event.customArea && (
                    <View style={styles.locationRow}>
                      <Ionicons name="pin" size={14} color="#6b7280" />
                      <Text style={styles.locationText} numberOfLines={1}>
                        {event.customArea}, {event.customState}
                      </Text>
                    </View>
                  )}

                  <View style={styles.cardFooter}>
                    <Text style={styles.viewDetails}>View Details →</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {filteredEvents.length === 0 && (
            <View style={styles.emptyState}>
              <Ionicons name="calendar-outline" size={64} color="#d1d5db" />
              <Text style={styles.emptyText}>No events found</Text>
              <Text style={styles.emptySubtext}>
                {searchQuery ? 'Try adjusting your search' : 'Check back later for upcoming events'}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
      {isWeb && <WebFooter />}
    </View>
  );
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
    paddingBottom: 100,
  },
  webContent: {
    maxWidth: 1400,
    marginHorizontal: 'auto',
    width: '100%',
    paddingHorizontal: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6b7280',
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 20,
  },
  eventCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  imageContainer: {
    position: 'relative',
    height: 220,
  },
  eventImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
  },
  eventTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  dateTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dateText: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '500',
  },
  cardContent: {
    padding: 16,
  },
  typeBadge: {
    backgroundColor: '#6366f120',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  typeBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6366f1',
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    color: '#6b7280',
    marginBottom: 12,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  locationText: {
    fontSize: 14,
    color: '#6b7280',
    flex: 1,
  },
  cardFooter: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  viewDetails: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6366f1',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#9ca3af',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9ca3af',
  },
});
