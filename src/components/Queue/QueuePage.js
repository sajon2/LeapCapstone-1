import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Heading, Flex, Text, VStack, Spinner, Progress, Divider } from '@chakra-ui/react';
import axios from 'axios';
import { useAuth } from '../../AuthContext';

const QueuePage = () => {
  const { barId } = useParams();
  const [queue, setQueue] = useState([]);
  const [queueLength, setQueueLength] = useState(0);
  const [isQueueOpen, setIsQueueOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  useEffect(() => {
    const fetchQueue = async () => {
      try {
        const response = await axios.get(`http://localhost:5001/api/queue/${barId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        setQueue(response.data.queue);
        setQueueLength(response.data.queueLength);
        setIsQueueOpen(response.data.isQueueOpen);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching queue:', error);
        setLoading(false);
      }
    };

    fetchQueue();
  }, [barId, token]);

  if (loading) {
    return (
      <Flex justify="center" align="center" height="100vh">
        <Spinner size="xl" />
      </Flex>
    );
  }

  if (!isQueueOpen) {
    return (
      <Flex justify="center" align="center" height="100vh">
        <Text>The queue is currently closed.</Text>
      </Flex>
    );
  }

  return (
    <Box position="relative" minHeight="100vh" display="flex" flexDirection="column">
      {/* Header */}
      <Box bg="gray.900" width="100%" py={4} px={6} display="flex" justifyContent="space-between" alignItems="center">
        <Heading as="h1" size="lg" color="white">Queue Status</Heading>
      </Box>

      {/* Middle Section */}
      <Flex flex="1" direction="column" align="center" justify="center" bg="white" py={10} px={6}>
        <VStack spacing={4} w="full" maxW="md" align="stretch">
          <Progress value={(queueLength / 250) * 100} size="lg" colorScheme="teal" />
          <Text fontSize="lg" fontWeight="bold">Queue Length: {queueLength}</Text>
          <Divider />
          {queue.map((user, index) => (
            <Flex key={index} p={4} shadow="md" borderWidth="1px" width="100%" alignItems="center">
              <Box flex="1">
                <Heading fontSize="xl">{user.name}</Heading>
                <Text mt={2}><strong>Position:</strong> {index + 1}</Text>
              </Box>
            </Flex>
          ))}
        </VStack>
      </Flex>

      {/* Footer */}
      <Box bg="gray.900" width="100%" py={4} display="flex" justifyContent="center">
        <Text color="white" fontSize="sm">Footer Content</Text>
      </Box>
    </Box>
  );
};

export default QueuePage;
