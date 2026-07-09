const Favorite = require("../models/Favorite");
const Property = require("../models/Property");
const addFavorite = async (req, res) => {
  try {
    const { propertyId } = req.body;

    const exists = await Favorite.findOne({
      user: req.user._id,
      property: propertyId,
    });

    if (exists) {
      return res.status(400).json({
        message: "Already saved",
      });
    }

    const favorite = await Favorite.create({
      user: req.user._id,
      property: propertyId,
    });

    await Property.findByIdAndUpdate(propertyId, {
      $inc: {
        favoritesCount: 1,
      },
    });

    res.status(201).json(favorite);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const getFavorites = async (req, res) => {
  try {
    const favorites = await Favorite.find({
      user: req.user._id,
    }).populate("property");

    res.json(favorites);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
const removeFavorite = async (req, res) => {
  try {
    const favorite = await Favorite.findById(req.params.id);

    if (!favorite) {
      return res.status(404).json({
        message: "Favorite not found",
      });
    }
    await Property.findByIdAndUpdate(favorite.property, {
      $inc: {
        favoritesCount: -1,
      },
    });
    await favorite.deleteOne();

    res.json({
      message: "Favorite removed",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
module.exports = {
  addFavorite,
  getFavorites,
  removeFavorite,
};
