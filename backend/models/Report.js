const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema(
  {
    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
      required: true,
    },

    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    reason: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      default: "",
    },

    status: {
      type: String,
      enum: ["pending", "resolved"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

const Report = mongoose.model(
  "Report",
  reportSchema
);

const { isDbConnected, memoryStore } = require("../utils/dbResilience");

if (!memoryStore.reports) {
  memoryStore.reports = [];
}

const ReportProxy = new Proxy(Report, {
  get(target, prop, receiver) {
    if (isDbConnected()) {
      return Reflect.get(target, prop, receiver);
    }

    console.log(`[Offline Resilience] Intercepting Report.${String(prop)} call`);

    if (prop === "create") {
      return async (data) => {
        const newReport = {
          _id: new mongoose.Types.ObjectId().toString(),
          ...data,
          status: "pending",
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        memoryStore.reports.push(newReport);
        return newReport;
      };
    }

    if (prop === "find") {
      return (query) => {
        let results = [...memoryStore.reports];
        const queryBuilder = {
          populate: (path) => {
            results = results.map((r) => {
              const updated = { ...r };
              if (path === "property") {
                const pDoc = memoryStore.properties.find((p) => String(p._id) === String(r.property));
                updated.property = pDoc ? { ...pDoc } : null;
              }
              if (path === "reportedBy") {
                const uDoc = memoryStore.users.find((u) => String(u._id) === String(r.reportedBy));
                updated.reportedBy = uDoc ? { ...uDoc } : null;
              }
              return updated;
            });
            return queryBuilder;
          },
          then: (resolve) => resolve(results),
        };
        return queryBuilder;
      };
    }

    if (prop === "findById") {
      return (id) => {
        const found = memoryStore.reports.find((r) => String(r._id) === String(id));
        const queryBuilder = {
          then: (resolve) => {
            const result = found ? { ...found } : null;
            if (result) {
              result.save = async function() {
                const idx = memoryStore.reports.findIndex((r) => String(r._id) === String(this._id));
                if (idx !== -1) {
                  const toSave = { ...this };
                  delete toSave.save;
                  memoryStore.reports[idx] = toSave;
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

module.exports = ReportProxy;