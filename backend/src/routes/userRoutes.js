/* eslint-env node */
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { verifyToken } = require('../middleware/authMiddleware');
const { sanitizeInput, validateEmail } = require('../middleware/validation');

router.use(verifyToken);

router.get('/my-users', userController.getMyUsers);
router.post('/my-users', sanitizeInput, validateEmail, userController.createMyUser);
router.patch('/my-users/:userId', sanitizeInput, validateEmail, userController.updateMyUser);
router.delete('/my-users/:userId', userController.deleteMyUser);

module.exports = router;