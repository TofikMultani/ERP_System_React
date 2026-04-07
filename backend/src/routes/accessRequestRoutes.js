/* eslint-env node */
const express = require('express');
const router = express.Router();
const accessRequestController = require('../controllers/accessRequestController');
const { sanitizeInput } = require('../middleware/validation');

router.post('/', sanitizeInput, accessRequestController.createAccessRequest);

module.exports = router;
