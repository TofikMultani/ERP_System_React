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
    const response = await fetch(`${API_BASE}/sales${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorText = await response.text();
      try {
        const errorData = JSON.parse(errorText);
        throw new Error(errorData.message || `HTTP ${response.status}`);
      } catch {
        throw new Error(`HTTP ${response.status}: ${errorText.substring(0, 100)}`);
      }
    }

    const text = await response.text();
    if (!text) {
      return { status: 'OK', data: [] };
    }

    return JSON.parse(text);
  } catch (error) {
    console.error(`Sales API request failed:`, error);
    throw error;
  }
}

// Customers API
export async function fetchSalesCustomers() {
  const result = await request('/customers');
  return (result.data || []).map((customer) => ({
    id: customer.id,
    code: customer.customerCode,
    name: customer.name,
    email: customer.email,
    phone: customer.phone,
    company: customer.company,
    status: customer.status,
    creditLimit: customer.creditLimit,
  }));
}

export async function fetchNextCustomerCode() {
  const result = await request('/customers/next-code');
  return result.code;
}

export async function createSalesCustomer(data) {
  const result = await request('/customers', {
    method: 'POST',
    body: JSON.stringify({
      name: data.name,
      email: data.email,
      phone: data.phone,
      company: data.company,
      status: data.status || 'Active',
      creditLimit: data.creditLimit || 0,
    }),
  });
  return result.data;
}

export async function updateSalesCustomer(customerCode, data) {
  const result = await request(`/customers/${customerCode}`, {
    method: 'PATCH',
    body: JSON.stringify({
      name: data.name,
      email: data.email,
      phone: data.phone,
      company: data.company,
      status: data.status,
      creditLimit: data.creditLimit,
    }),
  });
  return result.data;
}

export async function deleteSalesCustomer(customerCode) {
  await request(`/customers/${customerCode}`, {
    method: 'DELETE',
  });
}

// Orders API
export async function fetchSalesOrders() {
  const result = await request('/orders');
  return (result.data || []).map((order) => ({
    id: order.id,
    code: order.orderNumber,
    customerCode: order.customerCode,
    orderDate: order.orderDate,
    amount: order.amount,
    itemCount: order.itemCount,
    status: order.status,
  }));
}

export async function fetchNextOrderCode() {
  const result = await request('/orders/next-code');
  return result.code;
}

export async function createSalesOrder(data) {
  const result = await request('/orders', {
    method: 'POST',
    body: JSON.stringify({
      customerCode: data.customerCode,
      orderDate: data.orderDate,
      amount: data.amount,
      itemCount: data.itemCount,
      status: data.status || 'Processing',
    }),
  });
  return result.data;
}

export async function updateSalesOrder(orderNumber, data) {
  const result = await request(`/orders/${orderNumber}`, {
    method: 'PATCH',
    body: JSON.stringify({
      customerCode: data.customerCode,
      orderDate: data.orderDate,
      amount: data.amount,
      itemCount: data.itemCount,
      status: data.status,
    }),
  });
  return result.data;
}

export async function deleteSalesOrder(orderNumber) {
  await request(`/orders/${orderNumber}`, {
    method: 'DELETE',
  });
}

// Invoices API
export async function fetchSalesInvoices() {
  const result = await request('/invoices');
  return (result.data || []).map((invoice) => ({
    id: invoice.id,
    code: invoice.invoiceNumber,
    customerCode: invoice.customerCode,
    invoiceDate: invoice.invoiceDate,
    dueDate: invoice.dueDate,
    amount: invoice.amount,
    status: invoice.status,
    paymentDate: invoice.paymentDate,
  }));
}

export async function fetchNextInvoiceCode() {
  const result = await request('/invoices/next-code');
  return result.code;
}

export async function createSalesInvoice(data) {
  const result = await request('/invoices', {
    method: 'POST',
    body: JSON.stringify({
      customerCode: data.customerCode,
      invoiceDate: data.invoiceDate,
      dueDate: data.dueDate,
      amount: data.amount,
      status: data.status || 'Pending',
      paymentDate: data.paymentDate || null,
    }),
  });
  return result.data;
}

export async function updateSalesInvoice(invoiceNumber, data) {
  const result = await request(`/invoices/${invoiceNumber}`, {
    method: 'PATCH',
    body: JSON.stringify({
      customerCode: data.customerCode,
      invoiceDate: data.invoiceDate,
      dueDate: data.dueDate,
      amount: data.amount,
      status: data.status,
      paymentDate: data.paymentDate,
    }),
  });
  return result.data;
}

export async function deleteSalesInvoice(invoiceNumber) {
  await request(`/invoices/${invoiceNumber}`, {
    method: 'DELETE',
  });
}

// Quotations API
export async function fetchSalesQuotations() {
  const result = await request('/quotations');
  return (result.data || []).map((quotation) => ({
    id: quotation.id,
    code: quotation.quotationNumber,
    customerCode: quotation.customerCode,
    quotationDate: quotation.quotationDate,
    expiryDate: quotation.expiryDate,
    amount: quotation.amount,
    status: quotation.status,
    conversionStatus: quotation.conversionStatus,
  }));
}

export async function fetchNextQuotationCode() {
  const result = await request('/quotations/next-code');
  return result.code;
}

export async function createSalesQuotation(data) {
  const result = await request('/quotations', {
    method: 'POST',
    body: JSON.stringify({
      customerCode: data.customerCode,
      quotationDate: data.quotationDate,
      expiryDate: data.expiryDate,
      amount: data.amount,
      status: data.status || 'Sent',
      conversionStatus: data.conversionStatus || 'Pending',
    }),
  });
  return result.data;
}

export async function updateSalesQuotation(quotationNumber, data) {
  const result = await request(`/quotations/${quotationNumber}`, {
    method: 'PATCH',
    body: JSON.stringify({
      customerCode: data.customerCode,
      quotationDate: data.quotationDate,
      expiryDate: data.expiryDate,
      amount: data.amount,
      status: data.status,
      conversionStatus: data.conversionStatus,
    }),
  });
  return result.data;
}

export async function deleteSalesQuotation(quotationNumber) {
  await request(`/quotations/${quotationNumber}`, {
    method: 'DELETE',
  });
}

// Dashboard API
export async function fetchSalesDashboard() {
  const result = await request('/dashboard');
  return result.data || {};
}
