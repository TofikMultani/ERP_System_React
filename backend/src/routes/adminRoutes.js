/* eslint-env node */
/* eslint-disable no-undef */
const express = require('express');
const router = express.Router();
const moduleController = require('../controllers/moduleController');
const accessRequestController = require('../controllers/accessRequestController');
const { verifyToken, checkRole } = require('../middleware/authMiddleware');
const { sanitizeInput } = require('../middleware/validation');

router.use(verifyToken, checkRole(['root-admin']));

router.get('/modules', moduleController.getModules);
router.patch('/modules/:moduleKey', sanitizeInput, moduleController.updateModule);

router.get('/access-requests', accessRequestController.getAccessRequests);
router.patch(
  '/access-requests/:requestId/status',
  sanitizeInput,
  accessRequestController.updateAccessRequestStatus,
);

module.exports = router;
