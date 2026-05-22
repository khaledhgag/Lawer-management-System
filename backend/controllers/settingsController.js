const Settings = require('../models/Settings');

exports.get = async (_, res, next) => {
  try {
    let s = await Settings.findOne();
    if (!s) s = await Settings.create({});
    res.json(s);
  } catch (e) { next(e); }
};

exports.update = async (req, res, next) => {
  try {
    let s = await Settings.findOne();
    if (!s) s = await Settings.create({});
    const body = { ...req.body };
    if (typeof body.social === 'string') {
      try { body.social = JSON.parse(body.social); } catch { /* keep string; save will fail clearly */ }
    }
    Object.assign(s, body);
    if (req.file) s.logoUrl = `/uploads/${req.file.filename}`;
    await s.save();
    res.json(s);
  } catch (e) { next(e); }
};
