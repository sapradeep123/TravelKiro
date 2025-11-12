import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet, Image, RefreshControl, TouchableOpacity, Platform, useWindowDimensions } from 'react-native';
import { Card, Text, Searchbar, Chip, ActivityIndicator, Menu, Button } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { locationService } from '../../src/services/locationService';
import { Location } from '../../src/types';
import { useRouter } from 'expo-router';
import WebFooter from '../../components/WebFooter';

export default function LocationsScreen() {
  const router = useRouter();
  const [locations, setLocations] = useState<Location[]>([]);
  const [filteredLocations, setFilteredLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMenuVisible, setFilterMenuVisible] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'approved' | 'pending'>('all');
  const [sortMenuVisible, setSortMenuVisible] = useState(false);
  const [selectedSort, setSelectedSort] = useState<'name' | 'recent'>('name');
  const [sourceFilter, setSourceFilter] = useState<'all' | 'govt' | 'agent'>('all');
  const [sourceMenuVisible, setSourceMenuVisible] = useState(false);
  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === 'web';
  const isLargeScreen = width >= 768;
  const showWebLayout = isWeb && isLargeScreen;
  
  // Calculate number of columns based on screen width
  const getNumColumns = () => {
    if (width >= 1400) return 4;
    if (width >= 1024) return 3;
    if (width >= 768) return 2;
    return 1;
  };
  const numColumns = getNumColumns();

  useEffect(() => {
    loadLocations();
  }, []);

  useEffect(() => {
    applyFiltersAndSort();
  }, [locations, selectedFilter, selectedSort, searchQuery, sourceFilter]);

  const loadLocations = async () => {
    try {
      setLoading(true);
      const data = await locationService.getAllLocations();
      setLocations(data);
    } catch (error) {
      console.error('Error loading locations:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFiltersAndSort = () => {
    let filtered = [...locations];

    // Apply status filter
    if (selectedFilter !== 'all') {
      filtered = filtered.filter(loc => 
        loc.approvalStatus === (selectedFilter === 'approved' ? 'APPROVED' : 'PENDING')
      );
    }

    // Apply source filter
    if (sourceFilter === 'govt') {
      filtered = filtered.filter(loc => loc.createdByRole === 'GOVT_DEPARTMENT');
    } else if (sourceFilter === 'agent') {
      filtered = filtered.filter(loc => loc.createdByRole === 'TOURIST_GUIDE');
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(loc =>
        loc.area.toLowerCase().includes(query) ||
        loc.state.toLowerCase().includes(query) ||
        loc.country.toLowerCase().includes(query) ||
        loc.description.toLowerCase().includes(query)
      );
    }

    // Apply sorting - Government content first, then by selected sort
    filtered.sort((a, b) => {
      // First priority: Government content
      if (a.createdByRole === 'GOVT_DEPARTMENT' && b.createdByRole !== 'GOVT_DEPARTMENT') return -1;
      if (a.createdByRole !== 'GOVT_DEPARTMENT' && b.createdByRole === 'GOVT_DEPARTMENT') return 1;
      
      // Second priority: State grouping for government content
      if (a.createdByRole === 'GOVT_DEPARTMENT' && b.createdByRole === 'GOVT_DEPARTMENT') {
        const stateCompare = a.state.localeCompare(b.state);
        if (stateCompare !== 0) return stateCompare;
      }
      
      // Third priority: Selected sort
      if (selectedSort === 'name') {
        return a.area.localeCompare(b.area);
      } else {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

    setFilteredLocations(filtered);
  };

  const getSourceBadge = (role: string) => {
    if (role === 'GOVT_DEPARTMENT') {
      return { label: 'Official Tourism', color: '#10b981', icon: '🏛️' };
    } else if (role === 'TOURIST_GUIDE') {
      return { label: 'Travel Agent', color: '#6366f1', icon: '✈️' };
    }
    return { label: 'Verified', color: '#6b7280', icon: '✓' };
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadLocations();
    setRefreshing(false);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleFilterChange = (filter: 'all' | 'approved' | 'pending') => {
    setSelectedFilter(filter);
    setFilterMenuVisible(false);
  };

  const handleSortChange = (sort: 'name' | 'recent') => {
    setSelectedSort(sort);
    setSortMenuVisible(false);
  };

  const renderLocation = ({ item }: { item: Location }) => {
    const sourceBadge = getSourceBadge(item.createdByRole);
    const isGovt = item.createdByRole === 'GOVT_DEPARTMENT';
    
    return (
      <TouchableOpacity 
        activeOpacity={0.9}
        onPress={() => router.push(`/(tabs)/location-detail?id=${item.id}`)}
        style={styles.cardWrapper}
      >
        <Card style={[styles.card, isGovt && styles.govtCard]} elevation={4}>
          <View style={styles.imageContainer}>
            {item.images && item.images.length > 0 ? (
              <>
                <Image 
                  source={{ uri: item.images[0] }} 
                  style={styles.image}
                  resizeMode="cover"
                />
                {/* Source Badge Overlay */}
                <View style={[styles.sourceBadgeOverlay, { backgroundColor: sourceBadge.color }]}>
                  <Text style={styles.sourceBadgeText}>
                    {sourceBadge.icon} {sourceBadge.label}
                  </Text>
                </View>
                <LinearGradient
                  colors={['transparent', 'rgba(0,0,0,0.8)']}
                  style={styles.imageGradient}
                >
                  <Text variant="headlineSmall" style={styles.imageTitle}>
                    {item.area}
                  </Text>
                  <View style={styles.imageLocation}>
                    <Text style={styles.imageLocationText}>
                      📍 {item.state}, {item.country}
                    </Text>
                  </View>
                </LinearGradient>
              </>
            ) : (
              <View style={styles.placeholderImage}>
                <Text style={styles.placeholderText}>🌍</Text>
                <Text style={styles.placeholderTitle}>{item.area}</Text>
              </View>
            )}
          </View>
          <Card.Content style={styles.cardContent}>
            <Text variant="bodyMedium" numberOfLines={3} style={styles.description}>
              {item.description}
            </Text>
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
  };

  if (loading) {
    return (
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.centerContainer}
      >
        <ActivityIndicator size="large" color="#ffffff" />
        <Text style={styles.loadingText}>Discovering amazing places...</Text>
      </LinearGradient>
    );
  }

  return (
    <View style={styles.container}>
      {!showWebLayout && (
        <View style={styles.mobileHeader}>
          <Text variant="headlineMedium" style={styles.mobileHeaderTitle}>
            Explore Locations
          </Text>
          <Text style={styles.mobileHeaderSubtitle}>
            Discover {filteredLocations.length} of {locations.length} destinations
          </Text>
          <Searchbar
            placeholder="Search destinations..."
            onChangeText={handleSearch}
            value={searchQuery}
            style={styles.searchBar}
            iconColor="#667eea"
            placeholderTextColor="#999"
          />
        </View>
      )}
      
      <FlatList
        data={filteredLocations}
        renderItem={renderLocation}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContent,
          showWebLayout && styles.webListContent,
          !showWebLayout && styles.mobileListContent
        ]}
        numColumns={showWebLayout ? numColumns : 1}
        key={`columns-${showWebLayout ? numColumns : 1}`}
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
                  Explore Locations
                </Text>
                <Text style={styles.webHeaderSubtitle}>
                  Discover {filteredLocations.length} of {locations.length} amazing destinations
                </Text>
              </View>
            </View>
            <View style={styles.filterRow}>
              <Searchbar
                placeholder="Search destinations..."
                onChangeText={handleSearch}
                value={searchQuery}
                style={styles.webSearchBar}
                iconColor="#667eea"
                placeholderTextColor="#999"
              />
              <View style={styles.filterButtons}>
                <Menu
                  visible={sourceMenuVisible}
                  onDismiss={() => setSourceMenuVisible(false)}
                  anchor={
                    <Button
                      mode="contained"
                      icon="shield-check"
                      onPress={() => setSourceMenuVisible(true)}
                      style={[styles.filterButton, styles.sourceFilterButton]}
                      buttonColor={sourceFilter === 'govt' ? '#10b981' : sourceFilter === 'agent' ? '#6366f1' : '#667eea'}
                    >
                      {sourceFilter === 'all' ? 'All Sources' : sourceFilter === 'govt' ? '🏛️ Official' : '✈️ Agents'}
                    </Button>
                  }
                >
                  <Menu.Item onPress={() => { setSourceFilter('all'); setSourceMenuVisible(false); }} title="All Sources" />
                  <Menu.Item onPress={() => { setSourceFilter('govt'); setSourceMenuVisible(false); }} title="🏛️ Official Tourism Only" />
                  <Menu.Item onPress={() => { setSourceFilter('agent'); setSourceMenuVisible(false); }} title="✈️ Travel Agents Only" />
                </Menu>
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
                <Menu
                  visible={sortMenuVisible}
                  onDismiss={() => setSortMenuVisible(false)}
                  anchor={
                    <Button
                      mode="outlined"
                      icon="sort"
                      onPress={() => setSortMenuVisible(true)}
                      style={styles.filterButton}
                    >
                      {selectedSort === 'name' ? 'A-Z' : 'Recent'}
                    </Button>
                  }
                >
                  <Menu.Item onPress={() => handleSortChange('name')} title="Sort by Name (A-Z)" />
                  <Menu.Item onPress={() => handleSortChange('recent')} title="Sort by Recent" />
                </Menu>
              </View>
            </View>
          </View>
        ) : null}
        ListFooterComponent={showWebLayout ? <WebFooter /> : null}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🗺️</Text>
            <Text variant="titleLarge" style={styles.emptyText}>
              No locations found
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
    paddingBottom: 160, // Extra padding to avoid FAB overlap
    width: '100%',
    maxWidth: '100%',
  },
  cardWrapper: {
    flex: 1,
    marginBottom: 16,
    marginHorizontal: 8,
    maxWidth: 400,
    width: '100%',
  },
  card: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#ffffff',
  },
  govtCard: {
    borderWidth: 2,
    borderColor: '#10b981',
  },
  imageContainer: {
    position: 'relative',
    height: 220,
  },
  sourceBadgeOverlay: {
    position: 'absolute',
    top: 12,
    right: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  sourceBadgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
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
  imageLocation: {
    flexDirection: 'row',
    alignItems: 'center',
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
  filterButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  filterButton: {
    borderColor: '#667eea',
  },
  sourceFilterButton: {
    marginRight: 8,
  },
});
