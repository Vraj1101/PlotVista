const User = require("../models/User");
const bcrypt = require("bcryptjs");

const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");

    res.json(user);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }
    if (req.body.phone && !/^[0-9]{10}$/.test(req.body.phone)) {
      return res.status(400).json({
        message: "Phone number must be 10 digits",
      });
    }
    user.name = req.body.name || user.name;
    user.phone = req.body.phone || user.phone;

    if (req.body.password) {
      if (req.body.password.length < 8 || !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(req.body.password)) {
        return res.status(400).json({
          message: "Password must be at least 8 characters and contain uppercase, lowercase, and a number",
        });
      }

      if (!req.body.currentPassword) {
        return res.status(400).json({
          message: "Please enter your current password to set a new password",
        });
      }

      const isMatch = await bcrypt.compare(req.body.currentPassword, user.password);
      if (!isMatch) {
        return res.status(401).json({
          message: "Incorrect current password",
        });
      }

      const salt = await bcrypt.genSalt(10);

      user.password = await bcrypt.hash(req.body.password, salt);
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      phone: updatedUser.phone,
      role: updatedUser.role,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const deleteUserProfile = async (req, res) => {
  try {
    const userId = req.user._id;

    // 1. Delete associated data
    // Delete Favorites
    const Favorite = require("../models/Favorite");
    await Favorite.deleteMany({ user: userId });

    // Delete Inquiries (where user is buyer or seller)
    const Inquiry = require("../models/Inquiry");
    await Inquiry.deleteMany({ $or: [{ buyer: userId }, { seller: userId }] });

    // Delete Properties listed by this user
    const Property = require("../models/Property");
    await Property.deleteMany({ seller: userId });

    // 2. Delete the user account
    await User.deleteOne({ _id: userId });

    res.json({
      message: "Account and all associated data deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  getUserProfile,
  updateUserProfile,
  deleteUserProfile,
};
