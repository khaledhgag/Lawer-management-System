const Admin = require('../models/Admin');
const Client = require('../models/Client');
const bcrypt = require('bcryptjs');
const { sign } = require('../middlewares/auth');

exports.adminLogin = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ message: 'البيانات ناقصة' });
    const admin = await Admin.findOne({ username });
    if (!admin) return res.status(401).json({ message: 'بيانات غير صحيحة' });
    const ok = await admin.compare(password);
    if (!ok) return res.status(401).json({ message: 'بيانات غير صحيحة' });
    const token = sign({ id: admin._id, role: 'admin', username: admin.username });
    res.json({ token, admin: { id: admin._id, username: admin.username, name: admin.name } });
  } catch (e) { next(e); }
};

exports.clientLogin = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const client = await Client.findOne({ username });
    if (!client) return res.status(401).json({ message: 'بيانات غير صحيحة' });
    const ok = await client.compare(password);
    if (!ok) return res.status(401).json({ message: 'بيانات غير صحيحة' });
    const token = sign({ id: client._id, role: 'client', username: client.username });
    res.json({ token, client: { id: client._id, name: client.name, username: client.username } });
  } catch (e) { next(e); }
};

exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: 'كلمة المرور الجديدة 6 أحرف على الأقل' });
    }
    const client = await Client.findById(req.user.id);
    if (!client) return res.status(404).json({ message: 'غير موجود' });
    const ok = await client.compare(currentPassword);
    if (!ok) return res.status(401).json({ message: 'كلمة المرور الحالية غير صحيحة' });
    client.password = await bcrypt.hash(newPassword, 10);
    await client.save();
    res.json({ message: 'تم تغيير كلمة المرور' });
  } catch (e) { next(e); }
};
