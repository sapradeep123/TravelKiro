import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Button, Card, Avatar, Divider } from 'react-native-paper';
import { useAuth } from '../../src/contexts/AuthContext';
import { useRouter } from 'expo-router';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.replace('/(auth)/login');
  };

  if (!user) {
    return null;
  }

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.profileCard}>
        <Card.Content style={styles.profileContent}>
          <Avatar.Text
            size={80}
            label={user.profile.name.substring(0, 2).toUpperCase()}
            style={styles.avatar}
          />
          <Text variant="headlineSmall" style={styles.name}>
            {user.profile.name}
          </Text>
          <Text variant="bodyMedium" style={styles.email}>
            {user.email}
          </Text>
          <View style={styles.roleContainer}>
            <Text variant="labelLarge" style={styles.roleLabel}>
              Role:
            </Text>
            <Text variant="bodyLarge" style={styles.role}>
              {user.role.replace('_', ' ')}
            </Text>
          </View>
        </Card.Content>
      </Card>

      {user.profile.bio && (
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Bio
            </Text>
            <Text variant="bodyMedium" style={styles.bio}>
              {user.profile.bio}
            </Text>
          </Card.Content>
        </Card>
      )}

      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Contact Information
          </Text>
          <Divider style={styles.divider} />
          {user.profile.phone && (
            <View style={styles.infoRow}>
              <Text variant="labelLarge">Phone:</Text>
              <Text variant="bodyMedium">{user.profile.phone}</Text>
            </View>
          )}
          {user.profile.stateAssignment && (
            <View style={styles.infoRow}>
              <Text variant="labelLarge">State Assignment:</Text>
              <Text variant="bodyMedium">{user.profile.stateAssignment}</Text>
            </View>
          )}
        </Card.Content>
      </Card>

      {(user.role === 'SITE_ADMIN' || user.role === 'GOVT_DEPARTMENT') && (
        <Button
          mode="contained"
          onPress={() => router.push('/(admin)/dashboard' as any)}
          style={styles.adminButton}
          buttonColor="#6366f1"
          icon="shield-account"
        >
          Admin Dashboard
        </Button>
      )}

      <Button
        mode="contained"
        onPress={handleLogout}
        style={styles.logoutButton}
        buttonColor="#F44336"
      >
        Logout
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  profileCard: {
    margin: 15,
    elevation: 3,
  },
  profileContent: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  avatar: {
    backgroundColor: '#2196F3',
    marginBottom: 15,
  },
  name: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  email: {
    color: '#666',
    marginBottom: 10,
  },
  roleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  roleLabel: {
    marginRight: 5,
    color: '#666',
  },
  role: {
    color: '#2196F3',
    fontWeight: 'bold',
  },
  card: {
    margin: 15,
    marginTop: 0,
    elevation: 3,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 10,
  },
  bio: {
    color: '#666',
    lineHeight: 20,
  },
  divider: {
    marginVertical: 10,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  adminButton: {
    margin: 15,
    marginTop: 10,
  },
  logoutButton: {
    margin: 15,
    marginTop: 10,
  },
});
