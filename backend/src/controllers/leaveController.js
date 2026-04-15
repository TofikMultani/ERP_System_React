/* eslint-disable no-undef */
/* eslint-env node */
const pool = require('../config/database');

const REQUIRED_FIELDS = ['employeeId', 'name', 'dept', 'type', 'from', 'to', 'days', 'status'];

function normalizeText(value) {
  return String(value || '').trim();
}

function normalizeDate(value) {
  const text = normalizeText(value);
  if (!text) {
    return '';
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) {
    return text;
  }

  const date = new Date(text);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return date.toISOString().slice(0, 10);
}

function normalizeDays(value) {
  const numberValue = Number(value);
  if (!Number.isFinite(numberValue)) {
    return 0;
  }

  return Math.max(0, Math.trunc(numberValue));
}

function normalizeLeavePayload(payload) {
  return {
    employeeId: normalizeText(payload.employeeId),
    name: normalizeText(payload.name),
    dept: normalizeText(payload.dept),
    type: normalizeText(payload.type),
    from: normalizeDate(payload.from),
    to: normalizeDate(payload.to),
    days: normalizeDays(payload.days),
    reason: normalizeText(payload.reason),
    status: normalizeText(payload.status) || 'Pending',
  };
}

function hasRequiredFields(leave) {
  return REQUIRED_FIELDS.every((field) => normalizeText(leave[field]));
}

function mapLeaveRow(row) {
  return {
    id: row.id,
    leaveCode: row.leave_code,
    employeeId: row.employee_id,
    name: row.employee_name,
    dept: row.department,
    type: row.leave_type,
    from: row.start_date,
    to: row.end_date,
    days: Number(row.total_days || 0),
    reason: row.reason || '',
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function parseLeaveCodeNumber(leaveCode) {
  const match = normalizeText(leaveCode).toUpperCase().match(/(\d+)$/);
  return match ? Number(match[1]) : 0;
}

function formatLeaveCode(numberValue) {
  return `LEV-${String(numberValue).padStart(5, '0')}`;
}

async function getLatestLeaveCode(client = pool, { forUpdate = false } = {}) {
  const result = await client.query(
    `
      SELECT leave_code
      FROM leave_requests
      ORDER BY id DESC
      LIMIT 1
      ${forUpdate ? 'FOR UPDATE' : ''}
    `,
  );

  return result.rows[0]?.leave_code || '';
}

async function getNextLeaveCode(client = pool, options = {}) {
  const latest = await getLatestLeaveCode(client, options);
  const numberPart = parseLeaveCodeNumber(latest);
  return formatLeaveCode(numberPart + 1);
}

async function fetchLeaves(req, res) {
  try {
    const result = await pool.query(
      `
        SELECT *
        FROM leave_requests
        ORDER BY id DESC
      `,
    );

    return res.status(200).json({
      status: 'OK',
      data: result.rows.map(mapLeaveRow),
    });
  } catch (error) {
    console.error('Fetch leaves error:', error);
    return res.status(500).json({
      status: 'ERROR',
      message: 'Error fetching leaves',
      error: error.message,
    });
  }
}

async function createLeave(req, res) {
  const client = await pool.connect();

  try {
    const payload = normalizeLeavePayload(req.body || {});

    if (!hasRequiredFields(payload)) {
      return res.status(400).json({
        status: 'ERROR',
        message: 'Missing required leave fields',
      });
    }

    await client.query('BEGIN');
    const leaveCode = await getNextLeaveCode(client, { forUpdate: true });

    const result = await client.query(
      `
        INSERT INTO leave_requests (
          leave_code,
          employee_id,
          employee_name,
          department,
          leave_type,
          start_date,
          end_date,
          total_days,
          reason,
          status,
          created_by,
          updated_by,
          updated_at
        )
        VALUES ($1, $2, $3, $4, $5, $6::date, $7::date, $8, $9, $10, $11, $11, CURRENT_TIMESTAMP)
        RETURNING *
      `,
      [
        leaveCode,
        payload.employeeId,
        payload.name,
        payload.dept,
        payload.type,
        payload.from,
        payload.to,
        payload.days,
        payload.reason || null,
        payload.status,
        req.user?.id || null,
      ],
    );

    await client.query('COMMIT');

    return res.status(201).json({
      status: 'OK',
      message: 'Leave created successfully',
      data: mapLeaveRow(result.rows[0]),
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Create leave error:', error);
    return res.status(500).json({
      status: 'ERROR',
      message: 'Error creating leave',
      error: error.message,
    });
  } finally {
    client.release();
  }
}

async function updateLeave(req, res) {
  try {
    const { leaveCode } = req.params;
    const payload = normalizeLeavePayload(req.body || {});

    if (!hasRequiredFields(payload)) {
      return res.status(400).json({
        status: 'ERROR',
        message: 'Missing required leave fields',
      });
    }

    const result = await pool.query(
      `
        UPDATE leave_requests
        SET
          employee_id = $2,
          employee_name = $3,
          department = $4,
          leave_type = $5,
          start_date = $6::date,
          end_date = $7::date,
          total_days = $8,
          reason = $9,
          status = $10,
          updated_by = $11,
          updated_at = CURRENT_TIMESTAMP
        WHERE leave_code = $1
        RETURNING *
      `,
      [
        leaveCode,
        payload.employeeId,
        payload.name,
        payload.dept,
        payload.type,
        payload.from,
        payload.to,
        payload.days,
        payload.reason || null,
        payload.status,
        req.user?.id || null,
      ],
    );

    if (!result.rows.length) {
      return res.status(404).json({
        status: 'ERROR',
        message: 'Leave record not found',
      });
    }

    return res.status(200).json({
      status: 'OK',
      message: 'Leave updated successfully',
      data: mapLeaveRow(result.rows[0]),
    });
  } catch (error) {
    console.error('Update leave error:', error);
    return res.status(500).json({
      status: 'ERROR',
      message: 'Error updating leave',
      error: error.message,
    });
  }
}

async function deleteLeave(req, res) {
  try {
    const { leaveCode } = req.params;

    const result = await pool.query(
      `
        DELETE FROM leave_requests
        WHERE leave_code = $1
        RETURNING id
      `,
      [leaveCode],
    );

    if (!result.rows.length) {
      return res.status(404).json({
        status: 'ERROR',
        message: 'Leave record not found',
      });
    }

    return res.status(200).json({
      status: 'OK',
      message: 'Leave deleted successfully',
    });
  } catch (error) {
    console.error('Delete leave error:', error);
    return res.status(500).json({
      status: 'ERROR',
      message: 'Error deleting leave',
      error: error.message,
    });
  }
}

module.exports = {
  fetchLeaves,
  createLeave,
  updateLeave,
  deleteLeave,
};
