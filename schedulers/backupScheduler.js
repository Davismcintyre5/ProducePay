import cron from 'node-cron';
import Settings from '../models/Settings.js';
import Backup from '../models/Backup.js';
import User from '../models/User.js';
import { createBackup } from '../services/backupService.js';
import { sendEmail } from '../services/emailService.js';
import logger from '../utils/logger.js';

let task = null;

async function runAutoBackup() {
  try {
    const settings = await Settings.getGlobal();
    const backupSettings = settings.backups;

    if (!backupSettings?.enabled) return;

    const result = await createBackup('auto');

    await Backup.create({
      filename: result.filename,
      cloudinaryId: result.cloudinaryId,
      cloudinaryUrl: result.cloudinaryUrl,
      sizeBytes: result.sizeBytes,
      type: 'auto'
    });

    logger.info({ filename: result.filename }, 'Auto backup completed');

    if (backupSettings.emailOnCompletion && backupSettings.emailRecipient) {
      const sizeMb = (result.sizeBytes / 1024 / 1024).toFixed(2);
      await sendEmail({
        to: backupSettings.emailRecipient,
        subject: `ProducePay Auto Backup Complete - ${result.filename}`,
        htmlBody: `
          <h2>Auto Backup Complete</h2>
          <ul>
            <li><strong>File:</strong> ${result.filename}</li>
            <li><strong>Size:</strong> ${sizeMb} MB</li>
          </ul>
          <p><a href="${result.cloudinaryUrl}" style="background:#2e7d32;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;">Download Backup</a></p>
        `,
        textBody: `Download: ${result.cloudinaryUrl}`
      });
    }
  } catch (err) {
    logger.error({ err }, 'Auto backup failed');
  }
}

export async function startBackupScheduler() {
  if (task) return task;

  const settings = await Settings.getGlobal();
  const backupSettings = settings.backups;

  if (!backupSettings?.enabled) {
    logger.info('Backup scheduler disabled');
    return null;
  }

  const [hour, minute] = (backupSettings.time || '02:00').split(':');
  let cronExpr = '';

  if (backupSettings.frequency === 'daily') cronExpr = `${minute} ${hour} * * *`;
  if (backupSettings.frequency === 'weekly') cronExpr = `${minute} ${hour} * * 0`;
  if (backupSettings.frequency === 'monthly') cronExpr = `${minute} ${hour} 1 * *`;

  if (!cronExpr) return null;

  task = cron.schedule(cronExpr, runAutoBackup, { timezone: 'Africa/Nairobi' });
  logger.info({ cronExpr }, 'Backup scheduler started');

  return task;
}

export function stopBackupScheduler() {
  if (task) {
    task.stop();
    task = null;
  }
}