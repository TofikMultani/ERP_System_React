/* eslint-disable no-undef */
/* eslint-env node */
const express = require('express');
const router = express.Router();
const financeController = require('../controllers/financeController');
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

function ensureFinanceAccess(req, res, next) {
  const role = normalizeRole(req.user?.role);

  if (['root-admin', 'admin', 'finance'].includes(role)) {
    return next();
  }

  if (['client', 'sub-user'].includes(role)) {
    const allowedModules = Array.isArray(req.user?.allowedModules)
      ? req.user.allowedModules.map(normalizeModule)
      : [];

    if (allowedModules.includes('finance')) {
      return next();
    }
  }

  return res.status(403).json({
    status: 'ERROR',
    message: 'Access denied - insufficient privileges',
  });
}

router.use(verifyToken);
router.use(ensureFinanceAccess);

router.get('/income', financeController.incomeHandlers.fetchItems);
router.get('/income/next-code', financeController.incomeHandlers.fetchNextCodeHandler);
router.post('/income', sanitizeInput, financeController.incomeHandlers.createItem);
router.patch('/income/:code', sanitizeInput, financeController.incomeHandlers.updateItem);
router.delete('/income/:code', financeController.incomeHandlers.deleteItem);

router.get('/expenses', financeController.expensesHandlers.fetchItems);
router.get('/expenses/next-code', financeController.expensesHandlers.fetchNextCodeHandler);
router.post('/expenses', sanitizeInput, financeController.expensesHandlers.createItem);
router.patch('/expenses/:code', sanitizeInput, financeController.expensesHandlers.updateItem);
router.delete('/expenses/:code', financeController.expensesHandlers.deleteItem);

router.get('/payments', financeController.paymentsHandlers.fetchItems);
router.get('/payments/next-code', financeController.paymentsHandlers.fetchNextCodeHandler);
router.post('/payments', sanitizeInput, financeController.paymentsHandlers.createItem);
router.patch('/payments/:code', sanitizeInput, financeController.paymentsHandlers.updateItem);
router.delete('/payments/:code', financeController.paymentsHandlers.deleteItem);

router.get('/dashboard', financeController.getDashboard);

module.exports = router;
