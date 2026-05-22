const mongoose = require('mongoose');
const notificationSchema = new mongoose.Schema({
  client:  { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
  case:    { type: mongoose.Schema.Types.ObjectId, ref: 'Case' },
  message: { type: String, required: true },
  read:    { type: Boolean, default: false },
}, { timestamps: true });
module.exports = mongoose.model('Notification', notificationSchema);
