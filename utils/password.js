import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';
import env from '../config/env.js';

export async function hashPassword(plain) {
  return bcrypt.hash(plain, env.BCRYPT_ROUNDS);
}

export async function comparePassword(plain, hash) {
  return bcrypt.compare(plain, hash);
}

export function generateOtp({ length = 6 } = {}) {
  const max = 10 ** length;
  const num = crypto.randomInt(0, max);
  return String(num).padStart(length, '0');
}

export function hashOtp(code) {
  return crypto.createHash('sha256').update(String(code)).digest('hex');
}

export function compareOtp(code, hash) {
  const incoming = hashOtp(code);
  const a = Buffer.from(incoming, 'hex');
  const b = Buffer.from(hash, 'hex');
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}