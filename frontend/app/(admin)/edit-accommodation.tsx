import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { accommodationService } from '../../src/services/accommodationService';
import { Accommodation } from '../../src/types';

export default function EditAccommodation() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [accommodation, setAccommodation] = useState<Accommodation | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    type: 'HOTEL' as 'HOTEL' | 'RESTAURANT' | 'RESORT' | 'HOME_STAY' | 'SHARED_FLAT',
    description: '',
    country: '',
    state: '',
    area: '',
    address: '',
    latitude: '',
    longitude: '',
    phone: '',
    email: '',
    website: '',
    priceMin: '',
    priceMax: '',
    currency: 'INR',
    amenities: '',
    images: '',
  });

  useEffect(() => {
    if (id) {
      loadAccommodation();
    }
  }, [id]);

  const loadAccommodation = async () => {
    try {
      setLoading(true);
      const data = await accommodationService.getAccommodationById(id as string);
      setAccommodation(data);
      
      setFormData({
        name: data.name,
        type: data.type,
        description: data.description,
        country: data.country,
        state: data.state,
        area: data.area,
        address: data.address || '',
        latitude: data.latitude.toString(),
        longitude: data.longitude.toString(),
        phone: data.phone.join(', '),
        email: data.email || '',
        website: data.website || '',
        priceMin: data.priceMin?.toString() || '',
        priceMax: data.priceMax?.toString() || '',
        currency: data.currency,
        amenities: data.amenities.join(', '),
        images: data.images.join(', '),
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to load accommodation');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.country || !formData.state || !formData.area) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (!formData.latitude || !formData.longitude) {
      Alert.alert('Error', 'Latitude and longitude are required');
      return;
    }

    if (!formData.phone) {
      Alert.alert('Error', 'At least one phone number is required');
      return;
    }

    try {
      setSaving(true);
      
      const submitData = {
        name: formData.name,
        type: formData.type,
        description: formData.description,
        country: formData.country,
        state: formData.state,
        area: formData.area,
        address: formData.address || undefined,
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
        phone: formData.phone.split(',').map(p => p.trim()),
        email: formData.email || undefined,
        website: formData.website || undefined,
        priceMin: formData.priceMin ? parseFloat(formData.priceMin) : undefined,
        priceMax: formData.priceMax ? parseFloat(formData.priceMax) : undefined,
        currency: formData.currency,
        amenities: formData.amenities ? formData.amenities.split(',').map(a => a.trim()) : [],
        images: formData.images ? formData.images.split(',').map(i => i.trim()) : [],
      };

      await accommodationService.updateAccommodation(id as string, submitData);
      Alert.alert('Success', 'Accommodation updated successfully', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update accommodation');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Loading accommodation...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Edit Accommodation</Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>Name *</Text>
        <TextInput
          style={styles.input}
          value={formData.name}
          onChangeText={(text) => setFormData({ ...formData, name: text })}
          placeholder="Enter accommodation name"
        />

        <Text style={styles.label}>Type *</Text>
        <View style={styles.typeButtons}>
          {['HOTEL', 'RESTAURANT', 'RESORT', 'HOME_STAY', 'SHARED_FLAT'].map((type) => (
            <TouchableOpacity
              key={type}
              style={[
                styles.typeButton,
                formData.type === type && styles.typeButtonActive
              ]}
              onPress={() => setFormData({ ...formData, type: type as any })}
            >
              <Text style={[
                styles.typeButtonText,
                formData.type === type && styles.typeButtonTextActive
              ]}>
                {type.replace('_', ' ')}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Description *</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={formData.description}
          onChangeText={(text) => setFormData({ ...formData, description: text })}
          placeholder="Enter description"
          multiline
          numberOfLines={4}
        />

        <Text style={styles.sectionTitle}>Location Information</Text>

        <Text style={styles.label}>Country *</Text>
        <TextInput
          style={styles.input}
          value={formData.country}
          onChangeText={(text) => setFormData({ ...formData, country: text })}
          placeholder="Enter country"
        />

        <Text style={styles.label}>State *</Text>
        <TextInput
          style={styles.input}
          value={formData.state}
          onChangeText={(text) => setFormData({ ...formData, state: text })}
          placeholder="Enter state"
        />

        <Text style={styles.label}>Area *</Text>
        <TextInput
          style={styles.input}
          value={formData.area}
          onChangeText={(text) => setFormData({ ...formData, area: text })}
          placeholder="Enter area/city"
        />

        <Text style={styles.label}>Address</Text>
        <TextInput
          style={styles.input}
          value={formData.address}
          onChangeText={(text) => setFormData({ ...formData, address: text })}
          placeholder="Enter full address"
        />

        <Text style={styles.label}>Latitude *</Text>
        <TextInput
          style={styles.input}
          value={formData.latitude}
          onChangeText={(text) => setFormData({ ...formData, latitude: text })}
          placeholder="Enter latitude"
          keyboardType="numeric"
        />

        <Text style={styles.label}>Longitude *</Text>
        <TextInput
          style={styles.input}
          value={formData.longitude}
          onChangeText={(text) => setFormData({ ...formData, longitude: text })}
          placeholder="Enter longitude"
          keyboardType="numeric"
        />

        <Text style={styles.sectionTitle}>Contact Information</Text>

        <Text style={styles.label}>Phone Numbers * (comma-separated)</Text>
        <TextInput
          style={styles.input}
          value={formData.phone}
          onChangeText={(text) => setFormData({ ...formData, phone: text })}
          placeholder="e.g., +91-1234567890, +91-0987654321"
        />

        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          value={formData.email}
          onChangeText={(text) => setFormData({ ...formData, email: text })}
          placeholder="Enter email"
          keyboardType="email-address"
        />

        <Text style={styles.label}>Website</Text>
        <TextInput
          style={styles.input}
          value={formData.website}
          onChangeText={(text) => setFormData({ ...formData, website: text })}
          placeholder="Enter website URL"
        />

        <Text style={styles.sectionTitle}>Pricing</Text>

        <Text style={styles.label}>Minimum Price</Text>
        <TextInput
          style={styles.input}
          value={formData.priceMin}
          onChangeText={(text) => setFormData({ ...formData, priceMin: text })}
          placeholder="Enter minimum price"
          keyboardType="numeric"
        />

        <Text style={styles.label}>Maximum Price</Text>
        <TextInput
          style={styles.input}
          value={formData.priceMax}
          onChangeText={(text) => setFormData({ ...formData, priceMax: text })}
          placeholder="Enter maximum price"
          keyboardType="numeric"
        />

        <Text style={styles.sectionTitle}>Additional Information</Text>

        <Text style={styles.label}>Amenities (comma-separated)</Text>
        <TextInput
          style={styles.input}
          value={formData.amenities}
          onChangeText={(text) => setFormData({ ...formData, amenities: text })}
          placeholder="e.g., WiFi, Parking, Pool"
        />

        <Text style={styles.label}>Image URLs (comma-separated)</Text>
        <TextInput
          style={styles.input}
          value={formData.images}
          onChangeText={(text) => setFormData({ ...formData, images: text })}
          placeholder="Enter image URLs"
        />

        <TouchableOpacity
          style={[styles.submitButton, saving && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={saving}
        >
          <Text style={styles.submitButtonText}>
            {saving ? 'Saving...' : 'Update Accommodation'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 16,
    color: '#3b82f6',
    fontWeight: '500',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    letterSpacing: -0.5,
  },
  form: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    marginBottom: 10,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  typeButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  typeButton: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#007AFF',
    backgroundColor: '#fff',
  },
  typeButtonActive: {
    backgroundColor: '#007AFF',
  },
  typeButtonText: {
    color: '#007AFF',
    fontWeight: '600',
    fontSize: 14,
  },
  typeButtonTextActive: {
    color: '#fff',
  },
  submitButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 40,
  },
  submitButtonDisabled: {
    backgroundColor: '#ccc',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
