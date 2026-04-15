/* eslint-disable no-undef */
/* eslint-env node */
const express = require('express');
const router = express.Router();
const payrollController = require('../controllers/payrollController');
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

function ensurePayrollAccess(req, res, next) {
  const role = normalizeRole(req.user?.role);

  if (['root-admin', 'admin', 'hr'].includes(role)) {
    return next();
  }

  if (['client', 'sub-user'].includes(role)) {
    const allowedModules = Array.isArray(req.user?.allowedModules)
      ? req.user.allowedModules.map(normalizeModule)
      : [];

    if (allowedModules.includes('hr')) {
      return next();
    }
  }

  return res.status(403).json({
    status: 'ERROR',
    message: 'Access denied - insufficient privileges',
  });
}

router.use(verifyToken);
router.use(ensurePayrollAccess);

router.get('/', payrollController.fetchPayrollRecords);
router.get('/next-code', payrollController.fetchNextPayrollCode);
router.post('/', sanitizeInput, payrollController.createPayrollRecord);
router.post('/generate-month', sanitizeInput, payrollController.generatePayrollForMonth);
router.patch('/:payrollCode', sanitizeInput, payrollController.updatePayrollRecord);
router.delete('/:payrollCode', payrollController.deletePayrollRecord);

module.exports = router;
