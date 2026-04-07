/* eslint-env node */
const express = require('express');
const router = express.Router();
const moduleController = require('../controllers/moduleController');

router.get('/', moduleController.getModules);

module.exports = router;
