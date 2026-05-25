const Case = require('../models/Case');
const telegram = require('./telegramService');

async function sendOfficeAlert(message) {
  if (process.env.TELEGRAM_AUTO_NOTIFY_OFFICE !== 'true') return null;
  return telegram.sendMessage(message);
}

async function checkUpcomingSessions() {
  if (process.env.TELEGRAM_AUTO_NOTIFY_OFFICE !== 'true') {
    console.log('[SESSION-REMINDER] ⚠️  Disabled (TELEGRAM_AUTO_NOTIFY_OFFICE != true)');
    return;
  }

  const now = new Date();
  const windowDays = Number(process.env.SESSION_REMINDER_WINDOW_DAYS || 3);
  const nextWindow = new Date(now);
  nextWindow.setDate(nextWindow.getDate() + windowDays);

  console.log(`[SESSION-REMINDER] 🔍 Searching for sessions between ${now.toISOString()} and ${nextWindow.toISOString()}`);

  const upcomingCases = await Case.find({
    archived: { $ne: true },
    nextSessionDate: { $gte: now, $lte: nextWindow },
    $or: [
      { nextSessionReminderSentAt: { $exists: false } },
      { nextSessionReminderSentAt: null },
    ],
  }).populate('client', 'name phone');

  console.log(`[SESSION-REMINDER] 📋 Found ${upcomingCases.length} cases to notify`);

  if (!upcomingCases.length) return;

  for (const c of upcomingCases) {
    const dateText = c.nextSessionDate ? new Date(c.nextSessionDate).toLocaleString('ar-EG', {
      year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'
    }) : 'غير محدد';

    const message = telegram.formatSystemAlertMessage(
      'أنا مساعدك الشخصي وهنظملك مواعيدك',
      `تذكير: جلسة قريبة للقضية ${c.caseNumber}\n\n` +
      `العميل: ${c.client?.name || 'غير معروف'}\n` +
      `الهاتف: ${c.client?.phone || 'غير متوفر'}\n` +
      `المحكمة: ${c.court || 'غير محددة'}\n` +
      `الموعد: ${dateText}`
    );

    try {
      console.log(`[SESSION-REMINDER] 📩 Sending reminder for case ${c.caseNumber}...`);
      await sendOfficeAlert(message);
      c.nextSessionReminderSentAt = new Date();
      await c.save();
      console.log(`[SESSION-REMINDER] ✅ Notified case ${c.caseNumber}`);
    } catch (err) {
      console.log(`[SESSION-REMINDER] ❌ Failed to notify case ${c.caseNumber}:`, err?.message || err);
    }
  }
}

function startSessionReminderJob() {
  console.log('[SESSION-REMINDER] 🚀 Starting session reminder service...');
  checkUpcomingSessions().catch((err) => console.error('[SESSION-REMINDER] ❌ Startup error', err));
  const intervalMinutes = Number(process.env.SESSION_REMINDER_INTERVAL_MINUTES || 30);
  setInterval(() => {
    console.log('[SESSION-REMINDER] ⏰ Checking for upcoming sessions...');
    checkUpcomingSessions().catch((err) => console.error('[SESSION-REMINDER] ❌ Interval error', err));
  }, intervalMinutes * 60 * 1000);
  console.log(`[SESSION-REMINDER] ✅ Started! Checking every ${intervalMinutes} minutes`);
}

module.exports = {
  startSessionReminderJob,
  checkUpcomingSessions,
};
