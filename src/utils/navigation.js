const APP_NAVIGATION_ITEMS = [
  { label: "Dashboard", path: "/admin", keywords: ["home", "overview"] },
  { label: "HR Dashboard", path: "/hr", keywords: ["hr", "people"] },
  { label: "Employees", path: "/hr/employees", keywords: ["hr", "staff"] },
  { label: "Departments", path: "/hr/departments", keywords: ["hr", "teams"] },
  { label: "Attendance", path: "/hr/attendance", keywords: ["hr", "presence"] },
  { label: "Leave", path: "/hr/leave", keywords: ["hr", "vacation"] },
  { label: "Payroll", path: "/hr/payroll", keywords: ["hr", "salary"] },
  { label: "Recruitment", path: "/hr/recruitment", keywords: ["hr", "hiring"] },
  { label: "Performance", path: "/hr/performance", keywords: ["hr", "review"] },
  { label: "Documents", path: "/hr/documents", keywords: ["hr", "files"] },
  { label: "Training", path: "/hr/training", keywords: ["hr", "learning"] },
  { label: "HR Reports", path: "/hr/reports", keywords: ["hr", "analytics"] },
  {
    label: "Inventory Dashboard",
    path: "/inventory",
    keywords: ["stock", "products"],
  },
  {
    label: "Products",
    path: "/inventory/products",
    keywords: ["inventory", "items"],
  },
  {
    label: "Categories",
    path: "/inventory/categories",
    keywords: ["inventory", "types"],
  },
  {
    label: "Stock",
    path: "/inventory/stock",
    keywords: ["inventory", "availability"],
  },
  {
    label: "Suppliers",
    path: "/inventory/suppliers",
    keywords: ["inventory", "vendors"],
  },
  {
    label: "Warehouses",
    path: "/inventory/warehouses",
    keywords: ["inventory", "storage"],
  },
  {
    label: "Purchase Orders",
    path: "/inventory/purchase-orders",
    keywords: ["inventory", "procurement"],
  },
  {
    label: "Adjustments",
    path: "/inventory/adjustments",
    keywords: ["inventory", "correction"],
  },
  {
    label: "Inventory Reports",
    path: "/inventory/reports",
    keywords: ["inventory", "analytics"],
  },
  {
    label: "Sales Dashboard",
    path: "/sales",
    keywords: ["sales", "customers"],
  },
  {
    label: "Customers",
    path: "/sales/customers",
    keywords: ["sales", "clients"],
  },
  { label: "Orders", path: "/sales/orders", keywords: ["sales", "purchases"] },
  {
    label: "Sales Invoices",
    path: "/sales/invoices",
    keywords: ["sales", "billing"],
  },
  {
    label: "Quotations",
    path: "/sales/quotations",
    keywords: ["sales", "quotes"],
  },
  {
    label: "Sales Reports",
    path: "/sales/reports",
    keywords: ["sales", "analytics"],
  },
  {
    label: "Finance Dashboard",
    path: "/finance",
    keywords: ["finance", "accounts"],
  },
  {
    label: "Finance Invoices",
    path: "/finance/invoices",
    keywords: ["finance", "billing"],
  },
  {
    label: "Expenses",
    path: "/finance/expenses",
    keywords: ["finance", "spend"],
  },
  {
    label: "Payments",
    path: "/finance/payments",
    keywords: ["finance", "vendors"],
  },
  {
    label: "Finance Reports",
    path: "/finance/reports",
    keywords: ["finance", "analytics"],
  },
  { label: "IT Dashboard", path: "/it", keywords: ["it", "systems"] },
  { label: "Systems", path: "/it/systems", keywords: ["it", "servers"] },
  { label: "Assets", path: "/it/assets", keywords: ["it", "equipment"] },
  {
    label: "Maintenance",
    path: "/it/maintenance",
    keywords: ["it", "service"],
  },
  { label: "IT Reports", path: "/it/reports", keywords: ["it", "analytics"] },
  {
    label: "Support Dashboard",
    path: "/support",
    keywords: ["support", "tickets"],
  },
  {
    label: "Tickets",
    path: "/support/tickets",
    keywords: ["support", "issues"],
  },
  {
    label: "Assign Ticket",
    path: "/support/assign-ticket",
    keywords: ["support", "assignment"],
  },
  {
    label: "Support Reports",
    path: "/support/reports",
    keywords: ["support", "analytics"],
  },
  {
    label: "Payment Provisioning",
    path: "/root-admin/payments",
    keywords: ["root admin", "payments", "credentials"],
  },
  { label: "Profile", path: "/profile", keywords: ["account", "user"] },
  {
    label: "Settings",
    path: "/settings",
    keywords: ["preferences", "configuration"],
  },
];

export function getSearchableNavigationItems(allowedPaths) {
  return APP_NAVIGATION_ITEMS.filter((item) =>
    allowedPaths.some(
      (path) => item.path === path || item.path.startsWith(`${path}/`),
    ),
  );
}

export function filterNavigationItems(items, query) {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) {
    return [];
  }

  return items
    .filter((item) => {
      const haystack = [item.label, item.path, ...(item.keywords || [])]
        .join(" ")
        .toLowerCase();
      return haystack.includes(normalizedQuery);
    })
    .slice(0, 8);
}
