import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Image, Platform, TouchableOpacity, Linking } from 'react-native';
import { Text } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { locationService } from '../../src/services/locationService';
import { Location } from '../../src/types';
import WebHeader from '../../components/WebHeader';
import WebFooter from '../../components/WebFooter';

export default function LocationDetailEnhanced() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [location, setLocation] = useState<Location | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const isWeb = Platform.OS === 'web';

  useEffect(() => {
    loadLocationDetail();
  }, [id]);

  const loadLocationDetail = async () => {
    try {
      setLoading(true);
      const data = await locationService.getLocationById(id as string);
      setLocation(data);
    } catch (error) {
      console.error('Error loading location:', error);
    } finally {
      setLoading(false);
    }
  };

  const openMap = () => {
    if (location?.latitude && location?.longitude) {
      const url = Platform.select({
        ios: `maps:0,0?q=${location.latitude},${location.longitude}`,
        android: `geo:0,0?q=${location.latitude},${location.longitude}`,
        default: `https://www.google.com/maps/search/?api=1&query=${location.latitude},${location.longitude}`
      });
      Linking.openURL(url);
    }
  };

  const openDirections = () => {
    if (location?.latitude && location?.longitude) {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${location.latitude},${location.longitude}`;
      Linking.openURL(url);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  if (!location) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Location not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {isWeb && <WebHeader />}
      <ScrollView style={styles.scrollView}>
        <View style={[styles.content, isWeb && styles.webContent]}>
          {/* Image Gallery */}
          <View style={styles.imageSection}>
            <Image 
              source={{ uri: location.images[selectedImage] }} 
              style={styles.mainImage}
              resizeMode="cover"
            />
            {location.images.length > 1 && (
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                style={styles.thumbnailScroll}
              >
                {location.images.map((img, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => setSelectedImage(index)}
                    style={[
                      styles.thumbnail,
                      selectedImage === index && styles.thumbnailActive
                    ]}
                  >
                    <Image source={{ uri: img }} style={styles.thumbnailImage} />
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>

          {/* Header Info */}
          <View style={styles.headerSection}>
            <Text style={styles.locationName}>{location.area}</Text>
            <View style={styles.locationMeta}>
              <Ionicons name="location" size={16} color="#6b7280" />
              <Text style={styles.locationMetaText}>
                {location.state}, {location.country}
              </Text>
            </View>
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About</Text>
            <Text style={styles.description}>{location.description}</Text>
          </View>

          {/* Map Section */}
          {location.latitude && location.longitude && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Location on Map</Text>
              <View style={styles.mapPlaceholder}>
                <Ionicons name="map" size={48} color="#6366f1" />
                <Text style={styles.mapText}>
                  {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
                </Text>
                <View style={styles.mapButtons}>
                  <TouchableOpacity style={styles.mapButton} onPress={openMap}>
                    <Ionicons name="navigate" size={20} color="#ffffff" />
                    <Text style={styles.mapButtonText}>Open in Maps</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.mapButton, styles.mapButtonSecondary]} onPress={openDirections}>
                    <Ionicons name="compass" size={20} color="#6366f1" />
                    <Text style={[styles.mapButtonText, styles.mapButtonTextSecondary]}>Get Directions</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}

          {/* How to Reach */}
          {location.howToReach && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="car" size={24} color="#6366f1" />
                <Text style={styles.sectionTitle}>How to Reach</Text>
              </View>
              <Text style={styles.description}>{location.howToReach}</Text>
            </View>
          )}

          {/* Transportation */}
          {(location.nearestAirport || location.nearestRailway || location.nearestBusStation) && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="airplane" size={24} color="#6366f1" />
                <Text style={styles.sectionTitle}>Transportation</Text>
              </View>
              
              <View style={styles.transportGrid}>
                {location.nearestAirport && (
                  <View style={styles.transportCard}>
                    <View style={styles.transportIcon}>
                      <Ionicons name="airplane" size={24} color="#6366f1" />
                    </View>
                    <Text style={styles.transportLabel}>Nearest Airport</Text>
                    <Text style={styles.transportName}>{location.nearestAirport}</Text>
                    {location.airportDistance && (
                      <Text style={styles.transportDistance}>{location.airportDistance}</Text>
                    )}
                  </View>
                )}

                {location.nearestRailway && (
                  <View style={styles.transportCard}>
                    <View style={styles.transportIcon}>
                      <Ionicons name="train" size={24} color="#10b981" />
                    </View>
                    <Text style={styles.transportLabel}>Nearest Railway</Text>
                    <Text style={styles.transportName}>{location.nearestRailway}</Text>
                    {location.railwayDistance && (
                      <Text style={styles.transportDistance}>{location.railwayDistance}</Text>
                    )}
                  </View>
                )}

                {location.nearestBusStation && (
                  <View style={styles.transportCard}>
                    <View style={styles.transportIcon}>
                      <Ionicons name="bus" size={24} color="#f59e0b" />
                    </View>
                    <Text style={styles.transportLabel}>Nearest Bus Station</Text>
                    <Text style={styles.transportName}>{location.nearestBusStation}</Text>
                    {location.busStationDistance && (
                      <Text style={styles.transportDistance}>{location.busStationDistance}</Text>
                    )}
                  </View>
                )}
              </View>
            </View>
          )}

          {/* Attractions */}
          {location.attractions && location.attractions.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="star" size={24} color="#f59e0b" />
                <Text style={styles.sectionTitle}>Attractions to Visit</Text>
              </View>
              <View style={styles.attractionsList}>
                {location.attractions.map((attraction, index) => (
                  <View key={index} style={styles.attractionItem}>
                    <Ionicons name="checkmark-circle" size={20} color="#10b981" />
                    <Text style={styles.attractionText}>{attraction}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Kids Attractions */}
          {location.kidsAttractions && location.kidsAttractions.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="happy" size={24} color="#ec4899" />
                <Text style={styles.sectionTitle}>Kids Attractions</Text>
              </View>
              <View style={styles.attractionsList}>
                {location.kidsAttractions.map((attraction, index) => (
                  <View key={index} style={styles.attractionItem}>
                    <Ionicons name="heart" size={20} color="#ec4899" />
                    <Text style={styles.attractionText}>{attraction}</Text>
                  </View>
                ))}
              </View>
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
  scrollView: {
    flex: 1,
  },
  content: {
    paddingBottom: 40,
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
  imageSection: {
    backgroundColor: '#000',
  },
  mainImage: {
    width: '100%',
    height: 400,
  },
  thumbnailScroll: {
    padding: 12,
    backgroundColor: '#000',
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
  headerSection: {
    padding: 20,
    backgroundColor: '#ffffff',
  },
  locationName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  locationMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  locationMetaText: {
    fontSize: 16,
    color: '#6b7280',
  },
  section: {
    padding: 20,
    backgroundColor: '#ffffff',
    marginTop: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
  },
  description: {
    fontSize: 15,
    lineHeight: 24,
    color: '#374151',
  },
  mapPlaceholder: {
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    padding: 40,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderStyle: 'dashed',
  },
  mapText: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 12,
    marginBottom: 20,
  },
  mapButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  mapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#6366f1',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  mapButtonSecondary: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#6366f1',
  },
  mapButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  mapButtonTextSecondary: {
    color: '#6366f1',
  },
  transportGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  transportCard: {
    flex: 1,
    minWidth: 200,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  transportIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  transportLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  transportName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  transportDistance: {
    fontSize: 14,
    color: '#6366f1',
    fontWeight: '500',
  },
  attractionsList: {
    gap: 12,
  },
  attractionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingVertical: 8,
  },
  attractionText: {
    flex: 1,
    fontSize: 15,
    color: '#374151',
    lineHeight: 22,
  },
});
