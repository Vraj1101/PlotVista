const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

// Load environment variables from .env file
dotenv.config();

const app = express();

// Middleware
// cors() allows our React frontend to communicate with this backend without security blocks
app.use(cors());
// express.json() allows us to read JSON data from requests (like login info)
app.use(express.json());

// Basic Route for testing
app.get('/', (req, res) => {
  res.send('PlotVista API is running...');
});

// Import and use our new Auth Routes
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

// Import and use our new Property Routes
const propertyRoutes = require('./routes/propertyRoutes');
app.use('/api/properties', propertyRoutes);

// Import and use our new Upload Routes (Replaces Firebase)
const uploadRoutes = require('./routes/uploadRoutes');
app.use('/api/upload', uploadRoutes);

// Make the "uploads" folder public so the frontend can display the images
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, '/uploads')));

// Database connection function
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected successfully! Host: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    // We don't exit the process right now so the server doesn't crash if the password is wrong
    // process.exit(1); 
  }
};

connectDB();

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
