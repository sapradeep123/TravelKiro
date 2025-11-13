/**
 * Photo Management Test Screen
 * Navigate to this screen to test the photo management functionality
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import PhotoManagementTest from '../../components/community/PhotoManagementTest';

export default function PhotoTestScreen() {
  return (
    <View style={styles.container}>
      <PhotoManagementTest />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
