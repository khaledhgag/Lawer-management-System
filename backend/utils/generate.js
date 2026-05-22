const crypto = require('crypto');
function randomCode(len = 8) {
  return crypto.randomBytes(len).toString('hex').slice(0, len).toUpperCase();
}
function generateCredentials(clientName = 'client') {
  const base = (clientName.replace(/\s+/g, '').toLowerCase().slice(0,6) || 'user');
  const username = `${base}${Math.floor(1000 + Math.random()*9000)}`;
  const password = randomCode(10);
  const trackingCode = randomCode(8);
  const caseNumber = `C-${Date.now().toString().slice(-6)}-${Math.floor(100+Math.random()*900)}`;
  return { username, password, trackingCode, caseNumber };
}
function consultationRequestNumber() {
  return `CON-${Date.now().toString().slice(-8)}`;
}

module.exports = { randomCode, generateCredentials, consultationRequestNumber };
