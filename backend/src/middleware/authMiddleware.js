/* eslint-disable no-undef */
const jwt = require('jsonwebtoken');

// Middleware to verify JWT Token
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization && req.headers.authorization.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      status: 'ERROR',
      message: 'No token provided',
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        status: 'ERROR',
        message: 'Token expired',
      });
    }

    res.status(401).json({
      status: 'ERROR',
      message: 'Invalid token',
    });
  }
};

// Middleware to check user role
const checkRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        status: 'ERROR',
        message: 'User not authenticated',
      });
    }

    const normalizedRole = String(req.user.role || '').trim().toLowerCase();
    const normalizedAllowedRoles = Array.isArray(allowedRoles)
      ? allowedRoles.map((role) => String(role || '').trim().toLowerCase())
      : [];

    if (!normalizedAllowedRoles.includes(normalizedRole)) {
      return res.status(403).json({
        status: 'ERROR',
        message: 'Access denied - insufficient privileges',
      });
    }

    next();
  };
};

module.exports = {
  verifyToken,
  checkRole,
};
