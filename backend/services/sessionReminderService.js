const Case = require('../models/Case');
const telegram = require('./telegramService');

async function sendOfficeAlert(message) {
  if (process.env.TELEGRAM_AUTO_NOTIFY_OFFICE !== 'true') return null;
  return telegram.sendMessage(message);
}

async function checkUpcomingSessions() {
  if (process.env.TELEGRAM_AUTO_NOTIFY_OFFICE !== 'true') {
    console.log('[SESSION-REMINDER] ⚠️ Disabled (TELEGRAM_AUTO_NOTIFY_OFFICE != true)');
    return;
  }

  const now = new Date();

  console.log(`[SESSION-REMINDER] 🔍 Checking sessions at ${now.toISOString()}`);

  const upcomingCases = await Case.find({
    archived: { $ne: true },
    nextSessionDate: { $gte: now }
  }).populate('client', 'name phone');

  console.log(`[SESSION-REMINDER] 📋 Found ${upcomingCases.length} cases to check`);

  if (!upcomingCases.length) return;

  for (const c of upcomingCases) {
    try {
      const sessionDate = new Date(c.nextSessionDate);
      const hoursLeft = (sessionDate - now) / (1000 * 60 * 60);

      // لو الحقل مش موجود
      if (!c.sessionReminderStages) {
        c.sessionReminderStages = [];
      }

      let reminderStage = null;

      // قبلها بيومين
      if (
        hoursLeft <= 48 &&
        hoursLeft > 24 &&
        !c.sessionReminderStages.includes('48h')
      ) {
        reminderStage = '48h';
      }

      // قبلها بيوم
      else if (
        hoursLeft <= 24 &&
        hoursLeft > 12 &&
        !c.sessionReminderStages.includes('24h')
      ) {
        reminderStage = '24h';
      }

      // قبلها بـ 12 ساعة
      else if (
        hoursLeft <= 12 &&
        hoursLeft > 0 &&
        !c.sessionReminderStages.includes('12h')
      ) {
        reminderStage = '12h';
      }

      // لو مفيش reminder مطلوب
      if (!reminderStage) continue;

      const dateText = sessionDate.toLocaleString('ar-EG', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });

      const stageText =
        reminderStage === '48h'
          ? '⏰ تذكير: باقي يومين على الجلسة'
          : reminderStage === '24h'
          ? '⏰ تذكير: باقي يوم واحد على الجلسة'
          : '⏰ تذكير: باقي 12 ساعة على الجلسة';

      const message = telegram.formatSystemAlertMessage(
        'أنا مساعدك الشخصي وهنظملك مواعيدك',
        `${stageText}

القضية: ${c.caseNumber}
العميل: ${c.client?.name || 'غير معروف'}
الهاتف: ${c.client?.phone || 'غير متوفر'}
المحكمة: ${c.court || 'غير محددة'}
الموعد: ${dateText}`
      );

      console.log(
        `[SESSION-REMINDER] 📩 Sending ${reminderStage} reminder for case ${c.caseNumber}...`
      );

      await sendOfficeAlert(message);

      // تسجيل المرحلة اللي اتبعتت
      c.sessionReminderStages.push(reminderStage);
      await c.save();

      console.log(
        `[SESSION-REMINDER] ✅ ${reminderStage} reminder sent for case ${c.caseNumber}`
      );
    } catch (err) {
      console.log(
        `[SESSION-REMINDER] ❌ Failed for case ${c.caseNumber}:`,
        err?.message || err
      );
    }
  }
}

function startSessionReminderJob() {
  console.log('[SESSION-REMINDER] 🚀 Starting session reminder service...');

  checkUpcomingSessions().catch((err) =>
    console.error('[SESSION-REMINDER] ❌ Startup error', err)
  );

  const intervalMinutes = Number(
    process.env.SESSION_REMINDER_INTERVAL_MINUTES || 30
  );

  setInterval(() => {
    console.log('[SESSION-REMINDER] ⏰ Checking for upcoming sessions...');
    checkUpcomingSessions().catch((err) =>
      console.error('[SESSION-REMINDER] ❌ Interval error', err)
    );
  }, intervalMinutes * 60 * 1000);

  console.log(
    `[SESSION-REMINDER] ✅ Started! Checking every ${intervalMinutes} minutes`
  );
}

module.exports = {
  startSessionReminderJob,
  checkUpcomingSessions,
};