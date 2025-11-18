import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { groupTravelService } from '../src/services/groupTravelService';

export default function CreateGroupTravelScreen() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [customCountry, setCustomCountry] = useState('');
  const [customState, setCustomState] = useState('');
  const [customArea, setCustomArea] = useState('');
  const [travelDate, setTravelDate] = useState(new Date(Date.now() + 6 * 24 * 60 * 60 * 1000));
  const [expiryDate, setExpiryDate] = useState(new Date(Date.now() + 3 * 24 * 60 * 60 * 1000));
  const [showTravelDatePicker, setShowTravelDatePicker] = useState(false);
  const [showExpiryDatePicker, setShowExpiryDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (!customCountry || !customState || !customArea) {
      Alert.alert('Error', 'Please provide location details');
      return;
    }

    const minTravelDate = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000);
    if (travelDate < minTravelDate) {
      Alert.alert('Error', 'Travel date must be at least 5 days from now');
      return;
    }

    if (expiryDate >= travelDate) {
      Alert.alert('Error', 'Expiry date must be before travel date');
      return;
    }

    setLoading(true);
    try {
      await groupTravelService.createGroupTravel({
        title: title.trim(),
        description: description.trim(),
        customCountry,
        customState,
        customArea,
        travelDate: travelDate.toISOString(),
        expiryDate: expiryDate.toISOString(),
      });

      Alert.alert('Success', 'Group travel created successfully', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error || 'Failed to create group travel');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="close" size={28} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Group Travel</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.label}>
            Title <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="e.g., Weekend Trip to Mountains"
            placeholderTextColor="#999"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>
            Description <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Describe your group travel plan..."
            placeholderTextColor="#999"
            multiline
            numberOfLines={4}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Location</Text>
          
          <Text style={styles.label}>
            Country <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            value={customCountry}
            onChangeText={setCustomCountry}
            placeholder="e.g., India"
            placeholderTextColor="#999"
          />

          <Text style={styles.label}>
            State <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            value={customState}
            onChangeText={setCustomState}
            placeholder="e.g., Himachal Pradesh"
            placeholderTextColor="#999"
          />

          <Text style={styles.label}>
            Area <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            value={customArea}
            onChangeText={setCustomArea}
            placeholder="e.g., Manali"
            placeholderTextColor="#999"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>
            Travel Date <Text style={styles.required}>*</Text>
          </Text>
          <Text style={styles.hint}>Must be at least 5 days from now</Text>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowTravelDatePicker(true)}
          >
            <Ionicons name="calendar-outline" size={20} color="#007AFF" />
            <Text style={styles.dateText}>
              {travelDate.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </Text>
          </TouchableOpacity>
          {showTravelDatePicker && (
            <DateTimePicker
              value={travelDate}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={(event: DateTimePickerEvent, selectedDate?: Date) => {
                setShowTravelDatePicker(Platform.OS === 'ios');
                if (selectedDate) {
                  setTravelDate(selectedDate);
                }
              }}
              minimumDate={new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)}
            />
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>
            Interest Expiry Date <Text style={styles.required}>*</Text>
          </Text>
          <Text style={styles.hint}>Last date for users to express interest</Text>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowExpiryDatePicker(true)}
          >
            <Ionicons name="calendar-outline" size={20} color="#007AFF" />
            <Text style={styles.dateText}>
              {expiryDate.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </Text>
          </TouchableOpacity>
          {showExpiryDatePicker && (
            <DateTimePicker
              value={expiryDate}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={(event: DateTimePickerEvent, selectedDate?: Date) => {
                setShowExpiryDatePicker(Platform.OS === 'ios');
                if (selectedDate) {
                  setExpiryDate(selectedDate);
                }
              }}
              minimumDate={new Date()}
              maximumDate={new Date(travelDate.getTime() - 24 * 60 * 60 * 1000)}
            />
          )}
        </View>

        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={styles.submitButtonText}>
            {loading ? 'Creating...' : 'Create Group Travel'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  section: {
    backgroundColor: '#FFF',
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  required: {
    color: '#FF3B30',
  },
  hint: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
    backgroundColor: '#FFF',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    gap: 8,
  },
  dateText: {
    fontSize: 16,
    color: '#333',
  },
  submitButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    margin: 16,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
