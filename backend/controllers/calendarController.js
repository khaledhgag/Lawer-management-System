const Case = require('../models/Case');
const Consultation = require('../models/Consultation');

exports.events = async (req, res, next) => {
  try {
    const now = new Date();
    const start = req.query.start ? new Date(req.query.start) : new Date(now.getFullYear(), now.getMonth(), 1);
    const end = req.query.end ? new Date(req.query.end) : new Date(now.getFullYear(), now.getMonth() + 2, 0, 23, 59, 59);

    const [cases, consults] = await Promise.all([
      Case.find({
        archived: { $ne: true },
        nextSessionDate: { $gte: start, $lte: end },
      }).populate('client', 'name phone'),
      Consultation.find({
        status: { $in: ['booked', 'replied', 'completed'] },
        'reply.appointmentDate': { $gte: start, $lte: end },
      }),
    ]);

    const events = [];

    cases.forEach((c) => {
      events.push({
        id: `case-${c._id}`,
        type: 'session',
        title: `جلسة: ${c.client?.name || c.caseNumber}`,
        date: c.nextSessionDate,
        meta: { caseId: c._id, caseNumber: c.caseNumber, client: c.client?.name, phone: c.client?.phone },
      });
    });

    consults.forEach((c) => {
      events.push({
        id: `consult-${c._id}`,
        type: 'consultation',
        title: `استشارة: ${c.fullName}`,
        date: c.reply?.appointmentDate,
        meta: { consultationId: c._id, phone: c.phone, time: c.reply?.appointmentTime },
      });
    });

    events.sort((a, b) => new Date(a.date) - new Date(b.date));
    res.json(events);
  } catch (e) { next(e); }
};
