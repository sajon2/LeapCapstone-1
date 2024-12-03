import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, VStack, Image, Text, Button, Spinner, Flex, Divider, HStack } from '@chakra-ui/react';
import axios from 'axios';
import { useAuth } from '../../AuthContext';
import BottomNavBar from '../Users/BottomNavBar';

const VenueProfile = () => {
  const { barId } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();
  const [bar, setBar] = useState(null);
  const [queueStatus, setQueueStatus] = useState(null);
  const [isInQueue, setIsInQueue] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVenue = async () => {
      try {
        // Fetch bar details
        const barResponse = await axios.get(`http://localhost:5001/api/bars/${barId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setBar(barResponse.data);

        // Fetch queue details
        try {
          const queueResponse = await axios.get(`http://localhost:5001/api/queue/status/${barId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setQueueStatus(queueResponse.data);

          // Check if the current user is in the queue
          const currentUserId = (await axios.get(`http://localhost:5001/me`, {
            headers: { Authorization: `Bearer ${token}` },
          })).data._id;

          const userInQueue = queueResponse.data.queue.some(
            (user) => user.userId === currentUserId
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
      navigate(`/queue/waiting/${barId}`);
    } catch (error) {
      console.error('Error joining queue:', error.response || error.message);
      if (error.response?.status === 400 && error.response?.data?.msg === 'User already in queue') {
        navigate(`/queue/waiting/${barId}`); // Redirect to waiting page if already in queue
      }
    }
  };

  const handleViewQueue = () => {
    navigate(`/queue/waiting/${barId}`);
  };

  if (loading) {
    return (
      <Flex justify="center" align="center" height="100vh">
        <Spinner size="xl" />
      </Flex>
    );
  }

  if (!bar) {
    return (
      <Flex justify="center" align="center" height="100vh">
        <Text fontSize="lg" color="red.500">
          Venue details could not be loaded. Please try again later.
        </Text>
      </Flex>
    );
  }

  return (
    <Box minHeight="100vh" bg="gray.100" pb="80px">
      {/* Header */}
      <Box bg="gray.900" py={6} px={4} textAlign="center" color="white">
        <Text fontSize="2xl" fontWeight="bold">Leap</Text>
      </Box>

      {/* Content Section */}
      <VStack spacing={4} align="stretch" maxW="600px" mx="auto" mt={6} p={4} bg="white" borderRadius="md" shadow="md">
        {/* Venue Image */}
        {bar.imageUrl && (
          <Image
            src={`http://localhost:5001${bar.imageUrl}`}
            alt={bar.name}
            width="100%"
            height="300px"
            objectFit="cover"
            borderRadius="md"
          />
        )}

        {/* Venue Details */}
        <VStack spacing={2} align="stretch">
          <Text fontSize="lg" fontWeight="bold">
            Location: <Text as="span" fontWeight="normal">{bar.location}</Text>
          </Text>
          <Text fontSize="lg" fontWeight="bold">
            Description: <Text as="span" fontWeight="normal">{bar.description || 'No description provided.'}</Text>
          </Text>
        </VStack>

        <Divider />

        {/* Queue Buttons */}
        <VStack spacing={3} align="stretch">
          {queueStatus ? (
            queueStatus.isQueueOpen ? (
              <Button
                colorScheme="blue"
                size="lg"
                onClick={isInQueue ? handleViewQueue : handleJoinQueue}
              >
                {isInQueue ? 'View Queue' : 'Join Queue'}
              </Button>
            ) : (
              <Text fontSize="lg" color="red.500" fontWeight="bold">
                Queue is not open
              </Text>
            )
          ) : (
            <Text fontSize="lg" color="gray.500">
              Queue details are currently unavailable.
            </Text>
          )}
        </VStack>
      </VStack>

      {/* Footer */}
      <BottomNavBar />
    </Box>
  );
};

export default VenueProfile;

