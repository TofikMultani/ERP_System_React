/* eslint-disable no-undef */
/* eslint-env node */
const pool = require('../config/database');

const REQUIRED_FIELDS = [
  'title',
  'department',
  'trainerName',
  'trainingMode',
  'startDate',
  'endDate',
  'totalSeats',
  'status',
];

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

function normalizeNumber(value, { allowNull = false } = {}) {
  const text = normalizeText(value);
  if (!text) {
    return allowNull ? null : 0;
  }

  const parsed = Number(text);
  if (!Number.isFinite(parsed)) {
    return allowNull ? null : 0;
  }

  return parsed;
}

function normalizeInteger(value) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return 0;
  }

  return Math.max(0, Math.trunc(parsed));
}

function normalizeTrainingPayload(payload) {
  const totalSeats = normalizeInteger(payload.totalSeats);
  const enrolledCount = Math.min(normalizeInteger(payload.enrolledCount), totalSeats);

  return {
    title: normalizeText(payload.title),
    department: normalizeText(payload.department),
    trainerName: normalizeText(payload.trainerName),
    trainingMode: normalizeText(payload.trainingMode) || 'Online',
    providerName: normalizeText(payload.providerName),
    location: normalizeText(payload.location),
    startDate: normalizeDate(payload.startDate),
    endDate: normalizeDate(payload.endDate),
    durationHours: normalizeNumber(payload.durationHours),
    totalSeats,
    enrolledCount,
    budget: normalizeNumber(payload.budget, { allowNull: true }),
    status: normalizeText(payload.status) || 'Upcoming',
    description: normalizeText(payload.description),
  };
}

function hasRequiredFields(record) {
  return REQUIRED_FIELDS.every((field) => normalizeText(record[field]));
}

function parseTrainingCodeNumber(trainingCode) {
  const match = normalizeText(trainingCode).toUpperCase().match(/(\d+)$/);
  return match ? Number(match[1]) : 0;
}

function formatTrainingCode(value) {
  return `TRN-${String(value).padStart(5, '0')}`;
}

async function getLatestTrainingCode(client = pool, { forUpdate = false } = {}) {
  const result = await client.query(
    `
      SELECT training_code
      FROM training_programs
      ORDER BY id DESC
      LIMIT 1
      ${forUpdate ? 'FOR UPDATE' : ''}
    `,
  );

  return result.rows[0]?.training_code || '';
}

async function getNextTrainingCode(client = pool, options = {}) {
  const latestCode = await getLatestTrainingCode(client, options);
  return formatTrainingCode(parseTrainingCodeNumber(latestCode) + 1);
}

function mapTrainingRow(row) {
  return {
    id: row.id,
    trainingCode: row.training_code,
    title: row.title,
    department: row.department,
    trainerName: row.trainer_name,
    trainingMode: row.training_mode,
    providerName: row.provider_name || '',
    location: row.location || '',
    startDate: row.start_date,
    endDate: row.end_date,
    durationHours: Number(row.duration_hours || 0),
    totalSeats: Number(row.total_seats || 0),
    enrolledCount: Number(row.enrolled_count || 0),
    budget: row.budget === null ? '' : Number(row.budget || 0),
    status: row.status,
    description: row.description || '',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function fetchTrainingPrograms(req, res) {
  try {
    const result = await pool.query(
      `
        SELECT *
        FROM training_programs
        ORDER BY id DESC
      `,
    );

    return res.status(200).json({
      status: 'OK',
      data: result.rows.map(mapTrainingRow),
    });
  } catch (error) {
    console.error('Fetch training programs error:', error);
    return res.status(500).json({
      status: 'ERROR',
      message: 'Error fetching training programs',
      error: error.message,
    });
  }
}

async function fetchNextTrainingCode(req, res) {
  try {
    const trainingCode = await getNextTrainingCode();

    return res.status(200).json({
      status: 'OK',
      data: { trainingCode },
    });
  } catch (error) {
    console.error('Fetch next training code error:', error);
    return res.status(500).json({
      status: 'ERROR',
      message: 'Error fetching next training code',
      error: error.message,
    });
  }
}

async function createTrainingProgram(req, res) {
  const client = await pool.connect();

  try {
    const payload = normalizeTrainingPayload(req.body || {});

    if (!hasRequiredFields(payload)) {
      return res.status(400).json({
        status: 'ERROR',
        message: 'Missing required training fields',
      });
    }

    await client.query('BEGIN');
    const trainingCode = await getNextTrainingCode(client, { forUpdate: true });

    const result = await client.query(
      `
        INSERT INTO training_programs (
          training_code,
          title,
          department,
          trainer_name,
          training_mode,
          provider_name,
          location,
          start_date,
          end_date,
          duration_hours,
          total_seats,
          enrolled_count,
          budget,
          status,
          description,
          created_by,
          updated_by,
          updated_at
        )
        VALUES (
          $1, $2, $3, $4, $5, $6, $7,
          $8::date, $9::date, $10, $11, $12, $13, $14, $15,
          $16, $16, CURRENT_TIMESTAMP
        )
        RETURNING *
      `,
      [
        trainingCode,
        payload.title,
        payload.department,
        payload.trainerName,
        payload.trainingMode,
        payload.providerName || null,
        payload.location || null,
        payload.startDate,
        payload.endDate,
        payload.durationHours,
        payload.totalSeats,
        payload.enrolledCount,
        payload.budget,
        payload.status,
        payload.description || null,
        req.user?.id || null,
      ],
    );

    await client.query('COMMIT');

    return res.status(201).json({
      status: 'OK',
      message: 'Training program created successfully',
      data: mapTrainingRow(result.rows[0]),
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Create training program error:', error);
    return res.status(500).json({
      status: 'ERROR',
      message: 'Error creating training program',
      error: error.message,
    });
  } finally {
    client.release();
  }
}

async function updateTrainingProgram(req, res) {
  try {
    const { trainingCode } = req.params;
    const payload = normalizeTrainingPayload(req.body || {});

    if (!hasRequiredFields(payload)) {
      return res.status(400).json({
        status: 'ERROR',
        message: 'Missing required training fields',
      });
    }

    const result = await pool.query(
      `
        UPDATE training_programs
        SET
          title = $2,
          department = $3,
          trainer_name = $4,
          training_mode = $5,
          provider_name = $6,
          location = $7,
          start_date = $8::date,
          end_date = $9::date,
          duration_hours = $10,
          total_seats = $11,
          enrolled_count = $12,
          budget = $13,
          status = $14,
          description = $15,
          updated_by = $16,
          updated_at = CURRENT_TIMESTAMP
        WHERE training_code = $1
        RETURNING *
      `,
      [
        trainingCode,
        payload.title,
        payload.department,
        payload.trainerName,
        payload.trainingMode,
        payload.providerName || null,
        payload.location || null,
        payload.startDate,
        payload.endDate,
        payload.durationHours,
        payload.totalSeats,
        payload.enrolledCount,
        payload.budget,
        payload.status,
        payload.description || null,
        req.user?.id || null,
      ],
    );

    if (!result.rows.length) {
      return res.status(404).json({
        status: 'ERROR',
        message: 'Training program not found',
      });
    }

    return res.status(200).json({
      status: 'OK',
      message: 'Training program updated successfully',
      data: mapTrainingRow(result.rows[0]),
    });
  } catch (error) {
    console.error('Update training program error:', error);
    return res.status(500).json({
      status: 'ERROR',
      message: 'Error updating training program',
      error: error.message,
    });
  }
}

async function deleteTrainingProgram(req, res) {
  try {
    const { trainingCode } = req.params;

    const result = await pool.query(
      `
        DELETE FROM training_programs
        WHERE training_code = $1
        RETURNING id
      `,
      [trainingCode],
    );

    if (!result.rows.length) {
      return res.status(404).json({
        status: 'ERROR',
        message: 'Training program not found',
      });
    }

    return res.status(200).json({
      status: 'OK',
      message: 'Training program deleted successfully',
    });
  } catch (error) {
    console.error('Delete training program error:', error);
    return res.status(500).json({
      status: 'ERROR',
      message: 'Error deleting training program',
      error: error.message,
    });
  }
}

module.exports = {
  fetchTrainingPrograms,
  fetchNextTrainingCode,
  createTrainingProgram,
  updateTrainingProgram,
  deleteTrainingProgram,
};
