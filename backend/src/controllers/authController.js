/* eslint-disable no-undef */
const pool = require('../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { sendPasswordResetMail } = require('../services/emailService');

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
  if (role !== 'client' && role !== 'sub-user') {
    return null;
  }

  const modulePaths = allowedModules
    .map((moduleKey) => MODULE_KEY_TO_PATH[moduleKey])
    .filter(Boolean);

  if (role === 'client') {
    return [...new Set([...modulePaths, '/my-users', '/profile'])];
  }

  return [...new Set([...modulePaths, '/profile'])];
}

function getPrimaryRoute(role, allowedPaths) {
  if (!Array.isArray(allowedPaths) || !allowedPaths.length) {
    return '/';
  }

  if (role === 'client' || role === 'sub-user') {
    return allowedPaths.find((path) => path !== '/profile' && path !== '/my-users') || '/profile';
  }

  return allowedPaths[0];
}

function getFrontendBaseUrl() {
  return process.env.FRONTEND_APP_URL || process.env.CORS_ORIGIN || 'http://localhost:5173';
}

function hashResetToken(rawToken) {
  return crypto.createHash('sha256').update(String(rawToken || '')).digest('hex');
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
    const normalizedRole = String(user.role || '').trim().toLowerCase();
    const allowedModules = normalizeAllowedModules(user.allowed_modules);
    const allowedPaths = buildAllowedPaths(normalizedRole, allowedModules);

    if ((normalizedRole === 'client' || normalizedRole === 'sub-user') && (!allowedPaths || !allowedPaths.length)) {
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
        role: normalizedRole,
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
        normalizedRole === 'root-admin'
          ? '/root-admin'
          : getPrimaryRoute(normalizedRole, allowedPaths) || `/${normalizedRole}`,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: normalizedRole,
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
    const normalizedRole = String(user.role || '').trim().toLowerCase();
    const allowedModules = normalizeAllowedModules(user.allowed_modules);
    const allowedPaths = buildAllowedPaths(normalizedRole, allowedModules);

    res.status(200).json({
      status: 'OK',
      data: {
        ...user,
        role: normalizedRole,
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

const forgotPassword = async (req, res) => {
  try {
    const email = String(req.body?.email || '').trim().toLowerCase();

    if (!email) {
      return res.status(400).json({
        status: 'ERROR',
        message: 'Email is required',
      });
    }

    const result = await pool.query(
      `SELECT id, email, first_name, last_name, is_active FROM users WHERE LOWER(email) = $1 LIMIT 1`,
      [email],
    );

    const user = result.rows[0];

    if (!user || !user.is_active) {
      return res.status(200).json({
        status: 'OK',
        message: 'If the email exists, a reset link has been sent.',
      });
    }

    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = hashResetToken(rawToken);
    const expiresAtMinutes = Number(process.env.PASSWORD_RESET_TOKEN_EXPIRE_MINUTES || 30);

    await pool.query(
      `DELETE FROM password_reset_tokens WHERE user_id = $1 OR expires_at < NOW()`,
      [user.id],
    );

    await pool.query(
      `INSERT INTO password_reset_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, NOW() + ($3 * INTERVAL '1 minute'))`,
      [user.id, tokenHash, expiresAtMinutes],
    );

    const resetUrl = `${getFrontendBaseUrl()}/reset-password?token=${encodeURIComponent(rawToken)}`;
    const mailResult = await sendPasswordResetMail({
      toEmail: user.email,
      requesterName: `${user.first_name || ''} ${user.last_name || ''}`.trim(),
      resetUrl,
    });

    if (!mailResult.sent) {
      return res.status(500).json({
        status: 'ERROR',
        message: 'Unable to send reset email',
        error: mailResult.reason || 'Mail transport error',
      });
    }

    return res.status(200).json({
      status: 'OK',
      message: 'If the email exists, a reset link has been sent.',
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return res.status(500).json({
      status: 'ERROR',
      message: 'Error processing forgot password request',
      error: error.message,
    });
  }
};

const validateResetToken = async (req, res) => {
  try {
    const rawToken = String(req.query?.token || '').trim();

    if (!rawToken) {
      return res.status(400).json({
        status: 'ERROR',
        message: 'Invalid reset token',
      });
    }

    const tokenHash = hashResetToken(rawToken);
    const result = await pool.query(
      `
        SELECT prt.id, prt.user_id, u.email
        FROM password_reset_tokens prt
        JOIN users u ON u.id = prt.user_id
        WHERE prt.token_hash = $1
          AND prt.used_at IS NULL
          AND prt.expires_at > NOW()
          AND u.is_active = true
        LIMIT 1
      `,
      [tokenHash],
    );

    if (!result.rows[0]) {
      return res.status(400).json({
        status: 'ERROR',
        message: 'Reset link is invalid or expired',
      });
    }

    return res.status(200).json({
      status: 'OK',
      message: 'Reset token is valid',
    });
  } catch (error) {
    console.error('Validate reset token error:', error);
    return res.status(500).json({
      status: 'ERROR',
      message: 'Error validating reset token',
      error: error.message,
    });
  }
};

const resetPassword = async (req, res) => {
  const client = await pool.connect();

  try {
    const rawToken = String(req.body?.token || '').trim();
    const password = String(req.body?.password || '');

    if (!rawToken) {
      return res.status(400).json({
        status: 'ERROR',
        message: 'Invalid reset token',
      });
    }

    if (!password || password.length < 6) {
      return res.status(400).json({
        status: 'ERROR',
        message: 'Password must be at least 6 characters long',
      });
    }

    const tokenHash = hashResetToken(rawToken);

    await client.query('BEGIN');

    const tokenResult = await client.query(
      `
        SELECT prt.id, prt.user_id
        FROM password_reset_tokens prt
        JOIN users u ON u.id = prt.user_id
        WHERE prt.token_hash = $1
          AND prt.used_at IS NULL
          AND prt.expires_at > NOW()
          AND u.is_active = true
        LIMIT 1
        FOR UPDATE
      `,
      [tokenHash],
    );

    if (!tokenResult.rows[0]) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        status: 'ERROR',
        message: 'Reset link is invalid or expired',
      });
    }

    const tokenRow = tokenResult.rows[0];
    const hashedPassword = await bcrypt.hash(password, 10);

    await client.query(
      `UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2`,
      [hashedPassword, tokenRow.user_id],
    );

    await client.query(
      `UPDATE password_reset_tokens SET used_at = NOW() WHERE id = $1`,
      [tokenRow.id],
    );

    await client.query(
      `DELETE FROM password_reset_tokens WHERE user_id = $1 AND id <> $2`,
      [tokenRow.user_id, tokenRow.id],
    );

    await client.query('COMMIT');

    return res.status(200).json({
      status: 'OK',
      message: 'Password reset successful',
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Reset password error:', error);
    return res.status(500).json({
      status: 'ERROR',
      message: 'Error resetting password',
      error: error.message,
    });
  } finally {
    client.release();
  }
};

module.exports = {
  registerUser,
  loginUser,
  getCurrentUser,
  forgotPassword,
  validateResetToken,
  resetPassword,
};
