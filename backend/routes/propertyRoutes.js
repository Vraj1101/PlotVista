const express = require("express");
const router = express.Router();
const {
  createProperty,
  getProperties,
  getPropertyById,
  getMyProperties,
  deleteProperty,
  updateProperty,
  getDashboardStats
} = require("../controllers/propertyController");
const { protect, sellerOnly } = require("../middleware/authMiddleware");

// Anyone can GET all properties to view on the map
router.get('/', getProperties);

router.get('/my', protect, getMyProperties);

router.get('/:id', getPropertyById);

router.post('/', protect, createProperty);

router.delete('/:id', protect, deleteProperty);
router.put('/:id', protect, updateProperty);
router.get(
  "/dashboard/stats",
  protect,
  getDashboardStats,
);
module.exports = router;
     