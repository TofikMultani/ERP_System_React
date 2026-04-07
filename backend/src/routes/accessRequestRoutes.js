/* eslint-env node */
const express = require('express');
const router = express.Router();
const accessRequestController = require('../controllers/accessRequestController');
const { sanitizeInput } = require('../middleware/validation');

router.post('/', sanitizeInput, accessRequestController.createAccessRequest);
router.get('/action/:token', accessRequestController.getAccessRequestByActionToken);
router.post('/action/:token/cancel', accessRequestController.cancelAccessRequestByActionToken);
router.post('/action/:token/create-order', accessRequestController.createPaymentOrderByActionToken);
router.post('/action/:token/verify-payment', accessRequestController.verifyPaymentByActionToken);

module.exports = router;
