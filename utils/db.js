import mongoose from 'mongoose';
import env from './env.js';
import logger from '../utils/logger.js';

mongoose.set('strictQuery', true);

let connected = false;

export async function connectDB() {
  if (connected) return;

  mongoose.connection.on('connected', () => {
    connected = true;
    logger.info({ db: mongoose.connection.name }, 'mongodb connected');
  });

  mongoose.connection.on('disconnected', () => {
    connected = false;
    logger.warn('mongodb disconnected');
  });

  mongoose.connection.on('error', (err) => {
    logger.error({ err }, 'mongodb connection error');
  });

  await mongoose.connect(env.MONGODB_URI, {
    maxPoolSize: 20,
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 45000,
    autoIndex: env.NODE_ENV !== 'production'
  });
}

export async function disconnectDB() {
  if (!connected) return;
  await mongoose.connection.close(false);
  connected = false;
  logger.info('mongodb connection closed');
}

export function isDBConnected() {
  return connected;
}