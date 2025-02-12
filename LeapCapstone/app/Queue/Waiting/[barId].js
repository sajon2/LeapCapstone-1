// app/queue/waiting/[barId].js
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import axios from 'axios';
import { useAuth } from '../../AuthContext'; // Make sure path is correct
import { ProgressBar } from 'react-native-paper';
import { FontAwesome } from '@expo/vector-icons';
import BottomNavBar from '../../Users/BottomNavBar'; // Make sure path is correct

const WaitingPage = () => {
  const { barId } = useLocalSearchParams();
  console.log(barId);
  const { token } = useAuth();
  const router = useRouter();
  const [queueLength, setQueueLength] = useState(0);
  const [estimatedWaitTime, setEstimatedWaitTime] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQueueStatus = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5001/api/queue/status/${barId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setQueueLength(response.data.queueLength);
        setEstimatedWaitTime(response.data.queueLength * 2); // Example: 2 minutes per person
        setLoading(false);
      } catch (error) {
        console.error('Error fetching queue status:', error);
        Alert.alert('Error', 'Failed to fetch queue status.');
        setLoading(false);
      }
    };

    fetchQueueStatus();

     // Polling for real-time updates (optional, but good for a queue)
    const intervalId = setInterval(fetchQueueStatus, 5000); // Fetch every 5 seconds

    return () => clearInterval(intervalId); // Cleanup on unmount

  }, [barId, token]);

  const handleLeaveQueue = async () => {
    try {
      await axios.post(
        `http://localhost:5001/api/queue/${barId}/leave`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      router.replace({pathname: '/UserDashboard'});
    } catch (error) {
      console.error('Error leaving queue:', error);
      Alert.alert('Error', 'Failed to leave the queue.');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Queue Waiting Room</Text>
      </View>

      {/* Queue Details */}
      <View style={styles.contentContainer}>
        <View style={styles.queueDetailItem}>
          <FontAwesome name="users" size={24} color="#3498db" />
          <Text style={styles.queueDetailLabel}>Total in Queue:</Text>
          <Text style={styles.queueDetailValue}>{queueLength}</Text>
        </View>

        <View style={styles.queueDetailItem}>
          <FontAwesome name="clock-o" size={24} color="#3498db" />
          <Text style={styles.queueDetailLabel}>Estimated Wait Time:</Text>
          <Text style={styles.queueDetailValue}>{estimatedWaitTime} mins</Text>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressBarContainer}>
          <Text style={styles.progressBarLabel}>Queue Progress</Text>
          <ProgressBar
            progress={queueLength > 0 ? 1/queueLength: 1} //Handle showing it full if queue is 0.
            color="#3498db"
            style={styles.progressBar}
          />
        </View>

        {/* Leave Queue Button */}
        <View style={styles.divider} />
        <TouchableOpacity
          style={styles.leaveQueueButton}
          onPress={handleLeaveQueue}
        >
          <Text style={styles.leaveQueueButtonText}>Leave Queue</Text>
        </TouchableOpacity>
      </View>

      {/* Bottom Navigation */}
       <BottomNavBar />
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0', // Light grey background
  },
  header: {
    backgroundColor: 'black',
    paddingVertical: 24,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  contentContainer: {
    padding: 16,
    alignItems: 'center',
  },
  queueDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#e8f4fb', // Light blue background
    borderRadius: 8,
    marginBottom: 12,
    width: '100%',
    maxWidth: 500, // Limit width
  },
  queueDetailLabel: {
    fontSize: 18,
    fontWeight: '500',
    marginLeft: 12,
    flex: 1, // Take up available space
  },
  queueDetailValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  progressBarContainer: {
    width: '100%',
    maxWidth: 500,
    padding: 16,
  },
  progressBarLabel: {
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 8,
  },
  progressBar: {
    height: 20,
    borderRadius: 10,
  },
  divider: {
    borderBottomColor: '#cccccc',
    borderBottomWidth: StyleSheet.hairlineWidth,
    marginVertical: 16,
    width: '100%',
    maxWidth: 500,
  },
  leaveQueueButton: {
    backgroundColor: '#e74c3c', // Red color
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    width: '100%',
    maxWidth: 500,
  },
  leaveQueueButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
    loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0'
  },
});

export default WaitingPage;