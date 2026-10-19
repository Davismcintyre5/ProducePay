import axios from 'axios';
import env from './env.js';
import logger from '../utils/logger.js';

const client = axios.create({
  baseURL: env.HDM_API_URL,
  timeout: 15000,
  headers: {
    Authorization: `Bearer ${env.HDM_API_KEY}`,
    'Content-Type': 'application/json'
  }
});

client.interceptors.response.use(
  (res) => res,
  async (err) => {
    const config = err.config || {};
    const status = err.response?.status;
    const code = err.response?.data?.code;

    const retryable =
      status >= 500 ||
      code === 'LIMIT_001';

    config.__retryCount = config.__retryCount || 0;

    if (retryable && config.__retryCount < env.NOTIFY_RETRY_MAX) {
      config.__retryCount += 1;
      const delay =
        env.NOTIFY_RETRY_BACKOFF_MS[config.__retryCount - 1] ??
        env.NOTIFY_RETRY_BACKOFF_MS.at(-1) ??
        2000;

      logger.warn(
        { attempt: config.__retryCount, delay, url: config.url },
        'hdm retry'
      );

      await new Promise((r) => setTimeout(r, delay));
      return client(config);
    }

    return Promise.reject(err);
  }
);

export default client;