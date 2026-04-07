export const USER_ROLE_STORAGE_KEY = "erp_user_role";
export const USER_TOKEN_STORAGE_KEY = "erp_auth_token";
export const USER_ALLOWED_PATHS_STORAGE_KEY = "erp_allowed_paths";
export const USER_ALLOWED_MODULES_STORAGE_KEY = "erp_allowed_modules";

export const moduleOptions = [
  { value: "admin", label: "Admin", route: "/admin" },
  { value: "root-admin", label: "Root Admin", route: "/root-admin" },
  { value: "hr", label: "HR", route: "/hr" },
  { value: "sales", label: "Sales", route: "/sales" },
  { value: "inventory", label: "Inventory", route: "/inventory" },
  { value: "finance", label: "Finance", route: "/finance" },
  { value: "support", label: "Customer Support", route: "/support" },
  { value: "it", label: "IT", route: "/it" },
];

export function getStoredRole() {
  return localStorage.getItem(USER_ROLE_STORAGE_KEY);
}

export function storeRole(role) {
  localStorage.setItem(USER_ROLE_STORAGE_KEY, role);
}

export function getStoredToken() {
  return localStorage.getItem(USER_TOKEN_STORAGE_KEY);
}

export function storeToken(token) {
  localStorage.setItem(USER_TOKEN_STORAGE_KEY, token);
}

function safeParseArray(value) {
  try {
    const parsed = JSON.parse(value || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function getStoredAllowedPaths() {
  return safeParseArray(localStorage.getItem(USER_ALLOWED_PATHS_STORAGE_KEY));
}

export function getStoredAllowedModules() {
  return safeParseArray(localStorage.getItem(USER_ALLOWED_MODULES_STORAGE_KEY));
}

export function storeAllowedPaths(paths) {
  const normalized = Array.isArray(paths) ? [...new Set(paths.filter(Boolean))] : [];
  localStorage.setItem(USER_ALLOWED_PATHS_STORAGE_KEY, JSON.stringify(normalized));
}

export function storeAllowedModules(modules) {
  const normalized = Array.isArray(modules)
    ? [...new Set(modules.map((item) => String(item).toLowerCase()).filter(Boolean))]
    : [];
  localStorage.setItem(USER_ALLOWED_MODULES_STORAGE_KEY, JSON.stringify(normalized));
}

export function storeAccessProfile({ role, allowedPaths, allowedModules }) {
  if (role) {
    storeRole(role);
  }

  storeAllowedPaths(allowedPaths);
  storeAllowedModules(allowedModules);
}

export function clearStoredRole() {
  localStorage.removeItem(USER_ROLE_STORAGE_KEY);
  localStorage.removeItem(USER_TOKEN_STORAGE_KEY);
  localStorage.removeItem(USER_ALLOWED_PATHS_STORAGE_KEY);
  localStorage.removeItem(USER_ALLOWED_MODULES_STORAGE_KEY);
}

export function getRouteForRole(role) {
  const resolvedPaths = getAllowedPathsForRole(role);
  if (resolvedPaths.length > 0) {
    return resolvedPaths[0];
  }

  return moduleOptions.find((module) => module.value === role)?.route ?? "/";
}

// Paths each role is permitted to visit.
// profile is universal for authenticated roles, settings is admin-only.
export const ROLE_ALLOWED_PATHS = {
  admin: [
    "/admin",
    "/hr",
    "/sales",
    "/inventory",
    "/finance",
    "/support",
    "/it",
    "/profile",
    "/settings",
  ],
  "root-admin": [
    "/root-admin",
    "/root-admin/requests",
    "/root-admin/payments",
    "/root-admin/modules",
    "/profile",
    "/settings",
  ],
  hr: ["/hr", "/profile"],
  sales: ["/sales", "/profile"],
  inventory: ["/inventory", "/profile"],
  finance: ["/finance", "/profile"],
  support: ["/support", "/profile"],
  it: ["/it", "/profile"],
  client: ["/profile"],
};

export function getAllowedPathsForRole(role) {
  if (role === "client") {
    const stored = getStoredAllowedPaths();
    if (stored.length > 0) {
      return stored;
    }
  }

  return ROLE_ALLOWED_PATHS[role] || [];
}
