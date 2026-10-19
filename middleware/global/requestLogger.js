import logger from '../../utils/logger.js';

export default function requestLogger(req, res, next) {
  const startedAt = process.hrtime.bigint();

  logger.info(
    { reqId: req.id, method: req.method, path: req.originalUrl, ip: req.ip },
    'request started'
  );

  res.on('finish', () => {
    const durationMs = Number(process.hrtime.bigint() - startedAt) / 1e6;
    logger.info(
      {
        reqId: req.id,
        method: req.method,
        path: req.originalUrl,
        status: res.statusCode,
        durationMs: Math.round(durationMs * 100) / 100,
        userId: req.user?.id
      },
      'request finished'
    );
  });

  next();
}