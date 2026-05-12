const express = require('express');
const router = express.Router();
const { createProperty, getProperties, getPropertyById } = require('../controllers/propertyController');
const { protect, sellerOnly } = require('../middleware/authMiddleware');

// Anyone can GET all properties to view on the map
router.get('/', getProperties);

// Anyone can GET a single property's details
router.get('/:id', getPropertyById);

// Only logged-in users who are SELLERS can POST a new property
router.post('/', protect, sellerOnly, createProperty);

module.exports = router;
