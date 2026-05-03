import { getStoredToken } from './auth';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function authHeaders() {
  const token = getStoredToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function parseFileNameFromDisposition(disposition, fallback) {
  if (!disposition) {
    return fallback;
  }

  const utf8Match = disposition.match(/filename\*=UTF-8''([^;]+)/i);
  if (utf8Match?.[1]) {
    return decodeURIComponent(utf8Match[1]);
  }

  const regularMatch = disposition.match(/filename="?([^";]+)"?/i);
  if (regularMatch?.[1]) {
    return regularMatch[1];
  }

  return fallback;
}

function appendIfPresent(formData, key, value) {
  if (value === null || value === undefined) {
    return;
  }

  formData.append(key, value);
}

async function requestMultipart(endpoint, { method = 'POST', formData }) {
  try {
    const response = await fetch(`${API_BASE}/finance${endpoint}`, {
      method,
      headers: authHeaders(),
      body: formData,
    });

    const text = await response.text();
    const data = text ? JSON.parse(text) : {};

    if (!response.ok) {
      throw new Error(data.message || `HTTP ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error('Finance multipart request failed:', error);
    throw error;
  }
}

async function downloadFinanceFile(endpoint, fallbackName) {
  const response = await fetch(`${API_BASE}/finance${endpoint}`, {
    headers: authHeaders(),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.message || 'Unable to open uploaded file');
  }

  const blob = await response.blob();
  const fileName = parseFileNameFromDisposition(
    response.headers.get('content-disposition'),
    fallbackName,
  );

  return {
    blob,
    fileName,
  };
}

async function request(endpoint, options = {}) {
  const token = getStoredToken();
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE}/finance${endpoint}`, {
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
  } catch (error) {
    console.error('Finance API request failed:', error);
    throw error;
  }
}

export async function reconcileDeliveredSalesIncome() {
  const result = await request('/income/reconcile-sales', {
    method: 'POST',
  });

  return result.data || [];
}

export async function fetchFinanceIncome() {
  await reconcileDeliveredSalesIncome();

  const result = await request('/income');
  return (result.data || []).map((income) => ({
    id: income.id,
    code: income.incomeCode,
    sourceType: income.sourceType,
    sourceCode: income.sourceCode,
    sourceName: income.sourceName,
    receivedDate: income.receivedDate,
    amount: Number(income.amount || 0),
    status: income.status,
    reference: income.reference,
    attachmentName: income.attachmentName,
    attachmentMimeType: income.attachmentMimeType,
    attachmentSizeBytes: Number(income.attachmentSizeBytes || 0),
    hasAttachment: Boolean(income.hasAttachment),
  }));
}

export async function fetchNextFinanceIncomeCode() {
  const result = await request('/income/next-code');
  return result.code;
}

export async function createFinanceIncome(data) {
  const formData = new FormData();
  appendIfPresent(formData, 'sourceType', data.sourceType || 'Manual');
  appendIfPresent(formData, 'sourceCode', data.sourceCode || '');
  appendIfPresent(formData, 'sourceName', data.sourceName);
  appendIfPresent(formData, 'receivedDate', data.receivedDate);
  appendIfPresent(formData, 'amount', data.amount);
  appendIfPresent(formData, 'status', data.status || 'Received');
  appendIfPresent(formData, 'reference', data.reference || '');
  appendIfPresent(formData, 'notes', data.notes || '');
  if (data.attachmentFile) {
    formData.append('file', data.attachmentFile);
  }

  const result = await requestMultipart('/income', {
    method: 'POST',
    formData,
  });

  return result.data;
}

export async function updateFinanceIncome(incomeCode, data) {
  const formData = new FormData();
  appendIfPresent(formData, 'sourceType', data.sourceType || 'Manual');
  appendIfPresent(formData, 'sourceCode', data.sourceCode || '');
  appendIfPresent(formData, 'sourceName', data.sourceName);
  appendIfPresent(formData, 'receivedDate', data.receivedDate);
  appendIfPresent(formData, 'amount', data.amount);
  appendIfPresent(formData, 'status', data.status);
  appendIfPresent(formData, 'reference', data.reference || '');
  appendIfPresent(formData, 'notes', data.notes || '');
  if (data.attachmentFile) {
    formData.append('file', data.attachmentFile);
  }

  const result = await requestMultipart(`/income/${incomeCode}`, {
    method: 'PATCH',
    formData,
  });

  return result.data;
}

export async function downloadFinanceIncomeAttachment(incomeCode) {
  return downloadFinanceFile(`/income/${encodeURIComponent(incomeCode)}/file`, `${incomeCode}.bin`);
}

export async function deleteFinanceIncome(incomeCode) {
  await request(`/income/${incomeCode}`, {
    method: 'DELETE',
  });
}

export async function fetchFinanceExpenses() {
  const result = await request('/expenses');
  return (result.data || []).map((expense) => ({
    id: expense.id,
    code: expense.expenseCode,
    expenseDate: expense.expenseDate,
    category: expense.category,
    description: expense.description,
    amount: Number(expense.amount || 0),
    status: expense.status,
    attachmentName: expense.attachmentName,
    attachmentMimeType: expense.attachmentMimeType,
    attachmentSizeBytes: Number(expense.attachmentSizeBytes || 0),
    hasAttachment: Boolean(expense.hasAttachment),
  }));
}

export async function fetchNextFinanceExpenseCode() {
  const result = await request('/expenses/next-code');
  return result.code;
}

export async function createFinanceExpense(data) {
  const formData = new FormData();
  appendIfPresent(formData, 'expenseDate', data.expenseDate);
  appendIfPresent(formData, 'category', data.category);
  appendIfPresent(formData, 'description', data.description);
  appendIfPresent(formData, 'amount', data.amount);
  appendIfPresent(formData, 'status', data.status || 'Pending');
  appendIfPresent(formData, 'notes', data.notes || '');
  if (data.attachmentFile) {
    formData.append('file', data.attachmentFile);
  }

  const result = await requestMultipart('/expenses', {
    method: 'POST',
    formData,
  });

  return result.data;
}

export async function updateFinanceExpense(expenseCode, data) {
  const formData = new FormData();
  appendIfPresent(formData, 'expenseDate', data.expenseDate);
  appendIfPresent(formData, 'category', data.category);
  appendIfPresent(formData, 'description', data.description);
  appendIfPresent(formData, 'amount', data.amount);
  appendIfPresent(formData, 'status', data.status);
  appendIfPresent(formData, 'notes', data.notes || '');
  if (data.attachmentFile) {
    formData.append('file', data.attachmentFile);
  }

  const result = await requestMultipart(`/expenses/${expenseCode}`, {
    method: 'PATCH',
    formData,
  });

  return result.data;
}

export async function downloadFinanceExpenseAttachment(expenseCode) {
  return downloadFinanceFile(`/expenses/${encodeURIComponent(expenseCode)}/file`, `${expenseCode}.bin`);
}

export async function deleteFinanceExpense(expenseCode) {
  await request(`/expenses/${expenseCode}`, {
    method: 'DELETE',
  });
}

export async function fetchFinancePayments() {
  const result = await request('/payments');
  return (result.data || []).map((payment) => ({
    id: payment.id,
    code: payment.paymentCode,
    paymentDate: payment.paymentDate,
    vendorName: payment.vendorName,
    incomeCode: payment.incomeCode,
    amount: Number(payment.amount || 0),
    method: payment.method,
    status: payment.status,
    reference: payment.reference,
  }));
}

export async function fetchNextFinancePaymentCode() {
  const result = await request('/payments/next-code');
  return result.code;
}

export async function createFinancePayment(data) {
  const result = await request('/payments', {
    method: 'POST',
    body: JSON.stringify({
      paymentDate: data.paymentDate,
      vendorName: data.vendorName,
      incomeCode: data.incomeCode,
      amount: data.amount,
      method: data.method,
      status: data.status || 'Pending',
      reference: data.reference || '',
      notes: data.notes || '',
    }),
  });

  return result.data;
}

export async function updateFinancePayment(paymentCode, data) {
  const result = await request(`/payments/${paymentCode}`, {
    method: 'PATCH',
    body: JSON.stringify({
      paymentDate: data.paymentDate,
      vendorName: data.vendorName,
      incomeCode: data.incomeCode,
      amount: data.amount,
      method: data.method,
      status: data.status,
      reference: data.reference || '',
      notes: data.notes || '',
    }),
  });

  return result.data;
}

export async function deleteFinancePayment(paymentCode) {
  await request(`/payments/${paymentCode}`, {
    method: 'DELETE',
  });
}

export async function fetchFinanceDashboard() {
  const result = await request('/dashboard');
  return result.data || {};
}
