const r = require('express').Router();
const { authRequired } = require('../middlewares/auth');
const upload = require('../middlewares/upload');
const c = require('../controllers/caseController');

r.use(authRequired(['admin']));
r.get('/stats', c.stats);
r.get('/clients/search', c.searchClients);
r.get('/', c.list);
r.post('/', c.create);
r.get('/:id/pdf', c.exportPdf);
r.get('/:id', c.get);
r.put('/:id/archive', c.archive);
r.put('/:id', c.update);
r.delete('/:id', c.remove);
r.post('/:id/updates', c.addUpdate);
r.post('/:id/files', upload.single('file'), c.addFile);
module.exports = r;
