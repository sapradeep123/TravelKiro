import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useIsOnline } from '../hooks/useNetworkStatus';

/**
 * Component that displays an offline indicator banner when network is unavailable
 */
export default function OfflineIndicator() {
  const isOnline = useIsOnline();

  if (isOnline) {
    return null;
  }

  return (
    <View style={styles.container}>
      <MaterialCommunityIcons name="wifi-off" size={16} color="#fff" />
      <Text style={styles.text}>No internet connection</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ef4444',
    paddingVertical: 8,
    paddingHorizontal: 16,
    gap: 8,
    ...Platform.select({
      web: {
        position: 'sticky' as any,
        top: 0,
        zIndex: 9999,
      },
    }),
  },
  text: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
