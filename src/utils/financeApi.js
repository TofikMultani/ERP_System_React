import { getStoredToken } from './auth';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

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

export async function fetchFinanceIncome() {
  const result = await request('/income');
  return (result.data || []).map((income) => ({
    id: income.id,
    code: income.incomeCode,
    sourceName: income.sourceName,
    receivedDate: income.receivedDate,
    amount: Number(income.amount || 0),
    status: income.status,
    reference: income.reference,
  }));
}

export async function fetchNextFinanceIncomeCode() {
  const result = await request('/income/next-code');
  return result.code;
}

export async function createFinanceIncome(data) {
  const result = await request('/income', {
    method: 'POST',
    body: JSON.stringify({
      sourceName: data.sourceName,
      receivedDate: data.receivedDate,
      amount: data.amount,
      status: data.status || 'Received',
      reference: data.reference || '',
      notes: data.notes || '',
    }),
  });

  return result.data;
}

export async function updateFinanceIncome(incomeCode, data) {
  const result = await request(`/income/${incomeCode}`, {
    method: 'PATCH',
    body: JSON.stringify({
      sourceName: data.sourceName,
      receivedDate: data.receivedDate,
      amount: data.amount,
      status: data.status,
      reference: data.reference || '',
      notes: data.notes || '',
    }),
  });

  return result.data;
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
  }));
}

export async function fetchNextFinanceExpenseCode() {
  const result = await request('/expenses/next-code');
  return result.code;
}

export async function createFinanceExpense(data) {
  const result = await request('/expenses', {
    method: 'POST',
    body: JSON.stringify({
      expenseDate: data.expenseDate,
      category: data.category,
      description: data.description,
      amount: data.amount,
      status: data.status || 'Pending',
      notes: data.notes || '',
    }),
  });

  return result.data;
}

export async function updateFinanceExpense(expenseCode, data) {
  const result = await request(`/expenses/${expenseCode}`, {
    method: 'PATCH',
    body: JSON.stringify({
      expenseDate: data.expenseDate,
      category: data.category,
      description: data.description,
      amount: data.amount,
      status: data.status,
      notes: data.notes || '',
    }),
  });

  return result.data;
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
