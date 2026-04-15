/* eslint-disable no-undef */
/* eslint-env node */
const fs = require('fs');
const path = require('path');
const pool = require('../config/database');

const REQUIRED_FIELDS = ['title', 'category', 'ownerName', 'status'];

function normalizeText(value) {
  return String(value || '').trim();
}

function normalizeDate(value) {
  const text = normalizeText(value);
  if (!text) {
    return null;
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) {
    return text;
  }

  const parsed = new Date(text);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed.toISOString().slice(0, 10);
}

function parseDocumentCodeNumber(documentCode) {
  const match = normalizeText(documentCode).toUpperCase().match(/(\d+)$/);
  return match ? Number(match[1]) : 0;
}

function formatDocumentCode(value) {
  return `DOC-${String(value).padStart(5, '0')}`;
}

async function getLatestDocumentCode(client = pool, { forUpdate = false } = {}) {
  const result = await client.query(
    `
      SELECT document_code
      FROM hr_documents
      ORDER BY id DESC
      LIMIT 1
      ${forUpdate ? 'FOR UPDATE' : ''}
    `,
  );

  return result.rows[0]?.document_code || '';
}

async function getNextDocumentCode(client = pool, options = {}) {
  const latestCode = await getLatestDocumentCode(client, options);
  return formatDocumentCode(parseDocumentCodeNumber(latestCode) + 1);
}

function normalizeDocumentPayload(payload) {
  return {
    title: normalizeText(payload.title),
    category: normalizeText(payload.category),
    ownerName: normalizeText(payload.ownerName),
    linkedEmployeeId: normalizeText(payload.linkedEmployeeId),
    effectiveDate: normalizeDate(payload.effectiveDate),
    expiryDate: normalizeDate(payload.expiryDate),
    status: normalizeText(payload.status) || 'Active',
    description: normalizeText(payload.description),
  };
}

function hasRequiredFields(record) {
  return REQUIRED_FIELDS.every((field) => normalizeText(record[field]));
}

function mapDocumentRow(row) {
  return {
    id: row.id,
    documentCode: row.document_code,
    title: row.title,
    category: row.category,
    ownerName: row.owner_name,
    linkedEmployeeId: row.linked_employee_id || '',
    effectiveDate: row.effective_date,
    expiryDate: row.expiry_date,
    status: row.status,
    description: row.description || '',
    originalFileName: row.original_file_name,
    storedFileName: row.stored_file_name,
    filePath: row.file_path,
    mimeType: row.mime_type || '',
    fileSizeBytes: Number(row.file_size_bytes || 0),
    uploadedAt: row.uploaded_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function fetchHrDocuments(req, res) {
  try {
    const result = await pool.query(
      `
        SELECT *
        FROM hr_documents
        ORDER BY id DESC
      `,
    );

    return res.status(200).json({
      status: 'OK',
      data: result.rows.map(mapDocumentRow),
    });
  } catch (error) {
    console.error('Fetch HR documents error:', error);
    return res.status(500).json({
      status: 'ERROR',
      message: 'Error fetching HR documents',
      error: error.message,
    });
  }
}

async function fetchNextDocumentCode(req, res) {
  try {
    const documentCode = await getNextDocumentCode();

    return res.status(200).json({
      status: 'OK',
      data: { documentCode },
    });
  } catch (error) {
    console.error('Fetch next document code error:', error);
    return res.status(500).json({
      status: 'ERROR',
      message: 'Error fetching next document code',
      error: error.message,
    });
  }
}

async function createHrDocument(req, res) {
  const client = await pool.connect();

  try {
    if (!req.file) {
      return res.status(400).json({
        status: 'ERROR',
        message: 'Document file is required',
      });
    }

    const payload = normalizeDocumentPayload(req.body || {});

    if (!hasRequiredFields(payload)) {
      try {
        fs.unlinkSync(req.file.path);
      } catch {
        // ignore cleanup failure
      }

      return res.status(400).json({
        status: 'ERROR',
        message: 'Missing required document fields',
      });
    }

    await client.query('BEGIN');
    const documentCode = await getNextDocumentCode(client, { forUpdate: true });
    const relativePath = path
      .relative(path.join(__dirname, '..', '..'), req.file.path)
      .split(path.sep)
      .join('/');

    const result = await client.query(
      `
        INSERT INTO hr_documents (
          document_code,
          title,
          category,
          owner_name,
          linked_employee_id,
          effective_date,
          expiry_date,
          status,
          description,
          original_file_name,
          stored_file_name,
          file_path,
          mime_type,
          file_size_bytes,
          uploaded_at,
          created_by,
          updated_by,
          updated_at
        )
        VALUES (
          $1, $2, $3, $4, $5,
          $6::date, $7::date, $8, $9, $10,
          $11, $12, $13, $14, CURRENT_TIMESTAMP, $15, $15, CURRENT_TIMESTAMP
        )
        RETURNING *
      `,
      [
        documentCode,
        payload.title,
        payload.category,
        payload.ownerName,
        payload.linkedEmployeeId || null,
        payload.effectiveDate,
        payload.expiryDate,
        payload.status,
        payload.description || null,
        req.file.originalname,
        req.file.filename,
        relativePath,
        req.file.mimetype || null,
        req.file.size || 0,
        req.user?.id || null,
      ],
    );

    await client.query('COMMIT');

    return res.status(201).json({
      status: 'OK',
      message: 'HR document uploaded successfully',
      data: mapDocumentRow(result.rows[0]),
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Create HR document error:', error);
    return res.status(500).json({
      status: 'ERROR',
      message: 'Error uploading HR document',
      error: error.message,
    });
  } finally {
    client.release();
  }
}

function getAbsolutePath(relativeFilePath) {
  return path.join(__dirname, '..', '..', relativeFilePath);
}

async function downloadHrDocumentFile(req, res) {
  try {
    const { documentCode } = req.params;

    const result = await pool.query(
      `
        SELECT document_code, original_file_name, file_path
        FROM hr_documents
        WHERE document_code = $1
      `,
      [documentCode],
    );

    if (!result.rows.length) {
      return res.status(404).json({
        status: 'ERROR',
        message: 'Document not found',
      });
    }

    const document = result.rows[0];
    const absolutePath = getAbsolutePath(document.file_path);

    if (!fs.existsSync(absolutePath)) {
      return res.status(404).json({
        status: 'ERROR',
        message: 'Document file not found on server',
      });
    }

    return res.download(absolutePath, document.original_file_name);
  } catch (error) {
    console.error('Download HR document error:', error);
    return res.status(500).json({
      status: 'ERROR',
      message: 'Error downloading document',
      error: error.message,
    });
  }
}

async function deleteHrDocument(req, res) {
  try {
    const { documentCode } = req.params;

    const result = await pool.query(
      `
        DELETE FROM hr_documents
        WHERE document_code = $1
        RETURNING file_path
      `,
      [documentCode],
    );

    if (!result.rows.length) {
      return res.status(404).json({
        status: 'ERROR',
        message: 'Document not found',
      });
    }

    const absolutePath = getAbsolutePath(result.rows[0].file_path);
    if (fs.existsSync(absolutePath)) {
      try {
        fs.unlinkSync(absolutePath);
      } catch {
        // ignore file deletion errors
      }
    }

    return res.status(200).json({
      status: 'OK',
      message: 'Document deleted successfully',
    });
  } catch (error) {
    console.error('Delete HR document error:', error);
    return res.status(500).json({
      status: 'ERROR',
      message: 'Error deleting document',
      error: error.message,
    });
  }
}

module.exports = {
  fetchHrDocuments,
  fetchNextDocumentCode,
  createHrDocument,
  downloadHrDocumentFile,
  deleteHrDocument,
};
