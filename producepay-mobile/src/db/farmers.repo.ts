import { getDB } from './index';
import type { Farmer } from '../types';

export type CachedFarmer = Farmer & { synced_at: string };

export async function replaceAll(farmers: Farmer[]): Promise<void> {
  const db = await getDB();
  const now = new Date().toISOString();

  await db.withTransactionAsync(async () => {
    await db.runAsync('DELETE FROM farmers');
    for (const f of farmers) {
      await db.runAsync(
        `INSERT OR REPLACE INTO farmers (id, code, name, phone, location, synced_at)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [f.id, f.code, f.name, f.phone ?? '', f.location ?? '', now]
      );
    }
  });
}

export async function search(query: string): Promise<CachedFarmer[]> {
  const db = await getDB();
  const q = query.trim();
  if (!q) {
    return db.getAllAsync<CachedFarmer>(
      'SELECT * FROM farmers ORDER BY name LIMIT 100'
    );
  }
  const like = `%${q}%`;
  return db.getAllAsync<CachedFarmer>(
    `SELECT * FROM farmers
       WHERE name LIKE ? OR code LIKE ? OR phone LIKE ? OR location LIKE ?
     ORDER BY name LIMIT 100`,
    [like, like, like, like]
  );
}

export async function count(): Promise<number> {
  const db = await getDB();
  const row = await db.getFirstAsync<{ c: number }>('SELECT COUNT(*) as c FROM farmers');
  return row?.c ?? 0;
}

export async function lastSyncedAt(): Promise<string | null> {
  const db = await getDB();
  const row = await db.getFirstAsync<{ synced_at: string }>(
    'SELECT synced_at FROM farmers ORDER BY synced_at DESC LIMIT 1'
  );
  return row?.synced_at ?? null;
}