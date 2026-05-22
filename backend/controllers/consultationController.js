const Consultation = require('../models/Consultation');
const Settings = require('../models/Settings');
const { sendEmail } = require('../services/emailService');
const wa = require('../services/whatsappService');
const { consultationRequestNumber } = require('../utils/generate');

async function getOfficePhone() {
  const s = await Settings.findOne().lean();
  return s?.social?.whatsapp || process.env.WHATSAPP_OFFICE_PHONE || '';
}

exports.create = async (req, res, next) => {
  try {
    const { fullName, phone, email, type, details } = req.body;
    if (!fullName || !phone || !type) return res.status(400).json({ message: 'البيانات ناقصة' });
    const c = await Consultation.create({
      fullName, phone, email, type, details,
      requestNumber: consultationRequestNumber(),
    });

    const officePhone = await getOfficePhone();
    const alertText = wa.formatNewConsultationMessage(c);
    let whatsappOffice = null;
    if (officePhone) {
      whatsappOffice = { link: wa.buildLink(officePhone, alertText) };
      if (process.env.WHATSAPP_AUTO_NOTIFY_OFFICE === 'true') {
        whatsappOffice.send = await wa.sendMessage(officePhone, alertText);
      }
    }

    res.status(201).json({ ...c.toObject(), whatsappOffice });
  } catch (e) { next(e); }
};

exports.list = async (req, res, next) => {
  try {
    const { status, q } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (q) filter.$or = [
      { fullName: { $regex: q, $options: 'i' } },
      { phone:    { $regex: q, $options: 'i' } },
    ];
    const list = await Consultation.find(filter).sort('-createdAt');
    res.json(list);
  } catch (e) { next(e); }
};

exports.updateStatus = async (req, res, next) => {
  try {
    const c = await Consultation.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
    res.json(c);
  } catch (e) { next(e); }
};

exports.whatsappLink = async (req, res, next) => {
  try {
    const c = await Consultation.findById(req.params.id);
    if (!c) return res.status(404).json({ message: 'غير موجود' });

    const { target = 'client' } = req.query;
    let phone = c.phone;
    let text = '';

    if (target === 'office') {
      phone = await getOfficePhone();
      text = wa.formatNewConsultationMessage(c);
    } else if (c.reply?.repliedAt) {
      text = wa.formatReplyMessage(c, c.reply);
    } else {
      text = [
        `مرحباً ${c.fullName}،`,
        'بخصوص طلب الاستشارة القانونية لدينا.',
        c.details ? `ملخص الطلب: ${c.details}` : null,
      ].filter(Boolean).join('\n');
    }

    if (!phone) return res.status(400).json({ message: 'لا يوجد رقم واتساب' });
    const link = wa.buildLink(phone, text);
    if (!link) return res.status(400).json({ message: 'رقم غير صالح' });
    res.json({ link, phone, message: text });
  } catch (e) { next(e); }
};

exports.reply = async (req, res, next) => {
  try {
    const { appointmentDate, appointmentTime, fees, message, sendWhatsApp } = req.body;
    const c = await Consultation.findByIdAndUpdate(req.params.id, {
      reply: { appointmentDate, appointmentTime, fees, message, repliedAt: new Date() },
      status: 'booked',
    }, { new: true });

    if (c?.email) {
      await sendEmail({
        to: c.email,
        subject: 'تم تحديد موعد الاستشارة',
        html: `<div dir="rtl"><h2>${message || 'تم تحديد موعد استشارتك'}</h2>
               <p>التاريخ: ${appointmentDate || '-'}</p>
               <p>الوقت: ${appointmentTime || '-'}</p>
               <p>الرسوم: ${fees || '-'} جنيه</p></div>`
      }).catch(() => {});
    }

    const replyPayload = { appointmentDate, appointmentTime, fees, message };
    const waText = wa.formatReplyMessage(c, replyPayload);
    const waLink = wa.buildLink(c.phone, waText);
    let whatsapp = { link: waLink, message: waText };

    const shouldSend = sendWhatsApp === true
      || sendWhatsApp === 'true'
      || process.env.WHATSAPP_AUTO_SEND_REPLY === 'true';

    if (shouldSend && c.phone) {
      whatsapp = { ...whatsapp, ...(await wa.sendMessage(c.phone, waText)) };
    }

    res.json({ ...c.toObject(), whatsapp });
  } catch (e) { next(e); }
};
