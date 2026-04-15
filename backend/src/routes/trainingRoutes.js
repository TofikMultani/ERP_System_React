/* eslint-disable no-undef */
/* eslint-env node */
const express = require('express');
const router = express.Router();
const trainingController = require('../controllers/trainingController');
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

function ensureTrainingAccess(req, res, next) {
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
router.use(ensureTrainingAccess);

router.get('/', trainingController.fetchTrainingPrograms);
router.get('/next-code', trainingController.fetchNextTrainingCode);
router.post('/', sanitizeInput, trainingController.createTrainingProgram);
router.patch('/:trainingCode', sanitizeInput, trainingController.updateTrainingProgram);
router.delete('/:trainingCode', trainingController.deleteTrainingProgram);

module.exports = router;
