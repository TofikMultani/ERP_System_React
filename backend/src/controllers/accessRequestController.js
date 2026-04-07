/* eslint-disable no-undef */
/* eslint-env node */
const pool = require('../config/database');

const VALID_STATUSES = new Set(['pending', 'approved', 'rejected']);

function mapRequestRow(row) {
  return {
    id: row.id,
    requesterName: row.requester_name,
    requesterEmail: row.requester_email,
    requesterPhone: row.requester_phone || '',
    companyName: row.company_name,
    modules: row.modules || [],
    status: row.status,
    submittedAt: row.submitted_at,
    reviewedAt: row.reviewed_at,
    reviewedBy: row.reviewed_by || '',
    reviewNote: row.review_note || '',
    pricingBreakdown: row.pricing_breakdown || [],
    totalEstimatedCost: Number(row.total_estimated_cost) || 0,
    inactiveRequestedModules: row.inactive_requested_modules || [],
  };
}

async function buildPricing(modules) {
  const uniqueModules = [...new Set((Array.isArray(modules) ? modules : []).filter(Boolean))];

  if (!uniqueModules.length) {
    return {
      pricingBreakdown: [],
      totalEstimatedCost: 0,
      inactiveRequestedModules: [],
    };
  }

  const result = await pool.query(
    `
      SELECT label, is_active, price
      FROM module_catalog
      WHERE label = ANY($1)
    `,
    [uniqueModules],
  );

  const moduleMap = new Map(result.rows.map((row) => [row.label, row]));

  const pricingBreakdown = uniqueModules.map((moduleName) => {
    const moduleRow = moduleMap.get(moduleName);

    if (!moduleRow) {
      return {
        moduleName,
        price: 0,
        isActive: false,
      };
    }

    return {
      moduleName,
      price: Number(moduleRow.price) || 0,
      isActive: moduleRow.is_active,
    };
  });

  const totalEstimatedCost = pricingBreakdown
    .filter((item) => item.isActive)
    .reduce((sum, item) => sum + item.price, 0);

  const inactiveRequestedModules = pricingBreakdown
    .filter((item) => !item.isActive)
    .map((item) => item.moduleName);

  return {
    pricingBreakdown,
    totalEstimatedCost,
    inactiveRequestedModules,
  };
}

const createAccessRequest = async (req, res) => {
  try {
    const { requesterName, requesterEmail, requesterPhone, companyName, modules } = req.body;

    if (
      !requesterName ||
      !requesterEmail ||
      !requesterPhone ||
      !companyName ||
      !Array.isArray(modules) ||
      !modules.length
    ) {
      return res.status(400).json({
        status: 'ERROR',
        message: 'requesterName, requesterEmail, requesterPhone, companyName and modules are required',
      });
    }

    const uniqueModules = [...new Set(modules.filter(Boolean))];

    const result = await pool.query(
      `
        INSERT INTO access_requests (
          requester_name,
          requester_email,
          requester_phone,
          company_name,
          modules,
          status
        )
        VALUES ($1, $2, $3, $4, $5::jsonb, 'pending')
        RETURNING *
      `,
      [requesterName, requesterEmail, requesterPhone, companyName, JSON.stringify(uniqueModules)],
    );

    res.status(201).json({
      status: 'OK',
      message: 'Access request submitted successfully',
      data: mapRequestRow(result.rows[0]),
    });
  } catch (error) {
    console.error('Create access request error:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Error creating access request',
      error: error.message,
    });
  }
};

const getAccessRequests = async (req, res) => {
  try {
    const result = await pool.query(
      `
        SELECT *
        FROM access_requests
        ORDER BY submitted_at DESC
      `,
    );

    res.status(200).json({
      status: 'OK',
      data: result.rows.map(mapRequestRow),
    });
  } catch (error) {
    console.error('Get access requests error:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Error fetching access requests',
      error: error.message,
    });
  }
};

const updateAccessRequestStatus = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { status, reviewNote } = req.body;

    if (!VALID_STATUSES.has(status) || status === 'pending') {
      return res.status(400).json({
        status: 'ERROR',
        message: 'Status must be approved or rejected',
      });
    }

    const requestResult = await pool.query(
      'SELECT id, modules, status FROM access_requests WHERE id = $1',
      [requestId],
    );

    if (!requestResult.rows.length) {
      return res.status(404).json({
        status: 'ERROR',
        message: 'Access request not found',
      });
    }

    const requestRow = requestResult.rows[0];

    if (requestRow.status !== 'pending') {
      return res.status(409).json({
        status: 'ERROR',
        message: 'This request has already been reviewed',
      });
    }

    const pricing = await buildPricing(requestRow.modules || []);

    if (status === 'approved' && pricing.inactiveRequestedModules.length > 0) {
      return res.status(400).json({
        status: 'ERROR',
        message: `Cannot approve request. Inactive modules: ${pricing.inactiveRequestedModules.join(', ')}`,
      });
    }

    const result = await pool.query(
      `
        UPDATE access_requests
        SET
          status = $2,
          reviewed_at = CURRENT_TIMESTAMP,
          reviewed_by = $3,
          review_note = $4,
          pricing_breakdown = $5::jsonb,
          total_estimated_cost = $6,
          inactive_requested_modules = $7::jsonb,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
        RETURNING *
      `,
      [
        requestId,
        status,
        req.user?.role === 'root-admin' ? 'Root Admin' : req.user?.email || 'Admin',
        reviewNote || (status === 'approved' ? `Approved. Estimated cost ₹${pricing.totalEstimatedCost}.` : 'Request rejected.'),
        JSON.stringify(pricing.pricingBreakdown),
        pricing.totalEstimatedCost,
        JSON.stringify(pricing.inactiveRequestedModules),
      ],
    );

    res.status(200).json({
      status: 'OK',
      message: 'Access request status updated',
      data: mapRequestRow(result.rows[0]),
    });
  } catch (error) {
    console.error('Update access request status error:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Error updating access request',
      error: error.message,
    });
  }
};

module.exports = {
  createAccessRequest,
  getAccessRequests,
  updateAccessRequestStatus,
};
