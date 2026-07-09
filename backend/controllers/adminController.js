const User = require("../models/User");
const Property = require("../models/Property");
const Inquiry = require("../models/Inquiry");
const sendEmail = require("../utils/emailSender");
const Notification = require("../models/Notification");
const getAdminStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalProperties = await Property.countDocuments();
    const totalInquiries = await Inquiry.countDocuments();
    const totalNotifications = await Notification.countDocuments();
    res.json({
      totalUsers,
      totalProperties,
      totalInquiries,
      totalNotifications,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");

    res.json(users);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        message: "You cannot delete your own admin account",
      });
    }
    await user.deleteOne();

    res.json({
      message: "User deleted",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const updateUserRole = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    user.role = req.body.role;

    await user.save();

    res.json(user);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const approveProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({
        message: "Property not found",
      });
    }

    property.approvalStatus = "approved";

    await property.save();
    await Notification.create({
      user: property.seller,
      title: "Property Approved",
      message: `${property.title} has been approved by admin.`,
    });

    const seller = await User.findById(property.seller);

    if (seller?.email) {
      await sendEmail(
        seller.email,
        "Property Approved",
        `Your property "${property.title}" has been approved by PlotVista.`,
      );
    }
    res.json({
      message: "Property approved",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
const verifySeller = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    user.isVerifiedSeller = true;

    await user.save();

    if (user.email) {
      await sendEmail(
        user.email,
        "Seller Verified",
        "Congratulations! Your seller account is now verified.",
      );
    }
    res.json({
      message: "Seller verified",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
const getAllProperties = async (req, res) => {
  try {
    const properties = await Property.find({ approvalStatus: { $ne: "draft" } })
      .populate("seller", "name email")
      .sort({ createdAt: -1 });

    res.json(properties);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const deleteAnyProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({
        message: "Property not found",
      });
    }

    await property.deleteOne();

    res.json({
      message: "Property deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
module.exports = {
  getAdminStats,
  getAllProperties,
  deleteAnyProperty,
  verifySeller,
  approveProperty,
  getAllUsers,
  deleteUser,
  updateUserRole,
};
