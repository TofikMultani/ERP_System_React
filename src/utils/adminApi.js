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

export async function fetchPublicModules() {
  const result = await apiRequest(`/modules`);
  return result.data || [];
}

export async function submitAccessRequest(payload) {
  const result = await apiRequest(`/access-requests`, {
    method: "POST",
    body: JSON.stringify(payload),
  });

  return result.data;
}

export async function fetchAdminModules() {
  const result = await apiRequest(`/admin/modules?includeInactive=true`, {
    headers: authHeaders(),
  });

  return result.data || [];
}

export async function patchAdminModule(moduleKey, payload) {
  const result = await apiRequest(`/admin/modules/${encodeURIComponent(moduleKey)}`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });

  return result.data;
}

export async function fetchAdminAccessRequests() {
  const result = await apiRequest(`/admin/access-requests`, {
    headers: authHeaders(),
  });

  return result.data || [];
}

export async function patchAdminAccessRequestStatus(requestId, payload) {
  const result = await apiRequest(
    `/admin/access-requests/${encodeURIComponent(requestId)}/status`,
    {
      method: "PATCH",
      headers: authHeaders(),
      body: JSON.stringify(payload),
    },
  );

  return result.data;
}

export async function fetchAdminPaymentProvisioningRequests() {
  const result = await apiRequest(`/admin/access-requests/payment-provisioning`, {
    headers: authHeaders(),
  });

  return result.data || [];
}

export async function generateAdminAccessCredentials(requestId) {
  const result = await apiRequest(
    `/admin/access-requests/${encodeURIComponent(requestId)}/generate-credentials`,
    {
      method: "POST",
      headers: authHeaders(),
    },
  );

  return result.data;
}

export async function fetchActionRequestByToken(token) {
  const result = await apiRequest(
    `/access-requests/action/${encodeURIComponent(token)}`,
  );

  return result.data;
}

export async function cancelRequestByToken(token) {
  const result = await apiRequest(
    `/access-requests/action/${encodeURIComponent(token)}/cancel`,
    {
      method: "POST",
    },
  );

  return result.data;
}

export async function createPaymentOrderByToken(token) {
  const result = await apiRequest(
    `/access-requests/action/${encodeURIComponent(token)}/create-order`,
    {
      method: "POST",
    },
  );

  return result.data;
}

export async function verifyPaymentByToken(token, payload) {
  const result = await apiRequest(
    `/access-requests/action/${encodeURIComponent(token)}/verify-payment`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );

  return result.data;
}

export async function fetchMyUsers() {
  const result = await apiRequest(`/users/my-users`, {
    headers: authHeaders(),
  });

  return result.data || [];
}

export async function createMyUser(payload) {
  const result = await apiRequest(`/users/my-users`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });

  return result.data;
}

export async function updateMyUser(userId, payload) {
  const result = await apiRequest(`/users/my-users/${encodeURIComponent(userId)}`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });

  return result.data;
}

export async function deleteMyUser(userId) {
  const result = await apiRequest(`/users/my-users/${encodeURIComponent(userId)}`, {
    method: "DELETE",
    headers: authHeaders(),
  });

  return result.data;
}

export async function fetchEmployees() {
  const result = await apiRequest(`/employees`, {
    headers: authHeaders(),
  });

  return result.data || [];
}

export async function fetchNextEmployeeId() {
  const result = await apiRequest(`/employees/next-id`, {
    headers: authHeaders(),
  });

  return result.data?.employeeId || "";
}

export async function createEmployee(payload) {
  const result = await apiRequest(`/employees`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });

  return result.data;
}

export async function updateEmployee(employeeId, payload) {
  const result = await apiRequest(`/employees/${encodeURIComponent(employeeId)}`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });

  return result.data;
}

export async function deleteEmployee(employeeId) {
  const result = await apiRequest(`/employees/${encodeURIComponent(employeeId)}`, {
    method: "DELETE",
    headers: authHeaders(),
  });

  return result.data;
}

export async function importEmployees(payload) {
  const result = await apiRequest(`/employees/import`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });

  return result.data;
}
