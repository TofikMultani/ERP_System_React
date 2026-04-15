/* eslint-disable no-undef */
/* eslint-env node */
const express = require('express');
const router = express.Router();
const departmentController = require('../controllers/departmentController');
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

function ensureDepartmentAccess(req, res, next) {
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
router.use(ensureDepartmentAccess);

router.get('/', departmentController.fetchDepartments);
router.get('/next-code', departmentController.fetchNextDepartmentCode);
router.post('/', sanitizeInput, departmentController.createDepartment);
router.patch('/:departmentCode', sanitizeInput, departmentController.updateDepartment);
router.delete('/:departmentCode', departmentController.deleteDepartment);

module.exports = router;
