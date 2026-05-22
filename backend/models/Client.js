const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const clientSchema = new mongoose.Schema({
  name:     { type: String, required: true },
  phone:    { type: String, required: true },
  email:    { type: String },
  username: { type: String, unique: true, sparse: true },
  password: { type: String }, // hashed
}, { timestamps: true });

clientSchema.methods.compare = function(pwd){ return bcrypt.compare(pwd, this.password); };

module.exports = mongoose.model('Client', clientSchema);
