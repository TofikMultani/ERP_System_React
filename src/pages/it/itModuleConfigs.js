import {
  fetchItSystems,
  fetchNextItSystemCode,
  createItSystem,
  updateItSystem,
  deleteItSystem,
  fetchItAssets,
  fetchNextItAssetCode,
  createItAsset,
  updateItAsset,
  deleteItAsset,
  fetchItMaintenance,
  fetchNextItMaintenanceCode,
  createItMaintenance,
  updateItMaintenance,
  deleteItMaintenance,
  fetchItDashboard,
} from '../../utils/itApi';

function formatDate(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return String(value);
  }
  return date.toISOString().split('T')[0];
}

export const itSystemsConfig = {
  pageTitle: 'IT Systems',
  label: 'System',
  labelPlural: 'Systems',
  listTitle: 'Systems List',
  addLabel: '+ Add System',
  searchPlaceholder: 'Search by code, name, IP, or environment...',
  codeField: 'code',
  routeParam: 'systemCode',
  listRoute: '/it/systems',
  newRoute: '/it/systems/new',
  editRoute: (code) => `/it/systems/${code}/edit`,
  pageSize: 15,
  statusFilters: ['All', 'Operational', 'Maintenance', 'Down'],

  columns: [
    { key: 'code', label: 'System Code', sortable: true },
    { key: 'name', label: 'System Name', sortable: true },
    { key: 'ipAddress', label: 'IP Address', sortable: true },
    { key: 'environment', label: 'Environment', sortable: true },
    { key: 'status', label: 'Status', sortable: true },
    { key: 'uptimePercent', label: 'Uptime %', sortable: true, format: (val) => `${Number(val || 0).toFixed(2)}%` },
  ],

  searchFields: ['code', 'name', 'ipAddress', 'environment', 'status'],

  fields: [
    { name: 'code', label: 'System Code', type: 'text', required: true, readOnly: true },
    { name: 'name', label: 'System Name', type: 'text', required: true, placeholder: 'Enter system name' },
    { name: 'ipAddress', label: 'IP Address', type: 'text', required: true, placeholder: '192.168.1.10' },
    { name: 'environment', label: 'Environment', type: 'select', required: true, options: ['Production', 'Staging', 'Development'] },
    { name: 'status', label: 'Status', type: 'select', required: true, options: ['Operational', 'Maintenance', 'Down'] },
    { name: 'uptimePercent', label: 'Uptime %', type: 'number', required: true, min: 0, max: 100, step: 0.01, placeholder: '99.50' },
    { name: 'lastCheckedAt', label: 'Last Checked Date', type: 'date', required: true },
  ],

  emptyForm: {
    code: '',
    name: '',
    ipAddress: '',
    environment: 'Production',
    status: 'Operational',
    uptimePercent: 99.5,
    lastCheckedAt: new Date().toISOString().split('T')[0],
  },

  fetchRows: fetchItSystems,
  fetchRow: async (code) => {
    const items = await fetchItSystems();
    const item = items.find((x) => x.code === code);
    if (!item) throw new Error('System not found');
    return item;
  },
  fetchNextCode: fetchNextItSystemCode,
  createRow: async (data) => {
    const code = await fetchNextItSystemCode();
    return createItSystem({ ...data, code });
  },
  updateRow: updateItSystem,
  deleteRow: deleteItSystem,

  rowToForm: (row) => ({
    code: row.code || '',
    name: row.name || '',
    ipAddress: row.ipAddress || '',
    environment: row.environment || 'Production',
    status: row.status || 'Operational',
    uptimePercent: Number(row.uptimePercent) || 0,
    lastCheckedAt: formatDate(row.lastCheckedAt) || new Date().toISOString().split('T')[0],
  }),

  formToRow: (form) => ({
    name: form.name,
    ipAddress: form.ipAddress,
    environment: form.environment,
    status: form.status,
    uptimePercent: Number(form.uptimePercent) || 0,
    lastCheckedAt: form.lastCheckedAt,
  }),

  buildSummary: (rows) => {
    const total = rows.length;
    const operational = rows.filter((row) => String(row.status || '').toLowerCase() === 'operational').length;
    const maintenance = rows.filter((row) => String(row.status || '').toLowerCase() === 'maintenance').length;
    const avgUptime = rows.length
      ? rows.reduce((sum, row) => sum + (Number(row.uptimePercent) || 0), 0) / rows.length
      : 0;

    return [
      { title: 'Total Systems', value: total, color: '#6366f1' },
      { title: 'Operational', value: operational, color: '#10b981' },
      { title: 'In Maintenance', value: maintenance, color: '#f59e0b' },
      { title: 'Avg Uptime', value: `${avgUptime.toFixed(2)}%`, color: '#8b5cf6' },
    ];
  },
};

export const itAssetsConfig = {
  pageTitle: 'IT Assets',
  label: 'Asset',
  labelPlural: 'Assets',
  listTitle: 'Assets Inventory',
  addLabel: '+ Add Asset',
  searchPlaceholder: 'Search by code, name, type, serial, or assignee...',
  codeField: 'code',
  routeParam: 'assetCode',
  listRoute: '/it/assets',
  newRoute: '/it/assets/new',
  editRoute: (code) => `/it/assets/${code}/edit`,
  pageSize: 15,
  statusFilters: ['All', 'Active', 'In Repair', 'Retired'],

  columns: [
    { key: 'code', label: 'Asset Code', sortable: true },
    { key: 'name', label: 'Asset Name', sortable: true },
    { key: 'assetType', label: 'Type', sortable: true },
    { key: 'serialNumber', label: 'Serial Number', sortable: true },
    { key: 'status', label: 'Status', sortable: true },
    { key: 'value', label: 'Value', sortable: true, format: (val) => `₹${Number(val || 0).toFixed(2)}` },
  ],

  searchFields: ['code', 'name', 'assetType', 'serialNumber', 'assignedTo', 'status'],

  fields: [
    { name: 'code', label: 'Asset Code', type: 'text', required: true, readOnly: true },
    { name: 'name', label: 'Asset Name', type: 'text', required: true, placeholder: 'Enter asset name' },
    { name: 'assetType', label: 'Asset Type', type: 'select', required: true, options: ['Laptop', 'Desktop', 'Server', 'Networking', 'Peripheral', 'Other'] },
    { name: 'model', label: 'Model', type: 'text', placeholder: 'Model number or name' },
    { name: 'serialNumber', label: 'Serial Number', type: 'text', required: true, placeholder: 'Enter serial number' },
    { name: 'assignedTo', label: 'Assigned To', type: 'text', placeholder: 'Employee or team name' },
    { name: 'purchaseDate', label: 'Purchase Date', type: 'date', required: true },
    { name: 'status', label: 'Status', type: 'select', required: true, options: ['Active', 'In Repair', 'Retired'] },
    { name: 'value', label: 'Asset Value', type: 'number', required: true, min: 0, step: 0.01, placeholder: '0.00' },
  ],

  emptyForm: {
    code: '',
    name: '',
    assetType: 'Laptop',
    model: '',
    serialNumber: '',
    assignedTo: '',
    purchaseDate: new Date().toISOString().split('T')[0],
    status: 'Active',
    value: 0,
  },

  fetchRows: fetchItAssets,
  fetchRow: async (code) => {
    const items = await fetchItAssets();
    const item = items.find((x) => x.code === code);
    if (!item) throw new Error('Asset not found');
    return item;
  },
  fetchNextCode: fetchNextItAssetCode,
  createRow: async (data) => {
    const code = await fetchNextItAssetCode();
    return createItAsset({ ...data, code });
  },
  updateRow: updateItAsset,
  deleteRow: deleteItAsset,

  rowToForm: (row) => ({
    code: row.code || '',
    name: row.name || '',
    assetType: row.assetType || 'Laptop',
    model: row.model || '',
    serialNumber: row.serialNumber || '',
    assignedTo: row.assignedTo || '',
    purchaseDate: formatDate(row.purchaseDate) || new Date().toISOString().split('T')[0],
    status: row.status || 'Active',
    value: Number(row.value) || 0,
  }),

  formToRow: (form) => ({
    name: form.name,
    assetType: form.assetType,
    model: form.model,
    serialNumber: form.serialNumber,
    assignedTo: form.assignedTo,
    purchaseDate: form.purchaseDate,
    status: form.status,
    value: Number(form.value) || 0,
  }),

  buildSummary: (rows) => {
    const total = rows.length;
    const active = rows.filter((row) => String(row.status || '').toLowerCase() === 'active').length;
    const retired = rows.filter((row) => String(row.status || '').toLowerCase() === 'retired').length;
    const totalValue = rows.reduce((sum, row) => sum + (Number(row.value) || 0), 0);

    return [
      { title: 'Total Assets', value: total, color: '#6366f1' },
      { title: 'Active', value: active, color: '#10b981' },
      { title: 'Retired', value: retired, color: '#ef4444' },
      { title: 'Total Value', value: `₹${totalValue.toFixed(2)}`, color: '#8b5cf6' },
    ];
  },
};

export const itMaintenanceConfig = {
  pageTitle: 'IT Maintenance',
  label: 'Maintenance Task',
  labelPlural: 'Maintenance Tasks',
  listTitle: 'Maintenance Schedule',
  addLabel: '+ Schedule Task',
  searchPlaceholder: 'Search by code, asset, type, technician, or status...',
  codeField: 'code',
  routeParam: 'maintenanceCode',
  listRoute: '/it/maintenance',
  newRoute: '/it/maintenance/new',
  editRoute: (code) => `/it/maintenance/${code}/edit`,
  pageSize: 15,
  statusFilters: ['All', 'Scheduled', 'In Progress', 'Completed', 'Cancelled'],

  columns: [
    { key: 'code', label: 'Task Code', sortable: true },
    { key: 'assetName', label: 'Asset Name', sortable: true },
    { key: 'maintenanceType', label: 'Type', sortable: true },
    { key: 'scheduledDate', label: 'Scheduled Date', sortable: true },
    { key: 'priority', label: 'Priority', sortable: true },
    { key: 'status', label: 'Status', sortable: true },
  ],

  searchFields: ['code', 'assetCode', 'assetName', 'maintenanceType', 'technician', 'status'],

  fields: [
    { name: 'code', label: 'Task Code', type: 'text', required: true, readOnly: true },
    { name: 'assetCode', label: 'Asset Code', type: 'text', placeholder: 'Optional linked asset code' },
    { name: 'assetName', label: 'Asset Name', type: 'text', required: true, placeholder: 'Enter asset name' },
    { name: 'maintenanceType', label: 'Maintenance Type', type: 'select', required: true, options: ['Software Update', 'Hardware Check', 'Firmware Update', 'Cleaning', 'Repair'] },
    { name: 'scheduledDate', label: 'Scheduled Date', type: 'date', required: true },
    { name: 'completedDate', label: 'Completed Date', type: 'date' },
    { name: 'technician', label: 'Technician', type: 'text', placeholder: 'Assigned technician' },
    { name: 'priority', label: 'Priority', type: 'select', required: true, options: ['Low', 'Medium', 'High', 'Critical'] },
    { name: 'status', label: 'Status', type: 'select', required: true, options: ['Scheduled', 'In Progress', 'Completed', 'Cancelled'] },
    { name: 'notes', label: 'Notes', type: 'textarea', placeholder: 'Add maintenance notes', fullWidth: true },
  ],

  emptyForm: {
    code: '',
    assetCode: '',
    assetName: '',
    maintenanceType: 'Software Update',
    scheduledDate: new Date().toISOString().split('T')[0],
    completedDate: '',
    technician: '',
    priority: 'Medium',
    status: 'Scheduled',
    notes: '',
  },

  fetchRows: fetchItMaintenance,
  fetchRow: async (code) => {
    const items = await fetchItMaintenance();
    const item = items.find((x) => x.code === code);
    if (!item) throw new Error('Maintenance task not found');
    return item;
  },
  fetchNextCode: fetchNextItMaintenanceCode,
  createRow: async (data) => {
    const code = await fetchNextItMaintenanceCode();
    return createItMaintenance({ ...data, code });
  },
  updateRow: updateItMaintenance,
  deleteRow: deleteItMaintenance,

  rowToForm: (row) => ({
    code: row.code || '',
    assetCode: row.assetCode || '',
    assetName: row.assetName || '',
    maintenanceType: row.maintenanceType || 'Software Update',
    scheduledDate: formatDate(row.scheduledDate) || new Date().toISOString().split('T')[0],
    completedDate: formatDate(row.completedDate) || '',
    technician: row.technician || '',
    priority: row.priority || 'Medium',
    status: row.status || 'Scheduled',
    notes: row.notes || '',
  }),

  formToRow: (form) => ({
    assetCode: form.assetCode,
    assetName: form.assetName,
    maintenanceType: form.maintenanceType,
    scheduledDate: form.scheduledDate,
    completedDate: form.completedDate || '',
    technician: form.technician,
    priority: form.priority,
    status: form.status,
    notes: form.notes,
  }),

  buildSummary: (rows) => {
    const total = rows.length;
    const scheduled = rows.filter((row) => String(row.status || '').toLowerCase() === 'scheduled').length;
    const inProgress = rows.filter((row) => String(row.status || '').toLowerCase() === 'in progress').length;
    const completed = rows.filter((row) => String(row.status || '').toLowerCase() === 'completed').length;

    return [
      { title: 'Total Tasks', value: total, color: '#6366f1' },
      { title: 'Scheduled', value: scheduled, color: '#f59e0b' },
      { title: 'In Progress', value: inProgress, color: '#3b82f6' },
      { title: 'Completed', value: completed, color: '#10b981' },
    ];
  },
};

export const itDashboardConfig = {
  fetchData: fetchItDashboard,
};
