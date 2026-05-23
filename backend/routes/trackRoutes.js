const r = require('express').Router();
const { authRequired } = require('../middlewares/auth');
const c = require('../controllers/trackController');
r.post('/code', c.trackByCode);
r.post('/forgot-password', c.forgotPassword);
r.get('/mine', authRequired(['client']), c.myCases);
r.get('/mine/:id', authRequired(['client']), c.myCaseById);
r.get('/notifications', authRequired(['client']), c.myNotifications);
module.exports = r;
