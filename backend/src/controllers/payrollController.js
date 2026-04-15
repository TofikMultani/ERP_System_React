/* eslint-disable no-undef */
/* eslint-env node */
const pool = require('../config/database');

const REQUIRED_FIELDS = [
  'employeeId',
  'employeeName',
  'department',
  'roleDesignation',
  'payMonth',
  'basicSalary',
  'status',
];

function normalizeText(value) {
  return String(value || '').trim();
}

function normalizeNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function normalizeDate(value) {
  const text = normalizeText(value);
  if (!text) {
    return null;
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) {
    return text;
  }

  const date = new Date(text);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toISOString().slice(0, 10);
}

function normalizePayMonth(value) {
  const text = normalizeText(value);
  if (!text) {
    return '';
  }

  if (/^\d{4}-\d{2}$/.test(text)) {
    return text;
  }

  const date = new Date(text);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function normalizePayrollPayload(payload) {
  const basicSalary = normalizeNumber(payload.basicSalary);
  const hra = normalizeNumber(payload.hra);
  const allowances = normalizeNumber(payload.allowances);
  const overtimePay = normalizeNumber(payload.overtimePay);
  const bonus = normalizeNumber(payload.bonus);
  const tax = normalizeNumber(payload.tax);
  const providentFund = normalizeNumber(payload.providentFund);
  const otherDeductions = normalizeNumber(payload.otherDeductions);

  const grossSalary = basicSalary + hra + allowances + overtimePay + bonus;
  const totalDeductions = tax + providentFund + otherDeductions;
  const netSalary = Math.max(0, grossSalary - totalDeductions);

  return {
    employeeId: normalizeText(payload.employeeId),
    employeeName: normalizeText(payload.employeeName),
    department: normalizeText(payload.department),
    roleDesignation: normalizeText(payload.roleDesignation),
    payMonth: normalizePayMonth(payload.payMonth),
    basicSalary,
    hra,
    allowances,
    overtimePay,
    bonus,
    grossSalary,
    tax,
    providentFund,
    otherDeductions,
    totalDeductions,
    netSalary,
    paymentDate: normalizeDate(payload.paymentDate),
    status: normalizeText(payload.status) || 'Pending',
    notes: normalizeText(payload.notes),
  };
}

function hasRequiredFields(record) {
  return REQUIRED_FIELDS.every((field) => normalizeText(record[field]));
}

function parsePayrollCodeNumber(payrollCode) {
  const match = normalizeText(payrollCode).toUpperCase().match(/(\d+)$/);
  return match ? Number(match[1]) : 0;
}

function formatPayrollCode(value) {
  return `PAY-${String(value).padStart(5, '0')}`;
}

async function getLatestPayrollCode(client = pool, { forUpdate = false } = {}) {
  const result = await client.query(
    `
      SELECT payroll_code
      FROM payroll_records
      ORDER BY id DESC
      LIMIT 1
      ${forUpdate ? 'FOR UPDATE' : ''}
    `,
  );

  return result.rows[0]?.payroll_code || '';
}

async function getNextPayrollCode(client = pool, options = {}) {
  const latestCode = await getLatestPayrollCode(client, options);
  return formatPayrollCode(parsePayrollCodeNumber(latestCode) + 1);
}

function mapPayrollRow(row) {
  return {
    id: row.id,
    payrollCode: row.payroll_code,
    employeeId: row.employee_id,
    employeeName: row.employee_name,
    department: row.department,
    roleDesignation: row.role_designation,
    payMonth: row.pay_month,
    basicSalary: Number(row.basic_salary || 0),
    hra: Number(row.hra || 0),
    allowances: Number(row.allowances || 0),
    overtimePay: Number(row.overtime_pay || 0),
    bonus: Number(row.bonus || 0),
    grossSalary: Number(row.gross_salary || 0),
    tax: Number(row.tax || 0),
    providentFund: Number(row.provident_fund || 0),
    otherDeductions: Number(row.other_deductions || 0),
    totalDeductions: Number(row.total_deductions || 0),
    netSalary: Number(row.net_salary || 0),
    paymentDate: row.payment_date,
    status: row.status,
    notes: row.notes || '',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function fetchPayrollRecords(req, res) {
  try {
    const result = await pool.query(
      `
        SELECT *
        FROM payroll_records
        ORDER BY id DESC
      `,
    );

    return res.status(200).json({
      status: 'OK',
      data: result.rows.map(mapPayrollRow),
    });
  } catch (error) {
    console.error('Fetch payroll records error:', error);
    return res.status(500).json({
      status: 'ERROR',
      message: 'Error fetching payroll records',
      error: error.message,
    });
  }
}

async function fetchNextPayrollCode(req, res) {
  try {
    const payrollCode = await getNextPayrollCode();

    return res.status(200).json({
      status: 'OK',
      data: { payrollCode },
    });
  } catch (error) {
    console.error('Fetch next payroll code error:', error);
    return res.status(500).json({
      status: 'ERROR',
      message: 'Error fetching next payroll code',
      error: error.message,
    });
  }
}

async function createPayrollRecord(req, res) {
  const client = await pool.connect();

  try {
    const payload = normalizePayrollPayload(req.body || {});

    if (!hasRequiredFields(payload)) {
      return res.status(400).json({
        status: 'ERROR',
        message: 'Missing required payroll fields',
      });
    }

    await client.query('BEGIN');
    const payrollCode = await getNextPayrollCode(client, { forUpdate: true });

    const result = await client.query(
      `
        INSERT INTO payroll_records (
          payroll_code,
          employee_id,
          employee_name,
          department,
          role_designation,
          pay_month,
          basic_salary,
          hra,
          allowances,
          overtime_pay,
          bonus,
          gross_salary,
          tax,
          provident_fund,
          other_deductions,
          total_deductions,
          net_salary,
          payment_date,
          status,
          notes,
          created_by,
          updated_by,
          updated_at
        )
        VALUES (
          $1, $2, $3, $4, $5, $6,
          $7, $8, $9, $10, $11, $12,
          $13, $14, $15, $16, $17,
          $18::date, $19, $20, $21, $21, CURRENT_TIMESTAMP
        )
        RETURNING *
      `,
      [
        payrollCode,
        payload.employeeId,
        payload.employeeName,
        payload.department,
        payload.roleDesignation,
        payload.payMonth,
        payload.basicSalary,
        payload.hra,
        payload.allowances,
        payload.overtimePay,
        payload.bonus,
        payload.grossSalary,
        payload.tax,
        payload.providentFund,
        payload.otherDeductions,
        payload.totalDeductions,
        payload.netSalary,
        payload.paymentDate,
        payload.status,
        payload.notes || null,
        req.user?.id || null,
      ],
    );

    await client.query('COMMIT');

    return res.status(201).json({
      status: 'OK',
      message: 'Payroll record created successfully',
      data: mapPayrollRow(result.rows[0]),
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Create payroll record error:', error);
    return res.status(500).json({
      status: 'ERROR',
      message: 'Error creating payroll record',
      error: error.message,
    });
  } finally {
    client.release();
  }
}

async function updatePayrollRecord(req, res) {
  try {
    const { payrollCode } = req.params;
    const payload = normalizePayrollPayload(req.body || {});

    if (!hasRequiredFields(payload)) {
      return res.status(400).json({
        status: 'ERROR',
        message: 'Missing required payroll fields',
      });
    }

    const result = await pool.query(
      `
        UPDATE payroll_records
        SET
          employee_id = $2,
          employee_name = $3,
          department = $4,
          role_designation = $5,
          pay_month = $6,
          basic_salary = $7,
          hra = $8,
          allowances = $9,
          overtime_pay = $10,
          bonus = $11,
          gross_salary = $12,
          tax = $13,
          provident_fund = $14,
          other_deductions = $15,
          total_deductions = $16,
          net_salary = $17,
          payment_date = $18::date,
          status = $19,
          notes = $20,
          updated_by = $21,
          updated_at = CURRENT_TIMESTAMP
        WHERE payroll_code = $1
        RETURNING *
      `,
      [
        payrollCode,
        payload.employeeId,
        payload.employeeName,
        payload.department,
        payload.roleDesignation,
        payload.payMonth,
        payload.basicSalary,
        payload.hra,
        payload.allowances,
        payload.overtimePay,
        payload.bonus,
        payload.grossSalary,
        payload.tax,
        payload.providentFund,
        payload.otherDeductions,
        payload.totalDeductions,
        payload.netSalary,
        payload.paymentDate,
        payload.status,
        payload.notes || null,
        req.user?.id || null,
      ],
    );

    if (!result.rows.length) {
      return res.status(404).json({
        status: 'ERROR',
        message: 'Payroll record not found',
      });
    }

    return res.status(200).json({
      status: 'OK',
      message: 'Payroll record updated successfully',
      data: mapPayrollRow(result.rows[0]),
    });
  } catch (error) {
    console.error('Update payroll record error:', error);
    return res.status(500).json({
      status: 'ERROR',
      message: 'Error updating payroll record',
      error: error.message,
    });
  }
}

async function deletePayrollRecord(req, res) {
  try {
    const { payrollCode } = req.params;

    const result = await pool.query(
      `
        DELETE FROM payroll_records
        WHERE payroll_code = $1
        RETURNING id
      `,
      [payrollCode],
    );

    if (!result.rows.length) {
      return res.status(404).json({
        status: 'ERROR',
        message: 'Payroll record not found',
      });
    }

    return res.status(200).json({
      status: 'OK',
      message: 'Payroll record deleted successfully',
    });
  } catch (error) {
    console.error('Delete payroll record error:', error);
    return res.status(500).json({
      status: 'ERROR',
      message: 'Error deleting payroll record',
      error: error.message,
    });
  }
}

async function generatePayrollForMonth(req, res) {
  const client = await pool.connect();

  try {
    const payMonth = normalizePayMonth(req.body?.payMonth);
    const overwriteExisting = Boolean(req.body?.overwriteExisting);

    if (!payMonth) {
      return res.status(400).json({
        status: 'ERROR',
        message: 'Valid pay month is required (YYYY-MM)',
      });
    }

    await client.query('BEGIN');

    const employeesResult = await client.query(
      `
        SELECT employee_id, full_name, department, role_designation, salary
        FROM employees
        WHERE LOWER(COALESCE(status, '')) = 'active'
        ORDER BY id ASC
      `,
    );

    if (!employeesResult.rows.length) {
      await client.query('COMMIT');
      return res.status(200).json({
        status: 'OK',
        message: 'No active employees found for payroll generation',
        data: {
          payMonth,
          generatedCount: 0,
          skippedCount: 0,
          records: [],
        },
      });
    }

    const existingResult = await client.query(
      `
        SELECT employee_id
        FROM payroll_records
        WHERE pay_month = $1
      `,
      [payMonth],
    );

    const existingEmployeeIds = new Set(
      existingResult.rows.map((row) => String(row.employee_id)),
    );

    if (overwriteExisting && existingEmployeeIds.size) {
      await client.query(
        `
          DELETE FROM payroll_records
          WHERE pay_month = $1
        `,
        [payMonth],
      );
      existingEmployeeIds.clear();
    }

    const generatedRows = [];
    let skippedCount = 0;

    for (const employee of employeesResult.rows) {
      const employeeId = String(employee.employee_id || '').trim();

      if (!employeeId) {
        skippedCount += 1;
        continue;
      }

      if (existingEmployeeIds.has(employeeId)) {
        skippedCount += 1;
        continue;
      }

      const basicSalary = normalizeNumber(employee.salary);
      const hra = Math.round(basicSalary * 0.2 * 100) / 100;
      const allowances = Math.round(basicSalary * 0.1 * 100) / 100;
      const overtimePay = 0;
      const bonus = 0;
      const grossSalary = basicSalary + hra + allowances + overtimePay + bonus;
      const tax = Math.round(basicSalary * 0.1 * 100) / 100;
      const providentFund = Math.round(basicSalary * 0.05 * 100) / 100;
      const otherDeductions = 0;
      const totalDeductions = tax + providentFund + otherDeductions;
      const netSalary = Math.max(0, grossSalary - totalDeductions);

      const payrollCode = await getNextPayrollCode(client, { forUpdate: true });

      const inserted = await client.query(
        `
          INSERT INTO payroll_records (
            payroll_code,
            employee_id,
            employee_name,
            department,
            role_designation,
            pay_month,
            basic_salary,
            hra,
            allowances,
            overtime_pay,
            bonus,
            gross_salary,
            tax,
            provident_fund,
            other_deductions,
            total_deductions,
            net_salary,
            payment_date,
            status,
            notes,
            created_by,
            updated_by,
            updated_at
          )
          VALUES (
            $1, $2, $3, $4, $5, $6,
            $7, $8, $9, $10, $11, $12,
            $13, $14, $15, $16, $17,
            NULL, $18, $19, $20, $20, CURRENT_TIMESTAMP
          )
          RETURNING *
        `,
        [
          payrollCode,
          employeeId,
          String(employee.full_name || '').trim(),
          String(employee.department || '').trim(),
          String(employee.role_designation || '').trim(),
          payMonth,
          basicSalary,
          hra,
          allowances,
          overtimePay,
          bonus,
          grossSalary,
          tax,
          providentFund,
          otherDeductions,
          totalDeductions,
          netSalary,
          'Pending',
          'Auto-generated monthly payroll',
          req.user?.id || null,
        ],
      );

      generatedRows.push(mapPayrollRow(inserted.rows[0]));
    }

    await client.query('COMMIT');

    return res.status(201).json({
      status: 'OK',
      message: 'Monthly payroll generated successfully',
      data: {
        payMonth,
        generatedCount: generatedRows.length,
        skippedCount,
        records: generatedRows,
      },
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Generate payroll for month error:', error);
    return res.status(500).json({
      status: 'ERROR',
      message: 'Error generating monthly payroll',
      error: error.message,
    });
  } finally {
    client.release();
  }
}

module.exports = {
  fetchPayrollRecords,
  fetchNextPayrollCode,
  createPayrollRecord,
  updatePayrollRecord,
  deletePayrollRecord,
  generatePayrollForMonth,
};
