const CourseRegistration = require('../models/CourseRegistration');
const telegram = require('../services/telegramService');
const { courseRequestNumber } = require('../utils/generate');

exports.create = async (req, res, next) => {
  try {
    const { fullName, university, academicYear, graduationYear, address, phone, notes } = req.body;
    if (!fullName || !university || !academicYear || !address || !phone) {
      return res.status(400).json({ message: 'البيانات ناقصة' });
    }

    const r = await CourseRegistration.create({
      fullName, university, academicYear, address, phone, notes,
      graduationYear: academicYear === 'خريج' ? graduationYear : undefined,
      requestNumber: courseRequestNumber(),
    });

    if (process.env.TELEGRAM_AUTO_NOTIFY_OFFICE === 'true') {
      console.log('[COURSE-EVENT] 📚 New course registration:', r.fullName);
      const result = await telegram.sendMessage(telegram.formatNewCourseRegistrationMessage(r));
      if (result.sent) console.log('[COURSE-EVENT] ✅ Alert sent');
      else console.log('[COURSE-EVENT] ❌ Failed:', result.error);
    } else {
      console.log('[COURSE-EVENT] ⚠️  Telegram notifications disabled');
    }

    res.status(201).json(r);
  } catch (e) { next(e); }
};

exports.list = async (req, res, next) => {
  try {
    const { status, q } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (q) filter.$or = [
      { fullName:   { $regex: q, $options: 'i' } },
      { phone:      { $regex: q, $options: 'i' } },
      { university: { $regex: q, $options: 'i' } },
    ];
    const list = await CourseRegistration.find(filter).sort('-createdAt');
    res.json(list);
  } catch (e) { next(e); }
};

exports.updateStatus = async (req, res, next) => {
  try {
    const r = await CourseRegistration.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    if (!r) return res.status(404).json({ message: 'غير موجود' });
    res.json(r);
  } catch (e) { next(e); }
};

exports.remove = async (req, res, next) => {
  try {
    const r = await CourseRegistration.findByIdAndDelete(req.params.id);
    if (!r) return res.status(404).json({ message: 'غير موجود' });
    res.json({ ok: true });
  } catch (e) { next(e); }
};
