import {
  startWeeklyReportScheduler,
  stopWeeklyReportScheduler
} from './weeklyReportScheduler.js';
import logger from '../utils/logger.js';

export async function startAllSchedulers() {
  await startWeeklyReportScheduler();
  logger.info('schedulers started');
}

export function stopAllSchedulers() {
  stopWeeklyReportScheduler();
}

export default { startAllSchedulers, stopAllSchedulers };