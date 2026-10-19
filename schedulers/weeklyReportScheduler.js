import cron from 'node-cron';
import env from '../config/env.js';
import logger from '../utils/logger.js';
import Settings from '../models/Settings.js';
import User from '../models/User.js';
import Delivery from '../models/Delivery.js';
import Payment from '../models/Payment.js';
import emailTemplates from '../templates/emailTemplates.js';
import smsTemplates from '../templates/smsTemplates.js';
import { sendEmail } from '../services/emailService.js';
import { sendSms } from '../services/smsService.js';
import { weekRangeInNairobi, roundKes } from '../utils/helpers.js';

const CRON_TIMEZONE = 'Africa/Nairobi';
const JOB_NAME = 'weekly-report';

let task = null;
let activeCronExpr = null;

function buildCronExpression(day, hour) {
  const d = Number.isInteger(day) && day >= 0 && day <= 6 ? day : 1;
  const h = Number.isInteger(hour) && hour >= 0 && hour <= 23 ? hour : 8;
  return `0 ${h} * * ${d}`;
}

async function buildReportData({ from, to }) {
  const match = { collectedAt: { $gte: from, $lte: to } };

  const [deliveryAgg] = await Delivery.aggregate([
    { $match: match },
    {
      $group: {
        _id: null,
        totalDeliveries: { $sum: 1 },
        totalWeightKg: { $sum: '$weightKg' },
        totalKes: { $sum: '$totalKes' }
      }
    }
  ]);

  const topFarmers = await Delivery.aggregate([
    { $match: match },
    {
      $group: {
        _id: '$farmer',
        name: { $first: '$farmerSnapshot.name' },
        weightKg: { $sum: '$weightKg' }
      }
    },
    { $sort: { weightKg: -1 } },
    { $limit: 5 }
  ]);

  const [outstandingAgg] = await Payment.aggregate([
    { $match: { status: 'PENDING' } },
    {
      $group: {
        _id: null,
        count: { $sum: 1 },
        amountKes: { $sum: '$amountKes' }
      }
    }
  ]);

  return {
    weekFrom: from,
    weekTo: to,
    totalDeliveries: deliveryAgg?.totalDeliveries || 0,
    totalWeightKg: roundKes(deliveryAgg?.totalWeightKg || 0),
    totalPaymentsKes: roundKes(deliveryAgg?.totalKes || 0),
    outstandingCount: outstandingAgg?.count || 0,
    outstandingKes: roundKes(outstandingAgg?.amountKes || 0),
    topFarmers: topFarmers.map((f) => ({ name: f.name, weightKg: f.weightKg }))
  };
}

async function dispatchTo(recipients, data) {
  const email = emailTemplates.weeklyReport(data);
  const sms = smsTemplates.weeklyReport(data);

  const results = await Promise.allSettled(
    recipients.flatMap((u) => [
      sendEmail({
        to: u.email,
        subject: email.subject,
        htmlBody: email.htmlBody,
        textBody: email.textBody
      }),
      sendSms({ to: u.phone, content: sms })
    ])
  );

  const failed = results.filter((r) => r.status === 'rejected' || r.value?.error).length;

  return { attempted: results.length, failed };
}

export async function runWeeklyReportOnce(date = new Date()) {
  const settings = await Settings.getGlobal();

  if (settings.notifications?.notifyManagersOnWeeklyReport === false) {
    logger.info({ job: JOB_NAME }, 'weekly report skipped: disabled in settings');
    return { skipped: true, reason: 'DISABLED_IN_SETTINGS' };
  }

  if (!env.EMAIL_ENABLED && !env.SMS_ENABLED) {
    logger.warn({ job: JOB_NAME }, 'weekly report skipped: both channels disabled');
    return { skipped: true, reason: 'CHANNELS_DISABLED' };
  }

  const { from, to } = weekRangeInNairobi(date);
  const data = await buildReportData({ from, to });

  const [managers, admins] = await Promise.all([
    User.findActiveByRole('MANAGER'),
    User.findActiveByRole('ADMIN')
  ]);
  const recipients = [...managers, ...admins];

  if (!recipients.length) {
    logger.warn({ job: JOB_NAME }, 'no recipients for weekly report');
    return { skipped: true, reason: 'NO_RECIPIENTS' };
  }

  const { attempted, failed } = await dispatchTo(recipients, data);

  logger.info(
    {
      job: JOB_NAME,
      recipients: recipients.length,
      attempted,
      failed,
      weekFrom: from,
      weekTo: to
    },
    'weekly report dispatched'
  );

  return { skipped: false, recipients: recipients.length, attempted, failed };
}

export async function startWeeklyReportScheduler() {
  if (task) return task;

  const settings = await Settings.getGlobal();
  const day = settings.notifications?.weeklyReportDay ?? 1;
  const hour = settings.notifications?.weeklyReportHour ?? 8;
  const cronExpr = buildCronExpression(day, hour);

  activeCronExpr = cronExpr;

  task = cron.schedule(
    cronExpr,
    async () => {
      try {
        await runWeeklyReportOnce(new Date());
      } catch (err) {
        logger.error({ job: JOB_NAME, err }, 'weekly report job failed');
      }
    },
    { timezone: CRON_TIMEZONE }
  );

  logger.info({ job: JOB_NAME, cron: cronExpr, tz: CRON_TIMEZONE }, 'scheduler started');
  return task;
}

export function stopWeeklyReportScheduler() {
  if (!task) return;
  task.stop();
  task = null;
  activeCronExpr = null;
}

export default {
  startWeeklyReportScheduler,
  stopWeeklyReportScheduler,
  runWeeklyReportOnce
};