import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Platform, ActivityIndicator, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import api from '../../src/services/api';
import WebHeader from '../../components/WebHeader';
import WebFooter from '../../components/WebFooter';

interface Location {
  id: string;
  country: string;
  state: string;
  area: string;
  description: string;
  images: string[];
  createdByRole: string;
  approvalStatus: string;
  createdAt: string;
  creator?: {
    profile: {
      name: string;
    };
  };
}

type TabType = 'all' | 'admin' | 'govt' | 'agent';

export default function ManageLocations() {
  const router = useRouter();
  const [locations, setLocations] = useState<Location[]>([]);
  const [filteredLocations, setFilteredLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const isWeb = Platform.OS === 'web';
  const itemsPerPage = 10;

  useEffect(() => {
    fetchLocations();
  }, []);

  useEffect(() => {
    filterLocations();
  }, [locations, activeTab, searchQuery]);

  const fetchLocations = async () => {
    try {
      setLoading(true);
      const response = await api.get('/locations?approvalStatus=all');
      setLocations(response.data.data || response.data);
    } catch (error) {
      console.error('Error fetching locations:', error);
      Alert.alert('Error', 'Failed to fetch locations');
    } finally {
      setLoading(false);
    }
  };

  const filterLocations = () => {
    let filtered = [...locations];

    // Filter by tab
    if (activeTab === 'admin') {
      filtered = filtered.filter(loc => loc.createdByRole === 'SITE_ADMIN');
    } else if (activeTab === 'govt') {
      filtered = filtered.filter(loc => loc.createdByRole === 'GOVT_DEPARTMENT');
    } else if (activeTab === 'agent') {
      filtered = filtered.filter(loc => loc.createdByRole === 'TOURIST_GUIDE');
    }

    // Filter by search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(loc =>
        loc.area.toLowerCase().includes(query) ||
        loc.state.toLowerCase().includes(query) ||
        loc.country.toLowerCase().includes(query)
      );
    }

    setFilteredLocations(filtered);
    setCurrentPage(1);
  };

  const handleEdit = (locationId: string) => {
    router.push(`/(admin)/edit-location?id=${locationId}` as any);
  };

  const handleDelete = (locationId: string, locationName: string) => {
    Alert.alert(
      'Delete Location',
      `Are you sure you want to delete "${locationName}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => performDelete(locationId) }
      ]
    );
  };

  const performDelete = async (locationId: string) => {
    try {
      await api.delete(`/locations/${locationId}`);
      setLocations(locations.filter(loc => loc.id !== locationId));
      Alert.alert('Success', 'Location deleted successfully');
    } catch (error) {
      console.error('Error deleting location:', error);
      Alert.alert('Error', 'Failed to delete location');
    }
  };

  const handleTogglePublish = async (locationId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'APPROVED' ? 'PENDING' : 'APPROVED';
    const action = newStatus === 'APPROVED' ? 'publish' : 'unpublish';
    
    try {
      await api.patch(`/locations/${locationId}/status`, { status: newStatus });
      setLocations(locations.map(loc => 
        loc.id === locationId ? { ...loc, approvalStatus: newStatus } : loc
      ));
      Alert.alert('Success', `Location ${action}ed successfully`);
    } catch (error) {
      console.error(`Error ${action}ing location:`, error);
      Alert.alert('Error', `Failed to ${action} location`);
    }
  };

  const getTabCount = (tab: TabType) => {
    if (tab === 'all') return locations.length;
    if (tab === 'admin') return locations.filter(l => l.createdByRole === 'SITE_ADMIN').length;
    if (tab === 'govt') return locations.filter(l => l.createdByRole === 'GOVT_DEPARTMENT').length;
    if (tab === 'agent') return locations.filter(l => l.createdByRole === 'TOURIST_GUIDE').length;
    return 0;
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'SITE_ADMIN': return { label: 'Admin', color: '#6366f1' };
      case 'GOVT_DEPARTMENT': return { label: 'Tourism Dept', color: '#10b981' };
      case 'TOURIST_GUIDE': return { label: 'Travel Agent', color: '#f59e0b' };
      default: return { label: 'User', color: '#6b7280' };
    }
  };

  const totalPages = Math.ceil(filteredLocations.length / itemsPerPage);
  const paginatedLocations = filteredLocations.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

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
              <Text style={styles.title}>Manage Locations</Text>
              <Text style={styles.subtitle}>
                {filteredLocations.length} locations • Page {currentPage} of {totalPages}
              </Text>
            </View>
            <TouchableOpacity 
              style={styles.addButton} 
              onPress={() => router.push('/(admin)/upload-location' as any)}
            >
              <Ionicons name="add-circle" size={20} color="#ffffff" />
              <Text style={styles.addButtonText}>Add Location</Text>
            </TouchableOpacity>
          </View>

          {/* Tabs */}
          <View style={styles.tabs}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'all' && styles.tabActive]}
              onPress={() => setActiveTab('all')}
            >
              <Text style={[styles.tabText, activeTab === 'all' && styles.tabTextActive]}>
                All ({getTabCount('all')})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'admin' && styles.tabActive]}
              onPress={() => setActiveTab('admin')}
            >
              <Text style={[styles.tabText, activeTab === 'admin' && styles.tabTextActive]}>
                Admin ({getTabCount('admin')})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'govt' && styles.tabActive]}
              onPress={() => setActiveTab('govt')}
            >
              <Text style={[styles.tabText, activeTab === 'govt' && styles.tabTextActive]}>
                Tourism Dept ({getTabCount('govt')})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'agent' && styles.tabActive]}
              onPress={() => setActiveTab('agent')}
            >
              <Text style={[styles.tabText, activeTab === 'agent' && styles.tabTextActive]}>
                Travel Agents ({getTabCount('agent')})
              </Text>
            </TouchableOpacity>
          </View>

          {/* Search */}
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#6b7280" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search locations..."
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          {/* Table */}
          <ScrollView horizontal showsHorizontalScrollIndicator={isWeb}>
            <View style={styles.tableContainer}>
              {/* Table Header */}
              <View style={styles.tableHeader}>
                <View style={[styles.tableHeaderCell, styles.imageColumn]}>
                  <Text style={styles.tableHeaderText}>Image</Text>
                </View>
                <View style={[styles.tableHeaderCell, styles.nameColumn]}>
                  <Text style={styles.tableHeaderText}>Location</Text>
                </View>
                <View style={[styles.tableHeaderCell, styles.stateColumn]}>
                  <Text style={styles.tableHeaderText}>State</Text>
                </View>
                <View style={[styles.tableHeaderCell, styles.roleColumn]}>
                  <Text style={styles.tableHeaderText}>Source</Text>
                </View>
                <View style={[styles.tableHeaderCell, styles.statusColumn]}>
                  <Text style={styles.tableHeaderText}>Status</Text>
                </View>
                <View style={[styles.tableHeaderCell, styles.dateColumn]}>
                  <Text style={styles.tableHeaderText}>Created</Text>
                </View>
                <View style={[styles.tableHeaderCell, styles.actionsColumn]}>
                  <Text style={styles.tableHeaderText}>Actions</Text>
                </View>
              </View>

              {/* Table Body */}
              <ScrollView style={styles.tableBody}>
                {paginatedLocations.map((location, index) => {
                  const roleBadge = getRoleBadge(location.createdByRole);
                  return (
                    <View 
                      key={location.id} 
                      style={[styles.tableRow, index % 2 === 0 && styles.tableRowEven]}
                    >
                      <View style={[styles.tableCell, styles.imageColumn]}>
                        {location.images && location.images[0] ? (
                          <Image 
                            source={{ uri: location.images[0] }} 
                            style={styles.thumbnail}
                          />
                        ) : (
                          <View style={styles.thumbnailPlaceholder}>
                            <Ionicons name="image-outline" size={24} color="#d1d5db" />
                          </View>
                        )}
                      </View>
                      <View style={[styles.tableCell, styles.nameColumn]}>
                        <Text style={styles.tableCellText} numberOfLines={2}>
                          {location.area}
                        </Text>
                      </View>
                      <View style={[styles.tableCell, styles.stateColumn]}>
                        <Text style={styles.tableCellText}>{location.state}</Text>
                      </View>
                      <View style={[styles.tableCell, styles.roleColumn]}>
                        <View style={[styles.roleBadge, { backgroundColor: roleBadge.color + '20' }]}>
                          <Text style={[styles.roleBadgeText, { color: roleBadge.color }]}>
                            {roleBadge.label}
                          </Text>
                        </View>
                      </View>
                      <View style={[styles.tableCell, styles.statusColumn]}>
                        <View style={[
                          styles.statusBadge,
                          { backgroundColor: location.approvalStatus === 'APPROVED' ? '#10b98120' : '#f59e0b20' }
                        ]}>
                          <Text style={[
                            styles.statusText,
                            { color: location.approvalStatus === 'APPROVED' ? '#10b981' : '#f59e0b' }
                          ]}>
                            {location.approvalStatus === 'APPROVED' ? 'Published' : 'Draft'}
                          </Text>
                        </View>
                      </View>
                      <View style={[styles.tableCell, styles.dateColumn]}>
                        <Text style={styles.tableCellText}>
                          {new Date(location.createdAt).toLocaleDateString()}
                        </Text>
                      </View>
                      <View style={[styles.tableCell, styles.actionsColumn]}>
                        <View style={styles.actionButtons}>
                          <TouchableOpacity
                            style={styles.iconButton}
                            onPress={() => handleEdit(location.id)}
                          >
                            <Ionicons name="create" size={18} color="#6366f1" />
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={styles.iconButton}
                            onPress={() => handleTogglePublish(location.id, location.approvalStatus)}
                          >
                            <Ionicons 
                              name={location.approvalStatus === 'APPROVED' ? 'eye-off' : 'eye'} 
                              size={18} 
                              color={location.approvalStatus === 'APPROVED' ? '#f59e0b' : '#10b981'} 
                            />
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={styles.iconButton}
                            onPress={() => handleDelete(location.id, location.area)}
                          >
                            <Ionicons name="trash" size={18} color="#ef4444" />
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  );
                })}
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

          {filteredLocations.length === 0 && (
            <View style={styles.emptyState}>
              <Ionicons name="location-outline" size={64} color="#d1d5db" />
              <Text style={styles.emptyStateText}>No locations found</Text>
            </View>
          )}
        </View>
      </ScrollView>
      {isWeb && <WebFooter />}
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
  tabs: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
    flexWrap: 'wrap',
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  tabActive: {
    backgroundColor: '#6366f1',
    borderColor: '#6366f1',
  },
  tabText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  tabTextActive: {
    color: '#ffffff',
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
    marginBottom: 20,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#111827',
  },
  tableContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    minWidth: 1200,
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
  imageColumn: {
    width: 80,
  },
  nameColumn: {
    width: 200,
  },
  stateColumn: {
    width: 150,
  },
  roleColumn: {
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
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  thumbnailPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
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
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
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
});
