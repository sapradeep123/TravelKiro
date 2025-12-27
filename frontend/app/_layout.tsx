import { Stack } from 'expo-router';
import { PaperProvider } from 'react-native-paper';
import { AuthProvider } from '../src/contexts/AuthContext';
import { View, StyleSheet } from 'react-native';
import TravelChatbot from '../components/TravelChatbot';

export default function RootLayout() {
  return (
    <PaperProvider>
      <AuthProvider>
        <View style={styles.container}>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="(public)" />
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(tabs)" />
          </Stack>
          <TravelChatbot />
        </View>
      </AuthProvider>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
