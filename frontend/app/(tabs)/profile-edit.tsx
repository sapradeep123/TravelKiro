import React from 'react';
import { View, StyleSheet, Platform, TouchableOpacity, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import ProfileEditScreen from '../../components/community/ProfileEditScreen';
import { useAuthGuard } from '../../src/hooks/useAuthGuard';

// Declare window for web platform
declare const window: any;

export default function ProfileEditRoute() {
  const router = useRouter();
  const { user, canAccess } = useAuthGuard({
    requireAuth: true,
    alertMessage: 'Please log in to edit your profile',
  });

  const handleBack = () => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.history.back();
    } else {
      router.back();
    }
  };

  const handleSaveSuccess = () => {
    router.back();
  };

  if (!canAccess) {
    return null;
  }

  return (
    <View style={styles.container}>
      {/* Back Button */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Profile Edit Screen */}
      <ProfileEditScreen />
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
  },
  placeholder: {
    width: 80,
  },
});
