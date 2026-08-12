const r = require('express').Router();
const { authRequired } = require('../middlewares/auth');
const c = require('../controllers/courseController');
r.post('/', c.create); // public
r.get('/', authRequired(['admin']), c.list);
r.put('/:id/status', authRequired(['admin']), c.updateStatus);
r.delete('/:id', authRequired(['admin']), c.remove);
module.exports = r;
