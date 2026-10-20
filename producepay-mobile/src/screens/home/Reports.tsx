import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import * as reportApi from '../../api/report';
import { formatKes, formatKg, formatDate } from '../../lib/format';
import { colors, spacing, fontSize, radius } from '../../theme';

export default function Reports() {
  const { data, isLoading } = useQuery({
    queryKey: ['reports', 'weekly'],
    queryFn: reportApi.weekly,
  });

  if (isLoading) {
    return <View style={styles.container}><Text style={styles.muted}>Loading…</Text></View>;
  }

  const r = data?.data;
  if (!r) return null;

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: spacing.lg }}>
      <View style={styles.card}>
        <Text style={styles.title}>Current Week</Text>
        <Text style={styles.dateRange}>
          {formatDate(r.weekFrom)} – {formatDate(r.weekTo)}
        </Text>
        
        <View style={styles.row}>
          <Text style={styles.label}>Deliveries</Text>
          <Text style={styles.value}>{r.deliveries}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Total Weight</Text>
          <Text style={styles.value}>{formatKg(r.weightKg)}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Total Payments</Text>
          <Text style={styles.valueHighlight}>{formatKes(r.totalKes)}</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.exportBtn}
        onPress={() => Alert.alert('Export CSV', 'This feature is available on the web dashboard.')}
      >
        <Ionicons name="download-outline" size={20} color={colors.primary[700]} />
        <Text style={styles.exportText}>Export Full CSV</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.gray[50] },
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  title: { fontSize: fontSize.xl, fontWeight: '700', color: colors.gray[800] },
  dateRange: { fontSize: fontSize.sm, color: colors.gray[500], marginBottom: spacing.lg },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.gray[100],
  },
  label: { fontSize: fontSize.md, color: colors.gray[600] },
  value: { fontSize: fontSize.lg, fontWeight: '600', color: colors.gray[800] },
  valueHighlight: { fontSize: fontSize.xl, fontWeight: '700', color: colors.primary[700] },
  exportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.white,
    paddingVertical: spacing.lg,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  exportText: { fontSize: fontSize.md, fontWeight: '600', color: colors.primary[700] },
  muted: { textAlign: 'center', marginTop: spacing.xl, color: colors.gray[400] },
});