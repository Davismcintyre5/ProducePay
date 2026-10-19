import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import * as paymentApi from '../../api/payment';
import { formatKes, formatKg, formatDateTime } from '../../lib/format';
import { colors, spacing, fontSize, radius } from '../../theme';

export default function PaymentDetail() {
  const route = useRoute<any>();
  const { id } = route.params;

  const { data, isLoading } = useQuery({
    queryKey: ['payments', id],
    queryFn: () => paymentApi.get(id)
  });

  const payment = data?.data?.payment;

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text style={styles.muted}>Loading…</Text>
      </View>
    );
  }

  if (!payment) {
    return (
      <View style={styles.container}>
        <Text style={styles.muted}>Payment not found.</Text>
      </View>
    );
  }

  const delivery = typeof payment.delivery === 'object' ? payment.delivery : null;

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: spacing.lg }}>
      <View style={styles.card}>
        <Row label="Receipt" value={payment.receiptNo} mono />
        <Row label="Farmer" value={payment.farmerSnapshot?.name} />
        <Row label="Farmer code" value={payment.farmerSnapshot?.code} mono />
        {delivery ? <Row label="Weight" value={formatKg(delivery.weightKg)} /> : null}
        {delivery ? <Row label="Rate" value={`${formatKes(delivery.ratePerKg)}/kg`} /> : null}
        <Row label="Amount" value={formatKes(payment.amountKes)} strong />
        <Row label="Status" value={payment.status} />
        {payment.method ? <Row label="Method" value={payment.method} /> : null}
        {payment.reference ? <Row label="Reference" value={payment.reference} mono /> : null}
        <Row label="Created" value={formatDateTime(payment.createdAt)} />
        {payment.paidAt ? <Row label="Paid on" value={formatDateTime(payment.paidAt)} /> : null}
      </View>
    </ScrollView>
  );
}

function Row({
  label,
  value,
  strong,
  mono
}: {
  label: string;
  value?: string;
  strong?: boolean;
  mono?: boolean;
}) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text
        style={[
          styles.rowValue,
          strong && styles.rowStrong,
          mono && { fontFamily: 'monospace', fontSize: fontSize.sm }
        ]}
      >
        {value || '—'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.gray[50] },
  card: { backgroundColor: colors.white, borderRadius: radius.md, padding: spacing.lg },
  row: {
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100]
  },
  rowLabel: {
    fontSize: fontSize.xs,
    color: colors.gray[500],
    textTransform: 'uppercase',
    marginBottom: 4
  },
  rowValue: { fontSize: fontSize.md, color: colors.gray[800] },
  rowStrong: { fontSize: fontSize.xl, color: colors.primary[700], fontWeight: '700' },
  muted: { textAlign: 'center', marginTop: spacing.xl, color: colors.gray[400] }
});