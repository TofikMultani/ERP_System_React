/* eslint-disable no-undef */
/* eslint-env node */
const pool = require('../config/database');

function normalizeText(value) {
  return String(value ?? '').trim();
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

// Sales Customers
const customersConfig = {
  tableName: 'sales_customers',
  codeColumn: 'customer_code',
  codePrefix: 'CUST',
  label: 'Customer',
  mapRow: (row) => ({
    id: row.id,
    customerCode: row.customer_code,
    name: row.name,
    email: row.email,
    phone: row.phone,
    company: row.company,
    status: row.status,
    creditLimit: row.credit_limit,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }),
  normalizeInput: (input, newCode) => ({
    customer_code: newCode || input.customerCode || input.customer_code,
    name: normalizeText(input.name),
    email: normalizeText(input.email),
    phone: normalizeText(input.phone),
    company: normalizeText(input.company),
    status: normalizeText(input.status || 'Active'),
    credit_limit: normalizeNumber(input.creditLimit || input.credit_limit || 0),
  }),
  buildInsertQuery: (data) => {
    const columns = Object.keys(data);
    const values = Object.values(data);
    const placeholders = values.map((_, i) => `$${i + 1}`);
    return { columns, values, placeholders };
  },
  buildUpdateQuery: (data) => {
    const entries = Object.entries(data);
    const updates = entries.map(([key], i) => `${key} = $${i + 1}`);
    const values = entries.map(([, value]) => value);
    return { updates, values };
  },
};

// Sales Orders
const ordersConfig = {
  tableName: 'sales_orders',
  codeColumn: 'order_number',
  codePrefix: 'ORD',
  label: 'Order',
  mapRow: (row) => ({
    id: row.id,
    code: row.order_number,
    orderNumber: row.order_number,
    customerCode: row.customer_code,
    customerName: row.customer_name,
    orderDate: row.order_date,
    amount: row.amount,
    itemCount: row.item_count,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }),
  normalizeInput: (input, newCode) => ({
    order_number: newCode || input.orderNumber || input.order_number,
    customer_code: normalizeText(input.customerCode || input.customer_code),
    customer_name: normalizeText(input.customerName || input.customer_name),
    order_date: normalizeText(input.orderDate || input.order_date || new Date().toISOString().split('T')[0]),
    amount: normalizeNumber(input.amount || 0),
    item_count: normalizeInteger(input.itemCount || input.item_count || 0),
    status: normalizeText(input.status || 'Processing'),
  }),
  buildInsertQuery: (data) => {
    const columns = Object.keys(data);
    const values = Object.values(data);
    const placeholders = values.map((_, i) => `$${i + 1}`);
    return { columns, values, placeholders };
  },
  buildUpdateQuery: (data) => {
    const entries = Object.entries(data);
    const updates = entries.map(([key], i) => `${key} = $${i + 1}`);
    const values = entries.map(([, value]) => value);
    return { updates, values };
  },
};

// Sales Invoices
const invoicesConfig = {
  tableName: 'sales_invoices',
  codeColumn: 'invoice_number',
  codePrefix: 'INV',
  label: 'Invoice',
  mapRow: (row) => ({
    id: row.id,
    code: row.invoice_number,
    invoiceNumber: row.invoice_number,
    customerCode: row.customer_code,
    customerName: row.customer_name,
    invoiceDate: row.invoice_date,
    dueDate: row.due_date,
    amount: row.amount,
    status: row.status,
    paymentDate: row.payment_date,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }),
  normalizeInput: (input, newCode) => ({
    invoice_number: newCode || input.invoiceNumber || input.invoice_number,
    customer_code: normalizeText(input.customerCode || input.customer_code),
    customer_name: normalizeText(input.customerName || input.customer_name),
    invoice_date: normalizeText(input.invoiceDate || input.invoice_date || new Date().toISOString().split('T')[0]),
    due_date: normalizeText(input.dueDate || input.due_date),
    amount: normalizeNumber(input.amount || 0),
    status: normalizeText(input.status || 'Pending'),
    payment_date: input.paymentDate || input.payment_date || null,
  }),
  buildInsertQuery: (data) => {
    const columns = Object.keys(data);
    const values = Object.values(data);
    const placeholders = values.map((_, i) => `$${i + 1}`);
    return { columns, values, placeholders };
  },
  buildUpdateQuery: (data) => {
    const entries = Object.entries(data);
    const updates = entries.map(([key], i) => `${key} = $${i + 1}`);
    const values = entries.map(([, value]) => value);
    return { updates, values };
  },
};

// Sales Quotations
const quotationsConfig = {
  tableName: 'sales_quotations',
  codeColumn: 'quotation_number',
  codePrefix: 'QT',
  label: 'Quotation',
  mapRow: (row) => ({
    id: row.id,
    code: row.quotation_number,
    quotationNumber: row.quotation_number,
    customerCode: row.customer_code,
    customerName: row.customer_name,
    quotationDate: row.quotation_date,
    expiryDate: row.expiry_date,
    amount: row.amount,
    status: row.status,
    conversionStatus: row.conversion_status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }),
  normalizeInput: (input, newCode) => ({
    quotation_number: newCode || input.quotationNumber || input.quotation_number,
    customer_code: normalizeText(input.customerCode || input.customer_code),
    customer_name: normalizeText(input.customerName || input.customer_name),
    quotation_date: normalizeText(input.quotationDate || input.quotation_date || new Date().toISOString().split('T')[0]),
    expiry_date: normalizeText(input.expiryDate || input.expiry_date),
    amount: normalizeNumber(input.amount || 0),
    status: normalizeText(input.status || 'Sent'),
    conversion_status: normalizeText(input.conversionStatus || input.conversion_status || 'Pending'),
  }),
  buildInsertQuery: (data) => {
    const columns = Object.keys(data);
    const values = Object.values(data);
    const placeholders = values.map((_, i) => `$${i + 1}`);
    return { columns, values, placeholders };
  },
  buildUpdateQuery: (data) => {
    const entries = Object.entries(data);
    const updates = entries.map(([key], i) => `${key} = $${i + 1}`);
    const values = entries.map(([, value]) => value);
    return { updates, values };
  },
};

// Dashboard aggregation
async function getDashboard(req, res) {
  try {
    const customersResult = await pool.query(`SELECT COUNT(*) as total, SUM(CASE WHEN status='Active' THEN 1 ELSE 0 END) as active FROM sales_customers`);
    const ordersResult = await pool.query(`SELECT COUNT(*) as total, SUM(amount) as revenue, SUM(CASE WHEN status='Delivered' THEN 1 ELSE 0 END) as delivered FROM sales_orders`);
    const invoicesResult = await pool.query(`SELECT COUNT(*) as total, SUM(amount) as revenue, SUM(CASE WHEN status='Paid' THEN 1 ELSE 0 END) as paid, SUM(CASE WHEN status='Overdue' THEN 1 ELSE 0 END) as overdue FROM sales_invoices`);
    const quotationsResult = await pool.query(`SELECT COUNT(*) as total, SUM(amount) as value, SUM(CASE WHEN status='Approved' THEN 1 ELSE 0 END) as approved FROM sales_quotations`);

    res.status(200).json({
      status: 'OK',
      data: {
        customers: {
          total: normalizeInteger(customersResult.rows[0]?.total || 0),
          active: normalizeInteger(customersResult.rows[0]?.active || 0),
        },
        orders: {
          total: normalizeInteger(ordersResult.rows[0]?.total || 0),
          revenue: normalizeNumber(ordersResult.rows[0]?.revenue || 0),
          delivered: normalizeInteger(ordersResult.rows[0]?.delivered || 0),
        },
        invoices: {
          total: normalizeInteger(invoicesResult.rows[0]?.total || 0),
          revenue: normalizeNumber(invoicesResult.rows[0]?.revenue || 0),
          paid: normalizeInteger(invoicesResult.rows[0]?.paid || 0),
          overdue: normalizeInteger(invoicesResult.rows[0]?.overdue || 0),
        },
        quotations: {
          total: normalizeInteger(quotationsResult.rows[0]?.total || 0),
          value: normalizeNumber(quotationsResult.rows[0]?.value || 0),
          approved: normalizeInteger(quotationsResult.rows[0]?.approved || 0),
        },
      },
    });
  } catch (error) {
    console.error('Get dashboard error:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Error fetching dashboard data',
      error: error.message,
    });
  }
}

module.exports = {
  createCrudHandlers,
  customersHandlers: createCrudHandlers(customersConfig),
  ordersHandlers: createCrudHandlers(ordersConfig),
  invoicesHandlers: createCrudHandlers(invoicesConfig),
  quotationsHandlers: createCrudHandlers(quotationsConfig),
  getDashboard,
};
