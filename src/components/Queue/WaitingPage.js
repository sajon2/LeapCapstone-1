import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  VStack,
  Text,
  Button,
  Progress,
  Spinner,
  Flex,
  Divider,
  Icon,
} from '@chakra-ui/react';
import { FaClock, FaUsers } from 'react-icons/fa';
import axios from 'axios';
import { useAuth } from '../../AuthContext';
import BottomNavBar from '../Users/BottomNavBar'; // Import Bottom Navigation Bar

const WaitingPage = () => {
  const { barId } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();
  const [queueLength, setQueueLength] = useState(0);
  const [estimatedWaitTime, setEstimatedWaitTime] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQueueStatus = async () => {
      try {
        const response = await axios.get(`http://localhost:5001/api/queue/status/${barId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setQueueLength(response.data.queueLength);
        setEstimatedWaitTime(response.data.queueLength * 2); // Example: 2 minutes per person
        setLoading(false);
      } catch (error) {
        console.error('Error fetching queue status:', error);
        setLoading(false);
      }
    };

    fetchQueueStatus();
  }, [barId, token]);

  const handleLeaveQueue = async () => {
    try {
      await axios.post(`http://localhost:5001/api/queue/${barId}/leave`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      navigate('/user-dashboard');
    } catch (error) {
      console.error('Error leaving queue:', error);
    }
  };

  if (loading) {
    return (
      <Flex justify="center" align="center" height="100vh">
        <Spinner size="xl" />
      </Flex>
    );
  }

  return (
    <Box minHeight="100vh" bg="gray.100" pb="80px">
      <Box bg="gray.900" py={6} px={4} textAlign="center" color="white">
        <Text fontSize="2xl" fontWeight="bold">Queue Waiting Room</Text>
      </Box>

      <VStack spacing={6} align="stretch" maxW="500px" mx="auto" mt={10} p={4} bg="white" borderRadius="md" shadow="md">
        {/* Queue Details */}
        <Flex align="center" justify="space-between" p={4} bg="blue.50" borderRadius="md">
          <Flex align="center">
            <Icon as={FaUsers} boxSize={6} color="blue.500" />
            <Text fontSize="lg" ml={3} fontWeight="medium">Total in Queue:</Text>
          </Flex>
          <Text fontSize="lg" fontWeight="bold">{queueLength}</Text>
        </Flex>

        <Flex align="center" justify="space-between" p={4} bg="blue.50" borderRadius="md">
          <Flex align="center">
            <Icon as={FaClock} boxSize={6} color="blue.500" />
            <Text fontSize="lg" ml={3} fontWeight="medium">Estimated Wait Time:</Text>
          </Flex>
          <Text fontSize="lg" fontWeight="bold">{estimatedWaitTime} mins</Text>
        </Flex>

        {/* Progress Bar */}
        <Box p={4}>
          <Text fontSize="lg" fontWeight="medium" mb={2}>Queue Progress</Text>
          <Progress value={(queueLength ? (1 / queueLength) * 100 : 100)} size="lg" colorScheme="blue" />
        </Box>

        {/* Leave Queue Button */}
        <Divider />
        <Button colorScheme="red" size="lg" onClick={handleLeaveQueue} mt={4}>
          Leave Queue
        </Button>
      </VStack>

      {/* Bottom Navigation */}
      <BottomNavBar />
    </Box>
  );
};

export default WaitingPage;
