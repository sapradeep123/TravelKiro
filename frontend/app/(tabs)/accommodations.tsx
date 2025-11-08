import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet, RefreshControl, Linking, TouchableOpacity, useWindowDimensions, Platform, Image } from 'react-native';
import { Card, Text, Chip, ActivityIndicator, Button, IconButton, SegmentedButtons, Searchbar } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { accommodationService } from '../../src/services/accommodationService';
import { Accommodation } from '../../src/types';
import WebFooter from '../../components/WebFooter';

export default function AccommodationsScreen() {
  const [accommodations, setAccommodations] = useState<Accommodation[]>([]);
  const [filteredAccommodations, setFilteredAccommodations] = useState<Accommodation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedType, setSelectedType] = useState<'ALL' | 'HOTEL' | 'RESTAURANT' | 'RESORT'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === 'web';
  const isLargeScreen = width >= 768;
  const showWebLayout = isWeb && isLargeScreen;
  
  const getNumColumns = () => {
    if (width >= 1400) return 4;
    if (width >= 1024) return 3;
    if (width >= 768) return 2;
    return 1;
  };
  const numColumns = getNumColumns();

  useEffect(() => {
    loadAccommodations();
  }, [selectedType]);

  useEffect(() => {
    applyFilters();
  }, [accommodations, searchQuery]);

  const loadAccommodations = async () => {
    try {
      setLoading(true);
      const filters = selectedType !== 'ALL' ? { type: selectedType } : undefined;
      const data = await accommodationService.getAllAccommodations(filters);
      setAccommodations(data);
    } catch (error) {
      console.error('Error loading accommodations:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...accommodations];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(acc =>
        acc.name.toLowerCase().includes(query) ||
        acc.description.toLowerCase().includes(query) ||
        acc.address.toLowerCase().includes(query)
      );
    }

    setFilteredAccommodations(filtered);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadAccommodations();
    setRefreshing(false);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const getCardWidth = () => {
    const padding = 24;
    const gap = 16;
    const availableWidth = width - padding;
    
    if (numColumns === 1) return availableWidth;
    return (availableWidth - (gap * (numColumns - 1))) / numColumns;
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'HOTEL': return 'office-building';
      case 'RESTAURANT': return 'silverware-fork-knife';
      case 'RESORT': return 'palm-tree';
      default: return 'home';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'HOTEL': return '#2196F3';
      case 'RESTAURANT': return '#FF9800';
      case 'RESORT': return '#4CAF50';
      default: return '#9E9E9E';
    }
  };

  const renderAccommodation = ({ item }: { item: Accommodation }) => (
    <TouchableOpacity 
      activeOpacity={0.9}
      style={[styles.cardWrapper, { width: numColumns > 1 ? getCardWidth() : undefined }]}
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
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.8)']}
                style={styles.imageGradient}
              >
                <View style={styles.typeChip}>
                  <MaterialCommunityIcons 
                    name={getTypeIcon(item.type) as any} 
                    size={16} 
                    color="#fff" 
                  />
                  <Text style={styles.typeText}>{item.type}</Text>
                </View>
                <Text variant="headlineSmall" style={styles.imageTitle}>
                  {item.name}
                </Text>
                <View style={styles.imageLocationContainer}>
                  <Text style={styles.imageLocationText}>
                    📍 {item.address}
                  </Text>
                </View>
              </LinearGradient>
            </>
          ) : (
            <View style={styles.placeholderImage}>
              <MaterialCommunityIcons 
                name={getTypeIcon(item.type) as any} 
                size={48} 
                color={getTypeColor(item.type)} 
              />
              <Text style={styles.placeholderTitle}>{item.name}</Text>
            </View>
          )}
        </View>
        <Card.Content style={styles.cardContent}>
          <Text variant="bodyMedium" numberOfLines={2} style={styles.description}>
            {item.description}
          </Text>
          
          <View style={styles.contactSection}>
            {item.phone && (
              <TouchableOpacity 
                style={styles.contactButton}
                onPress={() => Linking.openURL(`tel:${item.phone}`)}
              >
                <MaterialCommunityIcons name="phone" size={18} color="#667eea" />
                <Text style={styles.contactText}>Call</Text>
              </TouchableOpacity>
            )}
            {item.email && (
              <TouchableOpacity 
                style={styles.contactButton}
                onPress={() => Linking.openURL(`mailto:${item.email}`)}
              >
                <MaterialCommunityIcons name="email" size={18} color="#667eea" />
                <Text style={styles.contactText}>Email</Text>
              </TouchableOpacity>
            )}
            {item.website && (
              <TouchableOpacity 
                style={styles.contactButton}
                onPress={() => Linking.openURL(item.website!)}
              >
                <MaterialCommunityIcons name="web" size={18} color="#667eea" />
                <Text style={styles.contactText}>Website</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.statusBadge}>
            <Chip 
              icon={item.approvalStatus === 'APPROVED' ? 'check-circle' : 'clock'} 
              style={[
                styles.statusChip,
                item.approvalStatus === 'APPROVED' ? styles.approvedChip : styles.pendingChip
              ]}
              textStyle={styles.statusChipText}
              compact
            >
              {item.approvalStatus}
            </Chip>
          </View>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.centerContainer}
      >
        <ActivityIndicator size="large" color="#ffffff" />
        <Text style={styles.loadingText}>Discovering places to stay & dine...</Text>
      </LinearGradient>
    );
  }

  return (
    <View style={styles.container}>
      {!showWebLayout && (
        <View style={styles.mobileHeader}>
          <Text variant="headlineMedium" style={styles.mobileHeaderTitle}>
            Stay & Dine
          </Text>
          <Text style={styles.mobileHeaderSubtitle}>
            Discover {filteredAccommodations.length} of {accommodations.length} places
          </Text>
          <Searchbar
            placeholder="Search hotels, restaurants..."
            onChangeText={handleSearch}
            value={searchQuery}
            style={styles.searchBar}
            iconColor="#667eea"
            placeholderTextColor="#999"
          />
        </View>
      )}
      
      <View style={styles.typeFilterContainer}>
        <SegmentedButtons
          value={selectedType}
          onValueChange={(value) => setSelectedType(value as any)}
          buttons={[
            { value: 'ALL', label: 'All', icon: 'view-grid' },
            { value: 'HOTEL', label: 'Hotels', icon: 'office-building' },
            { value: 'RESTAURANT', label: 'Restaurants', icon: 'silverware-fork-knife' },
            { value: 'RESORT', label: 'Resorts', icon: 'palm-tree' },
          ]}
          style={styles.segmentedButtons}
        />
      </View>

      <FlatList
        data={filteredAccommodations}
        renderItem={renderAccommodation}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContent,
          showWebLayout && styles.webListContent,
          !showWebLayout && styles.mobileListContent
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
        ListHeaderComponent={showWebLayout ? (
          <View style={styles.webHeader}>
            <View style={styles.webHeaderTop}>
              <View>
                <Text variant="headlineLarge" style={styles.webHeaderTitle}>
                  Stay & Dine
                </Text>
                <Text style={styles.webHeaderSubtitle}>
                  Discover {filteredAccommodations.length} of {accommodations.length} amazing places
                </Text>
              </View>
            </View>
            <Searchbar
              placeholder="Search hotels, restaurants, resorts..."
              onChangeText={handleSearch}
              value={searchQuery}
              style={styles.webSearchBar}
              iconColor="#667eea"
              placeholderTextColor="#999"
            />
          </View>
        ) : null}
        ListFooterComponent={showWebLayout ? <WebFooter /> : null}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🏨</Text>
            <Text variant="titleLarge" style={styles.emptyText}>
              No accommodations found
            </Text>
            <Text variant="bodyMedium" style={styles.emptySubtext}>
              Try adjusting your filters or pull to refresh
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
  mobileHeader: {
    paddingTop: 16,
    paddingBottom: 16,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  mobileHeaderTitle: {
    color: '#333',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  mobileHeaderSubtitle: {
    color: '#666',
    fontSize: 14,
    marginBottom: 16,
  },
  searchBar: {
    backgroundColor: '#f8f9fa',
    elevation: 0,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  typeFilterContainer: {
    padding: 16,
    backgroundColor: '#fff',
  },
  segmentedButtons: {
    backgroundColor: '#fff',
  },
  listContent: {
    padding: 12,
  },
  mobileListContent: {
    paddingBottom: 160,
  },
  webListContent: {
    maxWidth: 1400,
    marginHorizontal: 'auto',
    width: '100%',
  },
  webHeader: {
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 24,
    backgroundColor: '#ffffff',
  },
  webHeaderTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  webHeaderTitle: {
    color: '#333',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  webHeaderSubtitle: {
    color: '#666',
    fontSize: 16,
  },
  webSearchBar: {
    backgroundColor: '#f8f9fa',
    elevation: 0,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  cardWrapper: {
    marginBottom: 16,
    marginHorizontal: 8,
  },
  card: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#ffffff',
    width: '100%',
  },
  imageContainer: {
    position: 'relative',
    height: 220,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    justifyContent: 'flex-end',
  },
  typeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(102, 126, 234, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
    marginBottom: 8,
    gap: 6,
  },
  typeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  imageTitle: {
    color: '#ffffff',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  imageLocationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  imageLocationText: {
    color: 'rgba(255,255,255,0.95)',
    fontSize: 13,
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#e9ecef',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#495057',
    marginTop: 8,
  },
  cardContent: {
    padding: 16,
  },
  description: {
    color: '#6c757d',
    lineHeight: 22,
    marginBottom: 16,
  },
  contactSection: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
    flexWrap: 'wrap',
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#f0f4ff',
    borderRadius: 8,
  },
  contactText: {
    color: '#667eea',
    fontSize: 13,
    fontWeight: '600',
  },
  statusBadge: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  statusChip: {
    height: 28,
  },
  statusChipText: {
    fontSize: 11,
    fontWeight: '600',
  },
  approvedChip: {
    backgroundColor: '#d4edda',
  },
  pendingChip: {
    backgroundColor: '#fff3cd',
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
