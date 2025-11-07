import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet, RefreshControl, Linking, Alert } from 'react-native';
import { Card, Text, Chip, ActivityIndicator, Button, IconButton, SegmentedButtons } from 'react-native-paper';
import { accommodationService } from '../../src/services/accommodationService';
import { Accommodation } from '../../src/types';

export default function AccommodationsScreen() {
  const [accommodations, setAccommodations] = useState<Accommodation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedType, setSelectedType] = useState<'ALL' | 'HOTEL' | 'RESTAURANT' | 'RESORT'>('ALL');

  useEffect(() => {
    loadAccommodations();
  }, [selectedType]);

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

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadAccommodations();
    setRefreshing(false);
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

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'HOTEL':
        return 'bed';
      case 'RESTAURANT':
        return 'silverware-fork-knife';
      case 'RESORT':
        return 'palm-tree';
      default:
        return 'home';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'HOTEL':
        return '#2196F3';
      case 'RESTAURANT':
        return '#FF9800';
      case 'RESORT':
        return '#4CAF50';
      default:
        return '#666';
    }
  };

  const renderAccommodation = ({ item }: { item: Accommodation }) => (
    <Card style={styles.card}>
      {item.images && item.images.length > 0 && (
        <Card.Cover source={{ uri: item.images[0] }} style={styles.image} />
      )}
      <Card.Content style={styles.cardContent}>
        <View style={styles.header}>
          <Text variant="titleLarge" style={styles.title}>
            {item.name}
          </Text>
          {item.isGovtApproved && (
            <Chip icon="check-decagram" style={styles.govtBadge} textStyle={styles.badgeText}>
              Govt Approved
            </Chip>
          )}
        </View>

        <View style={styles.typeContainer}>
          <IconButton
            icon={getTypeIcon(item.type)}
            iconColor={getTypeColor(item.type)}
            size={20}
            style={styles.typeIcon}
          />
          <Text variant="bodyMedium" style={[styles.typeText, { color: getTypeColor(item.type) }]}>
            {item.type}
          </Text>
        </View>

        <Text variant="bodyMedium" numberOfLines={3} style={styles.description}>
          {item.description}
        </Text>

        <View style={styles.contactSection}>
          <Text variant="labelLarge" style={styles.contactTitle}>
            Contact Information:
          </Text>
          
          <View style={styles.contactItem}>
            <IconButton icon="phone" size={20} style={styles.contactIcon} />
            <Text variant="bodyMedium" style={styles.contactText}>
              {item.contactPhone}
            </Text>
          </View>

          {item.contactEmail && (
            <View style={styles.contactItem}>
              <IconButton icon="email" size={20} style={styles.contactIcon} />
              <Text variant="bodyMedium" style={styles.contactText}>
                {item.contactEmail}
              </Text>
            </View>
          )}

          <View style={styles.contactItem}>
            <IconButton icon="map-marker" size={20} style={styles.contactIcon} />
            <Text variant="bodyMedium" style={styles.contactText} numberOfLines={2}>
              {item.contactAddress}
            </Text>
          </View>
        </View>
      </Card.Content>
      <Card.Actions style={styles.actions}>
        <Button
          mode="outlined"
          icon="phone"
          onPress={() => handleCall(item.contactPhone)}
          style={styles.actionButton}
        >
          Call
        </Button>
        {item.contactEmail && (
          <Button
            mode="outlined"
            icon="email"
            onPress={() => handleEmail(item.contactEmail!)}
            style={styles.actionButton}
          >
            Email
          </Button>
        )}
        {item.contactWebsite && (
          <Button
            mode="contained"
            icon="web"
            onPress={() => handleWebsite(item.contactWebsite!)}
            style={styles.actionButton}
          >
            Website
          </Button>
        )}
      </Card.Actions>
    </Card>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Loading accommodations...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.filterContainer}>
        <SegmentedButtons
          value={selectedType}
          onValueChange={(value) => setSelectedType(value as any)}
          buttons={[
            { value: 'ALL', label: 'All' },
            { value: 'HOTEL', label: 'Hotels', icon: 'bed' },
            { value: 'RESTAURANT', label: 'Restaurants', icon: 'silverware-fork-knife' },
            { value: 'RESORT', label: 'Resorts', icon: 'palm-tree' },
          ]}
          style={styles.segmentedButtons}
        />
      </View>

      <FlatList
        data={accommodations}
        renderItem={renderAccommodation}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text variant="titleMedium" style={styles.emptyText}>
              No {selectedType !== 'ALL' ? selectedType.toLowerCase() + 's' : 'accommodations'} found
            </Text>
            <Text variant="bodyMedium" style={styles.emptySubtext}>
              Try selecting a different category
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
  filterContainer: {
    padding: 10,
    backgroundColor: '#fff',
    elevation: 2,
  },
  segmentedButtons: {
    marginBottom: 5,
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  title: {
    fontWeight: 'bold',
    flex: 1,
    marginRight: 10,
  },
  govtBadge: {
    backgroundColor: '#4CAF50',
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
  },
  typeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  typeIcon: {
    margin: 0,
    marginLeft: -8,
  },
  typeText: {
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  description: {
    color: '#666',
    lineHeight: 20,
    marginBottom: 15,
  },
  contactSection: {
    backgroundColor: '#f9f9f9',
    padding: 10,
    borderRadius: 8,
  },
  contactTitle: {
    marginBottom: 8,
    color: '#2196F3',
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  contactIcon: {
    margin: 0,
    marginLeft: -8,
  },
  contactText: {
    color: '#666',
    flex: 1,
  },
  actions: {
    flexWrap: 'wrap',
    paddingHorizontal: 8,
  },
  actionButton: {
    marginHorizontal: 4,
    marginVertical: 4,
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
