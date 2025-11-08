import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Platform, ActivityIndicator, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../../src/services/api';
import WebHeader from '../../components/WebHeader';
import WebFooter from '../../components/WebFooter';

interface User {
  id: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  profile?: {
    name: string;
    phone?: string;
    stateAssignment?: string;
  };
}

interface NewUserForm {
  email: string;
  password: string;
  name: string;
  role: string;
  phone: string;
  stateAssignment: string;
}

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editForm, setEditForm] = useState<NewUserForm>({
    email: '',
    password: '',
    name: '',
    role: 'USER',
    phone: '',
    stateAssignment: ''
  });
  const [sortBy, setSortBy] = useState<'name' | 'email' | 'date'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  const [newUserForm, setNewUserForm] = useState<NewUserForm>({
    email: '',
    password: '',
    name: '',
    role: 'USER',
    phone: '',
    stateAssignment: ''
  });

  const isWeb = Platform.OS === 'web';
  const itemsPerPage = 20;

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

  const handleAddUser = async () => {
    if (!newUserForm.email || !newUserForm.password || !newUserForm.name || !newUserForm.role) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      await api.post('/admin/create-credentials', newUserForm);
      Alert.alert('Success', 'User created successfully');
      setShowAddModal(false);
      setNewUserForm({
        email: '',
        password: '',
        name: '',
        role: 'USER',
        phone: '',
        stateAssignment: ''
      });
      fetchUsers();
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error || 'Failed to create user');
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
      Alert.alert('Password Reset', `New password: ${response.data.newPassword}\n\nPlease share this with the user securely.`);
    } catch (error) {
      console.error('Error resetting password:', error);
      Alert.alert('Error', 'Failed to reset password');
    }
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setEditForm({
      email: user.email,
      password: '',
      name: user.profile?.name || '',
      role: user.role,
      phone: user.profile?.phone || '',
      stateAssignment: user.profile?.stateAssignment || ''
    });
    setShowEditModal(true);
  };

  const handleUpdateUser = async () => {
    if (!selectedUser) return;

    if (!editForm.email || !editForm.name || !editForm.role) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      await api.put(`/admin/users/${selectedUser.id}`, {
        name: editForm.name,
        email: editForm.email,
        role: editForm.role,
        phone: editForm.phone,
        stateAssignment: editForm.stateAssignment,
      });
      Alert.alert('Success', 'User updated successfully');
      setShowEditModal(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error || 'Failed to update user');
    }
  };

  const handleToggleStatus = async (userId: string, currentStatus: boolean) => {
    Alert.alert(
      `${currentStatus ? 'Deactivate' : 'Activate'} User`,
      `Are you sure you want to ${currentStatus ? 'deactivate' : 'activate'} this user?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Confirm', onPress: () => performToggleStatus(userId) }
      ]
    );
  };

  const performToggleStatus = async (userId: string) => {
    try {
      await api.post(`/admin/users/${userId}/toggle-status`);
      fetchUsers();
      Alert.alert('Success', 'User status updated successfully');
    } catch (error) {
      console.error('Error toggling user status:', error);
      Alert.alert('Error', 'Failed to update user status');
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

  const handleSort = (field: 'name' | 'email' | 'date') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.profile?.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = selectedRole === 'ALL' || user.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    let comparison = 0;
    if (sortBy === 'name') {
      comparison = (a.profile?.name || '').localeCompare(b.profile?.name || '');
    } else if (sortBy === 'email') {
      comparison = a.email.localeCompare(b.email);
    } else {
      comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    }
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  const totalPages = Math.ceil(sortedUsers.length / itemsPerPage);
  const paginatedUsers = sortedUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

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
    <View style={styles.container}>
      {isWeb && <WebHeader />}
      <ScrollView style={styles.scrollContainer}>
        <View style={[styles.content, isWeb && styles.webContent]}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>User Management</Text>
            <Text style={styles.subtitle}>
              {filteredUsers.length} users • Page {currentPage} of {totalPages}
            </Text>
          </View>
          <TouchableOpacity style={styles.addButton} onPress={() => setShowAddModal(true)}>
            <Ionicons name="add-circle" size={20} color="#ffffff" />
            <Text style={styles.addButtonText}>Add User</Text>
          </TouchableOpacity>
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
                onPress={() => {
                  setSelectedRole(role);
                  setCurrentPage(1);
                }}
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

        {/* Table */}
        <ScrollView horizontal showsHorizontalScrollIndicator={isWeb}>
          <View style={styles.tableContainer}>
            {/* Table Header */}
            <View style={styles.tableHeader}>
              <TouchableOpacity 
                style={[styles.tableHeaderCell, styles.nameColumn]} 
                onPress={() => handleSort('name')}
              >
                <Text style={styles.tableHeaderText}>Name</Text>
                {sortBy === 'name' && (
                  <Ionicons 
                    name={sortOrder === 'asc' ? 'chevron-up' : 'chevron-down'} 
                    size={16} 
                    color="#6b7280" 
                  />
                )}
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.tableHeaderCell, styles.emailColumn]} 
                onPress={() => handleSort('email')}
              >
                <Text style={styles.tableHeaderText}>Email</Text>
                {sortBy === 'email' && (
                  <Ionicons 
                    name={sortOrder === 'asc' ? 'chevron-up' : 'chevron-down'} 
                    size={16} 
                    color="#6b7280" 
                  />
                )}
              </TouchableOpacity>
              <View style={[styles.tableHeaderCell, styles.roleColumn]}>
                <Text style={styles.tableHeaderText}>Role</Text>
              </View>
              <View style={[styles.tableHeaderCell, styles.phoneColumn]}>
                <Text style={styles.tableHeaderText}>Phone</Text>
              </View>
              <View style={[styles.tableHeaderCell, styles.statusColumn]}>
                <Text style={styles.tableHeaderText}>Status</Text>
              </View>
              <TouchableOpacity 
                style={[styles.tableHeaderCell, styles.dateColumn]} 
                onPress={() => handleSort('date')}
              >
                <Text style={styles.tableHeaderText}>Joined</Text>
                {sortBy === 'date' && (
                  <Ionicons 
                    name={sortOrder === 'asc' ? 'chevron-up' : 'chevron-down'} 
                    size={16} 
                    color="#6b7280" 
                  />
                )}
              </TouchableOpacity>
              <View style={[styles.tableHeaderCell, styles.actionsColumn]}>
                <Text style={styles.tableHeaderText}>Actions</Text>
              </View>
            </View>

            {/* Table Body */}
            <ScrollView style={styles.tableBody}>
              {paginatedUsers.map((user, index) => (
                <View 
                  key={user.id} 
                  style={[
                    styles.tableRow,
                    index % 2 === 0 && styles.tableRowEven
                  ]}
                >
                  <View style={[styles.tableCell, styles.nameColumn]}>
                    <Text style={styles.tableCellText} numberOfLines={1}>
                      {user.profile?.name || 'No Name'}
                    </Text>
                  </View>
                  <View style={[styles.tableCell, styles.emailColumn]}>
                    <Text style={styles.tableCellText} numberOfLines={1}>
                      {user.email}
                    </Text>
                  </View>
                  <View style={[styles.tableCell, styles.roleColumn]}>
                    <View style={[styles.roleBadge, { backgroundColor: getRoleBadgeColor(user.role) + '20' }]}>
                      <Text style={[styles.roleBadgeText, { color: getRoleBadgeColor(user.role) }]}>
                        {getRoleLabel(user.role)}
                      </Text>
                    </View>
                  </View>
                  <View style={[styles.tableCell, styles.phoneColumn]}>
                    <Text style={styles.tableCellText} numberOfLines={1}>
                      {user.profile?.phone || '-'}
                    </Text>
                  </View>
                  <View style={[styles.tableCell, styles.statusColumn]}>
                    <View style={[
                      styles.statusBadge,
                      { backgroundColor: (user.isActive !== false) ? '#10b98120' : '#ef444420' }
                    ]}>
                      <View style={[
                        styles.statusDot,
                        { backgroundColor: (user.isActive !== false) ? '#10b981' : '#ef4444' }
                      ]} />
                      <Text style={[
                        styles.statusText,
                        { color: (user.isActive !== false) ? '#10b981' : '#ef4444' }
                      ]}>
                        {(user.isActive !== false) ? 'Active' : 'Inactive'}
                      </Text>
                    </View>
                  </View>
                  <View style={[styles.tableCell, styles.dateColumn]}>
                    <Text style={styles.tableCellText}>
                      {new Date(user.createdAt).toLocaleDateString()}
                    </Text>
                  </View>
                  <View style={[styles.tableCell, styles.actionsColumn]}>
                    {user.role !== 'SITE_ADMIN' && (
                      <View style={styles.actionButtons}>
                        <TouchableOpacity
                          style={styles.iconButton}
                          onPress={() => handleEditUser(user)}
                        >
                          <Ionicons name="create" size={18} color="#6366f1" />
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.iconButton}
                          onPress={() => handleToggleStatus(user.id, user.isActive !== false)}
                        >
                          <Ionicons 
                            name={(user.isActive !== false) ? 'close-circle' : 'checkmark-circle'} 
                            size={18} 
                            color={(user.isActive !== false) ? '#f59e0b' : '#10b981'} 
                          />
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.iconButton}
                          onPress={() => handleResetPassword(user.id, user.email)}
                        >
                          <Ionicons name="key" size={18} color="#6366f1" />
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.iconButton}
                          onPress={() => handleDeleteUser(user.id, user.email)}
                        >
                          <Ionicons name="trash" size={18} color="#ef4444" />
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
        </ScrollView>

        {/* Pagination */}
        {totalPages > 1 && (
          <View style={styles.pagination}>
            <TouchableOpacity
              style={[styles.paginationButton, currentPage === 1 && styles.paginationButtonDisabled]}
              onPress={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              <Ionicons name="chevron-back" size={20} color={currentPage === 1 ? '#d1d5db' : '#6366f1'} />
            </TouchableOpacity>
            
            <View style={styles.paginationInfo}>
              <Text style={styles.paginationText}>
                Page {currentPage} of {totalPages}
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.paginationButton, currentPage === totalPages && styles.paginationButtonDisabled]}
              onPress={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
            >
              <Ionicons name="chevron-forward" size={20} color={currentPage === totalPages ? '#d1d5db' : '#6366f1'} />
            </TouchableOpacity>
          </View>
        )}

        {filteredUsers.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="people-outline" size={64} color="#d1d5db" />
            <Text style={styles.emptyStateText}>No users found</Text>
          </View>
        )}
        </View>
      </ScrollView>
      {isWeb && <WebFooter />}

      {/* Add User Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add New User</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <Ionicons name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Name *</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="Enter full name"
                  value={newUserForm.name}
                  onChangeText={(text) => setNewUserForm({...newUserForm, name: text})}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Email *</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="Enter email address"
                  value={newUserForm.email}
                  onChangeText={(text) => setNewUserForm({...newUserForm, email: text})}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Password *</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="Enter password"
                  value={newUserForm.password}
                  onChangeText={(text) => setNewUserForm({...newUserForm, password: text})}
                  secureTextEntry
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Role *</Text>
                <View style={styles.roleSelector}>
                  {['USER', 'TOURIST_GUIDE', 'GOVT_DEPARTMENT'].map(role => (
                    <TouchableOpacity
                      key={role}
                      style={[
                        styles.roleSelectorButton,
                        newUserForm.role === role && styles.roleSelectorButtonActive
                      ]}
                      onPress={() => setNewUserForm({...newUserForm, role})}
                    >
                      <Text style={[
                        styles.roleSelectorText,
                        newUserForm.role === role && styles.roleSelectorTextActive
                      ]}>
                        {getRoleLabel(role)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Phone</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="Enter phone number"
                  value={newUserForm.phone}
                  onChangeText={(text) => setNewUserForm({...newUserForm, phone: text})}
                  keyboardType="phone-pad"
                />
              </View>

              {newUserForm.role === 'GOVT_DEPARTMENT' && (
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>State Assignment</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="Enter state assignment"
                    value={newUserForm.stateAssignment}
                    onChangeText={(text) => setNewUserForm({...newUserForm, stateAssignment: text})}
                  />
                </View>
              )}
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonSecondary]}
                onPress={() => setShowAddModal(false)}
              >
                <Text style={styles.modalButtonTextSecondary}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonPrimary]}
                onPress={handleAddUser}
              >
                <Text style={styles.modalButtonTextPrimary}>Create User</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Edit User Modal */}
      <Modal
        visible={showEditModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowEditModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit User</Text>
              <TouchableOpacity onPress={() => setShowEditModal(false)}>
                <Ionicons name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Name *</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="Enter full name"
                  value={editForm.name}
                  onChangeText={(text) => setEditForm({...editForm, name: text})}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Email *</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="Enter email address"
                  value={editForm.email}
                  onChangeText={(text) => setEditForm({...editForm, email: text})}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Role *</Text>
                <View style={styles.roleSelector}>
                  {['USER', 'TOURIST_GUIDE', 'GOVT_DEPARTMENT'].map(role => (
                    <TouchableOpacity
                      key={role}
                      style={[
                        styles.roleSelectorButton,
                        editForm.role === role && styles.roleSelectorButtonActive
                      ]}
                      onPress={() => setEditForm({...editForm, role})}
                    >
                      <Text style={[
                        styles.roleSelectorText,
                        editForm.role === role && styles.roleSelectorTextActive
                      ]}>
                        {getRoleLabel(role)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Phone</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="Enter phone number"
                  value={editForm.phone}
                  onChangeText={(text) => setEditForm({...editForm, phone: text})}
                  keyboardType="phone-pad"
                />
              </View>

              {editForm.role === 'GOVT_DEPARTMENT' && (
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>State Assignment</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="Enter state assignment"
                    value={editForm.stateAssignment}
                    onChangeText={(text) => setEditForm({...editForm, stateAssignment: text})}
                  />
                </View>
              )}
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonSecondary]}
                onPress={() => setShowEditModal(false)}
              >
                <Text style={styles.modalButtonTextSecondary}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonPrimary]}
                onPress={handleUpdateUser}
              >
                <Text style={styles.modalButtonTextPrimary}>Update User</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  scrollContainer: {
    flex: 1,
  },
  content: {
    padding: 20,
    minHeight: '100%',
  },
  webContent: {
    maxWidth: 1400,
    marginHorizontal: 'auto',
    width: '100%',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6366f1',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  filtersContainer: {
    marginBottom: 20,
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
  tableContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    minWidth: 1000,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f9fafb',
    borderBottomWidth: 2,
    borderBottomColor: '#e5e7eb',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  tableHeaderCell: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  tableHeaderText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6b7280',
    textTransform: 'uppercase',
  },
  tableBody: {
    maxHeight: 600,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  tableRowEven: {
    backgroundColor: '#f9fafb',
  },
  tableCell: {
    justifyContent: 'center',
  },
  tableCellText: {
    fontSize: 14,
    color: '#111827',
  },
  nameColumn: {
    width: 200,
  },
  emailColumn: {
    width: 250,
  },
  roleColumn: {
    width: 150,
  },
  phoneColumn: {
    width: 150,
  },
  statusColumn: {
    width: 120,
  },
  dateColumn: {
    width: 120,
  },
  actionsColumn: {
    width: 180,
  },
  roleBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  roleBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    gap: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    padding: 6,
    borderRadius: 6,
    backgroundColor: '#f9fafb',
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    gap: 16,
  },
  paginationButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  paginationButtonDisabled: {
    opacity: 0.5,
  },
  paginationInfo: {
    paddingHorizontal: 16,
  },
  paginationText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    width: '100%',
    maxWidth: 500,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
  },
  modalBody: {
    padding: 20,
  },
  formGroup: {
    marginBottom: 16,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  formInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#111827',
  },
  roleSelector: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  roleSelectorButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: '#ffffff',
  },
  roleSelectorButtonActive: {
    backgroundColor: '#6366f1',
    borderColor: '#6366f1',
  },
  roleSelectorText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  roleSelectorTextActive: {
    color: '#ffffff',
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  modalButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  modalButtonSecondary: {
    backgroundColor: '#f3f4f6',
  },
  modalButtonPrimary: {
    backgroundColor: '#6366f1',
  },
  modalButtonTextSecondary: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  modalButtonTextPrimary: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
});