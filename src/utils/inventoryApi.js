import { getStoredToken } from "./auth.js";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

async function apiRequest(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      data.error ? `${data.message || "Request failed"}: ${data.error}` : data.message || "Request failed",
    );
  }

  return data;
}

function authHeaders() {
  const token = getStoredToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function fetchList(path) {
  const result = await apiRequest(path, { headers: authHeaders() });
  return result.data || [];
}

async function fetchNextCode(path, key) {
  const result = await apiRequest(path, { headers: authHeaders() });
  return result.data?.[key] || "";
}

async function createItem(path, payload) {
  const result = await apiRequest(path, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  return result.data;
}

async function updateItem(path, payload) {
  const result = await apiRequest(path, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  return result.data;
}

async function deleteItem(path) {
  const result = await apiRequest(path, {
    method: "DELETE",
    headers: authHeaders(),
  });
  return result.data;
}

export async function fetchInventoryProducts() {
  return fetchList(`/inventory/products`);
}

export async function fetchNextInventoryProductCode() {
  return fetchNextCode(`/inventory/products/next-code`, "productCode");
}

export async function createInventoryProduct(payload) {
  return createItem(`/inventory/products`, payload);
}

export async function updateInventoryProduct(productCode, payload) {
  return updateItem(`/inventory/products/${encodeURIComponent(productCode)}`, payload);
}

export async function deleteInventoryProduct(productCode) {
  return deleteItem(`/inventory/products/${encodeURIComponent(productCode)}`);
}

export async function importInventoryProducts(payload) {
  return createItem(`/inventory/products/import`, payload);
}

export async function fetchInventoryCategories() {
  return fetchList(`/inventory/categories`);
}

export async function fetchNextInventoryCategoryCode() {
  return fetchNextCode(`/inventory/categories/next-code`, "categoryCode");
}

export async function createInventoryCategory(payload) {
  return createItem(`/inventory/categories`, payload);
}

export async function updateInventoryCategory(categoryCode, payload) {
  return updateItem(`/inventory/categories/${encodeURIComponent(categoryCode)}`, payload);
}

export async function deleteInventoryCategory(categoryCode) {
  return deleteItem(`/inventory/categories/${encodeURIComponent(categoryCode)}`);
}

export async function fetchInventoryStock() {
  return fetchList(`/inventory/stock`);
}

export async function fetchNextInventoryStockCode() {
  return fetchNextCode(`/inventory/stock/next-code`, "stockCode");
}

export async function createInventoryStock(payload) {
  return createItem(`/inventory/stock`, payload);
}

export async function updateInventoryStock(stockCode, payload) {
  return updateItem(`/inventory/stock/${encodeURIComponent(stockCode)}`, payload);
}

export async function deleteInventoryStock(stockCode) {
  return deleteItem(`/inventory/stock/${encodeURIComponent(stockCode)}`);
}

export async function fetchInventorySuppliers() {
  return fetchList(`/inventory/suppliers`);
}

export async function fetchNextInventorySupplierCode() {
  return fetchNextCode(`/inventory/suppliers/next-code`, "supplierCode");
}

export async function createInventorySupplier(payload) {
  return createItem(`/inventory/suppliers`, payload);
}

export async function updateInventorySupplier(supplierCode, payload) {
  return updateItem(`/inventory/suppliers/${encodeURIComponent(supplierCode)}`, payload);
}

export async function deleteInventorySupplier(supplierCode) {
  return deleteItem(`/inventory/suppliers/${encodeURIComponent(supplierCode)}`);
}

export async function fetchInventoryWarehouses() {
  return fetchList(`/inventory/warehouses`);
}

export async function fetchNextInventoryWarehouseCode() {
  return fetchNextCode(`/inventory/warehouses/next-code`, "warehouseCode");
}

export async function createInventoryWarehouse(payload) {
  return createItem(`/inventory/warehouses`, payload);
}

export async function updateInventoryWarehouse(warehouseCode, payload) {
  return updateItem(`/inventory/warehouses/${encodeURIComponent(warehouseCode)}`, payload);
}

export async function deleteInventoryWarehouse(warehouseCode) {
  return deleteItem(`/inventory/warehouses/${encodeURIComponent(warehouseCode)}`);
}

export async function fetchInventoryPurchaseOrders() {
  return fetchList(`/inventory/purchase-orders`);
}

export async function fetchNextInventoryPurchaseOrderCode() {
  return fetchNextCode(`/inventory/purchase-orders/next-code`, "poNumber");
}

export async function createInventoryPurchaseOrder(payload) {
  return createItem(`/inventory/purchase-orders`, payload);
}

export async function updateInventoryPurchaseOrder(poNumber, payload) {
  return updateItem(`/inventory/purchase-orders/${encodeURIComponent(poNumber)}`, payload);
}

export async function deleteInventoryPurchaseOrder(poNumber) {
  return deleteItem(`/inventory/purchase-orders/${encodeURIComponent(poNumber)}`);
}

export async function downloadInventoryPurchaseOrderPdf(poNumber) {
  const response = await fetch(
    `${API_BASE_URL}/inventory/purchase-orders/${encodeURIComponent(poNumber)}/pdf`,
    { headers: authHeaders() },
  );

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.message || "Unable to download purchase order PDF");
  }

  return response.blob();
}

export async function fetchInventoryAdjustments() {
  return fetchList(`/inventory/adjustments`);
}

export async function fetchNextInventoryAdjustmentCode() {
  return fetchNextCode(`/inventory/adjustments/next-code`, "adjustmentCode");
}

export async function createInventoryAdjustment(payload) {
  return createItem(`/inventory/adjustments`, payload);
}

export async function updateInventoryAdjustment(adjustmentCode, payload) {
  return updateItem(`/inventory/adjustments/${encodeURIComponent(adjustmentCode)}`, payload);
}

export async function deleteInventoryAdjustment(adjustmentCode) {
  return deleteItem(`/inventory/adjustments/${encodeURIComponent(adjustmentCode)}`);
}
