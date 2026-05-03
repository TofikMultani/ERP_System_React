/* eslint-disable no-undef */
/* eslint-env node */
const express = require('express');
const router = express.Router();
const salaryController = require('../controllers/salaryManagementController');
const { verifyToken } = require('../middleware/authMiddleware');
const { sanitizeInput } = require('../middleware/validation');

function normalizeRole(value) {
  return String(value || '').trim().toLowerCase().replace(/[_\s]+/g, '-');
}

function normalizeModule(value) {
  return String(value || '').trim().toLowerCase();
}

function ensureSalaryAccess(req, res, next) {
  const role = normalizeRole(req.user?.role);
  if (['root-admin', 'admin', 'hr'].includes(role)) return next();

  if (['client', 'sub-user'].includes(role)) {
    const allowedModules = Array.isArray(req.user?.allowedModules) ? req.user.allowedModules.map(normalizeModule) : [];
    if (allowedModules.includes('hr')) return next();
  }

  return res.status(403).json({ status: 'ERROR', message: 'Access denied - insufficient privileges' });
}

router.use(verifyToken);
router.use(ensureSalaryAccess);

router.get('/', salaryController.fetchSalaryRecords);
router.get('/next-code', salaryController.fetchNextSalaryCode);
router.post('/', sanitizeInput, salaryController.createSalaryRecord);
router.post('/generate-month', sanitizeInput, salaryController.generateSalaryForMonth);
router.patch('/:salaryCode', sanitizeInput, salaryController.updateSalaryRecord);
router.delete('/:salaryCode', salaryController.deleteSalaryRecord);

module.exports = router;
