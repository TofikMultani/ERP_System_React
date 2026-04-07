/* eslint-disable no-undef */
/* eslint-env node */
const pool = require('../config/database');
const jwt = require('jsonwebtoken');
const { sendApprovalMail } = require('../services/emailService');
const {
  createRazorpayOrder,
  verifyRazorpaySignature,
} = require('../services/paymentService');

const VALID_STATUSES = new Set([
  'pending',
  'approved',
  'rejected',
  'cancelled',
  'payment_pending',
  'payment_done',
]);

const EMAIL_ACTIONS = {
  cancel: 'cancel',
  payment: 'payment',
};

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
    paymentOrderId: row.payment_order_id || '',
    paymentId: row.payment_id || '',
    paymentAmount: Number(row.payment_amount) || 0,
    paymentCompletedAt: row.payment_completed_at,
  };
}

function getFrontendBaseUrl() {
  return process.env.FRONTEND_APP_URL || process.env.CORS_ORIGIN || 'http://localhost:5173';
}

function createActionToken(requestId, action) {
  return jwt.sign(
    {
      requestId,
      action,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.REQUEST_ACTION_TOKEN_EXPIRE || '7d' },
  );
}

function verifyActionToken(token, expectedAction) {
  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  if (!decoded?.requestId || !decoded?.action) {
    throw new Error('Invalid action token');
  }

  if (expectedAction && decoded.action !== expectedAction) {
    throw new Error('Invalid action token');
  }

  return decoded;
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

    const targetStatus = status === 'approved' ? 'payment_pending' : 'rejected';

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
        targetStatus,
        req.user?.role === 'root-admin' ? 'Root Admin' : req.user?.email || 'Admin',
        reviewNote || (status === 'approved' ? `Approved. Estimated cost ₹${pricing.totalEstimatedCost}.` : 'Request rejected.'),
        JSON.stringify(pricing.pricingBreakdown),
        pricing.totalEstimatedCost,
        JSON.stringify(pricing.inactiveRequestedModules),
      ],
    );

    const updatedRequest = mapRequestRow(result.rows[0]);

    if (status === 'approved') {
      const frontendBaseUrl = getFrontendBaseUrl();
      const cancelToken = createActionToken(updatedRequest.id, EMAIL_ACTIONS.cancel);
      const paymentToken = createActionToken(updatedRequest.id, EMAIL_ACTIONS.payment);

      const cancelUrl = `${frontendBaseUrl}/request-action/cancel?token=${encodeURIComponent(cancelToken)}`;
      const paymentUrl = `${frontendBaseUrl}/request-action/payment?token=${encodeURIComponent(paymentToken)}`;

      await sendApprovalMail({
        toEmail: updatedRequest.requesterEmail,
        requesterName: updatedRequest.requesterName,
        modules: updatedRequest.modules,
        amount: updatedRequest.totalEstimatedCost,
        cancelUrl,
        paymentUrl,
      });
    }

    res.status(200).json({
      status: 'OK',
      message: 'Access request status updated',
      data: updatedRequest,
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

const getAccessRequestByActionToken = async (req, res) => {
  try {
    const { token } = req.params;
    const decoded = verifyActionToken(token);

    const result = await pool.query(
      `
        SELECT *
        FROM access_requests
        WHERE id = $1
      `,
      [decoded.requestId],
    );

    if (!result.rows.length) {
      return res.status(404).json({
        status: 'ERROR',
        message: 'Access request not found',
      });
    }

    return res.status(200).json({
      status: 'OK',
      data: mapRequestRow(result.rows[0]),
    });
  } catch (error) {
    return res.status(400).json({
      status: 'ERROR',
      message: 'Invalid or expired action token',
      error: error.message,
    });
  }
};

const cancelAccessRequestByActionToken = async (req, res) => {
  try {
    const { token } = req.params;
    const decoded = verifyActionToken(token, EMAIL_ACTIONS.cancel);

    const result = await pool.query(
      `
        UPDATE access_requests
        SET
          status = 'cancelled',
          review_note = 'Request cancelled by requester.',
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
          AND status = 'payment_pending'
        RETURNING *
      `,
      [decoded.requestId],
    );

    if (!result.rows.length) {
      return res.status(400).json({
        status: 'ERROR',
        message: 'Request cannot be cancelled now',
      });
    }

    return res.status(200).json({
      status: 'OK',
      message: 'Request cancelled successfully',
      data: mapRequestRow(result.rows[0]),
    });
  } catch (error) {
    return res.status(400).json({
      status: 'ERROR',
      message: 'Invalid or expired action token',
      error: error.message,
    });
  }
};

const createPaymentOrderByActionToken = async (req, res) => {
  try {
    const { token } = req.params;
    const decoded = verifyActionToken(token, EMAIL_ACTIONS.payment);

    const requestResult = await pool.query(
      'SELECT * FROM access_requests WHERE id = $1',
      [decoded.requestId],
    );

    if (!requestResult.rows.length) {
      return res.status(404).json({
        status: 'ERROR',
        message: 'Access request not found',
      });
    }

    const requestRow = requestResult.rows[0];

    if (requestRow.status !== 'payment_pending') {
      return res.status(400).json({
        status: 'ERROR',
        message: 'Payment cannot be initiated for this request',
      });
    }

    const amountInRupees = Number(requestRow.total_estimated_cost) || 0;
    const amountInPaise = Math.round(amountInRupees * 100);

    if (amountInPaise <= 0) {
      return res.status(400).json({
        status: 'ERROR',
        message: 'Invalid payment amount',
      });
    }

    const order = await createRazorpayOrder({
      amountInPaise,
      receipt: `request-${requestRow.id}-${Date.now()}`,
    });

    await pool.query(
      `
        UPDATE access_requests
        SET
          payment_order_id = $2,
          payment_amount = $3,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
      `,
      [requestRow.id, order.id, amountInRupees],
    );

    return res.status(200).json({
      status: 'OK',
      data: {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        keyId: process.env.RAZORPAY_KEY_ID,
        requesterName: requestRow.requester_name,
        requesterEmail: requestRow.requester_email,
        requesterPhone: requestRow.requester_phone || '',
      },
    });
  } catch (error) {
    return res.status(400).json({
      status: 'ERROR',
      message: error.message || 'Unable to create payment order',
    });
  }
};

const verifyPaymentByActionToken = async (req, res) => {
  try {
    const { token } = req.params;
    const decoded = verifyActionToken(token, EMAIL_ACTIONS.payment);
    const {
      razorpayPaymentId,
      razorpayOrderId,
      razorpaySignature,
    } = req.body;

    if (!razorpayPaymentId || !razorpayOrderId || !razorpaySignature) {
      return res.status(400).json({
        status: 'ERROR',
        message: 'Missing payment verification details',
      });
    }

    const requestResult = await pool.query(
      'SELECT * FROM access_requests WHERE id = $1',
      [decoded.requestId],
    );

    if (!requestResult.rows.length) {
      return res.status(404).json({
        status: 'ERROR',
        message: 'Access request not found',
      });
    }

    const requestRow = requestResult.rows[0];

    if (requestRow.status !== 'payment_pending') {
      return res.status(400).json({
        status: 'ERROR',
        message: 'Payment is not pending for this request',
      });
    }

    if (!requestRow.payment_order_id || requestRow.payment_order_id !== razorpayOrderId) {
      return res.status(400).json({
        status: 'ERROR',
        message: 'Payment order mismatch',
      });
    }

    const isValid = verifyRazorpaySignature({
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    });

    if (!isValid) {
      return res.status(400).json({
        status: 'ERROR',
        message: 'Invalid payment signature',
      });
    }

    const updateResult = await pool.query(
      `
        UPDATE access_requests
        SET
          status = 'payment_done',
          payment_id = $2,
          payment_signature = $3,
          payment_completed_at = CURRENT_TIMESTAMP,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
        RETURNING *
      `,
      [decoded.requestId, razorpayPaymentId, razorpaySignature],
    );

    return res.status(200).json({
      status: 'OK',
      message: 'Payment verified successfully',
      data: mapRequestRow(updateResult.rows[0]),
    });
  } catch (error) {
    return res.status(400).json({
      status: 'ERROR',
      message: error.message || 'Unable to verify payment',
    });
  }
};

module.exports = {
  createAccessRequest,
  getAccessRequests,
  updateAccessRequestStatus,
  getAccessRequestByActionToken,
  cancelAccessRequestByActionToken,
  createPaymentOrderByActionToken,
  verifyPaymentByActionToken,
};
