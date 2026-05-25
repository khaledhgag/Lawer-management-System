const Case = require('../models/Case');
const Client = require('../models/Client');
const Notification = require('../models/Notification');
const bcrypt = require('bcryptjs');
const { generateCredentials } = require('../utils/generate');
const { buildCasePdf } = require('../utils/pdfCase');
const { sendEmail } = require('../services/emailService');
const telegram = require('../services/telegramService');

exports.searchClients = async (req, res, next) => {
  try {
    const q = req.query.q || '';
    if (!q) return res.json([]);
    const clients = await Client.find({
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { phone: { $regex: q, $options: 'i' } },
      ],
    }).select('_id name phone email username').limit(10);
    res.json(clients);
  } catch (e) { next(e); }
};

exports.list = async (req, res, next) => {
  try {
    const q = req.query.q;
    const archived = req.query.archived === 'true';
    const filter = archived ? { archived: true } : { archived: { $ne: true } };
    let clientIds = [];
    if (q) {
      const clients = await Client.find({
        $or: [
          { name: { $regex: q, $options: 'i' } },
          { phone: { $regex: q, $options: 'i' } },
          { username: { $regex: q, $options: 'i' } },
        ],
      }).select('_id');
      clientIds = clients.map((c) => c._id);
      filter.$or = [
        { caseNumber: { $regex: q, $options: 'i' } },
        { client: { $in: clientIds } },
      ];
    }
    const list = await Case.find(filter).populate('client', 'name phone username').sort('-createdAt');
    res.json(list);
  } catch (e) { next(e); }
};

exports.get = async (req, res, next) => {
  try {
    const c = await Case.findById(req.params.id).populate('client');
    if (!c) return res.status(404).json({ message: 'غير موجود' });
    res.json(c);
  } catch (e) { next(e); }
};

async function sendOfficeAlert(message) {
  if (process.env.TELEGRAM_AUTO_NOTIFY_OFFICE !== 'true') {
    console.log('[CASE-EVENT] ⚠️  Telegram notifications disabled');
    return null;
  }
  console.log('[CASE-EVENT] 📤 Sending telegram alert...');
  const result = await telegram.sendMessage(message);
  if (result.sent) console.log('[CASE-EVENT] ✅ Alert sent');
  else console.log('[CASE-EVENT] ❌ Failed:', result.error);
  return result;
}

exports.create = async (req, res, next) => {
  try {
    const { clientId, clientName, phone, email, caseType, court, nextSessionDate, currentStatus, notes, caseNumber: requestedCaseNumber } = req.body;
    const { trackingCode, caseNumber: generatedCaseNumber } = generateCredentials(clientName || 'client');
    const caseNumber = requestedCaseNumber?.trim() || generatedCaseNumber;

    let client;
    let credentials;

    if (clientId) {
      // attach to existing client — no new login credentials
      client = await Client.findById(clientId);
      if (!client) return res.status(404).json({ message: 'العميل غير موجود' });
      credentials = { username: client.username, trackingCode, caseNumber, existingClient: true };
    } else {
      // new client — generate full credentials
      const { username, password } = generateCredentials(clientName);
      const hashed = await bcrypt.hash(password, 10);
      client = await Client.create({ name: clientName, phone, email, username, password: hashed });
      credentials = { username, password, trackingCode, caseNumber };
    }

    const c = await Case.create({
      client: client._id,
      caseNumber,
      trackingCode,
      caseType,
      court,
      nextSessionDate,
      currentStatus: currentStatus || 'قيد المراجعة',
      lawyerNotes: notes,
      updates: [{ title: 'تم فتح القضية', notes: 'تم تسجيل القضية في النظام' }],
    });

    const createDetails = c.nextSessionDate
      ? `الجلـسة بتاريخ ${new Date(c.nextSessionDate).toLocaleDateString('ar-EG')} ${new Date(c.nextSessionDate).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}`
      : 'لم يتم تحديد موعد جلسة بعد';
    const msg = telegram.formatSystemAlertMessage(`قضية جديدة: ${caseNumber}`, createDetails);
    console.log('[CASE-EVENT] 📊 New case created:', caseNumber);
    await sendOfficeAlert(msg);

    res.status(201).json({ case: c, credentials });
  } catch (e) { next(e); }
};

exports.update = async (req, res, next) => {
  try {
    const allowed = ['currentStatus', 'nextSessionDate', 'lawyerNotes', 'internalNotes', 'court', 'caseType', 'archived'];
    const patch = {};
    allowed.forEach((k) => { if (req.body[k] !== undefined) patch[k] = req.body[k]; });

    const c = await Case.findById(req.params.id).populate('client', 'name phone');
    if (!c) return res.status(404).json({ message: 'غير موجود' });

    const oldSession = c.nextSessionDate ? c.nextSessionDate.toISOString() : '';
    const newSession = patch.nextSessionDate ? new Date(patch.nextSessionDate).toISOString() : '';
    const sessionChanged = patch.nextSessionDate && oldSession !== newSession;

    Object.assign(c, patch);
    if (sessionChanged) {
      c.nextSessionReminderSentAt = undefined;
    }
    await c.save();

    const changes = [];
    if (sessionChanged) {
      changes.push(`تم تحديث تاريخ الجلسة إلى ${new Date(c.nextSessionDate).toLocaleDateString('ar-EG')} ${new Date(c.nextSessionDate).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}`);
    }
    if (patch.currentStatus) changes.push(`الحالة: ${patch.currentStatus}`);
    if (patch.court) changes.push(`المحكمة: ${patch.court}`);
    if (patch.caseType) changes.push(`نوع القضية: ${patch.caseType}`);
    if (patch.lawyerNotes) changes.push(`ملاحظات المحامي: ${patch.lawyerNotes}`);
    if (patch.internalNotes) changes.push(`ملاحظات داخلية جديدة`);

    if (changes.length) {
      console.log('[CASE-EVENT] 😄 Case updated:', c.caseNumber, 'Changes:', changes);
      const msg = telegram.formatSystemAlertMessage(`تحديث على القضية ${c.caseNumber}`, changes.join('\n'));
      await sendOfficeAlert(msg);
    }

    res.json(c);
  } catch (e) { next(e); }
};

exports.archive = async (req, res, next) => {
  try {
    const c = await Case.findByIdAndUpdate(req.params.id, { archived: true }, { new: true });
    res.json(c);
  } catch (e) { next(e); }
};

exports.addUpdate = async (req, res, next) => {
  try {
    const { title, notes, date } = req.body;
    const c = await Case.findById(req.params.id).populate('client', 'name email');
    if (!c) return res.status(404).json({ message: 'غير موجود' });
    c.updates.push({ title, notes, date: date || new Date() });
    await c.save();

    const msg = `تحديث جديد على قضيتك: ${title}`;
    await Notification.create({ client: c.client._id, case: c._id, message: msg });
    console.log('[CASE-EVENT] 📌 Case update added:', c.caseNumber, title);
    await sendOfficeAlert(telegram.formatSystemAlertMessage(`تحديث على القضية ${c.caseNumber}`, `${msg}${notes ? `\n\n${notes}` : ''}`));

    if (c.client?.email) {
      await sendEmail({
        to: c.client.email,
        subject: 'تحديث على قضيتك',
        html: `<div dir="rtl"><p>${msg}</p>${notes ? `<p>${notes}</p>` : ''}</div>`,
      }).catch(() => {});
    }

    res.json(c);
  } catch (e) { next(e); }
};

exports.addFile = async (req, res, next) => {
  try {
    const c = await Case.findById(req.params.id);
    if (!c) return res.status(404).json({ message: 'غير موجود' });
    if (!req.file) return res.status(400).json({ message: 'لا يوجد ملف' });
    c.files.push({
      name: req.file.originalname,
      url: req.file.path,
      type: req.file.mimetype,
      size: req.file.size,
    });
    await c.save();
    const fileMsg = 'تم إضافة ملف جديد إلى قضيتك';
    await Notification.create({
      client: c.client,
      case: c._id,
      message: fileMsg,
    });
    console.log('[CASE-EVENT] 📄 File added to case:', c.caseNumber, req.file.originalname);
    await sendOfficeAlert(telegram.formatSystemAlertMessage(`ملف جديد على القضية ${c.caseNumber}`, fileMsg));
    res.json(c);
  } catch (e) { next(e); }
};

exports.exportPdf = async (req, res, next) => {
  try {
    const c = await Case.findById(req.params.id).populate('client', 'name phone email');
    if (!c) return res.status(404).json({ message: 'غير موجود' });
    buildCasePdf(c, res);
  } catch (e) { next(e); }
};

exports.deleteFile = async (req, res, next) => {
  try {
    const { id, fileId } = req.params;
    const c = await Case.findById(id);
    if (!c) return res.status(404).json({ message: 'غير موجود' });
    
    const file = c.files.id(fileId);
    if (!file) return res.status(404).json({ message: 'الملف غير موجود' });

    const fileName = file.name;
    
    // Delete from Cloudinary if it's a Cloudinary URL
    if (file.url && file.url.includes('res.cloudinary.com')) {
      try {
        const cloudinary = require('../config/cloudinary');
        // Extract public_id from Cloudinary URL
        // URL format: https://res.cloudinary.com/[cloud]/image/upload/v[version]/[folder]/[public_id].[ext]
        const urlParts = file.url.split('/');
        const publicId = urlParts[urlParts.length - 1].split('.')[0];
        const folder = urlParts[urlParts.length - 2];
        const fullPublicId = `${folder}/${publicId}`;
        
        await cloudinary.uploader.destroy(fullPublicId);
        console.log('[CASE-EVENT] 🗑️  Deleted from Cloudinary:', fullPublicId);
      } catch (cloudErr) {
        console.warn('[CASE-EVENT] ⚠️  Failed to delete from Cloudinary:', cloudErr.message);
        // Continue anyway - file record will be deleted from DB
      }
    }

    c.files.id(fileId).deleteOne();
    await c.save();

    console.log('[CASE-EVENT] 📄 File deleted from case:', c.caseNumber, fileName);
    await sendOfficeAlert(telegram.formatSystemAlertMessage(`تم حذف ملف من القضية ${c.caseNumber}`, fileName));
    
    res.json(c);
  } catch (e) { next(e); }
};

exports.remove = async (req, res, next) => {
  try {
    await Case.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (e) { next(e); }
};

exports.stats = async (_, res, next) => {
  try {
    const Consultation = require('../models/Consultation');
    const now = new Date();
    const weekEnd = new Date(now);
    weekEnd.setDate(weekEnd.getDate() + 7);

    const active = { archived: { $ne: true } };
    const [totalCases, pendingConsult, upcoming, weekSessions, recent] = await Promise.all([
      Case.countDocuments(active),
      Consultation.countDocuments({ status: 'pending' }),
      Case.countDocuments({ ...active, nextSessionDate: { $gte: now } }),
      Case.find({
        ...active,
        nextSessionDate: { $gte: now, $lte: weekEnd },
      })
        .populate('client', 'name phone')
        .sort('nextSessionDate')
        .limit(10),
      Case.find(active).populate('client', 'name').sort('-updatedAt').limit(5),
    ]);

    res.json({ totalCases, pendingConsult, upcoming, weekSessions, recent });
  } catch (e) { next(e); }
};
