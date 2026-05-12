const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  areaSize: {
    type: Number, // In square feet or square meters
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  // We need exact latitude and longitude for the Interactive Maps later
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
  },
  propertyType: {
    type: String,
    enum: ['residential', 'commercial', 'agricultural'],
    required: true,
  },
  // This will store an array of image URLs (from Firebase)
  images: [{
    type: String, 
  }],
  // This links the property to the specific user who uploaded it
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  status: {
    type: String,
    enum: ['available', 'sold'],
    default: 'available',
  }
}, {
  timestamps: true,
});

const Property = mongoose.model('Property', propertySchema);

module.exports = Property;
