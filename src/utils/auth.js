export const USER_ROLE_STORAGE_KEY = "erp_user_role";

export const moduleOptions = [
  { value: "admin", label: "Admin", route: "/admin" },
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

export function clearStoredRole() {
  localStorage.removeItem(USER_ROLE_STORAGE_KEY);
}

export function getRouteForRole(role) {
  return moduleOptions.find((module) => module.value === role)?.route ?? "/";
}

// Paths each role is permitted to visit.
// profile and settings are universal (all authenticated roles).
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
  hr: ["/hr", "/profile", "/settings"],
  sales: ["/sales", "/profile", "/settings"],
  inventory: ["/inventory", "/profile", "/settings"],
  finance: ["/finance", "/profile", "/settings"],
  support: ["/support", "/profile", "/settings"],
  it: ["/it", "/profile", "/settings"],
};
