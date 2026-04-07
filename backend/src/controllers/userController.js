/* eslint-disable no-undef */
/* eslint-env node */
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const pool = require('../config/database');

const MODULE_LABELS = {
  hr: 'HR',
  sales: 'Sales',
  inventory: 'Inventory',
  finance: 'Finance',
  support: 'Customer Support',
  it: 'IT',
};

const MAX_USERS_PER_MODULE = 2;

function normalizeModuleKey(value) {
  return String(value || '').trim().toLowerCase();
}

function mapUserRow(row) {
  return {
    id: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    fullName: `${row.first_name || ''} ${row.last_name || ''}`.trim(),
    email: row.email,
    role: row.role,
    assignedModule: row.assigned_module || '',
    assignedModuleLabel: MODULE_LABELS[row.assigned_module] || row.assigned_module || '',
    visiblePassword: row.visible_password || '',
    parentUserId: row.parent_user_id || null,
    isActive: row.is_active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function generatePassword() {
  return crypto.randomBytes(6).toString('base64url');
}

async function getCurrentOwner(req) {
  const result = await pool.query(
    'SELECT id, role, allowed_modules FROM users WHERE id = $1',
    [req.user.id],
  );

  if (!result.rows.length) {
    return null;
  }

  return result.rows[0];
}

function getAllowedModules(ownerRow) {
  const modules = Array.isArray(ownerRow?.allowed_modules) ? ownerRow.allowed_modules : [];
  return [...new Set(modules.map((moduleKey) => normalizeModuleKey(moduleKey)).filter(Boolean))];
}

async function countUsersForModule(parentUserId, assignedModule, excludeUserId = null) {
  const params = [parentUserId, assignedModule];
  let query = `
    SELECT COUNT(*)::int AS total
    FROM users
    WHERE parent_user_id = $1
      AND assigned_module = $2
      AND role = 'sub-user'
  `;

  if (excludeUserId) {
    params.push(excludeUserId);
    query += ' AND id <> $3';
  }

  const result = await pool.query(query, params);
  return Number(result.rows[0]?.total || 0);
}

async function getMyUsers(req, res) {
  try {
    const owner = await getCurrentOwner(req);

    if (!owner || owner.role !== 'client') {
      return res.status(403).json({
        status: 'ERROR',
        message: 'Only provisioned client accounts can manage sub-users',
      });
    }

    const result = await pool.query(
      `
        SELECT *
        FROM users
        WHERE parent_user_id = $1
          AND role = 'sub-user'
        ORDER BY created_at DESC
      `,
      [req.user.id],
    );

    res.status(200).json({
      status: 'OK',
      data: result.rows.map(mapUserRow),
    });
  } catch (error) {
    console.error('Get sub-users error:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Error fetching sub-users',
      error: error.message,
    });
  }
}

async function createMyUser(req, res) {
  try {
    const owner = await getCurrentOwner(req);

    if (!owner || owner.role !== 'client') {
      return res.status(403).json({
        status: 'ERROR',
        message: 'Only provisioned client accounts can create sub-users',
      });
    }

    const allowedModules = getAllowedModules(owner);
    const { firstName, lastName, email, password, assignedModule } = req.body;
    const normalizedAssignedModule = normalizeModuleKey(assignedModule);
    const safePassword = String(password || '').trim() || generatePassword();

    if (!firstName || !lastName || !email || !normalizedAssignedModule) {
      return res.status(400).json({
        status: 'ERROR',
        message: 'firstName, lastName, email and assignedModule are required',
      });
    }

    if (!allowedModules.includes(normalizedAssignedModule)) {
      return res.status(400).json({
        status: 'ERROR',
        message: 'Assigned module must be one of the requested modules',
      });
    }

    const existingCount = await countUsersForModule(req.user.id, normalizedAssignedModule);
    if (existingCount >= MAX_USERS_PER_MODULE) {
      return res.status(400).json({
        status: 'ERROR',
        message: `Maximum ${MAX_USERS_PER_MODULE} users already assigned to ${MODULE_LABELS[normalizedAssignedModule] || normalizedAssignedModule}`,
      });
    }

    const existingUser = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({
        status: 'ERROR',
        message: 'User with this email already exists',
      });
    }

    const passwordHash = await bcrypt.hash(safePassword, 10);

    const result = await pool.query(
      `
        INSERT INTO users (
          email,
          password_hash,
          visible_password,
          first_name,
          last_name,
          role,
          allowed_modules,
          parent_user_id,
          assigned_module,
          is_active,
          updated_at
        )
        VALUES ($1, $2, $3, $4, $5, 'sub-user', $6::jsonb, $7, $8, true, CURRENT_TIMESTAMP)
        RETURNING *
      `,
      [
        email,
        passwordHash,
        safePassword,
        firstName,
        lastName,
        JSON.stringify([normalizedAssignedModule]),
        req.user.id,
        normalizedAssignedModule,
      ],
    );

    return res.status(201).json({
      status: 'OK',
      message: 'Sub-user created successfully',
      data: mapUserRow(result.rows[0]),
    });
  } catch (error) {
    console.error('Create sub-user error:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Error creating sub-user',
      error: error.message,
    });
  }
}

async function updateMyUser(req, res) {
  try {
    const owner = await getCurrentOwner(req);

    if (!owner || owner.role !== 'client') {
      return res.status(403).json({
        status: 'ERROR',
        message: 'Only provisioned client accounts can update sub-users',
      });
    }

    const { userId } = req.params;
    const { firstName, lastName, email, password, assignedModule, isActive } = req.body;

    const existingResult = await pool.query(
      `
        SELECT *
        FROM users
        WHERE id = $1
          AND parent_user_id = $2
          AND role = 'sub-user'
      `,
      [userId, req.user.id],
    );

    if (!existingResult.rows.length) {
      return res.status(404).json({
        status: 'ERROR',
        message: 'Sub-user not found',
      });
    }

    const existingUser = existingResult.rows[0];
    const allowedModules = getAllowedModules(owner);
    const nextModule = normalizeModuleKey(assignedModule || existingUser.assigned_module);

    if (!allowedModules.includes(nextModule)) {
      return res.status(400).json({
        status: 'ERROR',
        message: 'Assigned module must be one of the requested modules',
      });
    }

    const moduleCount = await countUsersForModule(req.user.id, nextModule, userId);
    if (moduleCount >= MAX_USERS_PER_MODULE) {
      return res.status(400).json({
        status: 'ERROR',
        message: `Maximum ${MAX_USERS_PER_MODULE} users already assigned to ${MODULE_LABELS[nextModule] || nextModule}`,
      });
    }

    if (email && email !== existingUser.email) {
      const emailExists = await pool.query('SELECT id FROM users WHERE email = $1 AND id <> $2', [email, userId]);
      if (emailExists.rows.length > 0) {
        return res.status(400).json({
          status: 'ERROR',
          message: 'User with this email already exists',
        });
      }
    }

    const nextPassword = String(password || '').trim();
    const nextPasswordHash = nextPassword ? await bcrypt.hash(nextPassword, 10) : existingUser.password_hash;
    const nextVisiblePassword = nextPassword || existingUser.visible_password;

    const result = await pool.query(
      `
        UPDATE users
        SET
          first_name = COALESCE($2, first_name),
          last_name = COALESCE($3, last_name),
          email = COALESCE($4, email),
          password_hash = $5,
          visible_password = $6,
          allowed_modules = $7::jsonb,
          assigned_module = $8,
          is_active = COALESCE($9, is_active),
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
          AND parent_user_id = $10
          AND role = 'sub-user'
        RETURNING *
      `,
      [
        userId,
        firstName || null,
        lastName || null,
        email || null,
        nextPasswordHash,
        nextVisiblePassword,
        JSON.stringify([nextModule]),
        nextModule,
        typeof isActive === 'boolean' ? isActive : null,
        req.user.id,
      ],
    );

    return res.status(200).json({
      status: 'OK',
      message: 'Sub-user updated successfully',
      data: mapUserRow(result.rows[0]),
    });
  } catch (error) {
    console.error('Update sub-user error:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Error updating sub-user',
      error: error.message,
    });
  }
}

async function deleteMyUser(req, res) {
  try {
    const owner = await getCurrentOwner(req);

    if (!owner || owner.role !== 'client') {
      return res.status(403).json({
        status: 'ERROR',
        message: 'Only provisioned client accounts can delete sub-users',
      });
    }

    const { userId } = req.params;

    const result = await pool.query(
      `
        DELETE FROM users
        WHERE id = $1
          AND parent_user_id = $2
          AND role = 'sub-user'
        RETURNING *
      `,
      [userId, req.user.id],
    );

    if (!result.rows.length) {
      return res.status(404).json({
        status: 'ERROR',
        message: 'Sub-user not found',
      });
    }

    return res.status(200).json({
      status: 'OK',
      message: 'Sub-user deleted successfully',
    });
  } catch (error) {
    console.error('Delete sub-user error:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Error deleting sub-user',
      error: error.message,
    });
  }
}

module.exports = {
  getMyUsers,
  createMyUser,
  updateMyUser,
  deleteMyUser,
};