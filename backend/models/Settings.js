const mongoose = require('mongoose');
const settingsSchema = new mongoose.Schema({
  officeName: { type: String, default: 'مكتب المحاماة' },
  logoUrl:    { type: String, default: '' },
  about:      { type: String, default: '' },
  phone:      { type: String, default: '' },
  email:      { type: String, default: '' },
  address:    { type: String, default: '' },
  social: {
    facebook:  { type: String, default: '' },
    instagram: { type: String, default: '' },
    twitter:   { type: String, default: '' },
    whatsapp:  { type: String, default: '' },
  },
  mapEmbed:     { type: String, default: '' },
  officeHours:  { type: String, default: 'الأحد – الخميس: 10 ص – 6 م' },
}, { timestamps: true });
module.exports = mongoose.model('Settings', settingsSchema);
