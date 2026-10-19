import hdmClient from '../config/hdmbridge.js';
import env from '../config/env.js';
import logger from '../utils/logger.js';

const DISABLED = { sent: false, skipped: true, reason: 'EMAIL_DISABLED' };

export async function sendEmail({ to, subject, htmlBody, textBody, replyTo }) {
  if (!env.EMAIL_ENABLED) return DISABLED;
  if (!to || !subject || !htmlBody) {
    return { sent: false, skipped: false, reason: 'MISSING_FIELDS' };
  }

  try {
    const res = await hdmClient.post('/emails/send', {
      from: env.HDM_FROM_EMAIL,
      fromName: env.HDM_FROM_NAME,
      to,
      subject,
      htmlBody,
      textBody,
      replyTo
    });

    const data = res.data || {};

    return {
      sent: true,
      skipped: false,
      messageId: data.messageId,
      status: data.status || 'queued'
    };
  } catch (err) {
    const code = err.response?.data?.code;
    const message = err.response?.data?.error || err.message;

    logger.error({ code, message, to }, 'email send failed');

    return {
      sent: false,
      skipped: false,
      error: message,
      code
    };
  }
}

export async function getEmailStatus(messageId) {
  if (!env.EMAIL_ENABLED) return { skipped: true, reason: 'EMAIL_DISABLED' };
  if (!messageId) return { error: 'MISSING_MESSAGE_ID' };

  try {
    const res = await hdmClient.get(`/emails/status/${encodeURIComponent(messageId)}`);
    return res.data || {};
  } catch (err) {
    const message = err.response?.data?.error || err.message;
    logger.error({ messageId, message }, 'email status check failed');
    return { error: message };
  }
}

export default { sendEmail, getEmailStatus };