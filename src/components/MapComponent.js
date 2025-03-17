   // src/components/MapComponent.js
   import React from 'react';
   import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
   import 'leaflet/dist/leaflet.css';
   import L from 'leaflet';
    import { useNavigate } from 'react-router-dom'; //NEW

   // Fix for default marker icon issue with Webpack
   delete L.Icon.Default.prototype._getIconUrl;
   L.Icon.Default.mergeOptions({
     iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
     iconUrl: require('leaflet/dist/images/marker-icon.png'),
     shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
   });

   const MapComponent = ({ locations }) => {
       const navigate = useNavigate(); //NEW
       if (!locations || locations.length === 0) {
           return <div>No locations to display</div>;  // Handle empty locations
       }
     const calculateBounds = (locations) => {
       if (!locations || locations.length === 0) {
         return null; // Or a default center/zoom
       }

       let minLat = locations[0].latitude;
       let maxLat = locations[0].latitude;
       let minLng = locations[0].longitude;
       let maxLng = locations[0].longitude;

       locations.forEach((location) => {
         if (location.latitude < minLat) minLat = location.latitude;
         if (location.latitude > maxLat) maxLat = location.latitude;
         if (location.longitude < minLng) minLng = location.longitude;
         if (location.longitude > maxLng) maxLng = location.longitude;
       });

       return [[minLat, minLng], [maxLat, maxLng]];
     };

     const bounds = calculateBounds(locations);
       return (
           <MapContainer
               bounds={bounds}
               style={{ height: '400px', width: '100%' }} // Adjust size as needed
               scrollWheelZoom={true}
           >
               <TileLayer
                   attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                   url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
               />
               {locations.map((location, index) => (
                   <Marker key={index} position={[location.latitude, location.longitude]}>
                       <Popup>
                        {/*NEW*/}
                        <div>
                            {location.name} <br /> {location.location}
                            <br />
                            {/* Navigate to BarPage when clicking "View Details" */}
                            <Button size="sm" colorScheme="blue" onClick={() => navigate(`/venue/${location.id}`)}>
                                View Details
                            </Button>
                        </div>
                       </Popup>
                   </Marker>
               ))}
           </MapContainer>
       );
   };

   export default MapComponent;