import ApiError from '../../utils/ApiError.js';
import { verifyAccessToken } from '../../utils/token.js';
import logger from '../../utils/logger.js';
import User from '../../models/User.js';

export default async function auth(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const [scheme, token] = header.split(' ');

    if (scheme !== 'Bearer' || !token) {
      logger.warn(
        { reqId: req.id, path: req.originalUrl, header: header.slice(0, 30) },
        'auth failed: missing or malformed Authorization header'
      );
      throw ApiError.unauthorized();
    }

    let payload;
    try {
      payload = verifyAccessToken(token);
    } catch (err) {
      logger.warn(
        { reqId: req.id, path: req.originalUrl, err: err.message },
        'auth failed: token verify error'
      );
      throw ApiError.unauthorized();
    }

    const user = await User.findById(payload.sub).select('+active');
    if (!user) {
      logger.warn(
        { reqId: req.id, sub: payload.sub },
        'auth failed: user not found'
      );
      throw ApiError.unauthorized();
    }

    if (!user.active) {
      logger.warn(
        { reqId: req.id, sub: payload.sub },
        'auth failed: user inactive'
      );
      throw ApiError.unauthorized();
    }

    req.user = user;
    next();
  } catch (err) {
    next(err instanceof ApiError ? err : ApiError.unauthorized());
  }
}