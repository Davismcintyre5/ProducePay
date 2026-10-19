import logger from '../utils/logger.js';
import env from './env.js';

const FIRST_DELAY_MS = 60 * 1000;
const INTERVAL_MS = 10 * 60 * 1000;
const TIMEOUT_MS = 10 * 1000;

let firstTimer = null;
let intervalTimer = null;

function isEnabled() {
  // Safely check if env has keepAlive defined, otherwise fallback to false
  return env.KEEP_ALIVE_ENABLED === true || env.KEEP_ALIVE_ENABLED === 'true';
}

function isVerbose() {
  return env.KEEP_ALIVE_VERBOSE === true || env.KEEP_ALIVE_VERBOSE === 'true';
}

export async function pingHealth(options = {}) {
  const { forceLog = false } = options;
  
  // Use your actual environment URL, defaulting to the local port
  const base = env.API_URL || `http://localhost:${process.env.PORT || 5000}`;
  
  const url = base.replace(/\/+$/, '') + '/health';
  const started = Date.now();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(url, { method: 'GET', signal: controller.signal });
    const duration = Date.now() - started;

    if (!res.ok) {
      logger.warn(`[keepAlive] GET ${url} -> ${res.status} in ${duration}ms`);
      return;
    }

    if (isVerbose() || forceLog) {
      logger.info(`[keepAlive] GET ${url} -> ${res.status} in ${duration}ms`);
    }
  } catch (err) {
    const duration = Date.now() - started;
    const msg = err.name === 'AbortError' ? `timeout after ${duration}ms` : err.message;
    logger.warn(`[keepAlive] GET ${url} failed: ${msg}`);
  } finally {
    clearTimeout(timeout);
  }
}

export function startKeepAlive() {
  if (!isEnabled()) {
    logger.info('[keepAlive] Disabled');
    return;
  }

  if (firstTimer || intervalTimer) {
    logger.warn('[keepAlive] Already running');
    return;
  }

  logger.info(
    `[keepAlive] Enabled. First ping in 60s, then every 10m. Verbose logs ${
      isVerbose() ? 'on.' : 'off.'
    }`
  );

  firstTimer = setTimeout(() => {
    firstTimer = null;
    pingHealth({ forceLog: true }).catch(() => {});

    intervalTimer = setInterval(() => {
      pingHealth().catch(() => {});
    }, INTERVAL_MS);
  }, FIRST_DELAY_MS);
}

export function stopKeepAlive() {
  if (firstTimer) {
    clearTimeout(firstTimer);
    firstTimer = null;
  }
  if (intervalTimer) {
    clearInterval(intervalTimer);
    intervalTimer = null;
  }
}