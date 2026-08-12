const mongoose = require('mongoose');

const courseRegistrationSchema = new mongoose.Schema({
  requestNumber:  { type: String, unique: true, sparse: true },
  fullName:       { type: String, required: true },
  university:     { type: String, required: true },
  academicYear:   { type: String, enum: ['الفرقة الأولى','الفرقة الثانية','الفرقة الثالثة','الفرقة الرابعة','خريج'], required: true },
  graduationYear: { type: String },
  address:        { type: String, required: true },
  phone:          { type: String, required: true },
  notes:          { type: String },
  status:         { type: String, enum: ['pending','contacted','confirmed','cancelled'], default: 'pending' },
}, { timestamps: true });

module.exports = mongoose.model('CourseRegistration', courseRegistrationSchema);
