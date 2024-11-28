import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Heading, Text, Button, VStack, Divider, Spinner, Flex, Image, IconButton, Menu, MenuButton, MenuList, MenuItem, useToast, Input, Textarea } from '@chakra-ui/react';
import { ArrowBackIcon, ChevronDownIcon, AddIcon } from '@chakra-ui/icons';
import axios from 'axios';
import { useAuth } from '../../AuthContext';

const BarPage = () => {
  const { barId } = useParams();
  const [bar, setBar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditingLocation, setIsEditingLocation] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [newLocation, setNewLocation] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const { token } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    const fetchBar = async () => {
      try {
        const response = await axios.get(`http://localhost:5001/api/bars/${barId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        setBar(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching bar:', error);
        setError('Bar not found or an error occurred');
        setLoading(false);
      }
    };

    fetchBar();
  }, [barId, token]);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append('image', file);
      
      try {
        const response = await axios.put(`http://localhost:5001/api/bars/${barId}/upload-image`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`
          }
        });
        setBar({ ...bar, imageUrl: response.data.imageUrl });
        toast({
          title: "Image uploaded successfully.",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } catch (error) {
        console.error('Error uploading image:', error);
        toast({
          title: "Failed to upload image.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    }
  };

  const handleEditLocation = async () => {
    try {
      const response = await axios.put(`http://localhost:5001/api/bars/${barId}`, { location: newLocation }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setBar({ ...bar, location: response.data.location });
      setIsEditingLocation(false);
      toast({
        title: "Location updated successfully.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error updating location:', error);
      toast({
        title: "Failed to update location.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleEditDescription = async () => {
    try {
      const response = await axios.put(`http://localhost:5001/api/bars/${barId}`, { description: newDescription }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setBar({ ...bar, description: response.data.description });
      setIsEditingDescription(false);
      toast({
        title: "Description updated successfully.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error updating description:', error);
      toast({
        title: "Failed to update description.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  if (loading) {
    return (
      <Flex justify="center" align="center" height="100vh">
        <Spinner size="xl" />
      </Flex>
    );
  }

  if (error) {
    return (
      <Flex justify="center" align="center" height="100vh">
        <Text>{error}</Text>
      </Flex>
    );
  }

  return (
    <Flex direction="column" minHeight="100vh" bg="gray.50">
      {/* Header */}
      <Box bg="gray.900" color="white" py={4} px={6} display="flex" justifyContent="space-between" alignItems="center">
        <IconButton
          icon={<ArrowBackIcon />}
          onClick={() => navigate(-1)}
          variant="ghost"
          colorScheme="whiteAlpha"
          aria-label="Back"
        />
        <Heading as="h1" size="lg" textAlign="center">{bar.name}</Heading>
        <Menu>
          <MenuButton as={Button} rightIcon={<ChevronDownIcon />} colorScheme="whiteAlpha">
            Menu
          </MenuButton>
          <MenuList>
            <MenuItem>Option 1</MenuItem>
            <MenuItem>Option 2</MenuItem>
            <MenuItem>Option 3</MenuItem>
          </MenuList>
        </Menu>
      </Box>

      {/* Banner Image or Upload Icon */}
      <Box position="relative" width="100%" height="300px" overflow="hidden">
        {bar.imageUrl ? (
          <Image 
            src={`http://localhost:5001${bar.imageUrl}`} 
            alt={bar.name} 
            width="100%" 
            height="100%" 
            objectFit="cover" 
          />
        ) : (
          <Box width="100%" height="300px" display="flex" justifyContent="center" alignItems="center" bg="gray.200">
            <input
              type="file"
              id="imageUpload"
              style={{ display: 'none' }}
              onChange={handleImageUpload}
            />
            <IconButton
              icon={<AddIcon />}
              onClick={() => document.getElementById('imageUpload').click()}
              colorScheme="gray"
              aria-label="Upload Image"
              size="lg"
            />
          </Box>
        )}
        <Box 
          position="absolute"
          top="0"
          left="0"
          width="100%"
          height="100%"
          display="flex"
          justifyContent="center"
          alignItems="center"
          bg="rgba(0, 0, 0, 0.5)"
          opacity="0"
          transition="opacity 0.3s"
          _hover={{ opacity: 1 }}
        >
          <input
            type="file"
            id="imageUpload"
            style={{ display: 'none' }}
            onChange={handleImageUpload}
          />
          <IconButton
            icon={<AddIcon />}
            onClick={() => document.getElementById('imageUpload').click()}
            colorScheme="whiteAlpha"
            aria-label="Upload Image"
            size="lg"
          />
        </Box>
      </Box>

      {/* Content */}
      <Box p={6} maxW="5xl" mx="auto" width="100%">
        <Box mt={4}>
          {isEditingLocation ? (
            <Input
              value={newLocation}
              onChange={(e) => setNewLocation(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleEditLocation()}
              onBlur={() => setIsEditingLocation(false)}
              autoFocus
            />
          ) : (
            <Text fontSize="xl" mb={4} onClick={() => { setIsEditingLocation(true); setNewLocation(bar.location); }}>
              <strong>Location:</strong> {bar.location}
            </Text>
          )}
          {isEditingDescription ? (
            <Textarea
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleEditDescription()}
              onBlur={() => setIsEditingDescription(false)}
              autoFocus
            />
          ) : (
            <Text fontSize="xl" mb={4} onClick={() => { setIsEditingDescription(true); setNewDescription(bar.description); }}>
              <strong>Description:</strong> {bar.description}
            </Text>
          )}
        </Box>
        <Divider my={6} />
        <VStack spacing={4} align="stretch">
          <Button colorScheme="brand" size="lg" bg="brand.500" _hover={{ bg: 'brand.600' }} onClick={() => navigate(`/bar/${barId}/manage-employees`)}>Manage Employees</Button>
          <Button colorScheme="brand" size="lg" bg="brand.500" _hover={{ bg: 'brand.600' }} onClick={() => navigate(`/bar/${barId}/manage-queue`)}>Manage Queue</Button>
        </VStack>
      </Box>

      {/* Footer */}
      <Box bg="gray.900" width="100%" py={4} mt="auto" display="flex" justifyContent="center">
        <Text color="white" fontSize="sm">Footer Content</Text>
      </Box>
    </Flex>
  );
};

export default BarPage;
