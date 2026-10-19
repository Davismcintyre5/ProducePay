import mongoose from 'mongoose';
import env from './env.js';
import logger from '../utils/logger.js';

mongoose.set('strictQuery', true);

let connected = false;

export async function connectDB() {
  if (connected) return;

  mongoose.connection.on('connected', () => {
    connected = true;
  });

  mongoose.connection.on('disconnected', () => {
    connected = false;
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

  logger.info(`MongoDB connected: ${mongoose.connection.name}`);
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