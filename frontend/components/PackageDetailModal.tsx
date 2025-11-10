import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, ScrollView, TouchableOpacity, Image, ActivityIndicator, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../src/services/api';

interface PackageDetailModalProps {
  packageId: string;
  visible: boolean;
  onClose: () => void;
}

interface PackageDetail {
  id: string;
  title: string;
  description: string;
  duration: number;
  price: number;
  images: string[];
  customCountry?: string;
  customState?: string;
  customArea?: string;
  approvalStatus: string;
  isActive: boolean;
  host: {
    profile: {
      name: string;
    };
  };
  itinerary: Array<{
    day: number;
    title: string;
    description: string;
    activities: string[];
  }>;
}

export default function PackageDetailModal({ packageId, visible, onClose }: PackageDetailModalProps) {
  const [packageData, setPackageData] = useState<PackageDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const isWeb = Platform.OS === 'web';

  useEffect(() => {
    if (visible && packageId) {
      fetchPackageDetails();
    }
  }, [visible, packageId]);

  const fetchPackageDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/packages/${packageId}`);
      setPackageData(response.data.data);
      setCurrentImageIndex(0);
    } catch (error) {
      console.error('Error fetching package details:', error);
    } finally {
      setLoading(false);
    }
  };

  const nextImage = () => {
    if (packageData && packageData.images.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % packageData.images.length);
    }
  };

  const previousImage = () => {
    if (packageData && packageData.images.length > 0) {
      setCurrentImageIndex((prev) => (prev - 1 + packageData.images.length) % packageData.images.length);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, isWeb && styles.modalContentWeb]}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Package Details</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#111827" />
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#6366f1" />
            </View>
          ) : packageData ? (
            <ScrollView style={styles.scrollContent}>
              {/* Image Gallery */}
              {packageData.images && packageData.images.length > 0 && (
                <View style={styles.imageGallery}>
                  <Image
                    source={{ uri: packageData.images[currentImageIndex] }}
                    style={styles.mainImage}
                  />
                  {packageData.images.length > 1 && (
                    <>
                      <TouchableOpacity
                        style={[styles.imageNavButton, styles.imageNavLeft]}
                        onPress={previousImage}
                      >
                        <Ionicons name="chevron-back" size={24} color="#ffffff" />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.imageNavButton, styles.imageNavRight]}
                        onPress={nextImage}
                      >
                        <Ionicons name="chevron-forward" size={24} color="#ffffff" />
                      </TouchableOpacity>
                      <View style={styles.imageCounter}>
                        <Text style={styles.imageCounterText}>
                          {currentImageIndex + 1} / {packageData.images.length}
                        </Text>
                      </View>
                    </>
                  )}
                </View>
              )}

              {/* Package Info */}
              <View style={styles.infoSection}>
                <Text style={styles.packageTitle}>{packageData.title}</Text>
                
                <View style={styles.metaRow}>
                  <View style={styles.metaItem}>
                    <Ionicons name="calendar-outline" size={16} color="#6b7280" />
                    <Text style={styles.metaText}>{packageData.duration} Days</Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Ionicons name="cash-outline" size={16} color="#6b7280" />
                    <Text style={styles.metaText}>₹{packageData.price.toLocaleString()}</Text>
                  </View>
                </View>

                {/* Status Badges */}
                <View style={styles.badgeRow}>
                  <View style={[
                    styles.statusBadge,
                    { backgroundColor: packageData.approvalStatus === 'APPROVED' ? '#10b98120' : '#ef444420' }
                  ]}>
                    <Text style={[
                      styles.statusText,
                      { color: packageData.approvalStatus === 'APPROVED' ? '#10b981' : '#ef4444' }
                    ]}>
                      {packageData.approvalStatus}
                    </Text>
                  </View>
                  <View style={[
                    styles.statusBadge,
                    { backgroundColor: packageData.isActive ? '#10b98120' : '#f59e0b20' }
                  ]}>
                    <Text style={[
                      styles.statusText,
                      { color: packageData.isActive ? '#10b981' : '#f59e0b' }
                    ]}>
                      {packageData.isActive ? 'Active' : 'Inactive'}
                    </Text>
                  </View>
                </View>

                {/* Location */}
                {(packageData.customCountry || packageData.customState || packageData.customArea) && (
                  <View style={styles.locationSection}>
                    <View style={styles.sectionHeader}>
                      <Ionicons name="location-outline" size={20} color="#6366f1" />
                      <Text style={styles.sectionTitle}>Location</Text>
                    </View>
                    <Text style={styles.locationText}>
                      {[packageData.customArea, packageData.customState, packageData.customCountry]
                        .filter(Boolean)
                        .join(', ')}
                    </Text>
                  </View>
                )}

                {/* Description */}
                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <Ionicons name="document-text-outline" size={20} color="#6366f1" />
                    <Text style={styles.sectionTitle}>Description</Text>
                  </View>
                  <Text style={styles.descriptionText}>{packageData.description}</Text>
                </View>

                {/* Host Info */}
                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <Ionicons name="person-outline" size={20} color="#6366f1" />
                    <Text style={styles.sectionTitle}>Hosted By</Text>
                  </View>
                  <Text style={styles.hostText}>{packageData.host.profile.name}</Text>
                </View>

                {/* Itinerary */}
                {packageData.itinerary && packageData.itinerary.length > 0 && (
                  <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                      <Ionicons name="list-outline" size={20} color="#6366f1" />
                      <Text style={styles.sectionTitle}>Itinerary</Text>
                    </View>
                    {packageData.itinerary.map((day) => (
                      <View key={day.day} style={styles.itineraryDay}>
                        <View style={styles.dayHeader}>
                          <View style={styles.dayBadge}>
                            <Text style={styles.dayBadgeText}>Day {day.day}</Text>
                          </View>
                          <Text style={styles.dayTitle}>{day.title}</Text>
                        </View>
                        <Text style={styles.dayDescription}>{day.description}</Text>
                        {day.activities && day.activities.length > 0 && (
                          <View style={styles.activitiesContainer}>
                            {day.activities.map((activity, index) => (
                              <View key={index} style={styles.activityItem}>
                                <Ionicons name="checkmark-circle" size={16} color="#10b981" />
                                <Text style={styles.activityText}>{activity}</Text>
                              </View>
                            ))}
                          </View>
                        )}
                      </View>
                    ))}
                  </View>
                )}
              </View>
            </ScrollView>
          ) : (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>Failed to load package details</Text>
              <TouchableOpacity style={styles.retryButton} onPress={fetchPackageDetails}>
                <Text style={styles.retryButtonText}>Retry</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    width: '90%',
    maxHeight: '90%',
    overflow: 'hidden',
  },
  modalContentWeb: {
    width: '80%',
    maxWidth: 900,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  closeButton: {
    padding: 4,
  },
  loadingContainer: {
    padding: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    flex: 1,
  },
  imageGallery: {
    position: 'relative',
    height: 300,
    backgroundColor: '#f3f4f6',
  },
  mainImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imageNavButton: {
    position: 'absolute',
    top: '50%',
    transform: [{ translateY: -20 }],
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    padding: 8,
  },
  imageNavLeft: {
    left: 16,
  },
  imageNavRight: {
    right: 16,
  },
  imageCounter: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  imageCounterText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  infoSection: {
    padding: 20,
  },
  packageTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  section: {
    marginBottom: 24,
  },
  locationSection: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  locationText: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  descriptionText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 22,
  },
  hostText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  itineraryDay: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  dayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  dayBadge: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  dayBadgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  dayTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
  },
  dayDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
    marginBottom: 12,
  },
  activitiesContainer: {
    gap: 8,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  activityText: {
    fontSize: 13,
    color: '#374151',
    flex: 1,
  },
  errorContainer: {
    padding: 60,
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#ef4444',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
});
