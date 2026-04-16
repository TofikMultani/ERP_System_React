import {
  createSupportCustomer,
  createSupportTicket,
  createSupportResponse,
  createSupportKnowledgeBase,
  deleteSupportCustomer,
  deleteSupportTicket,
  deleteSupportResponse,
  deleteSupportKnowledgeBase,
  fetchSupportCustomers,
  fetchSupportTickets,
  fetchSupportResponses,
  fetchSupportKnowledgeBase,
  fetchNextSupportCustomerCode,
  fetchNextSupportTicketCode,
  fetchNextSupportResponseCode,
  fetchNextSupportKnowledgeBaseCode,
  updateSupportCustomer,
  updateSupportTicket,
  updateSupportResponse,
  updateSupportKnowledgeBase,
} from "../../utils/supportApi.js";

const priorityOptions = ["Low", "Medium", "High", "Critical"];
const ticketStatusOptions = ["Open", "In Progress", "Waiting for Customer", "Resolved", "Closed"];
const responseTypeOptions = ["Note", "Customer Reply", "Agent Response", "System"];
const accountTypeOptions = ["Standard", "Premium", "Enterprise"];
const statusOptions = ["Active", "Inactive"];
const kbCategoryOptions = [
  "Getting Started",
  "Account Management",
  "Billing & Payments",
  "Technical Issues",
  "Features",
  "Integration",
  "FAQ",
  "Troubleshooting",
];

const baseStatusFilters = ["All", "Active", "Inactive"];
const ticketStatusFilters = ["All", ...ticketStatusOptions];

export const customersConfig = {
  title: "Customers",
  label: "customer",
  labelPlural: "customers",
  listTitle: "Customer Database",
  description: "Manage customer information and account details.",
  pageTitle: "Customers",
  listRoute: "/support/customers",
  newRoute: "/support/customers/new",
  editRoute: (code) => `/support/customers/${encodeURIComponent(code)}/edit`,
  addLabel: "+ Add Customer",
  columns: [
    { header: "Code", accessor: "customerCode" },
    { header: "Name", accessor: "name" },
    { header: "Email", accessor: "email" },
    { header: "Phone", accessor: "phone" },
    { header: "Company", accessor: "company" },
    { header: "Account Type", accessor: "accountType" },
    { header: "Status", accessor: "status" },
  ],
  searchFields: ["customerCode", "name", "email", "phone", "company"],
  statusFilters: baseStatusFilters,
  codeField: "customerCode",
  routeParam: "code",
  pageSize: 10,
  emptyForm: {
    customerCode: "",
    name: "",
    email: "",
    phone: "",
    company: "",
    industry: "",
    accountType: "Standard",
    status: "Active",
    notes: "",
  },
  fields: [
    { name: "customerCode", label: "Customer Code", type: "text", readOnly: true, required: true },
    { name: "name", label: "Customer Name", type: "text", placeholder: "Full name", required: true },
    { name: "email", label: "Email", type: "email", placeholder: "customer@example.com", required: true },
    { name: "phone", label: "Phone", type: "tel", placeholder: "+1 (555) 000-0000" },
    { name: "company", label: "Company", type: "text", placeholder: "Company name" },
    { name: "industry", label: "Industry", type: "text", placeholder: "e.g. Technology, Finance" },
    { name: "accountType", label: "Account Type", type: "select", options: accountTypeOptions, required: true },
    { name: "status", label: "Status", type: "select", options: statusOptions, required: true },
    { name: "notes", label: "Notes", type: "textarea", placeholder: "Additional customer information" },
  ],
  searchPlaceholder: "Search by code, name, email, phone...",
  fetchRows: fetchSupportCustomers,
  fetchNextCode: fetchNextSupportCustomerCode,
  fetchRow: async (code) => {
    const data = await fetchSupportCustomers();
    const row = data.find((r) => r.customerCode === code);
    if (!row) throw new Error("Customer not found");
    return row;
  },
  createRow: createSupportCustomer,
  updateRow: updateSupportCustomer,
  deleteRow: deleteSupportCustomer,
  rowToForm(row) {
    return {
      customerCode: row.customerCode || "",
      name: row.name || "",
      email: row.email || "",
      phone: row.phone || "",
      company: row.company || "",
      industry: row.industry || "",
      accountType: row.accountType || "Standard",
      status: row.status || "Active",
      notes: row.notes || "",
    };
  },
  formToRow(form) {
    return {
      name: form.name,
      email: form.email,
      phone: form.phone,
      company: form.company,
      industry: form.industry,
      accountType: form.accountType,
      status: form.status,
      notes: form.notes,
    };
  },
  buildSummary(rows) {
    const active = rows.filter((r) => r.status === "Active").length;
    const premium = rows.filter((r) => r.accountType === "Premium").length;
    return [
      { title: "Total Customers", value: rows.length, helper: "registered customers" },
      { title: "Active", value: active, helper: "active accounts" },
      { title: "Premium", value: premium, helper: "premium tier" },
      { title: "Industries", value: new Set(rows.map((r) => r.industry).filter(Boolean)).size, helper: "distinct industries" },
    ];
  },
};

export const ticketsConfig = {
  title: "Tickets",
  label: "ticket",
  labelPlural: "tickets",
  listTitle: "Support Tickets",
  description: "Track customer support requests and issues.",
  pageTitle: "Tickets",
  listRoute: "/support/tickets",
  newRoute: "/support/tickets/new",
  editRoute: (code) => `/support/tickets/${encodeURIComponent(code)}/edit`,
  addLabel: "+ New Ticket",
  columns: [
    { header: "Ticket #", accessor: "ticketNumber" },
    { header: "Customer", accessor: "customerName" },
    { header: "Subject", accessor: "subject" },
    { header: "Priority", accessor: "priority" },
    { header: "Status", accessor: "status" },
    { header: "Assigned To", accessor: "assignedTo" },
    { header: "Created", accessor: "createdAt" },
  ],
  searchFields: ["ticketNumber", "customerName", "customerEmail", "subject"],
  statusFilters: ticketStatusFilters,
  codeField: "ticketNumber",
  routeParam: "code",
  pageSize: 10,
  emptyForm: {
    ticketNumber: "",
    customerCode: "",
    customerName: "",
    customerEmail: "",
    subject: "",
    description: "",
    category: "Technical Issues",
    priority: "Medium",
    status: "Open",
    assignedTo: "",
    resolutionSummary: "",
    responseCount: 0,
    satisfactionRating: 0,
  },
  fields: [
    { name: "ticketNumber", label: "Ticket #", type: "text", readOnly: true, required: true },
    { name: "customerCode", label: "Customer", type: "text", placeholder: "Customer code", required: true },
    { name: "customerName", label: "Customer Name", type: "text", placeholder: "Name from customer record", readOnly: true },
    { name: "customerEmail", label: "Customer Email", type: "email", placeholder: "Email from customer record", readOnly: true },
    { name: "subject", label: "Subject", type: "text", placeholder: "Brief issue summary", required: true },
    {
      name: "description",
      label: "Description",
      type: "textarea",
      placeholder: "Full issue details",
      required: true,
      rows: 6,
      fullWidth: true,
    },
    { name: "category", label: "Category", type: "select", options: kbCategoryOptions, required: true },
    { name: "priority", label: "Priority", type: "select", options: priorityOptions, required: true },
    { name: "status", label: "Status", type: "select", options: ticketStatusOptions, required: true },
    { name: "assignedTo", label: "Assigned To", type: "text", placeholder: "Agent name" },
    {
      name: "resolutionSummary",
      label: "Resolution Summary",
      type: "textarea",
      placeholder: "How was this issue resolved?",
      rows: 5,
      fullWidth: true,
    },
    {
      name: "satisfactionRating",
      label: "Satisfaction Rating",
      type: "number",
      placeholder: "1-5",
      min: 1,
      max: 5,
      step: 1,
    },
  ],
  searchPlaceholder: "Search by ticket #, customer, subject...",
  fetchRows: fetchSupportTickets,
  fetchNextCode: fetchNextSupportTicketCode,
  fetchRow: async (code) => {
    const data = await fetchSupportTickets();
    const row = data.find((r) => r.ticketNumber === code);
    if (!row) throw new Error("Ticket not found");
    return row;
  },
  createRow: createSupportTicket,
  updateRow: updateSupportTicket,
  deleteRow: deleteSupportTicket,
  rowToForm(row) {
    return {
      ticketNumber: row.ticketNumber || "",
      customerCode: row.customerCode || "",
      customerName: row.customerName || "",
      customerEmail: row.customerEmail || "",
      subject: row.subject || "",
      description: row.description || "",
      category: row.category || "Technical Issues",
      priority: row.priority || "Medium",
      status: row.status || "Open",
      assignedTo: row.assignedTo || "",
      resolutionSummary: row.resolutionSummary || "",
      responseCount: row.responseCount || 0,
      satisfactionRating: row.satisfactionRating || 0,
    };
  },
  formToRow(form) {
    return {
      customerCode: form.customerCode,
      customerName: form.customerName,
      customerEmail: form.customerEmail,
      subject: form.subject,
      description: form.description,
      category: form.category,
      priority: form.priority,
      status: form.status,
      assignedTo: form.assignedTo,
      resolutionSummary: form.resolutionSummary,
      satisfactionRating: form.satisfactionRating || 0,
    };
  },
  buildSummary(rows) {
    const open = rows.filter((r) => r.status === "Open").length;
    const resolved = rows.filter((r) => r.status === "Resolved").length;
    const avgRating = rows.length > 0
      ? (rows.reduce((sum, r) => sum + (r.satisfactionRating || 0), 0) / rows.length).toFixed(1)
      : "N/A";
    return [
      { title: "Total Tickets", value: rows.length, helper: "all support tickets" },
      { title: "Open", value: open, helper: "requiring attention" },
      { title: "Resolved", value: resolved, helper: "completed successfully" },
      { title: "Avg Rating", value: avgRating, helper: "customer satisfaction" },
    ];
  },
};

export const responsesConfig = {
  title: "Responses",
  label: "response",
  labelPlural: "responses",
  listTitle: "Ticket Responses",
  description: "Track responses and notes on support tickets.",
  pageTitle: "Responses",
  listRoute: "/support/responses",
  newRoute: "/support/responses/new",
  editRoute: (code) => `/support/responses/${encodeURIComponent(code)}/edit`,
  addLabel: "+ Add Response",
  columns: [
    { header: "Code", accessor: "responseCode" },
    { header: "Ticket #", accessor: "ticketNumber" },
    { header: "Author", accessor: "authorName" },
    { header: "Type", accessor: "responseType" },
    { header: "Internal", accessor: "isInternal" },
    { header: "Created", accessor: "createdAt" },
  ],
  searchFields: ["responseCode", "ticketNumber", "authorName", "content"],
  statusFilters: ["All"],
  codeField: "responseCode",
  routeParam: "code",
  pageSize: 10,
  emptyForm: {
    responseCode: "",
    ticketNumber: "",
    authorName: "",
    authorEmail: "",
    authorRole: "Agent",
    content: "",
    responseType: "Note",
    isInternal: false,
  },
  fields: [
    { name: "responseCode", label: "Response Code", type: "text", readOnly: true, required: true },
    { name: "ticketNumber", label: "Ticket #", type: "text", placeholder: "Link to ticket", required: true },
    { name: "authorName", label: "Author Name", type: "text", placeholder: "Your name", required: true },
    { name: "authorEmail", label: "Author Email", type: "email", placeholder: "Your email" },
    { name: "authorRole", label: "Author Role", type: "text", placeholder: "Agent / Manager" },
    { name: "content", label: "Response Content", type: "textarea", placeholder: "Your response or note", required: true },
    { name: "responseType", label: "Type", type: "select", options: responseTypeOptions, required: true },
    { name: "isInternal", label: "Internal Only (not visible to customer)", type: "checkbox" },
  ],
  searchPlaceholder: "Search by code, ticket, author...",
  fetchRows: fetchSupportResponses,
  fetchNextCode: fetchNextSupportResponseCode,
  fetchRow: async (code) => {
    const data = await fetchSupportResponses();
    const row = data.find((r) => r.responseCode === code);
    if (!row) throw new Error("Response not found");
    return row;
  },
  createRow: createSupportResponse,
  updateRow: updateSupportResponse,
  deleteRow: deleteSupportResponse,
  rowToForm(row) {
    return {
      responseCode: row.responseCode || "",
      ticketNumber: row.ticketNumber || "",
      authorName: row.authorName || "",
      authorEmail: row.authorEmail || "",
      authorRole: row.authorRole || "Agent",
      content: row.content || "",
      responseType: row.responseType || "Note",
      isInternal: row.isInternal || false,
    };
  },
  formToRow(form) {
    return {
      ticketNumber: form.ticketNumber,
      authorName: form.authorName,
      authorEmail: form.authorEmail,
      authorRole: form.authorRole,
      content: form.content,
      responseType: form.responseType,
      isInternal: form.isInternal,
    };
  },
  buildSummary(rows) {
    const customerReplies = rows.filter((r) => r.responseType === "Customer Reply").length;
    const internalNotes = rows.filter((r) => r.isInternal).length;
    const distinctTickets = new Set(rows.map((r) => r.ticketNumber)).size;
    return [
      { title: "Total Responses", value: rows.length, helper: "all responses" },
      { title: "Customer Replies", value: customerReplies, helper: "from customers" },
      { title: "Internal Notes", value: internalNotes, helper: "internal only" },
      { title: "Unique Tickets", value: distinctTickets, helper: "with responses" },
    ];
  },
};

export const knowledgeBaseConfig = {
  title: "Knowledge Base",
  label: "article",
  labelPlural: "articles",
  listTitle: "Knowledge Base Articles",
  description: "Self-service resources and FAQ documentation.",
  pageTitle: "Knowledge Base",
  listRoute: "/support/knowledge-base",
  newRoute: "/support/knowledge-base/new",
  editRoute: (code) => `/support/knowledge-base/${encodeURIComponent(code)}/edit`,
  addLabel: "+ New Article",
  columns: [
    { header: "Code", accessor: "kbCode" },
    { header: "Title", accessor: "title" },
    { header: "Category", accessor: "category" },
    { header: "Views", accessor: "views" },
    { header: "Helpful", accessor: "helpfulCount" },
    { header: "Published", accessor: "isPublished" },
  ],
  searchFields: ["kbCode", "title", "category", "content"],
  statusFilters: ["All", "Published", "Draft"],
  codeField: "kbCode",
  routeParam: "code",
  pageSize: 10,
  emptyForm: {
    kbCode: "",
    title: "",
    content: "",
    category: "Getting Started",
    keywords: [],
    isPublished: false,
    helpfulCount: 0,
    notHelpfulCount: 0,
    views: 0,
  },
  fields: [
    { name: "kbCode", label: "Article Code", type: "text", readOnly: true, required: true },
    { name: "title", label: "Article Title", type: "text", placeholder: "How to...", required: true },
    { name: "content", label: "Article Content", type: "textarea", placeholder: "Detailed instructions", required: true },
    { name: "category", label: "Category", type: "select", options: kbCategoryOptions, required: true },
    { name: "keywords", label: "Keywords (comma-separated)", type: "text", placeholder: "help,support,guide" },
    { name: "isPublished", label: "Publish this article", type: "checkbox" },
    { name: "views", label: "Views", type: "number", readOnly: true },
    { name: "helpfulCount", label: "Helpful Count", type: "number", readOnly: true },
  ],
  searchPlaceholder: "Search by code, title, category...",
  fetchRows: fetchSupportKnowledgeBase,
  fetchNextCode: fetchNextSupportKnowledgeBaseCode,
  fetchRow: async (code) => {
    const data = await fetchSupportKnowledgeBase();
    const row = data.find((r) => r.kbCode === code);
    if (!row) throw new Error("Article not found");
    return row;
  },
  createRow: createSupportKnowledgeBase,
  updateRow: updateSupportKnowledgeBase,
  deleteRow: deleteSupportKnowledgeBase,
  rowToForm(row) {
    return {
      kbCode: row.kbCode || "",
      title: row.title || "",
      content: row.content || "",
      category: row.category || "Getting Started",
      keywords: Array.isArray(row.keywords) ? row.keywords.join(", ") : "",
      isPublished: row.isPublished || false,
      views: row.views || 0,
      helpfulCount: row.helpfulCount || 0,
      notHelpfulCount: row.notHelpfulCount || 0,
    };
  },
  formToRow(form) {
    const keywords = String(form.keywords || "")
      .split(",")
      .map((k) => k.trim())
      .filter(Boolean);
    return {
      title: form.title,
      content: form.content,
      category: form.category,
      keywords: keywords,
      isPublished: form.isPublished || false,
    };
  },
  buildSummary(rows) {
    const published = rows.filter((r) => r.isPublished).length;
    const draft = rows.filter((r) => !r.isPublished).length;
    const totalViews = rows.reduce((sum, r) => sum + (r.views || 0), 0);
    return [
      { title: "Total Articles", value: rows.length, helper: "knowledge base items" },
      { title: "Published", value: published, helper: "live articles" },
      { title: "Draft", value: draft, helper: "not yet published" },
      { title: "Total Views", value: totalViews, helper: "cumulative views" },
    ];
  },
};
