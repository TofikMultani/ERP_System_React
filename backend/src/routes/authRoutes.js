const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyToken } = require('../middleware/authMiddleware');
const { validateEmail, validatePassword, sanitizeInput } = require('../middleware/validation');

// Public Routes
router.post(
  '/register',
  sanitizeInput,
  validateEmail,
  validatePassword,
  authController.registerUser
);

router.post(
  '/login',
  sanitizeInput,
  validateEmail,
  authController.loginUser
);

router.post(
  '/forgot-password',
  sanitizeInput,
  validateEmail,
  authController.forgotPassword,
);

router.get('/reset-password/validate', authController.validateResetToken);

router.post(
  '/reset-password',
  sanitizeInput,
  authController.resetPassword,
);

// Protected Routes
router.get('/me', verifyToken, authController.getCurrentUser);

module.exports = router;
