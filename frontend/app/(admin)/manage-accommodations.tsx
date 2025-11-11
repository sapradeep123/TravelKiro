import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { accommodationService } from '../../src/services/accommodationService';
import { Accommodation } from '../../src/types';

export default function ManageAccommodations() {
  const router = useRouter();
  const [accommodations, setAccommodations] = useState<Accommodation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0, pending: 0 });

  useEffect(() => {
    loadAccommodations();
    loadStats();
  }, [filterStatus]);

  const loadAccommodations = async () => {
    try {
      setLoading(true);
      const response = await accommodationService.getAllAccommodations({
        search: searchQuery || undefined,
        isActive: filterStatus === 'all' ? undefined : filterStatus === 'active'
      });
      setAccommodations(response.data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load accommodations');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await accommodationService.getAllAccommodations({});
      const data = response.data;
      setStats({
        total: data.length,
        active: data.filter((a: Accommodation) => a.isActive).length,
        inactive: data.filter((a: Accommodation) => !a.isActive).length,
        pending: data.filter((a: Accommodation) => !a.isActive).length
      });
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const handleSearch = () => {
    loadAccommodations();
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      await accommodationService.updateAccommodation(id, { isActive: !currentStatus });
      Alert.alert('Success', `Accommodation ${!currentStatus ? 'shown' : 'hidden'}`);
      loadAccommodations();
      loadStats();
    } catch (error: any) {
      console.error('Toggle status error:', error);
      Alert.alert('Error', error.message || 'Failed to update status');
    }
  };

  const handleDelete = async (id: string) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this accommodation?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await accommodationService.deleteAccommodation(id);
              Alert.alert('Success', 'Accommodation deleted');
              loadAccommodations();
              loadStats();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete accommodation');
            }
          }
        }
      ]
    );
  };

  const renderAccommodation = ({ item }: { item: Accommodation }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{item.name}</Text>
        <View style={[styles.statusBadge, item.isActive ? styles.activeBadge : styles.inactiveBadge]}>
          <Text style={styles.statusText}>{item.isActive ? 'Active' : 'Inactive'}</Text>
        </View>
      </View>
      
      <Text style={styles.cardSubtitle}>{item.type}</Text>
      <Text style={styles.cardLocation}>{item.area}, {item.state}, {item.country}</Text>
      <Text style={styles.cardPrice}>
        {item.priceMin && item.priceMax 
          ? `${item.currency} ${item.priceMin} - ${item.priceMax}` 
          : item.priceMin 
            ? `From ${item.currency} ${item.priceMin}` 
            : 'Price on request'}
      </Text>
      
      <View style={styles.cardActions}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => router.push(`/(admin)/edit-accommodation?id=${item.id}`)}
        >
          <Text style={styles.actionButtonText}>Edit</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, styles.callsButton]}
          onPress={() => router.push(`/(admin)/call-requests?accommodationId=${item.id}`)}
        >
          <Text style={styles.actionButtonText}>Calls</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, styles.statusButton]}
          onPress={() => handleToggleStatus(item.id, item.isActive)}
        >
          <Text style={styles.actionButtonText}>
            {item.isActive ? 'Hide' : 'Show'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDelete(item.id)}
        >
          <Text style={styles.actionButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Modern Header with gradient */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity 
            onPress={() => router.push('/(admin)/dashboard')} 
            style={styles.backButton}
          >
            <Text style={styles.backButtonText}>← Dashboard</Text>
          </TouchableOpacity>
          <View>
            <Text style={styles.title}>Accommodations</Text>
            <Text style={styles.subtitle}>Manage your properties and listings</Text>
          </View>
        </View>
        <TouchableOpacity 
          style={styles.createButton}
          onPress={() => router.push('/(admin)/create-accommodation')}
        >
          <Text style={styles.createButtonText}>+ Add New</Text>
        </TouchableOpacity>
      </View>

      {/* Compact Stats Bar */}
      <View style={styles.statsBar}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{stats.total}</Text>
          <Text style={styles.statText}>Total</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: '#10b981' }]}>{stats.active}</Text>
          <Text style={styles.statText}>Active</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: '#f59e0b' }]}>{stats.inactive}</Text>
          <Text style={styles.statText}>Inactive</Text>
        </View>
      </View>

      {/* Modern Search and Filter Bar */}
      <View style={styles.toolbarContainer}>
        <View style={styles.searchWrapper}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name, location..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            placeholderTextColor="#9ca3af"
          />
        </View>

        <View style={styles.filterChips}>
          <TouchableOpacity 
            style={[styles.chip, filterStatus === 'all' && styles.chipActive]}
            onPress={() => setFilterStatus('all')}
          >
            <Text style={[styles.chipText, filterStatus === 'all' && styles.chipTextActive]}>
              All
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.chip, filterStatus === 'active' && styles.chipActive]}
            onPress={() => setFilterStatus('active')}
          >
            <Text style={[styles.chipText, filterStatus === 'active' && styles.chipTextActive]}>
              Active
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.chip, filterStatus === 'inactive' && styles.chipActive]}
            onPress={() => setFilterStatus('inactive')}
          >
            <Text style={[styles.chipText, filterStatus === 'inactive' && styles.chipTextActive]}>
              Inactive
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={accommodations}
        renderItem={renderAccommodation}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        refreshing={loading}
        onRefresh={loadAccommodations}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No accommodations found</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 16,
    backgroundColor: '#fff',
  },
  headerLeft: {
    flex: 1,
  },
  backButton: {
    marginBottom: 8,
  },
  backButtonText: {
    fontSize: 14,
    color: '#3b82f6',
    fontWeight: '500',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  createButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  createButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  statsBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'space-around',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  statText: {
    fontSize: 11,
    color: '#6b7280',
    marginTop: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#e5e7eb',
  },
  toolbarContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 10,
    paddingHorizontal: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 14,
    color: '#111827',
  },
  filterChips: {
    flexDirection: 'row',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  chipActive: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  chipText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6b7280',
  },
  chipTextActive: {
    color: '#fff',
  },
  listContainer: {
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  activeBadge: {
    backgroundColor: '#d1fae5',
  },
  inactiveBadge: {
    backgroundColor: '#fed7aa',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#065f46',
  },
  cardSubtitle: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 4,
    fontWeight: '500',
  },
  cardLocation: {
    fontSize: 13,
    color: '#9ca3af',
    marginBottom: 6,
  },
  cardPrice: {
    fontSize: 15,
    fontWeight: '600',
    color: '#3b82f6',
    marginBottom: 12,
  },
  cardActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#3b82f6',
    paddingVertical: 9,
    borderRadius: 8,
    alignItems: 'center',
  },
  callsButton: {
    backgroundColor: '#8b5cf6',
  },
  statusButton: {
    backgroundColor: '#f59e0b',
  },
  deleteButton: {
    backgroundColor: '#ef4444',
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 13,
  },
  emptyText: {
    textAlign: 'center',
    color: '#9ca3af',
    fontSize: 15,
    marginTop: 60,
  },
});
