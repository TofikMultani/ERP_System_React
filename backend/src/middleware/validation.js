/* eslint-disable no-undef */
const validator = require('validator');

// Email validation middleware
const validateEmail = (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      status: 'ERROR',
      message: 'Email is required',
    });
  }

  if (!validator.isEmail(email)) {
    return res.status(400).json({
      status: 'ERROR',
      message: 'Invalid email format',
    });
  }

  next();
};

// Password validation middleware
const validatePassword = (req, res, next) => {
  const { password } = req.body;

  if (!password) {
    return res.status(400).json({
      status: 'ERROR',
      message: 'Password is required',
    });
  }

  if (password.length < 6) {
    return res.status(400).json({
      status: 'ERROR',
      message: 'Password must be at least 6 characters long',
    });
  }

  next();
};

// Request body validation
const validateRequired = (fields) => {
  return (req, res, next) => {
    const missing = [];

    fields.forEach((field) => {
      if (!req.body[field] || (typeof req.body[field] === 'string' && req.body[field].trim() === '')) {
        missing.push(field);
      }
    });

    if (missing.length > 0) {
      return res.status(400).json({
        status: 'ERROR',
        message: `Missing required fields: ${missing.join(', ')}`,
      });
    }

    next();
  };
};

// Sanitize input
const sanitizeInput = (req, res, next) => {
  const sanitize = (value) => {
    if (typeof value === 'string') {
      return validator.trim(value);
    }
    return value;
  };

  req.body = Object.keys(req.body).reduce((acc, key) => {
    acc[key] = sanitize(req.body[key]);
    return acc;
  }, {});

  next();
};

module.exports = {
  validateEmail,
  validatePassword,
  validateRequired,
  sanitizeInput,
};
