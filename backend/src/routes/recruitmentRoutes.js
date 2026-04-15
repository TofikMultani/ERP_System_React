/* eslint-disable no-undef */
/* eslint-env node */
const express = require('express');
const router = express.Router();
const recruitmentController = require('../controllers/recruitmentController');
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

function ensureRecruitmentAccess(req, res, next) {
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
router.use(ensureRecruitmentAccess);

router.get('/', recruitmentController.fetchRecruitmentCandidates);
router.get('/next-code', recruitmentController.fetchNextCandidateCode);
router.post('/', sanitizeInput, recruitmentController.createRecruitmentCandidate);
router.patch('/:candidateCode', sanitizeInput, recruitmentController.updateRecruitmentCandidate);
router.delete('/:candidateCode', recruitmentController.deleteRecruitmentCandidate);

module.exports = router;
