const r = require('express').Router();
const { authRequired } = require('../middlewares/auth');
const c = require('../controllers/consultationController');
r.post('/', c.create); // public
r.get('/', authRequired(['admin']), c.list);
r.get('/:id/whatsapp-link', authRequired(['admin']), c.whatsappLink);
r.put('/:id/status', authRequired(['admin']), c.updateStatus);
r.post('/:id/reply', authRequired(['admin']), c.reply);
module.exports = r;
