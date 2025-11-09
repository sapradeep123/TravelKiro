import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet, Image, RefreshControl, Alert, TouchableOpacity, useWindowDimensions, Platform, Modal, ScrollView } from 'react-native';
import { Card, Text, Chip, ActivityIndicator, Button, IconButton, Searchbar, Menu, TextInput, Portal, Dialog } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { eventService } from '../../src/services/eventService';
import { Event } from '../../src/types';
import { useAuth } from '../../src/contexts/AuthContext';
import WebFooter from '../../components/WebFooter';

export default function EventsScreen() {
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMenuVisible, setFilterMenuVisible] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'approved' | 'pending'>('all');
  const [callbackModalVisible, setCallbackModalVisible] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [callbackForm, setCallbackForm] = useState({
    name: '',
    phone: '',
    email: '',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();
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
    loadEvents();
  }, []);

  useEffect(() => {
    applyFiltersAndSort();
  }, [events, selectedFilter, searchQuery]);

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

  const applyFiltersAndSort = () => {
    let filtered = [...events];

    if (selectedFilter !== 'all') {
      filtered = filtered.filter(event => 
        event.approvalStatus === (selectedFilter === 'approved' ? 'APPROVED' : 'PENDING')
      );
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(event =>
        event.title.toLowerCase().includes(query) ||
        event.description.toLowerCase().includes(query)
      );
    }

    setFilteredEvents(filtered);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadEvents();
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
    const padding = 48; // Total horizontal padding (24 on each side)
    const gap = 16;
    const availableWidth = width - padding;
    
    if (numColumns === 1) return availableWidth - 16; // Extra margin for single column
    return (availableWidth - (gap * (numColumns - 1))) / numColumns - 16; // Account for card margins
  };

  const handleExpressInterest = (event: Event) => {
    setSelectedEvent(event);
    setCallbackForm({
      name: user?.profile?.name || '',
      phone: user?.profile?.phone || '',
      email: user?.email || '',
      message: '',
    });
    setCallbackModalVisible(true);
  };

  const handleSubmitCallback = async () => {
    if (!selectedEvent) return;

    if (!callbackForm.name.trim() || !callbackForm.phone.trim()) {
      Alert.alert('Error', 'Please provide your name and phone number');
      return;
    }

    try {
      setSubmitting(true);
      await eventService.createCallbackRequest(selectedEvent.id, {
        name: callbackForm.name,
        phone: callbackForm.phone,
        email: callbackForm.email,
        message: callbackForm.message,
      });
      
      Alert.alert(
        'Success!', 
        `Your callback request for "${selectedEvent.title}" has been submitted. The event host will contact you soon!`
      );
      
      setCallbackModalVisible(false);
      setCallbackForm({ name: '', phone: '', email: '', message: '' });
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error || 'Could not submit callback request');
    } finally {
      setSubmitting(false);
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

  const showEventDetails = (item: Event) => {
    // Navigate to event detail page
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      (window as any).location.href = `/event-detail?id=${item.id}`;
    } else {
      // For mobile, you would use router.push
      console.log('Navigate to event detail:', item.id);
    }
  };

  const renderEvent = ({ item }: { item: Event }) => (
    <TouchableOpacity 
      activeOpacity={0.9}
      style={styles.cardWrapper}
      onPress={() => showEventDetails(item)}
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
                <View style={styles.imageDateContainer}>
                  <Text style={styles.imageDateText}>
                    📅 {formatDate(item.startDate)}
                  </Text>
                </View>
              </LinearGradient>
            </>
          ) : (
            <View style={styles.placeholderImage}>
              <Text style={styles.placeholderText}>🎉</Text>
              <Text style={styles.placeholderTitle}>{item.title}</Text>
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
          {item.approvalStatus === 'APPROVED' && (
            <Button
              mode="contained"
              icon="phone"
              onPress={(e) => {
                e.stopPropagation();
                handleExpressInterest(item);
              }}
              style={styles.interestButton}
              labelStyle={styles.interestButtonLabel}
            >
              Request Callback
            </Button>
          )}
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
        <Text style={styles.loadingText}>Discovering amazing events...</Text>
      </LinearGradient>
    );
  }

  return (
    <View style={styles.container}>
      {!showWebLayout && (
        <View style={styles.mobileHeader}>
          <Text variant="headlineMedium" style={styles.mobileHeaderTitle}>
            Events & Festivals
          </Text>
          <Text style={styles.mobileHeaderSubtitle}>
            Discover {filteredEvents.length} of {events.length} events
          </Text>
          <Searchbar
            placeholder="Search events..."
            onChangeText={handleSearch}
            value={searchQuery}
            style={styles.searchBar}
            iconColor="#667eea"
            placeholderTextColor="#999"
          />
        </View>
      )}
      
      <FlatList
        data={filteredEvents}
        renderItem={renderEvent}
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
                  Events & Festivals
                </Text>
                <Text style={styles.webHeaderSubtitle}>
                  Discover {filteredEvents.length} of {events.length} amazing events
                </Text>
              </View>
            </View>
            <View style={styles.filterRow}>
              <Searchbar
                placeholder="Search events..."
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
            <Text style={styles.emptyIcon}>🎉</Text>
            <Text variant="titleLarge" style={styles.emptyText}>
              No events found
            </Text>
            <Text variant="bodyMedium" style={styles.emptySubtext}>
              Try adjusting your search or pull to refresh
            </Text>
          </View>
        }
      />

      {/* Callback Request Modal */}
      <Portal>
        <Dialog 
          visible={callbackModalVisible} 
          onDismiss={() => setCallbackModalVisible(false)}
          style={styles.dialog}
        >
          <Dialog.Title style={styles.dialogTitle}>Request Callback</Dialog.Title>
          <Dialog.Content>
            <ScrollView>
              {selectedEvent && (
                <View style={styles.eventInfo}>
                  <Text variant="titleMedium" style={styles.eventInfoTitle}>
                    {selectedEvent.title}
                  </Text>
                  <Text variant="bodySmall" style={styles.eventInfoDate}>
                    📅 {formatDate(selectedEvent.startDate)}
                  </Text>
                </View>
              )}
              
              <TextInput
                label="Your Name *"
                value={callbackForm.name}
                onChangeText={(text) => setCallbackForm({ ...callbackForm, name: text })}
                mode="outlined"
                style={styles.input}
                disabled={submitting}
              />
              
              <TextInput
                label="Phone Number *"
                value={callbackForm.phone}
                onChangeText={(text) => setCallbackForm({ ...callbackForm, phone: text })}
                mode="outlined"
                keyboardType="phone-pad"
                style={styles.input}
                disabled={submitting}
              />
              
              <TextInput
                label="Email (Optional)"
                value={callbackForm.email}
                onChangeText={(text) => setCallbackForm({ ...callbackForm, email: text })}
                mode="outlined"
                keyboardType="email-address"
                style={styles.input}
                disabled={submitting}
              />
              
              <TextInput
                label="Message (Optional)"
                value={callbackForm.message}
                onChangeText={(text) => setCallbackForm({ ...callbackForm, message: text })}
                mode="outlined"
                multiline
                numberOfLines={3}
                style={styles.input}
                disabled={submitting}
              />
              
              <Text variant="bodySmall" style={styles.helperText}>
                The event host will contact you at the provided phone number.
              </Text>
            </ScrollView>
          </Dialog.Content>
          <Dialog.Actions>
            <Button 
              onPress={() => setCallbackModalVisible(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button 
              onPress={handleSubmitCallback}
              mode="contained"
              loading={submitting}
              disabled={submitting}
            >
              Submit Request
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
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
    flex: 1,
    marginBottom: 16,
    marginHorizontal: 8,
    maxWidth: 400,
  },
  card: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#ffffff',
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
  imageDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  imageDateText: {
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
  interestButtonLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  dialog: {
    maxWidth: 500,
    alignSelf: 'center',
    width: '90%',
  },
  dialogTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  eventInfo: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  eventInfoTitle: {
    color: '#333',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  eventInfoDate: {
    color: '#666',
  },
  input: {
    marginBottom: 12,
  },
  helperText: {
    color: '#666',
    marginTop: 8,
    fontStyle: 'italic',
  },
});
