import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import * as deliveryApi from '../../api/delivery';
import { formatKes, formatKg, formatDateTime } from '../../lib/format';
import { colors, spacing, fontSize, radius } from '../../theme';

export default function DeliveryDetail() {
  const route = useRoute<any>();
  const { id } = route.params;

  const { data, isLoading } = useQuery({
    queryKey: ['deliveries', id],
    queryFn: () => deliveryApi.get(id)
  });

  const delivery = data?.data?.delivery;

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text style={styles.muted}>Loading…</Text>
      </View>
    );
  }

  if (!delivery) {
    return (
      <View style={styles.container}>
        <Text style={styles.muted}>Delivery not found.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: spacing.lg }}>
      <View style={styles.card}>
        <Row label="Code" value={delivery.code} mono />
        <Row label="Farmer" value={delivery.farmerSnapshot.name} />
        <Row label="Farmer code" value={delivery.farmerSnapshot.code} mono />
        <Row label="Weight" value={formatKg(delivery.weightKg)} />
        <Row label="Rate" value={`${formatKes(delivery.ratePerKg)}/kg`} />
        <Row label="Total" value={formatKes(delivery.totalKes)} strong />
        <Row label="Collected" value={formatDateTime(delivery.collectedAt)} />
        {delivery.notes ? <Row label="Notes" value={delivery.notes} /> : null}
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
  value: string;
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
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.gray[50] },
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: spacing.lg
  },
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