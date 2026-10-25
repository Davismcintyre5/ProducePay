import {
  startWeeklyReportScheduler,
  stopWeeklyReportScheduler
} from './weeklyReportScheduler.js';
import {
  startBackupScheduler,
  stopBackupScheduler
} from './backupScheduler.js';
import logger from '../utils/logger.js';

export async function startAllSchedulers() {
  await startWeeklyReportScheduler();
  await startBackupScheduler();
  logger.info('schedulers started');
}

export function stopAllSchedulers() {
  stopWeeklyReportScheduler();
  stopBackupScheduler();
}

export default { startAllSchedulers, stopAllSchedulers };