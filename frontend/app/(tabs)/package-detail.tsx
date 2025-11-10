import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Image, Platform, Alert, useWindowDimensions } from 'react-native';
import { Text, Button, Chip, ActivityIndicator, Portal, Dialog, TextInput } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { packageService } from '../../src/services/packageService';
import { Package } from '../../src/types';
import { useAuth } from '../../src/contexts/AuthContext';

export default function PackageDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === 'web';
  const isLargeScreen = width >= 768;
  const showWebLayout = isWeb && isLargeScreen;

  const [packageData, setPackageData] = useState<Package | null>(null);
  const [loading, setLoading] = useState(true);
  const [callbackModalVisible, setCallbackModalVisible] = useState(false);
  const [callbackForm, setCallbackForm] = useState({
    name: '',
    phone: '',
    email: '',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadPackageDetails();
  }, [id]);

  const loadPackageDetails = async () => {
    try {
      setLoading(true);
      const data = await packageService.getPackageById(id as string);
      setPackageData(data);
    } catch (error) {
      console.error('Error loading package:', error);
      Alert.alert('Error', 'Could not load package details');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestCallback = () => {
    setCallbackForm({
      name: user?.profile?.name || '',
      phone: user?.profile?.phone || '',
      email: user?.email || '',
      message: '',
    });
    setCallbackModalVisible(true);
  };

  const handleSubmitCallback = async () => {
    if (!packageData) return;
    if (!callbackForm.name.trim() || !callbackForm.phone.trim()) {
      Alert.alert('Error', 'Please provide your name and phone number');
      return;
    }

    try {
      setSubmitting(true);
      await packageService.createCallbackRequest(packageData.id, {
        name: callbackForm.name,
        phone: callbackForm.phone,
        email: callbackForm.email,
        message: callbackForm.message,
      });
      Alert.alert('Success!', `Your callback request for "${packageData.title}" has been submitted!`);
      setCallbackModalVisible(false);
      setCallbackForm({ name: '', phone: '', email: '', message: '' });
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error || 'Could not submit callback request');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#ffffff" />
        <Text style={styles.loadingText}>Loading package details...</Text>
      </LinearGradient>
    );
  }

  if (!packageData) {
    return (
      <View style={styles.centerContainer}>
        <Text>Package not found</Text>
        <Button onPress={() => router.back()}>Go Back</Button>
      </View>
    );
  }

  const getTravelType = () => {
    if (packageData.location) {
      return packageData.location.country === 'India' ? 'National' : 'International';
    }
    return packageData.customCountry === 'India' ? 'National' : 'International';
  };

  const getLocationDetails = () => {
    if (packageData.location) {
      return {
        area: packageData.location.area,
        state: packageData.location.state,
        country: packageData.location.country,
      };
    }
    return {
      area: packageData.customArea || '',
      state: packageData.customState || '',
      country: packageData.customCountry || '',
    };
  };

  const location = getLocationDetails();

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={showWebLayout && styles.webContent}>
        {/* Back Button */}
        <View style={styles.backButtonContainer}>
          <Button 
            icon="arrow-left" 
            onPress={() => {
              if (Platform.OS === 'web') {
                if (typeof window !== 'undefined' && window.location) {
                  window.location.href = '/(tabs)/packages';
                }
              } else {
                router.push('/(tabs)/packages');
              }
            }} 
            mode="text"
          >
            Back to Packages
          </Button>
        </View>

        {/* Hero Image */}
        {packageData.images && packageData.images.length > 0 && (
          <View style={styles.heroImageContainer}>
            <Image source={{ uri: packageData.images[0] }} style={styles.heroImage} resizeMode="cover" />
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.8)']}
              style={styles.heroGradient}
            >
              <Text variant="headlineLarge" style={styles.heroTitle}>
                {packageData.title}
              </Text>
              <View style={styles.heroMeta}>
                <Chip icon="calendar" style={styles.heroChip} textStyle={styles.heroChipText}>
                  {packageData.duration} Days
                </Chip>
                <Chip icon="cash" style={styles.heroChip} textStyle={styles.heroChipText}>
                  ₹{packageData.price.toLocaleString()}
                </Chip>
                <Chip 
                  icon={getTravelType() === 'National' ? 'flag' : 'airplane'} 
                  style={styles.heroChip} 
                  textStyle={styles.heroChipText}
                >
                  {getTravelType()}
                </Chip>
              </View>
            </LinearGradient>
          </View>
        )}

        <View style={[styles.content, showWebLayout && styles.webContentInner]}>
          {/* Status Badge */}
          <View style={styles.statusContainer}>
            <Chip
              icon={packageData.approvalStatus === 'APPROVED' ? 'check-circle' : 'clock'}
              style={[
                styles.statusChip,
                packageData.approvalStatus === 'APPROVED' ? styles.approvedChip : styles.pendingChip
              ]}
            >
              {packageData.approvalStatus}
            </Chip>
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text variant="headlineSmall" style={styles.sectionTitle}>
              About This Package
            </Text>
            <Text variant="bodyLarge" style={styles.description}>
              {packageData.description}
            </Text>
          </View>

          {/* Location Details */}
          <View style={styles.section}>
            <Text variant="headlineSmall" style={styles.sectionTitle}>
              📍 Location Details
            </Text>
            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Area:</Text>
                <Text style={styles.infoValue}>{location.area}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>State:</Text>
                <Text style={styles.infoValue}>{location.state}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Country:</Text>
                <Text style={styles.infoValue}>{location.country}</Text>
              </View>
            </View>
          </View>

          {/* Transportation Details */}
          {packageData.location && (
            <View style={styles.section}>
              <Text variant="headlineSmall" style={styles.sectionTitle}>
                🚗 How to Reach
              </Text>
              <View style={styles.infoCard}>
                {packageData.location.nearestAirport && (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>✈️ Airport:</Text>
                    <Text style={styles.infoValue}>
                      {packageData.location.nearestAirport}
                      {packageData.location.airportDistance && ` (${packageData.location.airportDistance})`}
                    </Text>
                  </View>
                )}
                {packageData.location.nearestRailway && (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>🚂 Railway:</Text>
                    <Text style={styles.infoValue}>
                      {packageData.location.nearestRailway}
                      {packageData.location.railwayDistance && ` (${packageData.location.railwayDistance})`}
                    </Text>
                  </View>
                )}
                {packageData.location.nearestBusStation && (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>🚌 Bus Station:</Text>
                    <Text style={styles.infoValue}>
                      {packageData.location.nearestBusStation}
                      {packageData.location.busStationDistance && ` (${packageData.location.busStationDistance})`}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          )}

          {/* Itinerary - REQUIRED */}
          <View style={styles.section}>
            <Text variant="headlineSmall" style={styles.sectionTitle}>
              📅 Detailed Itinerary
            </Text>
            {packageData.itinerary && packageData.itinerary.length > 0 ? (
              packageData.itinerary.map((day) => (
                <View key={day.day} style={styles.itineraryCard}>
                  <View style={styles.dayHeader}>
                    <View style={styles.dayBadge}>
                      <Text style={styles.dayBadgeText}>Day {day.day}</Text>
                    </View>
                    <Text variant="titleMedium" style={styles.dayTitle}>
                      {day.title}
                    </Text>
                  </View>
                  <Text variant="bodyMedium" style={styles.dayDescription}>
                    {day.description}
                  </Text>
                  {day.activities && day.activities.length > 0 && (
                    <View style={styles.activitiesContainer}>
                      <Text variant="labelMedium" style={styles.activitiesLabel}>
                        🚗 Transportation & Activities:
                      </Text>
                      {day.activities.map((activity, index) => (
                        <Text key={index} style={styles.activityItem}>
                          • {activity}
                        </Text>
                      ))}
                    </View>
                  )}
                </View>
              ))
            ) : (
              <View style={styles.noItineraryCard}>
                <Text style={styles.noItineraryText}>
                  ⚠️ This package does not have a detailed itinerary yet.
                </Text>
                <Text style={styles.noItinerarySubtext}>
                  Contact the provider for more information.
                </Text>
              </View>
            )}
          </View>

          {/* Price and Action */}
          <View style={styles.actionSection}>
            <View style={styles.priceContainer}>
              <Text variant="labelLarge" style={styles.priceLabel}>
                Package Price
              </Text>
              <Text variant="headlineMedium" style={styles.priceValue}>
                ₹{packageData.price.toLocaleString()}
              </Text>
              <Text variant="bodySmall" style={styles.priceNote}>
                for {packageData.duration} days
              </Text>
            </View>
            {packageData.approvalStatus === 'APPROVED' && (
              <Button
                mode="contained"
                icon="phone"
                onPress={handleRequestCallback}
                style={styles.actionButton}
                contentStyle={styles.actionButtonContent}
              >
                Request Callback
              </Button>
            )}
          </View>

          {/* Image Gallery */}
          {packageData.images && packageData.images.length > 1 && (
            <View style={styles.section}>
              <Text variant="headlineSmall" style={styles.sectionTitle}>
                📸 Photo Gallery
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.gallery}>
                {packageData.images.slice(1).map((image, index) => (
                  <Image
                    key={index}
                    source={{ uri: image }}
                    style={styles.galleryImage}
                    resizeMode="cover"
                  />
                ))}
              </ScrollView>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Callback Request Modal */}
      <Portal>
        <Dialog 
          visible={callbackModalVisible} 
          onDismiss={() => setCallbackModalVisible(false)}
          style={styles.dialog}
        >
          <Dialog.Title style={styles.dialogTitle}>Request Callback</Dialog.Title>
          <Dialog.Content>
            <ScrollView>
              {packageData && (
                <View style={styles.packageInfo}>
                  <Text variant="titleMedium" style={styles.packageInfoTitle}>
                    {packageData.title}
                  </Text>
                  <Text variant="bodySmall" style={styles.packageInfoDetails}>
                    💰 ₹{packageData.price.toLocaleString()} • 📅 {packageData.duration} Days
                  </Text>
                </View>
              )}
              
              <TextInput
                label="Your Name *"
                value={callbackForm.name}
                onChangeText={(text) => setCallbackForm({ ...callbackForm, name: text })}
                mode="outlined"
                style={styles.input}
                disabled={submitting}
              />
              
              <TextInput
                label="Phone Number *"
                value={callbackForm.phone}
                onChangeText={(text) => setCallbackForm({ ...callbackForm, phone: text })}
                mode="outlined"
                keyboardType="phone-pad"
                style={styles.input}
                disabled={submitting}
              />
              
              <TextInput
                label="Email (Optional)"
                value={callbackForm.email}
                onChangeText={(text) => setCallbackForm({ ...callbackForm, email: text })}
                mode="outlined"
                keyboardType="email-address"
                style={styles.input}
                disabled={submitting}
              />
              
              <TextInput
                label="Message (Optional)"
                value={callbackForm.message}
                onChangeText={(text) => setCallbackForm({ ...callbackForm, message: text })}
                mode="outlined"
                multiline
                numberOfLines={3}
                style={styles.input}
                disabled={submitting}
              />
              
              <Text variant="bodySmall" style={styles.helperText}>
                The package provider will contact you at the provided phone number.
              </Text>
            </ScrollView>
          </Dialog.Content>
          <Dialog.Actions>
            <Button 
              onPress={() => setCallbackModalVisible(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button 
              onPress={handleSubmitCallback}
              mode="contained"
              loading={submitting}
              disabled={submitting}
            >
              Submit Request
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
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
  },
  loadingText: {
    marginTop: 16,
    color: '#ffffff',
    fontSize: 16,
  },
  scrollView: {
    flex: 1,
  },
  webContent: {
    maxWidth: 1200,
    marginHorizontal: 'auto',
    width: '100%',
  },
  webContentInner: {
    maxWidth: 1200,
    marginHorizontal: 'auto',
    width: '100%',
  },
  backButtonContainer: {
    padding: 16,
    backgroundColor: '#fff',
  },
  heroImageContainer: {
    height: 400,
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
    marginBottom: 12,
  },
  heroMeta: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  heroChip: {
    backgroundColor: 'rgba(255,255,255,0.9)',
  },
  heroChipText: {
    color: '#333',
    fontWeight: '600',
  },
  content: {
    padding: 20,
  },
  statusContainer: {
    alignItems: 'flex-start',
    marginBottom: 20,
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
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    color: '#333',
    fontWeight: 'bold',
    marginBottom: 16,
  },
  description: {
    color: '#666',
    lineHeight: 26,
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoLabel: {
    fontSize: 15,
    color: '#666',
    fontWeight: '600',
  },
  infoValue: {
    fontSize: 15,
    color: '#333',
    flex: 1,
    textAlign: 'right',
  },
  itineraryCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  dayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  dayBadge: {
    backgroundColor: '#667eea',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 12,
  },
  dayBadgeText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  dayTitle: {
    color: '#333',
    fontWeight: 'bold',
    flex: 1,
  },
  dayDescription: {
    color: '#666',
    lineHeight: 22,
    marginBottom: 12,
  },
  activitiesContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
  },
  activitiesLabel: {
    color: '#667eea',
    fontWeight: '600',
    marginBottom: 8,
  },
  activityItem: {
    color: '#666',
    fontSize: 14,
    marginBottom: 4,
  },
  noItineraryCard: {
    backgroundColor: '#fff3cd',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ffc107',
  },
  noItineraryText: {
    color: '#856404',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  noItinerarySubtext: {
    color: '#856404',
    fontSize: 14,
    textAlign: 'center',
  },
  gallery: {
    marginTop: 8,
  },
  galleryImage: {
    width: 200,
    height: 150,
    borderRadius: 12,
    marginRight: 12,
  },
  actionSection: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    marginTop: 16,
  },
  priceContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  priceLabel: {
    color: '#666',
    marginBottom: 8,
  },
  priceValue: {
    color: '#667eea',
    fontWeight: 'bold',
  },
  priceNote: {
    color: '#999',
    marginTop: 4,
  },
  actionButton: {
    backgroundColor: '#667eea',
  },
  actionButtonContent: {
    paddingVertical: 8,
  },
  dialog: {
    maxWidth: 500,
    alignSelf: 'center',
    width: '90%',
  },
  dialogTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  packageInfo: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  packageInfoTitle: {
    color: '#333',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  packageInfoDetails: {
    color: '#666',
  },
  input: {
    marginBottom: 12,
  },
  helperText: {
    color: '#666',
    marginTop: 8,
    fontStyle: 'italic',
  },
});
