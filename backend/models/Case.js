const mongoose = require('mongoose');

const updateSchema = new mongoose.Schema({
  date:  { type: Date, default: Date.now },
  title: { type: String, required: true },  // مثال: "تم تقديم المستندات"
  notes: { type: String },
}, { _id: true });

const fileSchema = new mongoose.Schema({
  name: String,
  url:  String,
  type: String,
  size: Number,
  uploadedAt: { type: Date, default: Date.now }
}, { _id: true });

const caseSchema = new mongoose.Schema({
  client:        { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
  caseNumber:    { type: String, required: true, unique: true },
  trackingCode:  { type: String, required: true }, // كود تتبع للوصول بدون حساب
  caseType:      { type: String, required: true }, // مدني / جنائي ...
  court:         { type: String },
  currentStatus: { type: String, default: 'قيد المراجعة' },
  nextSessionDate:{ type: Date },
  lawyerNotes:   { type: String },
  internalNotes: { type: String, default: '' },
  archived:      { type: Boolean, default: false },
  updates:       [updateSchema],
  files:         [fileSchema],
}, { timestamps: true });

module.exports = mongoose.model('Case', caseSchema);
