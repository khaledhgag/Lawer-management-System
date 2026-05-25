function formatSystemAlertMessage(title, details = '') {
  return [title, details].filter(Boolean).join('\n\n');
}

function isTelegramEnabled() {
  return Boolean(process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID);
}

async function sendMessage(text) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!isTelegramEnabled()) {
    console.log('[TELEGRAM] ❌ NOT CONFIGURED - Missing token or chat ID');
    return { sent: false, skipped: true, error: 'Telegram not configured' };
  }

  console.log('[TELEGRAM] 📤 Attempting to send message to chat', chatId);
  console.log('[TELEGRAM] 📝 Message preview:', text.substring(0, 100));

  const url = `https://api.telegram.org/bot${token}/sendMessage`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      chat_id: chatId,
      text,
    }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok || data.ok === false) {
    console.log('[TELEGRAM] ❌ ERROR:', data.description || res.statusText);
    return { sent: false, error: data.description || res.statusText, data };
  }

  console.log('[TELEGRAM] ✅ Message sent successfully! ID:', data.result.message_id);
  return { sent: true, data };
}

module.exports = {
  formatSystemAlertMessage,
  sendMessage,
  isTelegramEnabled,
};
