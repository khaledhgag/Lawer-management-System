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

  await Admin.create({ username: 'admin', password: 'admin123', name: 'مدير المكتب' });

  const pwd = await bcrypt.hash('client123', 10);
  const client = await Client.create({
    name: 'أحمد محمد', phone: '01000000000', email: 'ahmed@example.com',
    username: 'ahmed01', password: pwd,
  });

  await Case.create({
    client: client._id,
    caseNumber: 'C-000001-100',
    trackingCode: 'TRK12345',
    caseType: 'مدني',
    court: 'محكمة شمال القاهرة',
    currentStatus: 'قيد النظر',
    nextSessionDate: new Date(Date.now() + 7*24*3600*1000),
    lawyerNotes: 'القضية في مرحلة جمع المستندات.',
    updates: [
      { date: new Date('2026-05-01'), title: 'تم تقديم المستندات' },
      { date: new Date('2026-05-08'), title: 'تم تحديد جلسة' },
      { date: new Date('2026-05-15'), title: 'تم تأجيل القضية', notes: 'لطلب الخصم مهلة' },
    ],
  });

  await Consultation.create([
    { fullName: 'سارة علي', phone: '01111111111', type: 'أسرة', details: 'استفسار عن إجراءات الطلاق' },
    { fullName: 'محمود حسن', phone: '01222222222', type: 'شركات', details: 'تأسيس شركة' },
  ]);

  await Settings.create({
    officeName: 'مكتب المحاماة والاستشارات القانونية',
    about: 'خبرة تتجاوز 20 عاماً في القضايا المدنية والجنائية وقضايا الشركات.',
    phone: '+20 100 000 0000',
    email: 'info@example.com',
    address: 'القاهرة، مصر',
  });

  console.log('✅ done. Admin: admin / admin123');
  console.log('   Client: ahmed01 / client123  | case C-000001-100  code TRK12345');
  process.exit(0);
})();
