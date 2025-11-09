import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, Platform, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import api from '../../src/services/api';
import WebHeader from '../../components/WebHeader';
import WebFooter from '../../components/WebFooter';

interface LocationData {
  country: string;
  state: string;
  area: string;
  description: string;
  images: string[];
  latitude?: string;
  longitude?: string;
  howToReach?: string;
  nearestAirport?: string;
  airportDistance?: string;
  nearestRailway?: string;
  railwayDistance?: string;
  nearestBusStation?: string;
  busStationDistance?: string;
  attractions?: string;
  kidsAttractions?: string;
}

export default function EditLocation() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const isWeb = Platform.OS === 'web';

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<LocationData>({
    country: '',
    state: '',
    area: '',
    description: '',
    images: [],
    latitude: '',
    longitude: '',
    howToReach: '',
    nearestAirport: '',
    airportDistance: '',
    nearestRailway: '',
    railwayDistance: '',
    nearestBusStation: '',
    busStationDistance: '',
    attractions: '',
    kidsAttractions: '',
  });

  useEffect(() => {
    if (id) {
      fetchLocation();
    }
  }, [id]);

  const fetchLocation = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/locations/${id}`);
      const location = response.data.data;
      
      setFormData({
        country: location.country || '',
        state: location.state || '',
        area: location.area || '',
        description: location.description || '',
        images: location.images || [],
        latitude: location.latitude?.toString() || '',
        longitude: location.longitude?.toString() || '',
        howToReach: location.howToReach || '',
        nearestAirport: location.nearestAirport || '',
        airportDistance: location.airportDistance || '',
        nearestRailway: location.nearestRailway || '',
        railwayDistance: location.railwayDistance || '',
        nearestBusStation: location.nearestBusStation || '',
        busStationDistance: location.busStationDistance || '',
        attractions: location.attractions?.join('\n') || '',
        kidsAttractions: location.kidsAttractions?.join('\n') || '',
      });
    } catch (error) {
      console.error('Error fetching location:', error);
      Alert.alert('Error', 'Failed to load location details');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.country || !formData.state || !formData.area || !formData.description) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      setSubmitting(true);
      
      const payload = {
        country: formData.country,
        state: formData.state,
        area: formData.area,
        description: formData.description,
        images: formData.images,
        latitude: formData.latitude ? parseFloat(formData.latitude) : undefined,
        longitude: formData.longitude ? parseFloat(formData.longitude) : undefined,
        howToReach: formData.howToReach,
        nearestAirport: formData.nearestAirport,
        airportDistance: formData.airportDistance,
        nearestRailway: formData.nearestRailway,
        railwayDistance: formData.railwayDistance,
        nearestBusStation: formData.nearestBusStation,
        busStationDistance: formData.busStationDistance,
        attractions: formData.attractions ? formData.attractions.split('\n').filter(a => a.trim()) : [],
        kidsAttractions: formData.kidsAttractions ? formData.kidsAttractions.split('\n').filter(a => a.trim()) : [],
      };

      await api.put(`/locations/${id}`, payload);
      
      Alert.alert('Success', 'Location updated successfully', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error: any) {
      console.error('Error updating location:', error);
      Alert.alert('Error', error.response?.data?.error || 'Failed to update location');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {isWeb && <WebHeader />}
      <ScrollView style={styles.scrollContainer}>
        <View style={[styles.content, isWeb && styles.webContent]}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="#111827" />
            </TouchableOpacity>
            <View style={styles.headerText}>
              <Text style={styles.title}>Edit Location</Text>
              <Text style={styles.subtitle}>Update location information</Text>
            </View>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {/* Basic Information */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Basic Information</Text>
              
              <View style={styles.formGroup}>
                <Text style={styles.label}>Country *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.country}
                  onChangeText={(text) => setFormData({ ...formData, country: text })}
                  placeholder="e.g. India"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>State/Province *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.state}
                  onChangeText={(text) => setFormData({ ...formData, state: text })}
                  placeholder="e.g. Kerala"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Area/City *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.area}
                  onChangeText={(text) => setFormData({ ...formData, area: text })}
                  placeholder="e.g. Munnar"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Description *</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={formData.description}
                  onChangeText={(text) => setFormData({ ...formData, description: text })}
                  placeholder="Describe the location, attractions, best time to visit, etc."
                  multiline
                  numberOfLines={6}
                />
              </View>
            </View>

            {/* GPS Coordinates */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>GPS Coordinates (Optional)</Text>
              
              <View style={styles.row}>
                <View style={[styles.formGroup, styles.halfWidth]}>
                  <Text style={styles.label}>Latitude</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.latitude}
                    onChangeText={(text) => setFormData({ ...formData, latitude: text })}
                    placeholder="e.g. 10.0889"
                    keyboardType="numeric"
                  />
                </View>

                <View style={[styles.formGroup, styles.halfWidth]}>
                  <Text style={styles.label}>Longitude</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.longitude}
                    onChangeText={(text) => setFormData({ ...formData, longitude: text })}
                    placeholder="e.g. 77.0595"
                    keyboardType="numeric"
                  />
                </View>
              </View>
            </View>

            {/* How to Reach */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>How to Reach</Text>
              
              <View style={styles.formGroup}>
                <Text style={styles.label}>Directions</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={formData.howToReach}
                  onChangeText={(text) => setFormData({ ...formData, howToReach: text })}
                  placeholder="Provide detailed directions on how to reach this location..."
                  multiline
                  numberOfLines={4}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Nearest Airport</Text>
                <TextInput
                  style={styles.input}
                  value={formData.nearestAirport}
                  onChangeText={(text) => setFormData({ ...formData, nearestAirport: text })}
                  placeholder="e.g. Cochin International Airport"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Airport Distance</Text>
                <TextInput
                  style={styles.input}
                  value={formData.airportDistance}
                  onChangeText={(text) => setFormData({ ...formData, airportDistance: text })}
                  placeholder="e.g. 110 km"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Nearest Railway Station</Text>
                <TextInput
                  style={styles.input}
                  value={formData.nearestRailway}
                  onChangeText={(text) => setFormData({ ...formData, nearestRailway: text })}
                  placeholder="e.g. Aluva Railway Station"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Railway Distance</Text>
                <TextInput
                  style={styles.input}
                  value={formData.railwayDistance}
                  onChangeText={(text) => setFormData({ ...formData, railwayDistance: text })}
                  placeholder="e.g. 108 km"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Nearest Bus Station</Text>
                <TextInput
                  style={styles.input}
                  value={formData.nearestBusStation}
                  onChangeText={(text) => setFormData({ ...formData, nearestBusStation: text })}
                  placeholder="e.g. Munnar Bus Stand"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Bus Station Distance</Text>
                <TextInput
                  style={styles.input}
                  value={formData.busStationDistance}
                  onChangeText={(text) => setFormData({ ...formData, busStationDistance: text })}
                  placeholder="e.g. 2 km"
                />
              </View>
            </View>

            {/* Attractions */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Attractions</Text>
              
              <View style={styles.formGroup}>
                <Text style={styles.label}>Main Attractions</Text>
                <Text style={styles.hint}>Enter one attraction per line</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={formData.attractions}
                  onChangeText={(text) => setFormData({ ...formData, attractions: text })}
                  placeholder="Tea Gardens&#10;Eravikulam National Park&#10;Mattupetty Dam"
                  multiline
                  numberOfLines={6}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Kid-Friendly Attractions</Text>
                <Text style={styles.hint}>Enter one attraction per line</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={formData.kidsAttractions}
                  onChangeText={(text) => setFormData({ ...formData, kidsAttractions: text })}
                  placeholder="Echo Point&#10;Kundala Lake&#10;Rose Garden"
                  multiline
                  numberOfLines={6}
                />
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => router.back()}
                disabled={submitting}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
                onPress={handleSubmit}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <>
                    <Ionicons name="checkmark-circle" size={20} color="#ffffff" />
                    <Text style={styles.submitButtonText}>Update Location</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
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
  },
  webContent: {
    maxWidth: 900,
    marginHorizontal: 'auto',
    width: '100%',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    gap: 16,
  },
  backButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  form: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 24,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 6,
  },
  hint: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#111827',
    backgroundColor: '#ffffff',
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    gap: 16,
  },
  halfWidth: {
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 24,
  },
  cancelButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: '#ffffff',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#6366f1',
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
});
