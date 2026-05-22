const { normalizePhone } = require('../utils/phone');

function buildLink(phone, text = '') {
  const n = normalizePhone(phone);
  if (!n) return null;
  const q = text ? `?text=${encodeURIComponent(text)}` : '';
  return `https://wa.me/${n}${q}`;
}

function formatNewConsultationMessage(c) {
  return [
    'طلب استشارة جديد',
    `الاسم: ${c.fullName}`,
    `الهاتف: ${c.phone}`,
    c.email ? `البريد: ${c.email}` : null,
    `النوع: ${c.type}`,
    c.details ? `التفاصيل: ${c.details}` : null,
  ].filter(Boolean).join('\n');
}

function formatReplyMessage(c, reply = {}) {
  const { appointmentDate, appointmentTime, fees, message } = reply;
  const dateStr = appointmentDate
    ? new Date(appointmentDate).toLocaleDateString('ar-EG')
    : '—';
  return [
    `مرحباً ${c.fullName}،`,
    message || 'تم تحديد موعد استشارتك القانونية.',
    '',
    `التاريخ: ${dateStr}`,
    `الوقت: ${appointmentTime || '—'}`,
    fees != null && fees !== '' ? `الرسوم: ${fees} جنيه` : null,
    '',
    'مع تحيات مكتب المحاماة',
  ].filter((x) => x !== null).join('\n');
}

function isCloudApiEnabled() {
  return Boolean(process.env.WHATSAPP_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID);
}

async function sendViaCloudApi(phone, text) {
  const to = normalizePhone(phone);
  if (!to) return { ok: false, error: 'رقم غير صالح' };
  if (!isCloudApiEnabled()) return { ok: false, skipped: true };

  const url = `https://graph.facebook.com/v21.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to,
      type: 'text',
      text: { body: text },
    }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    console.log('[whatsapp api error]', data);
    return { ok: false, error: data?.error?.message || res.statusText, link: buildLink(phone, text) };
  }
  return { ok: true, data };
}

async function sendMessage(phone, text) {
  const link = buildLink(phone, text);
  if (!isCloudApiEnabled()) {
    console.log('[whatsapp link only]', { phone: normalizePhone(phone) });
    return { sent: false, link, skipped: true };
  }
  const result = await sendViaCloudApi(phone, text);
  return {
    sent: result.ok,
    link,
    error: result.error,
    skipped: result.skipped,
  };
}

module.exports = {
  buildLink,
  formatNewConsultationMessage,
  formatReplyMessage,
  sendMessage,
  isCloudApiEnabled,
};
