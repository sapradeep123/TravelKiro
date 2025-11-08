import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, useWindowDimensions, Platform, Alert } from 'react-native';
import { Text, Searchbar, Button, IconButton } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

type TravelCategory = 'hotel' | 'flight' | 'car' | 'tour';

export default function TravelScreen() {
  const [selectedCategory, setSelectedCategory] = useState<TravelCategory>('hotel');
  const [location, setLocation] = useState('');
  const [guests, setGuests] = useState(1);
  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === 'web';
  const isLargeScreen = width >= 768;
  const showWebLayout = isWeb && isLargeScreen;

  const categories = [
    { id: 'hotel', label: 'Hotels', icon: 'office-building', color: '#667eea' },
    { id: 'flight', label: 'Flights', icon: 'airplane', color: '#4ECDC4' },
    { id: 'car', label: 'Cars', icon: 'car', color: '#FF6B6B' },
    { id: 'tour', label: 'Tours', icon: 'map-marker-path', color: '#FFA500' },
  ];

  const quickDestinations = ['Mumbai', 'Goa', 'Kerala', 'Delhi'];

  const handleSearch = () => {
    if (!location) {
      Alert.alert('Enter Destination', 'Please enter where you want to go');
      return;
    }
    
    const cat = categories.find(c => c.id === selectedCategory);
    Alert.alert(
      'Searching...',
      `Looking for ${cat?.label} in ${location} for ${guests} guest(s)\n\nConnecting to booking partners...`
    );
  };

  const getCategoryColor = () => {
    return categories.find(c => c.id === selectedCategory)?.color || '#667eea';
  };

  return (
    <View style={styles.container}>
      {!showWebLayout && (
        <LinearGradient
          colors={[getCategoryColor(), '#764ba2']}
          style={styles.header}
        >
          <Text variant="headlineLarge" style={styles.headerTitle}>
            Book Your Travel
          </Text>
          <Text style={styles.headerSubtitle}>
            Hotels • Flights • Cars • Tours
          </Text>
        </LinearGradient>
      )}

      <View style={styles.scrollContainer}>
        {/* Category Tabs - Horizontal */}
        <View style={styles.categoriesRow}>
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryTab,
                selectedCategory === category.id && [
                  styles.categoryTabActive,
                  { backgroundColor: category.color }
                ],
              ]}
              onPress={() => setSelectedCategory(category.id as TravelCategory)}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons
                name={category.icon as any}
                size={24}
                color={selectedCategory === category.id ? '#fff' : category.color}
              />
              <Text style={[
                styles.categoryLabel,
                selectedCategory === category.id && styles.categoryLabelActive
              ]}>
                {category.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Search Box - Compact */}
        <View style={styles.searchBox}>
          <Searchbar
            placeholder="Where are you going?"
            value={location}
            onChangeText={setLocation}
            style={styles.searchInput}
            inputStyle={styles.searchInputText}
            icon="map-marker"
            iconColor={getCategoryColor()}
          />

          {/* Quick Destinations */}
          <View style={styles.quickRow}>
            {quickDestinations.map((dest, i) => (
              <TouchableOpacity
                key={i}
                style={styles.quickChip}
                onPress={() => setLocation(dest)}
              >
                <Text style={styles.quickText}>{dest}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Guests - Inline */}
          <View style={styles.guestsRow}>
            <View style={styles.guestsLabel}>
              <MaterialCommunityIcons name="account-multiple" size={20} color="#666" />
              <Text style={styles.guestsText}>Guests</Text>
            </View>
            <View style={styles.guestsControls}>
              <IconButton
                icon="minus-circle-outline"
                size={24}
                iconColor={getCategoryColor()}
                onPress={() => setGuests(Math.max(1, guests - 1))}
              />
              <Text style={[styles.guestsCount, { color: getCategoryColor() }]}>{guests}</Text>
              <IconButton
                icon="plus-circle-outline"
                size={24}
                iconColor={getCategoryColor()}
                onPress={() => setGuests(guests + 1)}
              />
            </View>
          </View>

          {/* Search Button */}
          <Button
            mode="contained"
            onPress={handleSearch}
            style={[styles.searchButton, { backgroundColor: getCategoryColor() }]}
            contentStyle={styles.searchButtonContent}
            icon="magnify"
            labelStyle={styles.searchButtonLabel}
          >
            Search {categories.find(c => c.id === selectedCategory)?.label}
          </Button>
        </View>

        {/* Features - Compact Grid */}
        <View style={styles.featuresGrid}>
          <View style={styles.featureItem}>
            <MaterialCommunityIcons name="shield-check" size={24} color="#4CAF50" />
            <Text style={styles.featureText}>Secure</Text>
          </View>
          <View style={styles.featureItem}>
            <MaterialCommunityIcons name="tag-multiple" size={24} color="#FF9800" />
            <Text style={styles.featureText}>Best Price</Text>
          </View>
          <View style={styles.featureItem}>
            <MaterialCommunityIcons name="headset" size={24} color="#2196F3" />
            <Text style={styles.featureText}>24/7 Support</Text>
          </View>
          <View style={styles.featureItem}>
            <MaterialCommunityIcons name="star" size={24} color="#FFC107" />
            <Text style={styles.featureText}>Top Rated</Text>
          </View>
        </View>

        {/* Info Footer */}
        <View style={styles.infoFooter}>
          <MaterialCommunityIcons name="information-outline" size={16} color="#667eea" />
          <Text style={styles.infoText}>
            Powered by trusted booking partners
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 4,
  },
  headerTitle: {
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 4,
    fontSize: 28,
  },
  headerSubtitle: {
    color: 'rgba(255,255,255,0.95)',
    fontSize: 14,
  },
  scrollContainer: {
    padding: 16,
    paddingBottom: 100,
  },
  categoriesRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  categoryTab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 12,
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#e0e0e0',
    elevation: 1,
  },
  categoryTabActive: {
    borderColor: 'transparent',
    elevation: 3,
  },
  categoryLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#666',
    marginTop: 4,
  },
  categoryLabelActive: {
    color: '#fff',
  },
  searchBox: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    elevation: 3,
    gap: 12,
  },
  searchInput: {
    backgroundColor: '#f8f9fa',
    elevation: 0,
    borderRadius: 12,
  },
  searchInputText: {
    fontSize: 15,
  },
  quickRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  quickChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#f0f4ff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#667eea',
  },
  quickText: {
    fontSize: 12,
    color: '#667eea',
    fontWeight: '600',
  },
  guestsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
  },
  guestsLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  guestsText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  guestsControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  guestsCount: {
    fontSize: 18,
    fontWeight: '700',
    minWidth: 32,
    textAlign: 'center',
  },
  searchButton: {
    borderRadius: 12,
    elevation: 2,
    marginTop: 4,
  },
  searchButtonContent: {
    paddingVertical: 6,
  },
  searchButtonLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
  featuresGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    elevation: 1,
    marginTop: 12,
    marginBottom: 8,
  },
  featureItem: {
    alignItems: 'center',
    gap: 4,
  },
  featureText: {
    fontSize: 10,
    color: '#666',
    fontWeight: '600',
  },
  infoFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
  },
  infoText: {
    fontSize: 12,
    color: '#667eea',
  },
});
