require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Admin = require('../models/Admin');
const Client = require('../models/Client');
const Case = require('../models/Case');
const Consultation = require('../models/Consultation');
const Settings = require('../models/Settings');

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('seeding...');
  await Promise.all([Admin.deleteMany({}), Client.deleteMany({}), Case.deleteMany({}), Consultation.deleteMany({}), Settings.deleteMany({})]);

  await Admin.create({ username: 'EslamAshrafAlattar', password: 'Samsungs4zoom', name: 'المستشار اسلام اشرف العطار' });


  console.log('✅ done. Admin: EslamAshrafAlattar / Samsungs4zoom');
  process.exit(0);
})();
