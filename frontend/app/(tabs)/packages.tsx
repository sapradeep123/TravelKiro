import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet, RefreshControl, Alert } from 'react-native';
import { Card, Text, Chip, ActivityIndicator, Button, IconButton } from 'react-native-paper';
import { packageService } from '../../src/services/packageService';
import { Package } from '../../src/types';

export default function PackagesScreen() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadPackages();
  }, []);

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

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadPackages();
    setRefreshing(false);
  };

  const handleExpressInterest = async (packageId: string, packageTitle: string) => {
    try {
      await packageService.expressInterest(packageId);
      Alert.alert('Success', `You expressed interest in "${packageTitle}". The host will contact you soon!`);
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error || 'Could not express interest');
    }
  };

  const renderPackage = ({ item }: { item: Package }) => (
    <Card style={styles.card}>
      {item.images && item.images.length > 0 && (
        <Card.Cover source={{ uri: item.images[0] }} style={styles.image} />
      )}
      <Card.Content style={styles.cardContent}>
        <Text variant="titleLarge" style={styles.title}>
          {item.title}
        </Text>
        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <IconButton icon="calendar-range" size={20} style={styles.iconButton} />
            <Text variant="bodyMedium" style={styles.infoText}>
              {item.duration} Days
            </Text>
          </View>
          <View style={styles.infoItem}>
            <IconButton icon="currency-inr" size={20} style={styles.iconButton} />
            <Text variant="bodyMedium" style={styles.priceText}>
              ₹{item.price.toLocaleString()}
            </Text>
          </View>
        </View>
        <Text variant="bodyMedium" numberOfLines={3} style={styles.description}>
          {item.description}
        </Text>
        {item.itinerary && item.itinerary.length > 0 && (
          <View style={styles.itineraryPreview}>
            <Text variant="labelLarge" style={styles.itineraryLabel}>
              Itinerary Highlights:
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
        {item.approvalStatus === 'PENDING' && (
          <Chip icon="clock" style={styles.pendingChip} textStyle={styles.chipText}>
            Pending Approval
          </Chip>
        )}
      </Card.Content>
      <Card.Actions>
        <Button 
          mode="contained" 
          onPress={() => handleExpressInterest(item.id, item.title)}
          disabled={item.approvalStatus !== 'APPROVED'}
        >
          Express Interest
        </Button>
      </Card.Actions>
    </Card>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Loading packages...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={packages}
        renderItem={renderPackage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text variant="titleMedium" style={styles.emptyText}>
              No packages found
            </Text>
            <Text variant="bodyMedium" style={styles.emptySubtext}>
              Check back later for travel packages
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
  infoRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  iconButton: {
    margin: 0,
    marginLeft: -8,
  },
  infoText: {
    color: '#666',
    fontWeight: '600',
  },
  priceText: {
    color: '#4CAF50',
    fontWeight: 'bold',
    fontSize: 16,
  },
  description: {
    color: '#666',
    lineHeight: 20,
    marginBottom: 10,
  },
  itineraryPreview: {
    backgroundColor: '#e3f2fd',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  itineraryLabel: {
    marginBottom: 5,
    color: '#2196F3',
  },
  itineraryItem: {
    color: '#666',
    marginBottom: 3,
  },
  moreText: {
    color: '#2196F3',
    fontStyle: 'italic',
    marginTop: 3,
  },
  pendingChip: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFC107',
  },
  chipText: {
    color: '#000',
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
