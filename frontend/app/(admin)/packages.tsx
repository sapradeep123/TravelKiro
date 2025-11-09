import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Platform, ActivityIndicator, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import api from '../../src/services/api';
import WebHeader from '../../components/WebHeader';
import WebFooter from '../../components/WebFooter';

declare const window: any;

interface Package {
  id: string;
  title: string;
  description: string;
  duration: number;
  price: number;
  images: string[];
  hostRole: string;
  approvalStatus: string;
  createdAt: string;
  host?: {
    profile: {
      name: string;
    };
  };
  itinerary?: Array<{
    day: number;
    title: string;
  }>;
}

type TabType = 'all' | 'active' | 'inactive';

export default function ManagePackages() {
  const router = useRouter();
  const [packages, setPackages] = useState<Package[]>([]);
  const [filteredPackages, setFilteredPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const isWeb = Platform.OS === 'web';
  const itemsPerPage = 10;

  useEffect(() => {
    fetchPackages();
  }, []);

  useEffect(() => {
    filterPackages();
  }, [packages, activeTab, searchQuery]);

  const fetchPackages = async () => {
    try {
      setLoading(true);
      // Don't pass approvalStatus to get all packages (backend will return all when not specified for admin)
      const response = await api.get('/packages');
      const packagesData = response.data.data || response.data;
      console.log('Fetched packages:', packagesData);
      setPackages(packagesData);
    } catch (error) {
      console.error('Error fetching packages:', error);
      Alert.alert('Error', 'Failed to fetch packages');
    } finally {
      setLoading(false);
    }
  };

  const filterPackages = () => {
    let filtered = [...packages];
    console.log('Filtering packages, total:', packages.length);

    // Filter by tab
    if (activeTab === 'active') {
      filtered = filtered.filter(pkg => pkg.approvalStatus === 'APPROVED');
    } else if (activeTab === 'inactive') {
      filtered = filtered.filter(pkg => pkg.approvalStatus !== 'APPROVED');
    }

    // Filter by search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(pkg =>
        pkg.title.toLowerCase().includes(query) ||
        pkg.description.toLowerCase().includes(query)
      );
    }

    console.log('Filtered packages:', filtered.length);
    setFilteredPackages(filtered);
    setCurrentPage(1);
  };

  const handleEdit = (packageId: string) => {
    Alert.alert('Edit Package', 'Package editing feature coming soon!');
    // TODO: router.push(`/(admin)/edit-package?id=${packageId}` as any);
  };

  const handleDelete = (packageId: string, packageTitle: string) => {
    Alert.alert(
      'Delete Package',
      `Are you sure you want to delete "${packageTitle}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => performDelete(packageId) }
      ]
    );
  };

  const performDelete = async (packageId: string) => {
    try {
      await api.delete(`/packages/${packageId}`);
      setPackages(packages.filter(pkg => pkg.id !== packageId));
      Alert.alert('Success', 'Package deleted successfully');
    } catch (error) {
      console.error('Error deleting package:', error);
      Alert.alert('Error', 'Failed to delete package');
    }
  };

  const handleToggleStatus = async (packageId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'APPROVED' ? 'PENDING' : 'APPROVED';
    const action = newStatus === 'APPROVED' ? 'approve' : 'unapprove';
    
    try {
      await api.patch(`/packages/${packageId}/status`, { approvalStatus: newStatus });
      setPackages(packages.map(pkg => 
        pkg.id === packageId ? { ...pkg, approvalStatus: newStatus } : pkg
      ));
      Alert.alert('Success', `Package ${action}d successfully`);
    } catch (error) {
      console.error(`Error ${action}ing package:`, error);
      Alert.alert('Error', `Failed to ${action} package`);
    }
  };

  const getTabCount = (tab: TabType) => {
    if (tab === 'all') return packages.length;
    if (tab === 'active') return packages.filter(pkg => pkg.approvalStatus === 'APPROVED').length;
    if (tab === 'inactive') return packages.filter(pkg => pkg.approvalStatus !== 'APPROVED').length;
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const totalPages = Math.ceil(filteredPackages.length / itemsPerPage);
  const paginatedpackages = filteredPackages.slice(
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
      <ScrollView 
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={[styles.content, isWeb && styles.webContent]}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Manage Packages</Text>
              <Text style={styles.subtitle}>
                {filteredPackages.length} packages • Page {currentPage} of {totalPages || 1}
              </Text>
            </View>
            <TouchableOpacity 
              style={styles.addButton} 
              onPress={() => router.push('/(admin)/create-package' as any)}
            >
              <Ionicons name="add-circle" size={20} color="#ffffff" />
              <Text style={styles.addButtonText}>Create Package</Text>
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
              style={[styles.tab, activeTab === 'active' && styles.tabActive]}
              onPress={() => setActiveTab('active')}
            >
              <Text style={[styles.tabText, activeTab === 'active' && styles.tabTextActive]}>
                Active ({getTabCount('active')})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'inactive' && styles.tabActive]}
              onPress={() => setActiveTab('inactive')}
            >
              <Text style={[styles.tabText, activeTab === 'inactive' && styles.tabTextActive]}>
                Inactive ({getTabCount('inactive')})
              </Text>
            </TouchableOpacity>
          </View>

          {/* Search */}
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#6b7280" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search packages..."
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
                  <Text style={styles.tableHeaderText}>Package</Text>
                </View>
                <View style={[styles.tableHeaderCell, styles.typeColumn]}>
                  <Text style={styles.tableHeaderText}>Duration</Text>
                </View>
                <View style={[styles.tableHeaderCell, styles.dateColumn]}>
                  <Text style={styles.tableHeaderText}>Created</Text>
                </View>
                <View style={[styles.tableHeaderCell, styles.dateColumn]}>
                  <Text style={styles.tableHeaderText}>-</Text>
                </View>
                <View style={[styles.tableHeaderCell, styles.roleColumn]}>
                  <Text style={styles.tableHeaderText}>Source</Text>
                </View>
                <View style={[styles.tableHeaderCell, styles.statusColumn]}>
                  <Text style={styles.tableHeaderText}>Status</Text>
                </View>
                <View style={[styles.tableHeaderCell, styles.actionsColumn]}>
                  <Text style={styles.tableHeaderText}>Actions</Text>
                </View>
              </View>

              {/* Table Body */}
              <ScrollView style={styles.tableBody}>
                {paginatedpackages.map((pkg, index) => {
                  const roleBadge = getRoleBadge(pkg.hostRole);
                  return (
                    <View 
                      key={pkg.id} 
                      style={[styles.tableRow, index % 2 === 0 && styles.tableRowEven]}
                    >
                      <View style={[styles.tableCell, styles.imageColumn]}>
                        {pkg.images && pkg.images[0] ? (
                          <Image 
                            source={{ uri: pkg.images[0] }} 
                            style={styles.thumbnail}
                          />
                        ) : (
                          <View style={styles.thumbnailPlaceholder}>
                            <Ionicons name="briefcase-outline" size={24} color="#d1d5db" />
                          </View>
                        )}
                      </View>
                      <View style={[styles.tableCell, styles.nameColumn]}>
                        <Text style={styles.tableCellText} numberOfLines={2}>
                          {pkg.title}
                        </Text>
                        <Text style={styles.venueText} numberOfLines={1}>
                          💰 ₹{pkg.price.toLocaleString()}
                        </Text>
                      </View>
                      <View style={[styles.tableCell, styles.typeColumn]}>
                        <Text style={styles.tableCellText}>{pkg.duration} Days</Text>
                      </View>
                      <View style={[styles.tableCell, styles.dateColumn]}>
                        <Text style={styles.tableCellText}>{formatDate(pkg.createdAt)}</Text>
                      </View>
                      <View style={[styles.tableCell, styles.dateColumn]}>
                        <Text style={styles.tableCellText}>-</Text>
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
                          { backgroundColor: pkg.approvalStatus === 'APPROVED' ? '#10b98120' : '#ef444420' }
                        ]}>
                          <Text style={[
                            styles.statusText,
                            { color: pkg.approvalStatus === 'APPROVED' ? '#10b981' : '#ef4444' }
                          ]}>
                            {pkg.approvalStatus}
                          </Text>
                        </View>
                      </View>
                      <View style={[styles.tableCell, styles.actionsColumn]}>
                        <View style={styles.actionButtons}>
                          <TouchableOpacity
                            style={styles.iconButton}
                            onPress={() => {
                              Alert.alert(
                                pkg.title,
                                `${pkg.description}\n\n💰 Price: ₹${pkg.price.toLocaleString()}\n📅 Duration: ${pkg.duration} Days\n✅ Status: ${pkg.approvalStatus}`,
                                [{ text: 'Close' }]
                              );
                            }}
                          >
                            <Ionicons name="eye" size={18} color="#3b82f6" />
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={[styles.iconButton, styles.callbackButton]}
                            onPress={() => {
                              if (Platform.OS === 'web') {
                                router.push(`/(admin)/package-callback-requests?packageId=${pkg.id}` as any);
                              }
                            }}
                          >
                            <Ionicons name="call" size={18} color="#10b981" />
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={styles.iconButton}
                            onPress={() => handleEdit(pkg.id)}
                          >
                            <Ionicons name="create" size={18} color="#6366f1" />
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={styles.iconButton}
                            onPress={() => handleToggleStatus(pkg.id, pkg.approvalStatus)}
                          >
                            <Ionicons 
                              name={pkg.approvalStatus === 'APPROVED' ? 'checkmark-circle' : 'close-circle'} 
                              size={18} 
                              color={pkg.approvalStatus === 'APPROVED' ? '#10b981' : '#f59e0b'} 
                            />
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={styles.iconButton}
                            onPress={() => handleDelete(pkg.id, pkg.title)}
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

          {filteredPackages.length === 0 && (
            <View style={styles.emptyState}>
              <Ionicons name="calendar-outline" size={64} color="#d1d5db" />
              <Text style={styles.emptyStateText}>No packages found</Text>
            </View>
          )}
        </View>
        {isWeb && <WebFooter />}
      </ScrollView>
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
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    padding: 20,
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
    minWidth: 1300,
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
  venueText: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  imageColumn: {
    width: 80,
  },
  nameColumn: {
    width: 220,
  },
  typeColumn: {
    width: 120,
  },
  dateColumn: {
    width: 120,
  },
  roleColumn: {
    width: 140,
  },
  statusColumn: {
    width: 100,
  },
  actionsColumn: {
    width: 270,
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
  callbackButton: {
    backgroundColor: '#d1fae5',
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


