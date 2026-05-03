/* eslint-disable no-undef */
/* eslint-env node */
const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const router = express.Router();
const financeController = require('../controllers/financeController');
const { verifyToken } = require('../middleware/authMiddleware');
const { sanitizeInput } = require('../middleware/validation');

const MAX_FILE_SIZE_BYTES = 1 * 1024 * 1024;
const uploadsDir = path.join(__dirname, '..', '..', 'uploads', 'finance-entries');

function normalizeRole(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[_\s]+/g, '-');
}

function normalizeModule(value) {
  return String(value || '').trim().toLowerCase();
}

function ensureFinanceAccess(req, res, next) {
  const role = normalizeRole(req.user?.role);

  if (['root-admin', 'admin', 'finance'].includes(role)) {
    return next();
  }

  if (['client', 'sub-user'].includes(role)) {
    const allowedModules = Array.isArray(req.user?.allowedModules)
      ? req.user.allowedModules.map(normalizeModule)
      : [];

    if (allowedModules.includes('finance')) {
      return next();
    }
  }

  return res.status(403).json({
    status: 'ERROR',
    message: 'Access denied - insufficient privileges',
  });
}

const storage = multer.diskStorage({
  destination(req, file, callback) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    callback(null, uploadsDir);
  },
  filename(req, file, callback) {
    const extension = path.extname(file.originalname || '').toLowerCase();
    const baseName = path
      .basename(file.originalname || 'attachment', extension)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
      .slice(0, 60);

    const safeBaseName = baseName || 'attachment';
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    callback(null, `${safeBaseName}-${unique}${extension}`);
  },
});

const allowedMimeTypes = new Set([
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
  'image/gif',
]);

const upload = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE_BYTES,
  },
  fileFilter(req, file, callback) {
    if (!allowedMimeTypes.has(String(file.mimetype || '').toLowerCase())) {
      callback(new Error('Only PDF and image files are allowed'));
      return;
    }

    callback(null, true);
  },
});

function handleSingleFileUpload(req, res, next) {
  upload.single('file')(req, res, (error) => {
    if (!error) {
      next();
      return;
    }

    if (error instanceof multer.MulterError && error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        status: 'ERROR',
        message: 'File size exceeds 1 MB limit',
      });
    }

    return res.status(400).json({
      status: 'ERROR',
      message: error.message || 'File upload failed',
    });
  });
}

router.use(verifyToken);
router.use(ensureFinanceAccess);

router.get('/income', financeController.incomeHandlers.fetchItems);
router.get('/income/next-code', financeController.incomeHandlers.fetchNextCodeHandler);
router.post('/income/reconcile-sales', financeController.reconcileSalesIncomeHandler);
router.get('/income/:code/file', financeController.downloadIncomeAttachment);
router.post('/income', handleSingleFileUpload, sanitizeInput, financeController.incomeHandlers.createItem);
router.patch('/income/:code', handleSingleFileUpload, sanitizeInput, financeController.incomeHandlers.updateItem);
router.delete('/income/:code', financeController.incomeHandlers.deleteItem);

router.get('/expenses', financeController.expensesHandlers.fetchItems);
router.get('/expenses/next-code', financeController.expensesHandlers.fetchNextCodeHandler);
router.get('/expenses/:code/file', financeController.downloadExpenseAttachment);
router.post('/expenses', handleSingleFileUpload, sanitizeInput, financeController.expensesHandlers.createItem);
router.patch('/expenses/:code', handleSingleFileUpload, sanitizeInput, financeController.expensesHandlers.updateItem);
router.delete('/expenses/:code', financeController.expensesHandlers.deleteItem);

router.get('/payments', financeController.paymentsHandlers.fetchItems);
router.get('/payments/next-code', financeController.paymentsHandlers.fetchNextCodeHandler);
router.post('/payments', sanitizeInput, financeController.paymentsHandlers.createItem);
router.patch('/payments/:code', sanitizeInput, financeController.paymentsHandlers.updateItem);
router.delete('/payments/:code', financeController.paymentsHandlers.deleteItem);

router.get('/dashboard', financeController.getDashboard);

module.exports = router;
