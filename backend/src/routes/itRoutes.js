/* eslint-disable no-undef */
/* eslint-env node */
const express = require('express');
const router = express.Router();
const itController = require('../controllers/itController');
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

function ensureItAccess(req, res, next) {
  const role = normalizeRole(req.user?.role);

  if (['root-admin', 'admin', 'it'].includes(role)) {
    return next();
  }

  if (['client', 'sub-user'].includes(role)) {
    const allowedModules = Array.isArray(req.user?.allowedModules)
      ? req.user.allowedModules.map(normalizeModule)
      : [];

    if (allowedModules.includes('it')) {
      return next();
    }
  }

  return res.status(403).json({
    status: 'ERROR',
    message: 'Access denied - insufficient privileges',
  });
}

router.use(verifyToken);
router.use(ensureItAccess);

router.get('/systems', itController.systemsHandlers.fetchItems);
router.get('/systems/next-code', itController.systemsHandlers.fetchNextCodeHandler);
router.post('/systems', sanitizeInput, itController.systemsHandlers.createItem);
router.patch('/systems/:code', sanitizeInput, itController.systemsHandlers.updateItem);
router.delete('/systems/:code', itController.systemsHandlers.deleteItem);

router.get('/assets', itController.assetsHandlers.fetchItems);
router.get('/assets/next-code', itController.assetsHandlers.fetchNextCodeHandler);
router.post('/assets', sanitizeInput, itController.assetsHandlers.createItem);
router.patch('/assets/:code', sanitizeInput, itController.assetsHandlers.updateItem);
router.delete('/assets/:code', itController.assetsHandlers.deleteItem);

router.get('/maintenance', itController.maintenanceHandlers.fetchItems);
router.get('/maintenance/next-code', itController.maintenanceHandlers.fetchNextCodeHandler);
router.post('/maintenance', sanitizeInput, itController.maintenanceHandlers.createItem);
router.patch('/maintenance/:code', sanitizeInput, itController.maintenanceHandlers.updateItem);
router.delete('/maintenance/:code', itController.maintenanceHandlers.deleteItem);

router.get('/dashboard', itController.getDashboard);

module.exports = router;
