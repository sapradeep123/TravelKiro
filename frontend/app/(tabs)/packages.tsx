import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet, RefreshControl, Alert, TouchableOpacity, useWindowDimensions, Platform, Image } from 'react-native';
import { Card, Text, Chip, ActivityIndicator, Button, IconButton, Searchbar, Menu } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { packageService } from '../../src/services/packageService';
import { Package } from '../../src/types';
import WebFooter from '../../components/WebFooter';

export default function PackagesScreen() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [filteredPackages, setFilteredPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMenuVisible, setFilterMenuVisible] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'approved' | 'pending'>('all');
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
    loadPackages();
  }, []);

  useEffect(() => {
    applyFiltersAndSort();
  }, [packages, selectedFilter, searchQuery]);

  const loadPackages = async () => {
    try {
      setLoading(true);
      const data = await packageService.getAllPackages();
      setPackages(data);
    } catch (error) {
      console.error('Error loading packages:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFiltersAndSort = () => {
    let filtered = [...packages];

    if (selectedFilter !== 'all') {
      filtered = filtered.filter(pkg => 
        pkg.approvalStatus === (selectedFilter === 'approved' ? 'APPROVED' : 'PENDING')
      );
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(pkg =>
        pkg.title.toLowerCase().includes(query) ||
        pkg.description.toLowerCase().includes(query)
      );
    }

    setFilteredPackages(filtered);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadPackages();
    setRefreshing(false);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleFilterChange = (filter: 'all' | 'approved' | 'pending') => {
    setSelectedFilter(filter);
    setFilterMenuVisible(false);
  };

  const getCardWidth = () => {
    const padding = 24;
    const gap = 16;
    const availableWidth = width - padding;
    
    if (numColumns === 1) return availableWidth;
    return (availableWidth - (gap * (numColumns - 1))) / numColumns;
  };

  const handleExpressInterest = async (packageId: string, packageTitle: string) => {
    try {
      await packageService.expressInterest(packageId);
      Alert.alert('Success', `You expressed interest in "${packageTitle}". The host will contact you soon!`);
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error || 'Could not express interest');
    }
  };

  const showPackageDetails = (item: Package) => {
    console.log('Package clicked:', item.title);
    const itineraryText = item.itinerary && item.itinerary.length > 0 
      ? '\n\nItinerary:\n' + item.itinerary.map(day => `Day ${day.day}: ${day.title}`).join('\n')
      : '';
    
    const buttons: any[] = [
      { text: 'Close', style: 'cancel' }
    ];
    
    if (item.approvalStatus === 'APPROVED') {
      buttons.push({
        text: 'Express Interest',
        onPress: () => handleExpressInterest(item.id, item.title)
      });
    }
    
    Alert.alert(
      item.title,
      `${item.description}\n\n💰 Price: ₹${item.price.toLocaleString()}\n📅 Duration: ${item.duration} Days${itineraryText}\n\n✅ Status: ${item.approvalStatus}`,
      buttons
    );
  };

  const renderPackage = ({ item }: { item: Package }) => (
    <TouchableOpacity 
      activeOpacity={0.9}
      style={[styles.cardWrapper, { width: numColumns > 1 ? getCardWidth() : undefined }]}
      onPress={() => showPackageDetails(item)}
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
                <Text variant="headlineSmall" style={styles.imageTitle}>
                  {item.title}
                </Text>
                <View style={styles.imagePriceContainer}>
                  <Text style={styles.imagePriceText}>
                    ₹{item.price.toLocaleString()} • {item.duration} Days
                  </Text>
                </View>
              </LinearGradient>
            </>
          ) : (
            <View style={styles.placeholderImage}>
              <Text style={styles.placeholderText}>📦</Text>
              <Text style={styles.placeholderTitle}>{item.title}</Text>
            </View>
          )}
        </View>
        <Card.Content style={styles.cardContent}>
          <Text variant="bodyMedium" numberOfLines={3} style={styles.description}>
            {item.description}
          </Text>
          {item.itinerary && item.itinerary.length > 0 && (
            <View style={styles.itineraryPreview}>
              <Text variant="labelMedium" style={styles.itineraryLabel}>
                Highlights:
              </Text>
              {item.itinerary.slice(0, 2).map((day) => (
                <Text key={day.day} variant="bodySmall" style={styles.itineraryItem}>
                  • Day {day.day}: {day.title}
                </Text>
              ))}
              {item.itinerary.length > 2 && (
                <Text variant="bodySmall" style={styles.moreText}>
                  +{item.itinerary.length - 2} more days
                </Text>
              )}
            </View>
          )}
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
        <Text style={styles.loadingText}>Discovering amazing packages...</Text>
      </LinearGradient>
    );
  }

  return (
    <View style={styles.container}>
      {!showWebLayout && (
        <View style={styles.mobileHeader}>
          <Text variant="headlineMedium" style={styles.mobileHeaderTitle}>
            Travel Packages
          </Text>
          <Text style={styles.mobileHeaderSubtitle}>
            Discover {filteredPackages.length} of {packages.length} packages
          </Text>
          <Searchbar
            placeholder="Search packages..."
            onChangeText={handleSearch}
            value={searchQuery}
            style={styles.searchBar}
            iconColor="#667eea"
            placeholderTextColor="#999"
          />
        </View>
      )}
      
      <FlatList
        data={filteredPackages}
        renderItem={renderPackage}
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
                  Travel Packages
                </Text>
                <Text style={styles.webHeaderSubtitle}>
                  Discover {filteredPackages.length} of {packages.length} amazing packages
                </Text>
              </View>
            </View>
            <View style={styles.filterRow}>
              <Searchbar
                placeholder="Search packages..."
                onChangeText={handleSearch}
                value={searchQuery}
                style={styles.webSearchBar}
                iconColor="#667eea"
                placeholderTextColor="#999"
              />
              <Menu
                visible={filterMenuVisible}
                onDismiss={() => setFilterMenuVisible(false)}
                anchor={
                  <Button
                    mode="outlined"
                    icon="filter-variant"
                    onPress={() => setFilterMenuVisible(true)}
                    style={styles.filterButton}
                  >
                    {selectedFilter === 'all' ? 'All Status' : selectedFilter === 'approved' ? 'Approved' : 'Pending'}
                  </Button>
                }
              >
                <Menu.Item onPress={() => handleFilterChange('all')} title="All Status" />
                <Menu.Item onPress={() => handleFilterChange('approved')} title="Approved Only" />
                <Menu.Item onPress={() => handleFilterChange('pending')} title="Pending Only" />
              </Menu>
            </View>
          </View>
        ) : null}
        ListFooterComponent={showWebLayout ? <WebFooter /> : null}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📦</Text>
            <Text variant="titleLarge" style={styles.emptyText}>
              No packages found
            </Text>
            <Text variant="bodyMedium" style={styles.emptySubtext}>
              Try adjusting your search or pull to refresh
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
  filterRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  webSearchBar: {
    backgroundColor: '#f8f9fa',
    elevation: 0,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
    flex: 1,
  },
  filterButton: {
    borderColor: '#667eea',
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
  imageTitle: {
    color: '#ffffff',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  imagePriceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  imagePriceText: {
    color: 'rgba(255,255,255,0.95)',
    fontSize: 14,
    fontWeight: '600',
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
  itineraryPreview: {
    backgroundColor: '#e3f2fd',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  itineraryLabel: {
    marginBottom: 6,
    color: '#667eea',
    fontWeight: '600',
  },
  itineraryItem: {
    color: '#666',
    marginBottom: 3,
  },
  moreText: {
    color: '#667eea',
    fontStyle: 'italic',
    marginTop: 3,
  },
  statusBadge: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 12,
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
  interestButton: {
    backgroundColor: '#667eea',
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
