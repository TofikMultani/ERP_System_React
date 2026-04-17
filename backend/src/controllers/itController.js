/* eslint-disable no-undef */
/* eslint-env node */
const pool = require('../config/database');

function normalizeText(value) {
  return String(value ?? '').trim();
}

function normalizeDate(value, fallback = undefined) {
  const text = String(value ?? '').trim();
  if (!text) {
    return fallback;
  }
  return text;
}

function normalizeNullableDate(value) {
  const text = String(value ?? '').trim();
  return text || null;
}

function normalizeNumber(value) {
  const parsed = Number(String(value ?? '').replace(/[^\d.-]/g, ''));
  return Number.isFinite(parsed) ? parsed : 0;
}

function normalizeInteger(value) {
  return Math.trunc(normalizeNumber(value));
}

function formatCode(prefix, value) {
  return `${prefix}-${String(value).padStart(5, '0')}`;
}

function parseCodeNumber(code) {
  const match = String(code || '').trim().toUpperCase().match(/(\d+)$/);
  return match ? Number(match[1]) : 0;
}

async function getNextCode(client, tableName, codeColumn, prefix) {
  const result = await client.query(
    `
      SELECT ${codeColumn} AS code
      FROM ${tableName}
      ORDER BY id DESC
      LIMIT 1
      FOR UPDATE
    `,
  );

  return formatCode(prefix, parseCodeNumber(result.rows[0]?.code) + 1);
}

function createCrudHandlers(config) {
  function mapRow(row) {
    return config.mapRow(row);
  }

  async function fetchItems(req, res) {
    try {
      const result = await pool.query(`SELECT * FROM ${config.tableName} ORDER BY id DESC`);

      res.status(200).json({
        status: 'OK',
        data: result.rows.map(mapRow),
      });
    } catch (error) {
      console.error(`Fetch ${config.label} error:`, error);
      res.status(500).json({
        status: 'ERROR',
        message: `Error fetching ${config.label}`,
        error: error.message,
      });
    }
  }

  async function fetchNextCodeHandler(req, res) {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');
      const code = await getNextCode(client, config.tableName, config.codeColumn, config.codePrefix);
      await client.query('COMMIT');

      res.status(200).json({
        status: 'OK',
        code,
      });
    } catch (error) {
      await client.query('ROLLBACK');
      console.error(`Fetch next ${config.label} code error:`, error);
      res.status(500).json({
        status: 'ERROR',
        message: `Error generating ${config.label} code`,
        error: error.message,
      });
    } finally {
      client.release();
    }
  }

  async function createItem(req, res) {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      const code = await getNextCode(client, config.tableName, config.codeColumn, config.codePrefix);
      const data = config.normalizeInput(req.body, code);
      const { columns, values, placeholders } = config.buildInsertQuery(data);

      const result = await client.query(
        `INSERT INTO ${config.tableName} (${columns.join(', ')}) VALUES (${placeholders.join(', ')}) RETURNING *`,
        values,
      );

      await client.query('COMMIT');

      res.status(201).json({
        status: 'OK',
        data: mapRow(result.rows[0]),
      });
    } catch (error) {
      await client.query('ROLLBACK');
      console.error(`Create ${config.label} error:`, error);
      res.status(500).json({
        status: 'ERROR',
        message: `Error creating ${config.label}`,
        error: error.message,
      });
    } finally {
      client.release();
    }
  }

  async function updateItem(req, res) {
    const { code } = req.params;

    if (!code) {
      return res.status(400).json({
        status: 'ERROR',
        message: 'Code is required',
      });
    }

    try {
      const data = config.normalizeInput(req.body);
      const { updates, values } = config.buildUpdateQuery(data);

      if (!updates.length) {
        return res.status(400).json({
          status: 'ERROR',
          message: 'No fields to update',
        });
      }

      values.push(code);

      const result = await pool.query(
        `UPDATE ${config.tableName} SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE ${config.codeColumn} = $${values.length} RETURNING *`,
        values,
      );

      if (!result.rows.length) {
        return res.status(404).json({
          status: 'ERROR',
          message: `${config.label} not found`,
        });
      }

      res.status(200).json({
        status: 'OK',
        data: mapRow(result.rows[0]),
      });
    } catch (error) {
      console.error(`Update ${config.label} error:`, error);
      res.status(500).json({
        status: 'ERROR',
        message: `Error updating ${config.label}`,
        error: error.message,
      });
    }
  }

  async function deleteItem(req, res) {
    const { code } = req.params;

    if (!code) {
      return res.status(400).json({
        status: 'ERROR',
        message: 'Code is required',
      });
    }

    try {
      const result = await pool.query(
        `DELETE FROM ${config.tableName} WHERE ${config.codeColumn} = $1 RETURNING *`,
        [code],
      );

      if (!result.rows.length) {
        return res.status(404).json({
          status: 'ERROR',
          message: `${config.label} not found`,
        });
      }

      res.status(200).json({
        status: 'OK',
        message: `${config.label} deleted successfully`,
      });
    } catch (error) {
      console.error(`Delete ${config.label} error:`, error);
      res.status(500).json({
        status: 'ERROR',
        message: `Error deleting ${config.label}`,
        error: error.message,
      });
    }
  }

  return {
    fetchItems,
    fetchNextCodeHandler,
    createItem,
    updateItem,
    deleteItem,
  };
}

const systemsConfig = {
  tableName: 'it_systems',
  codeColumn: 'system_code',
  codePrefix: 'SYS',
  label: 'System',
  mapRow: (row) => ({
    id: row.id,
    code: row.system_code,
    systemCode: row.system_code,
    name: row.system_name,
    ipAddress: row.ip_address,
    environment: row.environment,
    status: row.status,
    uptimePercent: Number(row.uptime_percent || 0),
    lastCheckedAt: row.last_checked_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }),
  normalizeInput: (input, newCode) => ({
    system_code: newCode || input.systemCode || input.system_code,
    system_name: normalizeText(input.name || input.systemName || input.system_name),
    ip_address: normalizeText(input.ipAddress || input.ip_address),
    environment: normalizeText(input.environment || 'Production'),
    status: normalizeText(input.status || 'Operational'),
    uptime_percent: normalizeNumber(input.uptimePercent ?? input.uptime_percent ?? 99.5),
    last_checked_at: normalizeDate(input.lastCheckedAt || input.last_checked_at, new Date().toISOString()),
    notes: normalizeText(input.notes),
  }),
  buildInsertQuery: (data) => {
    const columns = Object.keys(data);
    const values = Object.values(data);
    const placeholders = values.map((_, i) => `$${i + 1}`);
    return { columns, values, placeholders };
  },
  buildUpdateQuery: (data) => {
    const entries = Object.entries(data).filter(
      ([key, value]) => key !== 'system_code' && value !== undefined,
    );
    const updates = entries.map(([key], i) => `${key} = $${i + 1}`);
    const values = entries.map(([, value]) => value);
    return { updates, values };
  },
};

const assetsConfig = {
  tableName: 'it_assets',
  codeColumn: 'asset_code',
  codePrefix: 'AST',
  label: 'Asset',
  mapRow: (row) => ({
    id: row.id,
    code: row.asset_code,
    assetCode: row.asset_code,
    name: row.asset_name,
    assetType: row.asset_type,
    model: row.model,
    serialNumber: row.serial_number,
    assignedTo: row.assigned_to,
    purchaseDate: row.purchase_date,
    status: row.status,
    value: Number(row.asset_value || 0),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }),
  normalizeInput: (input, newCode) => ({
    asset_code: newCode || input.assetCode || input.asset_code,
    asset_name: normalizeText(input.name || input.assetName || input.asset_name),
    asset_type: normalizeText(input.assetType || input.asset_type || 'Laptop'),
    model: normalizeText(input.model),
    serial_number: normalizeText(input.serialNumber || input.serial_number),
    assigned_to: normalizeText(input.assignedTo || input.assigned_to),
    purchase_date: normalizeDate(input.purchaseDate || input.purchase_date, new Date().toISOString().split('T')[0]),
    status: normalizeText(input.status || 'Active'),
    asset_value: normalizeNumber(input.value ?? input.assetValue ?? input.asset_value ?? 0),
    notes: normalizeText(input.notes),
  }),
  buildInsertQuery: (data) => {
    const columns = Object.keys(data);
    const values = Object.values(data);
    const placeholders = values.map((_, i) => `$${i + 1}`);
    return { columns, values, placeholders };
  },
  buildUpdateQuery: (data) => {
    const entries = Object.entries(data).filter(
      ([key, value]) => key !== 'asset_code' && value !== undefined,
    );
    const updates = entries.map(([key], i) => `${key} = $${i + 1}`);
    const values = entries.map(([, value]) => value);
    return { updates, values };
  },
};

const maintenanceConfig = {
  tableName: 'it_maintenance',
  codeColumn: 'maintenance_code',
  codePrefix: 'MNT',
  label: 'Maintenance Task',
  mapRow: (row) => ({
    id: row.id,
    code: row.maintenance_code,
    maintenanceCode: row.maintenance_code,
    assetCode: row.asset_code,
    assetName: row.asset_name,
    maintenanceType: row.maintenance_type,
    scheduledDate: row.scheduled_date,
    completedDate: row.completed_date,
    technician: row.technician,
    priority: row.priority,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }),
  normalizeInput: (input, newCode) => ({
    maintenance_code: newCode || input.maintenanceCode || input.maintenance_code,
    asset_code: normalizeText(input.assetCode || input.asset_code),
    asset_name: normalizeText(input.assetName || input.asset_name),
    maintenance_type: normalizeText(input.maintenanceType || input.maintenance_type),
    scheduled_date: normalizeDate(input.scheduledDate || input.scheduled_date, new Date().toISOString().split('T')[0]),
    completed_date: normalizeNullableDate(input.completedDate || input.completed_date),
    technician: normalizeText(input.technician),
    priority: normalizeText(input.priority || 'Medium'),
    status: normalizeText(input.status || 'Scheduled'),
    notes: normalizeText(input.notes),
  }),
  buildInsertQuery: (data) => {
    const columns = Object.keys(data);
    const values = Object.values(data);
    const placeholders = values.map((_, i) => `$${i + 1}`);
    return { columns, values, placeholders };
  },
  buildUpdateQuery: (data) => {
    const entries = Object.entries(data).filter(
      ([key, value]) => key !== 'maintenance_code' && value !== undefined,
    );
    const updates = entries.map(([key], i) => `${key} = $${i + 1}`);
    const values = entries.map(([, value]) => value);
    return { updates, values };
  },
};

async function getDashboard(req, res) {
  try {
    const systemsResult = await pool.query(`
      SELECT
        COUNT(*) AS total,
        SUM(CASE WHEN status = 'Operational' THEN 1 ELSE 0 END) AS operational_count,
        SUM(CASE WHEN status = 'Maintenance' THEN 1 ELSE 0 END) AS maintenance_count,
        SUM(CASE WHEN status = 'Down' THEN 1 ELSE 0 END) AS down_count,
        AVG(uptime_percent) AS avg_uptime
      FROM it_systems
    `);

    const assetsResult = await pool.query(`
      SELECT
        COUNT(*) AS total,
        SUM(asset_value) AS total_value,
        SUM(CASE WHEN status = 'Active' THEN 1 ELSE 0 END) AS active_count,
        SUM(CASE WHEN status = 'Retired' THEN 1 ELSE 0 END) AS retired_count
      FROM it_assets
    `);

    const maintenanceResult = await pool.query(`
      SELECT
        COUNT(*) AS total,
        SUM(CASE WHEN status = 'Scheduled' THEN 1 ELSE 0 END) AS scheduled_count,
        SUM(CASE WHEN status = 'In Progress' THEN 1 ELSE 0 END) AS in_progress_count,
        SUM(CASE WHEN status = 'Completed' THEN 1 ELSE 0 END) AS completed_count
      FROM it_maintenance
    `);

    res.status(200).json({
      status: 'OK',
      data: {
        systems: {
          total: normalizeInteger(systemsResult.rows[0]?.total || 0),
          operationalCount: normalizeInteger(systemsResult.rows[0]?.operational_count || 0),
          maintenanceCount: normalizeInteger(systemsResult.rows[0]?.maintenance_count || 0),
          downCount: normalizeInteger(systemsResult.rows[0]?.down_count || 0),
          averageUptime: normalizeNumber(systemsResult.rows[0]?.avg_uptime || 0),
        },
        assets: {
          total: normalizeInteger(assetsResult.rows[0]?.total || 0),
          totalValue: normalizeNumber(assetsResult.rows[0]?.total_value || 0),
          activeCount: normalizeInteger(assetsResult.rows[0]?.active_count || 0),
          retiredCount: normalizeInteger(assetsResult.rows[0]?.retired_count || 0),
        },
        maintenance: {
          total: normalizeInteger(maintenanceResult.rows[0]?.total || 0),
          scheduledCount: normalizeInteger(maintenanceResult.rows[0]?.scheduled_count || 0),
          inProgressCount: normalizeInteger(maintenanceResult.rows[0]?.in_progress_count || 0),
          completedCount: normalizeInteger(maintenanceResult.rows[0]?.completed_count || 0),
        },
      },
    });
  } catch (error) {
    console.error('Get IT dashboard error:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Error fetching IT dashboard data',
      error: error.message,
    });
  }
}

module.exports = {
  createCrudHandlers,
  systemsHandlers: createCrudHandlers(systemsConfig),
  assetsHandlers: createCrudHandlers(assetsConfig),
  maintenanceHandlers: createCrudHandlers(maintenanceConfig),
  getDashboard,
};
