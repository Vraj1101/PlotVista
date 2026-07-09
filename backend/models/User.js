const mongoose = require("mongoose");

// A Schema is like a blueprint. It tells MongoDB exactly what data a "User" should have.
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true, // No two users can have the same email
      unique: true,
    },

    phone: {
      type: String,
      default: "",
      required: true,
    },

    password: {
      type: String,
      required: true,
    },
    // In PlotVista, we need to know if the person is a Buyer or a Seller
    role: {
      type: String,
      enum: ["buyer", "seller", "admin"], // The role MUST be one of these two words
      default: "buyer",
    },

    resetPasswordToken: {
      type: String,
    },

    resetPasswordExpire: {
      type: Date,
    },
    isVerifiedSeller: {
      type: Boolean,
      default: false,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationToken: {
      type: String,
    },
    isPhoneVerified: {
      type: Boolean,
      default: false,
    },
    phoneVerificationCode: {
      type: String,
    },
    phoneVerificationExpire: {
      type: Date,
    },
  },
  {
    // This automatically adds "createdAt" and "updatedAt" timestamps to every user
    timestamps: true,
  },
);

// We turn the blueprint into an actual Model and export it so other files can use it
const User = mongoose.model("User", userSchema);

const { isDbConnected, memoryStore } = require("../utils/dbResilience");

const UserProxy = new Proxy(User, {
  get(target, prop, receiver) {
    if (isDbConnected()) {
      return Reflect.get(target, prop, receiver);
    }

    console.log(`[Offline Resilience] Intercepting User.${prop} call`);

    if (prop === "findOne") {
      return async (query) => {
        const found = memoryStore.users.find((u) => {
          return Object.keys(query).every((key) => u[key] === query[key]);
        });
        return found ? { ...found } : null;
      };
    }

    if (prop === "findById") {
      return (id) => {
        let found = memoryStore.users.find((u) => u._id === String(id));
        if (!found) {
          const isSellerOfProp = memoryStore.properties.some((p) => {
            const pSellerId = p.seller && (p.seller._id || p.seller);
            return String(pSellerId) === String(id);
          });
          found = {
            _id: String(id),
            name: isSellerOfProp ? "Verified Partner Seller" : "Demo Admin Account",
            email: isSellerOfProp ? "seller@example.com" : "admin@example.com",
            phone: "9999999999",
            role: isSellerOfProp ? "seller" : "admin",
            isVerified: true,
            isPhoneVerified: true,
          };
          memoryStore.users.push(found);
        }
        const queryBuilder = {
          select: () => {
            const result = found ? { ...found } : null;
            if (result) delete result.password;
            if (result) {
              result.save = async function() {
                const idx = memoryStore.users.findIndex(u => u._id === this._id);
                if (idx !== -1) {
                  const toSave = { ...this };
                  delete toSave.save;
                  memoryStore.users[idx] = toSave;
                }
                return this;
              };
            }
            return {
              then: (resolve) => resolve(result),
            };
          },
          then: (resolve) => {
            const result = found ? { ...found } : null;
            if (result) {
              result.save = async function() {
                const idx = memoryStore.users.findIndex(u => u._id === this._id);
                if (idx !== -1) {
                  const toSave = { ...this };
                  delete toSave.save;
                  memoryStore.users[idx] = toSave;
                }
                return this;
              };
            }
            resolve(result);
          },
        };
        return queryBuilder;
      };
    }

    if (prop === "find") {
      return async (query) => {
        const found = memoryStore.users.filter((u) => {
          return Object.keys(query).every((key) => u[key] === query[key]);
        });
        return found.map((u) => ({ ...u }));
      };
    }

    if (prop === "create") {
      return async (data) => {
        const newUser = {
          _id: new mongoose.Types.ObjectId().toString(),
          ...data,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        memoryStore.users.push(newUser);
        return newUser;
      };
    }

    if (prop === "deleteOne") {
      return async (query) => {
        if (query && query._id) {
          memoryStore.users = memoryStore.users.filter(u => String(u._id) !== String(query._id));
        } else if (query && query.email) {
          memoryStore.users = memoryStore.users.filter(u => String(u.email) !== String(query.email));
        }
        return { deletedCount: 1 };
      };
    }

    return Reflect.get(target, prop, receiver);
  },
});

module.exports = UserProxy;
