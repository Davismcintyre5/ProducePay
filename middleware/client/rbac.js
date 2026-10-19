import ApiError from '../../utils/ApiError.js';

export default function rbac(...allowedRoles) {
  const allowed = new Set(allowedRoles);

  return function rbacMiddleware(req, res, next) {
    if (!req.user) return next(ApiError.unauthorized());
    if (!allowed.has(req.user.role)) return next(ApiError.forbidden());
    next();
  };
}