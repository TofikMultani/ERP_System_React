import {
  PERSISTENT_STATE_UPDATED_EVENT,
  getStoredPersistentState,
} from "./persistentState.js";

export const MODULE_CATALOG_STORAGE_KEY = "erp_module_catalog";

export const DEFAULT_MODULE_CATALOG = [
  { key: "hr", label: "HR", isActive: true, price: 2500 },
  { key: "sales", label: "Sales", isActive: true, price: 3000 },
  { key: "inventory", label: "Inventory", isActive: true, price: 2800 },
  { key: "finance", label: "Finance", isActive: true, price: 3500 },
  { key: "support", label: "Customer Support", isActive: true, price: 2200 },
  { key: "it", label: "IT", isActive: true, price: 2600 },
];

function sanitizeCatalog(catalog) {
  if (!Array.isArray(catalog)) {
    return DEFAULT_MODULE_CATALOG;
  }

  const defaultsByKey = new Map(
    DEFAULT_MODULE_CATALOG.map((moduleItem) => [moduleItem.key, moduleItem]),
  );

  const merged = DEFAULT_MODULE_CATALOG.map((moduleItem) => {
    const stored = catalog.find((entry) => entry?.key === moduleItem.key);
    const parsedPrice = Number(stored?.price);

    return {
      key: moduleItem.key,
      label: moduleItem.label,
      isActive:
        typeof stored?.isActive === "boolean"
          ? stored.isActive
          : moduleItem.isActive,
      price:
        Number.isFinite(parsedPrice) && parsedPrice >= 0
          ? Math.round(parsedPrice)
          : moduleItem.price,
    };
  });

  catalog.forEach((entry) => {
    if (!entry?.key || defaultsByKey.has(entry.key)) {
      return;
    }

    const parsedPrice = Number(entry.price);
    merged.push({
      key: entry.key,
      label: entry.label || entry.key,
      isActive: Boolean(entry.isActive),
      price:
        Number.isFinite(parsedPrice) && parsedPrice >= 0
          ? Math.round(parsedPrice)
          : 0,
    });
  });

  return merged;
}

export function getStoredModuleCatalog() {
  const storedCatalog = getStoredPersistentState(
    MODULE_CATALOG_STORAGE_KEY,
    DEFAULT_MODULE_CATALOG,
  );

  return sanitizeCatalog(storedCatalog);
}

export function saveModuleCatalog(nextCatalog) {
  const sanitized = sanitizeCatalog(nextCatalog);
  localStorage.setItem(MODULE_CATALOG_STORAGE_KEY, JSON.stringify(sanitized));

  window.dispatchEvent(
    new CustomEvent(PERSISTENT_STATE_UPDATED_EVENT, {
      detail: { storageKey: MODULE_CATALOG_STORAGE_KEY },
    }),
  );

  return sanitized;
}

export function updateModuleCatalogItem(moduleKey, updates = {}) {
  const currentCatalog = getStoredModuleCatalog();
  const nextCatalog = currentCatalog.map((item) => {
    if (item.key !== moduleKey) {
      return item;
    }

    const parsedPrice = Number(updates.price);

    return {
      ...item,
      ...(typeof updates.isActive === "boolean"
        ? { isActive: updates.isActive }
        : {}),
      ...(Number.isFinite(parsedPrice) && parsedPrice >= 0
        ? { price: Math.round(parsedPrice) }
        : {}),
    };
  });

  return saveModuleCatalog(nextCatalog);
}
