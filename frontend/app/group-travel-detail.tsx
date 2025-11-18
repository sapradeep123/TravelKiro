import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { router, useLocalSearchParams, Href } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { groupTravelService } from '../src/services/groupTravelService';
import { GroupTravel } from '../src/types';
import { useAuth } from '../src/contexts/AuthContext';

export default function GroupTravelDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const [groupTravel, setGroupTravel] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (id) {
      loadGroupTravel();
    }
  }, [id]);

  const loadGroupTravel = async () => {
    try {
      const response = await groupTravelService.getGroupTravelById(id);
      setGroupTravel(response.data);
    } catch (error) {
      console.error('Error loading group travel:', error);
      Alert.alert('Error', 'Failed to load group travel details');
    } finally {
      setLoading(false);
    }
  };

  const handleExpressInterest = async () => {
    if (!user) {
      Alert.alert('Login Required', 'Please login to express interest');
      return;
    }

    setActionLoading(true);
    try {
      await groupTravelService.expressInterest(id);
      Alert.alert('Success', 'Interest expressed successfully');
      loadGroupTravel();
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error || 'Failed to express interest');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSubmitBid = () => {
    if (!user) {
      Alert.alert('Login Required', 'Please login to submit a bid');
      return;
    }

    if (user.role !== 'TOURIST_GUIDE') {
      Alert.alert('Access Denied', 'Only tourist guides can submit bids');
      return;
    }

    router.push(`/submit-bid?groupTravelId=${id}` as Href);
  };

  const handleApproveBid = async (bidId: string) => {
    Alert.alert(
      'Approve Contact',
      'Allow this guide to contact you directly?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Approve',
          onPress: async () => {
            setActionLoading(true);
            try {
              await groupTravelService.approveBidContact(bidId);
              Alert.alert('Success', 'Contact approved successfully');
              loadGroupTravel();
            } catch (error: any) {
              Alert.alert('Error', error.response?.data?.error || 'Failed to approve contact');
            } finally {
              setActionLoading(false);
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const isCreator = user?.id === groupTravel?.creator?.id;
  const isInterested = groupTravel?.interestedUsers?.some(
    (interest: any) => interest.user.id === user?.id
  );
  const canSeeBids = isCreator || isInterested;

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (!groupTravel) {
    return (
      <View style={styles.centerContainer}>
        <Text>Group travel not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={28} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Group Travel</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>{groupTravel.title}</Text>
            <View style={[styles.statusBadge, groupTravel.status === 'OPEN' ? styles.statusOPEN : groupTravel.status === 'CLOSED' ? styles.statusCLOSED : styles.statusCOMPLETED]}>
              <Text style={styles.statusText}>{groupTravel.status}</Text>
            </View>
          </View>

          <Text style={styles.description}>{groupTravel.description}</Text>

          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={20} color="#666" />
            <Text style={styles.infoText}>
              Travel Date: {formatDate(groupTravel.travelDate)}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="time-outline" size={20} color="#666" />
            <Text style={styles.infoText}>
              Interest Expires: {formatDate(groupTravel.expiryDate)}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="person-outline" size={20} color="#666" />
            <Text style={styles.infoText}>
              Created by: {groupTravel.creator.profile.name}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Interested Users ({groupTravel.interestedUsers?.length || 0})
          </Text>
          {groupTravel.interestedUsers?.map((interest: any) => (
            <View key={interest.user.id} style={styles.userItem}>
              <Ionicons name="person-circle-outline" size={24} color="#007AFF" />
              <Text style={styles.userName}>{interest.user.profile.name}</Text>
            </View>
          ))}
        </View>

        {canSeeBids && groupTravel.bids && groupTravel.bids.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Bids ({groupTravel.bids.length})
            </Text>
            {groupTravel.bids.map((bid: any) => (
              <View key={bid.id} style={styles.bidCard}>
                <View style={styles.bidHeader}>
                  <Text style={styles.bidGuide}>{bid.guide.profile.name}</Text>
                  <Text style={styles.bidCost}>₹{bid.totalCost.toLocaleString()}</Text>
                </View>

                <View style={styles.bidDetail}>
                  <Text style={styles.bidLabel}>Duration:</Text>
                  <Text style={styles.bidValue}>{bid.numberOfDays} days</Text>
                </View>

                <View style={styles.bidDetail}>
                  <Text style={styles.bidLabel}>Accommodation:</Text>
                  <Text style={styles.bidValue}>{bid.accommodationDetails}</Text>
                </View>

                <View style={styles.bidDetail}>
                  <Text style={styles.bidLabel}>Food:</Text>
                  <Text style={styles.bidValue}>{bid.foodDetails}</Text>
                </View>

                <View style={styles.bidDetail}>
                  <Text style={styles.bidLabel}>Transport:</Text>
                  <Text style={styles.bidValue}>{bid.transportDetails}</Text>
                </View>

                {bid.dailyItinerary && bid.dailyItinerary.length > 0 && (
                  <View style={styles.itinerarySection}>
                    <Text style={styles.itineraryTitle}>Daily Itinerary:</Text>
                    {bid.dailyItinerary.map((day: any) => (
                      <View key={day.day} style={styles.dayItem}>
                        <Text style={styles.dayNumber}>Day {day.day}</Text>
                        <Text style={styles.dayText}>Activities: {day.activities}</Text>
                        <Text style={styles.dayText}>Meals: {day.meals}</Text>
                        <Text style={styles.dayText}>Stay: {day.accommodation}</Text>
                      </View>
                    ))}
                  </View>
                )}

                {isCreator && !bid.canContact && (
                  <TouchableOpacity
                    style={styles.approveButton}
                    onPress={() => handleApproveBid(bid.id)}
                    disabled={actionLoading}
                  >
                    <Text style={styles.approveButtonText}>Approve Contact</Text>
                  </TouchableOpacity>
                )}

                {bid.canContact && (
                  <View style={styles.approvedBadge}>
                    <Ionicons name="checkmark-circle" size={16} color="#34C759" />
                    <Text style={styles.approvedText}>Contact Approved</Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {groupTravel.status === 'OPEN' && user && !isCreator && (
        <View style={styles.footer}>
          {!isInterested && (
            <TouchableOpacity
              style={styles.interestButton}
              onPress={handleExpressInterest}
              disabled={actionLoading}
            >
              <Text style={styles.interestButtonText}>Express Interest</Text>
            </TouchableOpacity>
          )}

          {user.role === 'TOURIST_GUIDE' && (
            <TouchableOpacity
              style={styles.bidButton}
              onPress={handleSubmitBid}
              disabled={actionLoading}
            >
              <Text style={styles.bidButtonText}>Submit Bid</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
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
  content: {
    flex: 1,
  },
  section: {
    backgroundColor: '#FFF',
    padding: 16,
    marginBottom: 16,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusOPEN: {
    backgroundColor: '#34C759',
  },
  statusCLOSED: {
    backgroundColor: '#FF9500',
  },
  statusCOMPLETED: {
    backgroundColor: '#8E8E93',
  },
  statusText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
  description: {
    fontSize: 16,
    color: '#333',
    marginBottom: 16,
    lineHeight: 24,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 8,
  },
  userName: {
    fontSize: 16,
    color: '#333',
  },
  bidCard: {
    backgroundColor: '#F9F9F9',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  bidHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  bidGuide: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  bidCost: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#34C759',
  },
  bidDetail: {
    marginBottom: 8,
  },
  bidLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  bidValue: {
    fontSize: 14,
    color: '#333',
  },
  itinerarySection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  itineraryTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  dayItem: {
    marginBottom: 8,
    paddingLeft: 8,
  },
  dayNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 4,
  },
  dayText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  approveButton: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  approveButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  approvedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    marginTop: 12,
    gap: 4,
  },
  approvedText: {
    color: '#34C759',
    fontSize: 14,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    gap: 12,
  },
  interestButton: {
    flex: 1,
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  interestButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  bidButton: {
    flex: 1,
    backgroundColor: '#34C759',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  bidButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
