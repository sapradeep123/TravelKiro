import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Platform, ActivityIndicator, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import api from '../../src/services/api';

interface Event {
  id: string;
  title: string;
  description: string;
  eventType: string;
  venue?: string;
  customCountry?: string;
  customState?: string;
  customArea?: string;
  startDate: string;
  endDate: string;
  images: string[];
  nearestAirport?: string;
  airportDistance?: string;
  nearestRailway?: string;
  railwayDistance?: string;
  nearestBusStation?: string;
  busStationDistance?: string;
  approvalStatus: string;
  isActive: boolean;
  host?: {
    profile: {
      name: string;
    };
  };
}

export default function EventDetail() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const isWeb = Platform.OS === 'web';
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => {
    if (id) {
      fetchEvent();
    }
  }, [id]);

  const fetchEvent = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/events/${id}`);
      setEvent(response.data.data);
    } catch (error) {
      console.error('Error fetching event:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  if (!event) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={64} color="#ef4444" />
        <Text style={styles.errorText}>Event not found</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollContainer}>
        <View style={[styles.content, isWeb && styles.webContent]}>
          {/* Back Button */}
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#111827" />
            <Text style={styles.backText}>Back to Events</Text>
          </TouchableOpacity>

          {/* Image Gallery */}
          {event.images && event.images.length > 0 && (
            <View style={styles.imageSection}>
              <Image 
                source={{ uri: event.images[selectedImageIndex] }} 
                style={styles.mainImage}
                resizeMode="cover"
              />
              {event.images.length > 1 && (
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  style={styles.thumbnailScroll}
                >
                  {event.images.map((img, index) => (
                    <TouchableOpacity
                      key={index}
                      onPress={() => setSelectedImageIndex(index)}
                      style={[
                        styles.thumbnail,
                        selectedImageIndex === index && styles.thumbnailActive
                      ]}
                    >
                      <Image source={{ uri: img }} style={styles.thumbnailImage} />
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}
            </View>
          )}

          {/* Event Info */}
          <View style={styles.infoSection}>
            <View style={styles.header}>
              <View style={styles.typeBadge}>
                <Text style={styles.typeBadgeText}>{event.eventType}</Text>
              </View>
              <View style={[
                styles.statusBadge,
                { backgroundColor: event.isActive ? '#10b98120' : '#ef444420' }
              ]}>
                <Text style={[
                  styles.statusText,
                  { color: event.isActive ? '#10b981' : '#ef4444' }
                ]}>
                  {event.isActive ? 'Active' : 'Inactive'}
                </Text>
              </View>
            </View>

            <Text style={styles.title}>{event.title}</Text>

            {/* Dates */}
            <View style={styles.dateSection}>
              <View style={styles.dateCard}>
                <Ionicons name="calendar" size={20} color="#6366f1" />
                <View style={styles.dateInfo}>
                  <Text style={styles.dateLabel}>Start Date</Text>
                  <Text style={styles.dateValue}>{formatDate(event.startDate)}</Text>
                </View>
              </View>
              <View style={styles.dateCard}>
                <Ionicons name="calendar" size={20} color="#ec4899" />
                <View style={styles.dateInfo}>
                  <Text style={styles.dateLabel}>End Date</Text>
                  <Text style={styles.dateValue}>{formatDate(event.endDate)}</Text>
                </View>
              </View>
            </View>

            {/* Description */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>About This Event</Text>
              <Text style={styles.description}>{event.description}</Text>
            </View>

            {/* Location */}
            {(event.venue || event.customArea) && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Location</Text>
                {event.venue && (
                  <View style={styles.infoRow}>
                    <Ionicons name="location" size={20} color="#6366f1" />
                    <Text style={styles.infoText}>{event.venue}</Text>
                  </View>
                )}
                {event.customArea && (
                  <View style={styles.infoRow}>
                    <Ionicons name="pin" size={20} color="#6366f1" />
                    <Text style={styles.infoText}>
                      {event.customArea}
                      {event.customState && `, ${event.customState}`}
                      {event.customCountry && `, ${event.customCountry}`}
                    </Text>
                  </View>
                )}
              </View>
            )}

            {/* How to Reach */}
            {(event.nearestAirport || event.nearestRailway || event.nearestBusStation) && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>How to Reach</Text>
                
                {event.nearestAirport && (
                  <View style={styles.transportCard}>
                    <Ionicons name="airplane" size={24} color="#6366f1" />
                    <View style={styles.transportInfo}>
                      <Text style={styles.transportName}>{event.nearestAirport}</Text>
                      {event.airportDistance && (
                        <Text style={styles.transportDistance}>{event.airportDistance} away</Text>
                      )}
                    </View>
                  </View>
                )}

                {event.nearestRailway && (
                  <View style={styles.transportCard}>
                    <Ionicons name="train" size={24} color="#10b981" />
                    <View style={styles.transportInfo}>
                      <Text style={styles.transportName}>{event.nearestRailway}</Text>
                      {event.railwayDistance && (
                        <Text style={styles.transportDistance}>{event.railwayDistance} away</Text>
                      )}
                    </View>
                  </View>
                )}

                {event.nearestBusStation && (
                  <View style={styles.transportCard}>
                    <Ionicons name="bus" size={24} color="#f59e0b" />
                    <View style={styles.transportInfo}>
                      <Text style={styles.transportName}>{event.nearestBusStation}</Text>
                      {event.busStationDistance && (
                        <Text style={styles.transportDistance}>{event.busStationDistance} away</Text>
                      )}
                    </View>
                  </View>
                )}
              </View>
            )}

            {/* Hosted By */}
            {event.host && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Hosted By</Text>
                <View style={styles.hostCard}>
                  <View style={styles.hostAvatar}>
                    <Text style={styles.hostAvatarText}>
                      {event.host.profile.name.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <Text style={styles.hostName}>{event.host.profile.name}</Text>
                </View>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
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
    paddingBottom: 40,
  },
  webContent: {
    maxWidth: 1000,
    marginHorizontal: 'auto',
    width: '100%',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#6b7280',
    marginTop: 16,
    marginBottom: 24,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 8,
  },
  backText: {
    fontSize: 16,
    color: '#111827',
    fontWeight: '500',
  },
  imageSection: {
    marginBottom: 24,
  },
  mainImage: {
    width: '100%',
    height: 400,
    backgroundColor: '#e5e7eb',
  },
  thumbnailScroll: {
    padding: 12,
    backgroundColor: '#ffffff',
  },
  thumbnail: {
    width: 80,
    height: 80,
    marginRight: 8,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  thumbnailActive: {
    borderColor: '#6366f1',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  infoSection: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  typeBadge: {
    backgroundColor: '#6366f120',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  typeBadgeText: {
    color: '#6366f1',
    fontSize: 14,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 24,
  },
  dateSection: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  dateCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  dateInfo: {
    flex: 1,
  },
  dateLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  dateValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#4b5563',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 16,
    color: '#4b5563',
    flex: 1,
  },
  transportCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    gap: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  transportInfo: {
    flex: 1,
  },
  transportName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  transportDistance: {
    fontSize: 14,
    color: '#6b7280',
  },
  hostCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  hostAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  hostAvatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  hostName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  backButton: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
