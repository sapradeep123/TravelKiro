import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { groupTravelService } from '../src/services/groupTravelService';

interface DailyItinerary {
  day: number;
  activities: string;
  meals: string;
  accommodation: string;
}

export default function SubmitBidScreen() {
  const { groupTravelId } = useLocalSearchParams<{ groupTravelId: string }>();
  const [numberOfDays, setNumberOfDays] = useState('');
  const [accommodationDetails, setAccommodationDetails] = useState('');
  const [foodDetails, setFoodDetails] = useState('');
  const [transportDetails, setTransportDetails] = useState('');
  const [totalCost, setTotalCost] = useState('');
  const [dailyItinerary, setDailyItinerary] = useState<DailyItinerary[]>([
    { day: 1, activities: '', meals: '', accommodation: '' },
  ]);
  const [loading, setLoading] = useState(false);

  const handleAddDay = () => {
    setDailyItinerary([
      ...dailyItinerary,
      {
        day: dailyItinerary.length + 1,
        activities: '',
        meals: '',
        accommodation: '',
      },
    ]);
  };

  const handleRemoveDay = (index: number) => {
    if (dailyItinerary.length > 1) {
      const updated = dailyItinerary.filter((_, i) => i !== index);
      // Renumber days
      updated.forEach((day, i) => {
        day.day = i + 1;
      });
      setDailyItinerary(updated);
    }
  };

  const handleUpdateDay = (index: number, field: keyof DailyItinerary, value: string) => {
    const updated = [...dailyItinerary];
    updated[index] = { ...updated[index], [field]: value };
    setDailyItinerary(updated);
  };

  const handleSubmit = async () => {
    if (
      !numberOfDays ||
      !accommodationDetails.trim() ||
      !foodDetails.trim() ||
      !transportDetails.trim() ||
      !totalCost
    ) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    const days = parseInt(numberOfDays);
    if (isNaN(days) || days < 1) {
      Alert.alert('Error', 'Please enter a valid number of days');
      return;
    }

    const cost = parseFloat(totalCost);
    if (isNaN(cost) || cost <= 0) {
      Alert.alert('Error', 'Please enter a valid total cost');
      return;
    }

    // Validate daily itinerary
    for (const day of dailyItinerary) {
      if (!day.activities.trim() || !day.meals.trim() || !day.accommodation.trim()) {
        Alert.alert('Error', `Please complete all details for Day ${day.day}`);
        return;
      }
    }

    setLoading(true);
    try {
      await groupTravelService.submitBid(groupTravelId, {
        numberOfDays: days,
        accommodationDetails: accommodationDetails.trim(),
        foodDetails: foodDetails.trim(),
        transportDetails: transportDetails.trim(),
        totalCost: cost,
        dailyItinerary,
      });

      Alert.alert('Success', 'Bid submitted successfully', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error || 'Failed to submit bid');
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
        <Text style={styles.headerTitle}>Submit Bid</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.label}>
            Number of Days <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            value={numberOfDays}
            onChangeText={setNumberOfDays}
            placeholder="e.g., 5"
            placeholderTextColor="#999"
            keyboardType="numeric"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>
            Accommodation Details <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={accommodationDetails}
            onChangeText={setAccommodationDetails}
            placeholder="Describe accommodation arrangements..."
            placeholderTextColor="#999"
            multiline
            numberOfLines={3}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>
            Food Details <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={foodDetails}
            onChangeText={setFoodDetails}
            placeholder="Describe meal arrangements..."
            placeholderTextColor="#999"
            multiline
            numberOfLines={3}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>
            Transport Details <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={transportDetails}
            onChangeText={setTransportDetails}
            placeholder="Describe transportation arrangements..."
            placeholderTextColor="#999"
            multiline
            numberOfLines={3}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>
            Total Cost (₹) <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            value={totalCost}
            onChangeText={setTotalCost}
            placeholder="e.g., 25000"
            placeholderTextColor="#999"
            keyboardType="numeric"
          />
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Daily Itinerary</Text>
            <TouchableOpacity style={styles.addButton} onPress={handleAddDay}>
              <Ionicons name="add-circle" size={24} color="#007AFF" />
              <Text style={styles.addButtonText}>Add Day</Text>
            </TouchableOpacity>
          </View>

          {dailyItinerary.map((day, index) => (
            <View key={index} style={styles.dayCard}>
              <View style={styles.dayHeader}>
                <Text style={styles.dayTitle}>Day {day.day}</Text>
                {dailyItinerary.length > 1 && (
                  <TouchableOpacity onPress={() => handleRemoveDay(index)}>
                    <Ionicons name="trash-outline" size={20} color="#FF3B30" />
                  </TouchableOpacity>
                )}
              </View>

              <Text style={styles.fieldLabel}>Activities *</Text>
              <TextInput
                style={[styles.input, styles.dayInput]}
                value={day.activities}
                onChangeText={(value) => handleUpdateDay(index, 'activities', value)}
                placeholder="e.g., Morning trek, visit temple, evening bonfire"
                placeholderTextColor="#999"
                multiline
              />

              <Text style={styles.fieldLabel}>Meals *</Text>
              <TextInput
                style={[styles.input, styles.dayInput]}
                value={day.meals}
                onChangeText={(value) => handleUpdateDay(index, 'meals', value)}
                placeholder="e.g., Breakfast, Lunch, Dinner"
                placeholderTextColor="#999"
              />

              <Text style={styles.fieldLabel}>Accommodation *</Text>
              <TextInput
                style={[styles.input, styles.dayInput]}
                value={day.accommodation}
                onChangeText={(value) => handleUpdateDay(index, 'accommodation', value)}
                placeholder="e.g., Hotel XYZ, 3-star"
                placeholderTextColor="#999"
              />
            </View>
          ))}
        </View>

        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={styles.submitButtonText}>
            {loading ? 'Submitting...' : 'Submit Bid'}
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  addButtonText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
    color: '#333',
  },
  required: {
    color: '#FF3B30',
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
    height: 80,
    textAlignVertical: 'top',
  },
  dayInput: {
    marginBottom: 12,
  },
  dayCard: {
    backgroundColor: '#F9F9F9',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  dayTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
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
