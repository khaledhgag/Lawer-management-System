const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'lawyer-files',
    resource_type: 'auto',
  },
});

module.exports = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
});
