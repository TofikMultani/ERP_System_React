import {
  fetchSalesCustomers,
  fetchNextCustomerCode,
  createSalesCustomer,
  updateSalesCustomer,
  deleteSalesCustomer,
  fetchSalesOrders,
  fetchNextOrderCode,
  createSalesOrder,
  updateSalesOrder,
  deleteSalesOrder,
  fetchSalesInvoices,
  fetchNextInvoiceCode,
  createSalesInvoice,
  updateSalesInvoice,
  deleteSalesInvoice,
  fetchSalesQuotations,
  fetchNextQuotationCode,
  createSalesQuotation,
  updateSalesQuotation,
  deleteSalesQuotation,
  fetchSalesDashboard,
} from '../../utils/salesApi';
import { downloadInvoicePdf, downloadQuotationPdf } from '../../utils/salesPdf';

// ============================================================================
// CUSTOMERS CONFIG
// ============================================================================

export const customersConfig = {
  pageTitle: 'Sales Customers',
  label: 'Customer',
  labelPlural: 'Customers',
  listTitle: 'Customer List',
  addLabel: '+ New Customer',
  searchPlaceholder: 'Search by name, email, or company...',
  codeField: 'code',
  routeParam: 'customerCode',
  listRoute: '/sales/customers',
  newRoute: '/sales/customers/new',
  editRoute: (code) => `/sales/customers/${code}/edit`,
  pageSize: 15,
  statusFilters: ['All', 'Active', 'Inactive'],

  columns: [
    { key: 'code', label: 'Customer Code', sortable: true },
    { key: 'name', label: 'Name', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'phone', label: 'Phone', sortable: true },
    { key: 'company', label: 'Company', sortable: true },
    { key: 'status', label: 'Status', sortable: true },
    { key: 'creditLimit', label: 'Credit Limit', sortable: true, format: (val) => {
      const amount = Number(val || 0);
      return `₹${amount.toFixed(2)}`;
    }},
  ],

  searchFields: ['code', 'name', 'email', 'company'],

  fields: [
    { name: 'code', label: 'Customer Code', type: 'text', required: true, readOnly: true },
    { name: 'name', label: 'Name', type: 'text', required: true, placeholder: 'Enter customer name' },
    { name: 'email', label: 'Email', type: 'email', required: true, placeholder: 'Enter email address' },
    { name: 'phone', label: 'Phone', type: 'text', placeholder: 'Enter phone number' },
    { name: 'company', label: 'Company', type: 'text', placeholder: 'Enter company name' },
    {
      name: 'status',
      label: 'Status',
      type: 'select',
      required: true,
      options: ['Active', 'Inactive'],
    },
    {
      name: 'creditLimit',
      label: 'Credit Limit',
      type: 'number',
      required: true,
      min: 0,
      step: 0.01,
      placeholder: '0.00',
    },
  ],

  emptyForm: {
    code: '',
    name: '',
    email: '',
    phone: '',
    company: '',
    status: 'Active',
    creditLimit: 0,
  },

  fetchRows: fetchSalesCustomers,
  fetchRow: async (code) => {
    const items = await fetchSalesCustomers();
    const item = items.find((x) => x.code === code);
    if (!item) throw new Error('Customer not found');
    return item;
  },
  fetchNextCode: fetchNextCustomerCode,
  createRow: async (data) => {
    const code = await fetchNextCustomerCode();
    return createSalesCustomer({ ...data, code });
  },
  updateRow: updateSalesCustomer,
  deleteRow: deleteSalesCustomer,

  rowToForm: (row) => ({
    code: row.code || '',
    name: row.name || '',
    email: row.email || '',
    phone: row.phone || '',
    company: row.company || '',
    status: row.status || 'Active',
    creditLimit: row.creditLimit || 0,
  }),

  formToRow: (form) => ({
    name: form.name,
    email: form.email,
    phone: form.phone,
    company: form.company,
    status: form.status,
    creditLimit: Number(form.creditLimit) || 0,
  }),

  buildSummary: (rows) => {
    const total = rows.length;
    const active = rows.filter((r) => String(r.status || '').toLowerCase() === 'active').length;
    const totalCredit = rows.reduce((sum, r) => sum + (Number(r.creditLimit) || 0), 0);

    return [
      {
        title: 'Total Customers',
        value: total,
        color: '#6366f1',
      },
      {
        title: 'Active Customers',
        value: active,
        color: '#10b981',
      },
      {
        title: 'Total Credit Limit',
        value: `₹${totalCredit.toFixed(2)}`,
        color: '#f59e0b',
      },
    ];
  },
};

// ============================================================================
// ORDERS CONFIG
// ============================================================================

export const ordersConfig = {
  pageTitle: 'Sales Orders',
  label: 'Order',
  labelPlural: 'Orders',
  listTitle: 'Order List',
  addLabel: '+ New Order',
  searchPlaceholder: 'Search by order number or customer code...',
  codeField: 'code',
  routeParam: 'orderNumber',
  listRoute: '/sales/orders',
  newRoute: '/sales/orders/new',
  editRoute: (code) => `/sales/orders/${code}/edit`,
  pageSize: 15,
  statusFilters: ['All', 'Processing', 'Shipped', 'Delivered'],

  columns: [
    { key: 'code', label: 'Order Number', sortable: true },
    { key: 'customerCode', label: 'Customer Code', sortable: true },
    { key: 'orderDate', label: 'Order Date', sortable: true },
    { key: 'amount', label: 'Amount', sortable: true, format: (val) => `₹${val.toFixed(2)}` },
    { key: 'itemCount', label: 'Items', sortable: true },
    { key: 'status', label: 'Status', sortable: true },
  ],

  searchFields: ['code', 'customerCode'],

  fields: [
    { name: 'code', label: 'Order Number', type: 'text', required: true, readOnly: true },
    { name: 'customerCode', label: 'Customer Code', type: 'select', required: true, optionsFrom: 'customerOptions' },
    { name: 'customerName', label: 'Customer Name', type: 'text', readOnly: true },
    { name: 'orderDate', label: 'Order Date', type: 'date', required: true },
    {
      name: 'amount',
      label: 'Amount',
      type: 'number',
      required: true,
      min: 0,
      step: 0.01,
      placeholder: '0.00',
    },
    {
      name: 'itemCount',
      label: 'Item Count',
      type: 'number',
      required: true,
      min: 0,
      step: 1,
      placeholder: '0',
    },
    {
      name: 'status',
      label: 'Status',
      type: 'select',
      required: true,
      options: ['Processing', 'Shipped', 'Delivered'],
    },
  ],

  emptyForm: {
    code: '',
    customerCode: '',
    customerName: '',
    orderDate: new Date().toISOString().split('T')[0],
    amount: 0,
    itemCount: 0,
    status: 'Processing',
  },

  fetchRows: fetchSalesOrders,
  fetchRow: async (code) => {
    const items = await fetchSalesOrders();
    const item = items.find((x) => x.code === code);
    if (!item) throw new Error('Order not found');
    return item;
  },
  fetchNextCode: fetchNextOrderCode,
  createRow: async (data) => {
    const code = await fetchNextOrderCode();
    return createSalesOrder({ ...data, code });
  },
  updateRow: updateSalesOrder,
  deleteRow: deleteSalesOrder,

  rowToForm: (row) => ({
    code: row.code || '',
    customerCode: row.customerCode || '',
    customerName: row.customerName || '',
    orderDate: row.orderDate || new Date().toISOString().split('T')[0],
    amount: row.amount || 0,
    itemCount: row.itemCount || 0,
    status: row.status || 'Processing',
  }),

  formToRow: (form) => ({
    customerCode: form.customerCode,
    customerName: form.customerName,
    orderDate: form.orderDate,
    amount: Number(form.amount) || 0,
    itemCount: Number(form.itemCount) || 0,
    status: form.status,
  }),

  loadContext: async () => {
    const customers = await fetchSalesCustomers();
    return {
      customers,
      customerOptions: (customers || []).map((customer) => ({
        value: customer.code || customer.customerCode,
        label: `${customer.code || customer.customerCode} - ${customer.name || customer.customerName}`,
      })),
    };
  },

  buildSummary: (rows) => {
    const total = rows.length;
    const totalRevenue = rows.reduce((sum, r) => sum + (Number(r.amount) || 0), 0);
    const delivered = rows.filter((r) => String(r.status || '').toLowerCase() === 'delivered').length;

    return [
      {
        title: 'Total Orders',
        value: total,
        color: '#6366f1',
      },
      {
        title: 'Total Revenue',
        value: `₹${totalRevenue.toFixed(2)}`,
        color: '#10b981',
      },
      {
        title: 'Delivered',
        value: delivered,
        color: '#8b5cf6',
      },
    ];
  },
};

// ============================================================================
// INVOICES CONFIG
// ============================================================================

export const invoicesConfig = {
  pageTitle: 'Sales Invoices',
  label: 'Invoice',
  labelPlural: 'Invoices',
  listTitle: 'Invoice List',
  addLabel: '+ New Invoice',
  searchPlaceholder: 'Search by invoice number or customer code...',
  codeField: 'code',
  routeParam: 'invoiceNumber',
  listRoute: '/sales/invoices',
  newRoute: '/sales/invoices/new',
  editRoute: (code) => `/sales/invoices/${code}/edit`,
  pageSize: 15,
  statusFilters: ['All', 'Pending', 'Paid', 'Overdue'],

  columns: [
    { key: 'code', label: 'Invoice Number', sortable: true },
    { key: 'customerCode', label: 'Customer Code', sortable: true },
    { key: 'invoiceDate', label: 'Invoice Date', sortable: true },
    { key: 'dueDate', label: 'Due Date', sortable: true },
    { key: 'amount', label: 'Amount', sortable: true, format: (val) => `₹${val.toFixed(2)}` },
    { key: 'status', label: 'Status', sortable: true },
  ],

  searchFields: ['code', 'customerCode'],

  fields: [
    { name: 'code', label: 'Invoice Number', type: 'text', required: true, readOnly: true },
    { name: 'customerCode', label: 'Customer Code', type: 'select', required: true, optionsFrom: 'customerOptions' },
    { name: 'customerName', label: 'Customer Name', type: 'text', readOnly: true },
    { name: 'invoiceDate', label: 'Invoice Date', type: 'date', required: true },
    { name: 'dueDate', label: 'Due Date', type: 'date', required: true },
    {
      name: 'amount',
      label: 'Amount',
      type: 'number',
      required: true,
      min: 0,
      step: 0.01,
      placeholder: '0.00',
    },
    {
      name: 'status',
      label: 'Status',
      type: 'select',
      required: true,
      options: ['Pending', 'Paid', 'Overdue'],
    },
    { name: 'paymentDate', label: 'Payment Date', type: 'date', placeholder: 'Leave blank if not paid' },
  ],

  emptyForm: {
    code: '',
    customerCode: '',
    customerName: '',
    invoiceDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    amount: 0,
    status: 'Pending',
    paymentDate: '',
  },

  fetchRows: fetchSalesInvoices,
  fetchRow: async (code) => {
    const items = await fetchSalesInvoices();
    const item = items.find((x) => x.code === code);
    if (!item) throw new Error('Invoice not found');
    return item;
  },
  fetchNextCode: fetchNextInvoiceCode,
  createRow: async (data) => {
    const code = await fetchNextInvoiceCode();
    return createSalesInvoice({ ...data, code });
  },
  updateRow: updateSalesInvoice,
  deleteRow: deleteSalesInvoice,

  rowToForm: (row) => ({
    code: row.code || '',
    customerCode: row.customerCode || '',
    customerName: row.customerName || '',
    invoiceDate: row.invoiceDate || new Date().toISOString().split('T')[0],
    dueDate: row.dueDate || '',
    amount: row.amount || 0,
    status: row.status || 'Pending',
    paymentDate: row.paymentDate || '',
  }),

  formToRow: (form) => ({
    customerCode: form.customerCode,
    customerName: form.customerName,
    invoiceDate: form.invoiceDate,
    dueDate: form.dueDate,
    amount: Number(form.amount) || 0,
    status: form.status,
    paymentDate: form.paymentDate || null,
  }),

  loadContext: async () => {
    const customers = await fetchSalesCustomers();
    return {
      customers,
      customerOptions: (customers || []).map((customer) => ({
        value: customer.code || customer.customerCode,
        label: `${customer.code || customer.customerCode} - ${customer.name || customer.customerName}`,
      })),
    };
  },

  buildSummary: (rows) => {
    const total = rows.length;
    const totalAmount = rows.reduce((sum, r) => sum + (Number(r.amount) || 0), 0);
    const paid = rows.filter((r) => String(r.status || '').toLowerCase() === 'paid').length;

    return [
      {
        title: 'Total Invoices',
        value: total,
        color: '#6366f1',
      },
      {
        title: 'Total Amount',
        value: `₹${totalAmount.toFixed(2)}`,
        color: '#10b981',
      },
      {
        title: 'Paid',
        value: paid,
        color: '#8b5cf6',
      },
    ];
  },
  extraActionLabel: 'Download PDF',
  extraAction: (row) => {
    downloadInvoicePdf(row);
  },
};

// ============================================================================
// QUOTATIONS CONFIG
// ============================================================================

export const quotationsConfig = {
  pageTitle: 'Sales Quotations',
  label: 'Quotation',
  labelPlural: 'Quotations',
  listTitle: 'Quotation List',
  addLabel: '+ New Quotation',
  searchPlaceholder: 'Search by quotation number or customer code...',
  codeField: 'code',
  routeParam: 'quotationNumber',
  listRoute: '/sales/quotations',
  newRoute: '/sales/quotations/new',
  editRoute: (code) => `/sales/quotations/${code}/edit`,
  pageSize: 15,
  statusFilters: ['All', 'Sent', 'Pending', 'Approved', 'Expired'],

  columns: [
    { key: 'code', label: 'Quotation Number', sortable: true },
    { key: 'customerCode', label: 'Customer Code', sortable: true },
    { key: 'quotationDate', label: 'Quote Date', sortable: true },
    { key: 'expiryDate', label: 'Expiry Date', sortable: true },
    { key: 'amount', label: 'Amount', sortable: true, format: (val) => `₹${val.toFixed(2)}` },
    { key: 'status', label: 'Status', sortable: true },
  ],

  searchFields: ['code', 'customerCode'],

  fields: [
    { name: 'code', label: 'Quotation Number', type: 'text', required: true, readOnly: true },
    { name: 'customerCode', label: 'Customer Code', type: 'select', required: true, optionsFrom: 'customerOptions' },
    { name: 'customerName', label: 'Customer Name', type: 'text', readOnly: true },
    { name: 'quotationDate', label: 'Quotation Date', type: 'date', required: true },
    { name: 'expiryDate', label: 'Expiry Date', type: 'date', required: true },
    {
      name: 'amount',
      label: 'Amount',
      type: 'number',
      required: true,
      min: 0,
      step: 0.01,
      placeholder: '0.00',
    },
    {
      name: 'status',
      label: 'Status',
      type: 'select',
      required: true,
      options: ['Sent', 'Pending', 'Approved', 'Expired'],
    },
    {
      name: 'conversionStatus',
      label: 'Conversion Status',
      type: 'select',
      required: true,
      options: ['Pending', 'Converted', 'Lost'],
    },
  ],

  emptyForm: {
    code: '',
    customerCode: '',
    customerName: '',
    quotationDate: new Date().toISOString().split('T')[0],
    expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    amount: 0,
    status: 'Sent',
    conversionStatus: 'Pending',
  },

  fetchRows: fetchSalesQuotations,
  fetchRow: async (code) => {
    const items = await fetchSalesQuotations();
    const item = items.find((x) => x.code === code);
    if (!item) throw new Error('Quotation not found');
    return item;
  },
  fetchNextCode: fetchNextQuotationCode,
  createRow: async (data) => {
    const code = await fetchNextQuotationCode();
    return createSalesQuotation({ ...data, code });
  },
  updateRow: updateSalesQuotation,
  deleteRow: deleteSalesQuotation,

  rowToForm: (row) => ({
    code: row.code || '',
    customerCode: row.customerCode || '',
    customerName: row.customerName || '',
    quotationDate: row.quotationDate || new Date().toISOString().split('T')[0],
    expiryDate: row.expiryDate || '',
    amount: row.amount || 0,
    status: row.status || 'Sent',
    conversionStatus: row.conversionStatus || 'Pending',
  }),

  formToRow: (form) => ({
    customerCode: form.customerCode,
    customerName: form.customerName,
    quotationDate: form.quotationDate,
    expiryDate: form.expiryDate,
    amount: Number(form.amount) || 0,
    status: form.status,
    conversionStatus: form.conversionStatus,
  }),

  loadContext: async () => {
    const customers = await fetchSalesCustomers();
    return {
      customers,
      customerOptions: (customers || []).map((customer) => ({
        value: customer.code || customer.customerCode,
        label: `${customer.code || customer.customerCode} - ${customer.name || customer.customerName}`,
      })),
    };
  },

  buildSummary: (rows) => {
    const total = rows.length;
    const totalValue = rows.reduce((sum, r) => sum + (Number(r.amount) || 0), 0);
    const approved = rows.filter((r) => String(r.status || '').toLowerCase() === 'approved').length;

    return [
      {
        title: 'Total Quotations',
        value: total,
        color: '#6366f1',
      },
      {
        title: 'Total Value',
        value: `₹${totalValue.toFixed(2)}`,
        color: '#10b981',
      },
      {
        title: 'Approved',
        value: approved,
        color: '#8b5cf6',
      },
    ];
  },
  extraActionLabel: 'Download PDF',
  extraAction: (row) => {
    downloadQuotationPdf(row);
  },
};

// Dashboard config
export const salesDashboardConfig = {
  fetchData: fetchSalesDashboard,
};
