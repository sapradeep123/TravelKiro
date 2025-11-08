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
    <Stack>
      <Stack.Screen 
        name="dashboard" 
        options={{ 
          title: 'Admin Dashboard',
          headerShown: true 
        }} 
      />
      <Stack.Screen 
        name="users" 
        options={{ 
          title: 'User Management',
          headerShown: true 
        }} 
      />
      <Stack.Screen 
        name="upload-location" 
        options={{ 
          title: 'Upload Location',
          headerShown: true 
        }} 
      />
      <Stack.Screen 
        name="approvals" 
        options={{ 
          title: 'Content Approvals',
          headerShown: true 
        }} 
      />
    </Stack>
  );
}
