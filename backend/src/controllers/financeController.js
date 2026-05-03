/* eslint-disable no-undef */
/* eslint-env node */
const fs = require('fs');
const path = require('path');
const pool = require('../config/database');

function normalizeText(value) {
  return String(value ?? '').trim();
}

function normalizeNullableText(value) {
  const text = normalizeText(value);
  return text || null;
}

function normalizeSourceType(value) {
  const text = normalizeText(value) || 'Manual';
  if (/sales/i.test(text)) {
    return 'Sales Order';
  }
  if (/manual/i.test(text)) {
    return 'Manual';
  }
  return text;
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
      if (typeof config.beforeFetch === 'function') {
        await config.beforeFetch(req);
      }

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
      const data = config.normalizeInput(req.body, code, req);
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
      const data = config.normalizeInput(req.body, undefined, req);
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

function getAttachmentMeta(file) {
  if (!file) {
    return null;
  }

  return {
    attachment_name: normalizeNullableText(file.originalname),
    attachment_path: normalizeNullableText(file.path),
    attachment_mime_type: normalizeNullableText(file.mimetype),
    attachment_size_bytes: normalizeInteger(file.size || 0),
  };
}

function toInlineDisposition(fileName, fallbackName) {
  const name = String(fileName || fallbackName || 'attachment').replace(/[\r\n"]/g, '').trim() || 'attachment';
  const encoded = encodeURIComponent(name);
  return `inline; filename="${name}"; filename*=UTF-8''${encoded}`;
}

async function downloadAttachment(req, res, tableName, codeColumn, codeValue, fallbackName) {
  try {
    const result = await pool.query(
      `
        SELECT
          ${codeColumn} AS code,
          attachment_name,
          attachment_path,
          attachment_mime_type
        FROM ${tableName}
        WHERE ${codeColumn} = $1
        LIMIT 1
      `,
      [codeValue],
    );

    if (!result.rows.length) {
      return res.status(404).json({
        status: 'ERROR',
        message: 'Record not found',
      });
    }

    const row = result.rows[0];
    const filePath = row.attachment_path;

    if (!filePath || !fs.existsSync(filePath)) {
      return res.status(404).json({
        status: 'ERROR',
        message: 'Uploaded file not found',
      });
    }

    const fileName = row.attachment_name || path.basename(filePath);
    const mimeType = row.attachment_mime_type || 'application/octet-stream';

    res.setHeader('Content-Type', mimeType);
    res.setHeader('Content-Disposition', toInlineDisposition(fileName, fallbackName));
    return res.sendFile(path.resolve(filePath));
  } catch (error) {
    console.error('Download finance attachment error:', error);
    return res.status(500).json({
      status: 'ERROR',
      message: 'Error downloading uploaded file',
      error: error.message,
    });
  }
}

const incomeConfig = {
  tableName: 'finance_income',
  codeColumn: 'income_code',
  codePrefix: 'INC',
  label: 'Income',
  mapRow: (row) => ({
    id: row.id,
    code: row.income_code,
    incomeCode: row.income_code,
    sourceType: row.source_type || 'Manual',
    sourceCode: row.source_code || '',
    sourceName: row.source_name,
    receivedDate: row.received_date,
    amount: row.amount,
    status: row.status,
    reference: row.reference,
    attachmentName: row.attachment_name,
    attachmentMimeType: row.attachment_mime_type,
    attachmentSizeBytes: row.attachment_size_bytes,
    hasAttachment: Boolean(row.attachment_path),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }),
  normalizeInput: (input, newCode, req) => {
    const base = {
      income_code: newCode || input.incomeCode || input.income_code,
      source_type: normalizeSourceType(input.sourceType || input.source_type),
      source_code: normalizeNullableText(input.sourceCode || input.source_code),
      source_name: normalizeText(input.sourceName || input.source_name),
      received_date: normalizeText(input.receivedDate || input.received_date || new Date().toISOString().split('T')[0]),
      amount: normalizeNumber(input.amount || 0),
      status: normalizeText(input.status || 'Received'),
      reference: normalizeText(input.reference),
      notes: normalizeText(input.notes),
    };

    const attachmentMeta = getAttachmentMeta(req?.file);

    if (attachmentMeta) {
      return {
        ...base,
        ...attachmentMeta,
      };
    }

    if (newCode) {
      return {
        ...base,
        attachment_name: null,
        attachment_path: null,
        attachment_mime_type: null,
        attachment_size_bytes: null,
      };
    }

    return base;
  },
  buildInsertQuery: (data) => {
    const columns = Object.keys(data);
    const values = Object.values(data);
    const placeholders = values.map((_, i) => `$${i + 1}`);
    return { columns, values, placeholders };
  },
  buildUpdateQuery: (data) => {
    const entries = Object.entries(data).filter(([, value]) => value !== undefined);
    const updates = entries.map(([key], i) => `${key} = $${i + 1}`);
    const values = entries.map(([, value]) => value);
    return { updates, values };
  },
};

async function syncSalesOrderIncome(order, userId = null) {
  const sourceType = 'Sales Order';
  const sourceCode = normalizeText(order?.orderNumber || order?.order_number);
  const paymentStatus = normalizeText(order?.paymentStatus || order?.payment_status);

  if (!sourceCode) {
    return null;
  }

  const incomeCodeResult = await pool.query(
    `SELECT income_code FROM finance_income WHERE source_type = $1 AND source_code = $2 LIMIT 1`,
    [sourceType, sourceCode],
  );

  const existingIncomeCode = incomeCodeResult.rows[0]?.income_code || null;
  
  // Extract and format the date properly (YYYY-MM-DD)
  let dateStr = order?.orderDate || order?.order_date;
  if (dateStr) {
    // If it's an ISO date string, extract just the date portion
    if (typeof dateStr === 'string' && dateStr.includes('T')) {
      dateStr = dateStr.split('T')[0];
    } else if (dateStr instanceof Date) {
      dateStr = dateStr.toISOString().split('T')[0];
    } else {
      dateStr = String(dateStr).split('T')[0];
    }
  } else {
    dateStr = new Date().toISOString().split('T')[0];
  }
  
  const incomePayload = {
    source_type: sourceType,
    source_code: sourceCode,
    source_name: normalizeText(order?.customerName || order?.customer_name || order?.customerCode || order?.customer_code || 'Sales Order'),
    received_date: dateStr,
    amount: normalizeNumber(order?.amount || 0),
    status: paymentStatus.toLowerCase() === 'paid' ? 'Received' : 'Pending',
    reference: sourceCode,
    notes: normalizeText(order?.notes || `Auto-synced from sales order ${sourceCode}`),
    updated_by: userId,
  };

  if (existingIncomeCode) {
    const updateResult = await pool.query(
      `UPDATE finance_income SET
        source_name = $2,
        received_date = $3::date,
        amount = $4,
        status = $5,
        reference = $6,
        notes = $7,
        updated_by = $8,
        updated_at = CURRENT_TIMESTAMP
      WHERE income_code = $1
      RETURNING *`,
      [
        existingIncomeCode,
        incomePayload.source_name,
        incomePayload.received_date,
        incomePayload.amount,
        incomePayload.status,
        incomePayload.reference,
        incomePayload.notes,
        userId,
      ],
    );

    return updateResult.rows[0] || null;
  }

  const nextCodeResult = await pool.query(`SELECT income_code FROM finance_income ORDER BY id DESC LIMIT 1`);
  const latestCode = nextCodeResult.rows[0]?.income_code || '';
  const match = String(latestCode).match(/(\d+)$/);
  const nextCode = `INC-${String((match ? Number(match[1]) : 0) + 1).padStart(5, '0')}`;

  const insertResult = await pool.query(
    `INSERT INTO finance_income (
      income_code, source_type, source_code, source_name, received_date, amount, status, reference, notes, created_by, updated_by
    ) VALUES (
      $1,$2,$3,$4,$5::date,$6,$7,$8,$9,$10,$11
    ) RETURNING *`,
    [
      nextCode,
      incomePayload.source_type,
      incomePayload.source_code,
      incomePayload.source_name,
      incomePayload.received_date,
      incomePayload.amount,
      incomePayload.status,
      incomePayload.reference,
      incomePayload.notes,
      userId,
      userId,
    ],
  );

  return insertResult.rows[0] || null;
}

async function reconcileDeliveredSalesIncome(userId = null) {
  const ordersResult = await pool.query(
    `SELECT order_number, customer_name, customer_code, order_date, amount, payment_status
     FROM sales_orders
     WHERE LOWER(COALESCE(status, '')) = 'delivered'
     ORDER BY id ASC`,
  );

  const results = [];
  for (const order of ordersResult.rows) {
    const synced = await syncSalesOrderIncome(
      {
        orderNumber: order.order_number,
        customerName: order.customer_name,
        customerCode: order.customer_code,
        orderDate: order.order_date,
        amount: order.amount,
        paymentStatus: order.payment_status,
        notes: `Auto-synced from sales order ${order.order_number}`,
      },
      userId,
    );
    if (synced) {
      results.push(synced);
    }
  }

  return results;
}

async function reconcileSalesIncomeHandler(req, res) {
  try {
    const userId = req.user?.id || null;
    const results = await reconcileDeliveredSalesIncome(userId);
    return res.status(200).json({
      status: 'OK',
      message: 'Reconciliation completed',
      data: results,
    });
  } catch (error) {
    console.error('Reconciliation error:', error);
    return res.status(500).json({
      status: 'ERROR',
      message: error.message || 'Reconciliation failed',
    });
  }
}

const expensesConfig = {
  tableName: 'finance_expenses',
  codeColumn: 'expense_code',
  codePrefix: 'EXP',
  label: 'Expense',
  mapRow: (row) => ({
    id: row.id,
    code: row.expense_code,
    expenseCode: row.expense_code,
    expenseDate: row.expense_date,
    category: row.category,
    description: row.description,
    amount: row.amount,
    status: row.status,
    attachmentName: row.attachment_name,
    attachmentMimeType: row.attachment_mime_type,
    attachmentSizeBytes: row.attachment_size_bytes,
    hasAttachment: Boolean(row.attachment_path),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }),
  normalizeInput: (input, newCode, req) => {
    const base = {
      expense_code: newCode || input.expenseCode || input.expense_code,
      expense_date: normalizeText(input.expenseDate || input.expense_date || new Date().toISOString().split('T')[0]),
      category: normalizeText(input.category || 'Operations'),
      description: normalizeText(input.description),
      amount: normalizeNumber(input.amount || 0),
      status: normalizeText(input.status || 'Pending'),
      notes: normalizeText(input.notes),
    };

    const attachmentMeta = getAttachmentMeta(req?.file);

    if (attachmentMeta) {
      return {
        ...base,
        ...attachmentMeta,
      };
    }

    if (newCode) {
      return {
        ...base,
        attachment_name: null,
        attachment_path: null,
        attachment_mime_type: null,
        attachment_size_bytes: null,
      };
    }

    return base;
  },
  buildInsertQuery: (data) => {
    const columns = Object.keys(data);
    const values = Object.values(data);
    const placeholders = values.map((_, i) => `$${i + 1}`);
    return { columns, values, placeholders };
  },
  buildUpdateQuery: (data) => {
    const entries = Object.entries(data).filter(([, value]) => value !== undefined);
    const updates = entries.map(([key], i) => `${key} = $${i + 1}`);
    const values = entries.map(([, value]) => value);
    return { updates, values };
  },
};

const paymentsConfig = {
  tableName: 'finance_payments',
  codeColumn: 'payment_code',
  codePrefix: 'PAY',
  label: 'Payment',
  mapRow: (row) => ({
    id: row.id,
    code: row.payment_code,
    paymentCode: row.payment_code,
    paymentDate: row.payment_date,
    vendorName: row.vendor_name,
    incomeCode: row.income_code,
    amount: row.amount,
    method: row.payment_method,
    status: row.status,
    reference: row.reference,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }),
  normalizeInput: (input, newCode) => ({
    payment_code: newCode || input.paymentCode || input.payment_code,
    payment_date: normalizeText(input.paymentDate || input.payment_date || new Date().toISOString().split('T')[0]),
    vendor_name: normalizeText(input.vendorName || input.vendor_name),
    income_code: normalizeText(input.incomeCode || input.income_code),
    amount: normalizeNumber(input.amount || 0),
    payment_method: normalizeText(input.method || input.payment_method || 'Bank Transfer'),
    status: normalizeText(input.status || 'Pending'),
    reference: normalizeText(input.reference),
    notes: normalizeText(input.notes),
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

async function getDashboard(req, res) {
  try {
    const incomeResult = await pool.query(`
      SELECT
        COUNT(*) AS total,
        SUM(amount) AS total_amount,
        SUM(CASE WHEN status = 'Received' THEN amount ELSE 0 END) AS received_amount,
        SUM(CASE WHEN status = 'Pending' THEN amount ELSE 0 END) AS pending_amount,
        SUM(CASE WHEN status = 'Cancelled' THEN amount ELSE 0 END) AS cancelled_amount
      FROM finance_income
    `);

    const expensesResult = await pool.query(`
      SELECT
        COUNT(*) AS total,
        SUM(amount) AS total_amount,
        SUM(CASE WHEN status = 'Approved' THEN amount ELSE 0 END) AS approved_amount,
        SUM(CASE WHEN status = 'Pending' THEN amount ELSE 0 END) AS pending_amount
      FROM finance_expenses
    `);

    const paymentsResult = await pool.query(`
      SELECT
        COUNT(*) AS total,
        SUM(amount) AS total_amount,
        SUM(CASE WHEN status = 'Completed' THEN amount ELSE 0 END) AS completed_amount,
        SUM(CASE WHEN status = 'Pending' THEN amount ELSE 0 END) AS pending_amount,
        SUM(CASE WHEN status = 'Failed' THEN 1 ELSE 0 END) AS failed_count
      FROM finance_payments
    `);

    res.status(200).json({
      status: 'OK',
      data: {
        income: {
          total: normalizeInteger(incomeResult.rows[0]?.total || 0),
          totalAmount: normalizeNumber(incomeResult.rows[0]?.total_amount || 0),
          receivedAmount: normalizeNumber(incomeResult.rows[0]?.received_amount || 0),
          pendingAmount: normalizeNumber(incomeResult.rows[0]?.pending_amount || 0),
          cancelledAmount: normalizeNumber(incomeResult.rows[0]?.cancelled_amount || 0),
        },
        expenses: {
          total: normalizeInteger(expensesResult.rows[0]?.total || 0),
          totalAmount: normalizeNumber(expensesResult.rows[0]?.total_amount || 0),
          approvedAmount: normalizeNumber(expensesResult.rows[0]?.approved_amount || 0),
          pendingAmount: normalizeNumber(expensesResult.rows[0]?.pending_amount || 0),
        },
        payments: {
          total: normalizeInteger(paymentsResult.rows[0]?.total || 0),
          totalAmount: normalizeNumber(paymentsResult.rows[0]?.total_amount || 0),
          completedAmount: normalizeNumber(paymentsResult.rows[0]?.completed_amount || 0),
          pendingAmount: normalizeNumber(paymentsResult.rows[0]?.pending_amount || 0),
          failedCount: normalizeInteger(paymentsResult.rows[0]?.failed_count || 0),
        },
      },
    });
  } catch (error) {
    console.error('Get finance dashboard error:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Error fetching finance dashboard data',
      error: error.message,
    });
  }
}

async function downloadIncomeAttachment(req, res) {
  const { code } = req.params;

  if (!code) {
    return res.status(400).json({
      status: 'ERROR',
      message: 'Code is required',
    });
  }

  return downloadAttachment(req, res, 'finance_income', 'income_code', code, `${code}.pdf`);
}

async function downloadExpenseAttachment(req, res) {
  const { code } = req.params;

  if (!code) {
    return res.status(400).json({
      status: 'ERROR',
      message: 'Code is required',
    });
  }

  return downloadAttachment(req, res, 'finance_expenses', 'expense_code', code, `${code}.pdf`);
}

module.exports = {
  createCrudHandlers,
  incomeHandlers: createCrudHandlers(incomeConfig),
  expensesHandlers: createCrudHandlers(expensesConfig),
  paymentsHandlers: createCrudHandlers(paymentsConfig),
  downloadIncomeAttachment,
  downloadExpenseAttachment,
  getDashboard,
  syncSalesOrderIncome,
  reconcileSalesIncomeHandler,
};
