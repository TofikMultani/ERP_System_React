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
  overtimePay: "0",
  bonus: "0",
  grossSalary: "0",
  tax: "0",
  providentFund: "0",
  otherDeductions: "0",
  totalDeductions: "0",
  netSalary: "0",
  paymentDate: "",
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

function formatMoney(value) {
  const safeValue = Number.isFinite(Number(value)) ? Number(value) : 0;
  return String(Math.max(0, safeValue));
}

export function recomputePayrollAmounts(record) {
  const basicSalary = toNumber(record.basicSalary);
  const hra = toNumber(record.hra);
  const allowances = toNumber(record.allowances);
  const overtimePay = toNumber(record.overtimePay);
  const bonus = toNumber(record.bonus);

  const tax = toNumber(record.tax);
  const providentFund = toNumber(record.providentFund);
  const otherDeductions = toNumber(record.otherDeductions);

  const grossSalary = basicSalary + hra + allowances + overtimePay + bonus;
  const totalDeductions = tax + providentFund + otherDeductions;
  const netSalary = Math.max(0, grossSalary - totalDeductions);

  return {
    ...record,
    basicSalary: formatMoney(basicSalary),
    hra: formatMoney(hra),
    allowances: formatMoney(allowances),
    overtimePay: formatMoney(overtimePay),
    bonus: formatMoney(bonus),
    grossSalary: formatMoney(grossSalary),
    tax: formatMoney(tax),
    providentFund: formatMoney(providentFund),
    otherDeductions: formatMoney(otherDeductions),
    totalDeductions: formatMoney(totalDeductions),
    netSalary: formatMoney(netSalary),
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
    overtimePay: toNumber(record.overtimePay),
    bonus: toNumber(record.bonus),
    tax: toNumber(record.tax),
    providentFund: toNumber(record.providentFund),
    otherDeductions: toNumber(record.otherDeductions),
    paymentDate: String(record.paymentDate || "").trim(),
    status: String(record.status || "").trim() || "Pending",
    notes: String(record.notes || "").trim(),
  };
}

export function formatCurrency(value) {
  const amount = toNumber(value);
  return `₹${amount.toLocaleString()}`;
}
