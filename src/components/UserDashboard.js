import React, { useState, useEffect } from 'react';
import { Box, Heading, Flex, Text, Image, Button, VStack, Divider } from '@chakra-ui/react';
import axios from 'axios';
import { useAuth } from '../AuthContext';
import { useNavigate } from 'react-router-dom';

const UserDashboard = () => {
  const [bars, setBars] = useState([]);
  const { token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBars = async () => {
      try {
        const response = await axios.get('http://localhost:5001/api/bars/all', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        // Fetch the queue status for each bar
        const barsWithQueueStatus = await Promise.all(
          response.data.map(async (bar) => {
            try {
              const queueResponse = await axios.get(
                `http://localhost:5001/api/queue/status/${bar._id}`,
                {
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                }
              );
              return { ...bar, isQueueOpen: queueResponse.data.isQueueOpen };
            } catch (error) {
              console.error(`Error fetching queue status for bar ${bar._id}:`, error);
              return { ...bar, isQueueOpen: false };
            }
          })
        );

        setBars(barsWithQueueStatus);
      } catch (error) {
        console.error('Error fetching bars:', error);
      }
    };

    fetchBars();
  }, [token]);

  const handleJoinQueue = async (barId) => {
    try {
      console.log(`Attempting to join queue for bar ID: ${barId}`);
      const response = await axios.post(
        `http://localhost:5001/api/queue/${barId}/join`,
        {}, // Empty payload if not required
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log('Joined queue successfully:', response.data);
      // Handle success (e.g., navigate to another page or update UI)
    } catch (error) {
      console.error('Error joining queue:', error.response ? error.response.data : error.message);
      // Handle error (e.g., show error message to the user)
    }
  };
  

  return (
    <Box position="relative" minHeight="100vh" display="flex" flexDirection="column">
      {/* Header */}
      <Box
        bg="gray.900"
        width="100%"
        py={4}
        px={6}
        display="flex"
        justifyContent="space-between"
        alignItems="center"
      >
        <Heading as="h1" size="lg" color="white">
          User Dashboard
        </Heading>
      </Box>

      {/* Middle Section */}
      <Flex flex="1" direction="column" align="center" justify="center" py={10} px={6} bg="white">
        <VStack spacing={4} w="full" maxW="xl" align="stretch">
          <Heading as="h2" size="md" color="gray.700">
            Bars List
          </Heading>
          <Divider />
          {bars.map((bar) => (
            <Box key={bar._id} p={4} shadow="md" borderWidth="1px" width="100%">
              <Flex align="center" justify="space-between">
                <Box>
                  <Text fontWeight="bold">{bar.name}</Text>
                  <Text>{bar.location}</Text>
                </Box>
                <Image src={bar.imageUrl} alt={bar.name} boxSize="50px" />
              </Flex>
              <Button
                colorScheme="blue"
                onClick={() => handleJoinQueue(bar._id)}
                isDisabled={!bar.isQueueOpen}
                mt={2}
              >
                Join Queue
              </Button>
            </Box>
          ))}
        </VStack>
      </Flex>

      {/* Footer */}
      <Box
        bg="gray.900"
        width="100%"
        py={4}
        display="flex"
        justifyContent="center"
      >
        <Text color="white" fontSize="sm">
          Footer Content
        </Text>
      </Box>
    </Box>
  );
};

export default UserDashboard;
