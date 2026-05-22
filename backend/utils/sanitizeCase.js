/** إخفاء حقول الأدمن عن العميل */
function sanitizeCase(doc) {
  if (!doc) return doc;
  const o = doc.toObject ? doc.toObject() : { ...doc };
  delete o.internalNotes;
  return o;
}

module.exports = { sanitizeCase };
