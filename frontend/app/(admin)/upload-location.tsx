import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, Platform, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import api from '../../src/services/api';
import { useRouter } from 'expo-router';
import WebHeader from '../../components/WebHeader';

export default function UploadLocation() {
  const router = useRouter();
  const isWeb = Platform.OS === 'web';
  
  const [formData, setFormData] = useState({
    country: '',
    state: '',
    area: '',
    description: '',
    latitude: '',
    longitude: '',
    howToReach: '',
    nearestAirport: '',
    airportDistance: '',
    nearestRailway: '',
    railwayDistance: '',
    nearestBusStation: '',
    busStationDistance: '',
  });
  const [images, setImages] = useState<string[]>([]);
  const [attractions, setAttractions] = useState<string[]>(['']);
  const [kidsAttractions, setKidsAttractions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const pickImages = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.8,
        aspect: [16, 9],
      });

      if (!result.canceled) {
        const newImages = result.assets.map(asset => asset.uri);
        setImages(prev => [...prev, ...newImages]);
      }
    } catch (error) {
      console.error('Error picking images:', error);
      Alert.alert('Error', 'Failed to pick images');
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const addAttraction = () => {
    setAttractions(prev => [...prev, '']);
  };

  const removeAttraction = (index: number) => {
    setAttractions(prev => prev.filter((_, i) => i !== index));
  };

  const updateAttraction = (index: number, value: string) => {
    setAttractions(prev => prev.map((item, i) => i === index ? value : item));
  };

  const addKidsAttraction = () => {
    setKidsAttractions(prev => [...prev, '']);
  };

  const removeKidsAttraction = (index: number) => {
    setKidsAttractions(prev => prev.filter((_, i) => i !== index));
  };

  const updateKidsAttraction = (index: number, value: string) => {
    setKidsAttractions(prev => prev.map((item, i) => i === index ? value : item));
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.country || !formData.state || !formData.area || !formData.description) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (images.length === 0) {
      Alert.alert('Error', 'Please add at least one image');
      return;
    }

    setLoading(true);
    try {
      const filteredAttractions = attractions.filter(a => a.trim() !== '');
      const filteredKidsAttractions = kidsAttractions.filter(a => a.trim() !== '');

      const response = await api.post('/locations', {
        ...formData,
        latitude: formData.latitude ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude ? parseFloat(formData.longitude) : null,
        images: images,
        attractions: filteredAttractions,
        kidsAttractions: filteredKidsAttractions,
      });

      Alert.alert('Success', 'Location uploaded successfully! It will be reviewed by admin.');
      
      // Reset form
      setFormData({
        country: '',
        state: '',
        area: '',
        description: '',
        latitude: '',
        longitude: '',
        howToReach: '',
        nearestAirport: '',
        airportDistance: '',
        nearestRailway: '',
        railwayDistance: '',
        nearestBusStation: '',
        busStationDistance: '',
      });
      setImages([]);
      setAttractions(['']);
      setKidsAttractions([]);
      
      router.back();
    } catch (error: any) {
      console.error('Error uploading location:', error);
      const message = error.response?.data?.error || 'Failed to upload location';
      Alert.alert('Error', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {isWeb && <WebHeader />}
      <ScrollView style={styles.content}>
        <View style={[styles.contentInner, isWeb && styles.webContent]}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Upload New Location</Text>
          <Text style={styles.subtitle}>Add a new tourist destination to the platform</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {/* Country */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Country *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., India"
              value={formData.country}
              onChangeText={(value) => handleInputChange('country', value)}
            />
          </View>

          {/* State */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>State/Province *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Kerala"
              value={formData.state}
              onChangeText={(value) => handleInputChange('state', value)}
            />
          </View>

          {/* Area */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Area/City *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Munnar"
              value={formData.area}
              onChangeText={(value) => handleInputChange('area', value)}
            />
          </View>

          {/* Description */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Description *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Describe the location, attractions, best time to visit, etc."
              value={formData.description}
              onChangeText={(value) => handleInputChange('description', value)}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
            />
          </View>

          {/* GPS Coordinates Section */}
          <View style={styles.sectionHeader}>
            <Ionicons name="location" size={20} color="#6366f1" />
            <Text style={styles.sectionTitle}>GPS Coordinates (Optional)</Text>
          </View>

          <View style={styles.row}>
            <View style={[styles.formGroup, styles.halfWidth]}>
              <Text style={styles.label}>Latitude</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., 10.0889"
                value={formData.latitude}
                onChangeText={(value) => handleInputChange('latitude', value)}
                keyboardType="decimal-pad"
              />
            </View>
            <View style={[styles.formGroup, styles.halfWidth]}>
              <Text style={styles.label}>Longitude</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., 77.0595"
                value={formData.longitude}
                onChangeText={(value) => handleInputChange('longitude', value)}
                keyboardType="decimal-pad"
              />
            </View>
          </View>

          {/* How to Reach */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>How to Reach</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Provide detailed directions on how to reach this location..."
              value={formData.howToReach}
              onChangeText={(value) => handleInputChange('howToReach', value)}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          {/* Transportation Section */}
          <View style={styles.sectionHeader}>
            <Ionicons name="airplane" size={20} color="#6366f1" />
            <Text style={styles.sectionTitle}>Transportation Details</Text>
          </View>

          {/* Airport */}
          <View style={styles.row}>
            <View style={[styles.formGroup, styles.twoThirds]}>
              <Text style={styles.label}>Nearest Airport</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Cochin International Airport"
                value={formData.nearestAirport}
                onChangeText={(value) => handleInputChange('nearestAirport', value)}
              />
            </View>
            <View style={[styles.formGroup, styles.oneThird]}>
              <Text style={styles.label}>Distance</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., 110 km"
                value={formData.airportDistance}
                onChangeText={(value) => handleInputChange('airportDistance', value)}
              />
            </View>
          </View>

          {/* Railway */}
          <View style={styles.row}>
            <View style={[styles.formGroup, styles.twoThirds]}>
              <Text style={styles.label}>Nearest Railway Station</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Aluva Railway Station"
                value={formData.nearestRailway}
                onChangeText={(value) => handleInputChange('nearestRailway', value)}
              />
            </View>
            <View style={[styles.formGroup, styles.oneThird]}>
              <Text style={styles.label}>Distance</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., 40 km"
                value={formData.railwayDistance}
                onChangeText={(value) => handleInputChange('railwayDistance', value)}
              />
            </View>
          </View>

          {/* Bus Station */}
          <View style={styles.row}>
            <View style={[styles.formGroup, styles.twoThirds]}>
              <Text style={styles.label}>Nearest Bus Station</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Munnar Bus Stand"
                value={formData.nearestBusStation}
                onChangeText={(value) => handleInputChange('nearestBusStation', value)}
              />
            </View>
            <View style={[styles.formGroup, styles.oneThird]}>
              <Text style={styles.label}>Distance</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., 2 km"
                value={formData.busStationDistance}
                onChangeText={(value) => handleInputChange('busStationDistance', value)}
              />
            </View>
          </View>

          {/* Attractions Section */}
          <View style={styles.sectionHeader}>
            <Ionicons name="star" size={20} color="#6366f1" />
            <Text style={styles.sectionTitle}>Attractions to Visit</Text>
          </View>

          {attractions.map((attraction, index) => (
            <View key={index} style={styles.dynamicFieldRow}>
              <TextInput
                style={[styles.input, styles.dynamicInput]}
                placeholder={`Attraction ${index + 1}`}
                value={attraction}
                onChangeText={(value) => updateAttraction(index, value)}
              />
              {attractions.length > 1 && (
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => removeAttraction(index)}
                >
                  <Ionicons name="close-circle" size={24} color="#ef4444" />
                </TouchableOpacity>
              )}
            </View>
          ))}

          <TouchableOpacity style={styles.addButton} onPress={addAttraction}>
            <Ionicons name="add-circle" size={20} color="#6366f1" />
            <Text style={styles.addButtonText}>Add Another Attraction</Text>
          </TouchableOpacity>

          {/* Kids Attractions Section */}
          <View style={styles.sectionHeader}>
            <Ionicons name="happy" size={20} color="#f59e0b" />
            <Text style={styles.sectionTitle}>Kids Attractions (Optional)</Text>
          </View>

          {kidsAttractions.length === 0 ? (
            <TouchableOpacity style={styles.addButton} onPress={addKidsAttraction}>
              <Ionicons name="add-circle" size={20} color="#f59e0b" />
              <Text style={styles.addButtonText}>Add Kids Attraction</Text>
            </TouchableOpacity>
          ) : (
            <>
              {kidsAttractions.map((attraction, index) => (
                <View key={index} style={styles.dynamicFieldRow}>
                  <TextInput
                    style={[styles.input, styles.dynamicInput]}
                    placeholder={`Kids Attraction ${index + 1}`}
                    value={attraction}
                    onChangeText={(value) => updateKidsAttraction(index, value)}
                  />
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => removeKidsAttraction(index)}
                  >
                    <Ionicons name="close-circle" size={24} color="#ef4444" />
                  </TouchableOpacity>
                </View>
              ))}
              <TouchableOpacity style={styles.addButton} onPress={addKidsAttraction}>
                <Ionicons name="add-circle" size={20} color="#f59e0b" />
                <Text style={styles.addButtonText}>Add Another Kids Attraction</Text>
              </TouchableOpacity>
            </>
          )}

          {/* Images */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Images *</Text>
            <TouchableOpacity style={styles.uploadButton} onPress={pickImages}>
              <Ionicons name="cloud-upload" size={24} color="#6366f1" />
              <Text style={styles.uploadButtonText}>Upload Images</Text>
              <Text style={styles.uploadButtonSubtext}>Click to select multiple images</Text>
            </TouchableOpacity>

            {images.length > 0 && (
              <View style={styles.imagesGrid}>
                {images.map((uri, index) => (
                  <View key={index} style={styles.imageContainer}>
                    <Image source={{ uri }} style={styles.image} />
                    <TouchableOpacity
                      style={styles.removeImageButton}
                      onPress={() => removeImage(index)}
                    >
                      <Ionicons name="close-circle" size={24} color="#ef4444" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <Text style={styles.submitButtonText}>Uploading...</Text>
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={20} color="#ffffff" />
                <Text style={styles.submitButtonText}>Submit Location</Text>
              </>
            )}
          </TouchableOpacity>

          <Text style={styles.note}>
            * All fields are required. Your submission will be reviewed by the admin team before being published.
          </Text>
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
  content: {
    flex: 1,
  },
  contentInner: {
    padding: 20,
  },
  webContent: {
    maxWidth: 800,
    marginHorizontal: 'auto',
    width: '100%',
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  form: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
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
    minHeight: 120,
    paddingTop: 12,
  },
  uploadButton: {
    borderWidth: 2,
    borderColor: '#6366f1',
    borderStyle: 'dashed',
    borderRadius: 8,
    padding: 24,
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  uploadButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6366f1',
    marginTop: 8,
  },
  uploadButtonSubtext: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  imagesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 16,
  },
  imageContainer: {
    position: 'relative',
    width: 120,
    height: 120,
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#ffffff',
    borderRadius: 12,
  },
  submitButton: {
    backgroundColor: '#6366f1',
    borderRadius: 8,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  note: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 16,
    fontStyle: 'italic',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 24,
    marginBottom: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  twoThirds: {
    flex: 2,
  },
  oneThird: {
    flex: 1,
  },
  dynamicFieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  dynamicInput: {
    flex: 1,
    marginBottom: 0,
  },
  removeButton: {
    padding: 4,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderStyle: 'dashed',
    backgroundColor: '#f9fafb',
    marginBottom: 20,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
});
