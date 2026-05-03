export const emptyPayrollForm = {
  payrollCode: "",
  employeeId: "",
  employeeName: "",
  department: "",
  roleDesignation: "",
  payMonth: "",
  basicSalary: "0",
  hra: "0",
  allowances: "0",
  specialAllowance: "0",
  conveyanceAllowance: "0",
  medicalAllowance: "0",
  overtimePay: "0",
  bonus: "0",
  reimbursements: "0",
  arrears: "0",
  daysInMonth: "30",
  paidDays: "30",
  lopDays: "0",
  lopAmount: "0",
  grossSalary: "0",
  tax: "0",
  providentFund: "0",
  esi: "0",
  professionalTax: "0",
  tds: "0",
  loanDeduction: "0",
  otherDeductions: "0",
  totalDeductions: "0",
  netSalary: "0",
  employerPf: "0",
  employerEsi: "0",
  totalCtc: "0",
  paymentDate: "",
  paymentMode: "Bank Transfer",
  bankReference: "",
  status: "Pending",
  notes: "",
};

const requiredFields = [
  "employeeId",
  "employeeName",
  "department",
  "roleDesignation",
  "payMonth",
  "basicSalary",
  "status",
];

export function toNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function toInteger(value, fallback = 0) {
  const parsed = Math.trunc(Number(value));
  return Number.isFinite(parsed) ? parsed : fallback;
}

function roundMoney(value) {
  return Math.round(toNumber(value) * 100) / 100;
}

function formatMoney(value) {
  const safeValue = roundMoney(value);
  return String(Math.max(0, safeValue));
}

function getDaysInMonth(payMonth) {
  const text = String(payMonth || "").trim();
  if (!/^\d{4}-\d{2}$/.test(text)) {
    return 30;
  }

  const [yearText, monthText] = text.split("-");
  const year = Number(yearText);
  const month = Number(monthText);

  if (!Number.isFinite(year) || !Number.isFinite(month) || month < 1 || month > 12) {
    return 30;
  }

  return new Date(year, month, 0).getDate();
}

export function recomputePayrollAmounts(record) {
  const basicSalary = roundMoney(record.basicSalary);
  const hra = roundMoney(record.hra);
  const allowances = roundMoney(record.allowances);
  const specialAllowance = roundMoney(record.specialAllowance);
  const conveyanceAllowance = roundMoney(record.conveyanceAllowance);
  const medicalAllowance = roundMoney(record.medicalAllowance);
  const overtimePay = roundMoney(record.overtimePay);
  const bonus = roundMoney(record.bonus);
  const reimbursements = roundMoney(record.reimbursements);
  const arrears = roundMoney(record.arrears);

  const tax = roundMoney(record.tax);
  const providentFund = roundMoney(record.providentFund);
  const esi = roundMoney(record.esi);
  const professionalTax = roundMoney(record.professionalTax);
  const tds = roundMoney(record.tds);
  const loanDeduction = roundMoney(record.loanDeduction);
  const otherDeductions = roundMoney(record.otherDeductions);

  const employerPf = roundMoney(record.employerPf);
  const employerEsi = roundMoney(record.employerEsi);

  const fallbackDaysInMonth = getDaysInMonth(record.payMonth);
  const daysInMonth = Math.max(1, toInteger(record.daysInMonth, fallbackDaysInMonth) || fallbackDaysInMonth);

  let paidDays = toInteger(record.paidDays, daysInMonth);
  if (!Number.isFinite(paidDays) || paidDays <= 0) {
    paidDays = daysInMonth;
  }
  paidDays = Math.min(daysInMonth, Math.max(0, paidDays));

  let lopDays = toInteger(record.lopDays, Math.max(0, daysInMonth - paidDays));
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
    ...record,
    basicSalary: formatMoney(basicSalary),
    hra: formatMoney(hra),
    allowances: formatMoney(allowances),
    specialAllowance: formatMoney(specialAllowance),
    conveyanceAllowance: formatMoney(conveyanceAllowance),
    medicalAllowance: formatMoney(medicalAllowance),
    overtimePay: formatMoney(overtimePay),
    bonus: formatMoney(bonus),
    reimbursements: formatMoney(reimbursements),
    arrears: formatMoney(arrears),
    daysInMonth: String(daysInMonth),
    paidDays: String(paidDays),
    lopDays: String(lopDays),
    lopAmount: formatMoney(lopAmount),
    grossSalary: formatMoney(grossSalary),
    tax: formatMoney(tax),
    providentFund: formatMoney(providentFund),
    esi: formatMoney(esi),
    professionalTax: formatMoney(professionalTax),
    tds: formatMoney(tds),
    loanDeduction: formatMoney(loanDeduction),
    otherDeductions: formatMoney(otherDeductions),
    totalDeductions: formatMoney(totalDeductions),
    netSalary: formatMoney(netSalary),
    employerPf: formatMoney(employerPf),
    employerEsi: formatMoney(employerEsi),
    totalCtc: formatMoney(totalCtc),
  };
}

export function normalizePayrollPayload(rawPayroll) {
  const normalized = { ...emptyPayrollForm };

  Object.entries(rawPayroll || {}).forEach(([key, value]) => {
    if (!(key in normalized)) {
      return;
    }

    normalized[key] = String(value ?? "").trim();
  });

  return recomputePayrollAmounts(normalized);
}

export function isValidPayrollPayload(record) {
  return requiredFields.every((field) => String(record[field] ?? "").trim());
}

export function toPayrollApiPayload(record) {
  return {
    employeeId: String(record.employeeId || "").trim(),
    employeeName: String(record.employeeName || "").trim(),
    department: String(record.department || "").trim(),
    roleDesignation: String(record.roleDesignation || "").trim(),
    payMonth: String(record.payMonth || "").trim(),
    basicSalary: toNumber(record.basicSalary),
    hra: toNumber(record.hra),
    allowances: toNumber(record.allowances),
    specialAllowance: toNumber(record.specialAllowance),
    conveyanceAllowance: toNumber(record.conveyanceAllowance),
    medicalAllowance: toNumber(record.medicalAllowance),
    overtimePay: toNumber(record.overtimePay),
    bonus: toNumber(record.bonus),
    reimbursements: toNumber(record.reimbursements),
    arrears: toNumber(record.arrears),
    daysInMonth: toInteger(record.daysInMonth, 30),
    paidDays: toInteger(record.paidDays, 30),
    lopDays: toInteger(record.lopDays, 0),
    tax: toNumber(record.tax),
    providentFund: toNumber(record.providentFund),
    esi: toNumber(record.esi),
    professionalTax: toNumber(record.professionalTax),
    tds: toNumber(record.tds),
    loanDeduction: toNumber(record.loanDeduction),
    otherDeductions: toNumber(record.otherDeductions),
    employerPf: toNumber(record.employerPf),
    employerEsi: toNumber(record.employerEsi),
    paymentDate: String(record.paymentDate || "").trim(),
    paymentMode: String(record.paymentMode || "").trim() || "Bank Transfer",
    bankReference: String(record.bankReference || "").trim(),
    status: String(record.status || "").trim() || "Pending",
    notes: String(record.notes || "").trim(),
  };
}

export function formatCurrency(value) {
  const amount = toNumber(value);
  return `₹${amount.toLocaleString()}`;
}
