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
    fetchNextCode: fetchNextCodeHandler,
    createItem,
    updateItem,
    deleteItem,
  };
}

// Customers CRUD
const customersCrud = createCrudHandlers({
  tableName: 'support_customers',
  codeColumn: 'customer_code',
  codePrefix: 'CUST',
  label: 'Customer',
  mapRow: (row) => ({
    customerCode: row.customer_code,
    name: row.name,
    email: row.email,
    phone: row.phone,
    company: row.company,
    industry: row.industry,
    accountType: row.account_type,
    status: row.status,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }),
  normalizeInput: (data, code) => {
    const input = {
      customer_code: code,
      name: normalizeText(data.name),
      email: normalizeText(data.email),
      phone: normalizeText(data.phone),
      company: normalizeText(data.company),
      industry: normalizeText(data.industry),
      account_type: normalizeText(data.accountType) || 'Standard',
      status: normalizeText(data.status) || 'Active',
      notes: normalizeText(data.notes),
    };

    Object.keys(input).forEach((key) => {
      if (!input[key]) {
        delete input[key];
      }
    });

    return input;
  },
  buildInsertQuery: (data) => {
    const columns = Object.keys(data);
    const values = Object.values(data);
    const placeholders = values.map((_, i) => `$${i + 1}`);

    return { columns, values, placeholders };
  },
  buildUpdateQuery: (data) => {
    let counter = 1;
    const updates = [];
    const values = [];

    Object.entries(data).forEach(([key, value]) => {
      updates.push(`${key} = $${counter}`);
      values.push(value);
      counter += 1;
    });

    return { updates, values };
  },
});

// Tickets CRUD
const ticketsCrud = createCrudHandlers({
  tableName: 'support_tickets',
  codeColumn: 'ticket_number',
  codePrefix: 'TKT',
  label: 'Ticket',
  mapRow: (row) => ({
    ticketNumber: row.ticket_number,
    customerCode: row.customer_code,
    customerName: row.customer_name,
    customerEmail: row.customer_email,
    subject: row.subject,
    description: row.description,
    category: row.category,
    priority: row.priority,
    status: row.status,
    assignedTo: row.assigned_to,
    resolutionSummary: row.resolution_summary,
    responseCount: row.response_count,
    firstResponseAt: row.first_response_at,
    resolvedAt: row.resolved_at,
    satisfactionRating: row.satisfaction_rating,
    slaResponseMinutes: row.sla_response_minutes,
    slaResolutionHours: row.sla_resolution_hours,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }),
  normalizeInput: (data, code) => {
    const input = {
      ticket_number: code,
      customer_code: normalizeText(data.customerCode),
      customer_name: normalizeText(data.customerName),
      customer_email: normalizeText(data.customerEmail),
      subject: normalizeText(data.subject),
      description: normalizeText(data.description),
      category: normalizeText(data.category),
      priority: normalizeText(data.priority) || 'Medium',
      status: normalizeText(data.status) || 'Open',
      assigned_to: normalizeText(data.assignedTo),
      resolution_summary: normalizeText(data.resolutionSummary),
      response_count: normalizeInteger(data.responseCount) || 0,
      first_response_at: data.firstResponseAt || null,
      resolved_at: data.resolvedAt || null,
      satisfaction_rating: normalizeInteger(data.satisfactionRating),
      sla_response_minutes: normalizeInteger(data.slaResponseMinutes) || 240,
      sla_resolution_hours: normalizeInteger(data.slaResolutionHours) || 72,
    };

    Object.keys(input).forEach((key) => {
      if (input[key] === '' || (typeof input[key] === 'number' && !input[key])) {
        delete input[key];
      }
    });

    return input;
  },
  buildInsertQuery: (data) => {
    const columns = Object.keys(data);
    const values = Object.values(data);
    const placeholders = values.map((_, i) => `$${i + 1}`);

    return { columns, values, placeholders };
  },
  buildUpdateQuery: (data) => {
    let counter = 1;
    const updates = [];
    const values = [];

    Object.entries(data).forEach(([key, value]) => {
      updates.push(`${key} = $${counter}`);
      values.push(value);
      counter += 1;
    });

    return { updates, values };
  },
});

// Responses CRUD
const responsesCrud = createCrudHandlers({
  tableName: 'support_responses',
  codeColumn: 'response_code',
  codePrefix: 'RESP',
  label: 'Response',
  mapRow: (row) => ({
    responseCode: row.response_code,
    ticketNumber: row.ticket_number,
    authorName: row.author_name,
    authorEmail: row.author_email,
    authorRole: row.author_role,
    content: row.content,
    responseType: row.response_type,
    isInternal: row.is_internal,
    attachments: row.attachments_json || [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }),
  normalizeInput: (data, code) => {
    const input = {
      response_code: code,
      ticket_number: normalizeText(data.ticketNumber),
      author_name: normalizeText(data.authorName),
      author_email: normalizeText(data.authorEmail),
      author_role: normalizeText(data.authorRole),
      content: normalizeText(data.content),
      response_type: normalizeText(data.responseType) || 'Note',
      is_internal: Boolean(data.isInternal),
      attachments_json: Array.isArray(data.attachments) ? data.attachments : [],
    };

    return input;
  },
  buildInsertQuery: (data) => {
    const columns = Object.keys(data);
    const values = Object.values(data);
    const placeholders = values.map((_, i) => `$${i + 1}`);

    return { columns, values, placeholders };
  },
  buildUpdateQuery: (data) => {
    let counter = 1;
    const updates = [];
    const values = [];

    Object.entries(data).forEach(([key, value]) => {
      updates.push(`${key} = $${counter}`);
      values.push(value);
      counter += 1;
    });

    return { updates, values };
  },
});

// Knowledge Base CRUD
const knowledgeBaseCrud = createCrudHandlers({
  tableName: 'support_knowledge_base',
  codeColumn: 'kb_code',
  codePrefix: 'KB',
  label: 'Knowledge Base Article',
  mapRow: (row) => ({
    kbCode: row.kb_code,
    title: row.title,
    content: row.content,
    category: row.category,
    keywords: row.keywords_json || [],
    views: row.views,
    isPublished: row.is_published,
    helpfulCount: row.helpful_count,
    notHelpfulCount: row.not_helpful_count,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }),
  normalizeInput: (data, code) => {
    const input = {
      kb_code: code,
      title: normalizeText(data.title),
      content: normalizeText(data.content),
      category: normalizeText(data.category),
      keywords_json: Array.isArray(data.keywords) ? data.keywords : [],
      views: normalizeInteger(data.views) || 0,
      is_published: Boolean(data.isPublished),
      helpful_count: normalizeInteger(data.helpfulCount) || 0,
      not_helpful_count: normalizeInteger(data.notHelpfulCount) || 0,
    };

    return input;
  },
  buildInsertQuery: (data) => {
    const columns = Object.keys(data);
    const values = Object.values(data);
    const placeholders = values.map((_, i) => `$${i + 1}`);

    return { columns, values, placeholders };
  },
  buildUpdateQuery: (data) => {
    let counter = 1;
    const updates = [];
    const values = [];

    Object.entries(data).forEach(([key, value]) => {
      updates.push(`${key} = $${counter}`);
      values.push(value);
      counter += 1;
    });

    return { updates, values };
  },
});

// Dashboard/Reports
async function fetchDashboard(req, res) {
  try {
    const ticketsStats = await pool.query(`
      SELECT
        COUNT(*) as total_tickets,
        SUM(CASE WHEN status = 'Open' THEN 1 ELSE 0 END) as open_tickets,
        SUM(CASE WHEN status = 'In Progress' THEN 1 ELSE 0 END) as in_progress_tickets,
        SUM(CASE WHEN status = 'Resolved' THEN 1 ELSE 0 END) as resolved_tickets,
        SUM(CASE WHEN priority = 'Critical' THEN 1 ELSE 0 END) as critical_tickets,
        COUNT(DISTINCT customer_code) as unique_customers,
        ROUND(AVG(response_count)::numeric, 2) as avg_responses,
        ROUND(AVG(satisfaction_rating)::numeric, 2) as avg_satisfaction
      FROM support_tickets
    `);

    const ticketsByCategory = await pool.query(`
      SELECT
        category,
        COUNT(*) as count,
        SUM(CASE WHEN status = 'Open' THEN 1 ELSE 0 END) as open_count
      FROM support_tickets
      GROUP BY category
      ORDER BY count DESC
      LIMIT 10
    `);

    const ticketsByPriority = await pool.query(`
      SELECT
        priority,
        COUNT(*) as count
      FROM support_tickets
      GROUP BY priority
      ORDER BY count DESC
    `);

    const recentTickets = await pool.query(`
      SELECT *
      FROM support_tickets
      ORDER BY created_at DESC
      LIMIT 10
    `);

    const customerStats = await pool.query(`
      SELECT
        COUNT(*) as total_customers,
        SUM(CASE WHEN status = 'Active' THEN 1 ELSE 0 END) as active_customers,
        COUNT(DISTINCT industry) as industries_count
      FROM support_customers
    `);

    res.status(200).json({
      status: 'OK',
      data: {
        ticketsStats: ticketsStats.rows[0] || {},
        ticketsByCategory: ticketsByCategory.rows,
        ticketsByPriority: ticketsByPriority.rows,
        recentTickets: recentTickets.rows.map((row) => ({
          ticketNumber: row.ticket_number,
          customerName: row.customer_name,
          subject: row.subject,
          priority: row.priority,
          status: row.status,
          createdAt: row.created_at,
        })),
        customerStats: customerStats.rows[0] || {},
      },
    });
  } catch (error) {
    console.error('Fetch dashboard error:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Error fetching dashboard data',
      error: error.message,
    });
  }
}

module.exports = {
  customers: customersCrud,
  tickets: ticketsCrud,
  responses: responsesCrud,
  knowledgeBase: knowledgeBaseCrud,
  fetchDashboard,
  mapCrud: (config) => createCrudHandlers(config),
};
