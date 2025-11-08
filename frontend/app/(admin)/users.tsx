import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Platform, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../../src/services/api';

interface User {
  id: string;
  email: string;
  role: string;
  createdAt: string;
  profile?: {
    name: string;
    phone?: string;
    stateAssignment?: string;
  };
}

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('ALL');
  const isWeb = Platform.OS === 'web';

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/admin/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
      Alert.alert('Error', 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (userId: string, email: string) => {
    Alert.alert(
      'Reset Password',
      `Reset password for ${email}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Reset', onPress: () => performPasswordReset(userId) }
      ]
    );
  };

  const performPasswordReset = async (userId: string) => {
    try {
      const response = await api.post(`/admin/users/${userId}/reset-password`);
      Alert.alert('Password Reset', `New password: ${response.data.newPassword}\nPlease share this with the user.`);
    } catch (error) {
      console.error('Error resetting password:', error);
      Alert.alert('Error', 'Failed to reset password');
    }
  };

  const handleDeleteUser = async (userId: string, email: string) => {
    Alert.alert(
      'Delete User',
      `Delete user ${email}? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => performDelete(userId) }
      ]
    );
  };

  const performDelete = async (userId: string) => {
    try {
      await api.delete(`/admin/users/${userId}`);
      setUsers(users.filter(u => u.id !== userId));
      Alert.alert('Success', 'User deleted successfully');
    } catch (error) {
      console.error('Error deleting user:', error);
      Alert.alert('Error', 'Failed to delete user');
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.profile?.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = selectedRole === 'ALL' || user.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'SITE_ADMIN': return '#6366f1';
      case 'GOVT_DEPARTMENT': return '#10b981';
      case 'TOURIST_GUIDE': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'SITE_ADMIN': return 'Super Admin';
      case 'GOVT_DEPARTMENT': return 'Tourism Dept';
      case 'TOURIST_GUIDE': return 'Tourist Guide';
      default: return 'User';
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={[styles.content, isWeb && styles.webContent]}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>User Management</Text>
          <Text style={styles.subtitle}>Manage all users and reset passwords</Text>
        </View>

        {/* Filters */}
        <View style={styles.filtersContainer}>
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#6b7280" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by name or email..."
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.roleFilters}>
            {['ALL', 'SITE_ADMIN', 'GOVT_DEPARTMENT', 'TOURIST_GUIDE', 'USER'].map(role => (
              <TouchableOpacity
                key={role}
                style={[
                  styles.roleFilter,
                  selectedRole === role && styles.roleFilterActive
                ]}
                onPress={() => setSelectedRole(role)}
              >
                <Text style={[
                  styles.roleFilterText,
                  selectedRole === role && styles.roleFilterTextActive
                ]}>
                  {role === 'ALL' ? 'All Users' : getRoleLabel(role)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Users List */}
        <View style={styles.usersList}>
          {filteredUsers.map(user => (
            <View key={user.id} style={styles.userCard}>
              <View style={styles.userInfo}>
                <View style={styles.userHeader}>
                  <Text style={styles.userName}>{user.profile?.name || 'No Name'}</Text>
                  <View style={[styles.roleBadge, { backgroundColor: getRoleBadgeColor(user.role) + '20' }]}>
                    <Text style={[styles.roleBadgeText, { color: getRoleBadgeColor(user.role) }]}>
                      {getRoleLabel(user.role)}
                    </Text>
                  </View>
                </View>
                <Text style={styles.userEmail}>{user.email}</Text>
                {user.profile?.phone && (
                  <Text style={styles.userDetail}>📱 {user.profile.phone}</Text>
                )}
                {user.profile?.stateAssignment && (
                  <Text style={styles.userDetail}>📍 {user.profile.stateAssignment}</Text>
                )}
                <Text style={styles.userDate}>
                  Joined: {new Date(user.createdAt).toLocaleDateString()}
                </Text>
              </View>

              {user.role !== 'SITE_ADMIN' && (
                <View style={styles.userActions}>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.resetButton]}
                    onPress={() => handleResetPassword(user.id, user.email)}
                  >
                    <Ionicons name="key" size={18} color="#ffffff" />
                    <Text style={styles.actionButtonText}>Reset Password</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.deleteButton]}
                    onPress={() => handleDeleteUser(user.id, user.email)}
                  >
                    <Ionicons name="trash" size={18} color="#ffffff" />
                    <Text style={styles.actionButtonText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ))}

          {filteredUsers.length === 0 && (
            <View style={styles.emptyState}>
              <Ionicons name="people-outline" size={64} color="#d1d5db" />
              <Text style={styles.emptyStateText}>No users found</Text>
            </View>
          )}
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
    padding: 20,
  },
  webContent: {
    maxWidth: 1200,
    marginHorizontal: 'auto',
    width: '100%',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  filtersContainer: {
    marginBottom: 24,
    gap: 12,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#111827',
  },
  roleFilters: {
    flexDirection: 'row',
  },
  roleFilter: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  roleFilterActive: {
    backgroundColor: '#6366f1',
    borderColor: '#6366f1',
  },
  roleFilterText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  roleFilterTextActive: {
    color: '#ffffff',
  },
  usersList: {
    gap: 16,
  },
  userCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  userInfo: {
    marginBottom: 12,
  },
  userHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
  },
  roleBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  roleBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  userEmail: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  userDetail: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 2,
  },
  userDate: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 4,
  },
  userActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  resetButton: {
    backgroundColor: '#6366f1',
  },
  deleteButton: {
    backgroundColor: '#ef4444',
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#9ca3af',
    marginTop: 16,
  },
});
