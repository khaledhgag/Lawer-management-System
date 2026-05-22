const r = require('express').Router();
const { authRequired } = require('../middlewares/auth');
const c = require('../controllers/authController');
r.post('/admin/login', c.adminLogin);
r.post('/client/login', c.clientLogin);
r.post('/client/change-password', authRequired(['client']), c.changePassword);
module.exports = r;
