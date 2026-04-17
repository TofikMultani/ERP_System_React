/* eslint-disable no-undef */
/* eslint-env node */
const PDFDocument = require('pdfkit');
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

function normalizeDate(value) {
  const text = normalizeText(value);
  if (!text) {
    return '';
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) {
    return text;
  }

  const parsed = new Date(text);
  if (Number.isNaN(parsed.getTime())) {
    return '';
  }

  return parsed.toISOString().slice(0, 10);
}

function formatCode(prefix, value) {
  return `${prefix}-${String(value).padStart(4, '0')}`;
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
    try {
      const code = await getNextCode(pool, config.tableName, config.codeColumn, config.codePrefix);
      res.status(200).json({
        status: 'OK',
        data: {
          [config.codeField]: code,
        },
      });
    } catch (error) {
      console.error(`Fetch next ${config.label} code error:`, error);
      res.status(500).json({
        status: 'ERROR',
        message: `Error fetching next ${config.label} code`,
        error: error.message,
      });
    }
  }

  async function createItem(req, res) {
    const client = await pool.connect();

    try {
      const normalized = config.normalizeInput(req.body || {});
      if (!config.hasRequiredFields(normalized)) {
        return res.status(400).json({
          status: 'ERROR',
          message: `Missing required ${config.label} fields`,
        });
      }

      await client.query('BEGIN');
      normalized[config.codeField] = await getNextCode(
        client,
        config.tableName,
        config.codeColumn,
        config.codePrefix,
      );

      const insertColumns = [config.codeColumn, ...config.insertColumns];
      const values = [normalized[config.codeField], ...config.insertColumns.map((field) => normalized[field])];
      const placeholders = insertColumns.map((_, index) => `$${index + 1}`).join(', ');

      const result = await client.query(
        `
          INSERT INTO ${config.tableName} (${insertColumns.join(', ')})
          VALUES (${placeholders})
          RETURNING *
        `,
        values,
      );

      await client.query('COMMIT');

      return res.status(201).json({
        status: 'OK',
        message: `${config.label} created successfully`,
        data: mapRow(result.rows[0]),
      });
    } catch (error) {
      await client.query('ROLLBACK');
      console.error(`Create ${config.label} error:`, error);
      return res.status(500).json({
        status: 'ERROR',
        message: `Error creating ${config.label}`,
        error: error.message,
      });
    } finally {
      client.release();
    }
  }

  async function updateItem(req, res) {
    try {
      const { code } = req.params;
      const normalized = config.normalizeInput(req.body || {});
      if (!config.hasRequiredFields(normalized)) {
        return res.status(400).json({
          status: 'ERROR',
          message: `Missing required ${config.label} fields`,
        });
      }

      const setClause = config.insertColumns
        .map((column, index) => `${column} = $${index + 1}`)
        .join(', ');
      const values = config.insertColumns.map((field) => normalized[field]);

      const result = await pool.query(
        `
          UPDATE ${config.tableName}
          SET ${setClause}, updated_by = $${values.length + 1}, updated_at = CURRENT_TIMESTAMP
          WHERE ${config.codeColumn} = $${values.length + 2}
          RETURNING *
        `,
        [...values, req.user?.id || null, code],
      );

      if (!result.rows[0]) {
        return res.status(404).json({
          status: 'ERROR',
          message: `${config.label} not found`,
        });
      }

      return res.status(200).json({
        status: 'OK',
        message: `${config.label} updated successfully`,
        data: mapRow(result.rows[0]),
      });
    } catch (error) {
      console.error(`Update ${config.label} error:`, error);
      return res.status(500).json({
        status: 'ERROR',
        message: `Error updating ${config.label}`,
        error: error.message,
      });
    }
  }

  async function deleteItem(req, res) {
    try {
      const { code } = req.params;
      const result = await pool.query(
        `DELETE FROM ${config.tableName} WHERE ${config.codeColumn} = $1 RETURNING *`,
        [code],
      );

      if (!result.rows[0]) {
        return res.status(404).json({
          status: 'ERROR',
          message: `${config.label} not found`,
        });
      }

      return res.status(200).json({
        status: 'OK',
        message: `${config.label} deleted successfully`,
      });
    } catch (error) {
      console.error(`Delete ${config.label} error:`, error);
      return res.status(500).json({
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
    normalizeInput: config.normalizeInput,
    hasRequiredFields: config.hasRequiredFields,
  };
}

function toJson(value, fallback) {
  if (Array.isArray(value)) {
    return value;
  }

  if (typeof value === 'string') {
    const text = value.trim();
    if (!text) {
      return fallback;
    }

    try {
      const parsed = JSON.parse(text);
      return Array.isArray(parsed) ? parsed : fallback;
    } catch {
      return text
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean);
    }
  }

  return fallback;
}

function csvItems(items) {
  return (Array.isArray(items) ? items : [])
    .map((item) => String(item).replace(/\|/g, ' '))
    .join(' | ');
}

const productCrud = createCrudHandlers({
  label: 'product',
  tableName: 'inventory_products',
  codeColumn: 'product_code',
  codePrefix: 'PRD',
  codeField: 'productCode',
  insertColumns: [
    'name',
    'category',
    'sku',
    'unit_price',
    'stock_qty',
    'reorder_level',
    'status',
    'description',
    'created_by',
  ],
  normalizeInput(payload) {
    return {
      productCode: normalizeText(payload.productCode),
      name: normalizeText(payload.name),
      category: normalizeText(payload.category),
      sku: normalizeText(payload.sku),
      unit_price: normalizeNumber(payload.unitPrice),
      stock_qty: normalizeInteger(payload.stockQty),
      reorder_level: normalizeInteger(payload.reorderLevel),
      status: normalizeText(payload.status) || 'Active',
      description: normalizeText(payload.description),
    };
  },
  hasRequiredFields(payload) {
    return ['name', 'category', 'sku'].every((field) => normalizeText(payload[field]));
  },
  mapRow(row) {
    return {
      id: row.id,
      productCode: row.product_code,
      name: row.name,
      category: row.category,
      sku: row.sku,
      unitPrice: row.unit_price === null ? '' : String(row.unit_price),
      stockQty: row.stock_qty,
      reorderLevel: row.reorder_level,
      status: row.status,
      description: row.description || '',
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  },
});

const categoryCrud = createCrudHandlers({
  label: 'category',
  tableName: 'inventory_categories',
  codeColumn: 'category_code',
  codePrefix: 'CAT',
  codeField: 'categoryCode',
  insertColumns: ['name', 'description', 'parent_category', 'status', 'created_by'],
  normalizeInput(payload) {
    return {
      categoryCode: normalizeText(payload.categoryCode),
      name: normalizeText(payload.name),
      description: normalizeText(payload.description),
      parent_category: normalizeText(payload.parentCategory),
      status: normalizeText(payload.status) || 'Active',
    };
  },
  hasRequiredFields(payload) {
    return ['name'].every((field) => normalizeText(payload[field]));
  },
  mapRow(row) {
    return {
      id: row.id,
      categoryCode: row.category_code,
      name: row.name,
      description: row.description || '',
      parentCategory: row.parent_category || '',
      status: row.status,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  },
});

const stockCrud = createCrudHandlers({
  label: 'stock item',
  tableName: 'inventory_stock',
  codeColumn: 'stock_code',
  codePrefix: 'STK',
  codeField: 'stockCode',
  insertColumns: [
    'product_name',
    'sku',
    'warehouse_name',
    'on_hand',
    'reserved_qty',
    'reorder_level',
    'reorder_qty',
    'last_counted_at',
    'status',
    'created_by',
  ],
  normalizeInput(payload) {
    return {
      stockCode: normalizeText(payload.stockCode),
      product_name: normalizeText(payload.productName),
      sku: normalizeText(payload.sku),
      warehouse_name: normalizeText(payload.warehouseName),
      on_hand: normalizeInteger(payload.onHand),
      reserved_qty: normalizeInteger(payload.reservedQty),
      reorder_level: normalizeInteger(payload.reorderLevel),
      reorder_qty: normalizeInteger(payload.reorderQty),
      last_counted_at: normalizeDate(payload.lastCountedAt),
      status: normalizeText(payload.status) || 'Active',
    };
  },
  hasRequiredFields(payload) {
    return ['product_name', 'sku', 'warehouse_name'].every((field) => normalizeText(payload[field]));
  },
  mapRow(row) {
    return {
      id: row.id,
      stockCode: row.stock_code,
      productName: row.product_name,
      sku: row.sku,
      warehouseName: row.warehouse_name,
      onHand: row.on_hand,
      reservedQty: row.reserved_qty,
      reorderLevel: row.reorder_level,
      reorderQty: row.reorder_qty,
      lastCountedAt: row.last_counted_at,
      status: row.status,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  },
});

const supplierCrud = createCrudHandlers({
  label: 'supplier',
  tableName: 'inventory_suppliers',
  codeColumn: 'supplier_code',
  codePrefix: 'SUP',
  codeField: 'supplierCode',
  insertColumns: [
    'name',
    'contact_person',
    'email',
    'phone',
    'city',
    'country',
    'gst_number',
    'payment_terms',
    'status',
    'created_by',
  ],
  normalizeInput(payload) {
    return {
      supplierCode: normalizeText(payload.supplierCode),
      name: normalizeText(payload.name),
      contact_person: normalizeText(payload.contactPerson),
      email: normalizeText(payload.email),
      phone: normalizeText(payload.phone),
      city: normalizeText(payload.city),
      country: normalizeText(payload.country),
      gst_number: normalizeText(payload.gstNumber),
      payment_terms: normalizeText(payload.paymentTerms),
      status: normalizeText(payload.status) || 'Active',
    };
  },
  hasRequiredFields(payload) {
    return ['name', 'contact_person', 'email'].every((field) => normalizeText(payload[field]));
  },
  mapRow(row) {
    return {
      id: row.id,
      supplierCode: row.supplier_code,
      name: row.name,
      contactPerson: row.contact_person,
      email: row.email,
      phone: row.phone || '',
      city: row.city || '',
      country: row.country || '',
      gstNumber: row.gst_number || '',
      paymentTerms: row.payment_terms || '',
      status: row.status,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  },
});

const warehouseCrud = createCrudHandlers({
  label: 'warehouse',
  tableName: 'inventory_warehouses',
  codeColumn: 'warehouse_code',
  codePrefix: 'WH',
  codeField: 'warehouseCode',
  insertColumns: [
    'name',
    'location',
    'capacity',
    'occupied',
    'manager_name',
    'status',
    'created_by',
  ],
  normalizeInput(payload) {
    return {
      warehouseCode: normalizeText(payload.warehouseCode),
      name: normalizeText(payload.name),
      location: normalizeText(payload.location),
      capacity: normalizeInteger(payload.capacity),
      occupied: normalizeInteger(payload.occupied),
      manager_name: normalizeText(payload.managerName),
      status: normalizeText(payload.status) || 'Active',
    };
  },
  hasRequiredFields(payload) {
    return ['name', 'location'].every((field) => normalizeText(payload[field]));
  },
  mapRow(row) {
    return {
      id: row.id,
      warehouseCode: row.warehouse_code,
      name: row.name,
      location: row.location,
      capacity: row.capacity,
      occupied: row.occupied,
      managerName: row.manager_name || '',
      status: row.status,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  },
});

const purchaseOrderCrud = createCrudHandlers({
  label: 'purchase order',
  tableName: 'purchase_orders',
  codeColumn: 'po_number',
  codePrefix: 'PO',
  codeField: 'poNumber',
  insertColumns: [
    'supplier_name',
    'warehouse_name',
    'items_json',
    'amount',
    'order_date',
    'due_date',
    'status',
    'notes',
    'created_by',
  ],
  normalizeInput(payload) {
    const items = toJson(payload.items, []);
    return {
      poNumber: normalizeText(payload.poNumber),
      supplier_name: normalizeText(payload.supplierName),
      warehouse_name: normalizeText(payload.warehouseName),
      items_json: JSON.stringify(items),
      amount: normalizeNumber(payload.amount),
      order_date: normalizeDate(payload.orderDate),
      due_date: normalizeDate(payload.dueDate),
      status: normalizeText(payload.status) || 'Pending',
      notes: normalizeText(payload.notes),
    };
  },
  hasRequiredFields(payload) {
    return ['supplier_name', 'warehouse_name', 'order_date', 'due_date'].every((field) =>
      normalizeText(payload[field]),
    );
  },
  mapRow(row) {
    const items = Array.isArray(row.items_json) ? row.items_json : [];
    return {
      id: row.id,
      poNumber: row.po_number,
      supplierName: row.supplier_name,
      warehouseName: row.warehouse_name,
      items,
      itemsText: csvItems(items),
      itemCount: items.length,
      amount: row.amount === null ? '' : String(row.amount),
      orderDate: row.order_date,
      dueDate: row.due_date,
      status: row.status,
      notes: row.notes || '',
      pdfGeneratedAt: row.pdf_generated_at,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  },
});

const adjustmentCrud = createCrudHandlers({
  label: 'adjustment',
  tableName: 'inventory_adjustments',
  codeColumn: 'adjustment_code',
  codePrefix: 'ADJ',
  codeField: 'adjustmentCode',
  insertColumns: [
    'adjustment_date',
    'product_name',
    'warehouse_name',
    'adjustment_type',
    'quantity',
    'reason',
    'approved_by',
    'status',
    'created_by',
  ],
  normalizeInput(payload) {
    return {
      adjustmentCode: normalizeText(payload.adjustmentCode),
      adjustment_date: normalizeDate(payload.date),
      product_name: normalizeText(payload.productName),
      warehouse_name: normalizeText(payload.warehouseName),
      adjustment_type: normalizeText(payload.type),
      quantity: normalizeInteger(payload.quantity),
      reason: normalizeText(payload.reason),
      approved_by: normalizeText(payload.approvedBy),
      status: normalizeText(payload.status) || 'Pending',
    };
  },
  hasRequiredFields(payload) {
    return ['adjustment_date', 'product_name', 'warehouse_name', 'adjustment_type'].every((field) =>
      normalizeText(payload[field]),
    );
  },
  mapRow(row) {
    return {
      id: row.id,
      adjustmentCode: row.adjustment_code,
      date: row.adjustment_date,
      productName: row.product_name,
      warehouseName: row.warehouse_name,
      type: row.adjustment_type,
      quantity: row.quantity,
      reason: row.reason || '',
      approvedBy: row.approved_by || '',
      status: row.status,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  },
});

async function fetchPurchaseOrderPdf(req, res) {
  try {
    const { poNumber } = req.params;
    const result = await pool.query(
      `SELECT * FROM purchase_orders WHERE po_number = $1 LIMIT 1`,
      [poNumber],
    );

    if (!result.rows[0]) {
      return res.status(404).json({
        status: 'ERROR',
        message: 'Purchase order not found',
      });
    }

    const row = result.rows[0];
    const items = Array.isArray(row.items_json)
      ? row.items_json
      : toJson(row.items_json, []);
    const order = {
      poNumber: row.po_number,
      supplierName: row.supplier_name,
      warehouseName: row.warehouse_name,
      items,
      itemsText: csvItems(items),
      amount: row.amount === null ? '0' : String(row.amount),
      orderDate: row.order_date,
      dueDate: row.due_date,
      status: row.status,
      notes: row.notes || '',
    };
    const pdf = new PDFDocument({ margin: 40, size: 'A4' });
    const chunks = [];

    pdf.on('data', (chunk) => chunks.push(chunk));
    pdf.on('end', () => {
      const buffer = Buffer.concat(chunks);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${order.poNumber}.pdf"`);
      res.status(200).send(buffer);
    });

    pdf.fontSize(18).text('Purchase Order', { align: 'center' });
    pdf.moveDown();
    pdf.fontSize(12).text(`PO Number: ${order.poNumber}`);
    pdf.text(`Supplier: ${order.supplierName}`);
    pdf.text(`Warehouse: ${order.warehouseName}`);
    pdf.text(`Order Date: ${order.orderDate}`);
    pdf.text(`Due Date: ${order.dueDate}`);
    pdf.text(`Status: ${order.status}`);
    pdf.text(`Amount: ₹${normalizeNumber(order.amount).toLocaleString()}`);
    pdf.moveDown();
    pdf.fontSize(13).text('Items', { underline: true });
    pdf.moveDown(0.5);

    (order.items.length ? order.items : [order.itemsText || 'No line items captured']).forEach((item, index) => {
      const text = typeof item === 'string' ? item : JSON.stringify(item);
      pdf.text(`${index + 1}. ${text}`);
    });

    if (order.notes) {
      pdf.moveDown();
      pdf.fontSize(13).text('Notes', { underline: true });
      pdf.fontSize(11).text(order.notes);
    }

    pdf.end();
  } catch (error) {
    console.error('Purchase order PDF error:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Error generating purchase order PDF',
      error: error.message,
    });
  }
}

async function importProducts(req, res) {
  const items = Array.isArray(req.body?.products) ? req.body.products : [];

  if (!items.length) {
    return res.status(400).json({
      status: 'ERROR',
      message: 'No products supplied for import',
    });
  }

  const client = await pool.connect();
  try {
    let processed = 0;
    const failed = [];
    await client.query('BEGIN');

    for (let index = 0; index < items.length; index += 1) {
      const item = items[index];
      const normalized = productCrud.normalizeInput(item || {});
      if (!productCrud.hasRequiredFields(normalized)) {
        failed.push({
          row: index + 1,
          sku: normalized.sku || null,
          reason: 'Missing required fields (name/category/sku)',
        });
        continue;
      }

      await client.query('SAVEPOINT product_import_row');
      try {
        const existing = await client.query(
          `SELECT id FROM inventory_products WHERE sku = $1 LIMIT 1`,
          [normalized.sku],
        );

        if (existing.rows[0]) {
          await client.query(
            `
              UPDATE inventory_products
              SET name = $1,
                  category = $2,
                  unit_price = $3,
                  stock_qty = $4,
                  reorder_level = $5,
                  status = $6,
                  description = $7,
                  updated_by = $8,
                  updated_at = CURRENT_TIMESTAMP
              WHERE sku = $9
            `,
            [
              normalized.name,
              normalized.category,
              normalized.unit_price,
              normalized.stock_qty,
              normalized.reorder_level,
              normalized.status,
              normalized.description,
              req.user?.id || null,
              normalized.sku,
            ],
          );
        } else {
          const code = await getNextCode(client, 'inventory_products', 'product_code', 'PRD');
          await client.query(
            `
              INSERT INTO inventory_products (
                product_code, name, category, sku, unit_price, stock_qty, reorder_level, status, description, created_by, updated_by
              ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$10)
            `,
            [
              code,
              normalized.name,
              normalized.category,
              normalized.sku,
              normalized.unit_price,
              normalized.stock_qty,
              normalized.reorder_level,
              normalized.status,
              normalized.description,
              req.user?.id || null,
            ],
          );
        }

        processed += 1;
      } catch (rowError) {
        await client.query('ROLLBACK TO SAVEPOINT product_import_row');
        failed.push({
          row: index + 1,
          sku: normalized.sku || null,
          reason: rowError.message,
        });
      }
    }

    await client.query('COMMIT');

    if (!processed && failed.length) {
      return res.status(400).json({
        status: 'ERROR',
        message: 'No products were imported',
        error: failed[0].reason,
        data: { processed, failed },
      });
    }

    return res.status(200).json({
      status: 'OK',
      message: failed.length
        ? `Products imported with ${failed.length} skipped row(s)`
        : 'Products imported successfully',
      data: { processed, failed },
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Import products error:', error);
    return res.status(500).json({
      status: 'ERROR',
      message: 'Error importing products',
      error: error.message,
    });
  } finally {
    client.release();
  }
}

module.exports = {
  products: {
    fetchItems: productCrud.fetchItems,
    fetchNextCode: productCrud.fetchNextCodeHandler,
    createItem: productCrud.createItem,
    updateItem: productCrud.updateItem,
    deleteItem: productCrud.deleteItem,
    importProducts,
  },
  categories: categoryCrud,
  stock: stockCrud,
  suppliers: supplierCrud,
  warehouses: warehouseCrud,
  purchaseOrders: {
    ...purchaseOrderCrud,
    fetchPurchaseOrderPdf,
  },
  adjustments: adjustmentCrud,
};
