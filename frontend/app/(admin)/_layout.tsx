import { Stack, Redirect } from 'expo-router';
import { useAuth } from '../../src/contexts/AuthContext';
import { ActivityIndicator, View, Platform } from 'react-native';
import WebHeader from '../../components/WebHeader';
import WebFooter from '../../components/WebFooter';

export default function AdminLayout() {
  const { user, loading } = useAuth();
  const isWeb = Platform.OS === 'web';

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
    <View style={{ flex: 1 }}>
      {isWeb && <WebHeader />}
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="dashboard" />
        <Stack.Screen name="users" />
        <Stack.Screen name="upload-location" />
        <Stack.Screen name="approvals" />
      </Stack>
      {isWeb && <WebFooter />}
    </View>
  );
}
