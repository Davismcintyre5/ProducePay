import env from '../../config/env.js';
import logger from '../../utils/logger.js';
import ApiError from '../../utils/ApiError.js';

export default function errorHandler(err, req, res, next) {
  const isOperational = err instanceof ApiError && err.isOperational;

  const statusCode = isOperational ? err.statusCode : 500;
  const code = isOperational ? err.code : 'INTERNAL_ERROR';
  const message = isOperational ? err.message : 'Internal server error';

  if (isOperational) {
    logger.warn({ reqId: req.id, code, message }, 'operational error');
  } else {
    logger.error({ reqId: req.id, err }, 'unhandled error');
  }

  const body = {
    success: false,
    error: {
      code,
      message,
      requestId: req.id
    }
  };

  if (isOperational && err.details) body.error.details = err.details;

  if (!isOperational && env.NODE_ENV === 'development') {
    body.error.stack = err.stack;
  }

  res.status(statusCode).json(body);
}