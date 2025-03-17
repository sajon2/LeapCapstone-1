import React, { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Flex,
  Text,
  Input,
  Textarea,
  Button,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Grid,
  GridItem,
  Image,
  useToast,
  FormControl,
  FormLabel,
} from '@chakra-ui/react';
import axios from 'axios';
import { useAuth } from '../AuthContext';
import { useNavigate } from 'react-router-dom';
import AdminBottomNavBar from './Admin/AdminBottomNavBar';

const AdminDashboard = () => {
  const [bars, setBars] = useState([]);
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState(null);
  const { token, logout } = useAuth();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const navigate = useNavigate();
  const toast = useToast();
  const googleMapsApiKey = 'AIzaSyD5Qx5qCtmL8eqgbx6ccp9ONQnEzeBRf3Q'; // Replace with your API KEY!!!

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
    setAddress('');
    setDescription('');
    setImage(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // 1. Geocode the address *before* creating the FormData
      const geocodeResponse = await axios.get(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${googleMapsApiKey}`
      );

      if (geocodeResponse.data.status === 'OK' && geocodeResponse.data.results.length > 0) {
        const { lat, lng } = geocodeResponse.data.results[0].geometry.location;

        // 2. Create FormData *after* getting the coordinates
        const formData = new FormData();
        formData.append('name', name);
        formData.append('address', address);
        formData.append('description', description);
        formData.append('image', image);
        formData.append('location[type]', 'Point');
        formData.append('location[coordinates][0]', lng); // Longitude first!
        formData.append('location[coordinates][1]', lat); // Latitude second

        // 3. Send the request to *your* backend
        const response = await axios.post('http://localhost:5001/api/bars', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`,
          },
        });

        setBars([...bars, response.data]);
        resetForm();
        onClose();
        toast({
          title: 'Venue created successfully.',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });

      } else {
        toast({
          title: 'Geocoding Error',
          description: `Could not find coordinates for the address: ${address}`,
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
        return; // Stop if geocoding fails
      }
    } catch (error) {
      // Handle both geocoding and backend errors
      console.error("Error:", error); // Log the full error
      let errorMessage = "An unexpected error occurred.";

      if (error.response) {
        // Backend error (e.g., validation error)
        errorMessage = error.response.data.errors
          ? error.response.data.errors.map((e) => e.msg).join(', ')
          : "Server Error";
      } else if (error.message && error.message.includes("Geocoding error")) {
          // Geocoding specific error
          errorMessage = "Geocoding failed. Please check the address.";
      }
      else if (error.request)
      {
          errorMessage = "No response from server";
      }
        else {
          errorMessage = error.message; // Other errors (e.g., network)
      }


      toast({
        title: 'Error',
        description: errorMessage,
        status: 'error',
        duration: 9000,
        isClosable: true,
      });
    }
  };

  const handleViewBar = (barId) => {
    navigate(`/bar/${barId}`);
  };

  const handleLogout = () => {
    logout();
    navigate('/admin-login');
  };

  return (
    <Box position="relative" minHeight="100vh" display="flex" flexDirection="column">
      {/* Header */}
      <Box bg="gray.900" width="100%" py={4} px={6} display="flex" justifyContent="space-between" alignItems="center">
        <Heading as="h1" size="lg" color="white">
          Admin Dashboard
        </Heading>
        <Button onClick={handleLogout} colorScheme="red">
          Logout
        </Button>
      </Box>

      {/* Middle Section */}
      <Flex flex="1" direction="column" bg="gray.100" p={6}>
        <Heading size="lg" mb={6} color="gray.700" textAlign="center">
          Manage Your Venues
        </Heading>
        <Grid templateColumns="repeat(auto-fit, minmax(300px, 1fr))" gap={6} pb="80px">
          {bars.map((bar) => (
            <GridItem
              key={bar._id}
              bg="white"
              shadow="md"
              borderRadius="md"
              overflow="hidden"
              cursor="pointer"
              onClick={() => handleViewBar(bar._id)}
            >
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
                  {/* FIX: Display the address, not the location object */}
                  <strong>Location:</strong> {bar.address}
                </Text>
                <Text fontSize="sm" color="gray.600" mt={2}>
                  <strong>Description:</strong> {bar.description}
                </Text>
              </Box>
            </GridItem>
          ))}
        </Grid>
      </Flex>

      {/* Bottom Navigation Bar */}
      <AdminBottomNavBar onOpenAddVenue={onOpen} />

      {/* Modal for Adding a New Venue */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create a New Venue</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <form onSubmit={handleSubmit}>
              <FormControl mb={4} isRequired>
                <FormLabel>Venue Name</FormLabel>
                <Input placeholder="Venue Name" value={name} onChange={(e) => setName(e.target.value)} />
              </FormControl>

              <FormControl mb={4} isRequired>
                <FormLabel>Address</FormLabel>
                <Input placeholder="Venue Address" value={address} onChange={(e) => setAddress(e.target.value)} />
              </FormControl>

              {/* REMOVE Latitude and Longitude Inputs */}

              <FormControl mb={4}>
                <FormLabel>Description</FormLabel>
                <Textarea placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
              </FormControl>

              <FormControl mb={4} isRequired>
                <FormLabel>Image</FormLabel>
                <Input type="file" onChange={(e) => setImage(e.target.files[0])} />
              </FormControl>
              <Button type="submit" colorScheme="blue">
                Create New Venue
              </Button>
            </form>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" onClick={onClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default AdminDashboard;