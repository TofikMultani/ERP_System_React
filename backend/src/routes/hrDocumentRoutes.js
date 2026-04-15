/* eslint-disable no-undef */
/* eslint-env node */
const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const hrDocumentController = require('../controllers/hrDocumentController');
const { verifyToken } = require('../middleware/authMiddleware');

const router = express.Router();

const MAX_FILE_SIZE_BYTES = 1 * 1024 * 1024;
const uploadsDir = path.join(__dirname, '..', '..', 'uploads', 'hr-documents');

function normalizeRole(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[_\s]+/g, '-');
}

function normalizeModule(value) {
  return String(value || '').trim().toLowerCase();
}

function ensureDocumentAccess(req, res, next) {
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

const storage = multer.diskStorage({
  destination(req, file, callback) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    callback(null, uploadsDir);
  },
  filename(req, file, callback) {
    const extension = path.extname(file.originalname || '').toLowerCase();
    const baseName = path
      .basename(file.originalname || 'document', extension)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
      .slice(0, 60);

    const safeBaseName = baseName || 'document';
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    callback(null, `${safeBaseName}-${unique}${extension}`);
  },
});

const allowedMimeTypes = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain',
  'image/png',
  'image/jpeg',
]);

const upload = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE_BYTES,
  },
  fileFilter(req, file, callback) {
    if (!allowedMimeTypes.has(String(file.mimetype || '').toLowerCase())) {
      callback(new Error('Unsupported file type'));
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
router.use(ensureDocumentAccess);

router.get('/', hrDocumentController.fetchHrDocuments);
router.get('/next-code', hrDocumentController.fetchNextDocumentCode);
router.get('/:documentCode/file', hrDocumentController.downloadHrDocumentFile);
router.post('/', handleSingleFileUpload, hrDocumentController.createHrDocument);
router.delete('/:documentCode', hrDocumentController.deleteHrDocument);

module.exports = router;
