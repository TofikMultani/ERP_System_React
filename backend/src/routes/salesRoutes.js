/* eslint-disable no-undef */
/* eslint-env node */
const express = require('express');
const router = express.Router();
const salesController = require('../controllers/salesController');
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

function ensureSalesAccess(req, res, next) {
  const role = normalizeRole(req.user?.role);

  if (['root-admin', 'admin', 'sales'].includes(role)) {
    return next();
  }

  if (['client', 'sub-user'].includes(role)) {
    const allowedModules = Array.isArray(req.user?.allowedModules)
      ? req.user.allowedModules.map(normalizeModule)
      : [];

    if (allowedModules.includes('sales')) {
      return next();
    }
  }

  return res.status(403).json({
    status: 'ERROR',
    message: 'Access denied - insufficient privileges',
  });
}

router.use(verifyToken);
router.use(ensureSalesAccess);

// Customers routes
router.get('/customers', salesController.customersHandlers.fetchItems);
router.get('/customers/next-code', salesController.customersHandlers.fetchNextCodeHandler);
router.post('/customers', sanitizeInput, salesController.customersHandlers.createItem);
router.patch('/customers/:code', sanitizeInput, salesController.customersHandlers.updateItem);
router.delete('/customers/:code', salesController.customersHandlers.deleteItem);

// Orders routes
router.get('/orders', salesController.ordersHandlers.fetchItems);
router.get('/orders/next-code', salesController.ordersHandlers.fetchNextCodeHandler);
router.post('/orders', sanitizeInput, salesController.ordersHandlers.createItem);
router.patch('/orders/:code', sanitizeInput, salesController.ordersHandlers.updateItem);
router.delete('/orders/:code', salesController.ordersHandlers.deleteItem);

// Invoices routes
router.get('/invoices', salesController.invoicesHandlers.fetchItems);
router.get('/invoices/next-code', salesController.invoicesHandlers.fetchNextCodeHandler);
router.post('/invoices', sanitizeInput, salesController.invoicesHandlers.createItem);
router.patch('/invoices/:code', sanitizeInput, salesController.invoicesHandlers.updateItem);
router.delete('/invoices/:code', salesController.invoicesHandlers.deleteItem);

// Quotations routes
router.get('/quotations', salesController.quotationsHandlers.fetchItems);
router.get('/quotations/next-code', salesController.quotationsHandlers.fetchNextCodeHandler);
router.post('/quotations', sanitizeInput, salesController.quotationsHandlers.createItem);
router.patch('/quotations/:code', sanitizeInput, salesController.quotationsHandlers.updateItem);
router.delete('/quotations/:code', salesController.quotationsHandlers.deleteItem);

// Dashboard route
router.get('/dashboard', salesController.getDashboard);

module.exports = router;
