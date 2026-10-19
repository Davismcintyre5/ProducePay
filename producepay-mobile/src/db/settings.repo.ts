import { getDB } from './index';
import type { Settings } from '../types';

export async function save(settings: Settings): Promise<void> {
  const db = await getDB();
  const now = new Date().toISOString();
  await db.runAsync(
    'INSERT OR REPLACE INTO settings (key, value, synced_at) VALUES (?, ?, ?)',
    ['global', JSON.stringify(settings), now]
  );
}

export async function get(): Promise<Settings | null> {
  const db = await getDB();
  const row = await db.getFirstAsync<{ value: string }>(
    "SELECT value FROM settings WHERE key = 'global'"
  );
  if (!row) return null;
  try {
    return JSON.parse(row.value) as Settings;
  } catch {
    return null;
  }
}

export async function ratePerKg(): Promise<number | null> {
  const s = await get();
  return s?.business?.ratePerKg ?? null;
}