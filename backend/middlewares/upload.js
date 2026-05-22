const multer = require('multer');
const path = require('path');
const fs = require('fs');

const dir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, dir),
  filename: (_, file, cb) => {
    const safe = Date.now() + '-' + Math.round(Math.random()*1e9) + path.extname(file.originalname);
    cb(null, safe);
  }
});

module.exports = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
});
