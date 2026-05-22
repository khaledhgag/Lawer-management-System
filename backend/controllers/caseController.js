const Case = require('../models/Case');
const Client = require('../models/Client');
const Notification = require('../models/Notification');
const bcrypt = require('bcryptjs');
const { generateCredentials } = require('../utils/generate');
const { buildCasePdf } = require('../utils/pdfCase');
const { sendEmail } = require('../services/emailService');

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

exports.create = async (req, res, next) => {
  try {
    const { clientName, phone, email, caseType, court, nextSessionDate, currentStatus, notes } = req.body;
    const { username, password, trackingCode, caseNumber } = generateCredentials(clientName);

    const hashed = await bcrypt.hash(password, 10);
    const client = await Client.create({ name: clientName, phone, email, username, password: hashed });

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

    res.status(201).json({
      case: c,
      credentials: { username, password, trackingCode, caseNumber },
    });
  } catch (e) { next(e); }
};

exports.update = async (req, res, next) => {
  try {
    const allowed = ['currentStatus', 'nextSessionDate', 'lawyerNotes', 'internalNotes', 'court', 'caseType', 'archived'];
    const patch = {};
    allowed.forEach((k) => { if (req.body[k] !== undefined) patch[k] = req.body[k]; });
    const c = await Case.findByIdAndUpdate(req.params.id, patch, { new: true }).populate('client');
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
      url: `/uploads/${req.file.filename}`,
      type: req.file.mimetype,
      size: req.file.size,
    });
    await c.save();
    await Notification.create({
      client: c.client,
      case: c._id,
      message: 'تم إضافة ملف جديد إلى قضيتك',
    });
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
