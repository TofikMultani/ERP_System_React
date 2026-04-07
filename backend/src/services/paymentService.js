/* eslint-env node */
/* eslint-disable no-undef */
const crypto = require('crypto');
const Razorpay = require('razorpay');

function getRazorpayClient() {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    return null;
  }

  return new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });
}

async function createRazorpayOrder({ amountInPaise, receipt }) {
  const client = getRazorpayClient();
  if (!client) {
    throw new Error('Razorpay is not configured');
  }

  return client.orders.create({
    amount: amountInPaise,
    currency: 'INR',
    receipt,
  });
}

function verifyRazorpaySignature({ razorpayOrderId, razorpayPaymentId, razorpaySignature }) {
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keySecret) {
    throw new Error('Razorpay is not configured');
  }

  const signaturePayload = `${razorpayOrderId}|${razorpayPaymentId}`;
  const generated = crypto
    .createHmac('sha256', keySecret)
    .update(signaturePayload)
    .digest('hex');

  return generated === razorpaySignature;
}

module.exports = {
  createRazorpayOrder,
  verifyRazorpaySignature,
};
