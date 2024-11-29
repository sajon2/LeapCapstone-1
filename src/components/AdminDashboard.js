import React, { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Flex,
  Text,
  VStack,
  Button,
  Divider,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Input,
  Textarea,
  useDisclosure,
  Image,
  useToast,
  Grid,
  GridItem,
} from '@chakra-ui/react';
import axios from 'axios';
import { useAuth } from '../AuthContext';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const [bars, setBars] = useState([]);
  const [currentBar, setCurrentBar] = useState(null);
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState(null);
  const [message, setMessage] = useState('');
  const { token, logout } = useAuth();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    const fetchBars = async () => {
      try {
        const response = await axios.get('http://localhost:5001/api/bars', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setBars(response.data);
      } catch (error) {
        console.error('Error fetching bars:', error);
      }
    };

    fetchBars();
  }, [token]);

  const resetForm = () => {
    setName('');
    setLocation('');
    setDescription('');
    setImage(null);
    setMessage('');
    setCurrentBar(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', name);
    formData.append('location', location);
    formData.append('description', description);
    formData.append('image', image);

    try {
      const response = await axios.post('http://localhost:5001/api/bars', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });
      setMessage('Venue created successfully!');
      setBars([...bars, response.data]);
      resetForm();
      onClose();
      toast({
        title: 'Venue created successfully.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      setMessage('Error creating venue. Make sure you are logged in as an admin.');
      toast({
        title: 'Failed to create venue.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', name);
    formData.append('location', location);
    formData.append('description', description);
    formData.append('image', image);

    try {
      const response = await axios.put(`http://localhost:5001/api/bars/${currentBar._id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });
      setMessage('Venue updated successfully!');
      setBars(bars.map((bar) => (bar._id === currentBar._id ? response.data : bar)));
      resetForm();
      onEditClose();
      toast({
        title: 'Venue updated successfully.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      setMessage('Error updating venue. Make sure you are logged in as an admin.');
      toast({
        title: 'Failed to update venue.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleEdit = (bar) => {
    setCurrentBar(bar);
    setName(bar.name);
    setLocation(bar.location);
    setDescription(bar.description);
    onEditOpen();
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleEditClose = () => {
    resetForm();
    onEditClose();
  };

  const handleViewBar = (barId) => {
    navigate(`/bar/${barId}`);
  };

  return (
    <Box position="relative" minHeight="100vh" display="flex" flexDirection="column">
      {/* Header */}
      <Box bg="gray.900" width="100%" py={4} px={6} display="flex" justifyContent="space-between" alignItems="center">
        <Heading as="h1" size="lg" color="white">
          Admin Dashboard
        </Heading>
        <Button onClick={handleLogout} colorScheme="whiteAlpha" variant="outline">
          Logout
        </Button>
      </Box>

      {/* Middle Section */}
      <Flex flex="1" direction="column" bg="gray.100" p={6}>
        <Heading size="lg" mb={6} color="gray.700" textAlign="center">
          Manage Your Venues
        </Heading>
        <Grid templateColumns="repeat(auto-fit, minmax(300px, 1fr))" gap={6}>
          {bars.map((bar) => (
            <GridItem key={bar._id} bg="white" shadow="md" borderRadius="md" overflow="hidden">
              <Image
                src={`http://localhost:5001${bar.imageUrl}`}
                alt={bar.name}
                width="100%"
                height="200px"
                objectFit="cover"
              />
              <Box p={4}>
                <Heading fontSize="xl" color="gray.800">
                  {bar.name}
                </Heading>
                <Text fontSize="sm" color="gray.600" mt={2}>
                  <strong>Location:</strong> {bar.location}
                </Text>
                <Text fontSize="sm" color="gray.600" mt={2}>
                  <strong>Description:</strong> {bar.description}
                </Text>
                <Flex justifyContent="space-between" mt={4}>
                  <Button size="sm" colorScheme="blue" onClick={() => handleEdit(bar)}>
                    Edit
                  </Button>
                  <Button size="sm" colorScheme="teal" onClick={() => handleViewBar(bar._id)}>
                    View
                  </Button>
                </Flex>
              </Box>
            </GridItem>
          ))}
        </Grid>
      </Flex>

      {/* Footer */}
      <Box bg="gray.900" width="100%" py={4} display="flex" justifyContent="center">
        <Text color="white" fontSize="sm">
          Admin Dashboard - All Rights Reserved
        </Text>
      </Box>

      {/* Modal for Creating a New Venue */}
      <Modal isOpen={isOpen} onClose={handleClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create a New Venue</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <form onSubmit={handleSubmit}>
              <Box mb={4}>
                <Input
                  placeholder="Venue Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </Box>
              <Box mb={4}>
                <Input
                  placeholder="Location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  required
                />
              </Box>
              <Box mb={4}>
                <Textarea
                  placeholder="Description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </Box>
              <Box mb={4}>
                <Input type="file" onChange={(e) => setImage(e.target.files[0])} required />
              </Box>
              <Button type="submit" colorScheme="blue">
                Create New Venue
              </Button>
            </form>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" onClick={handleClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default AdminDashboard;
