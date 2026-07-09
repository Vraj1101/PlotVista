const Inquiry = require("../models/Inquiry");
const Property = require("../models/Property");
const Notification = require("../models/Notification");
const sendEmail = require("../utils/emailSender");
const User = require("../models/User");

const createInquiry = async (req, res) => {
  try {
    const { propertyId, message } = req.body;

    const property = await Property.findById(propertyId);

    if (!property) {
      return res.status(404).json({
        message: "Property not found",
      });
    }

    const inquiry = await Inquiry.create({
      property: propertyId,
      buyer: req.user._id,
      seller: property.seller,
      message,
      buyerUnreadCount: 0,
      sellerUnreadCount: 1,
    });

    await Notification.create({
      user: property.seller,
      title: "New Inquiry",
      message: `You received a new inquiry for ${property.title}`,
    });

    const seller = await User.findById(property.seller);

    if (seller?.email) {
      sendEmail(
        seller.email,
        "New Inquiry Received",
        `You received a new inquiry for your property "${property.title}".`,
      ).catch((err) => console.log("Background email send error:", err.message));
    }
  
    res.status(201).json(inquiry);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const getSellerInquiries = async (req, res) => {
  try {
    const inquiries = await Inquiry.find({
      seller: req.user._id,
    })
      .sort({ createdAt: -1 })
      .populate("buyer", "name email phone")
      .populate("property", "title price")
      .populate("replies.sender", "name role");

    res.json(inquiries);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const markInquiryContacted = async (req, res) => {
  try {
    const inquiry = await Inquiry.findById(req.params.id);

    if (!inquiry) {
      return res.status(404).json({
        message: "Inquiry not found",
      });
    }

    const sellerId = inquiry.seller && (inquiry.seller._id || inquiry.seller);
    if (String(sellerId) !== String(req.user._id)) {
      return res.status(401).json({
        message: "Not authorized",
      });
    }

    inquiry.status = "contacted";

    const updatedInquiry = await inquiry.save();

    res.json(updatedInquiry);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const addReply = async (req, res) => {
  try {
    const { message } = req.body;

    const inquiry = await Inquiry.findById(req.params.id);

    if (!inquiry) {
      return res.status(404).json({
        message: "Inquiry not found",
      });
    }
    const sellerId = inquiry.seller && (inquiry.seller._id || inquiry.seller);
    const buyerId = inquiry.buyer && (inquiry.buyer._id || inquiry.buyer);

    if (
      String(sellerId) !== String(req.user._id) &&
      String(buyerId) !== String(req.user._id)
    ) {
      return res.status(401).json({
        message: "Not authorized",
      });
    }

    const isSeller = String(sellerId) === String(req.user._id);
    inquiry.replies.push({
      sender: req.user._id,
      senderRole: isSeller ? "seller" : "buyer",
      message,
    });

    if (req.user.role === "seller") {
      inquiry.buyerUnreadCount = (inquiry.buyerUnreadCount || 0) + 1;
      inquiry.sellerUnreadCount = 0;
    } else {
      inquiry.sellerUnreadCount = (inquiry.sellerUnreadCount || 0) + 1;
      inquiry.buyerUnreadCount = 0;
    }

    await inquiry.save();

    const receiver =
      req.user.role === "seller" ? buyerId : sellerId;

    await Notification.create({
      user: receiver,
      title: "New Message",
      message: "You received a new reply.",
    });

    const receiverUser = await User.findById(receiver);

    if (receiverUser?.email) {
      sendEmail(
        receiverUser.email,
        "New Message on PlotVista",
        "You have received a new reply in your conversation.",
      ).catch((err) => console.log("Background email send error:", err.message));
    }

    const updatedInquiry = await Inquiry.findById(req.params.id).populate(
      "replies.sender",
      "name role",
    );

    res.json(updatedInquiry);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const getBuyerInquiries = async (req, res) => {
  try {
    const inquiries = await Inquiry.find({
      buyer: req.user._id,
    })
      .sort({ createdAt: -1 })
      .populate("seller", "name email phone isVerifiedSeller ")
      .populate("property", "title price")
      .populate("replies.sender", "name role");

    res.json(inquiries);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const markBuyerInquiriesRead = async (req, res) => {
  try {
    await Inquiry.updateMany(
      { buyer: req.user._id },
      { $set: { buyerUnreadCount: 0 } }
    );
    res.json({ message: "All buyer inquiries marked as read" });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const markSellerInquiriesRead = async (req, res) => {
  try {
    await Inquiry.updateMany(
      { seller: req.user._id },
      { $set: { sellerUnreadCount: 0 } }
    );
    res.json({ message: "All seller inquiries marked as read" });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  createInquiry,
  getBuyerInquiries,
  getSellerInquiries,
  markInquiryContacted,
  addReply,
  markBuyerInquiriesRead,
  markSellerInquiriesRead,
};
