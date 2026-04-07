/* eslint-disable no-undef */
const pool = require('../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Register User
const registerUser = async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    // Check if user already exists
    const userExists = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

    if (userExists.rows.length > 0) {
      return res.status(400).json({
        status: 'ERROR',
        message: 'User with this email already exists',
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new user
    const result = await pool.query(
      'INSERT INTO users (email, password_hash, first_name, last_name, role) VALUES ($1, $2, $3, $4, $5) RETURNING id, email, first_name, last_name, role',
      [email, hashedPassword, firstName, lastName, 'user']
    );

    res.status(201).json({
      status: 'OK',
      message: 'User registered successfully',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Error registering user',
      error: error.message,
    });
  }
};

// Login User
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

    if (result.rows.length === 0) {
      return res.status(401).json({
        status: 'ERROR',
        message: 'Invalid email or password',
      });
    }

    const user = result.rows[0];

    // Compare passwords
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({
        status: 'ERROR',
        message: 'Invalid email or password',
      });
    }

    // Check if user is active
    if (!user.is_active) {
      return res.status(401).json({
        status: 'ERROR',
        message: 'User account is inactive',
      });
    }

    // Generate JWT Token
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    await pool.query('UPDATE users SET last_login_at = NOW() WHERE id = $1', [user.id]);

    res.status(200).json({
      status: 'OK',
      message: 'Login successful',
      token,
      redirectTo: user.role === 'root-admin' ? '/root-admin' : `/${user.role}`,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Error logging in',
      error: error.message,
    });
  }
};

// Get Current User
const getCurrentUser = async (req, res) => {
  try {
    const userId = req.user.id; // From JWT middleware

    const result = await pool.query('SELECT id, email, first_name, last_name, role, is_active FROM users WHERE id = $1', [userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        status: 'ERROR',
        message: 'User not found',
      });
    }

    res.status(200).json({
      status: 'OK',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Error fetching user',
      error: error.message,
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getCurrentUser,
};
