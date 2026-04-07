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
