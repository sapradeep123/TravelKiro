import { useState, useEffect } from 'react';
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
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Call Request Details</Text>
      </View>

      {/* Lead Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Lead Information</Text>
        
        <View style={styles.infoRow}>
          <Text style={styles.label}>Name:</Text>
          <Text style={styles.value}>{callRequest.name}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={styles.label}>Phone:</Text>
          <Text style={[styles.value, styles.phoneValue]}>{callRequest.phone}</Text>
        </View>
        
        {callRequest.email && (
          <View style={styles.infoRow}>
            <Text style={styles.label}>Email:</Text>
            <Text style={styles.value}>{callRequest.email}</Text>
          </View>
        )}
        
        {callRequest.message && (
          <View style={styles.infoRow}>
            <Text style={styles.label}>Message:</Text>
            <Text style={styles.value}>{callRequest.message}</Text>
          </View>
        )}
        
        <View style={styles.infoRow}>
          <Text style={styles.label}>Created:</Text>
          <Text style={styles.value}>
            {new Date(callRequest.createdAt).toLocaleString()}
          </Text>
        </View>
      </View>

      {/* Accommodation Details */}
      {callRequest.accommodation && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Accommodation</Text>
          <TouchableOpacity
            onPress={() => router.push(`/admin/edit-accommodation?id=${callRequest.accommodation?.id}`)}
          >
            <Text style={styles.accommodationName}>{callRequest.accommodation.name}</Text>
            <Text style={styles.accommodationType}>{callRequest.accommodation.type}</Text>
            <Text style={styles.accommodationLocation}>
              {callRequest.accommodation.area}, {callRequest.accommodation.state}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Status & Priority */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Status & Priority</Text>
        
        <Text style={styles.label}>Status:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.statusButtons}>
          {STATUS_OPTIONS.map(status => (
            <TouchableOpacity
              key={status}
              style={[
                styles.statusButton,
                callRequest.status === status && styles.statusButtonActive
              ]}
              onPress={() => handleStatusChange(status)}
            >
              <Text style={[
                styles.statusButtonText,
                callRequest.status === status && styles.statusButtonTextActive
              ]}>
                {status}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        
        <Text style={[styles.label, { marginTop: 15 }]}>Priority:</Text>
        <View style={styles.priorityButtons}>
          {PRIORITY_OPTIONS.map(priority => (
            <TouchableOpacity
              key={priority}
              style={[
                styles.priorityButton,
                callRequest.priority === priority && styles.priorityButtonActive
              ]}
              onPress={() => handlePriorityChange(priority)}
            >
              <Text style={[
                styles.priorityButtonText,
                callRequest.priority === priority && styles.priorityButtonTextActive
              ]}>
                {priority}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Scheduled Callback */}
      {callRequest.scheduledCallDate && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Scheduled Callback</Text>
          <Text style={styles.scheduledDate}>
            {new Date(callRequest.scheduledCallDate).toLocaleString()}
          </Text>
        </View>
      )}

      {/* Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Actions</Text>
        
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => setShowAddInteraction(!showAddInteraction)}
        >
          <Text style={styles.actionButtonText}>
            {showAddInteraction ? '− Cancel' : '+ Add Interaction'}
          </Text>
        </TouchableOpacity>
        
        {showAddInteraction && (
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
        )}
        
        <TouchableOpacity
          style={[styles.actionButton, { marginTop: 10 }]}
          onPress={() => setShowScheduleCallback(!showScheduleCallback)}
        >
          <Text style={styles.actionButtonText}>
            {showScheduleCallback ? '− Cancel' : '📅 Schedule Callback'}
          </Text>
        </TouchableOpacity>
        
        {showScheduleCallback && (
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
        )}
      </View>

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
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    marginBottom: 10,
  },
  backButtonText: {
    color: '#007AFF',
    fontSize: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
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
  infoRow: {
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    color: '#333',
  },
  phoneValue: {
    color: '#007AFF',
    fontWeight: '600',
  },
  accommodationName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 4,
  },
  accommodationType: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  accommodationLocation: {
    fontSize: 14,
    color: '#666',
  },
  statusButtons: {
    marginTop: 10,
  },
  statusButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#007AFF',
    marginRight: 10,
    backgroundColor: '#fff',
  },
  statusButtonActive: {
    backgroundColor: '#007AFF',
  },
  statusButtonText: {
    color: '#007AFF',
    fontSize: 12,
    fontWeight: '600',
  },
  statusButtonTextActive: {
    color: '#fff',
  },
  priorityButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
  },
  priorityButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#FF9800',
    marginRight: 10,
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  priorityButtonActive: {
    backgroundColor: '#FF9800',
  },
  priorityButtonText: {
    color: '#FF9800',
    fontSize: 14,
    fontWeight: '600',
  },
  priorityButtonTextActive: {
    color: '#fff',
  },
  scheduledDate: {
    fontSize: 16,
    color: '#FF9800',
    fontWeight: '600',
  },
  actionButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  form: {
    marginTop: 15,
    padding: 15,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  typeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#007AFF',
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: '#fff',
  },
  typeButtonActive: {
    backgroundColor: '#007AFF',
  },
  typeButtonText: {
    color: '#007AFF',
    fontSize: 12,
    fontWeight: '600',
  },
  typeButtonTextActive: {
    color: '#fff',
  },
  submitButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 15,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#007AFF',
    marginTop: 5,
    marginRight: 15,
  },
  timelineContent: {
    flex: 1,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  timelineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  timelineType: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  timelineOutcome: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  timelineNotes: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
  },
  timelineNextAction: {
    fontSize: 13,
    color: '#FF9800',
    fontWeight: '600',
    marginBottom: 4,
  },
  timelineDuration: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  timelineDate: {
    fontSize: 12,
    color: '#999',
  },
  historyItem: {
    padding: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    marginBottom: 10,
  },
  historyStatus: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  historyNotes: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
  },
  historyDate: {
    fontSize: 12,
    color: '#999',
  },
});
