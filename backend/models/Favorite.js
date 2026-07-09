const mongoose = require("mongoose");

const favoriteSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Favorite = mongoose.model(
  "Favorite",
  favoriteSchema
);

const { isDbConnected, memoryStore } = require("../utils/dbResilience");

// Ensure memoryStore has favorites array
if (!memoryStore.favorites) {
  memoryStore.favorites = [];
}

const FavoriteProxy = new Proxy(Favorite, {
  get(target, prop, receiver) {
    if (isDbConnected()) {
      return Reflect.get(target, prop, receiver);
    }

    console.log(`[Offline Resilience] Intercepting Favorite.${String(prop)} call`);

    if (prop === "findOne") {
      return async (query) => {
        const found = memoryStore.favorites.find((f) => {
          const userMatch = String(f.user) === String(query.user);
          const propMatch = String(f.property) === String(query.property);
          return userMatch && propMatch;
        });
        return found ? { ...found } : null;
      };
    }

    if (prop === "create") {
      return async (data) => {
        const newFav = {
          _id: new mongoose.Types.ObjectId().toString(),
          user: String(data.user),
          property: String(data.property),
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        memoryStore.favorites.push(newFav);
        return newFav;
      };
    }

    if (prop === "find") {
      return (query) => {
        let results = memoryStore.favorites.filter(
          (f) => String(f.user) === String(query.user)
        );

        const queryBuilder = {
          populate: (path) => {
            if (path === "property") {
              // Populate the property details from memoryStore.properties
              results = results.map((f) => {
                const propDoc = memoryStore.properties.find(
                  (p) => String(p._id) === String(f.property)
                );
                return {
                  ...f,
                  property: propDoc ? { ...propDoc } : null,
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

    if (prop === "findById") {
      return (id) => {
        const found = memoryStore.favorites.find((f) => String(f._id) === String(id));
        const queryBuilder = {
          then: (resolve) => {
            if (!found) return resolve(null);
            const doc = {
              ...found,
              deleteOne: async function() {
                memoryStore.favorites = memoryStore.favorites.filter(
                  (f) => String(f._id) !== String(this._id)
                );
                return { deletedCount: 1 };
              }
            };
            resolve(doc);
          }
        };
        return queryBuilder;
      };
    }

    if (prop === "deleteMany") {
      return async (query) => {
        if (query && query.user) {
          memoryStore.favorites = memoryStore.favorites.filter(
            (f) => String(f.user) !== String(query.user)
          );
        }
        return { deletedCount: 1 };
      };
    }

    return Reflect.get(target, prop, receiver);
  },
});

module.exports = FavoriteProxy;