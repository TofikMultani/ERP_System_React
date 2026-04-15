/* eslint-env node */
const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employeeController');
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

function ensureEmployeeAccess(req, res, next) {
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
router.use(ensureEmployeeAccess);

router.get('/', employeeController.fetchEmployees);
router.get('/next-id', employeeController.fetchNextEmployeeId);
router.post('/', sanitizeInput, employeeController.createEmployee);
router.post('/import', sanitizeInput, employeeController.importEmployees);
router.patch('/:employeeId', sanitizeInput, employeeController.updateEmployee);
router.delete('/:employeeId', employeeController.deleteEmployee);

module.exports = router;
