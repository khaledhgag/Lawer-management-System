const r = require('express').Router();
const { authRequired } = require('../middlewares/auth');
const c = require('../controllers/notificationController');
r.put('/:id/read', authRequired(['client']), c.markRead);
module.exports = r;
