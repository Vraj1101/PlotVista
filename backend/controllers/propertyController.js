const Property = require("../models/Property");

// @desc    Create a new property listing
// @route   POST /api/properties
// @access  Private/Seller
const createProperty = async (req, res) => {
  try {
    const {
      title,
      description,
      price,
      areaSize,
      address,
      lat,
      lng,
      propertyType,
      images,
      approvalStatus,
    } = req.body;

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
      seller: req.user._id, // We get this from the auth middleware!
      approvalStatus: approvalStatus || "pending",
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
    // SEARCH FILTER
    const keyword = req.query.search
      ? {
          $or: [
            {
              title: {
                $regex: req.query.search,
                $options: "i",
              },
            },
            {
              address: {
                $regex: req.query.search,
                $options: "i",
              },
            },
          ],
        }
      : {};
    keyword.approvalStatus = "approved";
    // PROPERTY TYPE FILTER
    if (req.query.type) {
      keyword.propertyType = req.query.type;
    }
    if (req.query.minPrice || req.query.maxPrice) {
      keyword.price = {};

      if (req.query.minPrice) {
        keyword.price.$gte = Number(req.query.minPrice);
      }

      if (req.query.maxPrice) {
        keyword.price.$lte = Number(req.query.maxPrice);
      }
    }

    // PAGINATION
    const page = Number(req.query.page) || 1;

    const limit = 10;

    const skip = (page - 1) * limit;

    // TOTAL MATCHING PROPERTIES
    let properties = await Property.find({
      ...keyword,
      approvalStatus: "approved",
    });

    const total = properties.length;

    if (req.query.sort === "price_asc") {
      properties.sort((a, b) => a.price - b.price);
    } else if (req.query.sort === "price_desc") {
      properties.sort((a, b) => b.price - a.price);
    }

    properties = properties.slice(skip, skip + limit);

    // RESPONSE
    res.json({
      properties,
      page,
      pages: Math.ceil(total / limit),
      total,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// @desc    Get single property by ID
// @route   GET /api/properties/:id
// @access  Public
const getPropertyById = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id).populate(
      "seller",
      "name email phone",
    );

    if (!property) {
      return res.status(404).json({
        message: "Property not found",
      });
    }

    // Identify user uniquely (by authenticated ID or fallback to IP)
    let viewerId = req.ip || "unknown-ip";
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
      try {
        const token = req.headers.authorization.split(" ")[1];
        const decoded = require("jsonwebtoken").verify(
          token,
          process.env.JWT_SECRET || "supersecretkey123"
        );
        if (decoded && decoded.id) {
          viewerId = decoded.id;
        }
      } catch (err) {
        // Ignore invalid tokens and keep fallback
      }
    }

    if (!property.viewedBy) {
      property.viewedBy = [];
    }

    // Only increment views if this unique user/IP hasn't viewed it yet
    if (!property.viewedBy.includes(String(viewerId))) {
      property.viewedBy.push(String(viewerId));
      property.views = (property.views || 0) + 1;
      await property.save();
    }

    const nearbyProperties = await Property.find({
      _id: { $ne: property._id },
      propertyType: property.propertyType,
    }).limit(3);

    res.json({
      property,
      nearbyProperties,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const getMyProperties = async (req, res) => {
  try {
    const properties = await Property.find({
      seller: req.user._id,
    });

    res.json(properties);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const deleteProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({
        message: "Property not found",
      });
    }

    if (property.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "Not authorized to delete this property",
      });
    }

    await property.deleteOne();

    res.json({
      message: "Property deleted",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
const updateProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({
        message: "Property not found",
      });
    }

    if (property.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "Not authorized",
      });
    }

    property.title = req.body.title || property.title;

    property.description = req.body.description || property.description;

    property.price = req.body.price || property.price;

    property.status = req.body.status || property.status;

    property.areaSize = req.body.areaSize || property.areaSize;

    property.address = req.body.address || property.address;

    property.propertyType = req.body.propertyType || property.propertyType;

    if (req.body.approvalStatus) {
      property.approvalStatus = req.body.approvalStatus;
    }

    const updatedProperty = await property.save();

    res.json(updatedProperty);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
const Inquiry = require("../models/Inquiry");

const getDashboardStats = async (req, res) => {
  try {
    const properties = await Property.find({
      seller: req.user._id,
    });

    const totalProperties = properties.length;

    const totalViews = properties.reduce(
      (sum, property) => sum + (property.views || 0),
      0,
    );

    const totalFavorites = properties.reduce(
      (sum, property) => sum + (property.favoritesCount || 0),
      0,
    );

    const totalInquiries = await Inquiry.countDocuments({
      seller: req.user._id,
    });

    const availableProperties = properties.filter(
      (p) => p.status === "available",
    ).length;

    const soldProperties = properties.filter((p) => p.status === "sold").length;

    const topProperty = [...properties].sort(
      (a, b) => (b.views || 0) - (a.views || 0),
    )[0];

    const recentInquiries = await Inquiry.find({
      seller: req.user._id,
    })
      .populate("buyer", "name")
      .populate("property", "title")
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      totalProperties,
      totalViews,
      totalFavorites,
      totalInquiries,
      availableProperties,
      soldProperties,
      topProperty,
      recentInquiries,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
module.exports = {
  createProperty,
  getProperties,
  getPropertyById,
  getMyProperties,
  deleteProperty,
  getDashboardStats,
  updateProperty,
};
