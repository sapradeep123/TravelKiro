import React from 'react';
import { View, StyleSheet, Platform, TouchableOpacity, Text } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import LocationFeedScreen from '../../components/community/LocationFeedScreen';
import { useAuth } from '../../src/contexts/AuthContext';

// Declare window for web platform
declare const window: any;

export default function LocationFeedRoute() {
  const router = useRouter();
  const { locationId, locationName } = useLocalSearchParams();
  const { user } = useAuth();

  const handleBack = () => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.history.back();
    } else {
      router.back();
    }
  };

  const handlePostPress = (postId: string) => {
    router.push(`/(tabs)/post-detail?id=${postId}`);
  };

  const handleUserPress = (userId: string) => {
    router.push(`/(tabs)/user-profile?userId=${userId}`);
  };

  if (!locationId || typeof locationId !== 'string') {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={64} color="#ef4444" />
        <Text style={styles.errorText}>Invalid location ID</Text>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Back Button */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {locationName || 'Location Feed'}
        </Text>
        <View style={styles.placeholder} />
      </View>

      {/* Location Feed Screen */}
      <LocationFeedScreen
        locationId={locationId}
        locationName={typeof locationName === 'string' ? locationName : undefined}
        currentUserId={user?.id}
        onPostPress={handlePostPress}
        onUserPress={handleUserPress}
        onBack={handleBack}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f2f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  backText: {
    fontSize: 16,
    color: '#111827',
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  placeholder: {
    width: 80,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f0f2f5',
  },
  errorText: {
    fontSize: 18,
    color: '#6b7280',
    marginTop: 16,
    marginBottom: 24,
  },
  backButton: {
    backgroundColor: '#667eea',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
