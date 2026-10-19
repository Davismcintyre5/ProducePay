import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as paymentApi from '../../api/payment';
import { useAuth } from '../../hooks/useAuth';
import { useSync } from '../../hooks/useSync';
import { formatKes, formatDateTime } from '../../lib/format';
import { colors, spacing, fontSize, radius } from '../../theme';

export default function Home() {
  const { user } = useAuth();
  const navigation = useNavigation<any>();
  const { pending, online } = useSync();

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['payments', 'recent'],
    queryFn: () => paymentApi.list({ limit: 5 })
  });

  const payments = data?.data ?? [];

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={isRefetching}
          onRefresh={refetch}
          tintColor={colors.primary[600]}
        />
      }
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

      <TouchableOpacity
        style={styles.primaryAction}
        onPress={() => navigation.navigate('Deliveries', { screen: 'NewDelivery' })}
        activeOpacity={0.85}
      >
        <Ionicons name="add-circle-outline" size={28} color={colors.white} />
        <View style={{ flex: 1 }}>
          <Text style={styles.actionTitle}>Record Delivery</Text>
          <Text style={styles.actionSubtitle}>Log maize collected from a farmer</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.white} />
      </TouchableOpacity>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Payments</Text>
        {isLoading ? (
          <Text style={styles.muted}>Loading…</Text>
        ) : payments.length === 0 ? (
          <Text style={styles.muted}>No payments recorded yet.</Text>
        ) : (
          payments.map((p) => (
            <TouchableOpacity
              key={p.id}
              style={styles.row}
              onPress={() =>
                navigation.navigate('Payments', {
                  screen: 'PaymentDetail',
                  params: { id: p.id }
                })
              }
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.rowTitle}>{p.farmerSnapshot?.name}</Text>
                <Text style={styles.rowSubtitle}>
                  {p.receiptNo} · {formatDateTime(p.createdAt)}
                </Text>
              </View>
              <Text style={styles.rowAmount}>{formatKes(p.amountKes)}</Text>
            </TouchableOpacity>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.gray[50] },
  header: {
    padding: spacing.xl,
    backgroundColor: colors.primary[800],
    borderBottomLeftRadius: radius.lg,
    borderBottomRightRadius: radius.lg
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
    margin: spacing.lg,
    borderRadius: radius.md
  },
  offlineText: { color: colors.warning, fontSize: fontSize.sm, fontWeight: '500' },
  pendingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary[600],
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radius.md
  },
  pendingText: { color: colors.white, fontSize: fontSize.sm, fontWeight: '500', flex: 1 },
  primaryAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.primary[600],
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    padding: spacing.lg,
    borderRadius: radius.md
  },
  actionTitle: { color: colors.white, fontSize: fontSize.md, fontWeight: '600' },
  actionSubtitle: { color: colors.primary[100], fontSize: fontSize.xs, marginTop: 2 },
  section: {
    backgroundColor: colors.white,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    borderRadius: radius.md,
    padding: spacing.lg
  },
  sectionTitle: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.gray[800],
    marginBottom: spacing.md
  },
  muted: { color: colors.gray[400], fontSize: fontSize.sm, fontStyle: 'italic' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.gray[100]
  },
  rowTitle: { fontSize: fontSize.md, color: colors.gray[800], fontWeight: '500' },
  rowSubtitle: { fontSize: fontSize.xs, color: colors.gray[500], marginTop: 2 },
  rowAmount: { fontSize: fontSize.md, color: colors.primary[700], fontWeight: '700' }
});