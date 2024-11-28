import React, { useState, useEffect } from 'react';
import { Box, Heading, VStack, Button, Divider, Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton, Progress, Text, useDisclosure, Flex, useToast } from '@chakra-ui/react';
import axios from 'axios';
import { useAuth } from '../../AuthContext';
import { useNavigate, useParams } from 'react-router-dom';

const ManageQueue = () => {
  const { barId } = useParams();
  const [isQueueOpen, setIsQueueOpen] = useState(false);
  const [queue, setQueue] = useState([]);
  const { token } = useAuth();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isCloseOpen, onOpen: onCloseOpen, onClose: onCloseClose } = useDisclosure();
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    const fetchQueueStatus = async () => {
      try {
        const response = await axios.get(`http://localhost:5001/api/queue/status/${barId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        setIsQueueOpen(response.data.isQueueOpen);
        setQueue(response.data.queue);
      } catch (error) {
        console.error('Error fetching queue status:', error);
        toast({
          title: "Failed to fetch queue status.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    };

    fetchQueueStatus();
  }, [token, toast, barId]);

  const handleOpenQueue = async () => {
    try {
      await axios.post(`http://localhost:5001/api/queue/open/${barId}`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setIsQueueOpen(true);
      setQueue([]);
      onClose();
      toast({
        title: "Queue opened successfully.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error opening queue:', error);
      toast({
        title: "Failed to open queue.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleCloseQueue = async () => {
    try {
      await axios.post(`http://localhost:5001/api/queue/close/${barId}`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setIsQueueOpen(false);
      setQueue([]);
      onCloseClose();
      toast({
        title: "Queue closed successfully.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error closing queue:', error);
      toast({
        title: "Failed to close queue.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Box position="relative" minHeight="100vh" display="flex" flexDirection="column">
      {/* Header */}
      <Box bg="gray.900" width="100%" py={4} px={6} display="flex" justifyContent="space-between" alignItems="center">
        <Heading as="h1" size="lg" color="white">Manage Queue</Heading>
        <Button onClick={() => navigate(-1)} colorScheme="whiteAlpha" variant="outline">Back</Button>
      </Box>

      {/* Middle Section */}
      <Flex flex="1" direction="column" align="center" justify="center" py={10} px={6} bg="white">
        {!isQueueOpen ? (
          <Button colorScheme="blue" onClick={onOpen}>Open Queue</Button>
        ) : (
          <VStack spacing={4} w="full" maxW="xl" align="stretch">
            <Text fontSize="xl" fontWeight="bold" color="gray.700">Queue Management</Text>
            <Progress value={(queue.length / 250) * 100} colorScheme="green" size="lg" />
            <Divider />
            {queue.map((user, index) => (
              <Box key={index} p={4} shadow="md" borderWidth="1px" width="100%">
                <Text><strong>Name:</strong> {user.name}</Text>
              </Box>
            ))}
            <Button colorScheme="red" onClick={onCloseOpen}>Close Queue</Button>
          </VStack>
        )}
      </Flex>

      {/* Footer */}
      <Box bg="gray.900" width="100%" py={4} display="flex" justifyContent="center">
        <Text color="white" fontSize="sm">Footer Content</Text>
      </Box>

      {/* Modal for Opening Queue */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Open Queue</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text>Are you sure you want to open the queue?</Text>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={handleOpenQueue}>Yes</Button>
            <Button variant="ghost" onClick={onClose}>No</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Modal for Closing Queue */}
      <Modal isOpen={isCloseOpen} onClose={onCloseClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Close Queue</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text>Are you sure you want to close the queue?</Text>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="red" mr={3} onClick={handleCloseQueue}>Yes</Button>
            <Button variant="ghost" onClick={onCloseClose}>No</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default ManageQueue;
