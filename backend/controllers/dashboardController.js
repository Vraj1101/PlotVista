const Property = require("../models/Property");
const Inquiry = require("../models/Inquiry");

const getSellerDashboard = async (req, res) => {
  try {
    const sellerId = req.user._id;

    const totalProperties = await Property.countDocuments({
      seller: sellerId,
    });

    const availableProperties = await Property.countDocuments({
      seller: sellerId,
      status: "available",
    });

    const soldProperties = await Property.countDocuments({
      seller: sellerId,
      status: "sold",
    });

    const totalInquiries = await Inquiry.countDocuments({
      seller: sellerId,
    });
    const sellerProperties = await Property.find({
      seller: sellerId,
    });
    const topProperty = await Property.findOne({
      seller: sellerId,
    })
      .sort({ views: -1 })
      .select("title views price");

    const totalViews = sellerProperties.reduce(
      (sum, property) => sum + (property.views || 0),
      0,
    );

    const totalFavorites = sellerProperties.reduce(
      (sum, property) => sum + (property.favoritesCount || 0),
      0,
    );
    
    const recentInquiries =
  await Inquiry.find({
    seller: sellerId,
  })
    .populate("buyer", "name")
    .populate("property", "title")
    .sort({ createdAt: -1 })
    .limit(5);

    res.json({
      totalProperties,
      availableProperties,
      soldProperties,
      totalInquiries,
      totalViews,
      totalFavorites,
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
  getSellerDashboard,
};
