import pino from 'pino';
import env from '../config/env.js';

const isDev = env.NODE_ENV === 'development';

const logger = pino({
  level: env.LOG_LEVEL,
  timestamp: pino.stdTimeFunctions.isoTime,
  redact: {
    paths: [
      'password',
      'passwordHash',
      'newPassword',
      'oldPassword',
      'token',
      'accessToken',
      'refreshToken',
      'otp',
      'otpHash',
      '*.password',
      '*.passwordHash',
      'req.headers.authorization',
      'req.headers.cookie'
    ],
    censor: '[REDACTED]'
  },
  transport: isDev
    ? { target: 'pino-pretty', options: { colorize: true, translateTime: 'SYS:HH:MM:ss' } }
    : undefined
});

export { logger };
export default logger;