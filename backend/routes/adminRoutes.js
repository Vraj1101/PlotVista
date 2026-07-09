const express = require("express");

const router = express.Router();

const { protect } = require("../middleware/authMiddleware");
const { admin } = require("../middleware/adminMiddleware");

const {
  getAdminStats,
  getAllProperties,
  getAllUsers,
  deleteUser,
  updateUserRole,
  deleteAnyProperty,
  approveProperty,
  verifySeller,
} = require("../controllers/adminController");

router.get("/stats", protect, admin, getAdminStats);
router.get("/properties", protect, admin, getAllProperties);
router.get("/users", protect, admin, getAllUsers);

router.delete("/users/:id", protect, admin, deleteUser);

router.put("/users/:id/role", protect, admin, updateUserRole);

router.delete("/properties/:id", protect, admin, deleteAnyProperty);
router.put("/properties/:id/approve", protect, admin, approveProperty);
router.put("/users/:id/verify", protect, admin, verifySeller);
module.exports = router;
