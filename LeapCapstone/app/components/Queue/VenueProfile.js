// app/venue/[barId].js
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import axios from 'axios';
import { useAuth } from '../../AuthContext';
import BottomNavBar from '../../components/Users/BottomNavBar'; // Adjust path as needed

const VenueProfile = () => {
  const { barId } = useLocalSearchParams();
  const { token } = useAuth();
  const router = useRouter();
  const [bar, setBar] = useState(null);
  const [queueStatus, setQueueStatus] = useState(null);
  const [isInQueue, setIsInQueue] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVenue = async () => {
      try {
        // Fetch bar details
        const barResponse = await axios.get(
          `http://localhost:5001/api/bars/${barId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setBar(barResponse.data);

        // Fetch queue details
        try {
          const queueResponse = await axios.get(
            `http://localhost:5001/api/queue/status/${barId}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          setQueueStatus(queueResponse.data);

            // Check if the current user is in the queue
            const meResponse = await axios.get(`http://localhost:5001/me`, {
            headers: { Authorization: `Bearer ${token}` },
            });

          const userInQueue = queueResponse.data.queue.some(
            (user) => user.userId === meResponse.data._id
          );
          setIsInQueue(userInQueue);
        } catch (error) {
          if (error.response?.status === 404) {
            setQueueStatus(null); // Queue not found
          } else {
            throw error; // Re-throw other errors
          }
        }
      } catch (error) {
        console.error('Error fetching venue or queue details:', error);
        Alert.alert('Error', 'Failed to load venue details.');
      } finally {
        setLoading(false);
      }
    };

    fetchVenue();
  }, [barId, token]);

  const handleJoinQueue = async () => {
    try {
      await axios.post(
        `http://localhost:5001/api/queue/${barId}/join`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
        router.push({pathname: `/queue/waiting/${barId}`});
    } catch (error) {
      console.error('Error joining queue:', error.response || error.message);
       if (error.response?.status === 400 && error.response?.data?.msg === 'User already in queue') {
        router.replace({pathname: `/queue/waiting/${barId}`}); // Redirect to waiting page if already in queue
      }
      else{
        Alert.alert('Error', 'Failed to join the queue.');
      }

    }
  };

  const handleViewQueue = () => {
    router.push({pathname: `/queue/waiting/${barId}`});
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (!bar) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>
          Venue details could not be loaded. Please try again later.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Leap</Text>
      </View>

      {/* Content Section */}
      <ScrollView contentContainerStyle={styles.contentContainer}>
        {/* Venue Image */}
        {bar.imageUrl && (
          <Image
            source={{ uri: `http://localhost:5001${bar.imageUrl}` }}
            style={styles.venueImage}
          />
        )}

        {/* Venue Details */}
        <View style={styles.detailsContainer}>
          <Text style={styles.detailLabel}>
            Location:{' '}
            <Text style={styles.detailText}>{bar.location}</Text>
          </Text>
          <Text style={styles.detailLabel}>
            Description:{' '}
            <Text style={styles.detailText}>
              {bar.description || 'No description provided.'}
            </Text>
          </Text>
        </View>

        <View style={styles.divider} />

        {/* Queue Buttons */}
        <View style={styles.buttonsContainer}>
          {queueStatus ? (
            queueStatus.isQueueOpen ? (
              <TouchableOpacity
                style={styles.joinQueueButton}
                onPress={isInQueue ? handleViewQueue : handleJoinQueue}
              >
                <Text style={styles.joinQueueButtonText}>
                  {isInQueue ? 'View Queue' : 'Join Queue'}
                </Text>
              </TouchableOpacity>
            ) : (
              <Text style={styles.queueClosedText}>Queue is not open</Text>
            )
          ) : (
            <Text style={styles.queueUnavailableText}>
              Queue details are currently unavailable.
            </Text>
          )}
        </View>
      </ScrollView>

      {/* Footer */}
      <BottomNavBar />
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
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
  venueImage: {
    width: '100%',
    height: 300,
    borderRadius: 8,
    marginBottom: 16,
  },
  detailsContainer: {
    width: '100%',
    marginBottom: 16,
  },
  detailLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  detailText: {
    fontSize: 18,
    fontWeight: 'normal',
  },
  divider: {
    borderBottomColor: '#cccccc',
    borderBottomWidth: StyleSheet.hairlineWidth,
    marginVertical: 16,
    width: '100%',
  },
  buttonsContainer: {
    width: '100%',
  },
  joinQueueButton: {
    backgroundColor: '#3498db',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  joinQueueButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  queueClosedText: {
    fontSize: 18,
    color: 'red',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  queueUnavailableText: {
    fontSize: 18,
    color: 'gray',
    textAlign: 'center',
  },
    loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0', // Consistent background color
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0', // Consistent background color
  },
  errorText: {
    fontSize: 16,
    color: 'red',
  },
});

export default VenueProfile;