import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet, Image, RefreshControl, Alert } from 'react-native';
import { Card, Text, Chip, ActivityIndicator, Button, IconButton } from 'react-native-paper';
import { eventService } from '../../src/services/eventService';
import { Event } from '../../src/types';
import { useAuth } from '../../src/contexts/AuthContext';

export default function EventsScreen() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const data = await eventService.getAllEvents();
      setEvents(data);
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadEvents();
    setRefreshing(false);
  };

  const handleExpressInterest = async (eventId: string, eventTitle: string) => {
    try {
      await eventService.expressInterest(eventId);
      Alert.alert('Success', `You expressed interest in "${eventTitle}". The host will contact you soon!`);
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error || 'Could not express interest');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const renderEvent = ({ item }: { item: Event }) => (
    <Card style={styles.card}>
      {item.images && item.images.length > 0 && (
        <Card.Cover source={{ uri: item.images[0] }} style={styles.image} />
      )}
      <Card.Content style={styles.cardContent}>
        <Text variant="titleLarge" style={styles.title}>
          {item.title}
        </Text>
        <View style={styles.dateContainer}>
          <IconButton icon="calendar" size={20} style={styles.iconButton} />
          <Text variant="bodyMedium" style={styles.dateText}>
            {formatDate(item.startDate)} - {formatDate(item.endDate)}
          </Text>
        </View>
        <Text variant="bodyMedium" numberOfLines={3} style={styles.description}>
          {item.description}
        </Text>
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
        <Text style={styles.loadingText}>Loading events...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={events}
        renderItem={renderEvent}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text variant="titleMedium" style={styles.emptyText}>
              No events found
            </Text>
            <Text variant="bodyMedium" style={styles.emptySubtext}>
              Check back later for upcoming events
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
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  iconButton: {
    margin: 0,
    marginLeft: -8,
  },
  dateText: {
    color: '#FF9800',
    fontWeight: '600',
  },
  description: {
    color: '#666',
    lineHeight: 20,
    marginBottom: 10,
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
