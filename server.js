import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

import { connectDB, disconnectDB } from './config/db.js';
import { startKeepAlive, stopKeepAlive } from './config/keepAlive.js';
import requestId from './middleware/global/requestId.js';
import requestLogger from './middleware/global/requestLogger.js';
import corsMiddleware from './middleware/global/cors.js';
import errorHandler from './middleware/global/errorHandler.js';
import notFound from './middleware/global/notFound.js';
import apiRoutes from './routes/index.js';
import { startAllSchedulers, stopAllSchedulers } from './schedulers/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.set('trust proxy', 1);
app.disable('x-powered-by');

app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false
  })
);

app.use(corsMiddleware);

app.use(requestId);
app.use(requestLogger);

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(cookieParser());

app.use('/api/v1', apiRoutes);

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

const distPath = path.join(__dirname, 'frontend', 'dist');
const indexPath = path.join(distPath, 'index.html');

if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get(/.*/, (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(indexPath);
  });
}

app.use(notFound);
app.use(errorHandler);

let server = null;
let shuttingDown = false;

async function start() {
  await connectDB();

  server = app.listen(process.env.PORT || 5000, async () => {
    console.log(`Server running on port ${process.env.PORT || 5000}`);
    
    startKeepAlive();
    
    try {
      await startAllSchedulers();
    } catch (err) {
      console.error('Failed to start schedulers:', err);
    }
  });
}

async function shutdown(signal) {
  if (shuttingDown) return;
  shuttingDown = true;

  console.log(`Shutdown signal received: ${signal}`);

  const forceExit = setTimeout(() => {
    console.error('Shutdown timeout — forcing exit');
    process.exit(1);
  }, 10000);
  forceExit.unref();

  try {
    stopKeepAlive();
    stopAllSchedulers();
    
    if (server) {
      await new Promise((resolve, reject) =>
        server.close((err) => (err ? reject(err) : resolve()))
      );
    }
    
    await disconnectDB();
    clearTimeout(forceExit);
    
    console.log('Shutdown complete');
    process.exit(0);
  } catch (err) {
    console.error('Shutdown failed:', err);
    process.exit(1);
  }
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  process.exit(1);
});
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

export default app;