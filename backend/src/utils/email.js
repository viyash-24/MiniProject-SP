import nodemailer from 'nodemailer';
import { env } from '../config/env.js';

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;

  if (!env.EMAIL_USER || !env.EMAIL_PASS) {
    console.warn(' Email disabled: EMAIL_USER or EMAIL_PASS not configured.');
    return null;
  }

 const baseConfig = env.EMAIL_HOST
  ? {
      host: env.EMAIL_HOST,
      port: Number(env.EMAIL_PORT) || 587,
      secure:
        env.EMAIL_SECURE === true ||
        env.EMAIL_SECURE === 'true' ||
        env.EMAIL_SECURE === '1',
    }
  : {
      service: env.EMAIL_SERVICE || 'gmail',
    };

  transporter = nodemailer.createTransport({
    ...baseConfig,
    auth: {
      user: env.EMAIL_USER,
      pass: env.EMAIL_PASS,
    },
  });

  transporter
    .verify()
    .then(() => {
      console.log(' Email transporter configured successfully.');
    })
    .catch((err) => {
      console.error(' Email transporter verification failed:', err?.message || err);
    });

  return transporter;
}

export async function sendEmail({ to, subject, html }) {
  try {
    const activeTransporter = getTransporter();
    if (!activeTransporter) {
      console.warn(' Skipping email send: transporter not available.');
      return false;
    }

    await activeTransporter.sendMail({
      from: env.EMAIL_FROM || env.EMAIL_USER,
      to,
      subject,
      html,
    });

    return true;
  } catch (err) {
    console.error(' Error sending email:', err?.message || err);
    return false;
  }
}

function resolveLoginUrl(loginUrlFromCaller) {
  if (loginUrlFromCaller) return loginUrlFromCaller;
  if (env.LOGIN_URL) return env.LOGIN_URL;
  if (env.CORS_ORIGIN) {
    const base = env.CORS_ORIGIN.endsWith('/')
      ? env.CORS_ORIGIN.slice(0, -1)
      : env.CORS_ORIGIN;
    return `${base}/login`;
  }
  return 'http://localhost:3000/login';
}

export async function sendEnrollmentEmail({ to, name, tempPassword, loginUrl }) {
  const finalLoginUrl = resolveLoginUrl(loginUrl);
  const safeName = name || 'User';

  const passwordBlock = tempPassword
    ? `<p><b>Temporary password:</b> ${tempPassword}</p>
       <p>Please change this password after your first login.</p>`
    : '';

  const html = `
    <h3>Welcome to Smart Urban Parking System</h3>
    <p>Hi ${safeName},</p>
    <p>Your account has been created successfully.</p>
    <p><b>Username (email):</b> ${to}</p>
    ${passwordBlock}
    <p>You can log in using the link below:</p>
    <p>
      <a href="${finalLoginUrl}" style="padding:10px 16px;background:#2563eb;color:#ffffff;text-decoration:none;border-radius:4px;display:inline-block;">
        Log in to your account
      </a>
    </p>
    <p>If the button does not work, copy and paste this URL into your browser:</p>
    <p>${finalLoginUrl}</p>
  `;

  return sendEmail({
    to,
    subject: 'Your Smart Parking Account',
    html,
  });
}

export async function sendPaymentReceiptEmail({
  to,
  userName,
  amount,
  transactionId,
  paymentDate,
  vehiclePlate,
  vehicleType,
  slotNumber,
  parkingAreaName,
  method,
}) {
  const displayName = userName || 'Customer';
  const formattedAmount =
    typeof amount === 'number' ? `Rs ${amount.toFixed(2)}` : amount;
  const paidAt = paymentDate ? new Date(paymentDate) : new Date();
  const paidAtText = paidAt.toLocaleString();
  const slotDetails = slotNumber
    ? `Slot ${slotNumber}${parkingAreaName ? ` at ${parkingAreaName}` : ''}`
    : parkingAreaName || 'Not specified';

  const html = `
    <h3>Payment Receipt</h3>
    <p>Hi ${displayName},</p>
    <p>Thank you for your payment. Here are your receipt details:</p>
    <ul>
      <li><b>Amount:</b> ${formattedAmount}</li>
      <li><b>Date &amp; time:</b> ${paidAtText}</li>
      <li><b>Transaction ID:</b> ${transactionId || 'N/A'}</li>
      <li><b>Payment method:</b> ${method || 'N/A'}</li>
      <li><b>Vehicle:</b> ${vehiclePlate || 'N/A'} (${vehicleType || 'N/A'})</li>
      <li><b>Parking slot:</b> ${slotDetails}</li>
    </ul>
    <p>We appreciate you using the Smart Urban Parking System.</p>
  `;

  return sendEmail({
    to,
    subject: transactionId
      ? `Parking Payment Receipt - ${transactionId}`
      : 'Parking Payment Receipt',
    html,
  });
}
