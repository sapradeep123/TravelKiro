import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';

export default function PackagesScreen() {
  return (
    <View style={styles.container}>
      <Text variant="headlineMedium">Packages</Text>
      <Text variant="bodyLarge" style={styles.subtitle}>
        Coming soon...
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  subtitle: {
    marginTop: 10,
    color: '#666',
  },
});
