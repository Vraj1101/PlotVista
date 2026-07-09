const express = require('express');

const router = express.Router();

// IMPORT CONTROLLERS

const {
  registerUser,
  loginUser,
  forgotPassword,
  resetPassword,
  verifyEmail,
  verifyPhone,
  checkVerificationStatus
} = require('../controllers/authController');

// ==============================
// REGISTER ROUTE
// ==============================

router.post(
  '/register',
  registerUser
);

// ==============================
// VERIFY EMAIL ROUTE
// ==============================

router.get(
  '/verify-email/:token',
  verifyEmail
);

// ==============================
// VERIFY PHONE ROUTE
// ==============================

router.post(
  '/verify-phone',
  verifyPhone
);

// ==============================
// CHECK STATUS ROUTE
// ==============================

router.get(
  '/check-status',
  checkVerificationStatus
);


// ==============================
// LOGIN ROUTE
// ==============================

router.post(
  '/login',
  loginUser
);

// ==============================
// FORGOT PASSWORD ROUTE
// ==============================

router.post(
  '/forgot-password',
  forgotPassword
);

// ==============================
// RESET PASSWORD ROUTE
// ==============================

router.post(
  '/reset-password/:token',
  resetPassword
);

router.put(
  '/reset-password/:token',
  resetPassword
);

module.exports = router;