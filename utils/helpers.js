import { randomUUID } from 'node:crypto';

export function normalizePhone(input) {
  if (!input) return null;
  const digits = String(input).replace(/\D/g, '');
  if (digits.startsWith('254') && digits.length === 12) return digits;
  if (digits.startsWith('0') && digits.length === 10) return '254' + digits.slice(1);
  if (digits.length === 9) return '254' + digits;
  return null;
}

export function formatKenyanPhone(input) {
  const normalized = normalizePhone(input);
  if (!normalized) return input;
  return `+${normalized.slice(0, 3)} ${normalized.slice(3, 6)} ${normalized.slice(6, 9)} ${normalized.slice(9)}`;
}

export function roundKes(amount) {
  return Math.round(Number(amount) * 100) / 100;
}

export function buildCode(prefix, seq, width = 3) {
  return `${prefix}${String(seq).padStart(width, '0')}`;
}

export function buildYearCode(prefix, seq, year, width = 4) {
  return `${prefix}-${year}-${String(seq).padStart(width, '0')}`;
}

export function currentYear(date = new Date()) {
  return date.getFullYear();
}

export function toNairobiDate(date = new Date()) {
  return new Date(date.toLocaleString('en-US', { timeZone: 'Africa/Nairobi' }));
}

export function weekRangeInNairobi(date = new Date()) {
  const nairobi = toNairobiDate(date);
  const day = nairobi.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;

  const monday = new Date(nairobi);
  monday.setDate(nairobi.getDate() + diffToMonday);
  monday.setHours(0, 0, 0, 0);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);

  return { from: monday, to: sunday };
}

export function escapeRegex(input = '') {
  return String(input).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function getPagination(query = {}, { defaultLimit = 20, maxLimit = 100 } = {}) {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(maxLimit, Math.max(1, parseInt(query.limit, 10) || defaultLimit));
  return { page, limit, skip: (page - 1) * limit };
}

export function generateRequestId() {
  return randomUUID();
}