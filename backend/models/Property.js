const mongoose = require("mongoose");

const propertySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    areaSize: {
      type: Number, // In square feet or square meters
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    // We need exact latitude and longitude for the Interactive Maps later
    location: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
    propertyType: {
      type: String,
      enum: ["residential", "commercial", "agricultural"],
      required: true,
    },
    // This will store an array of image URLs (from Firebase)
    images: [
      {
        type: String,
      },
    ],
    // This links the property to the specific user who uploaded it
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["available", "reserved", "sold"],
      default: "available",
    },
    views: {
      type: Number,
      default: 0,
    },
    viewedBy: [
      {
        type: String,
      }
    ],
    favoritesCount: {
      type: Number,
      default: 0,
    },
    averageRating: {
      type: Number,
      default: 0,
    },

    reviewCount: {
      type: Number,
      default: 0,
    },
    approvalStatus: {
      type: String,
      enum: ["pending", "approved", "rejected", "draft"],
      default: "pending",
    },
    numReviews:{
      type: Number,
      default: 0,
    }
  },
  {
    timestamps: true,
  },
);

const Property = mongoose.model("Property", propertySchema);

const { isDbConnected, memoryStore } = require("../utils/dbResilience");
const PropertyProxy = new Proxy(Property, {
  get(target, prop, receiver) {
    if (typeof prop === "symbol") {
      return Reflect.get(target, prop, receiver);
    }

    if (isDbConnected()) {
      return Reflect.get(target, prop, receiver);
    }

    console.log(
      `[Offline Resilience] Intercepting Property.${String(prop)} call`,
    );

    if (prop === "find") {
      return (query) => {
        let results = [...memoryStore.properties];
        if (query) {
          if (query.seller) {
            results = results.filter((p) => {
              const pSellerId =
                typeof p.seller === "object" ? p.seller._id : p.seller;
              return String(pSellerId) === String(query.seller);
            });
          }
          if (query.propertyType) {
            results = results.filter(
              (p) => p.propertyType === query.propertyType,
            );
          }
          if (query.price) {
            if (query.price.$gte != null) {
              results = results.filter((p) => p.price >= query.price.$gte);
            }
            if (query.price.$lte != null) {
              results = results.filter((p) => p.price <= query.price.$lte);
            }
          }
          if (query.approvalStatus) {
            if (typeof query.approvalStatus === "object" && query.approvalStatus.$ne) {
              results = results.filter(
                (p) => (p.approvalStatus || "pending") !== query.approvalStatus.$ne
              );
            } else {
              results = results.filter(
                (p) => (p.approvalStatus || "pending") === query.approvalStatus
              );
            }
          }
          if (query.$or) {
            results = results.filter((p) => {
              return query.$or.some((condition) => {
                const key = Object.keys(condition)[0];
                const condVal = condition[key];
                if (condVal && condVal.$regex) {
                  const reg = new RegExp(
                    condVal.$regex,
                    condVal.$options || "i",
                  );
                  return reg.test(p[key] || "");
                }
                return false;
              });
            });
          }
        }
        const queryBuilder = {
          populate: () => {
            return {
              then: (resolve) => resolve(results),
            };
          },
          then: (resolve) => resolve(results),
        };
        return queryBuilder;
      };
    }

    if (prop === "findOne") {
      return (query) => {
        let results = [...memoryStore.properties];
        if (query) {
          if (query.seller) {
            results = results.filter((p) => {
              const pSellerId =
                typeof p.seller === "object" ? p.seller._id : p.seller;
              return String(pSellerId) === String(query.seller);
            });
          }
        }
        let sortField = "";
        let sortDir = -1;
        const queryBuilder = {
          sort: (sortObj) => {
            if (sortObj) {
              const field = Object.keys(sortObj)[0];
              sortField = field;
              sortDir = sortObj[field];
            }
            return queryBuilder;
          },
          select: () => {
            return queryBuilder;
          },
          then: (resolve) => {
            if (sortField) {
              results.sort((a, b) => {
                const aVal = a[sortField] || 0;
                const bVal = b[sortField] || 0;
                return sortDir === -1 ? bVal - aVal : aVal - bVal;
              });
            }
            resolve(results[0] || null);
          },
        };
        return queryBuilder;
      };
    }

    if (prop === "findById") {
      return (id) => {
        const found = memoryStore.properties.find((p) => p._id === String(id));
        const queryBuilder = {
          populate: () => {
            const result = found ? { ...found } : null;
            if (result) {
              result.save = async function() {
                const idx = memoryStore.properties.findIndex((p) => p._id === this._id);
                if (idx !== -1) {
                  const toSave = { ...this };
                  delete toSave.save;
                  memoryStore.properties[idx] = toSave;
                }
                return this;
              };
            }
            return {
              then: (resolve) => resolve(result || null),
            };
          },
          then: (resolve) => {
            const result = found ? { ...found } : null;
            if (result) {
              result.save = async function() {
                const idx = memoryStore.properties.findIndex((p) => p._id === this._id);
                if (idx !== -1) {
                  const toSave = { ...this };
                  delete toSave.save;
                  memoryStore.properties[idx] = toSave;
                }
                return this;
              };
            }
            resolve(result || null);
          },
        };
        return queryBuilder;
      };
    }

    if (prop === "findByIdAndUpdate") {
      return async (id, update) => {
        const idx = memoryStore.properties.findIndex((p) => String(p._id) === String(id));
        if (idx !== -1) {
          const property = { ...memoryStore.properties[idx] };
          if (update) {
            if (update.$inc) {
              for (const key of Object.keys(update.$inc)) {
                property[key] = (property[key] || 0) + update.$inc[key];
              }
            }
            if (update.$set) {
              for (const key of Object.keys(update.$set)) {
                property[key] = update.$set[key];
              }
            }
            for (const key of Object.keys(update)) {
              if (!key.startsWith('$')) {
                property[key] = update[key];
              }
            }
          }
          memoryStore.properties[idx] = property;
          return property;
        }
        return null;
      };
    }

    if (prop === "create") {
      return async (data) => {
        const sellerUser = memoryStore.users.find(
          (u) => u._id === String(data.seller),
        ) || {
          _id: String(data.seller),
          name: "Verified Partner Seller",
          email: "bot@aggregator.com",
        };

        const newProperty = {
          _id: new mongoose.Types.ObjectId().toString(),
          ...data,
          seller: {
            _id: sellerUser._id,
            name: sellerUser.name,
            email: sellerUser.email,
          },
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        memoryStore.properties.push(newProperty);
        return newProperty;
      };
    }
    if (prop === "countDocuments") {
      return async (query) => {
        let results = [...memoryStore.properties];
        if (query) {
          if (query.seller) {
            results = results.filter((p) => {
              const pSellerId =
                typeof p.seller === "object" ? p.seller._id : p.seller;
              return String(pSellerId) === String(query.seller);
            });
          }
          if (query.status) {
            results = results.filter((p) => p.status === query.status);
          }
        }
        return results.length;
      };
    }
    if (prop === "deleteMany") {
      return async (query) => {
        if (query && query.seller) {
          memoryStore.properties = memoryStore.properties.filter((p) => {
            const pSellerId = typeof p.seller === "object" ? p.seller._id : p.seller;
            return String(pSellerId) !== String(query.seller);
          });
        }
        return { deletedCount: 1 };
      };
    }
    return Reflect.get(target, prop, receiver);
  },
});

module.exports = PropertyProxy;
