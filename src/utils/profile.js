export const PROFILE_STORAGE_KEY = "erp_user_profiles";
export const PROFILE_UPDATED_EVENT = "erp-profile-updated";

const DEFAULT_PROFILES = {
  admin: {
    name: "Administrator",
    email: "admin@erpsystem.com",
    department: "Management",
    joinDate: "2024-01-01",
    phone: "+1-555-0001",
  },
  hr: {
    name: "HR Department",
    email: "hr@erpsystem.com",
    department: "Human Resources",
    joinDate: "2024-01-15",
    phone: "+1-555-0002",
  },
  sales: {
    name: "Sales Team",
    email: "sales@erpsystem.com",
    department: "Sales",
    joinDate: "2024-02-01",
    phone: "+1-555-0003",
  },
  inventory: {
    name: "Inventory Manager",
    email: "inventory@erpsystem.com",
    department: "Operations",
    joinDate: "2024-02-15",
    phone: "+1-555-0004",
  },
  finance: {
    name: "Finance Department",
    email: "finance@erpsystem.com",
    department: "Finance",
    joinDate: "2024-03-01",
    phone: "+1-555-0005",
  },
  support: {
    name: "Support Team",
    email: "support@erpsystem.com",
    department: "Customer Support",
    joinDate: "2024-03-15",
    phone: "+1-555-0006",
  },
  it: {
    name: "IT Department",
    email: "it@erpsystem.com",
    department: "Information Technology",
    joinDate: "2024-04-01",
    phone: "+1-555-0007",
  },
};

function readProfileMap() {
  try {
    const raw = localStorage.getItem(PROFILE_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeProfileMap(profileMap) {
  localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profileMap));
  window.dispatchEvent(new CustomEvent(PROFILE_UPDATED_EVENT));
}

export function getDefaultProfileForRole(role) {
  return DEFAULT_PROFILES[role] || DEFAULT_PROFILES.admin;
}

export function getStoredProfile(role) {
  const defaults = getDefaultProfileForRole(role);
  const profileMap = readProfileMap();
  return {
    ...defaults,
    ...(profileMap[role] || {}),
  };
}

export function storeProfile(role, profile) {
  const profileMap = readProfileMap();
  profileMap[role] = profile;
  writeProfileMap(profileMap);
}

export function getRoleLabel(role) {
  const roleMap = {
    admin: "Administrator",
    hr: "HR Manager",
    sales: "Sales Representative",
    inventory: "Inventory Manager",
    finance: "Finance Manager",
    support: "Support Agent",
    it: "IT Specialist",
  };

  return roleMap[role] || role;
}
