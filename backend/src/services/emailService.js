/* eslint-env node */
/* eslint-disable no-undef */
const nodemailer = require('nodemailer');

function getMailTransport() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass,
    },
  });
}

async function sendApprovalMail({ toEmail, requesterName, modules, amount, cancelUrl, paymentUrl }) {
  const transporter = getMailTransport();

  if (!transporter) {
    return { sent: false, reason: 'SMTP not configured' };
  }

  const moduleListItems = (Array.isArray(modules) ? modules : [])
    .map((moduleName) => `<li>${moduleName}</li>`)
    .join('');

  await transporter.sendMail({
    from: process.env.MAIL_FROM || process.env.SMTP_USER,
    to: toEmail,
    subject: 'Your ERP access request is approved',
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#1f2937;max-width:680px;margin:0 auto;">
        <h2 style="margin-bottom:8px;">Hello ${requesterName || 'there'},</h2>
        <p>Your ERP workspace request has been approved.</p>
        <p><strong>Thank you for using us.</strong></p>
        <p>Requested modules:</p>
        <ul>${moduleListItems || '<li>No modules listed</li>'}</ul>
        <p><strong>Total amount:</strong> ₹${Number(amount || 0).toLocaleString('en-IN')}</p>
        <div style="margin-top:20px;display:flex;gap:12px;flex-wrap:wrap;">
          <a href="${cancelUrl}" style="background:#dc2626;color:#fff;text-decoration:none;padding:10px 14px;border-radius:8px;">Cancel Request</a>
          <a href="${paymentUrl}" style="background:#2563eb;color:#fff;text-decoration:none;padding:10px 14px;border-radius:8px;">Proceed to Payment</a>
        </div>
      </div>
    `,
  });

  return { sent: true };
}

async function sendCredentialsMail({
  toEmail,
  requesterName,
  loginEmail,
  generatedPassword,
  modules,
  loginUrl,
}) {
  const transporter = getMailTransport();

  if (!transporter) {
    return { sent: false, reason: 'SMTP not configured' };
  }

  const moduleListItems = (Array.isArray(modules) ? modules : [])
    .map((moduleName) => `<li>${moduleName}</li>`)
    .join('');

  await transporter.sendMail({
    from: process.env.MAIL_FROM || process.env.SMTP_USER,
    to: toEmail,
    subject: 'Your ERP login credentials',
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#1f2937;max-width:680px;margin:0 auto;">
        <h2 style="margin-bottom:8px;">Hello ${requesterName || 'there'},</h2>
        <p>Your payment is confirmed and your ERP login is now ready.</p>
        <p><strong>Login Email:</strong> ${loginEmail}</p>
        <p><strong>Temporary Password:</strong> ${generatedPassword}</p>
        <p>Enabled modules for your account:</p>
        <ul>${moduleListItems || '<li>No modules listed</li>'}</ul>
        <p style="margin-top:16px;">Please sign in and change your password after first login.</p>
        <div style="margin-top:20px;">
          <a href="${loginUrl}" style="background:#2563eb;color:#fff;text-decoration:none;padding:10px 14px;border-radius:8px;display:inline-block;">Login to ERP</a>
        </div>
      </div>
    `,
  });

  return { sent: true };
}

async function sendPasswordResetMail({ toEmail, requesterName, resetUrl }) {
  const transporter = getMailTransport();

  if (!transporter) {
    return { sent: false, reason: 'SMTP not configured' };
  }

  await transporter.sendMail({
    from: process.env.MAIL_FROM || process.env.SMTP_USER,
    to: toEmail,
    subject: 'Reset your ERP password',
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#1f2937;max-width:680px;margin:0 auto;">
        <h2 style="margin-bottom:8px;">Hello ${requesterName || 'there'},</h2>
        <p>We received a request to reset your ERP account password.</p>
        <p>Click the button below to set a new password:</p>
        <div style="margin:18px 0;">
          <a href="${resetUrl}" style="background:#2563eb;color:#fff;text-decoration:none;padding:10px 14px;border-radius:8px;display:inline-block;">Reset Password</a>
        </div>
        <p>This link expires in 30 minutes.</p>
        <p>If you did not request this, you can safely ignore this email.</p>
      </div>
    `,
  });

  return { sent: true };
}

module.exports = {
  sendApprovalMail,
  sendCredentialsMail,
  sendPasswordResetMail,
};
