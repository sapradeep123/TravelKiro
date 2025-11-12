import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { TextInput, Text, Chip } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { locationService } from '../../src/services/locationService';
import { Location } from '../../src/types';

interface LocationPickerSectionProps {
  selectedLocation: Location | null;
  onLocationSelected: (location: Location) => void;
  onLocationRemoved: () => void;
}

const LocationPickerSection = React.memo(function LocationPickerSection({
  selectedLocation,
  onLocationSelected,
  onLocationRemoved,
}: LocationPickerSectionProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Location[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [debounceTimer, setDebounceTimer] = useState<ReturnType<typeof setTimeout> | null>(null);
  const [abortController, setAbortController] = useState<AbortController | null>(null);

  // Debounced search function with request cancellation
  const performSearch = useCallback(async (query: string) => {
    if (query.trim().length < 2) {
      setSearchResults([]);
      setLoading(false);
      return;
    }

    // Cancel previous request if exists
    if (abortController) {
      abortController.abort();
    }

    // Create new abort controller
    const newAbortController = new AbortController();
    setAbortController(newAbortController);

    try {
      setLoading(true);
      const results = await locationService.searchLocations(query);
      
      // Only update if not aborted
      if (!newAbortController.signal.aborted) {
        setSearchResults(results.slice(0, 20)); // Limit to 20 results
      }
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        console.error('Location search error:', error);
        setSearchResults([]);
      }
    } finally {
      if (!newAbortController.signal.aborted) {
        setLoading(false);
      }
    }
  }, [abortController]);

  // Handle search input with debouncing
  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
    setShowDropdown(true);

    // Clear existing timer
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    // Set new timer for 300ms debounce
    const timer = setTimeout(() => {
      performSearch(text);
    }, 300);

    setDebounceTimer(timer);
  };

  // Cleanup timer and abort controller on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
      if (abortController) {
        abortController.abort();
      }
    };
  }, [debounceTimer, abortController]);

  const handleLocationSelect = (location: Location) => {
    onLocationSelected(location);
    setSearchQuery('');
    setSearchResults([]);
    setShowDropdown(false);
  };

  const handleRemoveLocation = () => {
    onLocationRemoved();
  };

  const formatLocationDisplay = (location: Location): string => {
    return `${location.area}, ${location.state}, ${location.country}`;
  };

  const renderLocationItem = ({ item }: { item: Location }) => (
    <TouchableOpacity
      style={styles.resultItem}
      onPress={() => handleLocationSelect(item)}
    >
      <MaterialCommunityIcons name="map-marker" size={20} color="#667eea" />
      <View style={styles.resultTextContainer}>
        <Text style={styles.resultArea}>{item.area}</Text>
        <Text style={styles.resultDetails}>
          {item.state}, {item.country}
        </Text>
      </View>
      <MaterialCommunityIcons name="chevron-right" size={20} color="#999" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Selected Location Display */}
      {selectedLocation ? (
        <View style={styles.selectedContainer}>
          <Chip
            icon="map-marker"
            onClose={handleRemoveLocation}
            style={styles.selectedChip}
            textStyle={styles.selectedChipText}
          >
            {formatLocationDisplay(selectedLocation)}
          </Chip>
        </View>
      ) : (
        <>
          {/* Search Input */}
          <TextInput
            mode="outlined"
            label="Add Location (Optional)"
            placeholder="Search for a location..."
            value={searchQuery}
            onChangeText={handleSearchChange}
            onFocus={() => setShowDropdown(true)}
            left={<TextInput.Icon icon="map-marker-outline" />}
            right={
              loading ? (
                <TextInput.Icon icon={() => <ActivityIndicator size={20} />} />
              ) : searchQuery.length > 0 ? (
                <TextInput.Icon
                  icon="close"
                  onPress={() => {
                    setSearchQuery('');
                    setSearchResults([]);
                    setShowDropdown(false);
                  }}
                />
              ) : null
            }
            style={styles.searchInput}
          />

          {/* Search Results Dropdown */}
          {showDropdown && searchQuery.length >= 2 && (
            <View style={styles.dropdownContainer}>
              {loading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color="#667eea" />
                  <Text style={styles.loadingText}>Searching locations...</Text>
                </View>
              ) : searchResults.length > 0 ? (
                <FlatList
                  data={searchResults}
                  renderItem={renderLocationItem}
                  keyExtractor={(item) => item.id}
                  style={styles.resultsList}
                  keyboardShouldPersistTaps="handled"
                  nestedScrollEnabled
                />
              ) : (
                <View style={styles.emptyContainer}>
                  <MaterialCommunityIcons name="map-marker-off" size={32} color="#ccc" />
                  <Text style={styles.emptyText}>No locations found</Text>
                  <Text style={styles.emptySubtext}>Try a different search term</Text>
                </View>
              )}
            </View>
          )}

          {/* Helper Text */}
          {!showDropdown && (
            <Text style={styles.helperText}>
              Tag a location to help others discover this place
            </Text>
          )}
        </>
      )}
    </View>
  );
});

export default LocationPickerSection;

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  selectedContainer: {
    marginBottom: 8,
  },
  selectedChip: {
    backgroundColor: '#667eea',
    alignSelf: 'flex-start',
  },
  selectedChipText: {
    color: '#fff',
  },
  searchInput: {
    marginBottom: 8,
  },
  dropdownContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    maxHeight: 300,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  resultsList: {
    maxHeight: 300,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  resultTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  resultArea: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  resultDetails: {
    fontSize: 14,
    color: '#666',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: '#666',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginTop: 12,
    fontWeight: '600',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 4,
  },
  helperText: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
});
