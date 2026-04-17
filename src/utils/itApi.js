import { getStoredToken } from './auth';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

async function request(endpoint, options = {}) {
  const token = getStoredToken();
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}/it${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorText = await response.text();
    try {
      const errorData = JSON.parse(errorText);
      throw new Error(errorData.message || `HTTP ${response.status}`);
    } catch {
      throw new Error(`HTTP ${response.status}: ${errorText.substring(0, 120)}`);
    }
  }

  const text = await response.text();
  if (!text) {
    return { status: 'OK', data: [] };
  }

  return JSON.parse(text);
}

export async function fetchItSystems() {
  const result = await request('/systems');
  return (result.data || []).map((system) => ({
    id: system.id,
    code: system.systemCode,
    name: system.name,
    ipAddress: system.ipAddress,
    environment: system.environment,
    status: system.status,
    uptimePercent: Number(system.uptimePercent || 0),
    lastCheckedAt: system.lastCheckedAt,
  }));
}

export async function fetchNextItSystemCode() {
  const result = await request('/systems/next-code');
  return result.code;
}

export async function createItSystem(data) {
  const result = await request('/systems', {
    method: 'POST',
    body: JSON.stringify({
      name: data.name,
      ipAddress: data.ipAddress,
      environment: data.environment,
      status: data.status,
      uptimePercent: data.uptimePercent,
      lastCheckedAt: data.lastCheckedAt,
      notes: data.notes || '',
    }),
  });

  return result.data;
}

export async function updateItSystem(systemCode, data) {
  const result = await request(`/systems/${systemCode}`, {
    method: 'PATCH',
    body: JSON.stringify({
      name: data.name,
      ipAddress: data.ipAddress,
      environment: data.environment,
      status: data.status,
      uptimePercent: data.uptimePercent,
      lastCheckedAt: data.lastCheckedAt,
      notes: data.notes || '',
    }),
  });

  return result.data;
}

export async function deleteItSystem(systemCode) {
  await request(`/systems/${systemCode}`, {
    method: 'DELETE',
  });
}

export async function fetchItAssets() {
  const result = await request('/assets');
  return (result.data || []).map((asset) => ({
    id: asset.id,
    code: asset.assetCode,
    name: asset.name,
    assetType: asset.assetType,
    model: asset.model,
    serialNumber: asset.serialNumber,
    assignedTo: asset.assignedTo,
    purchaseDate: asset.purchaseDate,
    status: asset.status,
    value: Number(asset.value || 0),
  }));
}

export async function fetchNextItAssetCode() {
  const result = await request('/assets/next-code');
  return result.code;
}

export async function createItAsset(data) {
  const result = await request('/assets', {
    method: 'POST',
    body: JSON.stringify({
      name: data.name,
      assetType: data.assetType,
      model: data.model,
      serialNumber: data.serialNumber,
      assignedTo: data.assignedTo,
      purchaseDate: data.purchaseDate,
      status: data.status,
      value: data.value,
      notes: data.notes || '',
    }),
  });

  return result.data;
}

export async function updateItAsset(assetCode, data) {
  const result = await request(`/assets/${assetCode}`, {
    method: 'PATCH',
    body: JSON.stringify({
      name: data.name,
      assetType: data.assetType,
      model: data.model,
      serialNumber: data.serialNumber,
      assignedTo: data.assignedTo,
      purchaseDate: data.purchaseDate,
      status: data.status,
      value: data.value,
      notes: data.notes || '',
    }),
  });

  return result.data;
}

export async function deleteItAsset(assetCode) {
  await request(`/assets/${assetCode}`, {
    method: 'DELETE',
  });
}

export async function fetchItMaintenance() {
  const result = await request('/maintenance');
  return (result.data || []).map((task) => ({
    id: task.id,
    code: task.maintenanceCode,
    assetCode: task.assetCode,
    assetName: task.assetName,
    maintenanceType: task.maintenanceType,
    scheduledDate: task.scheduledDate,
    completedDate: task.completedDate,
    technician: task.technician,
    priority: task.priority,
    status: task.status,
  }));
}

export async function fetchNextItMaintenanceCode() {
  const result = await request('/maintenance/next-code');
  return result.code;
}

export async function createItMaintenance(data) {
  const result = await request('/maintenance', {
    method: 'POST',
    body: JSON.stringify({
      assetCode: data.assetCode,
      assetName: data.assetName,
      maintenanceType: data.maintenanceType,
      scheduledDate: data.scheduledDate,
      completedDate: data.completedDate,
      technician: data.technician,
      priority: data.priority,
      status: data.status,
      notes: data.notes || '',
    }),
  });

  return result.data;
}

export async function updateItMaintenance(maintenanceCode, data) {
  const result = await request(`/maintenance/${maintenanceCode}`, {
    method: 'PATCH',
    body: JSON.stringify({
      assetCode: data.assetCode,
      assetName: data.assetName,
      maintenanceType: data.maintenanceType,
      scheduledDate: data.scheduledDate,
      completedDate: data.completedDate,
      technician: data.technician,
      priority: data.priority,
      status: data.status,
      notes: data.notes || '',
    }),
  });

  return result.data;
}

export async function deleteItMaintenance(maintenanceCode) {
  await request(`/maintenance/${maintenanceCode}`, {
    method: 'DELETE',
  });
}

export async function fetchItDashboard() {
  const result = await request('/dashboard');
  return result.data || {};
}
