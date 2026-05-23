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
    console.log('[telegram] skipped because Telegram is not configured');
    return { sent: false, skipped: true, error: 'Telegram not configured' };
  }

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
    console.log('[telegram api error]', data);
    return { sent: false, error: data.description || res.statusText, data };
  }

  return { sent: true, data };
}

module.exports = {
  formatSystemAlertMessage,
  sendMessage,
  isTelegramEnabled,
};
