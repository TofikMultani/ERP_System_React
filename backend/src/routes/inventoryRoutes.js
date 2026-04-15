/* eslint-disable no-undef */
/* eslint-env node */
const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');
const { verifyToken } = require('../middleware/authMiddleware');
const { sanitizeInput } = require('../middleware/validation');

function normalizeRole(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[_\s]+/g, '-');
}

function normalizeModule(value) {
  return String(value || '').trim().toLowerCase();
}

function ensureInventoryAccess(req, res, next) {
  const role = normalizeRole(req.user?.role);

  if (['root-admin', 'admin', 'inventory'].includes(role)) {
    return next();
  }

  if (['client', 'sub-user'].includes(role)) {
    const allowedModules = Array.isArray(req.user?.allowedModules)
      ? req.user.allowedModules.map(normalizeModule)
      : [];

    if (allowedModules.includes('inventory')) {
      return next();
    }
  }

  return res.status(403).json({
    status: 'ERROR',
    message: 'Access denied - insufficient privileges',
  });
}

router.use(verifyToken);
router.use(ensureInventoryAccess);

router.get('/products', inventoryController.products.fetchItems);
router.get('/products/next-code', inventoryController.products.fetchNextCode);
router.post('/products', sanitizeInput, inventoryController.products.createItem);
router.post('/products/import', sanitizeInput, inventoryController.products.importProducts);
router.patch('/products/:code', sanitizeInput, inventoryController.products.updateItem);
router.delete('/products/:code', inventoryController.products.deleteItem);

router.get('/categories', inventoryController.categories.fetchItems);
router.get('/categories/next-code', inventoryController.categories.fetchNextCodeHandler);
router.post('/categories', sanitizeInput, inventoryController.categories.createItem);
router.patch('/categories/:code', sanitizeInput, inventoryController.categories.updateItem);
router.delete('/categories/:code', inventoryController.categories.deleteItem);

router.get('/stock', inventoryController.stock.fetchItems);
router.get('/stock/next-code', inventoryController.stock.fetchNextCodeHandler);
router.post('/stock', sanitizeInput, inventoryController.stock.createItem);
router.patch('/stock/:code', sanitizeInput, inventoryController.stock.updateItem);
router.delete('/stock/:code', inventoryController.stock.deleteItem);

router.get('/suppliers', inventoryController.suppliers.fetchItems);
router.get('/suppliers/next-code', inventoryController.suppliers.fetchNextCodeHandler);
router.post('/suppliers', sanitizeInput, inventoryController.suppliers.createItem);
router.patch('/suppliers/:code', sanitizeInput, inventoryController.suppliers.updateItem);
router.delete('/suppliers/:code', inventoryController.suppliers.deleteItem);

router.get('/warehouses', inventoryController.warehouses.fetchItems);
router.get('/warehouses/next-code', inventoryController.warehouses.fetchNextCodeHandler);
router.post('/warehouses', sanitizeInput, inventoryController.warehouses.createItem);
router.patch('/warehouses/:code', sanitizeInput, inventoryController.warehouses.updateItem);
router.delete('/warehouses/:code', inventoryController.warehouses.deleteItem);

router.get('/purchase-orders', inventoryController.purchaseOrders.fetchItems);
router.get('/purchase-orders/next-code', inventoryController.purchaseOrders.fetchNextCodeHandler);
router.post('/purchase-orders', sanitizeInput, inventoryController.purchaseOrders.createItem);
router.patch('/purchase-orders/:code', sanitizeInput, inventoryController.purchaseOrders.updateItem);
router.delete('/purchase-orders/:code', inventoryController.purchaseOrders.deleteItem);
router.get('/purchase-orders/:poNumber/pdf', inventoryController.purchaseOrders.fetchPurchaseOrderPdf);

router.get('/adjustments', inventoryController.adjustments.fetchItems);
router.get('/adjustments/next-code', inventoryController.adjustments.fetchNextCodeHandler);
router.post('/adjustments', sanitizeInput, inventoryController.adjustments.createItem);
router.patch('/adjustments/:code', sanitizeInput, inventoryController.adjustments.updateItem);
router.delete('/adjustments/:code', inventoryController.adjustments.deleteItem);

module.exports = router;
