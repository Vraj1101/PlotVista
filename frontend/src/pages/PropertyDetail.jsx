import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const PropertyDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const { data } = await axios.get(`http://localhost:5000/api/properties/${id}`);
        setProperty(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching property', error);
        setLoading(false);
      }
    };
    fetchProperty();
  }, [id]);

  if (loading) return <div className="min-h-screen bg-gray-900 text-white flex justify-center items-center">Loading property...</div>;
  if (!property) return <div className="min-h-screen bg-gray-900 text-white flex justify-center items-center">Property not found.</div>;

  return (
    <div className="min-h-screen bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <button 
          onClick={() => navigate(-1)} 
          className="text-emerald-400 hover:text-emerald-300 mb-6 flex items-center"
        >
          ← Back
        </button>

        <div className="bg-gray-800 rounded-2xl overflow-hidden shadow-2xl border border-gray-700">
          {/* Main Image */}
          {property.images && property.images.length > 0 ? (
            <img 
              src={property.images[0]} 
              alt={property.title} 
              className="w-full h-[400px] object-cover"
            />
          ) : (
            <div className="w-full h-[400px] bg-gray-700 flex items-center justify-center">
              No Image Available
            </div>
          )}

          <div className="p-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-4xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
                  {property.title}
                </h1>
                <p className="text-gray-400 text-lg flex items-center">
                  📍 {property.address}
                </p>
              </div>
              <div className="text-right">
                <p className="text-4xl font-extrabold text-emerald-500">${property.price.toLocaleString()}</p>
                <span className="inline-block mt-2 px-3 py-1 bg-gray-700 rounded-full text-sm font-medium capitalize">
                  {property.propertyType}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8 border-t border-gray-700 pt-8">
              <div className="md:col-span-2 space-y-6">
                <div>
                  <h3 className="text-xl font-semibold mb-3">Description</h3>
                  <p className="text-gray-300 leading-relaxed whitespace-pre-line">
                    {property.description}
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-4 bg-gray-900 p-6 rounded-xl border border-gray-700">
                  <div>
                    <p className="text-gray-500 text-sm">Area Size</p>
                    <p className="text-xl font-semibold">{property.areaSize.toLocaleString()} sq ft</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">Coordinates</p>
                    <p className="text-lg">{property.location.lat.toFixed(4)}, {property.location.lng.toFixed(4)}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-emerald-500/10 border border-emerald-500/20 p-6 rounded-xl">
                  <h3 className="text-lg font-bold text-emerald-400 mb-4">Contact Seller</h3>
                  <p className="text-white font-medium text-lg mb-1">{property.seller?.name}</p>
                  <a href={`mailto:${property.seller?.email}`} className="block w-full text-center py-3 mt-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-bold transition">
                    Email Seller
                  </a>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetail;
