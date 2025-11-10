import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, Platform, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import api from '../../src/services/api';
import WebHeader from '../../components/WebHeader';
import ImageUploadField, { SelectedImage } from '../../components/ImageUploadField';

interface ItineraryDay {
  day: number;
  title: string;
  description: string;
  activities: string;
}

interface FormData {
  title: string;
  description: string;
  duration: string;
  price: string;
  customCountry: string;
  customState: string;
  customArea: string;
}

export default function CreatePackage() {
  const router = useRouter();
  const isWeb = Platform.OS === 'web';
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    duration: '',
    price: '',
    customCountry: '',
    customState: '',
    customArea: '',
  });

  const [selectedImages, setSelectedImages] = useState<SelectedImage[]>([]);

  const [itinerary, setItinerary] = useState<ItineraryDay[]>([
    { day: 1, title: '', description: '', activities: '' }
  ]);

  const addItineraryDay = () => {
    setItinerary([...itinerary, { 
      day: itinerary.length + 1, 
      title: '', 
      description: '', 
      activities: '' 
    }]);
  };

  const removeItineraryDay = (index: number) => {
    if (itinerary.length > 1) {
      const newItinerary = itinerary.filter((_, i) => i !== index);
      // Renumber days
      const renumbered = newItinerary.map((day, i) => ({ ...day, day: i + 1 }));
      setItinerary(renumbered);
    }
  };

  const updateItineraryDay = (index: number, field: keyof ItineraryDay, value: string) => {
    const newItinerary = [...itinerary];
    if (field === 'day') {
      newItinerary[index][field] = parseInt(value) || 1;
    } else {
      newItinerary[index][field] = value;
    }
    setItinerary(newItinerary);
  };

  const uploadImages = async (): Promise<string[]> => {
    if (selectedImages.length === 0) {
      return [];
    }

    try {
      setUploadingImages(true);

      const formData = new FormData();
      
      // Add each image to FormData
      for (const image of selectedImages) {
        // For web, we need to fetch the blob
        if (Platform.OS === 'web') {
          const response = await fetch(image.uri);
          const blob = await response.blob();
          (formData as any).append('images', blob, image.fileName);
        } else {
          // For mobile, use the file URI
          const file: any = {
            uri: image.uri,
            type: image.mimeType,
            name: image.fileName,
          };
          formData.append('images', file);
        }
      }

      const response = await api.post('/packages/upload-images', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data.urls || [];
    } catch (error: any) {
      console.error('Error uploading images:', error);
      throw new Error(error.response?.data?.message || 'Failed to upload images');
    } finally {
      setUploadingImages(false);
    }
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.title || !formData.description || !formData.duration || !formData.price) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    const duration = parseInt(formData.duration);
    const price = parseFloat(formData.price);

    if (isNaN(duration) || duration <= 0) {
      Alert.alert('Error', 'Duration must be a positive number');
      return;
    }

    if (isNaN(price) || price <= 0) {
      Alert.alert('Error', 'Price must be a positive number');
      return;
    }

    // Validate itinerary
    const hasIncompleteItinerary = itinerary.some(day => 
      !day.title || !day.description || !day.activities
    );

    if (hasIncompleteItinerary) {
      Alert.alert('Error', 'Please complete all itinerary days or remove incomplete ones');
      return;
    }

    try {
      setSubmitting(true);
      
      // Upload images first
      let imageUrls: string[] = [];
      if (selectedImages.length > 0) {
        try {
          imageUrls = await uploadImages();
        } catch (error: any) {
          Alert.alert('Upload Error', error.message);
          return;
        }
      }

      // Parse activities for each day (comma-separated)
      const itineraryData = itinerary.map(day => ({
        day: day.day,
        title: day.title,
        description: day.description,
        activities: day.activities.split(',').map(a => a.trim()).filter(a => a.length > 0)
      }));

      const payload = {
        title: formData.title,
        description: formData.description,
        duration,
        price,
        customCountry: formData.customCountry || undefined,
        customState: formData.customState || undefined,
        customArea: formData.customArea || undefined,
        images: imageUrls,
        itinerary: itineraryData,
      };

      await api.post('/packages', payload);
      
      Alert.alert('Success', 'Package created successfully', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error: any) {
      console.error('Error creating package:', error);
      Alert.alert('Error', error.response?.data?.error || 'Failed to create package');
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
              <Text style={styles.title}>Create Package</Text>
              <Text style={styles.subtitle}>Add a new travel package to the platform</Text>
            </View>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {/* Basic Information */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Basic Information</Text>
              
              <View style={styles.formGroup}>
                <Text style={styles.label}>Package Title *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.title}
                  onChangeText={(text) => setFormData({ ...formData, title: text })}
                  placeholder="e.g. Kerala Backwaters Experience"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Description *</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={formData.description}
                  onChangeText={(text) => setFormData({ ...formData, description: text })}
                  placeholder="Describe the package, highlights, what's included, etc."
                  multiline
                  numberOfLines={6}
                />
              </View>

              <View style={styles.row}>
                <View style={[styles.formGroup, styles.halfWidth]}>
                  <Text style={styles.label}>Duration (Days) *</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.duration}
                    onChangeText={(text) => setFormData({ ...formData, duration: text })}
                    placeholder="e.g. 5"
                    keyboardType="numeric"
                  />
                </View>

                <View style={[styles.formGroup, styles.halfWidth]}>
                  <Text style={styles.label}>Price (₹) *</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.price}
                    onChangeText={(text) => setFormData({ ...formData, price: text })}
                    placeholder="e.g. 25000"
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Package Images</Text>
                <ImageUploadField
                  images={selectedImages}
                  onImagesChange={setSelectedImages}
                  maxImages={10}
                  maxSizeInMB={5}
                />
              </View>
            </View>

            {/* Location Details */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>📍 Location Details</Text>
              
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
                  placeholder="e.g. Kerala"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Area/City</Text>
                <TextInput
                  style={styles.input}
                  value={formData.customArea}
                  onChangeText={(text) => setFormData({ ...formData, customArea: text })}
                  placeholder="e.g. Alleppey & Kumarakom"
                />
              </View>
            </View>

            {/* Detailed Itinerary */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>📅 Detailed Itinerary</Text>
                <TouchableOpacity
                  style={styles.addButton}
                  onPress={addItineraryDay}
                >
                  <Ionicons name="add-circle" size={20} color="#6366f1" />
                  <Text style={styles.addButtonText}>Add Day</Text>
                </TouchableOpacity>
              </View>

              {itinerary.map((day, index) => (
                <View key={index} style={styles.itineraryCard}>
                  <View style={styles.itineraryHeader}>
                    <Text style={styles.itineraryDayLabel}>Day {day.day}</Text>
                    {itinerary.length > 1 && (
                      <TouchableOpacity
                        onPress={() => removeItineraryDay(index)}
                        style={styles.removeButton}
                      >
                        <Ionicons name="trash-outline" size={18} color="#ef4444" />
                      </TouchableOpacity>
                    )}
                  </View>

                  <View style={styles.formGroup}>
                    <Text style={styles.label}>Day Title *</Text>
                    <TextInput
                      style={styles.input}
                      value={day.title}
                      onChangeText={(text) => updateItineraryDay(index, 'title', text)}
                      placeholder="e.g. Arrival in Kochi"
                    />
                  </View>

                  <View style={styles.formGroup}>
                    <Text style={styles.label}>Description *</Text>
                    <TextInput
                      style={[styles.input, styles.textAreaSmall]}
                      value={day.description}
                      onChangeText={(text) => updateItineraryDay(index, 'description', text)}
                      placeholder="Describe what happens on this day"
                      multiline
                      numberOfLines={3}
                    />
                  </View>

                  <View style={styles.formGroup}>
                    <Text style={styles.label}>Activities *</Text>
                    <TextInput
                      style={[styles.input, styles.textAreaSmall]}
                      value={day.activities}
                      onChangeText={(text) => updateItineraryDay(index, 'activities', text)}
                      placeholder="Comma-separated activities (e.g. Airport pickup, Hotel check-in, Fort Kochi visit)"
                      multiline
                      numberOfLines={3}
                    />
                    <Text style={styles.hint}>Enter activities separated by commas</Text>
                  </View>
                </View>
              ))}
            </View>

            {/* Action Buttons */}
            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => router.back()}
                disabled={submitting || uploadingImages}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.submitButton, (submitting || uploadingImages) && styles.submitButtonDisabled]}
                onPress={handleSubmit}
                disabled={submitting || uploadingImages}
              >
                {submitting || uploadingImages ? (
                  <>
                    <ActivityIndicator color="#ffffff" />
                    <Text style={styles.submitButtonText}>
                      {uploadingImages ? 'Uploading images...' : 'Creating package...'}
                    </Text>
                  </>
                ) : (
                  <>
                    <Ionicons name="checkmark-circle" size={20} color="#ffffff" />
                    <Text style={styles.submitButtonText}>Create Package</Text>
                  </>
                )}
              </TouchableOpacity>
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
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
  textAreaSmall: {
    minHeight: 70,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    gap: 16,
  },
  halfWidth: {
    flex: 1,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#eff6ff',
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6366f1',
  },
  itineraryCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  itineraryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  itineraryDayLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6366f1',
  },
  removeButton: {
    padding: 4,
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
