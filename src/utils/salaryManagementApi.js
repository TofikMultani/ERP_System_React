import { getStoredToken } from "./auth.js";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

async function apiRequest(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Request failed");
  }

  return data;
}

function authHeaders() {
  const token = getStoredToken();

  return token
    ? {
        Authorization: `Bearer ${token}`,
      }
    : {};
}

export async function fetchSalaryRecords() {
  const result = await apiRequest(`/salary-management`, {
    headers: authHeaders(),
  });

  return result.data || [];
}

export async function fetchNextSalaryCode() {
  const result = await apiRequest(`/salary-management/next-code`, {
    headers: authHeaders(),
  });

  return result.data?.salaryCode || "";
}

export async function createSalaryRecord(payload) {
  const result = await apiRequest(`/salary-management`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });

  return result.data;
}

export async function updateSalaryRecord(salaryCode, payload) {
  const result = await apiRequest(`/salary-management/${encodeURIComponent(salaryCode)}`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });

  return result.data;
}

export async function deleteSalaryRecord(salaryCode) {
  const result = await apiRequest(`/salary-management/${encodeURIComponent(salaryCode)}`, {
    method: "DELETE",
    headers: authHeaders(),
  });

  return result.data;
}

export async function generateSalaryForMonth(payload) {
  const result = await apiRequest(`/salary-management/generate-month`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });

  return result.data;
}
