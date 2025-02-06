// app/bar/[barId]/manage-queue.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Modal,
  Alert,
  ActivityIndicator, // For loading indicator
} from 'react-native';
import { ProgressBar } from 'react-native-paper'; // For the progress bar.  Install: npm install react-native-paper
import axios from 'axios';
import { useAuth } from '../../AuthContext'; // Make sure path is correct
import { useLocalSearchParams, useRouter } from 'expo-router';

const ManageQueue = () => {
  const { barId } = useLocalSearchParams();
  const [isQueueOpen, setIsQueueOpen] = useState(false);
  const [queue, setQueue] = useState([]);
  const { token } = useAuth();
  const [isModalVisible, setIsModalVisible] = useState(false); // Combined modal visibility
  const [modalType, setModalType] = useState(''); // 'open' or 'close'
  const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);


  useEffect(() => {
    const fetchQueueStatus = async () => {
      setIsLoading(true); // Start loading
      try {
        const response = await axios.get(
          `http://localhost:5001/api/queue/status/${barId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setIsQueueOpen(response.data.isQueueOpen);
        setQueue(response.data.queue);
      } catch (error) {
        console.error('Error fetching queue status:', error);
        Alert.alert('Error', 'Failed to fetch queue status.');
      } finally {
        setIsLoading(false); // End loading
      }
    };

    fetchQueueStatus();
  }, [token, barId]);

  const handleOpenQueue = async () => {
    setIsLoading(true);
    try {
      await axios.post(
        `http://localhost:5001/api/queue/open/${barId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setIsQueueOpen(true);
      setQueue([]);
      setIsModalVisible(false); // Close modal
      Alert.alert('Success', 'Queue opened successfully.');
    } catch (error) {
      console.error('Error opening queue:', error);
       Alert.alert('Error', 'Failed to open queue.');
    } finally {
        setIsLoading(false);
    }
  };

  const handleCloseQueue = async () => {
    setIsLoading(true);
    try {
      await axios.post(
        `http://localhost:5001/api/queue/close/${barId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setIsQueueOpen(false);
      setQueue([]);
      setIsModalVisible(false); // Close modal
       Alert.alert('Success', 'Queue closed successfully.');
    } catch (error) {
      console.error('Error closing queue:', error);
      Alert.alert('Error', 'Failed to close queue.');
    } finally {
        setIsLoading(false);
    }
  };

    const openModal = (type) => {
        setModalType(type);
        setIsModalVisible(true);
    };

    const closeModal = () => {
        setIsModalVisible(false);
    };

  const renderQueueItem = ({ item }) => (
    <View style={styles.queueItem}>
      <Text style={styles.queueItemText}>
        <Text style={styles.bold}>Name:</Text> {item.name}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Manage Queue</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
      </View>

      {/* Middle Section */}
      <View style={styles.middleSection}>
        {isLoading ? (
          <ActivityIndicator size="large" color="#0000ff" />
        ) : !isQueueOpen ? (
          <TouchableOpacity style={styles.openQueueButton} onPress={() => openModal('open')}>
            <Text style={styles.openQueueButtonText}>Open Queue</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.queueManagement}>
            <Text style={styles.queueManagementTitle}>Queue Management</Text>
             <ProgressBar
                progress={queue.length / 250}
                color="#4CAF50" // Green
                style={styles.progressBar}
            />
            <View style={styles.divider} />
            <FlatList
              data={queue}
              renderItem={renderQueueItem}
              keyExtractor={(item, index) => index.toString()} // Use index as key
              style={styles.queueList}
            />
            <TouchableOpacity style={styles.closeQueueButton} onPress={() => openModal('close')}>
              <Text style={styles.closeQueueButtonText}>Close Queue</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>Footer Content</Text>
      </View>

      {/* Modal */}
      <Modal visible={isModalVisible} animationType="slide" transparent={true} onRequestClose={closeModal}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalHeader}>
              {modalType === 'open' ? 'Open Queue' : 'Close Queue'}
            </Text>
             <Text style={styles.modalText}>
                Are you sure you want to {modalType === 'open' ? 'open' : 'close'} the queue?
            </Text>
            <View style = {styles.modalButtons}>
                <TouchableOpacity
                style={[styles.modalButton, modalType === 'open' ? styles.modalConfirmButton : styles.modalCancelButton]}
                onPress={modalType === 'open' ? handleOpenQueue : handleCloseQueue}
                >
                <Text style={styles.modalButtonText}>Yes</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.modalButton} onPress={closeModal}>
                <Text style={styles.modalButtonText}>No</Text>
                </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
  },
  header: {
    backgroundColor: 'black',
    width: '100%',
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  backButton: {
    borderColor: 'white',
    borderWidth: 1,
    padding: 8,
    borderRadius: 4,
  },
  backButtonText: {
    color: 'white',
  },
  middleSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20, // Add padding for spacing
    backgroundColor: 'white'
  },
    openQueueButton: {
    backgroundColor: '#3498db', // Blue color
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    width: '80%', // Adjust width as necessary
    maxWidth: 400, // Maximum width
  },
  openQueueButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
   queueManagement: {
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  queueManagementTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333', // Dark grey color
    marginBottom: 10,
  },
    progressBar: {
    height: 20, // Height of the progress bar
    width: '100%', // Full width
    marginBottom: 10, // Margin bottom
  },
    divider: {
    borderBottomColor: '#ccc',
    borderBottomWidth: StyleSheet.hairlineWidth,
    width: '100%',
    marginBottom: 20,
  },
   queueList: {
    width: '100%', // Full width
  },
    queueItem: {
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ccc',
  },
  queueItemText: {
    fontSize: 16,
  },
    closeQueueButton: {
    backgroundColor: '#e74c3c', // Red color
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    width: '100%',
    marginTop: 20,
  },
  closeQueueButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
   bold: {
    fontWeight: 'bold',
  },
  footer: {
    backgroundColor: 'black',
    width: '100%',
    padding: 16,
    alignItems: 'center',
  },
  footerText: {
    color: 'white',
    fontSize: 14,
  },
    modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
  },
  modalHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
    modalText: {
        fontSize: 16,
        marginBottom: 20,
        textAlign: 'center'
    },
    modalButtons:{
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
    },
  modalButton: {
    padding: 10,
    borderRadius: 5,
    width: '40%', // Adjust as needed
    alignItems: 'center',
  },
    modalConfirmButton:{
      backgroundColor: '#3498db'
    },
    modalCancelButton:{
       backgroundColor: '#e74c3c'
    },
  modalButtonText: {
    color: 'white',
     fontWeight: 'bold'
  },
});

export default ManageQueue;