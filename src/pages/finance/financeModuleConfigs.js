import {
  fetchFinanceIncome,
  fetchNextFinanceIncomeCode,
  createFinanceIncome,
  updateFinanceIncome,
  deleteFinanceIncome,
  fetchFinanceExpenses,
  fetchNextFinanceExpenseCode,
  createFinanceExpense,
  updateFinanceExpense,
  deleteFinanceExpense,
  fetchFinancePayments,
  fetchNextFinancePaymentCode,
  createFinancePayment,
  updateFinancePayment,
  deleteFinancePayment,
  fetchFinanceDashboard,
} from '../../utils/financeApi';

export const financeIncomeConfig = {
  pageTitle: 'Finance Income',
  label: 'Income',
  labelPlural: 'Income Records',
  listTitle: 'Income List',
  addLabel: '+ Add Income',
  searchPlaceholder: 'Search by income code or source...',
  codeField: 'code',
  routeParam: 'incomeCode',
  listRoute: '/finance/income',
  newRoute: '/finance/income/new',
  editRoute: (code) => `/finance/income/${code}/edit`,
  pageSize: 15,
  statusFilters: ['All', 'Received', 'Pending', 'Cancelled'],

  columns: [
    { key: 'code', label: 'Income Code', sortable: true },
    { key: 'sourceName', label: 'Source', sortable: true },
    { key: 'receivedDate', label: 'Received Date', sortable: true },
    { key: 'amount', label: 'Amount', sortable: true, format: (val) => `₹${Number(val || 0).toFixed(2)}` },
    { key: 'status', label: 'Status', sortable: true },
    { key: 'reference', label: 'Reference', sortable: true },
  ],

  searchFields: ['code', 'sourceName', 'status', 'reference'],

  fields: [
    { name: 'code', label: 'Income Code', type: 'text', required: true, readOnly: true },
    { name: 'sourceName', label: 'Source Name', type: 'text', required: true, placeholder: 'Enter source name' },
    { name: 'receivedDate', label: 'Received Date', type: 'date', required: true },
    { name: 'amount', label: 'Amount', type: 'number', required: true, min: 0, step: 0.01, placeholder: '0.00' },
    { name: 'status', label: 'Status', type: 'select', required: true, options: ['Received', 'Pending', 'Cancelled'] },
    { name: 'reference', label: 'Reference', type: 'text', placeholder: 'Transaction or reference id' },
  ],

  emptyForm: {
    code: '',
    sourceName: '',
    receivedDate: new Date().toISOString().split('T')[0],
    amount: 0,
    status: 'Received',
    reference: '',
  },

  fetchRows: fetchFinanceIncome,
  fetchRow: async (code) => {
    const items = await fetchFinanceIncome();
    const item = items.find((x) => x.code === code);
    if (!item) throw new Error('Income record not found');
    return item;
  },
  fetchNextCode: fetchNextFinanceIncomeCode,
  createRow: async (data) => {
    const code = await fetchNextFinanceIncomeCode();
    return createFinanceIncome({ ...data, code });
  },
  updateRow: updateFinanceIncome,
  deleteRow: deleteFinanceIncome,

  rowToForm: (row) => ({
    code: row.code || '',
    sourceName: row.sourceName || '',
    receivedDate: row.receivedDate || new Date().toISOString().split('T')[0],
    amount: Number(row.amount) || 0,
    status: row.status || 'Received',
    reference: row.reference || '',
  }),

  formToRow: (form) => ({
    sourceName: form.sourceName,
    receivedDate: form.receivedDate,
    amount: Number(form.amount) || 0,
    status: form.status,
    reference: form.reference || '',
  }),

  buildSummary: (rows) => {
    const total = rows.length;
    const totalAmount = rows.reduce((sum, row) => sum + (Number(row.amount) || 0), 0);
    const received = rows.filter((row) => String(row.status || '').toLowerCase() === 'received').length;
    const pending = rows.filter((row) => String(row.status || '').toLowerCase() === 'pending').length;

    return [
      { title: 'Total Income Records', value: total, color: '#6366f1' },
      { title: 'Total Income', value: `₹${totalAmount.toFixed(2)}`, color: '#10b981' },
      { title: 'Received', value: received, color: '#8b5cf6' },
      { title: 'Pending', value: pending, color: '#f59e0b' },
    ];
  },
};

export const financeExpensesConfig = {
  pageTitle: 'Finance Expenses',
  label: 'Expense',
  labelPlural: 'Expenses',
  listTitle: 'Expense Log',
  addLabel: '+ Add Expense',
  searchPlaceholder: 'Search by code, category, or description...',
  codeField: 'code',
  routeParam: 'expenseCode',
  listRoute: '/finance/expenses',
  newRoute: '/finance/expenses/new',
  editRoute: (code) => `/finance/expenses/${code}/edit`,
  pageSize: 15,
  statusFilters: ['All', 'Pending', 'Approved', 'Rejected'],

  columns: [
    { key: 'code', label: 'Expense Code', sortable: true },
    { key: 'expenseDate', label: 'Date', sortable: true },
    { key: 'category', label: 'Category', sortable: true },
    { key: 'description', label: 'Description', sortable: true },
    { key: 'amount', label: 'Amount', sortable: true, format: (val) => `₹${Number(val || 0).toFixed(2)}` },
    { key: 'status', label: 'Status', sortable: true },
  ],

  searchFields: ['code', 'category', 'description', 'status'],

  fields: [
    { name: 'code', label: 'Expense Code', type: 'text', required: true, readOnly: true },
    { name: 'expenseDate', label: 'Expense Date', type: 'date', required: true },
    { name: 'category', label: 'Category', type: 'select', required: true, options: ['Salaries', 'Operations', 'Marketing', 'Utilities', 'Others'] },
    { name: 'description', label: 'Description', type: 'text', required: true, placeholder: 'Enter expense description', fullWidth: true },
    { name: 'amount', label: 'Amount', type: 'number', required: true, min: 0, step: 0.01, placeholder: '0.00' },
    { name: 'status', label: 'Status', type: 'select', required: true, options: ['Pending', 'Approved', 'Rejected'] },
  ],

  emptyForm: {
    code: '',
    expenseDate: new Date().toISOString().split('T')[0],
    category: 'Operations',
    description: '',
    amount: 0,
    status: 'Pending',
  },

  fetchRows: fetchFinanceExpenses,
  fetchRow: async (code) => {
    const items = await fetchFinanceExpenses();
    const item = items.find((x) => x.code === code);
    if (!item) throw new Error('Expense not found');
    return item;
  },
  fetchNextCode: fetchNextFinanceExpenseCode,
  createRow: async (data) => {
    const code = await fetchNextFinanceExpenseCode();
    return createFinanceExpense({ ...data, code });
  },
  updateRow: updateFinanceExpense,
  deleteRow: deleteFinanceExpense,

  rowToForm: (row) => ({
    code: row.code || '',
    expenseDate: row.expenseDate || new Date().toISOString().split('T')[0],
    category: row.category || 'Operations',
    description: row.description || '',
    amount: Number(row.amount) || 0,
    status: row.status || 'Pending',
  }),

  formToRow: (form) => ({
    expenseDate: form.expenseDate,
    category: form.category,
    description: form.description,
    amount: Number(form.amount) || 0,
    status: form.status,
  }),

  buildSummary: (rows) => {
    const total = rows.length;
    const totalAmount = rows.reduce((sum, row) => sum + (Number(row.amount) || 0), 0);
    const approved = rows.filter((row) => String(row.status || '').toLowerCase() === 'approved').length;
    const pending = rows.filter((row) => String(row.status || '').toLowerCase() === 'pending').length;

    return [
      { title: 'Total Expenses', value: total, color: '#6366f1' },
      { title: 'Total Spend', value: `₹${totalAmount.toFixed(2)}`, color: '#ef4444' },
      { title: 'Approved', value: approved, color: '#10b981' },
      { title: 'Pending', value: pending, color: '#f59e0b' },
    ];
  },
};

export const financePaymentsConfig = {
  pageTitle: 'Finance Payments',
  label: 'Payment',
  labelPlural: 'Payments',
  listTitle: 'Payment Schedule',
  addLabel: '+ Record Payment',
  searchPlaceholder: 'Search by code, vendor, or income code...',
  codeField: 'code',
  routeParam: 'paymentCode',
  listRoute: '/finance/payments',
  newRoute: '/finance/payments/new',
  editRoute: (code) => `/finance/payments/${code}/edit`,
  pageSize: 15,
  statusFilters: ['All', 'Pending', 'Completed', 'Failed'],

  columns: [
    { key: 'code', label: 'Payment Code', sortable: true },
    { key: 'paymentDate', label: 'Date', sortable: true },
    { key: 'vendorName', label: 'Vendor', sortable: true },
    { key: 'incomeCode', label: 'Income Code', sortable: true },
    { key: 'amount', label: 'Amount', sortable: true, format: (val) => `₹${Number(val || 0).toFixed(2)}` },
    { key: 'method', label: 'Method', sortable: true },
    { key: 'status', label: 'Status', sortable: true },
  ],

  searchFields: ['code', 'vendorName', 'incomeCode', 'method', 'status'],

  fields: [
    { name: 'code', label: 'Payment Code', type: 'text', required: true, readOnly: true },
    { name: 'paymentDate', label: 'Payment Date', type: 'date', required: true },
    { name: 'vendorName', label: 'Vendor Name', type: 'text', required: true, placeholder: 'Enter vendor name' },
    { name: 'incomeCode', label: 'Income Code', type: 'text', placeholder: 'Optional linked income code' },
    { name: 'amount', label: 'Amount', type: 'number', required: true, min: 0, step: 0.01, placeholder: '0.00' },
    { name: 'method', label: 'Payment Method', type: 'select', required: true, options: ['Bank Transfer', 'Check', 'Cash', 'Credit Card', 'UPI'] },
    { name: 'status', label: 'Status', type: 'select', required: true, options: ['Pending', 'Completed', 'Failed'] },
    { name: 'reference', label: 'Reference', type: 'text', placeholder: 'UTR / Check number / reference id' },
  ],

  emptyForm: {
    code: '',
    paymentDate: new Date().toISOString().split('T')[0],
    vendorName: '',
    incomeCode: '',
    amount: 0,
    method: 'Bank Transfer',
    status: 'Pending',
    reference: '',
  },

  fetchRows: fetchFinancePayments,
  fetchRow: async (code) => {
    const items = await fetchFinancePayments();
    const item = items.find((x) => x.code === code);
    if (!item) throw new Error('Payment not found');
    return item;
  },
  fetchNextCode: fetchNextFinancePaymentCode,
  createRow: async (data) => {
    const code = await fetchNextFinancePaymentCode();
    return createFinancePayment({ ...data, code });
  },
  updateRow: updateFinancePayment,
  deleteRow: deleteFinancePayment,

  rowToForm: (row) => ({
    code: row.code || '',
    paymentDate: row.paymentDate || new Date().toISOString().split('T')[0],
    vendorName: row.vendorName || '',
    incomeCode: row.incomeCode || '',
    amount: Number(row.amount) || 0,
    method: row.method || 'Bank Transfer',
    status: row.status || 'Pending',
    reference: row.reference || '',
  }),

  formToRow: (form) => ({
    paymentDate: form.paymentDate,
    vendorName: form.vendorName,
    incomeCode: form.incomeCode,
    amount: Number(form.amount) || 0,
    method: form.method,
    status: form.status,
    reference: form.reference,
  }),

  buildSummary: (rows) => {
    const total = rows.length;
    const paidAmount = rows
      .filter((row) => String(row.status || '').toLowerCase() === 'completed')
      .reduce((sum, row) => sum + (Number(row.amount) || 0), 0);
    const pendingAmount = rows
      .filter((row) => String(row.status || '').toLowerCase() === 'pending')
      .reduce((sum, row) => sum + (Number(row.amount) || 0), 0);
    const completed = rows.filter((row) => String(row.status || '').toLowerCase() === 'completed').length;

    return [
      { title: 'Total Payments', value: total, color: '#6366f1' },
      { title: 'Completed', value: completed, color: '#10b981' },
      { title: 'Amount Paid', value: `₹${paidAmount.toFixed(2)}`, color: '#8b5cf6' },
      { title: 'Pending Amount', value: `₹${pendingAmount.toFixed(2)}`, color: '#f59e0b' },
    ];
  },
};

export const financeDashboardConfig = {
  fetchData: fetchFinanceDashboard,
};
