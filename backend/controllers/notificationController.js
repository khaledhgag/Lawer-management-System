const Notification = require('../models/Notification');
exports.markRead = async (req, res, next) => {
  try { await Notification.findByIdAndUpdate(req.params.id, { read: true }); res.json({ ok: true }); }
  catch (e) { next(e); }
};
