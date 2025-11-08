import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import WebHeader from '../../components/WebHeader';

export default function AdminDashboard() {
  const router = useRouter();
  const { user } = useAuth();
  const isWeb = Platform.OS === 'web';

  const adminCards = [
    {
      id: 'users',
      title: 'User Management',
      description: 'Manage users, reset passwords, and view user details',
      icon: 'people',
      color: '#6366f1',
      route: '/(admin)/users',
      roles: ['SITE_ADMIN']
    },
    {
      id: 'locations',
      title: 'Upload Location',
      description: 'Add new tourist destinations and locations',
      icon: 'location',
      color: '#10b981',
      route: '/(admin)/upload-location',
      roles: ['SITE_ADMIN', 'GOVT_DEPARTMENT']
    },
    {
      id: 'approvals',
      title: 'Content Approvals',
      description: 'Review and approve pending content submissions',
      icon: 'checkmark-circle',
      color: '#f59e0b',
      route: '/(admin)/approvals',
      roles: ['SITE_ADMIN']
    },
    {
      id: 'events',
      title: 'Manage Events',
      description: 'View and manage all events',
      icon: 'calendar',
      color: '#ec4899',
      route: '/(admin)/events',
      roles: ['SITE_ADMIN', 'GOVT_DEPARTMENT']
    },
    {
      id: 'packages',
      title: 'Manage Packages',
      description: 'View and manage travel packages',
      icon: 'briefcase',
      color: '#8b5cf6',
      route: '/(admin)/packages',
      roles: ['SITE_ADMIN', 'GOVT_DEPARTMENT']
    },
    {
      id: 'accommodations',
      title: 'Manage Accommodations',
      description: 'View and manage hotels, restaurants, resorts',
      icon: 'bed',
      color: '#06b6d4',
      route: '/(admin)/accommodations',
      roles: ['SITE_ADMIN', 'GOVT_DEPARTMENT']
    }
  ];

  const filteredCards = adminCards.filter(card => 
    card.roles.includes(user?.role || '')
  );

  return (
    <View style={styles.container}>
      {isWeb && <WebHeader />}
      <ScrollView style={styles.content}>
        <View style={[styles.contentInner, isWeb && styles.webContent]}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Admin Dashboard</Text>
          <Text style={styles.subtitle}>
            Welcome, {user?.role === 'SITE_ADMIN' ? 'Super Admin' : 'Tourism Department'}
          </Text>
        </View>

        {/* Stats Cards */}
        <View style={[styles.statsContainer, isWeb && styles.webStatsContainer]}>
          {filteredCards.map((card) => (
            <TouchableOpacity
              key={card.id}
              style={[styles.card, isWeb && styles.webCard]}
              onPress={() => router.push(card.route as any)}
            >
              <View style={[styles.iconContainer, { backgroundColor: card.color + '20' }]}>
                <Ionicons name={card.icon as any} size={32} color={card.color} />
              </View>
              <Text style={styles.cardTitle}>{card.title}</Text>
              <Text style={styles.cardDescription}>{card.description}</Text>
              <View style={styles.cardFooter}>
                <Text style={[styles.cardAction, { color: card.color }]}>
                  Open
                </Text>
                <Ionicons name="arrow-forward" size={16} color={card.color} />
              </View>
            </TouchableOpacity>
          ))}
        </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  content: {
    flex: 1,
  },
  contentInner: {
    padding: 20,
  },
  webContent: {
    maxWidth: 1200,
    marginHorizontal: 'auto',
    width: '100%',
  },
  header: {
    marginBottom: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
  },
  statsContainer: {
    gap: 20,
  },
  webStatsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 20,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  webCard: {
    width: '32%' as any,
    minWidth: 280,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
    lineHeight: 20,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardAction: {
    fontSize: 14,
    fontWeight: '600',
  },
});
