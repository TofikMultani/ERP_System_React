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

function normalizeInteger(value, fallback = 0) {
  const parsed = Math.trunc(Number(value));
  return Number.isFinite(parsed) ? parsed : fallback;
}

function normalizePayMonth(value) {
  const text = normalizeText(value);
  if (!text) return '';
  if (/^\d{4}-\d{2}$/.test(text)) return text;
  const date = new Date(text);
  if (Number.isNaN(date.getTime())) return '';
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function roundMoney(value) {
  return Math.round(normalizeNumber(value) * 100) / 100;
}

function getDaysInMonth(payMonth) {
  const [yearText, monthText] = String(payMonth || '').split('-');
  const year = Number(yearText);
  const month = Number(monthText);
  if (!Number.isFinite(year) || !Number.isFinite(month) || month < 1 || month > 12) return 30;
  return new Date(year, month, 0).getDate();
}

function computePayrollAmounts(payload) {
  const basicSalary = roundMoney(payload.basicSalary);
  const hra = roundMoney(payload.hra);
  const allowances = roundMoney(payload.allowances);
  const specialAllowance = roundMoney(payload.specialAllowance);
  const conveyanceAllowance = roundMoney(payload.conveyanceAllowance);
  const medicalAllowance = roundMoney(payload.medicalAllowance);
  const overtimePay = roundMoney(payload.overtimePay);
  const bonus = roundMoney(payload.bonus);
  const reimbursements = roundMoney(payload.reimbursements);
  const arrears = roundMoney(payload.arrears);

  const tax = roundMoney(payload.tax);
  const providentFund = roundMoney(payload.providentFund);
  const esi = roundMoney(payload.esi);
  const professionalTax = roundMoney(payload.professionalTax);
  const tds = roundMoney(payload.tds);
  const loanDeduction = roundMoney(payload.loanDeduction);
  const otherDeductions = roundMoney(payload.otherDeductions);

  const employerPf = roundMoney(payload.employerPf);
  const employerEsi = roundMoney(payload.employerEsi);

  const payMonth = normalizePayMonth(payload.payMonth);
  const defaultDaysInMonth = getDaysInMonth(payMonth);
  const daysInMonth = Math.max(1, normalizeInteger(payload.daysInMonth, defaultDaysInMonth) || defaultDaysInMonth);

  let paidDays = normalizeInteger(payload.paidDays, daysInMonth);
  if (!Number.isFinite(paidDays) || paidDays <= 0) paidDays = daysInMonth;
  paidDays = Math.min(daysInMonth, Math.max(0, paidDays));

  let lopDays = normalizeInteger(payload.lopDays, Math.max(0, daysInMonth - paidDays));
  lopDays = Math.max(0, Math.min(daysInMonth, lopDays));

  if (lopDays > daysInMonth - paidDays) {
    paidDays = Math.max(0, daysInMonth - lopDays);
  } else {
    lopDays = Math.max(0, daysInMonth - paidDays);
  }

  const monthlyFixedEarnings =
    basicSalary + hra + allowances + specialAllowance + conveyanceAllowance + medicalAllowance;

  const perDayEarnings = daysInMonth > 0 ? monthlyFixedEarnings / daysInMonth : 0;
  const lopAmount = roundMoney(perDayEarnings * lopDays);

  const grossSalary = roundMoney(
    monthlyFixedEarnings - lopAmount + overtimePay + bonus + reimbursements + arrears,
  );

  const totalDeductions = roundMoney(
    tax + providentFund + esi + professionalTax + tds + loanDeduction + otherDeductions,
  );

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
  return {
    employeeId: normalizeText(payload.employeeId),
    employeeName: normalizeText(payload.employeeName),
    department: normalizeText(payload.department),
    roleDesignation: normalizeText(payload.roleDesignation),
    payMonth: normalizePayMonth(payload.payMonth),
    ...computePayrollAmounts(payload),
    paymentDate: normalizeText(payload.paymentDate),
    paymentMode: normalizeText(payload.paymentMode) || 'Bank Transfer',
    bankReference: normalizeText(payload.bankReference),
    status: normalizeText(payload.status) || 'Pending',
    notes: normalizeText(payload.notes),
  };
}

function parsePayrollCodeNumber(payrollCode) {
  const match = normalizeText(payrollCode).toUpperCase().match(/(\d+)$/);
  return match ? Number(match[1]) : 0;
}

function formatPayrollCode(value) {
  return `PAY-${String(value).padStart(5, '0')}`;
}

async function getLatestPayrollCode(client = pool, { forUpdate = false } = {}) {
  const result = await client.query(`SELECT payroll_code FROM payroll_records ORDER BY id DESC LIMIT 1 ${forUpdate ? 'FOR UPDATE' : ''}`);
  return result.rows[0]?.payroll_code || '';
}

async function getNextPayrollCode(client = pool, options = {}) {
  const latestCode = await getLatestPayrollCode(client, options);
  return formatPayrollCode(parsePayrollCodeNumber(latestCode) + 1);
}

function mapPayrollRow(row) {
  const computed = computePayrollAmounts({
    basicSalary: row.basic_salary,
    hra: row.hra,
    allowances: row.allowances,
    specialAllowance: row.special_allowance,
    conveyanceAllowance: row.conveyance_allowance,
    medicalAllowance: row.medical_allowance,
    overtimePay: row.overtime_pay,
    bonus: row.bonus,
    reimbursements: row.reimbursements,
    arrears: row.arrears,
    daysInMonth: row.days_in_month,
    paidDays: row.paid_days,
    lopDays: row.lop_days,
    payMonth: row.pay_month,
    tax: row.tax,
    providentFund: row.provident_fund,
    esi: row.esi,
    professionalTax: row.professional_tax,
    tds: row.tds,
    loanDeduction: row.loan_deduction,
    otherDeductions: row.other_deductions,
    employerPf: row.employer_pf,
    employerEsi: row.employer_esi,
  });

  return {
    id: row.id,
    payrollCode: row.payroll_code,
    employeeId: row.employee_id,
    employeeName: row.employee_name,
    department: row.department,
    roleDesignation: row.role_designation,
    payMonth: row.pay_month,
    basicSalary: Number(row.basic_salary || 0),
    hra: Number(row.hra || computed.hra),
    allowances: Number(row.allowances || computed.allowances),
    specialAllowance: Number(row.special_allowance || computed.specialAllowance),
    conveyanceAllowance: Number(row.conveyance_allowance || computed.conveyanceAllowance),
    medicalAllowance: Number(row.medical_allowance || computed.medicalAllowance),
    overtimePay: Number(row.overtime_pay || computed.overtimePay),
    bonus: Number(row.bonus || computed.bonus),
    reimbursements: Number(row.reimbursements || computed.reimbursements),
    arrears: Number(row.arrears || computed.arrears),
    daysInMonth: Number(row.days_in_month || computed.daysInMonth),
    paidDays: Number(row.paid_days || computed.paidDays),
    lopDays: Number(row.lop_days || computed.lopDays),
    lopAmount: Number(row.lop_amount || computed.lopAmount),
    grossSalary: Number(row.gross_salary || computed.grossSalary),
    tax: Number(row.tax || computed.tax),
    providentFund: Number(row.provident_fund || computed.providentFund),
    esi: Number(row.esi || computed.esi),
    professionalTax: Number(row.professional_tax || computed.professionalTax),
    tds: Number(row.tds || computed.tds),
    loanDeduction: Number(row.loan_deduction || computed.loanDeduction),
    otherDeductions: Number(row.other_deductions || computed.otherDeductions),
    totalDeductions: Number(row.total_deductions || computed.totalDeductions),
    netSalary: Number(row.net_salary || computed.netSalary),
    employerPf: Number(row.employer_pf || computed.employerPf),
    employerEsi: Number(row.employer_esi || computed.employerEsi),
    totalCtc: Number(row.total_ctc || computed.totalCtc),
    paymentDate: row.payment_date,
    paymentMode: row.payment_mode || 'Bank Transfer',
    bankReference: row.bank_reference || '',
    status: row.status,
    notes: row.notes || '',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function fetchPayrollRecords(req, res) {
  try {
    const result = await pool.query(`SELECT * FROM payroll_records ORDER BY id DESC`);
    return res.status(200).json({ status: 'OK', data: result.rows.map(mapPayrollRow) });
  } catch (error) {
    console.error('Fetch payroll records error:', error);
    return res.status(500).json({ status: 'ERROR', message: 'Error fetching payroll records', error: error.message });
  }
}

async function fetchNextPayrollCode(req, res) {
  try {
    const payrollCode = await getNextPayrollCode();
    return res.status(200).json({ status: 'OK', data: { payrollCode } });
  } catch (error) {
    console.error('Fetch next payroll code error:', error);
    return res.status(500).json({ status: 'ERROR', message: 'Error fetching next payroll code', error: error.message });
  }
}

async function createPayrollRecord(req, res) {
  const client = await pool.connect();
  try {
    const payload = normalizePayrollPayload(req.body || {});
    if (!payload.employeeId || !payload.employeeName || !payload.payMonth) {
      return res.status(400).json({ status: 'ERROR', message: 'employeeId, employeeName and payMonth are required' });
    }

    await client.query('BEGIN');
    const payrollCode = await getNextPayrollCode(client, { forUpdate: true });

    const result = await client.query(
      `INSERT INTO payroll_records (
        payroll_code, employee_id, employee_name, department, role_designation, pay_month,
        basic_salary, hra, allowances, special_allowance, conveyance_allowance, medical_allowance,
        overtime_pay, bonus, reimbursements, arrears, days_in_month, paid_days, lop_days, lop_amount,
        gross_salary, tax, provident_fund, esi, professional_tax, tds, loan_deduction, other_deductions,
        total_deductions, net_salary, employer_pf, employer_esi, total_ctc, payment_date, payment_mode,
        bank_reference, status, notes, created_by
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27,$28,$29,$30,$31,$32,$33,$34::date,$35,$36,$37,$38,$39
      ) RETURNING *`,
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
        payload.paymentDate || null,
        payload.paymentMode,
        payload.bankReference || null,
        payload.status,
        payload.notes || null,
        req.user?.id || null,
      ],
    );

    await client.query('COMMIT');
    return res.status(201).json({ status: 'OK', message: 'Payroll record created', data: mapPayrollRow(result.rows[0]) });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Create payroll record error:', error);
    return res.status(500).json({ status: 'ERROR', message: 'Error creating payroll record', error: error.message });
  } finally {
    client.release();
  }
}

async function updatePayrollRecord(req, res) {
  try {
    const { payrollCode } = req.params;
    const payload = normalizePayrollPayload(req.body || {});

    const result = await pool.query(
      `UPDATE payroll_records SET employee_id=$2, employee_name=$3, department=$4, role_designation=$5, pay_month=$6,
        basic_salary=$7, hra=$8, allowances=$9, special_allowance=$10, conveyance_allowance=$11,
        medical_allowance=$12, overtime_pay=$13, bonus=$14, reimbursements=$15, arrears=$16,
        days_in_month=$17, paid_days=$18, lop_days=$19, lop_amount=$20, gross_salary=$21,
        tax=$22, provident_fund=$23, esi=$24, professional_tax=$25, tds=$26, loan_deduction=$27,
        other_deductions=$28, total_deductions=$29, net_salary=$30, employer_pf=$31, employer_esi=$32,
        total_ctc=$33, payment_date=$34::date, payment_mode=$35, bank_reference=$36, status=$37,
        notes=$38, updated_by=$39, updated_at=CURRENT_TIMESTAMP WHERE payroll_code=$1 RETURNING *`,
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
        payload.paymentDate || null,
        payload.paymentMode,
        payload.bankReference || null,
        payload.status,
        payload.notes || null,
        req.user?.id || null,
      ],
    );

    if (!result.rows.length) return res.status(404).json({ status: 'ERROR', message: 'Payroll record not found' });
    return res.status(200).json({ status: 'OK', message: 'Payroll updated', data: mapPayrollRow(result.rows[0]) });
  } catch (error) {
    console.error('Update payroll record error:', error);
    return res.status(500).json({ status: 'ERROR', message: 'Error updating payroll record', error: error.message });
  }
}

async function deletePayrollRecord(req, res) {
  try {
    const { payrollCode } = req.params;
    const result = await pool.query(`DELETE FROM payroll_records WHERE payroll_code=$1 RETURNING id`, [payrollCode]);
    if (!result.rows.length) return res.status(404).json({ status: 'ERROR', message: 'Payroll record not found' });
    return res.status(200).json({ status: 'OK', message: 'Payroll record deleted' });
  } catch (error) {
    console.error('Delete payroll record error:', error);
    return res.status(500).json({ status: 'ERROR', message: 'Error deleting payroll record', error: error.message });
  }
}

function normalizePayMonth(value) {
  const text = normalizeText(value);
  if (!text) return '';
  if (/^\d{4}-\d{2}$/.test(text)) return text;
  const date = new Date(text);
  if (Number.isNaN(date.getTime())) return '';
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function roundMoney(value) {
  const parsed = Number(value);
  return Math.round((Number.isFinite(parsed) ? parsed : 0) * 100) / 100;
}

function getDaysInMonth(payMonth) {
  const [yearText, monthText] = String(payMonth || '').split('-');
  const year = Number(yearText);
  const month = Number(monthText);
  if (!Number.isFinite(year) || !Number.isFinite(month) || month < 1 || month > 12) return 30;
  return new Date(year, month, 0).getDate();
}

async function generatePayrollForMonth(req, res) {
  const client = await pool.connect();
  try {
    const payMonth = normalizePayMonth(req.body?.payMonth);
    const overwriteExisting = Boolean(req.body?.overwriteExisting);

    if (!payMonth) {
      return res.status(400).json({ status: 'ERROR', message: 'Valid pay month is required (YYYY-MM)' });
    }

    await client.query('BEGIN');

    const employeesResult = await client.query(
      `SELECT employee_id, full_name, department, role_designation, salary FROM employees WHERE LOWER(COALESCE(status, '')) = 'active' ORDER BY id ASC`,
    );

    if (!employeesResult.rows.length) {
      await client.query('COMMIT');
      return res.status(200).json({
        status: 'OK',
        message: 'No active employees found for payroll generation',
        data: { payMonth, generatedCount: 0, skippedCount: 0, records: [] },
      });
    }

    const existingResult = await client.query(
      `SELECT employee_id FROM payroll_records WHERE pay_month = $1`,
      [payMonth],
    );
    const existingEmployeeIds = new Set(existingResult.rows.map((r) => String(r.employee_id)));

    if (overwriteExisting && existingEmployeeIds.size) {
      await client.query(`DELETE FROM payroll_records WHERE pay_month = $1`, [payMonth]);
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

      const basicSalary = roundMoney(employee.salary || 0);
      const hra = roundMoney(basicSalary * 0.4);
      const allowances = roundMoney(basicSalary * 0.15);
      const specialAllowance = roundMoney(basicSalary * 0.1);
      const computed = computePayrollAmounts({
        basicSalary,
        hra,
        allowances,
        specialAllowance,
        payMonth,
        daysInMonth: getDaysInMonth(payMonth),
        paidDays: getDaysInMonth(payMonth),
        lopDays: 0,
      });
      const daysInMonth = getDaysInMonth(payMonth);

      const salaryCodeResult = await client.query(
        `SELECT payroll_code FROM payroll_records ORDER BY id DESC LIMIT 1 FOR UPDATE`,
      );
      const latestCode = salaryCodeResult.rows[0]?.payroll_code || '';
      const match = String(latestCode).match(/(\d+)$/);
      const nextCode = `PAY-${String((match ? Number(match[1]) : 0) + 1).padStart(5, '0')}`;

      const inserted = await client.query(
        `INSERT INTO payroll_records (
          payroll_code, employee_id, employee_name, department, role_designation, pay_month,
          basic_salary, hra, allowances, special_allowance, conveyance_allowance, medical_allowance,
          overtime_pay, bonus, reimbursements, arrears, days_in_month, paid_days, lop_days, lop_amount,
          gross_salary, tax, provident_fund, esi, professional_tax, tds, loan_deduction, other_deductions,
          total_deductions, net_salary, employer_pf, employer_esi, total_ctc, payment_mode, status, created_by
        ) VALUES (
          $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27,$28,$29,$30,$31,$32,$33,$34,$35,$36
        ) RETURNING *`,
        [
          nextCode,
          employeeId,
          String(employee.full_name || '').trim(),
          String(employee.department || '').trim(),
          String(employee.role_designation || '').trim(),
          payMonth,
          computed.basicSalary,
          computed.hra,
          computed.allowances,
          computed.specialAllowance,
          computed.conveyanceAllowance,
          computed.medicalAllowance,
          computed.overtimePay,
          computed.bonus,
          computed.reimbursements,
          computed.arrears,
          computed.daysInMonth,
          computed.paidDays,
          computed.lopDays,
          computed.lopAmount,
          computed.grossSalary,
          computed.tax,
          computed.providentFund,
          computed.esi,
          computed.professionalTax,
          computed.tds,
          computed.loanDeduction,
          computed.otherDeductions,
          computed.totalDeductions,
          computed.netSalary,
          computed.employerPf,
          computed.employerEsi,
          computed.totalCtc,
          'Bank Transfer',
          'Pending',
          req.user?.id || null,
        ],
      );

      generatedRows.push(mapPayrollRow(inserted.rows[0]));
    }

    await client.query('COMMIT');

    return res.status(201).json({
      status: 'OK',
      message: 'Monthly payroll generated successfully',
      data: { payMonth, generatedCount: generatedRows.length, skippedCount, records: generatedRows },
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Generate payroll for month error:', error);
    return res.status(500).json({ status: 'ERROR', message: 'Error generating monthly payroll', error: error.message });
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
