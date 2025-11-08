import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Image, Platform, useWindowDimensions, TouchableOpacity } from 'react-native';
import { Text, Card, Chip, ActivityIndicator, Button, Divider } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { locationService } from '../../src/services/locationService';
import { Location } from '../../src/types';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import WebFooter from '../../components/WebFooter';

export default function LocationDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [location, setLocation] = useState<Location | null>(null);
  const [loading, setLoading] = useState(true);
  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === 'web';
  const isLargeScreen = width >= 768;
  const showWebLayout = isWeb && isLargeScreen;

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

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#667eea" />
      </View>
    );
  }

  if (!location) {
    return (
      <View style={styles.centerContainer}>
        <Text>Location not found</Text>
        <Button mode="contained" onPress={() => router.back()} style={{ marginTop: 16 }}>
          Go Back
        </Button>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
        <View style={[styles.content, showWebLayout && styles.webContent]}>
          {/* Back Button */}
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#333" />
            <Text style={styles.backText}>Back to Locations</Text>
          </TouchableOpacity>

        {/* Hero Image */}
        {location.images && location.images.length > 0 ? (
          <View style={styles.heroContainer}>
            <Image 
              source={{ uri: location.images[0] }} 
              style={styles.heroImage}
              resizeMode="cover"
            />
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.7)']}
              style={styles.heroGradient}
            >
              <Text variant="displaySmall" style={styles.heroTitle}>
                {location.area}
              </Text>
              <View style={styles.heroLocation}>
                <MaterialCommunityIcons name="map-marker" size={20} color="#fff" />
                <Text style={styles.heroLocationText}>
                  {location.state}, {location.country}
                </Text>
              </View>
            </LinearGradient>
          </View>
        ) : (
          <View style={styles.heroPlaceholder}>
            <Text style={styles.heroPlaceholderIcon}>🌍</Text>
            <Text variant="displaySmall" style={styles.heroPlaceholderTitle}>
              {location.area}
            </Text>
          </View>
        )}

        {/* Status Badge */}
        <View style={styles.statusContainer}>
          <Chip 
            icon={location.approvalStatus === 'APPROVED' ? 'check-circle' : 'clock'} 
            style={[
              styles.statusChip,
              location.approvalStatus === 'APPROVED' ? styles.approvedChip : styles.pendingChip
            ]}
          >
            {location.approvalStatus}
          </Chip>
        </View>

        {/* Description Card */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="headlineSmall" style={styles.sectionTitle}>
              About this Location
            </Text>
            <Text variant="bodyLarge" style={styles.description}>
              {location.description}
            </Text>
          </Card.Content>
        </Card>

        {/* Location Details */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="headlineSmall" style={styles.sectionTitle}>
              Location Details
            </Text>
            <View style={styles.detailRow}>
              <MaterialCommunityIcons name="map-marker" size={24} color="#667eea" />
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Area</Text>
                <Text style={styles.detailValue}>{location.area}</Text>
              </View>
            </View>
            <Divider style={styles.divider} />
            <View style={styles.detailRow}>
              <MaterialCommunityIcons name="city" size={24} color="#667eea" />
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>State</Text>
                <Text style={styles.detailValue}>{location.state}</Text>
              </View>
            </View>
            <Divider style={styles.divider} />
            <View style={styles.detailRow}>
              <MaterialCommunityIcons name="earth" size={24} color="#667eea" />
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Country</Text>
                <Text style={styles.detailValue}>{location.country}</Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Image Gallery */}
        {location.images && location.images.length > 1 && (
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="headlineSmall" style={styles.sectionTitle}>
                Photo Gallery
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.gallery}>
                {location.images.map((image, index) => (
                  <Image 
                    key={index}
                    source={{ uri: image }} 
                    style={styles.galleryImage}
                    resizeMode="cover"
                  />
                ))}
              </ScrollView>
            </Card.Content>
          </Card>
        )}

        {/* Action Buttons */}
        <View style={[styles.actionButtons, !isLargeScreen && styles.actionButtonsMobile]}>
          <Button 
            mode="contained" 
            icon="share-variant"
            style={styles.actionButton}
            buttonColor="#667eea"
          >
            Share Location
          </Button>
          <Button 
            mode="outlined" 
            icon="heart-outline"
            style={styles.actionButton}
            textColor="#667eea"
          >
            Save to Favorites
          </Button>
        </View>

        {showWebLayout && <WebFooter />}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  content: {
    flex: 1,
    paddingBottom: 20,
    width: '100%',
  },
  webContent: {
    maxWidth: 1200,
    marginHorizontal: 'auto',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 8,
  },
  backText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  heroContainer: {
    height: Platform.select({ web: 400, default: 300 }),
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
    justifyContent: 'flex-end',
  },
  heroTitle: {
    color: '#ffffff',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  heroLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  heroLocationText: {
    color: '#ffffff',
    fontSize: 18,
  },
  heroPlaceholder: {
    height: Platform.select({ web: 400, default: 300 }),
    backgroundColor: '#e9ecef',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroPlaceholderIcon: {
    fontSize: 80,
    marginBottom: 16,
  },
  heroPlaceholderTitle: {
    color: '#495057',
    fontWeight: 'bold',
  },
  statusContainer: {
    padding: 16,
    alignItems: 'flex-start',
  },
  statusChip: {
    height: 32,
  },
  approvedChip: {
    backgroundColor: '#d4edda',
  },
  pendingChip: {
    backgroundColor: '#fff3cd',
  },
  card: {
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    backgroundColor: '#ffffff',
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  description: {
    color: '#6c757d',
    lineHeight: 28,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingVertical: 12,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: '#6c757d',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
  },
  divider: {
    backgroundColor: '#e9ecef',
  },
  gallery: {
    marginTop: 8,
  },
  galleryImage: {
    width: 200,
    height: 150,
    borderRadius: 8,
    marginRight: 12,
  },
  actionButtons: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  actionButtonsMobile: {
    flexDirection: 'column',
  },
  actionButton: {
    flex: 1,
  },
});
