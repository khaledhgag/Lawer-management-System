const r = require('express').Router();
const { authRequired } = require('../middlewares/auth');
const upload = require('../middlewares/upload');
r.post('/upload', authRequired(['admin']), upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'لا يوجد ملف' });
  res.json({ url: `/uploads/${req.file.filename}`, name: req.file.originalname });
});
module.exports = r;
