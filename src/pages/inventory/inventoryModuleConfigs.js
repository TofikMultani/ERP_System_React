import {
  createInventoryAdjustment,
  createInventoryCategory,
  createInventoryProduct,
  createInventoryPurchaseOrder,
  createInventoryStock,
  createInventorySupplier,
  createInventoryWarehouse,
  deleteInventoryAdjustment,
  deleteInventoryCategory,
  deleteInventoryProduct,
  deleteInventoryPurchaseOrder,
  deleteInventoryStock,
  deleteInventorySupplier,
  deleteInventoryWarehouse,
  downloadInventoryPurchaseOrderPdf,
  fetchInventoryAdjustments,
  fetchInventoryCategories,
  fetchInventoryProducts,
  fetchInventoryPurchaseOrders,
  fetchInventoryStock,
  fetchInventorySuppliers,
  fetchInventoryWarehouses,
  fetchNextInventoryAdjustmentCode,
  fetchNextInventoryCategoryCode,
  fetchNextInventoryProductCode,
  fetchNextInventoryPurchaseOrderCode,
  fetchNextInventoryStockCode,
  fetchNextInventorySupplierCode,
  fetchNextInventoryWarehouseCode,
  importInventoryProducts,
  updateInventoryAdjustment,
  updateInventoryCategory,
  updateInventoryProduct,
  updateInventoryPurchaseOrder,
  updateInventoryStock,
  updateInventorySupplier,
  updateInventoryWarehouse,
} from "../../utils/inventoryApi.js";

function toNumber(value) {
  const parsed = Number(String(value ?? "").replace(/[^\d.-]/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

function normalizeDate(value) {
  const text = String(value ?? "").trim();
  if (!text) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return text;
  const parsed = new Date(text);
  return Number.isNaN(parsed.getTime()) ? "" : parsed.toISOString().slice(0, 10);
}

function formatCurrency(value) {
  return `₹${toNumber(value).toLocaleString()}`;
}

function parseProductRow(row) {
  return {
    name: String(row["Product Name"] || row.name || "").trim(),
    category: String(row.Category || row.category || "").trim(),
    sku: String(row.SKU || row.sku || "").trim(),
    unitPrice: String(row.Price || row.unitPrice || row.unit_price || "").trim(),
    stockQty: String(row.Stock || row.stockQty || row.stock_qty || "").trim(),
    reorderLevel: String(row.ReorderLevel || row.reorderLevel || "10").trim(),
    status: String(row.Status || row.status || "Active").trim(),
    description: String(row.Description || row.description || "").trim(),
  };
}

const categoryOptions = [
  "Electronics",
  "Accessories",
  "Furniture",
  "Office Supplies",
  "Stationery",
  "Raw Materials",
];

const statusOptions = ["Active", "Inactive"];

const baseStatusFilters = ["All", "Active", "Inactive"];

export const productsConfig = {
  title: "Products",
  label: "product",
  labelPlural: "products",
  listTitle: "Product Catalog",
  description: "Central product catalog with pricing, stock, and Excel import support.",
  formTitle: "Add Product",
  formDescription: "Create or update product master data.",
  listRoute: "/inventory/products",
  newRoute: "/inventory/products/new",
  editRoute: (code) => `/inventory/products/${encodeURIComponent(code)}/edit`,
  addLabel: "+ Add Product",
  columns: [
    { header: "Code", accessor: "productCode" },
    { header: "Product Name", accessor: "name" },
    { header: "Category", accessor: "category" },
    { header: "SKU", accessor: "sku" },
    { header: "Price", accessor: "unitPrice" },
    { header: "Stock", accessor: "stockQty" },
    { header: "Status", accessor: "status" },
  ],
  searchFields: ["productCode", "name", "category", "sku", "status"],
  pageSize: 8,
  statusFilters: baseStatusFilters,
  codeField: "productCode",
  emptyForm: {
    productCode: "",
    name: "",
    category: "",
    sku: "",
    unitPrice: "",
    stockQty: "0",
    reorderLevel: "10",
    status: "Active",
    description: "",
  },
  fields: [
    { name: "productCode", label: "Product Code", type: "text", readOnly: true, required: true },
    { name: "name", label: "Product Name", type: "text", placeholder: "e.g. Desktop PC", required: true },
    { name: "category", label: "Category", type: "select", options: categoryOptions, required: true },
    { name: "sku", label: "SKU", type: "text", placeholder: "e.g. PROD-001", required: true },
    { name: "unitPrice", label: "Unit Price", type: "number", placeholder: "0.00", step: "0.01" },
    { name: "stockQty", label: "Stock Quantity", type: "number", placeholder: "0", required: true },
    { name: "reorderLevel", label: "Reorder Level", type: "number", placeholder: "10" },
    { name: "status", label: "Status", type: "select", options: statusOptions, required: true },
    { name: "description", label: "Description", type: "textarea", fullWidth: true, placeholder: "Notes or product specs" },
  ],
  fetchRows: fetchInventoryProducts,
  fetchNextCode: fetchNextInventoryProductCode,
  createItem: createInventoryProduct,
  updateItem: updateInventoryProduct,
  deleteRow: deleteInventoryProduct,
  buildSummary(rows) {
    const totalValue = rows.reduce((sum, row) => sum + toNumber(row.unitPrice) * toNumber(row.stockQty), 0);
    const lowStock = rows.filter((row) => toNumber(row.stockQty) <= toNumber(row.reorderLevel)).length;
    return [
      { title: "Total Products", value: rows.length, helper: "active product masters" },
      { title: "Inventory Value", value: formatCurrency(totalValue), helper: "price × stock" },
      { title: "Low Stock", value: lowStock, helper: "reorder required" },
      { title: "Categories", value: new Set(rows.map((row) => row.category).filter(Boolean)).size, helper: "distinct categories" },
    ];
  },
  mapRowToForm(row) {
    return {
      productCode: row.productCode || "",
      name: row.name || "",
      category: row.category || "",
      sku: row.sku || "",
      unitPrice: row.unitPrice || "",
      stockQty: String(row.stockQty ?? "0"),
      reorderLevel: String(row.reorderLevel ?? "10"),
      status: row.status || "Active",
      description: row.description || "",
    };
  },
  mapFormToApi(form) {
    return {
      productCode: String(form.productCode || "").trim(),
      name: String(form.name || "").trim(),
      category: String(form.category || "").trim(),
      sku: String(form.sku || "").trim(),
      unitPrice: toNumber(form.unitPrice),
      stockQty: toNumber(form.stockQty),
      reorderLevel: toNumber(form.reorderLevel),
      status: String(form.status || "Active").trim(),
      description: String(form.description || "").trim(),
    };
  },
  importParser: parseProductRow,
  importRows: (rows) => importInventoryProducts({ products: rows }),
  loadContext: async () => ({ categoryOptions: categoryOptions.map((value) => ({ value, label: value })) }),
};

export const categoriesConfig = {
  title: "Categories",
  label: "category",
  labelPlural: "categories",
  listTitle: "Category Master",
  description: "Classify products using database-backed categories.",
  formTitle: "Add Category",
  formDescription: "Create or update category records.",
  listRoute: "/inventory/categories",
  newRoute: "/inventory/categories/new",
  editRoute: (code) => `/inventory/categories/${encodeURIComponent(code)}/edit`,
  addLabel: "+ New Category",
  columns: [
    { header: "Code", accessor: "categoryCode" },
    { header: "Category", accessor: "name" },
    { header: "Parent", accessor: "parentCategory" },
    { header: "Description", accessor: "description" },
    { header: "Status", accessor: "status" },
  ],
  searchFields: ["categoryCode", "name", "parentCategory", "status"],
  pageSize: 8,
  statusFilters: baseStatusFilters,
  codeField: "categoryCode",
  emptyForm: {
    categoryCode: "",
    name: "",
    parentCategory: "",
    description: "",
    status: "Active",
  },
  fields: [
    { name: "categoryCode", label: "Category Code", type: "text", readOnly: true, required: true },
    { name: "name", label: "Category Name", type: "text", placeholder: "e.g. Electronics", required: true },
    { name: "parentCategory", label: "Parent Category", type: "text", placeholder: "Optional parent category" },
    { name: "description", label: "Description", type: "textarea", fullWidth: true, placeholder: "Brief description" },
    { name: "status", label: "Status", type: "select", options: statusOptions, required: true },
  ],
  fetchRows: fetchInventoryCategories,
  fetchNextCode: fetchNextInventoryCategoryCode,
  createItem: createInventoryCategory,
  updateItem: updateInventoryCategory,
  deleteRow: deleteInventoryCategory,
  buildSummary(rows) {
    const active = rows.filter((row) => row.status === "Active").length;
    return [
      { title: "Total Categories", value: rows.length, helper: "all category masters" },
      { title: "Active", value: active, helper: "available categories" },
      { title: "Avg Products", value: rows.length ? (rows.length / rows.length).toFixed(1) : "0.0", helper: "placeholder average" },
      { title: "Inactive", value: rows.length - active, helper: "archived categories" },
    ];
  },
  mapRowToForm(row) {
    return {
      categoryCode: row.categoryCode || "",
      name: row.name || "",
      parentCategory: row.parentCategory || "",
      description: row.description || "",
      status: row.status || "Active",
    };
  },
  mapFormToApi(form) {
    return {
      categoryCode: String(form.categoryCode || "").trim(),
      name: String(form.name || "").trim(),
      parentCategory: String(form.parentCategory || "").trim(),
      description: String(form.description || "").trim(),
      status: String(form.status || "Active").trim(),
    };
  },
};

export const stockConfig = {
  title: "Stock",
  label: "stock item",
  labelPlural: "stock items",
  listTitle: "Stock Levels",
  description: "Track product stock across warehouses and reorder levels.",
  formTitle: "Adjust Stock",
  formDescription: "Create or update stock item records.",
  listRoute: "/inventory/stock",
  newRoute: "/inventory/stock/new",
  editRoute: (code) => `/inventory/stock/${encodeURIComponent(code)}/edit`,
  addLabel: "+ Update Stock",
  columns: [
    { header: "Code", accessor: "stockCode" },
    { header: "Product", accessor: "productName" },
    { header: "SKU", accessor: "sku" },
    { header: "Warehouse", accessor: "warehouseName" },
    { header: "On Hand", accessor: "onHand" },
    { header: "Reorder Qty", accessor: "reorderQty" },
    { header: "Status", accessor: "status" },
  ],
  searchFields: ["stockCode", "productName", "sku", "warehouseName", "status"],
  pageSize: 8,
  statusFilters: baseStatusFilters,
  codeField: "stockCode",
  emptyForm: {
    stockCode: "",
    productName: "",
    sku: "",
    warehouseName: "",
    onHand: "0",
    reservedQty: "0",
    reorderLevel: "0",
    reorderQty: "0",
    lastCountedAt: "",
    status: "Active",
  },
  fields: [
    { name: "stockCode", label: "Stock Code", type: "text", readOnly: true, required: true },
    { name: "productName", label: "Product Name", type: "select", contextKey: "productOptions", required: true },
    { name: "sku", label: "SKU", type: "text", placeholder: "Product SKU", required: true },
    { name: "warehouseName", label: "Warehouse", type: "select", contextKey: "warehouseOptions", required: true },
    { name: "onHand", label: "On Hand", type: "number", placeholder: "0", required: true },
    { name: "reservedQty", label: "Reserved Qty", type: "number", placeholder: "0" },
    { name: "reorderLevel", label: "Reorder Level", type: "number", placeholder: "0" },
    { name: "reorderQty", label: "Reorder Qty", type: "number", placeholder: "0" },
    { name: "lastCountedAt", label: "Last Counted At", type: "date" },
    { name: "status", label: "Status", type: "select", options: statusOptions, required: true },
  ],
  fetchRows: fetchInventoryStock,
  fetchNextCode: fetchNextInventoryStockCode,
  createItem: createInventoryStock,
  updateItem: updateInventoryStock,
  deleteRow: deleteInventoryStock,
  buildSummary(rows) {
    const lowStock = rows.filter((row) => toNumber(row.onHand) <= toNumber(row.reorderLevel)).length;
    const totalUnits = rows.reduce((sum, row) => sum + toNumber(row.onHand), 0);
    return [
      { title: "Total Stock Items", value: rows.length, helper: "tracked records" },
      { title: "Low Stock", value: lowStock, helper: "below reorder level" },
      { title: "On Hand", value: totalUnits, helper: "units across warehouses" },
      { title: "Warehouses", value: new Set(rows.map((row) => row.warehouseName).filter(Boolean)).size, helper: "storage locations" },
    ];
  },
  mapRowToForm(row) {
    return {
      stockCode: row.stockCode || "",
      productName: row.productName || "",
      sku: row.sku || "",
      warehouseName: row.warehouseName || "",
      onHand: String(row.onHand ?? "0"),
      reservedQty: String(row.reservedQty ?? "0"),
      reorderLevel: String(row.reorderLevel ?? "0"),
      reorderQty: String(row.reorderQty ?? "0"),
      lastCountedAt: row.lastCountedAt || "",
      status: row.status || "Active",
    };
  },
  mapFormToApi(form) {
    return {
      stockCode: String(form.stockCode || "").trim(),
      productName: String(form.productName || "").trim(),
      sku: String(form.sku || "").trim(),
      warehouseName: String(form.warehouseName || "").trim(),
      onHand: toNumber(form.onHand),
      reservedQty: toNumber(form.reservedQty),
      reorderLevel: toNumber(form.reorderLevel),
      reorderQty: toNumber(form.reorderQty),
      lastCountedAt: normalizeDate(form.lastCountedAt),
      status: String(form.status || "Active").trim(),
    };
  },
  loadContext: async () => {
    const [products, warehouses] = await Promise.all([fetchInventoryProducts(), fetchInventoryWarehouses()]);
    return {
      productOptions: (products || []).map((row) => ({ value: row.name, label: `${row.name} (${row.sku})` })),
      warehouseOptions: (warehouses || []).map((row) => ({ value: row.name, label: row.name })),
    };
  },
};

export const suppliersConfig = {
  title: "Suppliers",
  label: "supplier",
  labelPlural: "suppliers",
  listTitle: "Supplier Directory",
  description: "Vendor master data for procurement and purchase orders.",
  formTitle: "Add Supplier",
  formDescription: "Create or update supplier records.",
  listRoute: "/inventory/suppliers",
  newRoute: "/inventory/suppliers/new",
  editRoute: (code) => `/inventory/suppliers/${encodeURIComponent(code)}/edit`,
  addLabel: "+ New Supplier",
  columns: [
    { header: "Code", accessor: "supplierCode" },
    { header: "Supplier", accessor: "name" },
    { header: "Contact", accessor: "contactPerson" },
    { header: "Email", accessor: "email" },
    { header: "Phone", accessor: "phone" },
    { header: "City", accessor: "city" },
    { header: "Status", accessor: "status" },
  ],
  searchFields: ["supplierCode", "name", "contactPerson", "email", "city", "status"],
  pageSize: 8,
  statusFilters: baseStatusFilters,
  codeField: "supplierCode",
  emptyForm: {
    supplierCode: "",
    name: "",
    contactPerson: "",
    email: "",
    phone: "",
    city: "",
    country: "",
    gstNumber: "",
    paymentTerms: "",
    status: "Active",
  },
  fields: [
    { name: "supplierCode", label: "Supplier Code", type: "text", readOnly: true, required: true },
    { name: "name", label: "Supplier Name", type: "text", required: true, placeholder: "Supplier company name" },
    { name: "contactPerson", label: "Contact Person", type: "text", required: true },
    { name: "email", label: "Email", type: "email", required: true },
    { name: "phone", label: "Phone", type: "text" },
    { name: "city", label: "City", type: "text" },
    { name: "country", label: "Country", type: "text" },
    { name: "gstNumber", label: "GST Number", type: "text" },
    { name: "paymentTerms", label: "Payment Terms", type: "text" },
    { name: "status", label: "Status", type: "select", options: statusOptions, required: true },
  ],
  fetchRows: fetchInventorySuppliers,
  fetchNextCode: fetchNextInventorySupplierCode,
  createItem: createInventorySupplier,
  updateItem: updateInventorySupplier,
  deleteRow: deleteInventorySupplier,
  buildSummary(rows) {
    return [
      { title: "Total Suppliers", value: rows.length, helper: "vendor masters" },
      { title: "Active", value: rows.filter((row) => row.status === "Active").length, helper: "approved suppliers" },
      { title: "Cities", value: new Set(rows.map((row) => row.city).filter(Boolean)).size, helper: "locations served" },
      { title: "Countries", value: new Set(rows.map((row) => row.country).filter(Boolean)).size, helper: "reach" },
    ];
  },
  mapRowToForm(row) {
    return {
      supplierCode: row.supplierCode || "",
      name: row.name || "",
      contactPerson: row.contactPerson || "",
      email: row.email || "",
      phone: row.phone || "",
      city: row.city || "",
      country: row.country || "",
      gstNumber: row.gstNumber || "",
      paymentTerms: row.paymentTerms || "",
      status: row.status || "Active",
    };
  },
  mapFormToApi(form) {
    return {
      supplierCode: String(form.supplierCode || "").trim(),
      name: String(form.name || "").trim(),
      contactPerson: String(form.contactPerson || "").trim(),
      email: String(form.email || "").trim(),
      phone: String(form.phone || "").trim(),
      city: String(form.city || "").trim(),
      country: String(form.country || "").trim(),
      gstNumber: String(form.gstNumber || "").trim(),
      paymentTerms: String(form.paymentTerms || "").trim(),
      status: String(form.status || "Active").trim(),
    };
  },
};

export const warehousesConfig = {
  title: "Warehouses",
  label: "warehouse",
  labelPlural: "warehouses",
  listTitle: "Warehouse Locations",
  description: "Physical storage locations and capacity management.",
  formTitle: "Add Warehouse",
  formDescription: "Create or update warehouse records.",
  listRoute: "/inventory/warehouses",
  newRoute: "/inventory/warehouses/new",
  editRoute: (code) => `/inventory/warehouses/${encodeURIComponent(code)}/edit`,
  addLabel: "+ New Warehouse",
  columns: [
    { header: "Code", accessor: "warehouseCode" },
    { header: "Warehouse", accessor: "name" },
    { header: "Location", accessor: "location" },
    { header: "Capacity", accessor: "capacity" },
    { header: "Occupied", accessor: "occupied" },
    { header: "Manager", accessor: "managerName" },
    { header: "Status", accessor: "status" },
  ],
  searchFields: ["warehouseCode", "name", "location", "managerName", "status"],
  pageSize: 8,
  statusFilters: baseStatusFilters,
  codeField: "warehouseCode",
  emptyForm: {
    warehouseCode: "",
    name: "",
    location: "",
    capacity: "0",
    occupied: "0",
    managerName: "",
    status: "Active",
  },
  fields: [
    { name: "warehouseCode", label: "Warehouse Code", type: "text", readOnly: true, required: true },
    { name: "name", label: "Warehouse Name", type: "text", required: true },
    { name: "location", label: "Location", type: "text", required: true },
    { name: "capacity", label: "Capacity", type: "number", required: true },
    { name: "occupied", label: "Occupied", type: "number" },
    { name: "managerName", label: "Manager", type: "text" },
    { name: "status", label: "Status", type: "select", options: statusOptions, required: true },
  ],
  fetchRows: fetchInventoryWarehouses,
  fetchNextCode: fetchNextInventoryWarehouseCode,
  createItem: createInventoryWarehouse,
  updateItem: updateInventoryWarehouse,
  deleteRow: deleteInventoryWarehouse,
  buildSummary(rows) {
    const totalCapacity = rows.reduce((sum, row) => sum + toNumber(row.capacity), 0);
    const occupied = rows.reduce((sum, row) => sum + toNumber(row.occupied), 0);
    const utilization = totalCapacity ? ((occupied / totalCapacity) * 100).toFixed(1) : "0.0";
    return [
      { title: "Total Warehouses", value: rows.length, helper: "storage locations" },
      { title: "Capacity", value: totalCapacity, helper: "units" },
      { title: "Occupied", value: occupied, helper: `${utilization}% utilization` },
      { title: "Available", value: Math.max(totalCapacity - occupied, 0), helper: "free units" },
    ];
  },
  mapRowToForm(row) {
    return {
      warehouseCode: row.warehouseCode || "",
      name: row.name || "",
      location: row.location || "",
      capacity: String(row.capacity ?? "0"),
      occupied: String(row.occupied ?? "0"),
      managerName: row.managerName || "",
      status: row.status || "Active",
    };
  },
  mapFormToApi(form) {
    return {
      warehouseCode: String(form.warehouseCode || "").trim(),
      name: String(form.name || "").trim(),
      location: String(form.location || "").trim(),
      capacity: toNumber(form.capacity),
      occupied: toNumber(form.occupied),
      managerName: String(form.managerName || "").trim(),
      status: String(form.status || "Active").trim(),
    };
  },
};

export const purchaseOrdersConfig = {
  title: "Purchase Orders",
  label: "purchase order",
  labelPlural: "purchase orders",
  listTitle: "Purchase Orders",
  description: "Supplier ordering, receiving schedules, and PDF output.",
  formTitle: "Create Purchase Order",
  formDescription: "Create or update purchase order records.",
  listRoute: "/inventory/purchase-orders",
  newRoute: "/inventory/purchase-orders/new",
  editRoute: (code) => `/inventory/purchase-orders/${encodeURIComponent(code)}/edit`,
  addLabel: "+ Create PO",
  columns: [
    { header: "PO Number", accessor: "poNumber" },
    { header: "Supplier", accessor: "supplierName" },
    { header: "Warehouse", accessor: "warehouseName" },
    { header: "Items", accessor: "itemCount" },
    { header: "Amount", accessor: "amount" },
    { header: "Order Date", accessor: "orderDate" },
    { header: "Due Date", accessor: "dueDate" },
    { header: "Status", accessor: "status" },
  ],
  searchFields: ["poNumber", "supplierName", "warehouseName", "status", "itemsText"],
  pageSize: 8,
  statusFilters: ["All", "Pending", "Confirmed", "In Transit", "Delivered"],
  codeField: "poNumber",
  emptyForm: {
    poNumber: "",
    supplierName: "",
    warehouseName: "",
    items: "",
    amount: "0",
    orderDate: "",
    dueDate: "",
    status: "Pending",
    notes: "",
  },
  fields: [
    { name: "poNumber", label: "PO Number", type: "text", readOnly: true, required: true },
    { name: "supplierName", label: "Supplier", type: "select", contextKey: "supplierOptions", required: true },
    { name: "warehouseName", label: "Warehouse", type: "select", contextKey: "warehouseOptions", required: true },
    { name: "items", label: "Items", type: "textarea", fullWidth: true, required: true, rows: 5, placeholder: "One item per line" },
    { name: "amount", label: "Amount", type: "number", step: "0.01", placeholder: "0.00" },
    { name: "orderDate", label: "Order Date", type: "date", required: true },
    { name: "dueDate", label: "Due Date", type: "date", required: true },
    { name: "status", label: "Status", type: "select", options: ["Pending", "Confirmed", "In Transit", "Delivered"], required: true },
    { name: "notes", label: "Notes", type: "textarea", fullWidth: true, placeholder: "Optional notes" },
  ],
  fetchRows: fetchInventoryPurchaseOrders,
  fetchNextCode: fetchNextInventoryPurchaseOrderCode,
  createItem: createInventoryPurchaseOrder,
  updateItem: updateInventoryPurchaseOrder,
  deleteRow: deleteInventoryPurchaseOrder,
  buildSummary(rows) {
    const pending = rows.filter((row) => row.status === "Pending").length;
    const outstanding = rows.filter((row) => row.status !== "Delivered").reduce((sum, row) => sum + toNumber(row.amount), 0);
    return [
      { title: "Total POs", value: rows.length, helper: "saved in database" },
      { title: "Pending", value: pending, helper: "awaiting processing" },
      { title: "Outstanding", value: formatCurrency(outstanding), helper: "open order value" },
      { title: "Delivered", value: rows.filter((row) => row.status === "Delivered").length, helper: "closed orders" },
    ];
  },
  mapRowToForm(row) {
    return {
      poNumber: row.poNumber || "",
      supplierName: row.supplierName || "",
      warehouseName: row.warehouseName || "",
      items: Array.isArray(row.items) ? row.items.join("\n") : row.itemsText || "",
      amount: row.amount || "0",
      orderDate: row.orderDate || "",
      dueDate: row.dueDate || "",
      status: row.status || "Pending",
      notes: row.notes || "",
    };
  },
  mapFormToApi(form) {
    return {
      poNumber: String(form.poNumber || "").trim(),
      supplierName: String(form.supplierName || "").trim(),
      warehouseName: String(form.warehouseName || "").trim(),
      items: String(form.items || "")
        .split(/\r?\n/)
        .map((item) => item.trim())
        .filter(Boolean),
      amount: toNumber(form.amount),
      orderDate: String(form.orderDate || "").trim(),
      dueDate: String(form.dueDate || "").trim(),
      status: String(form.status || "Pending").trim(),
      notes: String(form.notes || "").trim(),
    };
  },
  loadContext: async () => {
    const [suppliers, warehouses] = await Promise.all([fetchInventorySuppliers(), fetchInventoryWarehouses()]);
    return {
      supplierOptions: (suppliers || []).map((row) => ({ value: row.name, label: row.name })),
      warehouseOptions: (warehouses || []).map((row) => ({ value: row.name, label: row.name })),
    };
  },
  renderActions: async (row) => row,
  extraActionLabel: "PDF",
  async extraAction(row) {
    const blob = await downloadInventoryPurchaseOrderPdf(row.poNumber);
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank", "noopener,noreferrer");
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  },
};

export const adjustmentsConfig = {
  title: "Adjustments",
  label: "adjustment",
  labelPlural: "adjustments",
  listTitle: "Stock Adjustments",
  description: "Inventory corrections, transfers, returns, and reconciliations.",
  formTitle: "Create Adjustment",
  formDescription: "Create or update adjustment records.",
  listRoute: "/inventory/adjustments",
  newRoute: "/inventory/adjustments/new",
  editRoute: (code) => `/inventory/adjustments/${encodeURIComponent(code)}/edit`,
  addLabel: "+ New Adjustment",
  columns: [
    { header: "Code", accessor: "adjustmentCode" },
    { header: "Date", accessor: "date" },
    { header: "Product", accessor: "productName" },
    { header: "Warehouse", accessor: "warehouseName" },
    { header: "Type", accessor: "type" },
    { header: "Qty", accessor: "quantity" },
    { header: "Approved By", accessor: "approvedBy" },
    { header: "Status", accessor: "status" },
  ],
  searchFields: ["adjustmentCode", "productName", "warehouseName", "type", "status", "approvedBy"],
  pageSize: 8,
  statusFilters: ["All", "Pending", "Approved", "Rejected"],
  codeField: "adjustmentCode",
  emptyForm: {
    adjustmentCode: "",
    date: "",
    productName: "",
    warehouseName: "",
    type: "Recount",
    quantity: "0",
    reason: "",
    approvedBy: "",
    status: "Pending",
  },
  fields: [
    { name: "adjustmentCode", label: "Adjustment Code", type: "text", readOnly: true, required: true },
    { name: "date", label: "Date", type: "date", required: true },
    { name: "productName", label: "Product", type: "select", contextKey: "productOptions", required: true },
    { name: "warehouseName", label: "Warehouse", type: "select", contextKey: "warehouseOptions", required: true },
    { name: "type", label: "Type", type: "select", options: ["Recount", "Damage", "Transfer", "Return", "Shrinkage"], required: true },
    { name: "quantity", label: "Quantity (+/-)", type: "number", required: true },
    { name: "reason", label: "Reason", type: "textarea", fullWidth: true },
    { name: "approvedBy", label: "Approved By", type: "text" },
    { name: "status", label: "Status", type: "select", options: ["Pending", "Approved", "Rejected"], required: true },
  ],
  fetchRows: fetchInventoryAdjustments,
  fetchNextCode: fetchNextInventoryAdjustmentCode,
  createItem: createInventoryAdjustment,
  updateItem: updateInventoryAdjustment,
  deleteRow: deleteInventoryAdjustment,
  buildSummary(rows) {
    const added = rows.filter((row) => toNumber(row.quantity) > 0).reduce((sum, row) => sum + toNumber(row.quantity), 0);
    const removed = Math.abs(rows.filter((row) => toNumber(row.quantity) < 0).reduce((sum, row) => sum + toNumber(row.quantity), 0));
    return [
      { title: "Total Adjustments", value: rows.length, helper: "transaction records" },
      { title: "Units Added", value: added, helper: "positive adjustments" },
      { title: "Units Removed", value: removed, helper: "negative adjustments" },
      { title: "Net Change", value: `${added - removed >= 0 ? "+" : ""}${added - removed}`, helper: "inventory variance" },
    ];
  },
  mapRowToForm(row) {
    return {
      adjustmentCode: row.adjustmentCode || "",
      date: row.date || "",
      productName: row.productName || "",
      warehouseName: row.warehouseName || "",
      type: row.type || "Recount",
      quantity: String(row.quantity ?? "0"),
      reason: row.reason || "",
      approvedBy: row.approvedBy || "",
      status: row.status || "Pending",
    };
  },
  mapFormToApi(form) {
    return {
      adjustmentCode: String(form.adjustmentCode || "").trim(),
      date: String(form.date || "").trim(),
      productName: String(form.productName || "").trim(),
      warehouseName: String(form.warehouseName || "").trim(),
      type: String(form.type || "Recount").trim(),
      quantity: toNumber(form.quantity),
      reason: String(form.reason || "").trim(),
      approvedBy: String(form.approvedBy || "").trim(),
      status: String(form.status || "Pending").trim(),
    };
  },
  loadContext: async () => {
    const [products, warehouses] = await Promise.all([fetchInventoryProducts(), fetchInventoryWarehouses()]);
    return {
      productOptions: (products || []).map((row) => ({ value: row.name, label: row.name })),
      warehouseOptions: (warehouses || []).map((row) => ({ value: row.name, label: row.name })),
    };
  },
};

export function getInventoryListConfig(key) {
  const configs = {
    products: productsConfig,
    categories: categoriesConfig,
    stock: stockConfig,
    suppliers: suppliersConfig,
    warehouses: warehousesConfig,
    purchaseOrders: purchaseOrdersConfig,
    adjustments: adjustmentsConfig,
  };

  return configs[key];
}
