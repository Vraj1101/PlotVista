const mongoose = require("mongoose");


const inquirySchema = new mongoose.Schema(
  {
    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
      required: true,
    },

    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    message: {
      type: String,
      required: true,
    },
    replies: [
      {
        sender: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },

        senderRole: {
          type: String,
          enum: ["buyer", "seller"],
          required: true,
        },

        message: {
          type: String,
          required: true,
        },

        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    status: {
      type: String,
      enum: ["pending", "contacted"],
      default: "pending",
    },
    buyerUnreadCount: {
      type: Number,
      default: 0,
    },
    sellerUnreadCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

const Inquiry = mongoose.model("Inquiry", inquirySchema);

const { isDbConnected, memoryStore } = require("../utils/dbResilience");

// Ensure memoryStore has inquiries array
if (!memoryStore.inquiries) {
  memoryStore.inquiries = [];
}

const getValId = (val) => {
  if (!val) return "";
  if (typeof val === "object") {
    return val._id ? String(val._id) : String(val);
  }
  return String(val);
};

const InquiryProxy = new Proxy(Inquiry, {
  get(target, prop, receiver) {
    if (isDbConnected()) {
      return Reflect.get(target, prop, receiver);
    }

    console.log(`[Offline Resilience] Intercepting Inquiry.${String(prop)} call`);

    if (prop === "find") {
      return (query) => {
        let results = [...memoryStore.inquiries];
        if (query) {
          if (query.buyer) {
            results = results.filter((i) => getValId(i.buyer) === getValId(query.buyer));
          }
          if (query.seller) {
            results = results.filter((i) => getValId(i.seller) === getValId(query.seller));
          }
          if (query.property) {
            results = results.filter((i) => getValId(i.property) === getValId(query.property));
          }
        }
        let sortField = "";
        let sortDir = -1;
        let limitVal = 0;
        const queryBuilder = {
          populate: (path) => {
            results = results.map((i) => {
              const updated = { ...i };
              if (path === "buyer") {
                const user = memoryStore.users.find((u) => getValId(u._id) === getValId(i.buyer));
                updated.buyer = user ? { ...user } : null;
              }
              if (path === "seller") {
                const user = memoryStore.users.find((u) => getValId(u._id) === getValId(i.seller));
                updated.seller = user ? { ...user } : null;
              }
              if (path === "property") {
                const propDoc = memoryStore.properties.find((p) => getValId(p._id) === getValId(i.property));
                updated.property = propDoc ? { ...propDoc } : null;
              }
              return updated;
            });
            return queryBuilder;
          },
          sort: (sortObj) => {
            if (sortObj) {
              const field = Object.keys(sortObj)[0];
              sortField = field;
              sortDir = sortObj[field];
            }
            return queryBuilder;
          },
          limit: (val) => {
            limitVal = val;
            return queryBuilder;
          },
          then: (resolve) => {
            let finalResults = [...results];
            if (sortField) {
              finalResults.sort((a, b) => {
                const aVal = a[sortField] || 0;
                const bVal = b[sortField] || 0;
                return sortDir === -1 ? (bVal > aVal ? 1 : -1) : (aVal > bVal ? 1 : -1);
              });
            }
            if (limitVal > 0) {
              finalResults = finalResults.slice(0, limitVal);
            }
            resolve(finalResults);
          },
        };
        return queryBuilder;
      };
    }

    if (prop === "findOne") {
      return (query) => {
        let results = [...memoryStore.inquiries];
        if (query) {
          if (query.buyer) {
            results = results.filter((i) => getValId(i.buyer) === getValId(query.buyer));
          }
          if (query.seller) {
            results = results.filter((i) => getValId(i.seller) === getValId(query.seller));
          }
          if (query.property) {
            results = results.filter((i) => getValId(i.property) === getValId(query.property));
          }
        }
        const queryBuilder = {
          then: (resolve) => resolve(results[0] || null),
        };
        return queryBuilder;
      };
    }

    if (prop === "findById") {
      return (id) => {
        const found = memoryStore.inquiries.find((i) => getValId(i._id) === getValId(id));
        const queryBuilder = {
          populate: (path) => {
            const result = found ? { ...found } : null;
            if (result) {
              if (path === "buyer") {
                const user = memoryStore.users.find((u) => getValId(u._id) === getValId(found.buyer));
                result.buyer = user ? { ...user } : null;
              }
              if (path === "seller") {
                const user = memoryStore.users.find((u) => getValId(u._id) === getValId(found.seller));
                result.seller = user ? { ...user } : null;
              }
              if (path === "property") {
                const propDoc = memoryStore.properties.find((p) => getValId(p._id) === getValId(found.property));
                result.property = propDoc ? { ...propDoc } : null;
              }
              result.save = async function() {
                const idx = memoryStore.inquiries.findIndex((i) => getValId(i._id) === getValId(this._id));
                if (idx !== -1) {
                  const toSave = { ...this };
                  delete toSave.save;
                  memoryStore.inquiries[idx] = toSave;
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
                const idx = memoryStore.inquiries.findIndex((i) => getValId(i._id) === getValId(this._id));
                if (idx !== -1) {
                  const toSave = { ...this };
                  delete toSave.save;
                  memoryStore.inquiries[idx] = toSave;
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

    if (prop === "create") {
      return async (data) => {
        const newInquiry = {
          _id: new mongoose.Types.ObjectId().toString(),
          ...data,
          replies: data.replies || [],
          buyerUnreadCount: data.buyerUnreadCount || 0,
          sellerUnreadCount: data.sellerUnreadCount || 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        memoryStore.inquiries.push(newInquiry);
        return newInquiry;
      };
    }

    if (prop === "countDocuments") {
      return async (query) => {
        let results = [...memoryStore.inquiries];
        if (query) {
          if (query.buyer) {
            results = results.filter((i) => getValId(i.buyer) === getValId(query.buyer));
          }
          if (query.seller) {
            results = results.filter((i) => getValId(i.seller) === getValId(query.seller));
          }
        }
        return results.length;
      };
    }

    if (prop === "updateMany") {
      return async (query, update) => {
        let matchCount = 0;
        memoryStore.inquiries.forEach((inquiry, idx) => {
          let matches = true;
          if (query) {
            if (query.buyer && getValId(inquiry.buyer) !== getValId(query.buyer)) {
              matches = false;
            }
            if (query.seller && getValId(inquiry.seller) !== getValId(query.seller)) {
              matches = false;
            }
          }
          if (matches) {
            matchCount++;
            const updated = { ...inquiry };
            if (update) {
              if (update.$set) {
                for (const key of Object.keys(update.$set)) {
                  updated[key] = update.$set[key];
                }
              }
              for (const key of Object.keys(update)) {
                if (!key.startsWith('$')) {
                  updated[key] = update[key];
                }
              }
            }
            memoryStore.inquiries[idx] = updated;
          }
        });
        return { matchedCount: matchCount, modifiedCount: matchCount };
      };
    }

    if (prop === "deleteMany") {
      return async (query) => {
        if (query) {
          if (query.buyer) {
            memoryStore.inquiries = memoryStore.inquiries.filter(
              (i) => getValId(i.buyer) !== getValId(query.buyer)
            );
          }
          if (query.seller) {
            memoryStore.inquiries = memoryStore.inquiries.filter(
              (i) => getValId(i.seller) !== getValId(query.seller)
            );
          }
          if (query.$or) {
            const idsToDelete = new Set();
            query.$or.forEach(q => {
              if (q.buyer) {
                memoryStore.inquiries.forEach(i => {
                  if (getValId(i.buyer) === getValId(q.buyer)) idsToDelete.add(getValId(i._id));
                });
              }
              if (q.seller) {
                memoryStore.inquiries.forEach(i => {
                  if (getValId(i.seller) === getValId(q.seller)) idsToDelete.add(getValId(i._id));
                });
              }
            });
            memoryStore.inquiries = memoryStore.inquiries.filter(i => !idsToDelete.has(i._id));
          }
        }
        return { deletedCount: 1 };
      };
    }

    return Reflect.get(target, prop, receiver);
  }
});

module.exports = InquiryProxy;
