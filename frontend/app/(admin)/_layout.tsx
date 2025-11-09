import { Stack, Redirect } from 'expo-router';
import { useAuth } from '../../src/contexts/AuthContext';
import { ActivityIndicator, View } from 'react-native';

export default function AdminLayout() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  // Only SITE_ADMIN and GOVT_DEPARTMENT can access admin routes
  if (!user || (user.role !== 'SITE_ADMIN' && user.role !== 'GOVT_DEPARTMENT')) {
    return <Redirect href="/(tabs)" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="dashboard" />
      <Stack.Screen name="users" />
      <Stack.Screen name="upload-location" />
      <Stack.Screen name="manage-locations" />
      <Stack.Screen name="edit-location" />
      <Stack.Screen name="manage-events" />
      <Stack.Screen name="create-event" />
      <Stack.Screen name="edit-event" />
      <Stack.Screen name="manage-event-types" />
      <Stack.Screen name="packages" />
      <Stack.Screen name="approvals" />
    </Stack>
  );
}
