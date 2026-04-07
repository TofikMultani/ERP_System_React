export const USER_ROLE_STORAGE_KEY = "erp_user_role";
export const USER_TOKEN_STORAGE_KEY = "erp_auth_token";

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

export function clearStoredRole() {
  localStorage.removeItem(USER_ROLE_STORAGE_KEY);
  localStorage.removeItem(USER_TOKEN_STORAGE_KEY);
}

export function getRouteForRole(role) {
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
};
