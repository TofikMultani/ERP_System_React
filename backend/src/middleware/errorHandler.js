/* eslint-disable no-undef */
// Custom Error Handler Middleware

class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

// Global Error Handler
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.message = err.message || 'Internal Server Error';

  // Wrong MongoDB ID error
  if (err.name === 'CastError') {
    const message = `Resource not found. Invalid: ${err.path}`;
    err = new AppError(message, 400);
  }

  // Duplicate Key Error
  if (err.code === 11000) {
    const message = `Duplicate field value entered`;
    err = new AppError(message, 400);
  }

  // Wrong JWT error
  if (err.name === 'JsonWebTokenError') {
    const message = `Invalid token, please try again`;
    err = new AppError(message, 400);
  }

  // JWT Expired
  if (err.name === 'TokenExpiredError') {
    const message = `Token has expired, please login again`;
    err = new AppError(message, 400);
  }

  res.status(err.statusCode).json({
    status: 'ERROR',
    message: err.message,
    statusCode: err.statusCode,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = { AppError, errorHandler };
