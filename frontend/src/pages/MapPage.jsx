import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

const MapPage = () => {
  const [properties, setProperties] = useState([]);
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const { data } = await axios.get('http://localhost:5000/api/properties');
        setProperties(data);
      } catch (error) {
        console.error('Error fetching properties', error);
      }
    };
    fetchProperties();
  }, []);

  const defaultCenter = [20.5937, 78.9629];

  // Filter the properties based on the selected dropdown value
  const filteredProperties = filterType === 'all' 
    ? properties 
    : properties.filter(p => p.propertyType === filterType);

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-gray-900 relative">
      
      {/* Floating Filter Box */}
      <div className="absolute top-4 right-4 z-[1000] bg-gray-900/95 backdrop-blur-xl p-4 rounded-xl shadow-2xl border border-gray-700">
        <label className="block text-sm font-medium text-emerald-400 mb-2 uppercase tracking-wide">Filter by Type:</label>
        <select 
          value={filterType} 
          onChange={(e) => setFilterType(e.target.value)}
          className="bg-gray-800 text-white rounded-lg px-4 py-2.5 border border-gray-600 focus:outline-none focus:border-emerald-500 w-full font-medium"
        >
          <option value="all">All Properties</option>
          <option value="residential">Residential</option>
          <option value="commercial">Commercial</option>
          <option value="agricultural">Agricultural</option>
        </select>
        <div className="mt-3 text-xs text-gray-400 font-medium">
          Showing {filteredProperties.length} matching plot(s)
        </div>
      </div>

      {/* The Map */}
      <div className="flex-1 relative z-0">
        <MapContainer 
          center={defaultCenter} 
          zoom={5} 
          minZoom={3}
          maxBounds={[[-90, -180], [90, 180]]}
          maxBoundsViscosity={1.0}
          style={{ height: '100%', width: '100%', backgroundColor: '#111827' }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            noWrap={true}
          />

          {filteredProperties.map((property) => (
            <Marker key={property._id} position={[property.location.lat, property.location.lng]}>
              <Popup className="premium-popup">
                <div className="w-64 p-1">
                  {/* Property Image */}
                  {property.images && property.images.length > 0 ? (
                    <img src={property.images[0]} alt="Land" className="w-full h-36 object-cover rounded-t-xl mb-3 shadow-md" />
                  ) : (
                    <div className="w-full h-36 bg-gray-200 rounded-t-xl mb-3 flex items-center justify-center text-gray-400">No Image</div>
                  )}
                  
                  {/* Property Details */}
                  <div className="px-2 pb-2">
                    <h3 className="font-extrabold text-lg text-gray-900 leading-tight mb-1 truncate">{property.title}</h3>
                    <p className="text-xs text-gray-500 mb-2 truncate flex items-center">
                      📍 {property.address}
                    </p>
                    <p className="text-emerald-600 font-black text-lg mb-4">${property.price.toLocaleString()}</p>
                    
                    {/* Seller Box */}
                    <div className="bg-gray-50 p-3 rounded-lg mb-4 border border-gray-100 shadow-inner">
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Listed by</p>
                      <p className="text-sm text-gray-800 font-bold truncate">{property.seller?.name || 'Unknown Seller'}</p>
                    </div>
                    
                    {/* Button */}
                    <Link 
                      to={`/property/${property._id}`} 
                      className="block w-full py-2.5 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white text-center font-bold rounded-lg hover:from-emerald-400 hover:to-cyan-400 transition-all duration-300 shadow-md hover:shadow-emerald-500/50 transform hover:-translate-y-0.5"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
};

export default MapPage;
