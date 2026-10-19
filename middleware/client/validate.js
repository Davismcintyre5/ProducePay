import ApiError from '../../utils/ApiError.js';
import logger from '../../utils/logger.js';

export default function validate(schema) {
  return function validateMiddleware(req, res, next) {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const details = result.error.issues.map((i) => ({
        field: i.path.join('.'),
        issue: i.message,
        code: i.code
      }));

      logger.warn(
        {
          reqId: req.id,
          path: req.originalUrl,
          method: req.method,
          body: req.body,
          details
        },
        'validation failed'
      );

      return next(ApiError.validation('Validation failed', details));
    }

    req.body = result.data;
    next();
  };
}