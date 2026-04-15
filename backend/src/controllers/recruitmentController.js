/* eslint-disable no-undef */
/* eslint-env node */
const pool = require('../config/database');

const REQUIRED_FIELDS = [
  'candidateName',
  'email',
  'phone',
  'department',
  'roleTitle',
  'applicationDate',
  'stage',
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

function normalizeRecruitmentPayload(payload) {
  return {
    candidateName: normalizeText(payload.candidateName),
    email: normalizeText(payload.email).toLowerCase(),
    phone: normalizeText(payload.phone),
    department: normalizeText(payload.department),
    roleTitle: normalizeText(payload.roleTitle),
    source: normalizeText(payload.source),
    experienceYears: normalizeNumber(payload.experienceYears),
    currentCtc: normalizeNumber(payload.currentCtc, { allowNull: true }),
    expectedCtc: normalizeNumber(payload.expectedCtc, { allowNull: true }),
    noticePeriodDays: normalizeInteger(payload.noticePeriodDays),
    applicationDate: normalizeDate(payload.applicationDate),
    interviewDate: normalizeDate(payload.interviewDate),
    stage: normalizeText(payload.stage) || 'Screening',
    status: normalizeText(payload.status) || 'In Progress',
    recruiterName: normalizeText(payload.recruiterName),
    remarks: normalizeText(payload.remarks),
  };
}

function hasRequiredFields(candidate) {
  return REQUIRED_FIELDS.every((field) => normalizeText(candidate[field]));
}

function parseCandidateCodeNumber(candidateCode) {
  const match = normalizeText(candidateCode).toUpperCase().match(/(\d+)$/);
  return match ? Number(match[1]) : 0;
}

function formatCandidateCode(value) {
  return `REC-${String(value).padStart(5, '0')}`;
}

async function getLatestCandidateCode(client = pool, { forUpdate = false } = {}) {
  const result = await client.query(
    `
      SELECT candidate_code
      FROM recruitment_candidates
      ORDER BY id DESC
      LIMIT 1
      ${forUpdate ? 'FOR UPDATE' : ''}
    `,
  );

  return result.rows[0]?.candidate_code || '';
}

async function getNextCandidateCode(client = pool, options = {}) {
  const latestCode = await getLatestCandidateCode(client, options);
  return formatCandidateCode(parseCandidateCodeNumber(latestCode) + 1);
}

function mapRecruitmentRow(row) {
  return {
    id: row.id,
    candidateCode: row.candidate_code,
    candidateName: row.candidate_name,
    email: row.email,
    phone: row.phone,
    department: row.department,
    roleTitle: row.role_title,
    source: row.source || '',
    experienceYears: Number(row.experience_years || 0),
    currentCtc: row.current_ctc === null ? '' : Number(row.current_ctc || 0),
    expectedCtc: row.expected_ctc === null ? '' : Number(row.expected_ctc || 0),
    noticePeriodDays: Number(row.notice_period_days || 0),
    applicationDate: row.application_date,
    interviewDate: row.interview_date,
    stage: row.stage,
    status: row.status,
    recruiterName: row.recruiter_name || '',
    remarks: row.remarks || '',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function fetchRecruitmentCandidates(req, res) {
  try {
    const result = await pool.query(
      `
        SELECT *
        FROM recruitment_candidates
        ORDER BY id DESC
      `,
    );

    return res.status(200).json({
      status: 'OK',
      data: result.rows.map(mapRecruitmentRow),
    });
  } catch (error) {
    console.error('Fetch recruitment candidates error:', error);
    return res.status(500).json({
      status: 'ERROR',
      message: 'Error fetching recruitment candidates',
      error: error.message,
    });
  }
}

async function fetchNextCandidateCode(req, res) {
  try {
    const candidateCode = await getNextCandidateCode();

    return res.status(200).json({
      status: 'OK',
      data: { candidateCode },
    });
  } catch (error) {
    console.error('Fetch next candidate code error:', error);
    return res.status(500).json({
      status: 'ERROR',
      message: 'Error fetching next candidate code',
      error: error.message,
    });
  }
}

async function createRecruitmentCandidate(req, res) {
  const client = await pool.connect();

  try {
    const payload = normalizeRecruitmentPayload(req.body || {});

    if (!hasRequiredFields(payload)) {
      return res.status(400).json({
        status: 'ERROR',
        message: 'Missing required recruitment fields',
      });
    }

    await client.query('BEGIN');
    const candidateCode = await getNextCandidateCode(client, { forUpdate: true });

    const result = await client.query(
      `
        INSERT INTO recruitment_candidates (
          candidate_code,
          candidate_name,
          email,
          phone,
          department,
          role_title,
          source,
          experience_years,
          current_ctc,
          expected_ctc,
          notice_period_days,
          application_date,
          interview_date,
          stage,
          status,
          recruiter_name,
          remarks,
          created_by,
          updated_by,
          updated_at
        )
        VALUES (
          $1, $2, $3, $4, $5, $6,
          $7, $8, $9, $10, $11,
          $12::date, $13::date, $14, $15, $16, $17, $18, $18, CURRENT_TIMESTAMP
        )
        RETURNING *
      `,
      [
        candidateCode,
        payload.candidateName,
        payload.email,
        payload.phone,
        payload.department,
        payload.roleTitle,
        payload.source || null,
        payload.experienceYears,
        payload.currentCtc,
        payload.expectedCtc,
        payload.noticePeriodDays,
        payload.applicationDate,
        payload.interviewDate,
        payload.stage,
        payload.status,
        payload.recruiterName || null,
        payload.remarks || null,
        req.user?.id || null,
      ],
    );

    await client.query('COMMIT');

    return res.status(201).json({
      status: 'OK',
      message: 'Recruitment candidate created successfully',
      data: mapRecruitmentRow(result.rows[0]),
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Create recruitment candidate error:', error);
    return res.status(500).json({
      status: 'ERROR',
      message: 'Error creating recruitment candidate',
      error: error.message,
    });
  } finally {
    client.release();
  }
}

async function updateRecruitmentCandidate(req, res) {
  try {
    const { candidateCode } = req.params;
    const payload = normalizeRecruitmentPayload(req.body || {});

    if (!hasRequiredFields(payload)) {
      return res.status(400).json({
        status: 'ERROR',
        message: 'Missing required recruitment fields',
      });
    }

    const result = await pool.query(
      `
        UPDATE recruitment_candidates
        SET
          candidate_name = $2,
          email = $3,
          phone = $4,
          department = $5,
          role_title = $6,
          source = $7,
          experience_years = $8,
          current_ctc = $9,
          expected_ctc = $10,
          notice_period_days = $11,
          application_date = $12::date,
          interview_date = $13::date,
          stage = $14,
          status = $15,
          recruiter_name = $16,
          remarks = $17,
          updated_by = $18,
          updated_at = CURRENT_TIMESTAMP
        WHERE candidate_code = $1
        RETURNING *
      `,
      [
        candidateCode,
        payload.candidateName,
        payload.email,
        payload.phone,
        payload.department,
        payload.roleTitle,
        payload.source || null,
        payload.experienceYears,
        payload.currentCtc,
        payload.expectedCtc,
        payload.noticePeriodDays,
        payload.applicationDate,
        payload.interviewDate,
        payload.stage,
        payload.status,
        payload.recruiterName || null,
        payload.remarks || null,
        req.user?.id || null,
      ],
    );

    if (!result.rows.length) {
      return res.status(404).json({
        status: 'ERROR',
        message: 'Recruitment candidate not found',
      });
    }

    return res.status(200).json({
      status: 'OK',
      message: 'Recruitment candidate updated successfully',
      data: mapRecruitmentRow(result.rows[0]),
    });
  } catch (error) {
    console.error('Update recruitment candidate error:', error);
    return res.status(500).json({
      status: 'ERROR',
      message: 'Error updating recruitment candidate',
      error: error.message,
    });
  }
}

async function deleteRecruitmentCandidate(req, res) {
  try {
    const { candidateCode } = req.params;

    const result = await pool.query(
      `
        DELETE FROM recruitment_candidates
        WHERE candidate_code = $1
        RETURNING id
      `,
      [candidateCode],
    );

    if (!result.rows.length) {
      return res.status(404).json({
        status: 'ERROR',
        message: 'Recruitment candidate not found',
      });
    }

    return res.status(200).json({
      status: 'OK',
      message: 'Recruitment candidate deleted successfully',
    });
  } catch (error) {
    console.error('Delete recruitment candidate error:', error);
    return res.status(500).json({
      status: 'ERROR',
      message: 'Error deleting recruitment candidate',
      error: error.message,
    });
  }
}

module.exports = {
  fetchRecruitmentCandidates,
  fetchNextCandidateCode,
  createRecruitmentCandidate,
  updateRecruitmentCandidate,
  deleteRecruitmentCandidate,
};
