import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const SellerDashboard = () => {
  const navigate = useNavigate();
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));

  if (!userInfo || userInfo.role !== 'seller') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        <h2 className="text-2xl">Access Denied. You must be logged in as a Seller.</h2>
      </div>
    );
  }

  const [formData, setFormData] = useState({
    title: '', description: '', price: '', areaSize: '', address: '', 
    lat: '', lng: '', propertyType: 'residential'
  });
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    setImages(Array.from(e.target.files));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    setMessage('');

    try {
      console.log("Starting local image uploads...");
      const imageUrls = [];
      
      const config = {
        headers: {
          'Authorization': `Bearer ${userInfo.token}`
        }
      };

      // 1. Upload each image to our local Node.js server
      for (const image of images) {
        const uploadData = new FormData();
        uploadData.append('image', image);

        // This requires headers for multipart form data
        const uploadConfig = {
          headers: {
            'Content-Type': 'multipart/form-data',
          }
        };

        const { data } = await axios.post('http://localhost:5000/api/upload', uploadData, uploadConfig);
        
        // Construct the full URL to the image on our server
        const fullImageUrl = `http://localhost:5000${data}`;
        imageUrls.push(fullImageUrl);
      }

      console.log("Images uploaded! Sending data to MongoDB...");

      // 2. Send the property data to MongoDB
      const propertyData = {
        ...formData,
        price: Number(formData.price),
        areaSize: Number(formData.areaSize),
        lat: Number(formData.lat),
        lng: Number(formData.lng),
        images: imageUrls
      };

      await axios.post('http://localhost:5000/api/properties', propertyData, config);

      setMessage('Property successfully listed!');
      setUploading(false);
      setFormData({ title: '', description: '', price: '', areaSize: '', address: '', lat: '', lng: '', propertyType: 'residential' });
      setImages([]);

    } catch (error) {
      console.error(error);
      setMessage('Failed to upload property. Please try again.');
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 p-8 text-white">
      <div className="max-w-4xl mx-auto bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 shadow-xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
            Seller Dashboard
          </h1>
          <button onClick={() => navigate('/dashboard')} className="text-emerald-400 hover:text-emerald-300">
            Back to Main Dashboard
          </button>
        </div>

        <p className="text-gray-400 mb-8">List a new land or plot. Fill out the details below and upload real ground photos.</p>

        {message && (
          <div className={`p-4 mb-6 rounded-lg ${message.includes('success') ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50' : 'bg-red-500/20 text-red-300 border-red-500/50'} border`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Property Title</label>
              <input type="text" name="title" required value={formData.title} onChange={handleInputChange} className="w-full px-4 py-2 bg-gray-800 rounded-lg border border-gray-700 focus:border-emerald-500 focus:outline-none" placeholder="e.g. 5 Acres Prime Farmland" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Property Type</label>
              <select name="propertyType" value={formData.propertyType} onChange={handleInputChange} className="w-full px-4 py-2 bg-gray-800 rounded-lg border border-gray-700 focus:border-emerald-500 focus:outline-none">
                <option value="residential">Residential</option>
                <option value="commercial">Commercial</option>
                <option value="agricultural">Agricultural</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Price ($)</label>
              <input type="number" name="price" required value={formData.price} onChange={handleInputChange} className="w-full px-4 py-2 bg-gray-800 rounded-lg border border-gray-700 focus:border-emerald-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Area Size (sq ft)</label>
              <input type="number" name="areaSize" required value={formData.areaSize} onChange={handleInputChange} className="w-full px-4 py-2 bg-gray-800 rounded-lg border border-gray-700 focus:border-emerald-500 focus:outline-none" />
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Description</label>
            <textarea name="description" required value={formData.description} onChange={handleInputChange} rows="4" className="w-full px-4 py-2 bg-gray-800 rounded-lg border border-gray-700 focus:border-emerald-500 focus:outline-none" placeholder="Describe the land, surrounding area, water availability, etc."></textarea>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Address / General Location</label>
            <input type="text" name="address" required value={formData.address} onChange={handleInputChange} className="w-full px-4 py-2 bg-gray-800 rounded-lg border border-gray-700 focus:border-emerald-500 focus:outline-none" />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Latitude (for map)</label>
              <input type="number" step="any" name="lat" required value={formData.lat} onChange={handleInputChange} className="w-full px-4 py-2 bg-gray-800 rounded-lg border border-gray-700 focus:border-emerald-500 focus:outline-none" placeholder="e.g. 34.0522" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Longitude (for map)</label>
              <input type="number" step="any" name="lng" required value={formData.lng} onChange={handleInputChange} className="w-full px-4 py-2 bg-gray-800 rounded-lg border border-gray-700 focus:border-emerald-500 focus:outline-none" placeholder="e.g. -118.2437" />
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Upload Ground Photos</label>
            <input type="file" multiple accept="image/*" onChange={handleImageChange} required className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-emerald-500 file:text-white hover:file:bg-emerald-600" />
            <p className="text-xs text-gray-500 mt-1">Select multiple images to show the real ground condition.</p>
          </div>

          <button type="submit" disabled={uploading} className={`w-full py-3 rounded-lg font-bold text-white transition-all ${uploading ? 'bg-gray-600 cursor-not-allowed' : 'bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 hover:shadow-lg hover:shadow-emerald-500/50'}`}>
            {uploading ? 'Uploading Images & Saving...' : 'List Property'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SellerDashboard;
