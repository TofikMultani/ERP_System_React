export const emptyLeaveForm = {
  leaveCode: "",
  employeeId: "",
  name: "",
  dept: "",
  type: "Casual",
  from: "",
  to: "",
  days: "",
  reason: "",
  status: "Pending",
};

const requiredFields = [
  "employeeId",
  "name",
  "dept",
  "type",
  "from",
  "to",
  "days",
  "status",
];

export function calculateLeaveDays(fromDate, toDate) {
  const start = new Date(fromDate);
  const end = new Date(toDate);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return "";
  }

  const startValue = Date.UTC(start.getFullYear(), start.getMonth(), start.getDate());
  const endValue = Date.UTC(end.getFullYear(), end.getMonth(), end.getDate());

  if (endValue < startValue) {
    return "";
  }

  const diffDays = Math.floor((endValue - startValue) / (1000 * 60 * 60 * 24)) + 1;
  return String(diffDays);
}

export function normalizeLeavePayload(rawLeave) {
  const normalized = { ...emptyLeaveForm };

  Object.entries(rawLeave || {}).forEach(([key, value]) => {
    if (!(key in normalized)) {
      return;
    }

    normalized[key] = String(value ?? "").trim();
  });

  if (normalized.from && normalized.to) {
    const autoDays = calculateLeaveDays(normalized.from, normalized.to);
    if (autoDays) {
      normalized.days = autoDays;
    }
  }

  return normalized;
}

export function isValidLeavePayload(leaveRecord) {
  return requiredFields.every((field) => String(leaveRecord[field] ?? "").trim());
}

export function toLeaveApiPayload(leaveRecord) {
  return {
    employeeId: String(leaveRecord.employeeId || "").trim(),
    name: String(leaveRecord.name || "").trim(),
    dept: String(leaveRecord.dept || "").trim(),
    type: String(leaveRecord.type || "").trim(),
    from: String(leaveRecord.from || "").trim(),
    to: String(leaveRecord.to || "").trim(),
    days: Number(leaveRecord.days) || 0,
    reason: String(leaveRecord.reason || "").trim(),
    status: String(leaveRecord.status || "").trim() || "Pending",
  };
}
