import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as paymentApi from '../../api/payment';
import { formatKes, formatDate } from '../../lib/format';
import { colors, spacing, fontSize, radius } from '../../theme';

function statusColor(status: string) {
  switch (status) {
    case 'PAID': return colors.success;
    case 'PENDING': return colors.warning;
    case 'FAILED': return colors.danger;
    default: return colors.gray[400];
  }
}

export default function PaymentList() {
  const navigation = useNavigation<any>();

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['payments'],
    queryFn: () => paymentApi.list({ limit: 50 })
  });

  const payments = data?.data ?? [];

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text style={styles.muted}>Loading…</Text>
      </View>
    );
  }

  return (
    <FlatList
      style={styles.container}
      data={payments}
      keyExtractor={(item) => item.id}
      contentContainerStyle={{ padding: spacing.lg }}
      refreshControl={
        <RefreshControl
          refreshing={isRefetching}
          onRefresh={refetch}
          tintColor={colors.primary[600]}
        />
      }
      ListEmptyComponent={<Text style={styles.empty}>No payments yet.</Text>}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate('PaymentDetail', { id: item.id })}
          activeOpacity={0.7}
        >
          <View style={styles.top}>
            <Text style={styles.receipt}>{item.receiptNo}</Text>
            <View style={[styles.badge, { backgroundColor: statusColor(item.status) + '20' }]}>
              <Text style={[styles.badgeText, { color: statusColor(item.status) }]}>
                {item.status}
              </Text>
            </View>
          </View>
          <Text style={styles.farmer}>{item.farmerSnapshot?.name}</Text>
          <View style={styles.bottom}>
            <Text style={styles.amount}>{formatKes(item.amountKes)}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
              <Text style={styles.date}>{formatDate(item.createdAt)}</Text>
              <Ionicons name="chevron-forward" size={16} color={colors.gray[400]} />
            </View>
          </View>
        </TouchableOpacity>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.gray[50] },
  muted: { textAlign: 'center', marginTop: spacing.xl, color: colors.gray[400] },
  empty: {
    textAlign: 'center',
    marginTop: spacing.xl,
    color: colors.gray[400],
    fontStyle: 'italic'
  },
  card: {
    backgroundColor: colors.white,
    padding: spacing.lg,
    borderRadius: radius.md,
    marginBottom: spacing.md
  },
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  receipt: { fontSize: fontSize.xs, color: colors.gray[500], fontFamily: 'monospace' },
  badge: { paddingHorizontal: spacing.sm, paddingVertical: 3, borderRadius: radius.full },
  badgeText: { fontSize: fontSize.xs, fontWeight: '600' },
  farmer: { fontSize: fontSize.md, fontWeight: '500', color: colors.gray[800], marginTop: spacing.sm },
  bottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm
  },
  amount: { fontSize: fontSize.lg, color: colors.primary[700], fontWeight: '700' },
  date: { fontSize: fontSize.xs, color: colors.gray[400] }
});