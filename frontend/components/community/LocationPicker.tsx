import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  TextInput, 
  Alert, 
  Platform,
  ActivityIndicator,
  ScrollView,
  Modal
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ExpoLocation from 'expo-location';
import { locationService } from '../../src/services/locationService';
import { Location } from '../../src/types';
import { communityTheme, responsiveUtils } from '../../src/theme';

export interface LocationData {
  type: 'auto' | 'manual' | 'existing';
  locationId?: string;
  locationDisplay?: string;
  customCountry?: string;
  customState?: string;
  customArea?: string;
  latitude?: number;
  longitude?: number;
}

interface LocationPickerProps {
  location: LocationData | null;
  onLocationChange: (location: LocationData | null) => void;
}

export default function LocationPicker({ location, onLocationChange }: LocationPickerProps) {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Location[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [manualMode, setManualMode] = useState(false);
  const [manualCountry, setManualCountry] = useState('');
  const [manualState, setManualState] = useState('');
  const [manualArea, setManualArea] = useState('');

  useEffect(() => {
    if (searchQuery.length >= 2) {
      const timer = setTimeout(() => {
        searchLocations();
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const requestLocationPermission = async (): Promise<boolean> => {
    try {
      const { status } = await ExpoLocation.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Please grant location permission to auto-detect your location'
        );
        return false;
      }
      return true;
    } catch (error) {
      console.error('Error requesting location permission:', error);
      return false;
    }
  };

  const detectLocation = async () => {
    setIsDetecting(true);
    try {
      const hasPermission = await requestLocationPermission();
      if (!hasPermission) {
        setIsDetecting(false);
        return;
      }

      const position = await ExpoLocation.getCurrentPositionAsync({
        accuracy: ExpoLocation.Accuracy.Balanced,
      });

      const { latitude, longitude } = position.coords;

      // Reverse geocode to get place name
      const addresses = await ExpoLocation.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      if (addresses && addresses.length > 0) {
        const address = addresses[0];
        const locationDisplay = [
          address.city || address.subregion,
          address.region,
          address.country
        ].filter(Boolean).join(', ');

        onLocationChange({
          type: 'auto',
          locationDisplay,
          customCountry: address.country || undefined,
          customState: address.region || undefined,
          customArea: address.city || address.subregion || undefined,
          latitude,
          longitude,
        });

        setIsModalVisible(false);
        Alert.alert('Success', 'Location detected successfully');
      } else {
        Alert.alert('Error', 'Could not determine location name');
      }
    } catch (error) {
      console.error('Error detecting location:', error);
      Alert.alert('Error', 'Failed to detect location. Please try manual selection.');
    } finally {
      setIsDetecting(false);
    }
  };

  const searchLocations = async () => {
    if (searchQuery.length < 2) return;

    setIsSearching(true);
    try {
      const results = await locationService.searchLocations(searchQuery);
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching locations:', error);
      Alert.alert('Error', 'Failed to search locations');
    } finally {
      setIsSearching(false);
    }
  };

  const selectExistingLocation = (loc: Location) => {
    const locationDisplay = [loc.area, loc.state, loc.country].filter(Boolean).join(', ');
    
    onLocationChange({
      type: 'existing',
      locationId: loc.id,
      locationDisplay,
      latitude: loc.latitude,
      longitude: loc.longitude,
    });

    setIsModalVisible(false);
    setSearchQuery('');
    setSearchResults([]);
  };

  const saveManualLocation = () => {
    if (!manualCountry.trim() || !manualState.trim() || !manualArea.trim()) {
      Alert.alert('Validation Error', 'Please fill in all location fields');
      return;
    }

    const locationDisplay = [manualArea, manualState, manualCountry].filter(Boolean).join(', ');

    onLocationChange({
      type: 'manual',
      locationDisplay,
      customCountry: manualCountry.trim(),
      customState: manualState.trim(),
      customArea: manualArea.trim(),
    });

    setIsModalVisible(false);
    setManualMode(false);
    setManualCountry('');
    setManualState('');
    setManualArea('');
  };

  const clearLocation = () => {
    onLocationChange(null);
  };

  const openModal = () => {
    setIsModalVisible(true);
    setManualMode(false);
    setSearchQuery('');
    setSearchResults([]);
  };

  return (
    <View style={styles.container}>
      {location ? (
        <View style={styles.selectedLocation}>
          <View style={styles.selectedLocationHeader}>
            <Ionicons name="location" size={20} color="#667eea" />
            <Text style={styles.selectedLocationText} numberOfLines={2}>
              {location.locationDisplay}
            </Text>
          </View>
          <View style={styles.selectedLocationActions}>
            <TouchableOpacity onPress={openModal} style={styles.editButton}>
              <Ionicons name="pencil" size={16} color="#667eea" />
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={clearLocation} style={styles.clearButton}>
              <Ionicons name="close-circle" size={16} color="#ef4444" />
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <TouchableOpacity style={styles.addButton} onPress={openModal}>
          <Ionicons name="location-outline" size={24} color="#667eea" />
          <Text style={styles.addButtonText}>Add Location</Text>
          <Text style={styles.addButtonHint}>Required for post</Text>
        </TouchableOpacity>
      )}

      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Location</Text>
              <TouchableOpacity onPress={() => setIsModalVisible(false)}>
                <Ionicons name="close" size={24} color="#111827" />
              </TouchableOpacity>
            </View>

            {!manualMode ? (
              <>
                {/* Auto-detect Button */}
                <TouchableOpacity
                  style={styles.autoDetectButton}
                  onPress={detectLocation}
                  disabled={isDetecting}
                >
                  {isDetecting ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Ionicons name="navigate" size={20} color="#fff" />
                  )}
                  <Text style={styles.autoDetectText}>
                    {isDetecting ? 'Detecting...' : 'Use Current Location'}
                  </Text>
                </TouchableOpacity>

                <View style={styles.divider}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>OR</Text>
                  <View style={styles.dividerLine} />
                </View>

                {/* Search Existing Locations */}
                <View style={styles.searchContainer}>
                  <Ionicons name="search" size={20} color="#6b7280" style={styles.searchIcon} />
                  <TextInput
                    style={styles.searchInput}
                    placeholder="Search existing locations..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    autoCapitalize="words"
                  />
                  {isSearching && <ActivityIndicator size="small" color="#667eea" />}
                </View>

                {searchResults.length > 0 && (
                  <ScrollView style={styles.searchResults}>
                    {searchResults.map((loc) => (
                      <TouchableOpacity
                        key={loc.id}
                        style={styles.searchResultItem}
                        onPress={() => selectExistingLocation(loc)}
                      >
                        <Ionicons name="location" size={18} color="#667eea" />
                        <View style={styles.searchResultText}>
                          <Text style={styles.searchResultArea}>{loc.area}</Text>
                          <Text style={styles.searchResultDetails}>
                            {loc.state}, {loc.country}
                          </Text>
                        </View>
                        <Ionicons name="chevron-forward" size={18} color="#9ca3af" />
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                )}

                {/* Manual Entry Button */}
                <TouchableOpacity
                  style={styles.manualButton}
                  onPress={() => setManualMode(true)}
                >
                  <Ionicons name="create-outline" size={20} color="#667eea" />
                  <Text style={styles.manualButtonText}>Enter Location Manually</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                {/* Manual Entry Form */}
                <View style={styles.manualForm}>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Country *</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="e.g., India"
                      value={manualCountry}
                      onChangeText={setManualCountry}
                      autoCapitalize="words"
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>State/Region *</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="e.g., Kerala"
                      value={manualState}
                      onChangeText={setManualState}
                      autoCapitalize="words"
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>City/Area *</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="e.g., Kochi"
                      value={manualArea}
                      onChangeText={setManualArea}
                      autoCapitalize="words"
                    />
                  </View>

                  <View style={styles.manualFormActions}>
                    <TouchableOpacity
                      style={styles.backButton}
                      onPress={() => setManualMode(false)}
                    >
                      <Text style={styles.backButtonText}>Back</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.saveButton}
                      onPress={saveManualLocation}
                    >
                      <Text style={styles.saveButtonText}>Save Location</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: communityTheme.spacing.base,
  },
  addButton: {
    borderWidth: 2,
    borderColor: communityTheme.colors.border,
    borderStyle: 'dashed',
    borderRadius: communityTheme.borderRadius.lg,
    padding: communityTheme.spacing.base,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: communityTheme.colors.surfaceVariant,
    minHeight: communityTheme.touchTarget.min,
    ...Platform.select({
      web: {
        cursor: 'pointer',
        transition: 'background-color 0.2s ease, border-color 0.2s ease',
        ':hover': {
          backgroundColor: communityTheme.colors.surface,
          borderColor: communityTheme.colors.primary,
        },
      },
    }),
  },
  addButtonText: {
    fontSize: communityTheme.typography.fontSize.base,
    fontWeight: communityTheme.typography.fontWeight.semibold,
    color: communityTheme.colors.primary,
    marginTop: communityTheme.spacing.sm,
  },
  addButtonHint: {
    fontSize: communityTheme.typography.fontSize.xs,
    color: communityTheme.colors.textSecondary,
    marginTop: communityTheme.spacing.xs,
  },
  selectedLocation: {
    borderWidth: 1,
    borderColor: communityTheme.colors.primary,
    borderRadius: communityTheme.borderRadius.lg,
    padding: communityTheme.spacing.md,
    backgroundColor: '#f0f4ff',
  },
  selectedLocationHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: communityTheme.spacing.sm,
    marginBottom: communityTheme.spacing.sm,
  },
  selectedLocationText: {
    flex: 1,
    fontSize: communityTheme.typography.fontSize.base,
    fontWeight: communityTheme.typography.fontWeight.medium,
    color: communityTheme.colors.text,
  },
  selectedLocationActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: communityTheme.spacing.sm,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: communityTheme.spacing.xs,
    paddingHorizontal: communityTheme.spacing.md,
    paddingVertical: 6,
    backgroundColor: communityTheme.colors.surface,
    borderRadius: communityTheme.borderRadius.base,
    borderWidth: 1,
    borderColor: communityTheme.colors.primary,
    ...Platform.select({
      web: {
        cursor: 'pointer',
        transition: 'background-color 0.2s ease',
        ':hover': {
          backgroundColor: communityTheme.colors.surfaceVariant,
        },
      },
    }),
  },
  editButtonText: {
    fontSize: communityTheme.typography.fontSize.sm,
    fontWeight: communityTheme.typography.fontWeight.semibold,
    color: communityTheme.colors.primary,
  },
  clearButton: {
    padding: 6,
    backgroundColor: communityTheme.colors.surface,
    borderRadius: communityTheme.borderRadius.base,
    borderWidth: 1,
    borderColor: communityTheme.colors.error,
    ...Platform.select({
      web: {
        cursor: 'pointer',
        transition: 'background-color 0.2s ease',
        ':hover': {
          backgroundColor: '#FEE2E2',
        },
      },
    }),
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: communityTheme.colors.overlay,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: communityTheme.colors.surface,
    borderTopLeftRadius: communityTheme.borderRadius.xxl,
    borderTopRightRadius: communityTheme.borderRadius.xxl,
    padding: communityTheme.spacing.lg,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: communityTheme.spacing.lg,
  },
  modalTitle: {
    fontSize: communityTheme.typography.fontSize.xxl,
    fontWeight: communityTheme.typography.fontWeight.bold,
    color: communityTheme.colors.text,
  },
  autoDetectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: communityTheme.spacing.sm,
    backgroundColor: communityTheme.colors.primary,
    padding: communityTheme.spacing.base,
    borderRadius: communityTheme.borderRadius.lg,
    marginBottom: communityTheme.spacing.base,
    minHeight: communityTheme.touchTarget.min,
    ...Platform.select({
      web: {
        cursor: 'pointer',
        transition: 'background-color 0.2s ease',
        ':hover': {
          backgroundColor: communityTheme.colors.primaryDark,
        },
      },
    }),
  },
  autoDetectText: {
    fontSize: communityTheme.typography.fontSize.lg,
    fontWeight: communityTheme.typography.fontWeight.semibold,
    color: communityTheme.colors.surface,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: communityTheme.spacing.base,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: communityTheme.colors.border,
  },
  dividerText: {
    marginHorizontal: communityTheme.spacing.md,
    fontSize: communityTheme.typography.fontSize.sm,
    color: communityTheme.colors.textSecondary,
    fontWeight: communityTheme.typography.fontWeight.semibold,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: communityTheme.colors.border,
    borderRadius: communityTheme.borderRadius.lg,
    paddingHorizontal: communityTheme.spacing.md,
    backgroundColor: communityTheme.colors.surfaceVariant,
    marginBottom: communityTheme.spacing.md,
  },
  searchIcon: {
    marginRight: communityTheme.spacing.sm,
  },
  searchInput: {
    flex: 1,
    paddingVertical: communityTheme.spacing.md,
    fontSize: communityTheme.typography.fontSize.base,
    color: communityTheme.colors.text,
  },
  searchResults: {
    maxHeight: 250,
    marginBottom: communityTheme.spacing.md,
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: communityTheme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: communityTheme.colors.border,
    gap: communityTheme.spacing.md,
    ...Platform.select({
      web: {
        cursor: 'pointer',
        transition: 'background-color 0.2s ease',
        ':hover': {
          backgroundColor: communityTheme.colors.surfaceVariant,
        },
      },
    }),
  },
  searchResultText: {
    flex: 1,
  },
  searchResultArea: {
    fontSize: communityTheme.typography.fontSize.base,
    fontWeight: communityTheme.typography.fontWeight.semibold,
    color: communityTheme.colors.text,
    marginBottom: 2,
  },
  searchResultDetails: {
    fontSize: communityTheme.typography.fontSize.sm,
    color: communityTheme.colors.textSecondary,
  },
  manualButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: communityTheme.spacing.sm,
    padding: communityTheme.spacing.base - 2,
    borderWidth: 1,
    borderColor: communityTheme.colors.primary,
    borderRadius: communityTheme.borderRadius.lg,
    backgroundColor: communityTheme.colors.surface,
    minHeight: communityTheme.touchTarget.min,
    ...Platform.select({
      web: {
        cursor: 'pointer',
        transition: 'background-color 0.2s ease',
        ':hover': {
          backgroundColor: communityTheme.colors.surfaceVariant,
        },
      },
    }),
  },
  manualButtonText: {
    fontSize: communityTheme.typography.fontSize.base,
    fontWeight: communityTheme.typography.fontWeight.semibold,
    color: communityTheme.colors.primary,
  },
  manualForm: {
    gap: communityTheme.spacing.base,
  },
  inputGroup: {
    gap: communityTheme.spacing.sm,
  },
  inputLabel: {
    fontSize: communityTheme.typography.fontSize.base,
    fontWeight: communityTheme.typography.fontWeight.semibold,
    color: communityTheme.colors.text,
  },
  input: {
    ...communityTheme.components.input,
  },
  manualFormActions: {
    flexDirection: 'row',
    gap: communityTheme.spacing.md,
    marginTop: communityTheme.spacing.sm,
  },
  backButton: {
    flex: 1,
    padding: communityTheme.spacing.base - 2,
    borderWidth: 1,
    borderColor: communityTheme.colors.border,
    borderRadius: communityTheme.borderRadius.lg,
    alignItems: 'center',
    ...Platform.select({
      web: {
        cursor: 'pointer',
        transition: 'background-color 0.2s ease',
        ':hover': {
          backgroundColor: communityTheme.colors.surfaceVariant,
        },
      },
    }),
  },
  backButtonText: {
    fontSize: communityTheme.typography.fontSize.base,
    fontWeight: communityTheme.typography.fontWeight.semibold,
    color: communityTheme.colors.textSecondary,
  },
  saveButton: {
    flex: 2,
    padding: communityTheme.spacing.base - 2,
    backgroundColor: communityTheme.colors.primary,
    borderRadius: communityTheme.borderRadius.lg,
    alignItems: 'center',
    ...Platform.select({
      web: {
        cursor: 'pointer',
        transition: 'background-color 0.2s ease',
        ':hover': {
          backgroundColor: communityTheme.colors.primaryDark,
        },
      },
    }),
  },
  saveButtonText: {
    fontSize: communityTheme.typography.fontSize.base,
    fontWeight: communityTheme.typography.fontWeight.semibold,
    color: communityTheme.colors.surface,
  },
});
