import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, Platform, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import api from '../../src/services/api';
import WebHeader from '../../components/WebHeader';
import WebFooter from '../../components/WebFooter';

interface EventType {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
}

interface FormData {
  title: string;
  description: string;
  eventType: string;
  venue: string;
  customCountry: string;
  customState: string;
  customArea: string;
  startDate: string;
  endDate: string;
  nearestAirport: string;
  airportDistance: string;
  nearestRailway: string;
  railwayDistance: string;
  nearestBusStation: string;
  busStationDistance: string;
}

export default function CreateEvent() {
  const router = useRouter();
  const isWeb = Platform.OS === 'web';
  const [submitting, setSubmitting] = useState(false);
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [eventTypes, setEventTypes] = useState<EventType[]>([]);
  const [loadingTypes, setLoadingTypes] = useState(true);
  
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    eventType: '',
    venue: '',
    customCountry: '',
    customState: '',
    customArea: '',
    startDate: '',
    endDate: '',
    nearestAirport: '',
    airportDistance: '',
    nearestRailway: '',
    railwayDistance: '',
    nearestBusStation: '',
    busStationDistance: '',
  });

  useEffect(() => {
    fetchEventTypes();
  }, []);

  const fetchEventTypes = async () => {
    try {
      setLoadingTypes(true);
      const response = await api.get('/event-types?isActive=true');
      setEventTypes(response.data.data || []);
    } catch (error) {
      console.error('Error fetching event types:', error);
      Alert.alert('Error', 'Failed to load event types');
    } finally {
      setLoadingTypes(false);
    }
  };

  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.title || !formData.description || !formData.eventType || !formData.startDate || !formData.endDate) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    const startDate = new Date(formData.startDate);
    const endDate = new Date(formData.endDate);
    const now = new Date();

    if (startDate < now) {
      Alert.alert('Error', 'Start date must be in the future');
      return;
    }

    if (endDate < startDate) {
      Alert.alert('Error', 'End date must be after start date');
      return;
    }

    try {
      setSubmitting(true);
      
      const payload = {
        title: formData.title,
        description: formData.description,
        eventType: formData.eventType,
        venue: formData.venue || undefined,
        customCountry: formData.customCountry || undefined,
        customState: formData.customState || undefined,
        customArea: formData.customArea || undefined,
        startDate: formData.startDate,
        endDate: formData.endDate,
        nearestAirport: formData.nearestAirport || undefined,
        airportDistance: formData.airportDistance || undefined,
        nearestRailway: formData.nearestRailway || undefined,
        railwayDistance: formData.railwayDistance || undefined,
        nearestBusStation: formData.nearestBusStation || undefined,
        busStationDistance: formData.busStationDistance || undefined,
        images: [],
      };

      await api.post('/events', payload);
      
      Alert.alert('Success', 'Event created successfully', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error: any) {
      console.error('Error creating event:', error);
      Alert.alert('Error', error.response?.data?.error || 'Failed to create event');
    } finally {
      setSubmitting(false);
    }
  };

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
              <Text style={styles.title}>Create Event</Text>
              <Text style={styles.subtitle}>Add a new event to the platform</Text>
            </View>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {/* Basic Information */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Basic Information</Text>
              
              <View style={styles.formGroup}>
                <Text style={styles.label}>Event Title *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.title}
                  onChangeText={(text) => setFormData({ ...formData, title: text })}
                  placeholder="e.g. Diwali Festival 2024"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Event Type *</Text>
                <TouchableOpacity
                  style={styles.dropdown}
                  onPress={() => setShowTypeDropdown(!showTypeDropdown)}
                >
                  <Text style={formData.eventType ? styles.dropdownText : styles.dropdownPlaceholder}>
                    {formData.eventType || 'Select event type'}
                  </Text>
                  <Ionicons name="chevron-down" size={20} color="#6b7280" />
                </TouchableOpacity>
                {showTypeDropdown && (
                  <View style={styles.dropdownMenu}>
                    {loadingTypes ? (
                      <View style={styles.dropdownItem}>
                        <ActivityIndicator size="small" color="#6366f1" />
                      </View>
                    ) : eventTypes.length > 0 ? (
                      eventTypes.map((type) => (
                        <TouchableOpacity
                          key={type.id}
                          style={styles.dropdownItem}
                          onPress={() => {
                            setFormData({ ...formData, eventType: type.name });
                            setShowTypeDropdown(false);
                          }}
                        >
                          <Text style={styles.dropdownItemText}>{type.name}</Text>
                          {type.description && (
                            <Text style={styles.dropdownItemDesc}>{type.description}</Text>
                          )}
                        </TouchableOpacity>
                      ))
                    ) : (
                      <View style={styles.dropdownItem}>
                        <Text style={styles.dropdownItemText}>No event types available</Text>
                      </View>
                    )}
                  </View>
                )}
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Description *</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={formData.description}
                  onChangeText={(text) => setFormData({ ...formData, description: text })}
                  placeholder="Describe the event, activities, highlights, etc."
                  multiline
                  numberOfLines={6}
                />
              </View>
            </View>

            {/* Date & Time */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Date & Time</Text>
              
              <View style={styles.row}>
                <View style={[styles.formGroup, styles.halfWidth]}>
                  <Text style={styles.label}>Start Date *</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.startDate}
                    onChangeText={(text) => setFormData({ ...formData, startDate: text })}
                    placeholder={getTomorrowDate()}
                  />
                  <Text style={styles.hint}>Format: YYYY-MM-DD (must be future date)</Text>
                </View>

                <View style={[styles.formGroup, styles.halfWidth]}>
                  <Text style={styles.label}>End Date *</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.endDate}
                    onChangeText={(text) => setFormData({ ...formData, endDate: text })}
                    placeholder={getTomorrowDate()}
                  />
                  <Text style={styles.hint}>Format: YYYY-MM-DD (after start date)</Text>
                </View>
              </View>
            </View>

            {/* Location */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Location Details</Text>
              
              <View style={styles.formGroup}>
                <Text style={styles.label}>Venue</Text>
                <TextInput
                  style={styles.input}
                  value={formData.venue}
                  onChangeText={(text) => setFormData({ ...formData, venue: text })}
                  placeholder="e.g. City Stadium, Convention Center"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Country</Text>
                <TextInput
                  style={styles.input}
                  value={formData.customCountry}
                  onChangeText={(text) => setFormData({ ...formData, customCountry: text })}
                  placeholder="e.g. India"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>State/Province</Text>
                <TextInput
                  style={styles.input}
                  value={formData.customState}
                  onChangeText={(text) => setFormData({ ...formData, customState: text })}
                  placeholder="e.g. Maharashtra"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>City/Area</Text>
                <TextInput
                  style={styles.input}
                  value={formData.customArea}
                  onChangeText={(text) => setFormData({ ...formData, customArea: text })}
                  placeholder="e.g. Mumbai"
                />
              </View>
            </View>

            {/* Transportation */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>How to Reach</Text>
              
              <View style={styles.formGroup}>
                <Text style={styles.label}>Nearest Airport</Text>
                <TextInput
                  style={styles.input}
                  value={formData.nearestAirport}
                  onChangeText={(text) => setFormData({ ...formData, nearestAirport: text })}
                  placeholder="e.g. Chhatrapati Shivaji International Airport"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Airport Distance</Text>
                <TextInput
                  style={styles.input}
                  value={formData.airportDistance}
                  onChangeText={(text) => setFormData({ ...formData, airportDistance: text })}
                  placeholder="e.g. 15 km"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Nearest Railway Station</Text>
                <TextInput
                  style={styles.input}
                  value={formData.nearestRailway}
                  onChangeText={(text) => setFormData({ ...formData, nearestRailway: text })}
                  placeholder="e.g. Mumbai Central Railway Station"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Railway Distance</Text>
                <TextInput
                  style={styles.input}
                  value={formData.railwayDistance}
                  onChangeText={(text) => setFormData({ ...formData, railwayDistance: text })}
                  placeholder="e.g. 8 km"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Nearest Bus Station</Text>
                <TextInput
                  style={styles.input}
                  value={formData.nearestBusStation}
                  onChangeText={(text) => setFormData({ ...formData, nearestBusStation: text })}
                  placeholder="e.g. Central Bus Depot"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Bus Station Distance</Text>
                <TextInput
                  style={styles.input}
                  value={formData.busStationDistance}
                  onChangeText={(text) => setFormData({ ...formData, busStationDistance: text })}
                  placeholder="e.g. 3 km"
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
                    <Text style={styles.submitButtonText}>Create Event</Text>
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
    marginTop: 4,
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
  dropdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#ffffff',
  },
  dropdownText: {
    fontSize: 14,
    color: '#111827',
  },
  dropdownPlaceholder: {
    fontSize: 14,
    color: '#9ca3af',
  },
  dropdownMenu: {
    marginTop: 4,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    maxHeight: 200,
  },
  dropdownItem: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  dropdownItemText: {
    fontSize: 14,
    color: '#111827',
  },
  dropdownItemDesc: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
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
