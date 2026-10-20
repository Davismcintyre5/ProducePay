import { getDB } from './index';

export type OutboxStatus = 'pending' | 'syncing' | 'failed' | 'synced';

export type OutboxItem = {
  client_request_id: string;
  farmer_id: string;
  farmer_code: string;
  farmer_name: string;
  farmer_phone: string | null;
  weight_kg: number;
  collected_at: string;
  notes: string | null;
  status: OutboxStatus;
  error: string | null;
  attempt_count: number;
  created_at: string;
  synced_at: string | null;
};

export async function insert(item: OutboxItem): Promise<void> {
  const db = await getDB();
  await db.runAsync(
    `INSERT INTO outbox (
      client_request_id, farmer_id, farmer_code, farmer_name, farmer_phone,
      weight_kg, collected_at, notes, status, attempt_count, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      item.client_request_id,
      item.farmer_id,
      item.farmer_code,
      item.farmer_name,
      item.farmer_phone,
      item.weight_kg,
      item.collected_at,
      item.notes,
      item.status,
      item.attempt_count,
      item.created_at
    ]
  );
}

export async function listPendingOutbox(): Promise<OutboxItem[]> {
  const db = await getDB();
  return db.getAllAsync<OutboxItem>(
    "SELECT * FROM outbox WHERE status IN ('pending', 'failed') ORDER BY created_at ASC"
  );
}

export async function listAll(): Promise<OutboxItem[]> {
  const db = await getDB();
  return db.getAllAsync<OutboxItem>(
    "SELECT * FROM outbox WHERE status != 'synced' ORDER BY created_at DESC"
  );
}

export async function markSyncing(clientRequestId: string): Promise<void> {
  const db = await getDB();
  await db.runAsync(
    "UPDATE outbox SET status = 'syncing' WHERE client_request_id = ?",
    [clientRequestId]
  );
}

export async function markSynced(clientRequestId: string): Promise<void> {
  const db = await getDB();
  await db.runAsync('DELETE FROM outbox WHERE client_request_id = ?', [
    clientRequestId
  ]);
}

export async function markFailed(
  clientRequestId: string,
  error: string
): Promise<void> {
  const db = await getDB();
  await db.runAsync(
    `UPDATE outbox
       SET status = 'failed', error = ?, attempt_count = attempt_count + 1
     WHERE client_request_id = ?`,
    [error, clientRequestId]
  );
}

export async function remove(clientRequestId: string): Promise<void> {
  const db = await getDB();
  await db.runAsync('DELETE FROM outbox WHERE client_request_id = ?', [
    clientRequestId
  ]);
}

export async function countPending(): Promise<number> {
  const db = await getDB();
  const row = await db.getFirstAsync<{ c: number }>(
    "SELECT COUNT(*) as c FROM outbox WHERE status IN ('pending', 'failed')"
  );
  return row?.c ?? 0;
}