import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Platform, ActivityIndicator, Linking, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { accommodationService } from '../../src/services/accommodationService';
import { Accommodation } from '../../src/types';
import WebHeader from '../../components/WebHeader';
import WebFooter from '../../components/WebFooter';
import { Button, Chip, Portal, Dialog, TextInput } from 'react-native-paper';

export default function AccommodationDetail() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const isWeb = Platform.OS === 'web';
  
  const [accommodation, setAccommodation] = useState<Accommodation | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [showCallModal, setShowCallModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // Call request form
  const [callForm, setCallForm] = useState({
    name: '',
    phone: '',
    email: '',
    message: '',
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
    } catch (error) {
      console.error('Error loading accommodation:', error);
      Alert.alert('Error', 'Failed to load accommodation details');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleRequestCall = async () => {
    if (!callForm.name || !callForm.phone) {
      Alert.alert('Error', 'Please provide your name and phone number');
      return;
    }

    try {
      setSubmitting(true);
      await accommodationService.requestCall(id as string, callForm);
      Alert.alert('Success', 'Your request has been submitted! We will contact you soon.');
      setShowCallModal(false);
      setCallForm({ name: '', phone: '', email: '', message: '' });
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error || 'Failed to submit request');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCall = (phone: string) => {
    Linking.openURL(`tel:${phone}`);
  };

  const handleEmail = (email: string) => {
    Linking.openURL(`mailto:${email}`);
  };

  const handleWebsite = (website: string) => {
    Linking.openURL(website);
  };

  const formatPrice = (min?: number, max?: number, currency: string = 'INR') => {
    if (!min && !max) return 'Price on request';
    const symbol = currency === 'INR' ? '₹' : '$';
    if (min && max) return `${symbol}${min} - ${symbol}${max}`;
    if (min) return `From ${symbol}${min}`;
    if (max) return `Up to ${symbol}${max}`;
    return 'Price on request';
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        {isWeb && <WebHeader />}
        <ActivityIndicator size="large" color="#667eea" />
      </View>
    );
  }

  if (!accommodation) {
    return null;
  }

  return (
    <View style={styles.container}>
      {isWeb && <WebHeader />}
      <ScrollView style={styles.scrollContainer}>
        <View style={[styles.content, isWeb && styles.webContent]}>
          {/* Back Button */}
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#111827" />
          </TouchableOpacity>

          {/* Image Gallery */}
          {accommodation.images && accommodation.images.length > 0 && (
            <View style={styles.imageGallery}>
              <Image 
                source={{ uri: accommodation.images[selectedImage] }} 
                style={styles.mainImage}
                resizeMode="cover"
              />
              {accommodation.images.length > 1 && (
                <ScrollView horizontal style={styles.thumbnailContainer} showsHorizontalScrollIndicator={false}>
                  {accommodation.images.map((img, index) => (
                    <TouchableOpacity key={index} onPress={() => setSelectedImage(index)}>
                      <Image 
                        source={{ uri: img }} 
                        style={[styles.thumbnail, selectedImage === index && styles.thumbnailSelected]}
                      />
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}
            </View>
          )}

          {/* Header Info */}
          <View style={styles.headerInfo}>
            <View style={styles.titleRow}>
              <Text style={styles.title}>{accommodation.name}</Text>
              {accommodation.isFeatured && (
                <Chip icon="star" style={styles.featuredChip}>Featured</Chip>
              )}
            </View>
            
            <View style={styles.locationRow}>
              <Ionicons name="location" size={18} color="#667eea" />
              <Text style={styles.location}>
                {accommodation.area}, {accommodation.state}, {accommodation.country}
              </Text>
            </View>

            {accommodation.starRating && (
              <View style={styles.ratingRow}>
                {[...Array(5)].map((_, i) => (
                  <Ionicons 
                    key={i} 
                    name={i < accommodation.starRating! ? "star" : "star-outline"} 
                    size={20} 
                    color="#FFD700" 
                  />
                ))}
                <Text style={styles.reviewCount}>
                  ({accommodation.reviewCount} reviews)
                </Text>
              </View>
            )}

            <Text style={styles.price}>
              {formatPrice(accommodation.priceMin, accommodation.priceMax, accommodation.currency)}
            </Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <Button 
              mode="contained" 
              icon="phone" 
              onPress={() => setShowCallModal(true)}
              style={styles.primaryButton}
            >
              Request a Call
            </Button>
            {accommodation.phone && accommodation.phone.length > 0 && (
              <Button 
                mode="outlined" 
                icon="phone-outline" 
                onPress={() => handleCall(accommodation.phone[0])}
                style={styles.secondaryButton}
              >
                Call Now
              </Button>
            )}
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About</Text>
            <Text style={styles.description}>{accommodation.description}</Text>
          </View>

          {/* Amenities */}
          {accommodation.amenities && accommodation.amenities.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Amenities</Text>
              <View style={styles.amenitiesGrid}>
                {accommodation.amenities.map((amenity, index) => (
                  <View key={index} style={styles.amenityItem}>
                    <Ionicons name="checkmark-circle" size={20} color="#10b981" />
                    <Text style={styles.amenityText}>{amenity}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Restaurant Specific */}
          {accommodation.type === 'RESTAURANT' && accommodation.dietTypes && accommodation.dietTypes.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Diet Options</Text>
              <View style={styles.chipsContainer}>
                {accommodation.dietTypes.map((diet, index) => (
                  <Chip key={index} style={styles.dietChip}>{diet.replace('_', ' ')}</Chip>
                ))}
              </View>
            </View>
          )}

          {/* Contact Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Contact Information</Text>
            {accommodation.phone && accommodation.phone.map((phone, index) => (
              <TouchableOpacity key={index} onPress={() => handleCall(phone)} style={styles.contactItem}>
                <Ionicons name="call" size={20} color="#667eea" />
                <Text style={styles.contactText}>{phone}</Text>
              </TouchableOpacity>
            ))}
            {accommodation.email && (
              <TouchableOpacity onPress={() => handleEmail(accommodation.email!)} style={styles.contactItem}>
                <Ionicons name="mail" size={20} color="#667eea" />
                <Text style={styles.contactText}>{accommodation.email}</Text>
              </TouchableOpacity>
            )}
            {accommodation.website && (
              <TouchableOpacity onPress={() => handleWebsite(accommodation.website!)} style={styles.contactItem}>
                <Ionicons name="globe" size={20} color="#667eea" />
                <Text style={styles.contactText}>{accommodation.website}</Text>
              </TouchableOpacity>
            )}
            {accommodation.address && (
              <View style={styles.contactItem}>
                <Ionicons name="location" size={20} color="#667eea" />
                <Text style={styles.contactText}>{accommodation.address}</Text>
              </View>
            )}
          </View>
        </View>
        {isWeb && <WebFooter />}
      </ScrollView>

      {/* Request Call Modal */}
      <Portal>
        <Dialog visible={showCallModal} onDismiss={() => setShowCallModal(false)}>
          <Dialog.Title>Request a Call</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Your Name *"
              value={callForm.name}
              onChangeText={(text) => setCallForm({ ...callForm, name: text })}
              mode="outlined"
              style={styles.input}
              disabled={submitting}
            />
            <TextInput
              label="Phone Number *"
              value={callForm.phone}
              onChangeText={(text) => setCallForm({ ...callForm, phone: text })}
              mode="outlined"
              keyboardType="phone-pad"
              style={styles.input}
              disabled={submitting}
            />
            <TextInput
              label="Email (Optional)"
              value={callForm.email}
              onChangeText={(text) => setCallForm({ ...callForm, email: text })}
              mode="outlined"
              keyboardType="email-address"
              style={styles.input}
              disabled={submitting}
            />
            <TextInput
              label="Message (Optional)"
              value={callForm.message}
              onChangeText={(text) => setCallForm({ ...callForm, message: text })}
              mode="outlined"
              multiline
              numberOfLines={3}
              style={styles.input}
              disabled={submitting}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowCallModal(false)} disabled={submitting}>Cancel</Button>
            <Button onPress={handleRequestCall} mode="contained" loading={submitting} disabled={submitting}>
              Submit
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
    backgroundColor: '#f9fafb',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContainer: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  webContent: {
    maxWidth: 1200,
    marginHorizontal: 'auto',
    width: '100%',
  },
  backButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  imageGallery: {
    marginBottom: 24,
  },
  mainImage: {
    width: '100%',
    height: 400,
    borderRadius: 12,
  },
  thumbnailContainer: {
    marginTop: 12,
  },
  thumbnail: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 8,
    opacity: 0.6,
  },
  thumbnailSelected: {
    opacity: 1,
    borderWidth: 2,
    borderColor: '#667eea',
  },
  headerInfo: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    flex: 1,
  },
  featuredChip: {
    backgroundColor: '#FFD700',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 12,
  },
  location: {
    fontSize: 16,
    color: '#6b7280',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 12,
  },
  reviewCount: {
    marginLeft: 4,
    fontSize: 14,
    color: '#6b7280',
  },
  price: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#667eea',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: '#667eea',
  },
  secondaryButton: {
    flex: 1,
    borderColor: '#667eea',
  },
  section: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
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
    color: '#6b7280',
  },
  amenitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  amenityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    width: '48%',
  },
  amenityText: {
    fontSize: 14,
    color: '#374151',
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  dietChip: {
    backgroundColor: '#e7f3ff',
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
  },
  contactText: {
    fontSize: 16,
    color: '#374151',
  },
  input: {
    marginBottom: 12,
  },
});
