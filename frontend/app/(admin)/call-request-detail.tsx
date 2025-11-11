import { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator, TextInput } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { accommodationService } from '../../src/services/accommodationService';
import { AccommodationCallRequest, CallRequestStatus, Priority, InteractionType, CallOutcome } from '../../src/types';

const STATUS_OPTIONS: CallRequestStatus[] = ['NEW', 'CONTACTED', 'QUALIFIED', 'FOLLOW_UP', 'SCHEDULED', 'CONVERTED', 'LOST', 'INVALID'];
const PRIORITY_OPTIONS: Priority[] = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];
const INTERACTION_TYPES: InteractionType[] = ['CALL', 'EMAIL', 'SMS', 'WHATSAPP', 'NOTE', 'STATUS_CHANGE'];
const CALL_OUTCOMES: CallOutcome[] = ['CONNECTED', 'NO_ANSWER', 'BUSY', 'WRONG_NUMBER', 'VOICEMAIL', 'CALLBACK_REQUESTED'];

export default function CallRequestDetail() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const scrollViewRef = useRef<ScrollView>(null);
  const [loading, setLoading] = useState(true);
  const [callRequest, setCallRequest] = useState<AccommodationCallRequest | null>(null);
  const [showAddInteraction, setShowAddInteraction] = useState(false);
  const [showScheduleCallback, setShowScheduleCallback] = useState(false);
  
  // Interaction form
  const [interactionForm, setInteractionForm] = useState({
    type: 'CALL' as InteractionType,
    outcome: 'CONNECTED' as CallOutcome,
    duration: '',
    notes: '',
    nextAction: '',
    followUpDate: '',
  });

  // Callback form
  const [callbackForm, setCallbackForm] = useState({
    scheduledDate: '',
    notes: '',
  });

  useEffect(() => {
    if (id) {
      loadCallRequest();
    }
  }, [id]);

  const loadCallRequest = async () => {
    try {
      setLoading(true);
      const data = await accommodationService.getCallRequestById(id as string);
      setCallRequest(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load call request');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: CallRequestStatus) => {
    try {
      await accommodationService.updateCallStatus(id as string, newStatus);
      Alert.alert('Success', 'Status updated successfully');
      loadCallRequest();
    } catch (error) {
      Alert.alert('Error', 'Failed to update status');
    }
  };

  const handlePriorityChange = async (newPriority: Priority) => {
    try {
      await accommodationService.updatePriority(id as string, newPriority);
      Alert.alert('Success', 'Priority updated successfully');
      loadCallRequest();
    } catch (error) {
      Alert.alert('Error', 'Failed to update priority');
    }
  };

  const handleAddInteraction = async () => {
    if (!interactionForm.notes.trim()) {
      Alert.alert('Error', 'Please add notes');
      return;
    }

    try {
      const data: any = {
        type: interactionForm.type,
        notes: interactionForm.notes,
      };

      if (interactionForm.type === 'CALL') {
        data.outcome = interactionForm.outcome;
        if (interactionForm.duration) {
          data.duration = parseInt(interactionForm.duration);
        }
      }

      if (interactionForm.nextAction) {
        data.nextAction = interactionForm.nextAction;
      }

      if (interactionForm.followUpDate) {
        data.followUpDate = interactionForm.followUpDate;
      }

      await accommodationService.addInteraction(id as string, data);
      Alert.alert('Success', 'Interaction added successfully');
      
      // Reset form
      setInteractionForm({
        type: 'CALL',
        outcome: 'CONNECTED',
        duration: '',
        notes: '',
        nextAction: '',
        followUpDate: '',
      });
      setShowAddInteraction(false);
      loadCallRequest();
    } catch (error) {
      Alert.alert('Error', 'Failed to add interaction');
    }
  };

  const handleScheduleCallback = async () => {
    if (!callbackForm.scheduledDate) {
      Alert.alert('Error', 'Please select a date');
      return;
    }

    try {
      await accommodationService.scheduleCallback(id as string, callbackForm.scheduledDate);
      Alert.alert('Success', 'Callback scheduled successfully');
      
      // Reset form
      setCallbackForm({
        scheduledDate: '',
        notes: '',
      });
      setShowScheduleCallback(false);
      loadCallRequest();
    } catch (error) {
      Alert.alert('Error', 'Failed to schedule callback');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading call request...</Text>
      </View>
    );
  }

  if (!callRequest) {
    return null;
  }

  return (
    <ScrollView ref={scrollViewRef} style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push('/(admin)/call-requests')} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back to CRM</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{callRequest.name}</Text>
        <View style={styles.headerBadges}>
          <View style={[styles.badge, styles.statusBadge]}>
            <Text style={styles.badgeText}>{callRequest.status}</Text>
          </View>
          <View style={[styles.badge, styles.priorityBadge]}>
            <Text style={styles.badgeText}>{callRequest.priority}</Text>
          </View>
        </View>
      </View>

      {/* All-in-One Info Section */}
      <View style={styles.section}>
        <View style={styles.compactRow}>
          <Text style={styles.compactLabel}>📞</Text>
          <Text style={styles.compactValue}>{callRequest.phone}</Text>
        </View>
        {callRequest.email && (
          <View style={styles.compactRow}>
            <Text style={styles.compactLabel}>✉️</Text>
            <Text style={styles.compactValue}>{callRequest.email}</Text>
          </View>
        )}
        {callRequest.message && (
          <View style={styles.compactRow}>
            <Text style={styles.compactLabel}>💬</Text>
            <Text style={styles.compactValue}>{callRequest.message}</Text>
          </View>
        )}
        {callRequest.accommodation && (
          <View style={styles.compactRow}>
            <Text style={styles.compactLabel}>🏨</Text>
            <Text style={styles.compactValue}>
              {callRequest.accommodation.name} • {callRequest.accommodation.area}
            </Text>
          </View>
        )}
        <View style={styles.compactRow}>
          <Text style={styles.compactLabel}>📅</Text>
          <Text style={styles.compactValue}>
            {new Date(callRequest.createdAt).toLocaleDateString()}
            {callRequest.scheduledCallDate && ` • Callback: ${new Date(callRequest.scheduledCallDate).toLocaleDateString()}`}
          </Text>
        </View>
      </View>

      {/* Quick Actions & Status Update Combined */}
      <View style={styles.section}>
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[styles.actionBtn, showAddInteraction && styles.actionBtnActive]}
            onPress={() => {
              const newValue = !showAddInteraction;
              setShowAddInteraction(newValue);
              setShowScheduleCallback(false);
              if (newValue) {
                setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
              }
            }}
          >
            <Text style={styles.actionBtnText}>+ Interaction</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionBtn, showScheduleCallback && styles.actionBtnActive]}
            onPress={() => {
              const newValue = !showScheduleCallback;
              setShowScheduleCallback(newValue);
              setShowAddInteraction(false);
              if (newValue) {
                setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
              }
            }}
          >
            <Text style={styles.actionBtnText}>📅 Callback</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.divider} />
        
        <Text style={styles.miniLabel}>Status:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.buttonScroll}>
          {STATUS_OPTIONS.map(status => (
            <TouchableOpacity
              key={status}
              style={[
                styles.miniButton,
                callRequest.status === status && styles.miniButtonActive
              ]}
              onPress={() => handleStatusChange(status)}
            >
              <Text style={[
                styles.miniButtonText,
                callRequest.status === status && styles.miniButtonTextActive
              ]}>
                {status.replace('_', ' ')}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        
        <Text style={styles.miniLabel}>Priority:</Text>
        <View style={styles.buttonRow}>
          {PRIORITY_OPTIONS.map(priority => (
            <TouchableOpacity
              key={priority}
              style={[
                styles.miniButton,
                callRequest.priority === priority && styles.miniButtonActive
              ]}
              onPress={() => handlePriorityChange(priority)}
            >
              <Text style={[
                styles.miniButtonText,
                callRequest.priority === priority && styles.miniButtonTextActive
              ]}>
                {priority}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Add Interaction Form */}
      {showAddInteraction && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Add Interaction</Text>
          <View style={styles.form}>
            <Text style={styles.formLabel}>Type:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {INTERACTION_TYPES.map(type => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.typeButton,
                    interactionForm.type === type && styles.typeButtonActive
                  ]}
                  onPress={() => setInteractionForm({ ...interactionForm, type })}
                >
                  <Text style={[
                    styles.typeButtonText,
                    interactionForm.type === type && styles.typeButtonTextActive
                  ]}>
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            
            {interactionForm.type === 'CALL' && (
              <>
                <Text style={styles.formLabel}>Outcome:</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {CALL_OUTCOMES.map(outcome => (
                    <TouchableOpacity
                      key={outcome}
                      style={[
                        styles.typeButton,
                        interactionForm.outcome === outcome && styles.typeButtonActive
                      ]}
                      onPress={() => setInteractionForm({ ...interactionForm, outcome })}
                    >
                      <Text style={[
                        styles.typeButtonText,
                        interactionForm.outcome === outcome && styles.typeButtonTextActive
                      ]}>
                        {outcome}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
                
                <Text style={styles.formLabel}>Duration (minutes):</Text>
                <TextInput
                  style={styles.input}
                  value={interactionForm.duration}
                  onChangeText={(text) => setInteractionForm({ ...interactionForm, duration: text })}
                  placeholder="Enter duration"
                  keyboardType="numeric"
                />
              </>
            )}
            
            <Text style={styles.formLabel}>Notes: *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={interactionForm.notes}
              onChangeText={(text) => setInteractionForm({ ...interactionForm, notes: text })}
              placeholder="Enter notes"
              multiline
              numberOfLines={4}
            />
            
            <Text style={styles.formLabel}>Next Action:</Text>
            <TextInput
              style={styles.input}
              value={interactionForm.nextAction}
              onChangeText={(text) => setInteractionForm({ ...interactionForm, nextAction: text })}
              placeholder="What's the next step?"
            />
            
            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleAddInteraction}
            >
              <Text style={styles.submitButtonText}>Add Interaction</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
      
      {/* Schedule Callback Form */}
      {showScheduleCallback && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Schedule Callback</Text>
          <View style={styles.form}>
            <Text style={styles.formLabel}>Scheduled Date: *</Text>
            <TextInput
              style={styles.input}
              value={callbackForm.scheduledDate}
              onChangeText={(text) => setCallbackForm({ ...callbackForm, scheduledDate: text })}
              placeholder="YYYY-MM-DD HH:MM"
            />
            
            <Text style={styles.formLabel}>Notes:</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={callbackForm.notes}
              onChangeText={(text) => setCallbackForm({ ...callbackForm, notes: text })}
              placeholder="Add notes"
              multiline
              numberOfLines={3}
            />
            
            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleScheduleCallback}
            >
              <Text style={styles.submitButtonText}>Schedule Callback</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Interaction Timeline */}
      {callRequest.interactions && callRequest.interactions.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Interaction Timeline</Text>
          
          {callRequest.interactions.map((interaction, index) => (
            <View key={interaction.id} style={styles.timelineItem}>
              <View style={styles.timelineDot} />
              <View style={styles.timelineContent}>
                <View style={styles.timelineHeader}>
                  <Text style={styles.timelineType}>{interaction.type}</Text>
                  {interaction.outcome && (
                    <Text style={styles.timelineOutcome}>{interaction.outcome}</Text>
                  )}
                </View>
                
                <Text style={styles.timelineNotes}>{interaction.notes}</Text>
                
                {interaction.nextAction && (
                  <Text style={styles.timelineNextAction}>
                    Next: {interaction.nextAction}
                  </Text>
                )}
                
                {interaction.duration && (
                  <Text style={styles.timelineDuration}>
                    Duration: {interaction.duration} min
                  </Text>
                )}
                
                <Text style={styles.timelineDate}>
                  {new Date(interaction.createdAt).toLocaleString()}
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Status History */}
      {callRequest.statusHistory && callRequest.statusHistory.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Status History</Text>
          
          {callRequest.statusHistory.map((history) => (
            <View key={history.id} style={styles.historyItem}>
              <Text style={styles.historyStatus}>
                {history.fromStatus ? `${history.fromStatus} → ` : ''}{history.toStatus}
              </Text>
              {history.notes && (
                <Text style={styles.historyNotes}>{history.notes}</Text>
              )}
              <Text style={styles.historyDate}>
                {new Date(history.createdAt).toLocaleString()}
              </Text>
            </View>
          ))}
        </View>
      )}
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
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButtonText: {
    color: '#3b82f6',
    fontSize: 14,
    fontWeight: '500',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  headerBadges: {
    flexDirection: 'row',
    gap: 8,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadge: {
    backgroundColor: '#3b82f6',
  },
  priorityBadge: {
    backgroundColor: '#FF9800',
  },
  badgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  section: {
    backgroundColor: '#fff',
    padding: 12,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
  },
  compactRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  compactLabel: {
    fontSize: 16,
    width: 30,
  },
  compactValue: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  actionBtn: {
    flex: 1,
    backgroundColor: '#3b82f6',
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  actionBtnActive: {
    backgroundColor: '#1e40af',
  },
  actionBtnText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginVertical: 12,
  },
  miniLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6b7280',
    marginBottom: 6,
    marginTop: 4,
    textTransform: 'uppercase',
  },
  buttonScroll: {
    marginBottom: 8,
  },
  buttonRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 4,
  },
  miniButton: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#d1d5db',
    marginRight: 6,
    marginBottom: 6,
    backgroundColor: '#fff',
  },
  miniButtonActive: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  miniButtonText: {
    color: '#6b7280',
    fontSize: 10,
    fontWeight: '600',
  },
  miniButtonTextActive: {
    color: '#fff',
  },

  form: {
    marginTop: 10,
    padding: 12,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  formLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
    marginTop: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    backgroundColor: '#fff',
  },
  textArea: {
    minHeight: 60,
    textAlignVertical: 'top',
  },
  typeButton: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#3b82f6',
    marginRight: 6,
    marginBottom: 6,
    backgroundColor: '#fff',
  },
  typeButtonActive: {
    backgroundColor: '#3b82f6',
  },
  typeButtonText: {
    color: '#3b82f6',
    fontSize: 11,
    fontWeight: '600',
  },
  typeButtonTextActive: {
    color: '#fff',
  },
  submitButton: {
    backgroundColor: '#10b981',
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 10,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  timelineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#3b82f6',
    marginTop: 4,
    marginRight: 10,
  },
  timelineContent: {
    flex: 1,
  },
  timelineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  timelineType: {
    fontSize: 13,
    fontWeight: '700',
    color: '#3b82f6',
  },
  timelineOutcome: {
    fontSize: 11,
    color: '#6b7280',
  },
  timelineNotes: {
    fontSize: 13,
    color: '#374151',
    marginBottom: 4,
  },
  timelineNextAction: {
    fontSize: 12,
    color: '#f59e0b',
    fontWeight: '600',
    marginBottom: 2,
  },
  timelineDuration: {
    fontSize: 11,
    color: '#6b7280',
    marginBottom: 2,
  },
  timelineDate: {
    fontSize: 11,
    color: '#9ca3af',
  },
  historyItem: {
    padding: 10,
    backgroundColor: '#f9fafb',
    borderRadius: 6,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#3b82f6',
  },
  historyStatus: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 2,
  },
  historyNotes: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 2,
  },
  historyDate: {
    fontSize: 11,
    color: '#9ca3af',
  },
});
