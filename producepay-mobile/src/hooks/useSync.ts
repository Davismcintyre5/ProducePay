import { useCallback, useEffect, useState } from 'react';
import { AppState } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { syncOutbox, subscribe, isSyncing } from '../lib/sync';
import { listAll } from '../db/outbox.repo';
import type { OutboxItem } from '../db/outbox.repo';

export function useSync() {
  const [pending, setPending] = useState<OutboxItem[]>([]);
  const [syncing, setSyncing] = useState(false);
  const [online, setOnline] = useState(true);

  const refresh = useCallback(async () => {
    const items = await listAll();
    setPending(items);
    setSyncing(isSyncing());
  }, []);

  const trigger = useCallback(async () => {
    if (!online) return;
    await syncOutbox();
    await refresh();
  }, [online, refresh]);

  useEffect(() => {
    refresh();
    const unsub = subscribe(refresh);
    return unsub;
  }, [refresh]);

  useEffect(() => {
    const unsub = NetInfo.addEventListener((state) => {
      const isOnline = Boolean(
        state.isConnected && state.isInternetReachable !== false
      );
      setOnline(isOnline);
      if (isOnline) {
        syncOutbox().then(refresh);
      }
    });
    return unsub;
  }, [refresh]);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        refresh();
        if (online) syncOutbox().then(refresh);
      }
    });
    return () => sub.remove();
  }, [online, refresh]);

  useEffect(() => {
    const id = setInterval(() => {
      if (online) syncOutbox().then(refresh);
    }, 30000);
    return () => clearInterval(id);
  }, [online, refresh]);

  return { pending, syncing, online, trigger, refresh };
}