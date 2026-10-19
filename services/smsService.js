import hdmClient from '../config/hdmbridge.js';
import env from '../config/env.js';
import logger from '../utils/logger.js';
import { normalizePhone } from '../utils/helpers.js';

const DISABLED = { sent: false, skipped: true, reason: 'SMS_DISABLED' };

export async function sendSms({ to, content, type = 'transactional' }) {
  if (!env.SMS_ENABLED) return DISABLED;
  if (!to || !content) {
    return { sent: false, skipped: false, reason: 'MISSING_FIELDS' };
  }

  const phone = normalizePhone(to);
  if (!phone) {
    return { sent: false, skipped: false, reason: 'INVALID_PHONE' };
  }

  try {
    const res = await hdmClient.post('/sms/send', {
      to: phone,
      content,
      sender: env.HDM_SMS_SENDER,
      type
    });

    const data = res.data || {};

    return {
      sent: data.success === true,
      skipped: false,
      messageId: data.messageId,
      status: data.status,
      creditsUsed: data.creditsUsed
    };
  } catch (err) {
    const code = err.response?.data?.code;
    const message = err.response?.data?.error || err.message;

    logger.error({ code, message, to: phone }, 'sms send failed');

    return {
      sent: false,
      skipped: false,
      error: message,
      code
    };
  }
}

export default { sendSms };