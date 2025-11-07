import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet, Image, RefreshControl } from 'react-native';
import { Card, Text, Searchbar, Chip, ActivityIndicator } from 'react-native-paper';
import { locationService } from '../../src/services/locationService';
import { Location } from '../../src/types';

export default function LocationsScreen() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadLocations();
  }, []);

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

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadLocations();
    setRefreshing(false);
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      try {
        const results = await locationService.searchLocations(query);
        setLocations(results);
      } catch (error) {
        console.error('Error searching:', error);
      }
    } else {
      loadLocations();
    }
  };

  const renderLocation = ({ item }: { item: Location }) => (
    <Card style={styles.card}>
      {item.images && item.images.length > 0 && (
        <Card.Cover source={{ uri: item.images[0] }} style={styles.image} />
      )}
      <Card.Content style={styles.cardContent}>
        <Text variant="titleLarge" style={styles.title}>
          {item.area}
        </Text>
        <View style={styles.locationInfo}>
          <Chip icon="map-marker" style={styles.chip} compact>
            {item.state}, {item.country}
          </Chip>
        </View>
        <Text variant="bodyMedium" numberOfLines={3} style={styles.description}>
          {item.description}
        </Text>
      </Card.Content>
    </Card>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Loading locations...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Search locations..."
        onChangeText={handleSearch}
        value={searchQuery}
        style={styles.searchBar}
      />
      <FlatList
        data={locations}
        renderItem={renderLocation}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text variant="titleMedium" style={styles.emptyText}>
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
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
  },
  searchBar: {
    margin: 10,
    elevation: 2,
  },
  listContent: {
    padding: 10,
  },
  card: {
    marginBottom: 15,
    elevation: 3,
  },
  image: {
    height: 200,
  },
  cardContent: {
    paddingTop: 15,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  locationInfo: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  chip: {
    marginRight: 5,
  },
  description: {
    color: '#666',
    lineHeight: 20,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 50,
  },
  emptyText: {
    color: '#666',
    marginBottom: 5,
  },
  emptySubtext: {
    color: '#999',
  },
});
