export function normalizePhone(phone) {
  let d = String(phone || '').replace(/\D/g, '');
  if (!d) return '';
  if (d.startsWith('00')) d = d.slice(2);
  if (d.startsWith('0')) d = '20' + d.slice(1);
  else if (d.length === 10 && /^1/.test(d)) d = '20' + d;
  else if (!d.startsWith('20') && d.length <= 11) d = '20' + d;
  return d;
}

export function buildWhatsAppLink(phone, text = '') {
  const n = normalizePhone(phone);
  if (!n) return null;
  const q = text ? `?text=${encodeURIComponent(text)}` : '';
  return `https://wa.me/${n}${q}`;
}

export function openWhatsApp(link) {
  if (!link) return false;
  window.open(link, '_blank', 'noopener,noreferrer');
  return true;
}

export function formatCaseUpdateMessage(c, update) {
  return [
    `مرحباً ${c.client?.name || ''}،`,
    `تحديث على قضيتك ${c.caseNumber}:`,
    update?.title || 'تحديث جديد',
    update?.notes || '',
    c.nextSessionDate
      ? `الجلسة القادمة: ${new Date(c.nextSessionDate).toLocaleDateString('ar-EG')}`
      : null,
    '',
    'مع تحيات مكتب المحاماة',
  ].filter(Boolean).join('\n');
}

export function clientSummaryText(c) {
  return [
    `العميل: ${c.client?.name || '—'}`,
    `الهاتف: ${c.client?.phone || '—'}`,
    `البريد: ${c.client?.email || '—'}`,
    `رقم القضية: ${c.caseNumber}`,
    `كود التتبع: ${c.trackingCode}`,
    `اسم المستخدم: ${c.client?.username || '—'}`,
  ].join('\n');
}

export function formatNewCaseMessage({ clientName, credentials, trackUrl }) {
  const { username, password, caseNumber, trackingCode } = credentials;
  const lines = [
    `مرحباً ${clientName}،`,
    'تم فتح قضيتك لدينا. بيانات الدخول والمتابعة:',
    '',
    `رقم القضية: ${caseNumber}`,
    `كود التتبع: ${trackingCode}`,
    `اسم المستخدم: ${username}`,
    `كلمة المرور: ${password}`,
  ];
  if (trackUrl) {
    lines.push('', `متابعة القضية: ${trackUrl}`);
  }
  lines.push('', 'مع تحيات مكتب المحاماة');
  return lines.join('\n');
}

export function formatReplyPreview(c, reply) {
  const dateStr = reply.appointmentDate
    ? new Date(reply.appointmentDate).toLocaleDateString('ar-EG')
    : '—';
  return [
    `مرحباً ${c.fullName}،`,
    reply.message || 'تم تحديد موعد استشارتك القانونية.',
    '',
    `التاريخ: ${dateStr}`,
    `الوقت: ${reply.appointmentTime || '—'}`,
    reply.fees ? `الرسوم: ${reply.fees} جنيه` : null,
    '',
    'مع تحيات مكتب المحاماة',
  ].filter((x) => x !== null).join('\n');
}
