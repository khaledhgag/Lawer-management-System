const Case = require('../models/Case');
const telegram = require('./telegramService');

async function sendOfficeAlert(message) {
  if (process.env.TELEGRAM_AUTO_NOTIFY_OFFICE !== 'true') return null;
  return telegram.sendMessage(message);
}

async function checkUpcomingSessions() {
  if (process.env.TELEGRAM_AUTO_NOTIFY_OFFICE !== 'true') {
    console.log('[session-reminder] skipped because TELEGRAM_AUTO_NOTIFY_OFFICE is not enabled');
    return;
  }

  const now = new Date();
  const windowDays = Number(process.env.SESSION_REMINDER_WINDOW_DAYS || 3);
  const nextWindow = new Date(now);
  nextWindow.setDate(nextWindow.getDate() + windowDays);

  const upcomingCases = await Case.find({
    archived: { $ne: true },
    nextSessionDate: { $gte: now, $lte: nextWindow },
    $or: [
      { nextSessionReminderSentAt: { $exists: false } },
      { nextSessionReminderSentAt: null },
    ],
  }).populate('client', 'name phone');

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
      await sendOfficeAlert(message);
      c.nextSessionReminderSentAt = new Date();
      await c.save();
      console.log(`[session-reminder] notified case ${c.caseNumber}`);
    } catch (err) {
      console.log('[session-reminder] failed to notify case', c.caseNumber, err?.message || err);
    }
  }
}

function startSessionReminderJob() {
  checkUpcomingSessions().catch((err) => console.error('[session-reminder] startup error', err));
  const intervalMinutes = Number(process.env.SESSION_REMINDER_INTERVAL_MINUTES || 30);
  setInterval(() => {
    checkUpcomingSessions().catch((err) => console.error('[session-reminder] interval error', err));
  }, intervalMinutes * 60 * 1000);
  console.log(`[session-reminder] started, checking every ${intervalMinutes} minutes`);
}

module.exports = {
  startSessionReminderJob,
  checkUpcomingSessions,
};
