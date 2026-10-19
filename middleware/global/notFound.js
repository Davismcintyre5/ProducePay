import ApiError from '../../utils/ApiError.js';

export default function notFound(req, res, next) {
  next(ApiError.notFound(`Route ${req.method} ${req.originalUrl} not found`));
}