import React, { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Flex,
  Text,
  Image,
  Button,
  VStack,
  Divider,
  Input,
  Grid,
  GridItem,
} from '@chakra-ui/react';
import axios from 'axios';
import { useAuth } from '../AuthContext';

const UserDashboard = () => {
  const [bars, setBars] = useState([]);
  const [filteredBars, setFilteredBars] = useState([]);
  const [search, setSearch] = useState('');
  const { token, logout } = useAuth(); // Add logout from AuthContext

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
        setFilteredBars(barsWithQueueStatus); // Initially set the filtered list to all bars
      } catch (error) {
        console.error('Error fetching bars:', error);
      }
    };

    fetchBars();
  }, [token]);

  const handleSearch = (e) => {
    const searchValue = e.target.value.toLowerCase();
    setSearch(searchValue);

    // Filter bars based on search input
    const filtered = bars.filter(
      (bar) =>
        bar.name.toLowerCase().includes(searchValue) ||
        bar.location.toLowerCase().includes(searchValue)
    );

    setFilteredBars(filtered);
  };

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
    } catch (error) {
      console.error('Error joining queue:', error.response ? error.response.data : error.message);
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
        <Button colorScheme="whiteAlpha" variant="outline" onClick={logout}>
          Logout
        </Button>
      </Box>

      {/* Search Bar */}
      <Box bg="gray.100" py={4} px={6} display="flex" justifyContent="center">
        <Input
          placeholder="Search venues by name or location"
          value={search}
          onChange={handleSearch}
          width="100%"
          maxW="600px"
          bg="white"
          borderRadius="md"
          boxShadow="md"
        />
      </Box>

      {/* Middle Section */}
      <Flex flex="1" direction="column" align="center" py={10} px={6} bg="white">
        <VStack spacing={4} w="full" maxW="6xl" align="stretch">
          <Heading as="h2" size="md" color="gray.700" mb={4}>
            Venues List
          </Heading>
          <Divider />
          <Grid templateColumns="repeat(auto-fit, minmax(300px, 1fr))" gap={6}>
            {filteredBars.map((bar) => (
              <GridItem
                key={bar._id}
                p={4}
                bg="white"
                borderRadius="md"
                shadow="md"
                borderWidth="1px"
              >
                <Flex direction="column" align="center" justify="center" h="100%">
                  <Image
                    src={`http://localhost:5001${bar.imageUrl}`}
                    alt={bar.name}
                    width="100%"
                    height="150px"
                    objectFit="cover"
                    borderRadius="md"
                  />
                  <Box mt={4} textAlign="center">
                    <Text fontSize="lg" fontWeight="bold" color="gray.800">
                      {bar.name}
                    </Text>
                    <Text fontSize="sm" color="gray.600" mt={1}>
                      {bar.location}
                    </Text>
                  </Box>
                  <Button
                    mt={4}
                    size="sm"
                    colorScheme="blue"
                    onClick={() => handleJoinQueue(bar._id)}
                    isDisabled={!bar.isQueueOpen}
                  >
                    {bar.isQueueOpen ? 'Join Queue' : 'Queue Closed'}
                  </Button>
                </Flex>
              </GridItem>
            ))}
          </Grid>
        </VStack>
      </Flex>

      {/* Footer */}
      <Box bg="gray.900" width="100%" py={4} display="flex" justifyContent="center">
        <Text color="white" fontSize="sm">
          User Dashboard - All Rights Reserved
        </Text>
      </Box>
    </Box>
  );
};

export default UserDashboard;
