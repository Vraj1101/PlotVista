const express = require("express");

const router = express.Router();

const {
  getSellerDashboard,
} = require("../controllers/dashboardController");

const {
  protect,
  sellerOnly,
} = require("../middleware/authMiddleware");

router.get(
  "/seller",
  protect,
  sellerOnly,
  getSellerDashboard
);

module.exports = router;