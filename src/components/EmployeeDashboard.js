import React, { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Flex,
  Text,
  VStack,
  Button,
  Divider,
  useToast,
  Spinner,
  IconButton,
} from '@chakra-ui/react';
import { ChevronDownIcon, DeleteIcon } from '@chakra-ui/icons';
import QrReader from 'react-qr-barcode-scanner';
import axios from 'axios';
import { useAuth } from '../AuthContext';
import { useNavigate } from 'react-router-dom';
import { FaSignOutAlt } from 'react-icons/fa';

const EmployeeDashboard = () => {
  const { token, user, logout } = useAuth();
  const [scannedData, setScannedData] = useState(null);
  const [queue, setQueue] = useState([]);
  const [queueLength, setQueueLength] = useState(0);
  const [isQueueOpen, setIsQueueOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.barId) {
      fetchQueueStatus();
    }
  }, [user]);

  const fetchQueueStatus = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5001/api/queue/status/${user.barId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setQueue(response.data.queue);
      setQueueLength(response.data.queueLength);
      setIsQueueOpen(response.data.isQueueOpen);
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch queue status:', err.message);
      setLoading(false);
    }
  };

  const handleRemoveUser = async (userId) => {
    try {
      await axios.delete(
        `http://localhost:5001/api/queue/${user.barId}/remove-user/${userId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast({
        title: 'User removed',
        description: 'The user has been removed from the queue.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      fetchQueueStatus(); // Refresh queue after removal
    } catch (err) {
      console.error('Error removing user:', err.message);
      toast({
        title: 'Error',
        description: 'Failed to remove user.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };
  const handleOpenQueue = async () => {
    try {
      await axios.post(
        `http://localhost:5001/api/queue/open/${user.barId}`,
        { maxQueueLength: 250 }, // Optional: Adjust max queue length if needed
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setIsQueueOpen(true);
      toast({
        title: 'Queue opened',
        description: 'The queue has been opened.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      fetchQueueStatus(); // Refresh queue status after opening
    } catch (err) {
      console.error('Error opening queue:', err.message);
      toast({
        title: 'Error',
        description: 'Failed to open the queue.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };
  

  const handleCloseQueue = async () => {
    try {
      await axios.post(
        `http://localhost:5001/api/queue/close/${user.barId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setIsQueueOpen(false);
      setQueue([]);
      toast({
        title: 'Queue closed',
        description: 'The queue has been closed.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (err) {
      console.error('Error closing queue:', err.message);
      toast({
        title: 'Error',
        description: 'Failed to close the queue.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleScan = async (data) => {
    if (data) {
      setScannedData(data.text);
      try {
        const parsedData = JSON.parse(data.text);
        const response = await axios.post(
          'http://localhost:5001/api/queue/validateQR',
          parsedData,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        toast({
          title: 'Success',
          description: response.data.msg,
          status: 'success',
          duration: 5000,
          isClosable: true,
        });

        fetchQueueStatus(); // Refresh queue after validation
      } catch (err) {
        toast({
          title: 'Invalid QR Code',
          description: 'The scanned QR code is invalid or not recognized.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
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
    <Box minHeight="100vh" bg="gray.100" color="black" px={6} py={8}>
  {/* Header */}
  <header style={{
    backgroundColor: '#1f1f1f', // Dark gray like the Admin Dashboard
    width: '100vw', // Full width
    padding: '16px 24px',
    position: 'fixed',
    top: 0,
    left: 0,
    zIndex: 1000,
    display: 'flex',
    justifyContent: 'center', // Center the heading
    alignItems: 'center',
  }}>
    <Heading size="lg" color="white">
      Employee Dashboard
    </Heading>
  </header>

  {/* Main Content */}
  <Flex direction={{ base: 'column', md: 'row' }} gap={6} mt={20}>
    {/* ✅ Queue Section */}
    <Box
      bg="white"
      p={6}
      borderRadius="lg"
      boxShadow="md"
      flex="1"
      height="auto"
      marginTop={-5}
    >
      <Heading size="md" mb={4} color="gray.800">
        Queue Status
      </Heading>
      <Text mb={4} fontSize="lg" color="gray.600">
        {isQueueOpen
          ? `Queue is Open - ${queueLength} people in queue`
          : 'Queue is Closed'}
      </Text>

      {isQueueOpen &&
        queue.map((user, index) => (
          <Flex
            key={user.userId}
            justify="space-between"
            bg="gray.50"
            p={3}
            borderRadius="md"
            mb={2}
            _hover={{ bg: 'gray.100' }}
          >
            <Text>{index + 1}. {user.name}</Text>
            <Button
              size="sm"
              colorScheme="red"
              onClick={() => handleRemoveUser(user.userId)}
              leftIcon={<DeleteIcon />}
            >
              Remove
            </Button>
          </Flex>
        ))}

{isQueueOpen ? (
  <Button colorScheme="red" mt={4} onClick={handleCloseQueue}>
    Close Queue
  </Button>
) : (
  <Button colorScheme="green" mt={4} onClick={handleOpenQueue}>
    Open Queue
  </Button>
)}

      
    </Box>

    {/* ✅ QR Scanner Section */}
    <Box
      bg="white"
      p={6}
      borderRadius="lg"
      boxShadow="md"
      flex="1"
      height="auto"
    >
      <Heading size="md" mb={4} color="gray.800">
        QR Scanner
      </Heading>
      <Button
        colorScheme="blue"
        leftIcon={<ChevronDownIcon />}
        onClick={() => setIsScannerOpen(!isScannerOpen)}
      >
        {isScannerOpen ? 'Close QR Scanner' : 'Open QR Scanner'}
      </Button>

      {isScannerOpen && (
        <Box mt={4} borderRadius="md" overflow="hidden" paddingBottom={10}>
          <QrReader
            onUpdate={(err, result) => {
              if (result) handleScan(result);
            }}
            constraints={{ facingMode: 'environment' }}
          />
        </Box>
      )}
    </Box>
  </Flex>

  {/* ✅ Bottom Navigation Bar */}
 {/* Bottom Navigation Bar */}
<Box
  position="fixed"
  bottom={0}
  left={0}
  right={0}
  bg="gray.900"
  color="white"
  borderTop="1px solid gray"
  zIndex={1000}
  height="70px" // Exact height for consistency
>
  <Flex justify="center" align="center" height="100%">
    <Flex direction="column" align="center" onClick={logout} cursor="pointer">
      <IconButton
        aria-label="Logout"
        icon={<FaSignOutAlt />}
        variant="ghost"
        color="white"
        size="lg"
        _hover={{ bg: 'gray.700' }}
        _active={{ bg: 'gray.800' }}
      />
      <Text fontSize="xs">Logout</Text>
    </Flex>
  </Flex>
</Box>

</Box>

  );
};

export default EmployeeDashboard;
