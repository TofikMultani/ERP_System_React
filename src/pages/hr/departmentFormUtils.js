export const emptyDepartmentForm = {
  code: "",
  name: "",
  head: "",
  headEmail: "",
  headPhone: "",
  employees: "0",
  budget: "",
  location: "",
  description: "",
  status: "Active",
};

const requiredFields = ["name", "head", "status"];

export function normalizeDepartmentPayload(rawDepartment) {
  const normalized = { ...emptyDepartmentForm };

  Object.entries(rawDepartment || {}).forEach(([key, value]) => {
    if (!(key in normalized)) {
      return;
    }

    normalized[key] = String(value ?? "").trim();
  });

  if (!normalized.employees) {
    normalized.employees = "0";
  }

  return normalized;
}

export function isValidDepartmentPayload(department) {
  return requiredFields.every((key) => String(department[key] ?? "").trim());
}

export function toDepartmentApiPayload(department) {
  const employees = Number(department.employees);

  return {
    code: String(department.code || "").trim(),
    name: String(department.name || "").trim(),
    head: String(department.head || "").trim(),
    headEmail: String(department.headEmail || "").trim(),
    headPhone: String(department.headPhone || "").trim(),
    employees: Number.isFinite(employees) ? Math.max(0, Math.trunc(employees)) : 0,
    budget: String(department.budget || "").trim(),
    location: String(department.location || "").trim(),
    description: String(department.description || "").trim(),
    status: String(department.status || "").trim() || "Active",
  };
}
