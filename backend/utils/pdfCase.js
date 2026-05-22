const PDFDocument = require('pdfkit');

function buildCasePdf(caseDoc, res) {
  const c = caseDoc.toObject ? caseDoc.toObject() : caseDoc;
  const client = c.client || {};

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="case-${c.caseNumber}.pdf"`);

  const doc = new PDFDocument({ margin: 50 });
  doc.pipe(res);

  doc.fontSize(18).text('ملخص القضية', { align: 'right' });
  doc.moveDown(0.5);
  doc.fontSize(11);
  doc.text(`رقم القضية: ${c.caseNumber}`, { align: 'right' });
  doc.text(`كود التتبع: ${c.trackingCode}`, { align: 'right' });
  doc.text(`العميل: ${client.name || '—'}`, { align: 'right' });
  doc.text(`الهاتف: ${client.phone || '—'}`, { align: 'right' });
  doc.text(`النوع: ${c.caseType}`, { align: 'right' });
  doc.text(`المحكمة: ${c.court || '—'}`, { align: 'right' });
  doc.text(`الحالة: ${c.currentStatus}`, { align: 'right' });
  if (c.nextSessionDate) {
    doc.text(`الجلسة القادمة: ${new Date(c.nextSessionDate).toLocaleDateString('ar-EG')}`, { align: 'right' });
  }
  if (c.lawyerNotes) {
    doc.moveDown();
    doc.text('ملاحظات المحامي:', { align: 'right' });
    doc.text(c.lawyerNotes, { align: 'right' });
  }

  doc.moveDown();
  doc.fontSize(14).text('الجدول الزمني', { align: 'right' });
  doc.fontSize(10);
  (c.updates || []).forEach((u) => {
    doc.moveDown(0.3);
    doc.text(`${new Date(u.date).toLocaleDateString('ar-EG')} — ${u.title}`, { align: 'right' });
    if (u.notes) doc.text(u.notes, { align: 'right' });
  });

  doc.end();
}

module.exports = { buildCasePdf };
