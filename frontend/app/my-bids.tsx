import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { router, Href } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { groupTravelService } from '../src/services/groupTravelService';
import { TravelBid } from '../src/types';

export default function MyBidsScreen() {
  const [bids, setBids] = useState<TravelBid[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadBids();
  }, []);

  const loadBids = async () => {
    try {
      const response = await groupTravelService.getMyBids();
      setBids(response.data);
    } catch (error) {
      console.error('Error loading bids:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadBids();
  };

  const renderBid = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/group-travel-detail?id=${item.groupTravel.id}` as Href)}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.title}>{item.groupTravel.title}</Text>
        {item.canContact && (
          <View style={styles.approvedBadge}>
            <Ionicons name="checkmark-circle" size={16} color="#34C759" />
          </View>
        )}
      </View>

      <View style={styles.infoRow}>
        <Ionicons name="person-outline" size={16} color="#666" />
        <Text style={styles.infoText}>
          Created by: {item.groupTravel.creator.profile.name}
        </Text>
      </View>

      <View style={styles.bidDetails}>
        <View style={styles.bidRow}>
          <Text style={styles.bidLabel}>Your Bid:</Text>
          <Text style={styles.bidValue}>₹{item.totalCost.toLocaleString()}</Text>
        </View>
        <View style={styles.bidRow}>
          <Text style={styles.bidLabel}>Duration:</Text>
          <Text style={styles.bidValue}>{item.numberOfDays} days</Text>
        </View>
      </View>

      {item.canContact ? (
        <View style={styles.statusRow}>
          <Ionicons name="checkmark-circle" size={20} color="#34C759" />
          <Text style={styles.approvedText}>Contact Approved</Text>
        </View>
      ) : (
        <View style={styles.statusRow}>
          <Ionicons name="time-outline" size={20} color="#FF9500" />
          <Text style={styles.pendingText}>Awaiting Approval</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={28} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Bids</Text>
        <View style={{ width: 28 }} />
      </View>

      <FlatList
        data={bids}
        renderItem={renderBid}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="briefcase-outline" size={64} color="#CCC" />
            <Text style={styles.emptyText}>No bids submitted yet</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  listContent: {
    padding: 16,
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 8,
  },
  approvedBadge: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
  },
  bidDetails: {
    backgroundColor: '#F9F9F9',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  bidRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  bidLabel: {
    fontSize: 14,
    color: '#666',
  },
  bidValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  approvedText: {
    fontSize: 14,
    color: '#34C759',
    fontWeight: '600',
  },
  pendingText: {
    fontSize: 14,
    color: '#FF9500',
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 16,
  },
});
