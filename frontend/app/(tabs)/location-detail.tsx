import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Image, Platform, TouchableOpacity, Linking, ActivityIndicator, useWindowDimensions } from 'react-native';
import { Text } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { locationService } from '../../src/services/locationService';
import { Location } from '../../src/types';

export default function LocationDetailCompact() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [location, setLocation] = useState<Location | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === 'web';
  const isLargeScreen = width >= 1024;

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
        <ActivityIndicator size="large" color="#6366f1" />
        <Text style={styles.loadingText}>Loading location...</Text>
      </View>
    );
  }

  if (!location) {
    return (
      <View style={styles.loadingContainer}>
        <Ionicons name="location-outline" size={64} color="#d1d5db" />
        <Text style={styles.errorText}>Location not found</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={[styles.content, isWeb && styles.webContent]}>
          {/* Compact Header with Image */}
          <View style={styles.headerSection}>
            <View style={styles.imageGallery}>
              <Image 
                source={{ uri: location.images[selectedImage] }} 
                style={styles.headerImage}
                resizeMode="cover"
              />
              {location.images.length > 1 && (
                <View style={styles.thumbnailRow}>
                  {location.images.slice(0, 4).map((img, index) => (
                    <TouchableOpacity
                      key={index}
                      onPress={() => setSelectedImage(index)}
                      style={[styles.miniThumb, selectedImage === index && styles.miniThumbActive]}
                    >
                      <Image source={{ uri: img }} style={styles.miniThumbImage} />
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
            
            <View style={styles.headerInfo}>
              <Text style={styles.locationName}>{location.area}</Text>
              <View style={styles.locationMeta}>
                <Ionicons name="location" size={16} color="#6b7280" />
                <Text style={styles.locationMetaText}>{location.state}, {location.country}</Text>
              </View>
              <Text style={styles.descriptionCompact} numberOfLines={3}>{location.description}</Text>
              
              {location.latitude && location.longitude && (
                <View style={styles.quickActions}>
                  <TouchableOpacity style={styles.quickButton} onPress={openMap}>
                    <Ionicons name="map" size={18} color="#ffffff" />
                    <Text style={styles.quickButtonText}>Map</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.quickButton, styles.quickButtonSecondary]} onPress={openDirections}>
                    <Ionicons name="navigate" size={18} color="#6366f1" />
                    <Text style={[styles.quickButtonText, styles.quickButtonTextSecondary]}>Directions</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>

          {/* Two Column Layout for Web */}
          <View style={[styles.mainContent, isLargeScreen && styles.twoColumnLayout]}>
            {/* Left Column */}
            <View style={[styles.column, isLargeScreen && styles.leftColumn]}>
              {/* Transportation - Compact Cards */}
              {(location.nearestAirport || location.nearestRailway || location.nearestBusStation) && (
                <View style={styles.compactSection}>
                  <Text style={styles.sectionTitle}>🚗 Getting There</Text>
                  <View style={styles.transportCompact}>
                    {location.nearestAirport && (
                      <View style={styles.transportRow}>
                        <Ionicons name="airplane" size={20} color="#6366f1" />
                        <View style={styles.transportInfo}>
                          <Text style={styles.transportName}>{location.nearestAirport}</Text>
                          <Text style={styles.transportDist}>{location.airportDistance}</Text>
                        </View>
                      </View>
                    )}
                    {location.nearestRailway && (
                      <View style={styles.transportRow}>
                        <Ionicons name="train" size={20} color="#10b981" />
                        <View style={styles.transportInfo}>
                          <Text style={styles.transportName}>{location.nearestRailway}</Text>
                          <Text style={styles.transportDist}>{location.railwayDistance}</Text>
                        </View>
                      </View>
                    )}
                    {location.nearestBusStation && (
                      <View style={styles.transportRow}>
                        <Ionicons name="bus" size={20} color="#f59e0b" />
                        <View style={styles.transportInfo}>
                          <Text style={styles.transportName}>{location.nearestBusStation}</Text>
                          <Text style={styles.transportDist}>{location.busStationDistance}</Text>
                        </View>
                      </View>
                    )}
                  </View>
                </View>
              )}

              {/* How to Reach - Compact */}
              {location.howToReach && (
                <View style={styles.compactSection}>
                  <Text style={styles.sectionTitle}>📍 How to Reach</Text>
                  <Text style={styles.compactText}>{location.howToReach}</Text>
                </View>
              )}
            </View>

            {/* Right Column */}
            <View style={[styles.column, isLargeScreen && styles.rightColumn]}>
              {/* Attractions - Compact List */}
              {location.attractions && location.attractions.length > 0 && (
                <View style={styles.compactSection}>
                  <Text style={styles.sectionTitle}>⭐ Top Attractions</Text>
                  <View style={styles.attractionsCompact}>
                    {location.attractions.map((attraction, index) => (
                      <View key={index} style={styles.attractionRow}>
                        <Ionicons name="checkmark-circle" size={16} color="#10b981" />
                        <Text style={styles.attractionText}>{attraction}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {/* Kids Attractions - Compact */}
              {location.kidsAttractions && location.kidsAttractions.length > 0 && (
                <View style={styles.compactSection}>
                  <Text style={styles.sectionTitle}>👨‍👩‍👧‍👦 For Kids</Text>
                  <View style={styles.attractionsCompact}>
                    {location.kidsAttractions.map((attraction, index) => (
                      <View key={index} style={styles.attractionRow}>
                        <Ionicons name="heart" size={16} color="#ec4899" />
                        <Text style={styles.attractionText}>{attraction}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </View>
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
  scrollView: {
    flex: 1,
  },
  content: {
    paddingBottom: 20,
  },
  webContent: {
    maxWidth: 1400,
    marginHorizontal: 'auto',
    width: '100%',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6b7280',
  },
  errorText: {
    marginTop: 16,
    fontSize: 18,
    color: '#6b7280',
    marginBottom: 24,
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
  headerSection: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    padding: 20,
    gap: 20,
    flexWrap: 'wrap',
  },
  imageGallery: {
    flex: 1,
    minWidth: 300,
  },
  headerImage: {
    width: '100%',
    height: 300,
    borderRadius: 12,
  },
  thumbnailRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  miniThumb: {
    width: 60,
    height: 60,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  miniThumbActive: {
    borderColor: '#6366f1',
  },
  miniThumbImage: {
    width: '100%',
    height: '100%',
  },
  headerInfo: {
    flex: 1,
    minWidth: 300,
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
    marginBottom: 16,
  },
  locationMetaText: {
    fontSize: 16,
    color: '#6b7280',
  },
  descriptionCompact: {
    fontSize: 15,
    lineHeight: 22,
    color: '#374151',
    marginBottom: 16,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
  },
  quickButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#6366f1',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  quickButtonSecondary: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#6366f1',
  },
  quickButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  quickButtonTextSecondary: {
    color: '#6366f1',
  },
  mainContent: {
    padding: 20,
    gap: 20,
  },
  twoColumnLayout: {
    flexDirection: 'row',
    gap: 20,
  },
  column: {
    flex: 1,
    gap: 16,
  },
  leftColumn: {
    flex: 1,
  },
  rightColumn: {
    flex: 1,
  },
  compactSection: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  compactText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#374151',
  },
  transportCompact: {
    gap: 12,
  },
  transportRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  transportInfo: {
    flex: 1,
  },
  transportName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  transportDist: {
    fontSize: 13,
    color: '#6366f1',
  },
  attractionsCompact: {
    gap: 8,
  },
  attractionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  attractionText: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
});
