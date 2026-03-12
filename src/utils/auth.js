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
