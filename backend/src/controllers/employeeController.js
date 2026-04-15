/* eslint-disable no-undef */
/* eslint-env node */
const pool = require('../config/database');

const REQUIRED_FIELDS = [
  'name',
  'phone',
  'email',
  'dept',
  'role',
  'joined',
  'status',
];

function normalizeText(value) {
  return String(value || '').trim();
}

function normalizeDate(value) {
  if (!value) {
    return '';
  }

  const text = String(value).trim();
  if (!text) {
    return '';
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) {
    return text;
  }

  const parsed = new Date(text);
  if (Number.isNaN(parsed.getTime())) {
    return '';
  }

  return parsed.toISOString().slice(0, 10);
}

function normalizeSalary(value) {
  const text = normalizeText(value);
  if (!text) {
    return null;
  }

  const numeric = Number(text);
  if (!Number.isFinite(numeric)) {
    return null;
  }

  return numeric;
}

function mapEmployeeRow(row) {
  return {
    id: row.id,
    employeeId: row.employee_id,
    name: row.full_name,
    phone: row.phone,
    email: row.email,
    dept: row.department,
    role: row.role_designation,
    joined: row.date_joined,
    status: row.status,
    salary: row.salary === null ? '' : String(row.salary),
    address: row.address || '',
    manager: row.reporting_manager || '',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function normalizeEmployeeInput(payload) {
  return {
    employeeId: normalizeText(payload.employeeId),
    name: normalizeText(payload.name),
    phone: normalizeText(payload.phone),
    email: normalizeText(payload.email).toLowerCase(),
    dept: normalizeText(payload.dept),
    role: normalizeText(payload.role),
    joined: normalizeDate(payload.joined),
    status: normalizeText(payload.status),
    salary: normalizeSalary(payload.salary),
    address: normalizeText(payload.address),
    manager: normalizeText(payload.manager),
  };
}

function hasRequiredFields(employee) {
  return REQUIRED_FIELDS.every((fieldName) => normalizeText(employee[fieldName]));
}

function parseEmployeeIdNumber(employeeId) {
  const match = String(employeeId || '').trim().toUpperCase().match(/(\d+)$/);
  return match ? Number(match[1]) : 0;
}

function formatEmployeeId(numberValue) {
  return `EMP-${String(numberValue).padStart(4, '0')}`;
}

async function getLatestEmployeeId(client = pool, { forUpdate = false } = {}) {
  const result = await client.query(
    `
      SELECT employee_id
      FROM employees
      ORDER BY id DESC
      LIMIT 1
      ${forUpdate ? 'FOR UPDATE' : ''}
    `,
  );

  return result.rows[0]?.employee_id || '';
}

async function getNextEmployeeId(client = pool, options = {}) {
  const latestEmployeeId = await getLatestEmployeeId(client, options);
  const numericPart = parseEmployeeIdNumber(latestEmployeeId);
  return formatEmployeeId(numericPart + 1);
}

async function createEmployeeRow(client, employee, actorUserId) {
  const insertResult = await client.query(
    `
      INSERT INTO employees (
        employee_id,
        full_name,
        phone,
        email,
        department,
        role_designation,
        date_joined,
        status,
        salary,
        address,
        reporting_manager,
        created_by,
        updated_by,
        updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7::date, $8, $9, $10, $11, $12, $12, CURRENT_TIMESTAMP)
      RETURNING *
    `,
    [
      employee.employeeId,
      employee.name,
      employee.phone,
      employee.email,
      employee.dept,
      employee.role,
      employee.joined,
      employee.status,
      employee.salary,
      employee.address || null,
      employee.manager || null,
      actorUserId || null,
    ],
  );

  return mapEmployeeRow(insertResult.rows[0]);
}

async function fetchEmployees(req, res) {
  try {
    const result = await pool.query(
      `
        SELECT *
        FROM employees
        ORDER BY id DESC
      `,
    );

    res.status(200).json({
      status: 'OK',
      data: result.rows.map(mapEmployeeRow),
    });
  } catch (error) {
    console.error('Fetch employees error:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Error fetching employees',
      error: error.message,
    });
  }
}

async function fetchNextEmployeeId(req, res) {
  try {
    const employeeId = await getNextEmployeeId();

    res.status(200).json({
      status: 'OK',
      data: {
        employeeId,
      },
    });
  } catch (error) {
    console.error('Fetch next employee id error:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Error fetching next employee id',
      error: error.message,
    });
  }
}

async function createEmployee(req, res) {
  const client = await pool.connect();

  try {
    const normalized = normalizeEmployeeInput(req.body || {});

    if (!hasRequiredFields(normalized)) {
      return res.status(400).json({
        status: 'ERROR',
        message: 'Missing required employee fields',
      });
    }

    await client.query('BEGIN');

    const generatedEmployeeId = await getNextEmployeeId(client, { forUpdate: true });
    normalized.employeeId = generatedEmployeeId;

    const createdEmployee = await createEmployeeRow(client, normalized, req.user?.id);

    await client.query('COMMIT');

    return res.status(201).json({
      status: 'OK',
      message: 'Employee created successfully',
      data: createdEmployee,
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Create employee error:', error);
    return res.status(500).json({
      status: 'ERROR',
      message: 'Error creating employee',
      error: error.message,
    });
  } finally {
    client.release();
  }
}

async function updateEmployee(req, res) {
  try {
    const { employeeId } = req.params;
    const normalized = normalizeEmployeeInput(req.body || {});

    if (!hasRequiredFields(normalized)) {
      return res.status(400).json({
        status: 'ERROR',
        message: 'Missing required employee fields',
      });
    }

    const result = await pool.query(
      `
        UPDATE employees
        SET
          full_name = $2,
          phone = $3,
          email = $4,
          department = $5,
          role_designation = $6,
          date_joined = $7::date,
          status = $8,
          salary = $9,
          address = $10,
          reporting_manager = $11,
          updated_by = $12,
          updated_at = CURRENT_TIMESTAMP
        WHERE employee_id = $1
        RETURNING *
      `,
      [
        employeeId,
        normalized.name,
        normalized.phone,
        normalized.email,
        normalized.dept,
        normalized.role,
        normalized.joined,
        normalized.status,
        normalized.salary,
        normalized.address || null,
        normalized.manager || null,
        req.user?.id || null,
      ],
    );

    if (!result.rows.length) {
      return res.status(404).json({
        status: 'ERROR',
        message: 'Employee not found',
      });
    }

    return res.status(200).json({
      status: 'OK',
      message: 'Employee updated successfully',
      data: mapEmployeeRow(result.rows[0]),
    });
  } catch (error) {
    console.error('Update employee error:', error);
    return res.status(500).json({
      status: 'ERROR',
      message: 'Error updating employee',
      error: error.message,
    });
  }
}

async function deleteEmployee(req, res) {
  try {
    const { employeeId } = req.params;

    const result = await pool.query(
      `
        DELETE FROM employees
        WHERE employee_id = $1
        RETURNING id
      `,
      [employeeId],
    );

    if (!result.rows.length) {
      return res.status(404).json({
        status: 'ERROR',
        message: 'Employee not found',
      });
    }

    return res.status(200).json({
      status: 'OK',
      message: 'Employee deleted successfully',
    });
  } catch (error) {
    console.error('Delete employee error:', error);
    return res.status(500).json({
      status: 'ERROR',
      message: 'Error deleting employee',
      error: error.message,
    });
  }
}

async function importEmployees(req, res) {
  const client = await pool.connect();

  try {
    const inputRows = Array.isArray(req.body?.employees) ? req.body.employees : [];
    if (!inputRows.length) {
      return res.status(400).json({
        status: 'ERROR',
        message: 'employees array is required',
      });
    }

    const normalizedRows = inputRows
      .map((item) => normalizeEmployeeInput(item))
      .filter((item) => hasRequiredFields(item));

    if (!normalizedRows.length) {
      return res.status(400).json({
        status: 'ERROR',
        message: 'No valid employee rows found',
      });
    }

    await client.query('BEGIN');

    const upserted = [];
    let lastGeneratedId = await getLatestEmployeeId(client, { forUpdate: true });
    let lastNumber = parseEmployeeIdNumber(lastGeneratedId);

    for (const employee of normalizedRows) {
      let targetEmployeeId = normalizeText(employee.employeeId);

      if (!targetEmployeeId) {
        lastNumber += 1;
        targetEmployeeId = formatEmployeeId(lastNumber);
      }

      employee.employeeId = targetEmployeeId;

      const updateResult = await client.query(
        `
          UPDATE employees
          SET
            full_name = $2,
            phone = $3,
            email = $4,
            department = $5,
            role_designation = $6,
            date_joined = $7::date,
            status = $8,
            salary = $9,
            address = $10,
            reporting_manager = $11,
            updated_by = $12,
            updated_at = CURRENT_TIMESTAMP
          WHERE employee_id = $1
          RETURNING *
        `,
        [
          employee.employeeId,
          employee.name,
          employee.phone,
          employee.email,
          employee.dept,
          employee.role,
          employee.joined,
          employee.status,
          employee.salary,
          employee.address || null,
          employee.manager || null,
          req.user?.id || null,
        ],
      );

      if (updateResult.rows.length) {
        upserted.push(mapEmployeeRow(updateResult.rows[0]));
        continue;
      }

      const created = await createEmployeeRow(client, employee, req.user?.id);
      upserted.push(created);

      const insertedNumber = parseEmployeeIdNumber(employee.employeeId);
      if (insertedNumber > lastNumber) {
        lastNumber = insertedNumber;
      }
    }

    await client.query('COMMIT');

    return res.status(200).json({
      status: 'OK',
      message: 'Employees imported successfully',
      data: {
        insertedOrUpdated: upserted.length,
        skipped: inputRows.length - normalizedRows.length,
      },
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Import employees error:', error);
    return res.status(500).json({
      status: 'ERROR',
      message: 'Error importing employees',
      error: error.message,
    });
  } finally {
    client.release();
  }
}

module.exports = {
  fetchEmployees,
  fetchNextEmployeeId,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  importEmployees,
};
