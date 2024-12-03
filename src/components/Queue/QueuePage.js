import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Heading, Text, VStack, Spinner, Progress, Divider, Flex } from '@chakra-ui/react';
import { io } from 'socket.io-client';
import axios from 'axios';
import { useAuth } from '../../AuthContext';

const socket = io('http://localhost:5001');

const QueuePage = () => {
  const { barId } = useParams();
  const { token } = useAuth();
  const [queue, setQueue] = useState([]);
  const [queueLength, setQueueLength] = useState(0);
  const [isQueueOpen, setIsQueueOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQueue = async () => {
      try {
        const response = await axios.get(`http://localhost:5001/api/queue/status/${barId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const { isQueueOpen, queueLength, queue } = response.data;
        setQueue(queue);
        setQueueLength(queueLength);
        setIsQueueOpen(isQueueOpen);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching queue:', error);
        setLoading(false);
      }
    };

    fetchQueue();

    socket.on('queue-status', (data) => {
      if (data.barId === barId) {
        setIsQueueOpen(data.isOpen);
      }
    });

    socket.on('queue-updated', (data) => {
      if (data.barId === barId) {
        setQueue(data.queue);
        setQueueLength(data.queueLength);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [barId, token]);

  if (loading) {
    return (
      <Flex justify="center" align="center" height="100vh">
        <Spinner size="xl" />
      </Flex>
    );
  }

  return (
    <Box minHeight="100vh" bg="gray.100">
      <Box bg="gray.900" py={4} px={6} color="white">
        <Heading>Queue Status</Heading>
      </Box>
      <VStack spacing={4} align="stretch" p={6}>
        <Progress value={(queueLength / 250) * 100} colorScheme="teal" size="lg" />
        <Text fontWeight="bold">Queue Length: {queueLength}</Text>
        <Divider />
        {queue.map((user, index) => (
          <Box key={index} p={4} shadow="md" borderWidth="1px" bg="white">
            <Text>
              <strong>Position {index + 1}:</strong> {user.name}
            </Text>
          </Box>
        ))}
        {!isQueueOpen && <Text>The queue is currently closed.</Text>}
      </VStack>
    </Box>
  );
};

export default QueuePage;
