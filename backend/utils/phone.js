/** تحويل أرقام مصر (01xxxxxxxxx) إلى صيغة دولية لـ wa.me و WhatsApp API */
function normalizePhone(phone) {
  let d = String(phone || '').replace(/\D/g, '');
  if (!d) return '';
  if (d.startsWith('00')) d = d.slice(2);
  if (d.startsWith('0')) d = '20' + d.slice(1);
  else if (d.length === 10 && /^1/.test(d)) d = '20' + d;
  else if (d.length === 11 && d.startsWith('20')) { /* ok */ }
  else if (!d.startsWith('20') && d.length <= 11) d = '20' + d;
  return d;
}

module.exports = { normalizePhone };
