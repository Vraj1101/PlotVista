const express = require("express");

const router = express.Router();

const {
  createInquiry,
  getSellerInquiries,
  markInquiryContacted,
  addReply,
  getBuyerInquiries,
  markBuyerInquiriesRead,
  markSellerInquiriesRead,
} = require("../controllers/inquiryController");

const { protect } = require("../middleware/authMiddleware");

router.post("/", protect, createInquiry);

router.get("/seller", protect, getSellerInquiries);

router.get("/buyer", protect, getBuyerInquiries);

router.put("/read/buyer", protect, markBuyerInquiriesRead);
router.put("/read/seller", protect, markSellerInquiriesRead);

router.put("/:id/contacted", protect, markInquiryContacted);

router.post("/:id/reply", protect, addReply);

module.exports = router;
