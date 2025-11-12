import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, FlatList, StyleSheet, Image, RefreshControl, TouchableOpacity, Platform, useWindowDimensions, ScrollView } from 'react-native';
import { Card, Text, Chip, ActivityIndicator, Searchbar } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { accommodationService } from '../../src/services/accommodationService';
import { Accommodation, AccommodationType, PriceCategory } from '../../src/types';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import WebFooter from '../../components/WebFooter';

export default function AccommodationsScreen() {
  const router = useRouter();
  const [accommodations, setAccommodations] = useState<Accommodation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Filters
  const [selectedType, setSelectedType] = useState<AccommodationType | undefined>();
  const [selectedPriceCategory, setSelectedPriceCategory] = useState<PriceCategory | undefined>();
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [selectedState, setSelectedState] = useState<string>('');
  const [selectedArea, setSelectedArea] = useState<string>('');
  
  const [selectedSort, setSelectedSort] = useState<string>('recent');
  
  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === 'web';
  const isLargeScreen = width >= 768;
  const showWebLayout = isWeb && isLargeScreen;
  
  const getNumColumns = () => {
    if (!showWebLayout) return 1; // Always 1 column on mobile
    if (width >= 1400) return 3;
    if (width >= 1024) return 3;
    if (width >= 768) return 2;
    return 1;
  };
  const numColumns = getNumColumns();

  const loadAccommodations = useCallback(async () => {
    try {
      setLoading(true);
      const filters: any = { page, limit: 20, sort: selectedSort };
      
      if (selectedType) filters.type = selectedType;
      if (selectedPriceCategory) filters.priceCategory = selectedPriceCategory;
      if (minPrice) filters.priceMin = parseFloat(minPrice);
      if (maxPrice) filters.priceMax = parseFloat(maxPrice);
      if (selectedState) filters.state = selectedState;
      if (selectedArea) filters.area = selectedArea;
      
      const result = await accommodationService.getAllAccommodations(filters);
      
      if (result && result.data) {
        setAccommodations(result.data);
        setTotalPages(result.pagination?.totalPages || 1);
      } else {
        setAccommodations([]);
      }
    } catch (error) {
      console.error('Error loading accommodations:', error);
      setAccommodations([]);
    } finally {
      setLoading(false);
    }
  }, [page, selectedType, selectedPriceCategory, selectedSort, minPrice, maxPrice, selectedState, selectedArea]);

  useEffect(() => {
    loadAccommodations();
  }, [loadAccommodations]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    setPage(1);
    await loadAccommodations();
    setRefreshing(false);
  }, [loadAccommodations]);

  const handleSearch = useCallback(async () => {
    if (searchQuery.trim()) {
      try {
        setLoading(true);
        const results = await accommodationService.searchAccommodations(searchQuery);
        setAccommodations(results);
      } catch (error) {
        console.error('Error searching:', error);
      } finally {
        setLoading(false);
      }
    } else {
      loadAccommodations();
    }
  }, [searchQuery, loadAccommodations]);

  const clearFilters = useCallback(() => {
    setSelectedType(undefined);
    setSelectedPriceCategory(undefined);
    setMinPrice('');
    setMaxPrice('');
    setSelectedState('');
    setSelectedArea('');
    setSearchQuery('');
    setPage(1);
  }, []);

  const getTypeIcon = (type: AccommodationType) => {
    switch (type) {
      case 'HOTEL': return '🏨';
      case 'RESORT': return '🏖️';
      case 'RESTAURANT': return '🍽️';
      case 'HOME_STAY': return '🏡';
      case 'SHARED_FLAT': return '🏢';
      default: return '📍';
    }
  };

  const getTypeLabel = (type: AccommodationType) => {
    return type.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };

  const formatPrice = (min?: number, max?: number, currency: string = 'INR') => {
    if (!min && !max) return 'Price on request';
    const symbol = currency === 'INR' ? '₹' : '$';
    if (min && max) return `${symbol}${min} - ${symbol}${max}`;
    if (min) return `From ${symbol}${min}`;
    if (max) return `Up to ${symbol}${max}`;
    return 'Price on request';
  };

  const renderAccommodation = useCallback(({ item }: { item: Accommodation }) => (
    <TouchableOpacity 
      activeOpacity={0.9}
      onPress={() => router.push(`/(tabs)/accommodation-detail?id=${item.id}`)}
      style={styles.cardWrapper}
    >
      <Card style={styles.card} elevation={4}>
        <View style={styles.imageContainer}>
          {item.images && item.images.length > 0 ? (
            <>
              <Image 
                source={{ uri: item.images[0] }} 
                style={styles.image}
                resizeMode="cover"
              />
              <View style={styles.typeBadge}>
                <Text style={styles.typeBadgeText}>
                  {getTypeIcon(item.type)} {getTypeLabel(item.type)}
                </Text>
              </View>
              {item.isFeatured && (
                <View style={styles.featuredBadge}>
                  <Ionicons name="star" size={16} color="#fff" />
                  <Text style={styles.featuredText}>Featured</Text>
                </View>
              )}
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.8)']}
                style={styles.imageGradient}
              >
                <Text variant="headlineSmall" style={styles.imageTitle}>
                  {item.name}
                </Text>
                <View style={styles.imageLocation}>
                  <Ionicons name="location" size={14} color="#fff" />
                  <Text style={styles.imageLocationText}>
                    {item.area}, {item.state}
                  </Text>
                </View>
              </LinearGradient>
            </>
          ) : (
            <View style={styles.placeholderImage}>
              <Text style={styles.placeholderText}>{getTypeIcon(item.type)}</Text>
              <Text style={styles.placeholderTitle}>{item.name}</Text>
            </View>
          )}
        </View>
        <Card.Content style={styles.cardContent}>
          <Text variant="bodyMedium" numberOfLines={2} style={styles.description}>
            {item.description}
          </Text>
          
          {item.starRating && (
            <View style={styles.ratingContainer}>
              {[...Array(5)].map((_, i) => (
                <Ionicons 
                  key={i} 
                  name={i < item.starRating! ? "star" : "star-outline"} 
                  size={16} 
                  color="#FFD700" 
                />
              ))}
              {item.reviewCount > 0 && (
                <Text style={styles.reviewCount}>({item.reviewCount})</Text>
              )}
            </View>
          )}
          
          <View style={styles.priceContainer}>
            <Text style={styles.priceText}>
              {formatPrice(item.priceMin, item.priceMax, item.currency)}
            </Text>
            {item.priceCategory && (
              <Chip style={styles.priceCategoryChip} textStyle={styles.priceCategoryText} compact>
                {item.priceCategory.replace('_', ' ')}
              </Chip>
            )}
          </View>
          
          {item.amenities && item.amenities.length > 0 && (
            <View style={styles.amenitiesContainer}>
              {item.amenities.slice(0, 3).map((amenity, index) => (
                <Chip key={index} style={styles.amenityChip} textStyle={styles.amenityText} compact>
                  {amenity}
                </Chip>
              ))}
              {item.amenities.length > 3 && (
                <Text style={styles.moreAmenities}>+{item.amenities.length - 3} more</Text>
              )}
            </View>
          )}
        </Card.Content>
      </Card>
    </TouchableOpacity>
  ), [router]);

  if (loading && accommodations.length === 0) {
    return (
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.centerContainer}
      >
        <ActivityIndicator size="large" color="#ffffff" />
        <Text style={styles.loadingText}>Finding amazing places...</Text>
      </LinearGradient>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={accommodations}
        renderItem={renderAccommodation}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContent,
          showWebLayout && styles.webListContent,
        ]}
        numColumns={numColumns}
        key={`columns-${numColumns}`}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={handleRefresh}
            colors={['#667eea']}
            tintColor="#667eea"
          />
        }
        ListHeaderComponent={
          <View style={styles.header}>
            <View style={styles.headerTop}>
              <View>
                <Text variant="headlineLarge" style={styles.headerTitle}>
                  Accommodations
                </Text>
                <Text style={styles.headerSubtitle}>
                  Discover {accommodations.length} amazing places to stay & dine
                </Text>
              </View>
            </View>
            
            <View style={styles.filterRow}>
              <Searchbar
                placeholder="Search accommodations..."
                onChangeText={setSearchQuery}
                value={searchQuery}
                onSubmitEditing={handleSearch}
                style={styles.searchBar}
                iconColor="#667eea"
              />
              
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
                <View style={styles.filterButtons}>
                  <TouchableOpacity
                    style={[styles.filterChip, !selectedType && styles.filterChipActive]}
                    onPress={() => setSelectedType(undefined)}
                  >
                    <Text style={[styles.filterChipText, !selectedType && styles.filterChipTextActive]}>
                      All Types
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[styles.filterChip, selectedType === 'HOTEL' && styles.filterChipActive]}
                    onPress={() => setSelectedType('HOTEL')}
                  >
                    <Text style={[styles.filterChipText, selectedType === 'HOTEL' && styles.filterChipTextActive]}>
                      🏨 Hotels
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[styles.filterChip, selectedType === 'RESORT' && styles.filterChipActive]}
                    onPress={() => setSelectedType('RESORT')}
                  >
                    <Text style={[styles.filterChipText, selectedType === 'RESORT' && styles.filterChipTextActive]}>
                      🏖️ Resorts
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[styles.filterChip, selectedType === 'RESTAURANT' && styles.filterChipActive]}
                    onPress={() => setSelectedType('RESTAURANT')}
                  >
                    <Text style={[styles.filterChipText, selectedType === 'RESTAURANT' && styles.filterChipTextActive]}>
                      🍽️ Restaurants
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[styles.filterChip, selectedType === 'HOME_STAY' && styles.filterChipActive]}
                    onPress={() => setSelectedType('HOME_STAY')}
                  >
                    <Text style={[styles.filterChipText, selectedType === 'HOME_STAY' && styles.filterChipTextActive]}>
                      🏡 Home Stays
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[styles.filterChip, selectedType === 'SHARED_FLAT' && styles.filterChipActive]}
                    onPress={() => setSelectedType('SHARED_FLAT')}
                  >
                    <Text style={[styles.filterChipText, selectedType === 'SHARED_FLAT' && styles.filterChipTextActive]}>
                      🏢 Shared Flats
                    </Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
              
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
                <View style={styles.filterButtons}>
                  <TouchableOpacity
                    style={[styles.filterChip, !selectedPriceCategory && styles.filterChipActive]}
                    onPress={() => setSelectedPriceCategory(undefined)}
                  >
                    <Text style={[styles.filterChipText, !selectedPriceCategory && styles.filterChipTextActive]}>
                      All Prices
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[styles.filterChip, selectedPriceCategory === 'BUDGET' && styles.filterChipActive]}
                    onPress={() => setSelectedPriceCategory('BUDGET')}
                  >
                    <Text style={[styles.filterChipText, selectedPriceCategory === 'BUDGET' && styles.filterChipTextActive]}>
                      💰 Budget
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[styles.filterChip, selectedPriceCategory === 'MID_RANGE' && styles.filterChipActive]}
                    onPress={() => setSelectedPriceCategory('MID_RANGE')}
                  >
                    <Text style={[styles.filterChipText, selectedPriceCategory === 'MID_RANGE' && styles.filterChipTextActive]}>
                      💵 Mid Range
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[styles.filterChip, selectedPriceCategory === 'LUXURY' && styles.filterChipActive]}
                    onPress={() => setSelectedPriceCategory('LUXURY')}
                  >
                    <Text style={[styles.filterChipText, selectedPriceCategory === 'LUXURY' && styles.filterChipTextActive]}>
                      💎 Luxury
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[styles.filterChip, selectedPriceCategory === 'PREMIUM' && styles.filterChipActive]}
                    onPress={() => setSelectedPriceCategory('PREMIUM')}
                  >
                    <Text style={[styles.filterChipText, selectedPriceCategory === 'PREMIUM' && styles.filterChipTextActive]}>
                      ⭐ Premium
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={styles.clearFilterButton}
                    onPress={clearFilters}
                  >
                    <Ionicons name="close-circle" size={16} color="#dc3545" />
                    <Text style={styles.clearFilterText}>Clear</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </View>
        }
        ListFooterComponent={showWebLayout ? <WebFooter /> : null}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🏨</Text>
            <Text variant="titleLarge" style={styles.emptyText}>
              No accommodations found
            </Text>
            <Text variant="bodyMedium" style={styles.emptySubtext}>
              Try adjusting your filters or search query
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '500',
  },
  listContent: {
    padding: 16,
    width: '100%',
  },
  webListContent: {
    maxWidth: 1400,
    marginHorizontal: 'auto',
    width: '100%',
  },
  header: {
    paddingHorizontal: 12,
    paddingTop: 20,
    paddingBottom: 16,
    backgroundColor: '#ffffff',
    marginBottom: 16,
    borderRadius: 12,
  },
  headerTop: {
    marginBottom: 16,
  },
  headerTitle: {
    color: '#333',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  headerSubtitle: {
    color: '#666',
    fontSize: 14,
  },
  filterRow: {
    gap: 12,
  },
  searchBar: {
    backgroundColor: '#f8f9fa',
    elevation: 0,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
    marginBottom: 12,
  },
  filterScroll: {
    marginBottom: 8,
  },
  filterButtons: {
    flexDirection: 'row',
    gap: 8,
    paddingRight: 12,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  filterChipActive: {
    backgroundColor: '#667eea',
    borderColor: '#667eea',
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#495057',
  },
  filterChipTextActive: {
    color: '#ffffff',
  },
  clearFilterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#fff5f5',
    borderWidth: 1,
    borderColor: '#dc3545',
  },
  clearFilterText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#dc3545',
  },
  cardWrapper: {
    flex: 1,
    margin: 8,
    maxWidth: 450,
    width: '100%',
  },
  card: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#ffffff',
  },
  imageContainer: {
    position: 'relative',
    height: 240,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  typeBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'rgba(255,255,255,0.95)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    zIndex: 10,
  },
  typeBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#333',
  },
  featuredBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#FFD700',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    zIndex: 10,
  },
  featuredText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
  },
  imageGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    justifyContent: 'flex-end',
  },
  imageTitle: {
    color: '#ffffff',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  imageLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  imageLocationText: {
    color: 'rgba(255,255,255,0.95)',
    fontSize: 14,
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#e9ecef',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 48,
    marginBottom: 8,
  },
  placeholderTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#495057',
  },
  cardContent: {
    padding: 16,
  },
  description: {
    color: '#6c757d',
    lineHeight: 22,
    marginBottom: 12,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 2,
  },
  reviewCount: {
    marginLeft: 4,
    fontSize: 12,
    color: '#6c757d',
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  priceText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#667eea',
  },
  priceCategoryChip: {
    height: 24,
    backgroundColor: '#e7f3ff',
  },
  priceCategoryText: {
    fontSize: 11,
    color: '#0066cc',
  },
  amenitiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    alignItems: 'center',
  },
  amenityChip: {
    height: 24,
    backgroundColor: '#f8f9fa',
  },
  amenityText: {
    fontSize: 10,
    color: '#495057',
  },
  moreAmenities: {
    fontSize: 11,
    color: '#6c757d',
    fontStyle: 'italic',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    color: '#495057',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    color: '#6c757d',
    textAlign: 'center',
  },
});
