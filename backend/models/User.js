const mongoose = require('mongoose');

// A Schema is like a blueprint. It tells MongoDB exactly what data a "User" should have.
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true, // No two users can have the same email
  },
  password: {
    type: String,
    required: true,
  },
  // In PlotVista, we need to know if the person is a Buyer or a Seller
  role: {
    type: String,
    enum: ['buyer', 'seller'], // The role MUST be one of these two words
    default: 'buyer',
  },
}, {
  // This automatically adds "createdAt" and "updatedAt" timestamps to every user
  timestamps: true,
});

// We turn the blueprint into an actual Model and export it so other files can use it
const User = mongoose.model('User', userSchema);

module.exports = User;
