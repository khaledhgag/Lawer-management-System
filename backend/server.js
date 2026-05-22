// نقطة الدخول للخادم
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const connectDB = require('./config/db');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

// Middlewares
app.use(cors({ origin: process.env.CLIENT_URL || '*', credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/cases', require('./routes/caseRoutes'));
app.use('/api/track', require('./routes/trackRoutes'));
app.use('/api/consultations', require('./routes/consultationRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/settings', require('./routes/settingsRoutes'));
app.use('/api/calendar', require('./routes/calendarRoutes'));
app.use('/api/files', require('./routes/fileRoutes'));

app.get('/', (_, res) => res.json({ ok: true, name: 'Lawyer API' }));
app.use((req, res) => res.status(404).json({ message: 'Not found' }));
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
connectDB().then(() => {
  app.listen(PORT, () => console.log(`✅ Server on http://localhost:${PORT}`));
});
