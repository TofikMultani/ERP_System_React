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
router.get(
  '/access-requests/payment-provisioning',
  accessRequestController.getPaymentProvisioningRequests,
);
router.patch(
  '/access-requests/:requestId/status',
  sanitizeInput,
  accessRequestController.updateAccessRequestStatus,
);
router.post(
  '/access-requests/:requestId/generate-credentials',
  sanitizeInput,
  accessRequestController.generateCredentialsForRequest,
);

module.exports = router;
