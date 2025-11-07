import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet, RefreshControl, Alert, ScrollView } from 'react-native';
import { Card, Text, Chip, ActivityIndicator, Button, IconButton, Divider } from 'react-native-paper';
import { groupTravelService } from '../../src/services/groupTravelService';
import { GroupTravel } from '../../src/types';
import { useAuth } from '../../src/contexts/AuthContext';

export default function GroupTravelScreen() {
  const [groupTravels, setGroupTravels] = useState<GroupTravel[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    loadGroupTravels();
  }, []);

  const loadGroupTravels = async () => {
    try {
      setLoading(true);
      const data = await groupTravelService.getAllGroupTravels();
      setGroupTravels(data);
    } catch (error) {
      console.error('Error loading group travels:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadGroupTravels();
    setRefreshing(false);
  };

  const handleExpressInterest = async (id: string, title: string) => {
    try {
      await groupTravelService.expressInterest(id);
      Alert.alert('Success', `You expressed interest in "${title}". You'll be notified when bids are available!`);
      await loadGroupTravels();
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error || 'Could not express interest');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getDaysUntilTravel = (travelDate: string) => {
    const travel = new Date(travelDate);
    const now = new Date();
    const diffTime = travel.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const renderGroupTravel = ({ item }: { item: GroupTravel }) => {
    const daysUntil = getDaysUntilTravel(item.travelDate);
    const isExpired = new Date(item.expiryDate) < new Date();

    return (
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.header}>
            <Text variant="titleLarge" style={styles.title}>
              {item.title}
            </Text>
            {item.status === 'OPEN' && !isExpired ? (
              <Chip icon="check-circle" style={styles.openChip} textStyle={styles.chipText}>
                Open
              </Chip>
            ) : (
              <Chip icon="close-circle" style={styles.closedChip} textStyle={styles.chipText}>
                Closed
              </Chip>
            )}
          </View>

          <View style={styles.creatorInfo}>
            <IconButton icon="account" size={20} style={styles.icon} />
            <Text variant="bodyMedium" style={styles.creatorText}>
              Organized by {item.creator.profile.name}
            </Text>
          </View>

          <Text variant="bodyMedium" numberOfLines={3} style={styles.description}>
            {item.description}
          </Text>

          <View style={styles.infoSection}>
            <View style={styles.infoRow}>
              <IconButton icon="calendar" size={20} style={styles.icon} />
              <View>
                <Text variant="labelSmall" style={styles.label}>
                  Travel Date
                </Text>
                <Text variant="bodyMedium" style={styles.dateText}>
                  {formatDate(item.travelDate)}
                </Text>
                {daysUntil > 0 && (
                  <Text variant="bodySmall" style={styles.daysText}>
                    {daysUntil} days away
                  </Text>
                )}
              </View>
            </View>

            <View style={styles.infoRow}>
              <IconButton icon="clock-alert" size={20} style={styles.icon} />
              <View>
                <Text variant="labelSmall" style={styles.label}>
                  Interest Deadline
                </Text>
                <Text variant="bodyMedium" style={styles.dateText}>
                  {formatDate(item.expiryDate)}
                </Text>
                {isExpired && (
                  <Text variant="bodySmall" style={styles.expiredText}>
                    Expired
                  </Text>
                )}
              </View>
            </View>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <IconButton icon="account-multiple" size={20} style={styles.icon} />
              <Text variant="bodyMedium">
                {item.interestedUsers.length} Interested
              </Text>
            </View>
            <View style={styles.stat}>
              <IconButton icon="briefcase" size={20} style={styles.icon} />
              <Text variant="bodyMedium">
                {item.bids.length} Bids
              </Text>
            </View>
          </View>

          {item.bids.length > 0 && (
            <View style={styles.bidsSection}>
              <Divider style={styles.divider} />
              <Text variant="labelLarge" style={styles.bidsTitle}>
                Available Bids:
              </Text>
              {item.bids.slice(0, 2).map((bid) => (
                <View key={bid.id} style={styles.bidPreview}>
                  <Text variant="bodyMedium" style={styles.bidGuide}>
                    {bid.guide.profile.name}
                  </Text>
                  <Text variant="bodySmall" style={styles.bidDetails}>
                    {bid.numberOfDays} days • ₹{bid.totalCost.toLocaleString()}
                  </Text>
                </View>
              ))}
              {item.bids.length > 2 && (
                <Text variant="bodySmall" style={styles.moreBids}>
                  +{item.bids.length - 2} more bids
                </Text>
              )}
            </View>
          )}
        </Card.Content>

        <Card.Actions>
          {item.status === 'OPEN' && !isExpired && (
            <Button
              mode="contained"
              onPress={() => handleExpressInterest(item.id, item.title)}
              disabled={item.interestedUsers.some((u: any) => u.userId === user?.id)}
            >
              {item.interestedUsers.some((u: any) => u.userId === user?.id)
                ? 'Already Interested'
                : 'Express Interest'}
            </Button>
          )}
          {user?.role === 'TOURIST_GUIDE' && item.status === 'OPEN' && !isExpired && (
            <Button mode="outlined" icon="briefcase">
              Submit Bid
            </Button>
          )}
        </Card.Actions>
      </Card>
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Loading group travels...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={groupTravels}
        renderItem={renderGroupTravel}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text variant="titleMedium" style={styles.emptyText}>
              No group travels found
            </Text>
            <Text variant="bodyMedium" style={styles.emptySubtext}>
              Create a group travel request to find travel companions!
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  title: {
    fontWeight: 'bold',
    flex: 1,
    marginRight: 10,
  },
  openChip: {
    backgroundColor: '#4CAF50',
  },
  closedChip: {
    backgroundColor: '#F44336',
  },
  chipText: {
    color: '#fff',
    fontSize: 11,
  },
  creatorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  icon: {
    margin: 0,
    marginLeft: -8,
  },
  creatorText: {
    color: '#666',
  },
  description: {
    color: '#666',
    lineHeight: 20,
    marginBottom: 15,
  },
  infoSection: {
    backgroundColor: '#f9f9f9',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  label: {
    color: '#999',
    marginBottom: 2,
  },
  dateText: {
    color: '#2196F3',
    fontWeight: '600',
  },
  daysText: {
    color: '#4CAF50',
    marginTop: 2,
  },
  expiredText: {
    color: '#F44336',
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  bidsSection: {
    marginTop: 10,
  },
  divider: {
    marginBottom: 10,
  },
  bidsTitle: {
    marginBottom: 8,
    color: '#2196F3',
  },
  bidPreview: {
    backgroundColor: '#e3f2fd',
    padding: 10,
    borderRadius: 8,
    marginBottom: 5,
  },
  bidGuide: {
    fontWeight: 'bold',
    marginBottom: 3,
  },
  bidDetails: {
    color: '#666',
  },
  moreBids: {
    color: '#2196F3',
    fontStyle: 'italic',
    marginTop: 5,
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
    textAlign: 'center',
    paddingHorizontal: 20,
  },
});
