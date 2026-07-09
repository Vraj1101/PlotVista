const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    title: {
      type: String,
      required: true,
    },

    message: {
      type: String,
      required: true,
    },

    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Notification = mongoose.model(
  "Notification",
  notificationSchema
);

const { isDbConnected, memoryStore } = require("../utils/dbResilience");

if (!memoryStore.notifications) {
  memoryStore.notifications = [];
}

const NotificationProxy = new Proxy(Notification, {
  get(target, prop, receiver) {
    if (isDbConnected()) {
      return Reflect.get(target, prop, receiver);
    }

    console.log(`[Offline Resilience] Intercepting Notification.${String(prop)} call`);

    if (prop === "create") {
      return async (data) => {
        const newNotif = {
          _id: new mongoose.Types.ObjectId().toString(),
          ...data,
          isRead: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        memoryStore.notifications.push(newNotif);
        return newNotif;
      };
    }

    if (prop === "find") {
      return (query) => {
        let results = [...memoryStore.notifications];
        if (query && query.user) {
          results = results.filter((n) => String(n.user) === String(query.user));
        }
        const queryBuilder = {
          sort: () => queryBuilder,
          then: (resolve) => resolve(results),
        };
        return queryBuilder;
      };
    }

    if (prop === "findById") {
      return (id) => {
        const found = memoryStore.notifications.find((n) => String(n._id) === String(id));
        const queryBuilder = {
          then: (resolve) => {
            const result = found ? { ...found } : null;
            if (result) {
              result.save = async function() {
                const idx = memoryStore.notifications.findIndex((n) => String(n._id) === String(this._id));
                if (idx !== -1) {
                  const toSave = { ...this };
                  delete toSave.save;
                  memoryStore.notifications[idx] = toSave;
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

    return Reflect.get(target, prop, receiver);
  },
});

module.exports = NotificationProxy;