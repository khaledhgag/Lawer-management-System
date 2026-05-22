const r = require('express').Router();
const { authRequired } = require('../middlewares/auth');
const c = require('../controllers/calendarController');
r.get('/events', authRequired(['admin']), c.events);
module.exports = r;
