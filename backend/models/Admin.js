const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const adminSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true },
  password: { type: String, required: true },
  name:     { type: String, default: 'مدير النظام' },
  role:     { type: String, default: 'admin' },
}, { timestamps: true });

adminSchema.pre('save', async function(next){
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});
adminSchema.methods.compare = function(pwd){ return bcrypt.compare(pwd, this.password); };

module.exports = mongoose.model('Admin', adminSchema);
