/* eslint-disable no-undef */
/* eslint-env node */
const pool = require('../config/database');

function normalizeText(value) {
  return String(value || '').trim();
}

function normalizeNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function normalizeInteger(value, defaultValue = 0) {
  const parsed = Math.trunc(Number(value));
  return Number.isFinite(parsed) ? parsed : defaultValue;
}

function normalizeDate(value) {
  const text = normalizeText(value);
  if (!text) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return text;
  const date = new Date(text);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString().slice(0, 10);
}

function normalizePayMonth(value) {
  const text = normalizeText(value);
  if (!text) return '';
  if (/^\d{4}-\d{2}$/.test(text)) return text;
  const date = new Date(text);
  if (Number.isNaN(date.getTime())) return '';
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function getDaysInMonth(payMonth) {
  const [yearText, monthText] = String(payMonth || '').split('-');
  const year = Number(yearText);
  const month = Number(monthText);

  if (!Number.isFinite(year) || !Number.isFinite(month) || month < 1 || month > 12) {
    return 30;
  }

  return new Date(year, month, 0).getDate();
}

function roundMoney(value) {
  return Math.round(normalizeNumber(value) * 100) / 100;
}

function computePayrollAmounts(rawPayload) {
  const basicSalary = roundMoney(rawPayload.basicSalary);
  const hra = roundMoney(rawPayload.hra);
  const allowances = roundMoney(rawPayload.allowances);
  const specialAllowance = roundMoney(rawPayload.specialAllowance);
  const conveyanceAllowance = roundMoney(rawPayload.conveyanceAllowance);
  const medicalAllowance = roundMoney(rawPayload.medicalAllowance);
  const overtimePay = roundMoney(rawPayload.overtimePay);
  const bonus = roundMoney(rawPayload.bonus);
  const reimbursements = roundMoney(rawPayload.reimbursements);
  const arrears = roundMoney(rawPayload.arrears);

  const tax = roundMoney(rawPayload.tax);
  const providentFund = roundMoney(rawPayload.providentFund);
  const esi = roundMoney(rawPayload.esi);
  const professionalTax = roundMoney(rawPayload.professionalTax);
  const tds = roundMoney(rawPayload.tds);
  const loanDeduction = roundMoney(rawPayload.loanDeduction);
  const otherDeductions = roundMoney(rawPayload.otherDeductions);

  const employerPf = roundMoney(rawPayload.employerPf);
  const employerEsi = roundMoney(rawPayload.employerEsi);

  const payMonth = normalizePayMonth(rawPayload.payMonth);
  const defaultDaysInMonth = getDaysInMonth(payMonth);
  const daysInMonth = Math.max(1, normalizeInteger(rawPayload.daysInMonth, defaultDaysInMonth) || defaultDaysInMonth);

  let paidDays = normalizeInteger(rawPayload.paidDays, daysInMonth);
  if (!Number.isFinite(paidDays) || paidDays <= 0) paidDays = daysInMonth;
  paidDays = Math.min(daysInMonth, Math.max(0, paidDays));

  let lopDays = normalizeInteger(rawPayload.lopDays, Math.max(0, daysInMonth - paidDays));
  lopDays = Math.max(0, Math.min(daysInMonth, lopDays));

  if (lopDays > daysInMonth - paidDays) {
    paidDays = Math.max(0, daysInMonth - lopDays);
  } else {
    lopDays = Math.max(0, daysInMonth - paidDays);
  }

  const monthlyFixedEarnings = basicSalary + hra + allowances + specialAllowance + conveyanceAllowance + medicalAllowance;

  const perDayEarnings = daysInMonth > 0 ? monthlyFixedEarnings / daysInMonth : 0;
  const lopAmount = roundMoney(perDayEarnings * lopDays);

  const grossSalary = roundMoney(monthlyFixedEarnings - lopAmount + overtimePay + bonus + reimbursements + arrears);

  const totalDeductions = roundMoney(tax + providentFund + esi + professionalTax + tds + loanDeduction + otherDeductions);

  const netSalary = roundMoney(Math.max(0, grossSalary - totalDeductions));
  const totalCtc = roundMoney(grossSalary + employerPf + employerEsi);

  return {
    basicSalary,
    hra,
    allowances,
    specialAllowance,
    conveyanceAllowance,
    medicalAllowance,
    overtimePay,
    bonus,
    reimbursements,
    arrears,
    daysInMonth,
    paidDays,
    lopDays,
    lopAmount,
    grossSalary,
    tax,
    providentFund,
    esi,
    professionalTax,
    tds,
    loanDeduction,
    otherDeductions,
    totalDeductions,
    netSalary,
    employerPf,
    employerEsi,
    totalCtc,
  };
}

function normalizePayrollPayload(payload) {
  const payMonth = normalizePayMonth(payload.payMonth);
  const computed = computePayrollAmounts({ ...payload, payMonth });

  return {
    employeeId: normalizeText(payload.employeeId),
    employeeName: normalizeText(payload.employeeName),
    department: normalizeText(payload.department),
    roleDesignation: normalizeText(payload.roleDesignation),
    payMonth,
    ...computed,
    paymentDate: normalizeDate(payload.paymentDate),
    paymentMode: normalizeText(payload.paymentMode) || 'Bank Transfer',
    bankReference: normalizeText(payload.bankReference),
    status: normalizeText(payload.status) || 'Pending',
    notes: normalizeText(payload.notes),
  };
}

function hasRequiredFields(record) {
  return Boolean(record.employeeId && record.employeeName && record.payMonth);
}

function parsePayrollCodeNumber(payrollCode) {
  const match = normalizeText(payrollCode).toUpperCase().match(/(\d+)$/);
  return match ? Number(match[1]) : 0;
}

function formatPayrollCode(value) {
  return `SM-${String(value).padStart(5, '0')}`;
}

async function getLatestSalaryCode(client = pool, { forUpdate = false } = {}) {
  const result = await client.query(`SELECT salary_code FROM salary_management_records ORDER BY id DESC LIMIT 1 ${forUpdate ? 'FOR UPDATE' : ''}`);
  return result.rows[0]?.salary_code || '';
}

async function getNextSalaryCode(client = pool, options = {}) {
  const latestCode = await getLatestSalaryCode(client, options);
  return formatPayrollCode(parsePayrollCodeNumber(latestCode) + 1);
}

function mapSalaryRow(row) {
  return {
    id: row.id,
    salaryCode: row.salary_code,
    employeeId: row.employee_id,
    employeeName: row.employee_name,
    department: row.department,
    roleDesignation: row.role_designation,
    payMonth: row.pay_month,
    basicSalary: Number(row.basic_salary || 0),
    grossSalary: Number(row.gross_salary || 0),
    netSalary: Number(row.net_salary || 0),
    totalCtc: Number(row.total_ctc || 0),
    paymentDate: row.payment_date,
    paymentMode: row.payment_mode || 'Bank Transfer',
    bankReference: row.bank_reference || '',
    status: row.status,
    notes: row.notes || '',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function fetchSalaryRecords(req, res) {
  try {
    const result = await pool.query(`SELECT * FROM salary_management_records ORDER BY id DESC`);
    return res.status(200).json({ status: 'OK', data: result.rows.map(mapSalaryRow) });
  } catch (error) {
    console.error('Fetch salary records error:', error);
    return res.status(500).json({ status: 'ERROR', message: 'Error fetching salary records', error: error.message });
  }
}

async function fetchNextSalaryCode(req, res) {
  try {
    const salaryCode = await getNextSalaryCode();
    return res.status(200).json({ status: 'OK', data: { salaryCode } });
  } catch (error) {
    console.error('Fetch next salary code error:', error);
    return res.status(500).json({ status: 'ERROR', message: 'Error fetching next salary code', error: error.message });
  }
}

async function createSalaryRecord(req, res) {
  const client = await pool.connect();
  try {
    const payload = normalizePayrollPayload(req.body || {});
    if (!hasRequiredFields(payload)) {
      return res.status(400).json({ status: 'ERROR', message: 'Missing required salary fields' });
    }

    await client.query('BEGIN');
    const salaryCode = await getNextSalaryCode(client, { forUpdate: true });

    const result = await client.query(
      `INSERT INTO salary_management_records (
        salary_code, employee_id, employee_name, department, role_designation, pay_month,
        basic_salary, hra, allowances, special_allowance, conveyance_allowance, medical_allowance,
        overtime_pay, bonus, reimbursements, arrears, days_in_month, paid_days, lop_days, lop_amount,
        gross_salary, tax, provident_fund, esi, professional_tax, tds, loan_deduction, other_deductions,
        total_deductions, net_salary, employer_pf, employer_esi, total_ctc, payment_date, payment_mode,
        bank_reference, status, notes, created_by, updated_by
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27,$28,$29,$30,$31,$32,$33,$34::date,$35,$36,$37,$38
      ) RETURNING *`,
      [
        salaryCode,
        payload.employeeId,
        payload.employeeName,
        payload.department,
        payload.roleDesignation,
        payload.payMonth,
        payload.basicSalary,
        payload.hra,
        payload.allowances,
        payload.specialAllowance,
        payload.conveyanceAllowance,
        payload.medicalAllowance,
        payload.overtimePay,
        payload.bonus,
        payload.reimbursements,
        payload.arrears,
        payload.daysInMonth,
        payload.paidDays,
        payload.lopDays,
        payload.lopAmount,
        payload.grossSalary,
        payload.tax,
        payload.providentFund,
        payload.esi,
        payload.professionalTax,
        payload.tds,
        payload.loanDeduction,
        payload.otherDeductions,
        payload.totalDeductions,
        payload.netSalary,
        payload.employerPf,
        payload.employerEsi,
        payload.totalCtc,
        payload.paymentDate,
        payload.paymentMode,
        payload.bankReference || null,
        payload.status,
        payload.notes || null,
        req.user?.id || null,
      ],
    );

    await client.query('COMMIT');

    return res.status(201).json({ status: 'OK', message: 'Salary record created successfully', data: mapSalaryRow(result.rows[0]) });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Create salary record error:', error);
    return res.status(500).json({ status: 'ERROR', message: 'Error creating salary record', error: error.message });
  } finally {
    client.release();
  }
}

async function updateSalaryRecord(req, res) {
  try {
    const { salaryCode } = req.params;
    const payload = normalizePayrollPayload(req.body || {});

    if (!hasRequiredFields(payload)) {
      return res.status(400).json({ status: 'ERROR', message: 'Missing required salary fields' });
    }

    const result = await pool.query(
      `UPDATE salary_management_records SET
        employee_id = $2, employee_name = $3, department = $4, role_designation = $5, pay_month = $6,
        basic_salary = $7, hra = $8, allowances = $9, special_allowance = $10, conveyance_allowance = $11,
        medical_allowance = $12, overtime_pay = $13, bonus = $14, reimbursements = $15, arrears = $16,
        days_in_month = $17, paid_days = $18, lop_days = $19, lop_amount = $20, gross_salary = $21,
        tax = $22, provident_fund = $23, esi = $24, professional_tax = $25, tds = $26, loan_deduction = $27,
        other_deductions = $28, total_deductions = $29, net_salary = $30, employer_pf = $31, employer_esi = $32,
        total_ctc = $33, payment_date = $34::date, payment_mode = $35, bank_reference = $36, status = $37,
        notes = $38, updated_by = $39, updated_at = CURRENT_TIMESTAMP
       WHERE salary_code = $1 RETURNING *`,
      [
        salaryCode,
        payload.employeeId,
        payload.employeeName,
        payload.department,
        payload.roleDesignation,
        payload.payMonth,
        payload.basicSalary,
        payload.hra,
        payload.allowances,
        payload.specialAllowance,
        payload.conveyanceAllowance,
        payload.medicalAllowance,
        payload.overtimePay,
        payload.bonus,
        payload.reimbursements,
        payload.arrears,
        payload.daysInMonth,
        payload.paidDays,
        payload.lopDays,
        payload.lopAmount,
        payload.grossSalary,
        payload.tax,
        payload.providentFund,
        payload.esi,
        payload.professionalTax,
        payload.tds,
        payload.loanDeduction,
        payload.otherDeductions,
        payload.totalDeductions,
        payload.netSalary,
        payload.employerPf,
        payload.employerEsi,
        payload.totalCtc,
        payload.paymentDate,
        payload.paymentMode,
        payload.bankReference || null,
        payload.status,
        payload.notes || null,
        req.user?.id || null,
      ],
    );

    if (!result.rows.length) {
      return res.status(404).json({ status: 'ERROR', message: 'Salary record not found' });
    }

    return res.status(200).json({ status: 'OK', message: 'Salary record updated successfully', data: mapSalaryRow(result.rows[0]) });
  } catch (error) {
    console.error('Update salary record error:', error);
    return res.status(500).json({ status: 'ERROR', message: 'Error updating salary record', error: error.message });
  }
}

async function deleteSalaryRecord(req, res) {
  try {
    const { salaryCode } = req.params;
    const result = await pool.query(`DELETE FROM salary_management_records WHERE salary_code = $1 RETURNING id`, [salaryCode]);

    if (!result.rows.length) {
      return res.status(404).json({ status: 'ERROR', message: 'Salary record not found' });
    }

    return res.status(200).json({ status: 'OK', message: 'Salary record deleted successfully' });
  } catch (error) {
    console.error('Delete salary record error:', error);
    return res.status(500).json({ status: 'ERROR', message: 'Error deleting salary record', error: error.message });
  }
}

async function generateSalaryForMonth(req, res) {
  const client = await pool.connect();
  try {
    const payMonth = normalizePayMonth(req.body?.payMonth);
    const overwriteExisting = Boolean(req.body?.overwriteExisting);

    if (!payMonth) {
      return res.status(400).json({ status: 'ERROR', message: 'Valid pay month is required (YYYY-MM)' });
    }

    await client.query('BEGIN');

    const employeesResult = await client.query(`SELECT employee_id, full_name, department, role_designation, salary FROM employees WHERE LOWER(COALESCE(status, '')) = 'active' ORDER BY id ASC`);
    if (!employeesResult.rows.length) {
      await client.query('COMMIT');
      return res.status(200).json({ status: 'OK', message: 'No active employees found for salary generation', data: { payMonth, generatedCount: 0, skippedCount: 0, records: [] } });
    }

    const existingResult = await client.query(`SELECT employee_id FROM salary_management_records WHERE pay_month = $1`, [payMonth]);
    const existingEmployeeIds = new Set(existingResult.rows.map((r) => String(r.employee_id)));

    if (overwriteExisting && existingEmployeeIds.size) {
      await client.query(`DELETE FROM salary_management_records WHERE pay_month = $1`, [payMonth]);
      existingEmployeeIds.clear();
    }

    const generatedRows = [];
    let skippedCount = 0;

    for (const employee of employeesResult.rows) {
      const employeeId = String(employee.employee_id || '').trim();
      if (!employeeId) { skippedCount += 1; continue; }
      if (existingEmployeeIds.has(employeeId)) { skippedCount += 1; continue; }

      const basicSalary = roundMoney(employee.salary || 0);
      const hra = roundMoney(basicSalary * 0.4);
      const allowances = roundMoney(basicSalary * 0.15);
      const specialAllowance = roundMoney(basicSalary * 0.1);
      const conveyanceAllowance = 0;
      const medicalAllowance = 0;
      const overtimePay = 0;
      const bonus = 0;
      const reimbursements = 0;
      const arrears = 0;

      const daysInMonth = getDaysInMonth(payMonth);
      const paidDays = daysInMonth;
      const lopDays = 0;

      const computed = computePayrollAmounts({ payMonth, basicSalary, hra, allowances, specialAllowance, conveyanceAllowance, medicalAllowance, overtimePay, bonus, reimbursements, arrears, daysInMonth, paidDays, lopDays, tax: 0, providentFund: 0, esi: 0, professionalTax: 0, tds: 0, loanDeduction: 0, otherDeductions: 0, employerPf: 0, employerEsi: 0 });

      const salaryCode = await getNextSalaryCode(client, { forUpdate: true });

      const inserted = await client.query(`INSERT INTO salary_management_records (salary_code, employee_id, employee_name, department, role_designation, pay_month, basic_salary, hra, allowances, special_allowance, conveyance_allowance, medical_allowance, overtime_pay, bonus, reimbursements, arrears, days_in_month, paid_days, lop_days, lop_amount, gross_salary, tax, provident_fund, esi, professional_tax, tds, loan_deduction, other_deductions, total_deductions, net_salary, employer_pf, employer_esi, total_ctc, payment_mode, status, created_by) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27,$28,$29,$30,$31,$32,$33,$34,$35) RETURNING *`, [salaryCode, employeeId, String(employee.full_name || '').trim(), String(employee.department || '').trim(), String(employee.role_designation || '').trim(), payMonth, computed.basicSalary, computed.hra, computed.allowances, computed.specialAllowance, computed.conveyanceAllowance, computed.medicalAllowance, computed.overtimePay, computed.bonus, computed.reimbursements, computed.arrears, computed.daysInMonth, computed.paidDays, computed.lopDays, computed.lopAmount, computed.grossSalary, computed.tax, computed.providentFund, computed.esi, computed.professionalTax, computed.tds, computed.loanDeduction, computed.otherDeductions, computed.totalDeductions, computed.netSalary, computed.employerPf, computed.employerEsi, computed.totalCtc, 'Bank Transfer', 'Pending', req.user?.id || null]);

      generatedRows.push(mapSalaryRow(inserted.rows[0]));
    }

    await client.query('COMMIT');

    return res.status(201).json({ status: 'OK', message: 'Monthly salary generated successfully', data: { payMonth, generatedCount: generatedRows.length, skippedCount, records: generatedRows } });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Generate salary for month error:', error);
    return res.status(500).json({ status: 'ERROR', message: 'Error generating monthly salary', error: error.message });
  } finally {
    client.release();
  }
}

module.exports = {
  fetchSalaryRecords,
  fetchNextSalaryCode,
  createSalaryRecord,
  updateSalaryRecord,
  deleteSalaryRecord,
  generateSalaryForMonth,
};
