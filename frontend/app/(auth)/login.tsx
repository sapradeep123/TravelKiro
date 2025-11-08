import React, { useState } from 'react';
import { View, StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView, ImageBackground } from 'react-native';
import { TextInput, Button, Text, ActivityIndicator, Card } from 'react-native-paper';
import { useAuth } from '../../src/contexts/AuthContext';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      router.replace('/(tabs)/locations');
    } catch (error: any) {
      Alert.alert('Login Failed', error.response?.data?.error || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#667eea', '#764ba2', '#f093fb']}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <View style={styles.content}>
              {/* Logo/Icon Area */}
              <View style={styles.logoContainer}>
                <View style={styles.logoCircle}>
                  <Text style={styles.logoText}>🌍</Text>
                </View>
              </View>

              {/* Login Card */}
              <Card style={styles.card} elevation={5}>
                <Card.Content>
                  <Text variant="headlineMedium" style={styles.title}>
                    Welcome Back
                  </Text>
                  <Text variant="bodyMedium" style={styles.subtitle}>
                    Sign in to explore the world
                  </Text>

                  <TextInput
                    label="Email Address"
                    value={email}
                    onChangeText={setEmail}
                    mode="outlined"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    style={styles.input}
                    disabled={loading}
                    left={<TextInput.Icon icon="email" />}
                    outlineColor="#ddd"
                    activeOutlineColor="#667eea"
                  />

                  <TextInput
                    label="Password"
                    value={password}
                    onChangeText={setPassword}
                    mode="outlined"
                    secureTextEntry
                    style={styles.input}
                    disabled={loading}
                    left={<TextInput.Icon icon="lock" />}
                    outlineColor="#ddd"
                    activeOutlineColor="#667eea"
                  />

                  <Button
                    mode="contained"
                    onPress={handleLogin}
                    style={styles.button}
                    disabled={loading}
                    buttonColor="#667eea"
                    contentStyle={styles.buttonContent}
                  >
                    {loading ? <ActivityIndicator color="#fff" /> : 'Sign In'}
                  </Button>

                  <Button
                    mode="text"
                    onPress={() => router.push('/(auth)/register')}
                    disabled={loading}
                    textColor="#667eea"
                    style={styles.signupButton}
                  >
                    Don't have an account? Sign Up
                  </Button>
                </Card.Content>
              </Card>

              {/* Test Credentials */}
              <Card style={styles.credentialsCard} elevation={2}>
                <Card.Content>
                  <Text variant="labelLarge" style={styles.credentialsTitle}>
                    🔑 Test Credentials
                  </Text>
                  <View style={styles.credentialRow}>
                    <Text style={styles.credentialLabel}>Admin:</Text>
                    <Text style={styles.credentialValue}>admin@travelencyclopedia.com / admin123</Text>
                  </View>
                  <View style={styles.credentialRow}>
                    <Text style={styles.credentialLabel}>User:</Text>
                    <Text style={styles.credentialValue}>user@example.com / user123</Text>
                  </View>
                  <View style={styles.credentialRow}>
                    <Text style={styles.credentialLabel}>Guide:</Text>
                    <Text style={styles.credentialValue}>guide@example.com / guide123</Text>
                  </View>
                </Card.Content>
              </Card>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  content: {
    maxWidth: 450,
    width: '100%',
    alignSelf: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  logoText: {
    fontSize: 50,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    marginBottom: 20,
  },
  title: {
    textAlign: 'center',
    marginBottom: 8,
    marginTop: 10,
    color: '#333',
    fontWeight: 'bold',
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 30,
    color: '#666',
  },
  input: {
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  button: {
    marginTop: 10,
    marginBottom: 10,
    borderRadius: 12,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  signupButton: {
    marginTop: 5,
  },
  credentialsCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
  },
  credentialsTitle: {
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#667eea',
    textAlign: 'center',
  },
  credentialRow: {
    marginBottom: 8,
  },
  credentialLabel: {
    fontWeight: '600',
    color: '#333',
    fontSize: 12,
  },
  credentialValue: {
    color: '#666',
    fontSize: 11,
    marginTop: 2,
  },
});
