import React, { useState, useEffect } from 'react';
import { Box, Heading, Flex, Text, VStack, Button, Divider, Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton, Input, Textarea, useDisclosure, Image, useToast } from '@chakra-ui/react';
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
            'Authorization': `Bearer ${token}`
          }
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
          'Authorization': `Bearer ${token}`
        }
      });
      setMessage('Bar created successfully!');
      setBars([...bars, response.data]);
      resetForm();
      onClose();
      toast({
        title: "Bar created successfully.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      setMessage('Error creating bar. Make sure you are logged in as an admin.');
      toast({
        title: "Failed to create bar.",
        status: "error",
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
          'Authorization': `Bearer ${token}`
        }
      });
      setMessage('Bar updated successfully!');
      setBars(bars.map(bar => (bar._id === currentBar._id ? response.data : bar)));
      resetForm();
      onEditClose();
      toast({
        title: "Bar updated successfully.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      setMessage('Error updating bar. Make sure you are logged in as an admin.');
      toast({
        title: "Failed to update bar.",
        status: "error",
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
        <Heading as="h1" size="lg" color="white">Admin Dashboard</Heading>
        <Button onClick={handleLogout} colorScheme="whiteAlpha" variant="outline">Logout</Button>
      </Box>

      {/* Middle Section */}
      <Flex flex="1" direction={{ base: "column", md: "row" }} bg="white">
        <Box bg="gray.900" color="white" width={{ base: "100%", md: "250px" }} py={6} px={4} display="flex" flexDirection="column" alignItems="start">
          <Text fontSize="lg" fontWeight="bold" mb={4}>Navigation</Text>
          <VStack align="start" spacing={4} w="full">
            <Button onClick={onOpen} variant="link" colorScheme="whiteAlpha">Create Bar</Button>
          </VStack>
        </Box>
        <Flex flex="1" direction="column" align="center" justify="center" py={10} px={6}>
          <VStack spacing={4} w="full" maxW="xl" align="stretch">
            <Text fontSize="xl" fontWeight="bold" color="gray.700">Bars List</Text>
            <Divider />
            {bars.map(bar => (
              <Flex key={bar._id} p={4} shadow="md" borderWidth="1px" width="100%" alignItems="center">
                {bar.imageUrl && (
                  <Image src={`http://localhost:5001${bar.imageUrl}`} alt={bar.name} boxSize="100px" objectFit="cover" marginRight={4} />
                )}
                <Box flex="1">
                  <Heading fontSize="xl">{bar.name}</Heading>
                  <Text mt={2}><strong>Location:</strong> {bar.location}</Text>
                  <Text mt={2}><strong>Description:</strong> {bar.description}</Text>
                </Box>
                <Button onClick={() => handleEdit(bar)} colorScheme="blue" ml={4}>Edit</Button>
                <Button onClick={() => handleViewBar(bar._id)} colorScheme="teal" ml={4}>View Bar</Button>
              </Flex>
            ))}
          </VStack>
        </Flex>
      </Flex>

      {/* Footer */}
      <Box bg="gray.900" width="100%" py={4} display="flex" justifyContent="center">
        <Text color="white" fontSize="sm">Footer Content</Text>
      </Box>

      {/* Modal for Creating a New Bar */}
      <Modal isOpen={isOpen} onClose={handleClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create a New Bar</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <form onSubmit={handleSubmit} style={{ width: '100%' }}>
              <Box mb={4}>
                <Input placeholder="Bar Name" value={name} onChange={(e) => setName(e.target.value)} required />
              </Box>
              <Box mb={4}>
                <Input placeholder="Location" value={location} onChange={(e) => setLocation(e.target.value)} required />
              </Box>
              <Box mb={4}>
                <Textarea placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
              </Box>
              <Box mb={4}>
                <Input type="file" onChange={(e) => setImage(e.target.files[0])} required />
              </Box>
              <Button type="submit" colorScheme="blue">Create Bar</Button>
            </form>
            {message && (
              <Text mt={4} color={message.includes('successfully') ? 'green.500' : 'red.500'}>
                {message}
              </Text>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" onClick={handleClose}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Modal for Editing a Bar */}
      <Modal isOpen={isEditOpen} onClose={handleEditClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit Bar</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <form onSubmit={handleEditSubmit} style={{ width: '100%' }}>
              <Box mb={4}>
                <Input placeholder="Bar Name" value={name} onChange={(e) => setName(e.target.value)} required />
              </Box>
              <Box mb={4}>
                <Input placeholder="Location" value={location} onChange={(e) => setLocation(e.target.value)} required />
              </Box>
              <Box mb={4}>
                <Textarea placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
              </Box>
              <Box mb={4}>
                <Input type="file" onChange={(e) => setImage(e.target.files[0])} />
              </Box>
              <Button type="submit" colorScheme="blue">Update Bar</Button>
            </form>
            {message && (
              <Text mt={4} color={message.includes('successfully') ? 'green.500' : 'red.500'}>
                {message}
              </Text>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" onClick={handleEditClose}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default AdminDashboard;
