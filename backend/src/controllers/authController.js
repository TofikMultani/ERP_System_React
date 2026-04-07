/* eslint-disable no-undef */
const pool = require('../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const MODULE_KEY_TO_PATH = {
  hr: '/hr',
  sales: '/sales',
  inventory: '/inventory',
  finance: '/finance',
  support: '/support',
  it: '/it',
};

function normalizeAllowedModules(value) {
  const modules = Array.isArray(value) ? value : [];
  return [...new Set(modules.map((moduleKey) => String(moduleKey).toLowerCase()).filter(Boolean))];
}

function buildAllowedPaths(role, allowedModules) {
  if (role !== 'client') {
    return null;
  }

  const modulePaths = allowedModules
    .map((moduleKey) => MODULE_KEY_TO_PATH[moduleKey])
    .filter(Boolean);

  return [...new Set([...modulePaths, '/profile'])];
}

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
    const allowedModules = normalizeAllowedModules(user.allowed_modules);
    const allowedPaths = buildAllowedPaths(user.role, allowedModules);

    if (user.role === 'client' && (!allowedPaths || !allowedPaths.length)) {
      return res.status(401).json({
        status: 'ERROR',
        message: 'Your account is not provisioned with modules yet',
      });
    }

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
        allowedModules,
        allowedPaths,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    await pool.query('UPDATE users SET last_login_at = NOW() WHERE id = $1', [user.id]);

    res.status(200).json({
      status: 'OK',
      message: 'Login successful',
      token,
      redirectTo:
        user.role === 'root-admin'
          ? '/root-admin'
          : user.role === 'client'
            ? allowedPaths[0]
            : `/${user.role}`,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
        allowedModules,
        allowedPaths,
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

    const result = await pool.query('SELECT id, email, first_name, last_name, role, is_active, allowed_modules FROM users WHERE id = $1', [userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        status: 'ERROR',
        message: 'User not found',
      });
    }

    const user = result.rows[0];
    const allowedModules = normalizeAllowedModules(user.allowed_modules);
    const allowedPaths = buildAllowedPaths(user.role, allowedModules);

    res.status(200).json({
      status: 'OK',
      data: {
        ...user,
        allowedModules,
        allowedPaths,
      },
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
