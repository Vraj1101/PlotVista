const { applyDnsOverride } = require("./utils/dnsOverride");
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");

// Load environment variables from .env file
dotenv.config();

const app = express();

// Middleware
// cors() allows our React frontend to communicate with this backend without security blocks
app.use(cors());
// express.json() allows us to read JSON data from requests (like login info)
app.use(express.json());

// Basic Route for testing
app.get("/", (req, res) => {
  res.send("PlotVista API is running...");
});

// Import and use our new Auth Routes
const authRoutes = require("./routes/authRoutes");
app.use("/api/auth", authRoutes);

// Import and use our new Property Routes
const propertyRoutes = require("./routes/propertyRoutes");
app.use("/api/properties", propertyRoutes);

// Import and use our new Upload Routes (Replaces Firebase)
const uploadRoutes = require("./routes/uploadRoutes");
app.use("/api/upload", uploadRoutes);

// Make the "uploads" folder public so the frontend can display the images
const path = require("path");
app.use("/uploads", express.static(path.join(__dirname, "/uploads")));

// Database connection function
const connectDB = async () => {
  try {
    // Disable command buffering globally so queries fail instantly when disconnected
    // instead of hanging the server/requests for 10 seconds.
    mongoose.set("bufferCommands", false);

    // Attempt 1: Connect using default system DNS
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(
      `MongoDB Connected successfully! Host: ${conn.connection.host}`,
    );
  } catch (error) {
    const isDnsError =
      error.message &&
      (error.message.includes("ENOTFOUND") ||
        error.message.includes("EREFUSED") ||
        error.message.includes("ESERVFAIL") ||
        error.message.includes("EAI_AGAIN") ||
        error.message.includes("querySrv"));

    if (isDnsError) {
      console.log(
        "[DNS Check] Initial MongoDB connection failed with DNS error. Applying Google/Cloudflare public DNS override...",
      );
      const overridden = applyDnsOverride();
      if (overridden) {
        try {
          // Attempt 2: Connect using overridden public DNS
          const conn = await mongoose.connect(process.env.MONGO_URI);
          console.log(
            `MongoDB Connected successfully (via Public DNS)! Host: ${conn.connection.host}`,
          );
          return;
        } catch (retryError) {
          console.error(
            `MongoDB Connection Retry Error: ${retryError.message}`,
          );
        }
      }
    } else {
      console.error(`MongoDB Connection Error: ${error.message}`);
    }

    console.log(
      `\x1b[33m%s\x1b[0m`,
      `[Offline Resilience] MongoDB is offline or unreachable. PlotVista is running in Resilient Offline Mode (using high-fidelity in-memory seed datastore).`,
    );
  }
};

connectDB();

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

const inquiryRoutes = require("./routes/inquiryRoutes");

app.use("/api/inquiries", inquiryRoutes);
const dashboardRoutes = require("./routes/dashboardRoutes");

app.use("/api/dashboard", dashboardRoutes);
const favoriteRoutes = require("./routes/favoriteRoutes");

app.use("/api/favorites", favoriteRoutes);

const userRoutes = require("./routes/userRoutes");
app.use("/api/users", userRoutes);
const adminRoutes = require("./routes/adminRoutes");

app.use("/api/admin", adminRoutes);

const notificationRoutes = require("./routes/notificationRoutes");
app.use("/api/notifications", notificationRoutes);

const reportRoutes = require("./routes/reportRoutes");
app.use("/api/reports", reportRoutes);

const reviewRoutes = require("./routes/reviewRoutes");
app.use("/api/reviews", reviewRoutes);