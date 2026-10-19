import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSync } from '../../hooks/useSync';
import { remove } from '../../db/outbox.repo';
import { formatKg, formatDateTime } from '../../lib/format';
import { colors, spacing, fontSize, radius } from '../../theme';

export default function SyncStatus() {
  const { pending, syncing, online, trigger, refresh } = useSync();

  const onRetry = async () => {
    await trigger();
    await refresh();
  };

  const onDelete = (id: string) => {
    Alert.alert('Delete pending delivery?', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await remove(id);
          await refresh();
        }
      }
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.statusBar}>
        <Ionicons
          name={online ? 'cloud-done-outline' : 'cloud-offline-outline'}
          size={20}
          color={online ? colors.success : colors.warning}
        />
        <Text style={styles.statusText}>
          {!online
            ? 'Offline — connect to sync'
            : syncing
            ? 'Syncing…'
            : pending.length === 0
            ? 'All synced'
            : `${pending.length} waiting`}
        </Text>
      </View>

      {online && pending.length > 0 && (
        <TouchableOpacity
          style={styles.retryButton}
          onPress={onRetry}
          disabled={syncing}
          activeOpacity={0.85}
        >
          <Ionicons name="refresh" size={16} color={colors.white} />
          <Text style={styles.retryText}>{syncing ? 'Syncing…' : 'Retry now'}</Text>
        </TouchableOpacity>
      )}

      <FlatList
        data={pending}
        keyExtractor={(item) => item.client_request_id}
        contentContainerStyle={{ padding: spacing.lg }}
        ListEmptyComponent={<Text style={styles.empty}>Nothing pending.</Text>}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.top}>
              <Text style={styles.name}>{item.farmer_name}</Text>
              <Text style={styles.weight}>{formatKg(item.weight_kg)}</Text>
            </View>
            <Text style={styles.meta}>
              {item.farmer_code} · {formatDateTime(item.created_at)}
            </Text>
            {item.error ? <Text style={styles.error}>{item.error}</Text> : null}
            <View style={styles.actions}>
              {item.status === 'failed' && (
                <TouchableOpacity
                  style={styles.actionBtn}
                  onPress={() => onDelete(item.client_request_id)}
                >
                  <Ionicons name="trash-outline" size={16} color={colors.danger} />
                  <Text style={styles.actionText}>Delete</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.gray[50] },
  statusBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.white,
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200]
  },
  statusText: { fontSize: fontSize.md, color: colors.gray[800], fontWeight: '500' },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary[600],
    margin: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radius.md
  },
  retryText: { color: colors.white, fontSize: fontSize.sm, fontWeight: '600' },
  empty: { textAlign: 'center', color: colors.gray[400], fontStyle: 'italic', marginTop: spacing.xl },
  card: {
    backgroundColor: colors.white,
    padding: spacing.lg,
    borderRadius: radius.md,
    marginBottom: spacing.md
  },
  top: { flexDirection: 'row', justifyContent: 'space-between' },
  name: { fontSize: fontSize.md, fontWeight: '600', color: colors.gray[800] },
  weight: { fontSize: fontSize.md, color: colors.primary[700], fontWeight: '600' },
  meta: { fontSize: fontSize.xs, color: colors.gray[500], marginTop: 2 },
  error: { fontSize: fontSize.xs, color: colors.danger, marginTop: spacing.sm },
  actions: { flexDirection: 'row', marginTop: spacing.sm },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs
  },
  actionText: { fontSize: fontSize.sm, color: colors.danger, fontWeight: '500' }
});