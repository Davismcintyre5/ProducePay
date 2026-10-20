import {
  listPendingOutbox,
  markSyncing,
  markSynced,
  markFailed
} from '../db/outbox.repo';
import { create as createDelivery } from '../api/delivery';

let running = false;
const listeners = new Set<() => void>();

export function subscribe(fn: () => void): () => void {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

function emit() {
  listeners.forEach((fn) => fn());
}

export function isSyncing(): boolean {
  return running;
}

export async function syncOutbox(): Promise<{ synced: number; failed: number }> {
  if (running) return { synced: 0, failed: 0 };
  
  running = true;
  emit();

  let synced = 0;
  let failed = 0;

  try {
    const items = await listPendingOutbox();

    for (const item of items) {
      await markSyncing(item.client_request_id);
      emit();

      try {
        await createDelivery({
          farmerId: item.farmer_id,
          weightKg: item.weight_kg,
          collectedAt: item.collected_at,
          notes: item.notes ?? undefined,
          clientRequestId: item.client_request_id
        });
        
        await markSynced(item.client_request_id);
        synced += 1;
      } catch (err: any) {
        const status = err?.response?.status;
        const msg =
          err?.response?.data?.error?.message ||
          err?.message ||
          'Network error';
          
        // If it's a 401, the axios interceptor will handle refreshing the token.
        // We just mark it as failed for this cycle so it retries next time.
        await markFailed(item.client_request_id, msg);
        failed += 1;
      } finally {
        emit();
      }
    }
  } catch (globalErr) {
    console.error('Sync engine fatal error:', globalErr);
  } finally {
    running = false;
    emit();
  }

  return { synced, failed };
}