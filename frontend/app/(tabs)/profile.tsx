import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { Text } from 'react-native-paper';
import { useAuth } from '../../src/contexts/AuthContext';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const isWeb = Platform.OS === 'web';

  const handleLogout = async () => {
    await logout();
    router.replace('/(auth)/login');
  };

  if (!user) {
    return null;
  }

  const isAdmin = user.role === 'SITE_ADMIN' || user.role === 'GOVT_DEPARTMENT';

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'SITE_ADMIN': return 'Super Admin';
      case 'GOVT_DEPARTMENT': return 'Tourism Department';
      case 'TOURIST_GUIDE': return 'Tourist Guide';
      default: return 'User';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'SITE_ADMIN': return '#6366f1';
      case 'GOVT_DEPARTMENT': return '#10b981';
      case 'TOURIST_GUIDE': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  const adminOptions = [
    {
      id: 'users',
      title: 'User Management',
      description: 'Manage users and reset passwords',
      icon: 'people',
      color: '#6366f1',
      route: '/(admin)/users',
      roles: ['SITE_ADMIN']
    },
    {
      id: 'upload',
      title: 'Upload Location',
      description: 'Add new tourist destinations',
      icon: 'location',
      color: '#10b981',
      route: '/(admin)/upload-location',
      roles: ['SITE_ADMIN', 'GOVT_DEPARTMENT']
    },
    {
      id: 'approvals',
      title: 'Content Approvals',
      description: 'Review pending submissions',
      icon: 'checkmark-circle',
      color: '#f59e0b',
      route: '/(admin)/approvals',
      roles: ['SITE_ADMIN']
    },
    {
      id: 'dashboard',
      title: 'Full Dashboard',
      description: 'Access complete admin panel',
      icon: 'grid',
      color: '#8b5cf6',
      route: '/(admin)/dashboard',
      roles: ['SITE_ADMIN', 'GOVT_DEPARTMENT']
    }
  ];

  const filteredAdminOptions = adminOptions.filter(option => 
    option.roles.includes(user.role)
  );

  return (
    <ScrollView style={styles.container}>
      <View style={[styles.content, isWeb && styles.webContent]}>
        {/* Profile Header with Gradient */}
        <LinearGradient
          colors={[getRoleColor(user.role), getRoleColor(user.role) + 'dd']}
          style={styles.profileHeader}
        >
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user.profile.name.substring(0, 2).toUpperCase()}
              </Text>
            </View>
          </View>
          <Text style={styles.name}>{user.profile.name}</Text>
          <Text style={styles.email}>{user.email}</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleBadgeText}>{getRoleLabel(user.role)}</Text>
          </View>
        </LinearGradient>

        {/* Admin Section */}
        {isAdmin && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="shield-checkmark" size={24} color="#6366f1" />
              <Text style={styles.sectionTitle}>Admin Tools</Text>
            </View>
            <View style={[styles.adminGrid, isWeb && styles.webAdminGrid]}>
              {filteredAdminOptions.map(option => (
                <TouchableOpacity
                  key={option.id}
                  style={[styles.adminCard, isWeb && styles.webAdminCard]}
                  onPress={() => router.push(option.route as any)}
                >
                  <View style={[styles.adminIconContainer, { backgroundColor: option.color + '20' }]}>
                    <Ionicons name={option.icon as any} size={28} color={option.color} />
                  </View>
                  <Text style={styles.adminCardTitle}>{option.title}</Text>
                  <Text style={styles.adminCardDescription}>{option.description}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Profile Information */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="person" size={24} color="#6b7280" />
            <Text style={styles.sectionTitle}>Profile Information</Text>
          </View>
          
          {user.profile.bio && (
            <View style={styles.infoCard}>
              <Text style={styles.infoLabel}>Bio</Text>
              <Text style={styles.infoValue}>{user.profile.bio}</Text>
            </View>
          )}

          {user.profile.phone && (
            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <Ionicons name="call" size={20} color="#6b7280" />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Phone</Text>
                  <Text style={styles.infoValue}>{user.profile.phone}</Text>
                </View>
              </View>
            </View>
          )}

          {user.profile.stateAssignment && (
            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <Ionicons name="location" size={20} color="#6b7280" />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>State Assignment</Text>
                  <Text style={styles.infoValue}>{user.profile.stateAssignment}</Text>
                </View>
              </View>
            </View>
          )}
        </View>

        {/* Account Actions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="settings" size={24} color="#6b7280" />
            <Text style={styles.sectionTitle}>Account</Text>
          </View>

          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="key" size={20} color="#6b7280" />
            <Text style={styles.actionButtonText}>Change Password</Text>
            <Ionicons name="chevron-forward" size={20} color="#6b7280" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="notifications" size={20} color="#6b7280" />
            <Text style={styles.actionButtonText}>Notification Settings</Text>
            <Ionicons name="chevron-forward" size={20} color="#6b7280" />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.actionButton, styles.logoutButton]} onPress={handleLogout}>
            <Ionicons name="log-out" size={20} color="#ef4444" />
            <Text style={[styles.actionButtonText, styles.logoutText]}>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  content: {
    paddingBottom: 40,
  },
  webContent: {
    maxWidth: 800,
    marginHorizontal: 'auto',
    width: '100%',
  },
  profileHeader: {
    paddingTop: 40,
    paddingBottom: 30,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  avatarText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#6366f1',
  },
  name: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: '#ffffff',
    opacity: 0.9,
    marginBottom: 12,
  },
  roleBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  roleBadgeText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  section: {
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
  },
  adminGrid: {
    gap: 12,
  },
  webAdminGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  adminCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  webAdminCard: {
    width: 'calc(50% - 6px)' as any,
  },
  adminIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  adminCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  adminCardDescription: {
    fontSize: 13,
    color: '#6b7280',
    lineHeight: 18,
  },
  infoCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  infoValue: {
    fontSize: 15,
    color: '#111827',
    lineHeight: 22,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  actionButtonText: {
    flex: 1,
    fontSize: 15,
    color: '#111827',
    fontWeight: '500',
  },
  logoutButton: {
    marginTop: 8,
  },
  logoutText: {
    color: '#ef4444',
  },
});
