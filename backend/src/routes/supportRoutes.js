/* eslint-disable no-undef */
/* eslint-env node */
const express = require('express');
const router = express.Router();
const supportController = require('../controllers/supportController');
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

function ensureSupportAccess(req, res, next) {
  const role = normalizeRole(req.user?.role);

  if (['root-admin', 'admin', 'support'].includes(role)) {
    return next();
  }

  if (['client', 'sub-user'].includes(role)) {
    const allowedModules = Array.isArray(req.user?.allowedModules)
      ? req.user.allowedModules.map(normalizeModule)
      : [];

    if (allowedModules.includes('support')) {
      return next();
    }
  }

  return res.status(403).json({
    status: 'ERROR',
    message: 'Access denied - insufficient privileges',
  });
}

router.use(verifyToken);
router.use(ensureSupportAccess);

// Customers routes
router.get('/customers', supportController.customers.fetchItems);
router.get('/customers/next-code', supportController.customers.fetchNextCode);
router.post('/customers', sanitizeInput, supportController.customers.createItem);
router.patch('/customers/:code', sanitizeInput, supportController.customers.updateItem);
router.delete('/customers/:code', supportController.customers.deleteItem);

// Tickets routes
router.get('/tickets', supportController.tickets.fetchItems);
router.get('/tickets/next-code', supportController.tickets.fetchNextCode);
router.post('/tickets', sanitizeInput, supportController.tickets.createItem);
router.patch('/tickets/:code', sanitizeInput, supportController.tickets.updateItem);
router.delete('/tickets/:code', supportController.tickets.deleteItem);

// Responses routes
router.get('/responses', supportController.responses.fetchItems);
router.get('/responses/next-code', supportController.responses.fetchNextCode);
router.post('/responses', sanitizeInput, supportController.responses.createItem);
router.patch('/responses/:code', sanitizeInput, supportController.responses.updateItem);
router.delete('/responses/:code', supportController.responses.deleteItem);

// Knowledge Base routes
router.get('/knowledge-base', supportController.knowledgeBase.fetchItems);
router.get('/knowledge-base/next-code', supportController.knowledgeBase.fetchNextCode);
router.post('/knowledge-base', sanitizeInput, supportController.knowledgeBase.createItem);
router.patch('/knowledge-base/:code', sanitizeInput, supportController.knowledgeBase.updateItem);
router.delete('/knowledge-base/:code', supportController.knowledgeBase.deleteItem);

// Dashboard route
router.get('/dashboard', supportController.fetchDashboard);

module.exports = router;
