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
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure
} from '@chakra-ui/react';
import { FaClock, FaUsers } from 'react-icons/fa';
import { QRCodeCanvas } from 'qrcode.react';
import axios from 'axios';
import { useAuth } from '../../AuthContext';
import BottomNavBar from '../Users/BottomNavBar';
import { io } from 'socket.io-client';

const socket = io('http://localhost:5001');

const WaitingPage = () => {
  const { barId } = useParams();
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [queue, setQueue] = useState([]);
  const [queueLength, setQueueLength] = useState(0);
  const [estimatedWaitTime, setEstimatedWaitTime] = useState(0);
  const [loading, setLoading] = useState(true);

  const { isOpen, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    const fetchQueueStatus = async () => {
      try {
        const response = await axios.get(`http://localhost:5001/api/queue/status/${barId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setQueue(response.data.queue);
        setQueueLength(response.data.queueLength);
        setEstimatedWaitTime(response.data.queueLength * 2);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching queue status:', error);
        setLoading(false);
      }
    };

    fetchQueueStatus();
  }, [barId, token]);

  useEffect(() => {
    socket.on('queue-updated', (data) => {
      if (data.barId === barId) {
        setQueue(data.queue);
        setQueueLength(data.queueLength);
      }
    });

    return () => {
      socket.off('queue-updated');
    };
  }, [barId]);

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

  const isFirstInLine = queue.length > 0 && queue[0].userId === user._id;

  return (
    <Box minHeight="100vh" bg="gray.100" pb="80px">
      {/* Header */}
      <Box bg="gray.900" py={6} px={4} textAlign="center" color="white">
        <Text fontSize="2xl" fontWeight="bold">Queue Waiting Room</Text>
      </Box>

      {/* Main Content */}
      <VStack
        spacing={6}
        align="stretch"
        maxW="500px"
        mx="auto"
        mt={10}
        p={4}
        bg="white"
        borderRadius="md"
        shadow="md"
      >
        {/* Total in Queue */}
        <Flex align="center" justify="space-between" p={4} bg="blue.50" borderRadius="md">
          <Flex align="center">
            <Icon as={FaUsers} boxSize={6} color="blue.500" />
            <Text fontSize="lg" ml={3} fontWeight="medium">Total in Queue:</Text>
          </Flex>
          <Text fontSize="lg" fontWeight="bold">{queueLength}</Text>
        </Flex>

        {/* Estimated Wait Time */}
        <Flex align="center" justify="space-between" p={4} bg="blue.50" borderRadius="md">
          <Flex align="center">
            <Icon as={FaClock} boxSize={6} color="blue.500" />
            <Text fontSize="lg" ml={3} fontWeight="medium">Estimated Wait Time:</Text>
          </Flex>
          <Text fontSize="lg" fontWeight="bold">{estimatedWaitTime} mins</Text>
        </Flex>

        {/* QR Code Button */}
        {isFirstInLine && (
          <>
            <Divider />
            <Text fontSize="lg" fontWeight="bold" color="green.500">
              You're up next!
            </Text>
            <Button colorScheme="green" onClick={onOpen}>
              Show QR Code
            </Button>
          </>
        )}

        {/* Progress Bar */}
        <Box p={4}>
          <Text fontSize="lg" fontWeight="medium" mb={2}>Queue Progress</Text>
          <Progress value={(queueLength ? (1 / queueLength) * 100 : 100)} size="lg" colorScheme="blue" />
        </Box>

        {/* Leave Queue */}
        <Divider />
        <Button colorScheme="red" size="lg" onClick={handleLeaveQueue} mt={4}>
          Leave Queue
        </Button>
      </VStack>

      {/* ✅ QR Code Popup */}
      <Modal isOpen={isOpen} onClose={onClose} size="md" isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Show this QR Code</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Flex justify="center" mt={4}>
              <QRCodeCanvas value={JSON.stringify({ userId: user._id, barId })} size={200} />
            </Flex>
            <Text fontSize="sm" color="gray.600" mt={4} textAlign="center">
              Show this QR code to the employee to validate your spot.
            </Text>
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Bottom Navigation Bar */}
      <BottomNavBar />
    </Box>
  );
};

export default WaitingPage;
