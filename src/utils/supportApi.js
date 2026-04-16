import { getStoredToken } from "./auth.js";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const API_BASE = `${API_BASE_URL}/support`;

function normalizeResponse(data) {
  if (!Array.isArray(data)) {
    return [];
  }
  return data;
}

async function request(method, endpoint, body = null) {
  const token = getStoredToken();
  const options = {
    method,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`${API_BASE}${endpoint}`, options);
  const raw = await response.text();

  let parsed = null;
  try {
    parsed = raw ? JSON.parse(raw) : null;
  } catch {
    parsed = null;
  }

  if (!response.ok) {
    const message = parsed?.message || `API error: ${response.status} ${response.statusText}`;
    throw new Error(message);
  }

  if (!parsed) {
    throw new Error("Backend returned a non-JSON response. Please verify backend is running and API URL is correct.");
  }

  const data = parsed;
  return data.data || data;
}

// Customers
export async function fetchSupportCustomers() {
  const data = await request("GET", "/customers");
  return normalizeResponse(data);
}

export async function fetchNextSupportCustomerCode() {
  const response = await request("GET", "/customers/next-code");
  return response.code || "CUST-00001";
}

export async function createSupportCustomer(formData) {
  const body = {
    name: formData.name,
    email: formData.email,
    phone: formData.phone,
    company: formData.company,
    industry: formData.industry,
    accountType: formData.accountType,
    status: formData.status,
    notes: formData.notes,
  };

  Object.keys(body).forEach((key) => body[key] === undefined && delete body[key]);

  const response = await request("POST", "/customers", body);
  return response;
}

export async function updateSupportCustomer(code, formData) {
  const body = {
    name: formData.name,
    email: formData.email,
    phone: formData.phone,
    company: formData.company,
    industry: formData.industry,
    accountType: formData.accountType,
    status: formData.status,
    notes: formData.notes,
  };

  Object.keys(body).forEach((key) => body[key] === undefined && delete body[key]);

  const response = await request("PATCH", `/customers/${encodeURIComponent(code)}`, body);
  return response;
}

export async function deleteSupportCustomer(code) {
  return request("DELETE", `/customers/${encodeURIComponent(code)}`);
}

// Tickets
export async function fetchSupportTickets() {
  const data = await request("GET", "/tickets");
  return normalizeResponse(data);
}

export async function fetchNextSupportTicketCode() {
  const response = await request("GET", "/tickets/next-code");
  return response.code || "TKT-00001";
}

export async function createSupportTicket(formData) {
  const body = {
    customerCode: formData.customerCode,
    customerName: formData.customerName,
    customerEmail: formData.customerEmail,
    subject: formData.subject,
    description: formData.description,
    category: formData.category,
    priority: formData.priority,
    status: formData.status,
    assignedTo: formData.assignedTo,
    resolutionSummary: formData.resolutionSummary,
    responseCount: formData.responseCount || 0,
    satisfactionRating: formData.satisfactionRating || 0,
  };

  Object.keys(body).forEach((key) => body[key] === undefined && delete body[key]);

  const response = await request("POST", "/tickets", body);
  return response;
}

export async function updateSupportTicket(code, formData) {
  const body = {
    customerCode: formData.customerCode,
    customerName: formData.customerName,
    customerEmail: formData.customerEmail,
    subject: formData.subject,
    description: formData.description,
    category: formData.category,
    priority: formData.priority,
    status: formData.status,
    assignedTo: formData.assignedTo,
    resolutionSummary: formData.resolutionSummary,
    satisfactionRating: formData.satisfactionRating || 0,
  };

  Object.keys(body).forEach((key) => body[key] === undefined && delete body[key]);

  const response = await request("PATCH", `/tickets/${encodeURIComponent(code)}`, body);
  return response;
}

export async function deleteSupportTicket(code) {
  return request("DELETE", `/tickets/${encodeURIComponent(code)}`);
}

// Responses
export async function fetchSupportResponses() {
  const data = await request("GET", "/responses");
  return normalizeResponse(data);
}

export async function fetchNextSupportResponseCode() {
  const response = await request("GET", "/responses/next-code");
  return response.code || "RESP-00001";
}

export async function createSupportResponse(formData) {
  const body = {
    ticketNumber: formData.ticketNumber,
    authorName: formData.authorName,
    authorEmail: formData.authorEmail,
    authorRole: formData.authorRole,
    content: formData.content,
    responseType: formData.responseType,
    isInternal: Boolean(formData.isInternal),
  };

  Object.keys(body).forEach((key) => body[key] === undefined && delete body[key]);

  const response = await request("POST", "/responses", body);
  return response;
}

export async function updateSupportResponse(code, formData) {
  const body = {
    ticketNumber: formData.ticketNumber,
    authorName: formData.authorName,
    authorEmail: formData.authorEmail,
    authorRole: formData.authorRole,
    content: formData.content,
    responseType: formData.responseType,
    isInternal: Boolean(formData.isInternal),
  };

  Object.keys(body).forEach((key) => body[key] === undefined && delete body[key]);

  const response = await request("PATCH", `/responses/${encodeURIComponent(code)}`, body);
  return response;
}

export async function deleteSupportResponse(code) {
  return request("DELETE", `/responses/${encodeURIComponent(code)}`);
}

// Knowledge Base
export async function fetchSupportKnowledgeBase() {
  const data = await request("GET", "/knowledge-base");
  return normalizeResponse(data);
}

export async function fetchNextSupportKnowledgeBaseCode() {
  const response = await request("GET", "/knowledge-base/next-code");
  return response.code || "KB-00001";
}

export async function createSupportKnowledgeBase(formData) {
  const keywords = Array.isArray(formData.keywords) ? formData.keywords : [];
  
  const body = {
    title: formData.title,
    content: formData.content,
    category: formData.category,
    keywords: keywords,
    isPublished: Boolean(formData.isPublished),
  };

  Object.keys(body).forEach((key) => body[key] === undefined && delete body[key]);

  const response = await request("POST", "/knowledge-base", body);
  return response;
}

export async function updateSupportKnowledgeBase(code, formData) {
  const keywords = Array.isArray(formData.keywords) ? formData.keywords : [];
  
  const body = {
    title: formData.title,
    content: formData.content,
    category: formData.category,
    keywords: keywords,
    isPublished: Boolean(formData.isPublished),
  };

  Object.keys(body).forEach((key) => body[key] === undefined && delete body[key]);

  const response = await request("PATCH", `/knowledge-base/${encodeURIComponent(code)}`, body);
  return response;
}

export async function deleteSupportKnowledgeBase(code) {
  return request("DELETE", `/knowledge-base/${encodeURIComponent(code)}`);
}

// Dashboard
export async function fetchSupportDashboard() {
  const data = await request("GET", "/dashboard");
  return data;
}
