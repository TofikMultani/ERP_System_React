import * as XLSX from "xlsx";

export const emptyForm = {
  employeeId: "",
  name: "",
  dept: "",
  role: "",
  email: "",
  phone: "",
  joined: "",
  status: "",
  salary: "",
  address: "",
  manager: "",
};

export const requiredEmployeeFields = [
  "name",
  "phone",
  "email",
  "dept",
  "role",
  "joined",
  "status",
];

export const excelFieldMap = {
  employeeid: "employeeId",
  empid: "employeeId",
  id: "employeeId",
  fullname: "name",
  name: "name",
  phone: "phone",
  phonenumber: "phone",
  mobile: "phone",
  mobilenumber: "phone",
  email: "email",
  emailaddress: "email",
  department: "dept",
  dept: "dept",
  role: "role",
  designation: "role",
  roledesignation: "role",
  datejoined: "joined",
  joiningdate: "joined",
  joined: "joined",
  status: "status",
  salary: "salary",
  address: "address",
  reportingmanager: "manager",
  manager: "manager",
};

export function normalizeDateValue(value) {
  if (value === null || value === undefined || value === "") {
    return "";
  }

  if (typeof value === "number") {
    const parsedDate = XLSX.SSF.parse_date_code(value);
    if (!parsedDate) {
      return "";
    }

    const month = String(parsedDate.m).padStart(2, "0");
    const day = String(parsedDate.d).padStart(2, "0");
    return `${parsedDate.y}-${month}-${day}`;
  }

  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString().slice(0, 10);
  }

  const rawText = String(value).trim();
  if (!rawText) {
    return "";
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(rawText)) {
    return rawText;
  }

  const fallbackDate = new Date(rawText);
  if (!Number.isNaN(fallbackDate.getTime())) {
    return fallbackDate.toISOString().slice(0, 10);
  }

  return "";
}

export function formatJoinedForDisplay(value) {
  const normalizedDate = normalizeDateValue(value);
  if (!normalizedDate) {
    return "—";
  }

  const [year, month, day] = normalizedDate.split("-").map(Number);
  const date = new Date(year, month - 1, day);

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function normalizeEmployeePayload(rawEmployee) {
  const normalized = { ...emptyForm };

  Object.entries(rawEmployee || {}).forEach(([key, value]) => {
    const normalizedKey = String(key).toLowerCase().replace(/[^a-z0-9]/g, "");
    const targetField = excelFieldMap[normalizedKey] || key;

    if (!(targetField in normalized)) {
      return;
    }

    normalized[targetField] =
      targetField === "joined"
        ? normalizeDateValue(value)
        : String(value ?? "").trim();
  });

  return normalized;
}

export function isValidEmployeePayload(employee) {
  return requiredEmployeeFields.every((fieldKey) =>
    String(employee[fieldKey] ?? "").trim(),
  );
}

export function toApiPayload(employee) {
  return {
    employeeId: String(employee.employeeId || "").trim(),
    name: String(employee.name || "").trim(),
    phone: String(employee.phone || "").trim(),
    email: String(employee.email || "").trim(),
    dept: String(employee.dept || "").trim(),
    role: String(employee.role || "").trim(),
    joined: String(employee.joined || "").trim(),
    status: String(employee.status || "").trim(),
    salary: String(employee.salary || "").trim(),
    address: String(employee.address || "").trim(),
    manager: String(employee.manager || "").trim(),
  };
}
