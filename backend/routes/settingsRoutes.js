const r = require('express').Router();
const { authRequired } = require('../middlewares/auth');
const upload = require('../middlewares/upload');
const c = require('../controllers/settingsController');
r.get('/', c.get);
r.put('/', authRequired(['admin']), upload.single('logo'), c.update);
module.exports = r;
