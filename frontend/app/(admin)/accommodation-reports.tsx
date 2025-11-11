import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { accommodationService } from '../../src/services/accommodationService';

interface LeadMetrics {
  totalLeads: number;
  newLeads: number;
  contactedLeads: number;
  qualifiedLeads: number;
  convertedLeads: number;
  lostLeads: number;
  conversionRate: number;
  averageResponseTime: number;
}

interface ConversionFunnel {
  new: number;
  contacted: number;
  qualified: number;
  followUp: number;
  scheduled: number;
  converted: number;
}

interface AdminPerformance {
  adminId: string;
  adminName: string;
  assignedLeads: number;
  convertedLeads: number;
  conversionRate: number;
  averageResponseTime: number;
}

interface PropertyPerformance {
  accommodationId: string;
  accommodationName: string;
  totalLeads: number;
  convertedLeads: number;
  conversionRate: number;
}

export default function AccommodationReports() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');
  
  const [leadMetrics, setLeadMetrics] = useState<LeadMetrics>({
    totalLeads: 0,
    newLeads: 0,
    contactedLeads: 0,
    qualifiedLeads: 0,
    convertedLeads: 0,
    lostLeads: 0,
    conversionRate: 0,
    averageResponseTime: 0,
  });
  
  const [conversionFunnel, setConversionFunnel] = useState<ConversionFunnel>({
    new: 0,
    contacted: 0,
    qualified: 0,
    followUp: 0,
    scheduled: 0,
    converted: 0,
  });
  
  const [adminPerformance, setAdminPerformance] = useState<AdminPerformance[]>([]);
  const [propertyPerformance, setPropertyPerformance] = useState<PropertyPerformance[]>([]);

  useEffect(() => {
    loadReports();
  }, [dateRange]);

  const getDateRangeFilter = () => {
    const now = new Date();
    const filters: any = {};
    
    if (dateRange !== 'all') {
      const days = parseInt(dateRange);
      const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
      filters.startDate = startDate.toISOString();
      filters.endDate = now.toISOString();
    }
    
    return filters;
  };

  const loadReports = async () => {
    try {
      setLoading(true);
      const filters = getDateRangeFilter();
      
      // Load all reports in parallel
      const [metrics, funnel, adminPerf, propPerf] = await Promise.all([
        accommodationService.getLeadMetrics(filters),
        accommodationService.getConversionFunnel(filters),
        accommodationService.getAdminPerformance(filters),
        accommodationService.getPropertyPerformance(filters),
      ]);
      
      setLeadMetrics(metrics);
      setConversionFunnel(funnel);
      setAdminPerformance(adminPerf);
      setPropertyPerformance(propPerf);
    } catch (error) {
      Alert.alert('Error', 'Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const renderMetricCard = (title: string, value: string | number, subtitle?: string, color?: string) => (
    <View style={styles.metricCard}>
      <Text style={styles.metricTitle}>{title}</Text>
      <Text style={[styles.metricValue, color && { color }]}>{value}</Text>
      {subtitle && <Text style={styles.metricSubtitle}>{subtitle}</Text>}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading reports...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.refreshButton}
            onPress={loadReports}
          >
            <Text style={styles.refreshButtonText}>↻ Refresh</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.title}>Analytics & Reports</Text>
        <Text style={styles.subtitle}>Track performance and conversions</Text>
      </View>

      {/* Date Range Filter */}
      <View style={styles.filterContainer}>
        <Text style={styles.filterLabel}>Date Range:</Text>
        <View style={styles.filterButtons}>
          {[
            { value: '7d', label: 'Last 7 Days' },
            { value: '30d', label: 'Last 30 Days' },
            { value: '90d', label: 'Last 90 Days' },
            { value: 'all', label: 'All Time' },
          ].map(option => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.filterButton,
                dateRange === option.value && styles.filterButtonActive
              ]}
              onPress={() => setDateRange(option.value as any)}
            >
              <Text style={[
                styles.filterButtonText,
                dateRange === option.value && styles.filterButtonTextActive
              ]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Lead Metrics */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Lead Metrics</Text>
        
        <View style={styles.metricsGrid}>
          {renderMetricCard('Total Leads', leadMetrics.totalLeads)}
          {renderMetricCard('New Leads', leadMetrics.newLeads, undefined, '#2196F3')}
          {renderMetricCard('Contacted', leadMetrics.contactedLeads, undefined, '#FF9800')}
          {renderMetricCard('Qualified', leadMetrics.qualifiedLeads, undefined, '#9C27B0')}
          {renderMetricCard('Converted', leadMetrics.convertedLeads, undefined, '#4CAF50')}
          {renderMetricCard('Lost', leadMetrics.lostLeads, undefined, '#F44336')}
        </View>
        
        <View style={styles.metricsGrid}>
          {renderMetricCard(
            'Conversion Rate',
            `${leadMetrics.conversionRate.toFixed(1)}%`,
            'Converted / Total',
            '#4CAF50'
          )}
          {renderMetricCard(
            'Avg Response Time',
            `${leadMetrics.averageResponseTime.toFixed(1)}h`,
            'Time to first contact',
            '#FF9800'
          )}
        </View>
      </View>

      {/* Conversion Funnel */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Conversion Funnel</Text>
        
        <View style={styles.funnelContainer}>
          {[
            { label: 'New', value: conversionFunnel.new, color: '#2196F3' },
            { label: 'Contacted', value: conversionFunnel.contacted, color: '#FF9800' },
            { label: 'Qualified', value: conversionFunnel.qualified, color: '#9C27B0' },
            { label: 'Follow Up', value: conversionFunnel.followUp, color: '#FFC107' },
            { label: 'Scheduled', value: conversionFunnel.scheduled, color: '#00BCD4' },
            { label: 'Converted', value: conversionFunnel.converted, color: '#4CAF50' },
          ].map((stage, index) => {
            const maxValue = conversionFunnel.new || 1;
            const percentage = (stage.value / maxValue) * 100;
            
            return (
              <View key={stage.label} style={styles.funnelStage}>
                <View style={styles.funnelLabelContainer}>
                  <Text style={styles.funnelLabel}>{stage.label}</Text>
                  <Text style={styles.funnelValue}>{stage.value}</Text>
                </View>
                <View style={styles.funnelBarContainer}>
                  <View 
                    style={[
                      styles.funnelBar,
                      { width: `${percentage}%`, backgroundColor: stage.color }
                    ]}
                  />
                </View>
                <Text style={styles.funnelPercentage}>{percentage.toFixed(0)}%</Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* Admin Performance */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Admin Performance</Text>
        
        {adminPerformance.length === 0 ? (
          <Text style={styles.emptyText}>No data available</Text>
        ) : (
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderText, { flex: 2 }]}>Admin</Text>
              <Text style={[styles.tableHeaderText, { flex: 1 }]}>Assigned</Text>
              <Text style={[styles.tableHeaderText, { flex: 1 }]}>Converted</Text>
              <Text style={[styles.tableHeaderText, { flex: 1 }]}>Rate</Text>
            </View>
            
            {adminPerformance.map((admin, index) => (
              <View key={admin.adminId} style={styles.tableRow}>
                <Text style={[styles.tableCell, { flex: 2 }]} numberOfLines={1}>
                  {admin.adminName}
                </Text>
                <Text style={[styles.tableCell, { flex: 1 }]}>
                  {admin.assignedLeads}
                </Text>
                <Text style={[styles.tableCell, { flex: 1 }]}>
                  {admin.convertedLeads}
                </Text>
                <Text style={[styles.tableCell, { flex: 1, color: '#4CAF50', fontWeight: 'bold' }]}>
                  {admin.conversionRate.toFixed(0)}%
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Property Performance */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Property Performance</Text>
        
        {propertyPerformance.length === 0 ? (
          <Text style={styles.emptyText}>No data available</Text>
        ) : (
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderText, { flex: 2 }]}>Property</Text>
              <Text style={[styles.tableHeaderText, { flex: 1 }]}>Leads</Text>
              <Text style={[styles.tableHeaderText, { flex: 1 }]}>Converted</Text>
              <Text style={[styles.tableHeaderText, { flex: 1 }]}>Rate</Text>
            </View>
            
            {propertyPerformance.map((property, index) => (
              <View key={property.accommodationId} style={styles.tableRow}>
                <Text style={[styles.tableCell, { flex: 2 }]} numberOfLines={1}>
                  {property.accommodationName}
                </Text>
                <Text style={[styles.tableCell, { flex: 1 }]}>
                  {property.totalLeads}
                </Text>
                <Text style={[styles.tableCell, { flex: 1 }]}>
                  {property.convertedLeads}
                </Text>
                <Text style={[styles.tableCell, { flex: 1, color: '#4CAF50', fontWeight: 'bold' }]}>
                  {property.conversionRate.toFixed(0)}%
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Export Button */}
      <View style={styles.section}>
        <TouchableOpacity 
          style={styles.exportButton}
          onPress={() => Alert.alert('Export', 'Export functionality coming soon')}
        >
          <Text style={styles.exportButtonText}>📊 Export Reports</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  header: {
    padding: 20,
    paddingBottom: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 16,
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
  refreshButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  refreshButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  filterContainer: {
    backgroundColor: '#fff',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  filterButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  filterButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#007AFF',
    marginRight: 10,
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  filterButtonActive: {
    backgroundColor: '#007AFF',
  },
  filterButtonText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '600',
  },
  filterButtonTextActive: {
    color: '#fff',
  },
  section: {
    backgroundColor: '#fff',
    padding: 20,
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -5,
  },
  metricCard: {
    width: '48%',
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderRadius: 8,
    margin: '1%',
    marginBottom: 10,
  },
  metricTitle: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  metricValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  metricSubtitle: {
    fontSize: 11,
    color: '#999',
  },
  funnelContainer: {
    marginTop: 10,
  },
  funnelStage: {
    marginBottom: 15,
  },
  funnelLabelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  funnelLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  funnelValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  funnelBarContainer: {
    height: 30,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 5,
  },
  funnelBar: {
    height: '100%',
    borderRadius: 4,
  },
  funnelPercentage: {
    fontSize: 12,
    color: '#666',
    textAlign: 'right',
  },
  table: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tableHeaderText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#666',
    textTransform: 'uppercase',
  },
  tableRow: {
    flexDirection: 'row',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  tableCell: {
    fontSize: 14,
    color: '#333',
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    fontSize: 14,
    padding: 20,
  },
  exportButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  exportButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
