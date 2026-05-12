const Property = require('../models/Property');

// @desc    Create a new property listing
// @route   POST /api/properties
// @access  Private/Seller
const createProperty = async (req, res) => {
  try {
    const { title, description, price, areaSize, address, lat, lng, propertyType, images } = req.body;

    // Create the property using the data sent from the frontend
    const property = await Property.create({
      title,
      description,
      price,
      areaSize,
      address,
      location: { lat, lng },
      propertyType,
      images,
      seller: req.user._id // We get this from the auth middleware!
    });

    res.status(201).json(property);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all properties (for buyers to see on the map)
// @route   GET /api/properties
// @access  Public
const getProperties = async (req, res) => {
  try {
    // Find all properties and also attach the seller's name and email
    const properties = await Property.find({}).populate('seller', 'name email');
    res.json(properties);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single property by ID
// @route   GET /api/properties/:id
// @access  Public
const getPropertyById = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id).populate('seller', 'name email');
    if (property) {
      res.json(property);
    } else {
      res.status(404).json({ message: 'Property not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createProperty, getProperties, getPropertyById };
