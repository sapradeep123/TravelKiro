import { useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { Text } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useAuth } from '../src/contexts/AuthContext';

export default function Index() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (isAuthenticated) {
        router.replace('/(tabs)/locations');
      } else {
        // Show explore page for non-authenticated users
        router.replace('/(public)/explore');
      }
    }
  }, [isAuthenticated, loading]);

  return (
    <View style={styles.container}>
      <Text variant="headlineLarge" style={styles.title}>
        🦋 Butterfliy
      </Text>
      <ActivityIndicator size="large" color="#6366f1" style={styles.loader} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  title: {
    color: '#6366f1',
    fontWeight: 'bold',
    marginBottom: 20,
  },
  loader: {
    marginTop: 20,
  },
});
