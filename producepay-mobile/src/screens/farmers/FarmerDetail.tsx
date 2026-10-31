import React from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import * as farmerApi from '../../api/farmer';
import { formatKes, formatKg, formatPhone } from '../../lib/format';
import { colors, spacing, fontSize, radius } from '../../theme';

export default function FarmerDetail() {
  const route = useRoute<any>();
  const { id } = route.params;

  const { data, isLoading } = useQuery({
    queryKey: ['farmers', id, 'statement'],
    queryFn: () => farmerApi.statement(id),
  });

  if (isLoading) {
    return <View style={styles.container}><ActivityIndicator size="large" color={colors.primary[600]} style={{ marginTop: 40 }} /></View>;
  }

  const statement = data?.data;
  if (!statement) return null;

  const { farmer, summary } = statement;

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: spacing.lg }}>
      <View style={styles.card}>
        <Text style={styles.name}>{farmer.name}</Text>
        <Text style={styles.code}>{farmer.code}</Text>
        
        <View style={styles.infoRow}>
          <Text style={styles.label}>Phone</Text>
          <Text style={styles.value}>{formatPhone(farmer.phone)}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Location</Text>
          <Text style={styles.value}>{farmer.location}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Farm Size</Text>
          <Text style={styles.value}>{farmer.farmSizeAcres ? `${farmer.farmSizeAcres} acres` : '—'}</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Account Statement</Text>

      <View style={styles.grid}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Total Weight</Text>
          <Text style={styles.statValue}>{formatKg(summary.totalWeightKg)}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Total Paid</Text>
          <Text style={[styles.statValue, { color: colors.success }]}>{formatKes(summary.totalPaidKes)}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Outstanding</Text>
          <Text style={[styles.statValue, { color: colors.warning }]}>{formatKes(summary.outstandingKes)}</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.gray[50] },
  card: { backgroundColor: colors.white, padding: spacing.lg, borderRadius: radius.md, marginBottom: spacing.lg },
  name: { fontSize: fontSize.xl, fontWeight: '700', color: colors.gray[800] },
  code: { fontSize: fontSize.sm, fontFamily: 'monospace', color: colors.gray[500], marginBottom: spacing.md },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.sm, borderTopWidth: 1, borderTopColor: colors.gray[100] },
  label: { fontSize: fontSize.sm, color: colors.gray[500] },
  value: { fontSize: fontSize.sm, fontWeight: '500', color: colors.gray[800] },
  sectionTitle: { fontSize: fontSize.md, fontWeight: '700', color: colors.gray[700], marginBottom: spacing.md },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  statCard: { flex: 1, minWidth: '45%', backgroundColor: colors.white, padding: spacing.lg, borderRadius: radius.md },
  statLabel: { fontSize: fontSize.xs, color: colors.gray[500], textTransform: 'uppercase', marginBottom: 4 },
  statValue: { fontSize: fontSize.lg, fontWeight: '700', color: colors.gray[800] }
});