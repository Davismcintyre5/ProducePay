import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as deliveryApi from '../../api/delivery';
import { useSync } from '../../hooks/useSync';
import { formatKes, formatKg, formatDateTime } from '../../lib/format';
import { colors, spacing, fontSize, radius } from '../../theme';

export default function DeliveryList() {
  const navigation = useNavigation<any>();
  const { pending } = useSync();

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['deliveries', 'today'],
    queryFn: () => deliveryApi.list({ limit: 50 })
  });

  const deliveries = data?.data ?? [];

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('NewDelivery')}
        activeOpacity={0.85}
      >
        <Ionicons name="add-circle" size={22} color={colors.white} />
        <Text style={styles.addText}>Record New Delivery</Text>
      </TouchableOpacity>

      {pending.length > 0 && (
        <View style={styles.pendingBox}>
          <Ionicons name="time-outline" size={16} color={colors.warning} />
          <Text style={styles.pendingText}>
            {pending.length} waiting to sync
          </Text>
        </View>
      )}

      {isLoading ? (
        <Text style={styles.muted}>Loading…</Text>
      ) : (
        <FlatList
          data={deliveries}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: spacing.xl }}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              tintColor={colors.primary[600]}
            />
          }
          ListEmptyComponent={
            <Text style={styles.empty}>No deliveries yet.</Text>
          }
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.code}>{item.code}</Text>
                <Text style={styles.farmer}>{item.farmerSnapshot.name}</Text>
              </View>
              <View style={styles.cardRow}>
                <Text style={styles.meta}>{formatKg(item.weightKg)}</Text>
                <Text style={styles.meta}>{formatKes(item.totalKes)}</Text>
              </View>
              <Text style={styles.date}>{formatDateTime(item.collectedAt)}</Text>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.gray[50], padding: spacing.lg },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary[600],
    paddingVertical: spacing.lg,
    borderRadius: radius.md,
    marginBottom: spacing.md
  },
  addText: { color: colors.white, fontSize: fontSize.md, fontWeight: '600' },
  pendingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: '#fff8e1',
    padding: spacing.md,
    borderRadius: radius.md,
    marginBottom: spacing.md
  },
  pendingText: { color: colors.warning, fontSize: fontSize.sm, fontWeight: '500' },
  muted: { color: colors.gray[400], textAlign: 'center', marginTop: spacing.xl },
  empty: { color: colors.gray[400], textAlign: 'center', marginTop: spacing.xl, fontStyle: 'italic' },
  card: {
    backgroundColor: colors.white,
    padding: spacing.lg,
    borderRadius: radius.md,
    marginBottom: spacing.md
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  code: { fontSize: fontSize.xs, color: colors.gray[500], fontFamily: 'monospace' },
  farmer: { fontSize: fontSize.md, fontWeight: '600', color: colors.gray[800] },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.sm
  },
  meta: { fontSize: fontSize.md, color: colors.primary[700], fontWeight: '500' },
  date: { fontSize: fontSize.xs, color: colors.gray[400], marginTop: spacing.xs }
});