/* eslint-disable no-undef */
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Test database connection
const pool = require('./config/database');
const { initializeDatabase } = require('./config/databaseSetup');

// Health Check Route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  });
});

// Test Database Connection Route
app.get('/api/db-test', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.status(200).json({
      status: 'OK',
      message: 'Database connection successful',
      timestamp: result.rows[0].now,
    });
  } catch (error) {
    console.error('Database connection error:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Database connection failed',
      error: error.message,
    });
  }
});

// Routes
const authRoutes = require('./routes/authRoutes');
const moduleRoutes = require('./routes/moduleRoutes');
const accessRequestRoutes = require('./routes/accessRequestRoutes');
const adminRoutes = require('./routes/adminRoutes');
const userRoutes = require('./routes/userRoutes');
app.use('/api/auth', authRoutes);
app.use('/api/modules', moduleRoutes);
app.use('/api/access-requests', accessRequestRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/users', userRoutes);

// Module Routes (to be implemented)
// app.use('/api/users', require('./routes/userRoutes'));
// app.use('/api/employees', require('./routes/employeeRoutes'));
// app.use('/api/products', require('./routes/productRoutes'));
// app.use('/api/sales', require('./routes/salesRoutes'));
// app.use('/api/inventory', require('./routes/inventoryRoutes'));
// app.use('/api/invoices', require('./routes/invoiceRoutes'));
// app.use('/api/tickets', require('./routes/ticketRoutes'));

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    status: 'ERROR',
    message: 'Route not found',
    path: req.path,
  });
});

// Error Handler
const { errorHandler } = require('./middleware/errorHandler');
app.use(errorHandler);

// Start Server
const startServer = async () => {
  await initializeDatabase();

  app.listen(PORT, () => {
    console.log(`\n🚀 ERP System Backend Server running on http://localhost:${PORT}`);
    console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🗄️  Database: ${process.env.DB_NAME || 'erp_system'}`);
    console.log(`\nTest endpoints:`);
    console.log(`  - Health Check: http://localhost:${PORT}/api/health`);
    console.log(`  - DB Test: http://localhost:${PORT}/api/db-test`);
    console.log(`  - Auth Login: http://localhost:${PORT}/api/auth/login`);
  });
};

startServer().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});

module.exports = app;
