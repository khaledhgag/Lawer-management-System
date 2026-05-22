// بنية جاهزة لإرسال الإيميل - فعّل عبر متغيرات SMTP في .env
const nodemailer = require('nodemailer');

let transporter = null;
function getTransporter() {
  if (!process.env.SMTP_HOST) return null;
  if (transporter) return transporter;
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: false,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
  });
  return transporter;
}

async function sendEmail({ to, subject, html, text }) {
  const t = getTransporter();
  if (!t) { console.log('[email skipped]', { to, subject }); return { skipped: true }; }
  return t.sendMail({ from: process.env.MAIL_FROM, to, subject, html, text });
}

module.exports = { sendEmail };
