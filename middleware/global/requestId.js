import { randomUUID } from 'node:crypto';

export default function requestId(req, res, next) {
  const incoming = req.headers['x-request-id'];
  req.id = typeof incoming === 'string' && incoming.length <= 128 ? incoming : randomUUID();
  res.setHeader('X-Request-Id', req.id);
  next();
}