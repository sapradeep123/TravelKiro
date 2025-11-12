import React from 'react';
import { View, StyleSheet, Platform, TouchableOpacity, Text } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import UserProfileScreen from '../../components/community/UserProfileScreen';
import { useAuth } from '../../src/contexts/AuthContext';

// Declare window for web platform
declare const window: any;

export default function UserProfileRoute() {
  const router = useRouter();
  const { userId } = useLocalSearchParams();
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

  const handleEditProfile = () => {
    router.push('/(tabs)/profile-edit');
  };

  if (!userId || typeof userId !== 'string') {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={64} color="#ef4444" />
        <Text style={styles.errorText}>Invalid user ID</Text>
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
      </View>

      {/* User Profile Screen */}
      <UserProfileScreen
        userId={userId}
        currentUserId={user?.id}
        onPostPress={handlePostPress}
        onEditProfile={handleEditProfile}
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
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 8,
  },
  backText: {
    fontSize: 16,
    color: '#111827',
    fontWeight: '500',
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
