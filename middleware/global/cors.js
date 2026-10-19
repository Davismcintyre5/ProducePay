import cors from 'cors';
import env from '../../config/env.js';

const options = {
  origin(origin, callback) {
    if (!origin) return callback(null, true);
    
    if (origin.includes('localhost:8081') || origin.includes('127.0.0.1:8081')) {
      return callback(null, true);
    }
    
    if (env.CORS_ORIGIN.includes(origin) || env.CORS_ORIGIN.includes('*')) {
      return callback(null, true);
    }

    return callback(null, false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-Id', 'Cookie'],
  exposedHeaders: ['X-Request-Id', 'Set-Cookie'],
  maxAge: 86400
};

export default cors(options);