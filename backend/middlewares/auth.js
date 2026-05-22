const jwt = require('jsonwebtoken');

function sign(payload){
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES || '7d' });
}

function authRequired(roles = []) {
  return (req, res, next) => {
    try {
      const h = req.headers.authorization || '';
      const token = h.startsWith('Bearer ') ? h.slice(7) : null;
      if (!token) return res.status(401).json({ message: 'غير مصرح' });
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      if (roles.length && !roles.includes(decoded.role)) {
        return res.status(403).json({ message: 'صلاحيات غير كافية' });
      }
      next();
    } catch {
      return res.status(401).json({ message: 'رمز غير صالح' });
    }
  };
}

module.exports = { sign, authRequired };
