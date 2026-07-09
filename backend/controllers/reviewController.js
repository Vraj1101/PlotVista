const Review = require("../models/Review");
const Property = require("../models/Property");

const addReview = async (req, res) => {
  try {
    const { propertyId, rating, comment } = req.body;

    const exists = await Review.findOne({
      property: propertyId,
      user: req.user._id,
    });

    if (exists) {
      return res.status(400).json({
        message: "You already reviewed this property",
      });
    }

    const review = await Review.create({
      property: propertyId,
      user: req.user._id,
      rating,
      comment,
    });

    const reviews = await Review.find({
      property: propertyId,
    });

    const average =
      reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

    await Property.findByIdAndUpdate(propertyId, {
      averageRating: average,
      numReviews: reviews.length,
    });

    res.status(201).json({
      message: "Review added",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const getReviews = async (req, res) => {
  try {
    const reviews = await Review.find({
      property: req.params.propertyId,
    }).populate("user", "name");

    res.json(reviews);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  addReview,
  getReviews,
};
