const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
      required: true,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },

    comment: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

const Review = mongoose.model(
  "Review",
  reviewSchema
);

const { isDbConnected, memoryStore } = require("../utils/dbResilience");

if (!memoryStore.reviews) {
  memoryStore.reviews = [];
}

const ReviewProxy = new Proxy(Review, {
  get(target, prop, receiver) {
    if (isDbConnected()) {
      return Reflect.get(target, prop, receiver);
    }

    console.log(`[Offline Resilience] Intercepting Review.${String(prop)} call`);

    if (prop === "findOne") {
      return async (query) => {
        const found = memoryStore.reviews.find((r) => {
          return String(r.property) === String(query.property) && String(r.user) === String(query.user);
        });
        return found ? { ...found } : null;
      };
    }

    if (prop === "create") {
      return async (data) => {
        const newReview = {
          _id: new mongoose.Types.ObjectId().toString(),
          ...data,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        memoryStore.reviews.push(newReview);
        return newReview;
      };
    }

    if (prop === "find") {
      return (query) => {
        let results = [...memoryStore.reviews];
        if (query && query.property) {
          results = results.filter((r) => String(r.property) === String(query.property));
        }
        const queryBuilder = {
          populate: (path) => {
            if (path === "user") {
              results = results.map((r) => {
                const user = memoryStore.users.find((u) => String(u._id) === String(r.user));
                return {
                  ...r,
                  user: user ? { ...user } : null,
                };
              });
            }
            return {
              then: (resolve) => resolve(results),
            };
          },
          then: (resolve) => resolve(results),
        };
        return queryBuilder;
      };
    }

    return Reflect.get(target, prop, receiver);
  },
});

module.exports = ReviewProxy;