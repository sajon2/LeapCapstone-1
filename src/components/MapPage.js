import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../AuthContext';
import { Box, Heading, Flex, Button, IconButton, List, ListItem, Text, Spinner, HStack } from '@chakra-ui/react';
import { ArrowBackIcon } from '@chakra-ui/icons';

// Fix for default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// Custom component to control map view
function MapController({ selectedLocation, userLocation }) {
    const map = useMap();
    
    useEffect(() => {
        if (selectedLocation && userLocation) {
            const bounds = L.latLngBounds([userLocation, [selectedLocation.latitude, selectedLocation.longitude]]);
            map.flyToBounds(bounds, { padding: [50, 50] });
        }
    }, [selectedLocation, userLocation, map]);
    
    return null;
}

// User location marker component
function LocationMarker({ userLocation }) {
    const map = useMap();

    useEffect(() => {
        if (userLocation) {
            map.flyTo(userLocation, map.getZoom());
        }
    }, [userLocation, map]);

    const userIcon = new L.DivIcon({
        className: 'custom-div-icon user-icon',
        html: "<div style='background-color: blue; width: 15px; height: 15px; border-radius: 50%; border: 2px solid white;'></div>",
        iconSize: [15, 15],
        iconAnchor: [7, 7],
    });

    return userLocation ? (
        <Marker position={userLocation} icon={userIcon}>
            <Popup>You are here!</Popup>
        </Marker>
    ) : null;
}

const MapPage = () => {
    const [locations, setLocations] = useState([]);
    const [userLocation, setUserLocation] = useState(null);
    const [loading, setLoading] = useState(true);
    const [locationError, setLocationError] = useState(null);
    const [sortedBars, setSortedBars] = useState([]);
    const navigate = useNavigate();
    const { token } = useAuth();
    const [selectedMarker, setSelectedMarker] = useState(null);
    const [selectedLocation, setSelectedLocation] = useState(null);

    const haversineDistance = (lat1, lon1, lat2, lon2) => {
        const R = 6371; // Radius of Earth in kilometers
        const dLat = (lat2 - lat1) * (Math.PI / 180);
        const dLon = (lon2 - lon1) * (Math.PI / 180);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c;
        return distance;
    };

    useEffect(() => {
        const fetchBars = async () => {
            try {
                const response = await axios.get('http://localhost:5001/api/bars/all', {
                    headers: { Authorization: `Bearer ${token}` },
                });

                const fetchedLocations = response.data
                    .map((bar) => {
                        if (
                            bar.location &&
                            bar.location.coordinates &&
                            Array.isArray(bar.location.coordinates) &&
                            bar.location.coordinates.length >= 2
                        ) {
                            return {
                                id: bar._id,
                                name: bar.name,
                                location: bar.address,
                                latitude: bar.location.coordinates[1],
                                longitude: bar.location.coordinates[0],
                            };
                        }
                        return null;
                    })
                    .filter((location) => location !== null);

                setLocations(fetchedLocations);
            } catch (error) {
                console.error('Error fetching bars:', error);
            } finally {
                setLoading(false);
            }
        };

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setUserLocation([position.coords.latitude, position.coords.longitude]);
                },
                (error) => {
                    console.error('Error getting user location:', error);
                    setLocationError('Unable to retrieve your location.');
                    setLoading(false);
                }
            );
        } else {
            setLocationError('Geolocation is not supported by your browser.');
            setLoading(false);
        }

        fetchBars();
    }, [token]);

    useEffect(() => {
        if (userLocation && locations.length > 0) {
            const barsWithDistance = locations.map((bar) => {
                const distance = haversineDistance(userLocation[0], userLocation[1], bar.latitude, bar.longitude);
                return { ...bar, distance };
            });

            const sorted = barsWithDistance.sort((a, b) => a.distance - b.distance);
            setSortedBars(sorted);
        }
    }, [userLocation, locations]);

    // Update selected location when marker changes
    useEffect(() => {
        if (selectedMarker && locations.length > 0) {
            const location = locations.find(loc => loc.id === selectedMarker);
            if (location) {
                setSelectedLocation(location);
            }
        }
    }, [selectedMarker, locations]);

    const handleLocationSelect = (bar) => {
        setSelectedMarker(bar.id);
        // No need to call flyToBounds here as the MapController will handle it
    };

    const createBarMarker = (location) => {
        const iconColor = selectedMarker === location.id ? 'green' : 'red';
        const icon = new L.DivIcon({
            className: 'custom-div-icon bar-icon',
            html: `<div style='background-color: ${iconColor}; width: 15px; height: 15px; border-radius: 50%; border: 2px solid white;'></div>`,
            iconSize: [15, 15],
            iconAnchor: [7, 7]
        });

        return (
            <Marker
                key={location.id}
                position={[location.latitude, location.longitude]}
                icon={icon}
                eventHandlers={{
                    click: () => handleLocationSelect(location)
                }}
            >
                <Popup>
                    <div>
                        {location.name} <br /> {location.location}
                        <br />
                        <Button
                            size="sm"
                            colorScheme="blue"
                            onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/venue/${location.id}`);
                            }}
                        >
                            View Details
                        </Button>
                    </div>
                </Popup>
            </Marker>
        );
    };

    if (loading) {
        return (
            <Flex justify="center" align="center" height="100vh">
                <Spinner size="xl" />
            </Flex>
        );
    }

    if (locationError) {
        return (
            <Flex justify="center" align="center" height="100vh">
                <Text color="red.500">{locationError}</Text>
            </Flex>
        );
    }

    if (!locations || locations.length === 0) {
        return (
            <Flex justify="center" align="center" height="100vh">
                <Text>No locations to display</Text>
            </Flex>
        );
    }

    return (
        <Box position="relative" minHeight="100vh" display="flex" flexDirection="column">
            <Box bg="gray.900" width="100%" py={4} px={6} display="flex" justifyContent="space-between">
                <IconButton
                    icon={<ArrowBackIcon />}
                    onClick={() => navigate(-1)}
                    variant="ghost"
                    colorScheme="whiteAlpha"
                    aria-label="Back"
                />
                <Heading as="h1" size="lg" color="white">
                    Venue Locations
                </Heading>
                <Box w="48px"></Box>
            </Box>

            <MapContainer
                center={userLocation || [locations[0].latitude, locations[0].longitude]}
                zoom={13}
                style={{ height: '400px', width: '100%' }}
                scrollWheelZoom={true}
            >
                <TileLayer
                    attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <LocationMarker userLocation={userLocation} />
                {locations.map((location) => createBarMarker(location))}
                <MapController selectedLocation={selectedLocation} userLocation={userLocation} />
            </MapContainer>

            <Box p={4}>
                <Heading as="h2" size="md" mb={2}>
                    Closest Venues
                </Heading>
                <List spacing={3}>
                    {sortedBars.map((bar) => (
                        <ListItem
                            key={bar.id}
                            onClick={() => handleLocationSelect(bar)}
                            cursor="pointer"
                            bg={selectedMarker === bar.id ? "blue.100" : "transparent"}
                            _hover={{ bg: "gray.100" }}
                            borderRadius="md"
                            p={2}
                        >
                            <HStack justify="space-between" width="100%">
                                <Box>
                                    <Text>
                                        {bar.name} - {bar.location}
                                    </Text>
                                    <Text fontSize="sm" color="gray.500">
                                        {bar.distance.toFixed(2)} km
                                    </Text>
                                </Box>
                                <Button
                                    size="sm"
                                    colorScheme="blue"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        navigate(`/venue/${bar.id}`);
                                    }}
                                >
                                    View Details
                                </Button>
                            </HStack>
                        </ListItem>
                    ))}
                </List>
            </Box>
        </Box>
    );
};

export default MapPage;