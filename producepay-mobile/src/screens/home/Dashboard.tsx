import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as reportApi from '../../api/report';
import { useAuth } from '../../hooks/useAuth';
import { useSync } from '../../hooks/useSync';
import { formatKes, formatKg, formatDateTime } from '../../lib/format';
import { colors, spacing, fontSize, radius } from '../../theme';

export default function Dashboard() {
  const { user, hasRole } = useAuth() as any;
  const navigation = useNavigation<any>();
  const { pending, online } = useSync();

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['dashboard'],
    queryFn: reportApi.dashboard,
  });

  const stats = data?.data?.stats || {};
  const recent = data?.data?.recentDeliveries || [];
  const isManager = hasRole('ADMIN', 'MANAGER');

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.primary[600]} />}
    >
      <View style={styles.header}>
        <Text style={styles.welcome}>Welcome back</Text>
        <Text style={styles.name}>{user?.fullName || user?.username}</Text>
        <Text style={styles.role}>{user?.role}</Text>
      </View>

      {!online && (
        <View style={styles.offlineBanner}>
          <Ionicons name="cloud-offline-outline" size={16} color={colors.warning} />
          <Text style={styles.offlineText}>Offline — changes will sync later</Text>
        </View>
      )}

      {pending.length > 0 && (
        <TouchableOpacity
          style={styles.pendingBanner}
          onPress={() => navigation.navigate('Profile', { screen: 'SyncStatus' })}
        >
          <Ionicons name="sync-outline" size={16} color={colors.white} />
          <Text style={styles.pendingText}>
            {pending.length} pending {pending.length === 1 ? 'delivery' : 'deliveries'} — tap to view
          </Text>
        </TouchableOpacity>
      )}

      <View style={styles.grid}>
        <StatCard title="Farmers" value={stats.totalFarmers ?? 0} icon="people" />
        <StatCard title="Deliveries" value={stats.totalDeliveries ?? 0} icon="cube" />
        <StatCard title="Weight" value={formatKg(stats.totalWeightKg ?? 0)} icon="scale" />
        <StatCard title="Paid" value={formatKes(stats.totalPaidKes ?? 0)} icon="cash" />
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: colors.primary[600] }]}
          onPress={() => navigation.navigate('Deliveries', { screen: 'NewDelivery' })}
        >
          <Ionicons name="add-circle" size={20} color={colors.white} />
          <Text style={[styles.actionText, { color: colors.white }]}>Record Delivery</Text>
        </TouchableOpacity>

        {isManager && (
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.gray[300] }]}
            onPress={() => navigation.navigate('Reports')}
          >
            <Ionicons name="bar-chart" size={20} color={colors.primary[700]} />
            <Text style={[styles.actionText, { color: colors.primary[700] }]}>View Reports</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Deliveries</Text>
        {isLoading ? (
          <Text style={styles.muted}>Loading…</Text>
        ) : recent.length === 0 ? (
          <Text style={styles.muted}>No deliveries recorded yet.</Text>
        ) : (
          recent.map((d: any) => (
            <View key={d.id} style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={styles.rowTitle}>{d.farmerSnapshot?.name}</Text>
                <Text style={styles.rowSubtitle}>
                  {d.code} · {formatDateTime(d.collectedAt)}
                </Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.rowAmount}>{formatKes(d.totalKes)}</Text>
                <Text style={styles.rowWeight}>{formatKg(d.weightKg)}</Text>
              </View>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

function StatCard({ title, value, icon }: any) {
  return (
    <View style={styles.statCard}>
      <Ionicons name={icon} size={20} color={colors.primary[600]} style={{ marginBottom: spacing.xs }} />
      <Text style={styles.statValue} numberOfLines={1}>{value}</Text>
      <Text style={styles.statLabel}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.gray[50] },
  header: {
    padding: spacing.xl,
    backgroundColor: colors.primary[800],
    borderBottomLeftRadius: radius.lg,
    borderBottomRightRadius: radius.lg,
    marginBottom: spacing.md,
  },
  welcome: { color: colors.primary[200], fontSize: fontSize.sm },
  name: { color: colors.white, fontSize: fontSize.xl, fontWeight: '700', marginTop: 2 },
  role: { color: colors.primary[200], fontSize: fontSize.sm, marginTop: 2 },
  offlineBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: '#fff8e1',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    borderRadius: radius.md,
  },
  offlineText: { color: colors.warning, fontSize: fontSize.sm, fontWeight: '500' },
  pendingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary[600],
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
  },
  pendingText: { color: colors.white, fontSize: fontSize.sm, fontWeight: '500', flex: 1 },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.white,
    padding: spacing.lg,
    borderRadius: radius.md,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statValue: { fontSize: fontSize.lg, fontWeight: '700', color: colors.gray[800], marginBottom: 2 },
  statLabel: { fontSize: fontSize.xs, color: colors.gray[500] },
  actions: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
  },
  actionText: { fontSize: fontSize.md, fontWeight: '600' },
  section: {
    backgroundColor: colors.white,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.xl,
    borderRadius: radius.md,
    padding: spacing.lg,
  },
  sectionTitle: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.gray[800],
    marginBottom: spacing.md,
  },
  muted: { color: colors.gray[400], fontSize: fontSize.sm, fontStyle: 'italic' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.gray[100],
  },
  rowTitle: { fontSize: fontSize.md, color: colors.gray[800], fontWeight: '500' },
  rowSubtitle: { fontSize: fontSize.xs, color: colors.gray[500], marginTop: 2 },
  rowAmount: { fontSize: fontSize.md, color: colors.primary[700], fontWeight: '700' },
  rowWeight: { fontSize: fontSize.xs, color: colors.gray[500], marginTop: 2 },
});