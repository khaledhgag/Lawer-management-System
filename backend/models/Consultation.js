const mongoose = require('mongoose');

const consultationSchema = new mongoose.Schema({
  requestNumber: { type: String, unique: true, sparse: true },
  fullName: { type: String, required: true },
  phone:    { type: String, required: true },
  email:    { type: String },
  type:     { type: String, enum: ['مدني','جنائي','أسرة','شركات','عقارات','أخرى'], required: true },
  details:  { type: String },
  status:   { type: String, enum: ['pending','replied','booked','completed'], default: 'pending' },
  reply: {
    appointmentDate: Date,
    appointmentTime: String,
    fees: Number,
    message: String,
    repliedAt: Date,
  }
}, { timestamps: true });

module.exports = mongoose.model('Consultation', consultationSchema);
