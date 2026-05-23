const Case = require('../models/Case');
const Client = require('../models/Client');
const Notification = require('../models/Notification');
const bcrypt = require('bcryptjs');
const { randomCode } = require('../utils/generate');
const { sanitizeCase } = require('../utils/sanitizeCase');
const { normalizePhone } = require('../utils/phone');

exports.trackByCode = async (req, res, next) => {
  try {
    const { caseNumber, trackingCode } = req.body;
    const c = await Case.findOne({ caseNumber, trackingCode, archived: { $ne: true } })
      .populate('client', 'name phone email');
    if (!c) return res.status(404).json({ message: 'القضية غير موجودة أو الكود غير صحيح' });
    res.json(sanitizeCase(c));
  } catch (e) { next(e); }
};

exports.myCases = async (req, res, next) => {
  try {
    const cases = await Case.find({ client: req.user.id, archived: { $ne: true } })
      .populate('client', 'name phone email');
    res.json(cases.map(sanitizeCase));
  } catch (e) { next(e); }
};

exports.myCaseById = async (req, res, next) => {
  try {
    const c = await Case.findOne({ _id: req.params.id, client: req.user.id, archived: { $ne: true } })
      .populate('client', 'name phone email');
    if (!c) return res.status(404).json({ message: 'القضية غير موجودة' });
    res.json(sanitizeCase(c));
  } catch (e) { next(e); }
};

exports.myNotifications = async (req, res, next) => {
  try {
    const list = await Notification.find({ client: req.user.id }).sort('-createdAt').limit(50);
    res.json(list);
  } catch (e) { next(e); }
};

exports.forgotPassword = async (req, res, next) => {
  try {
    const { phone, trackingCode } = req.body;
    if (!phone || !trackingCode) {
      return res.status(400).json({ message: 'الهاتف وكود التتبع مطلوبان' });
    }
    const c = await Case.findOne({ trackingCode, archived: { $ne: true } }).populate('client');
    const p1 = normalizePhone(c?.client?.phone);
    const p2 = normalizePhone(phone);
    if (!c || !p1 || p1 !== p2) {
      return res.status(404).json({ message: 'البيانات غير متطابقة' });
    }
    const newPassword = randomCode(10);
    c.client.password = await bcrypt.hash(newPassword, 10);
    await c.client.save();
    res.json({
      message: 'تم إنشاء كلمة مرور جديدة',
      username: c.client.username,
      password: newPassword,
      caseNumber: c.caseNumber,
    });
  } catch (e) { next(e); }
};
