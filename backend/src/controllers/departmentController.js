/* eslint-disable no-undef */
/* eslint-env node */
const pool = require('../config/database');

const REQUIRED_FIELDS = ['name', 'head', 'status'];

function normalizeText(value) {
  return String(value || '').trim();
}

function normalizeNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function normalizeBudget(value) {
  const text = normalizeText(value);
  if (!text) {
    return null;
  }

  const parsed = Number(text);
  return Number.isFinite(parsed) ? parsed : null;
}

function mapDepartmentRow(row) {
  return {
    id: row.id,
    code: row.department_code,
    name: row.name,
    head: row.head_name,
    headEmail: row.head_email || '',
    headPhone: row.head_phone || '',
    employees: Number(row.employee_count || 0),
    budget: row.annual_budget === null ? '' : String(row.annual_budget),
    location: row.location || '',
    description: row.description || '',
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function normalizeDepartmentPayload(payload) {
  return {
    code: normalizeText(payload.code),
    name: normalizeText(payload.name),
    head: normalizeText(payload.head),
    headEmail: normalizeText(payload.headEmail).toLowerCase(),
    headPhone: normalizeText(payload.headPhone),
    employees: Math.max(0, Math.trunc(normalizeNumber(payload.employees, 0))),
    budget: normalizeBudget(payload.budget),
    location: normalizeText(payload.location),
    description: normalizeText(payload.description),
    status: normalizeText(payload.status) || 'Active',
  };
}

function hasRequiredFields(department) {
  return REQUIRED_FIELDS.every((fieldName) => normalizeText(department[fieldName]));
}

function parseDepartmentCodeNumber(code) {
  const match = String(code || '').trim().toUpperCase().match(/(\d+)$/);
  return match ? Number(match[1]) : 0;
}

function formatDepartmentCode(numberValue) {
  return `DPT-${String(numberValue).padStart(4, '0')}`;
}

async function getLatestDepartmentCode(client = pool, { forUpdate = false } = {}) {
  const result = await client.query(
    `
      SELECT department_code
      FROM departments
      ORDER BY id DESC
      LIMIT 1
      ${forUpdate ? 'FOR UPDATE' : ''}
    `,
  );

  return result.rows[0]?.department_code || '';
}

async function getNextDepartmentCode(client = pool, options = {}) {
  const latestCode = await getLatestDepartmentCode(client, options);
  const numberPart = parseDepartmentCodeNumber(latestCode);
  return formatDepartmentCode(numberPart + 1);
}

async function fetchDepartments(req, res) {
  try {
    const result = await pool.query(
      `
        SELECT *
        FROM departments
        ORDER BY id DESC
      `,
    );

    return res.status(200).json({
      status: 'OK',
      data: result.rows.map(mapDepartmentRow),
    });
  } catch (error) {
    console.error('Fetch departments error:', error);
    return res.status(500).json({
      status: 'ERROR',
      message: 'Error fetching departments',
      error: error.message,
    });
  }
}

async function fetchNextDepartmentCode(req, res) {
  try {
    const code = await getNextDepartmentCode();

    return res.status(200).json({
      status: 'OK',
      data: { code },
    });
  } catch (error) {
    console.error('Fetch next department code error:', error);
    return res.status(500).json({
      status: 'ERROR',
      message: 'Error fetching next department code',
      error: error.message,
    });
  }
}

async function createDepartment(req, res) {
  const client = await pool.connect();

  try {
    const payload = normalizeDepartmentPayload(req.body || {});
    if (!hasRequiredFields(payload)) {
      return res.status(400).json({
        status: 'ERROR',
        message: 'Missing required department fields',
      });
    }

    await client.query('BEGIN');

    payload.code = await getNextDepartmentCode(client, { forUpdate: true });

    const result = await client.query(
      `
        INSERT INTO departments (
          department_code,
          name,
          head_name,
          head_email,
          head_phone,
          employee_count,
          annual_budget,
          location,
          description,
          status,
          created_by,
          updated_by,
          updated_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $11, CURRENT_TIMESTAMP)
        RETURNING *
      `,
      [
        payload.code,
        payload.name,
        payload.head,
        payload.headEmail || null,
        payload.headPhone || null,
        payload.employees,
        payload.budget,
        payload.location || null,
        payload.description || null,
        payload.status,
        req.user?.id || null,
      ],
    );

    await client.query('COMMIT');

    return res.status(201).json({
      status: 'OK',
      message: 'Department created successfully',
      data: mapDepartmentRow(result.rows[0]),
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Create department error:', error);
    return res.status(500).json({
      status: 'ERROR',
      message: 'Error creating department',
      error: error.message,
    });
  } finally {
    client.release();
  }
}

async function updateDepartment(req, res) {
  try {
    const { departmentCode } = req.params;
    const payload = normalizeDepartmentPayload(req.body || {});

    if (!hasRequiredFields(payload)) {
      return res.status(400).json({
        status: 'ERROR',
        message: 'Missing required department fields',
      });
    }

    const result = await pool.query(
      `
        UPDATE departments
        SET
          name = $2,
          head_name = $3,
          head_email = $4,
          head_phone = $5,
          employee_count = $6,
          annual_budget = $7,
          location = $8,
          description = $9,
          status = $10,
          updated_by = $11,
          updated_at = CURRENT_TIMESTAMP
        WHERE department_code = $1
        RETURNING *
      `,
      [
        departmentCode,
        payload.name,
        payload.head,
        payload.headEmail || null,
        payload.headPhone || null,
        payload.employees,
        payload.budget,
        payload.location || null,
        payload.description || null,
        payload.status,
        req.user?.id || null,
      ],
    );

    if (!result.rows.length) {
      return res.status(404).json({
        status: 'ERROR',
        message: 'Department not found',
      });
    }

    return res.status(200).json({
      status: 'OK',
      message: 'Department updated successfully',
      data: mapDepartmentRow(result.rows[0]),
    });
  } catch (error) {
    console.error('Update department error:', error);
    return res.status(500).json({
      status: 'ERROR',
      message: 'Error updating department',
      error: error.message,
    });
  }
}

async function deleteDepartment(req, res) {
  try {
    const { departmentCode } = req.params;

    const result = await pool.query(
      `
        DELETE FROM departments
        WHERE department_code = $1
        RETURNING id
      `,
      [departmentCode],
    );

    if (!result.rows.length) {
      return res.status(404).json({
        status: 'ERROR',
        message: 'Department not found',
      });
    }

    return res.status(200).json({
      status: 'OK',
      message: 'Department deleted successfully',
    });
  } catch (error) {
    console.error('Delete department error:', error);
    return res.status(500).json({
      status: 'ERROR',
      message: 'Error deleting department',
      error: error.message,
    });
  }
}

module.exports = {
  fetchDepartments,
  fetchNextDepartmentCode,
  createDepartment,
  updateDepartment,
  deleteDepartment,
};
