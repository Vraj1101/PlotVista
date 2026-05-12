const express = require('express');
const router = express.Router();
// We import our logic from the controller file
const { registerUser, loginUser } = require('../controllers/authController');

// When a user sends a POST request to /api/auth/register, it runs the registerUser function
router.post('/register', registerUser);

// When a user sends a POST request to /api/auth/login, it runs the loginUser function
router.post('/login', loginUser);

module.exports = router;
