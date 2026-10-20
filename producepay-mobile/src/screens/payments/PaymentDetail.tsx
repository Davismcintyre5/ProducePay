import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import * as paymentApi from '../../api/payment';
import { useAuth } from '../../hooks/useAuth';
import { formatKes, formatKg, formatDateTime } from '../../lib/format';
import { colors, spacing, fontSize, radius } from '../../theme';

export default function PaymentDetail() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { id } = route.params;
  const queryClient = useQueryClient();
  const { hasRole } = useAuth();

  const [method, setMethod] = useState('MPESA');
  const [reference, setReference] = useState('');
  const [cancelReason, setCancelReason] = useState('');
  const [showCancel, setShowCancel] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['payments', id],
    queryFn: () => paymentApi.get(id)
  });

  const markPaidMutation = useMutation({
    mutationFn: () => paymentApi.markPaid(id, { method, reference }),
    onSuccess: () => {
      Alert.alert('Success', 'Payment marked as paid.');
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
    onError: (err: any) => Alert.alert('Error', err?.response?.data?.error?.message || 'Failed to mark paid.')
  });

  const cancelMutation = useMutation({
    mutationFn: () => paymentApi.cancel(id, { reason: cancelReason }),
    onSuccess: () => {
      Alert.alert('Success', 'Payment cancelled.');
      setShowCancel(false);
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
    onError: (err: any) => Alert.alert('Error', err?.response?.data?.error?.message || 'Failed to cancel.')
  });

  if (isLoading || !data?.data?.payment) {
    return <View style={styles.container}><ActivityIndicator size="large" color={colors.primary[600]} style={{ marginTop: 40 }} /></View>;
  }

  const payment = data.data.payment;
  const delivery = typeof payment.delivery === 'object' ? payment.delivery : null;

  const canMarkPaid = hasRole('MANAGER', 'ADMIN') && payment.status === 'PENDING';
  const canCancel = hasRole('ADMIN') && payment.status === 'PENDING';

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

      {canMarkPaid && (
        <View style={styles.actionCard}>
          <Text style={styles.actionTitle}>Mark as Paid</Text>
          
          <Text style={styles.label}>Method</Text>
          <View style={styles.methodRow}>
            {['MPESA', 'CASH', 'BANK'].map((m) => (
              <TouchableOpacity
                key={m}
                style={[styles.methodBtn, method === m && styles.methodBtnActive]}
                onPress={() => setMethod(m)}
              >
                <Text style={[styles.methodText, method === m && styles.methodTextActive]}>{m}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Reference</Text>
          <TextInput
            style={styles.input}
            value={reference}
            onChangeText={setReference}
            placeholder="Transaction code"
          />

          <TouchableOpacity
            style={[styles.primaryBtn, !reference.trim() && styles.disabledBtn]}
            onPress={() => markPaidMutation.mutate()}
            disabled={!reference.trim() || markPaidMutation.isPending}
          >
            {markPaidMutation.isPending ? <ActivityIndicator color={colors.white} /> : <Text style={styles.primaryBtnText}>Confirm Payment</Text>}
          </TouchableOpacity>
        </View>
      )}

      {canCancel && (
        <View style={[styles.actionCard, { marginTop: spacing.md }]}>
          {showCancel ? (
            <>
              <Text style={styles.actionTitle}>Cancel Payment</Text>
              <Text style={styles.label}>Reason</Text>
              <TextInput style={styles.input} value={cancelReason} onChangeText={setCancelReason} placeholder="Why are you cancelling?" />
              <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md }}>
                <TouchableOpacity style={[styles.dangerBtn, { flex: 1 }]} onPress={() => cancelMutation.mutate()} disabled={!cancelReason.trim()}>
                  <Text style={styles.primaryBtnText}>Confirm Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.secondaryBtn, { flex: 1 }]} onPress={() => setShowCancel(false)}>
                  <Text style={styles.secondaryBtnText}>Back</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <TouchableOpacity style={styles.secondaryBtn} onPress={() => setShowCancel(true)}>
              <Ionicons name="close-circle-outline" size={18} color={colors.danger} />
              <Text style={[styles.secondaryBtnText, { color: colors.danger }]}>Cancel this payment</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </ScrollView>
  );
}

function Row({ label, value, strong, mono }: any) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={[styles.rowValue, strong && styles.rowStrong, mono && { fontFamily: 'monospace' }]}>
        {value || '—'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.gray[50] },
  card: { backgroundColor: colors.white, borderRadius: radius.md, padding: spacing.lg, marginBottom: spacing.md },
  row: { paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.gray[100] },
  rowLabel: { fontSize: fontSize.xs, color: colors.gray[500], textTransform: 'uppercase', marginBottom: 4 },
  rowValue: { fontSize: fontSize.md, color: colors.gray[800] },
  rowStrong: { fontSize: fontSize.xl, color: colors.primary[700], fontWeight: '700' },
  actionCard: { backgroundColor: colors.white, borderRadius: radius.md, padding: spacing.lg },
  actionTitle: { fontSize: fontSize.md, fontWeight: '700', color: colors.gray[800], marginBottom: spacing.md },
  label: { fontSize: fontSize.sm, color: colors.gray[600], marginTop: spacing.sm, marginBottom: 4 },
  methodRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.sm },
  methodBtn: { flex: 1, paddingVertical: spacing.sm, alignItems: 'center', borderWidth: 1, borderColor: colors.gray[300], borderRadius: radius.sm },
  methodBtnActive: { borderColor: colors.primary[600], backgroundColor: colors.primary[50] },
  methodText: { fontSize: fontSize.xs, fontWeight: '600', color: colors.gray[600] },
  methodTextActive: { color: colors.primary[700] },
  input: { borderWidth: 1, borderColor: colors.gray[300], borderRadius: radius.sm, padding: spacing.md, fontSize: fontSize.md },
  primaryBtn: { backgroundColor: colors.primary[600], paddingVertical: spacing.md, borderRadius: radius.sm, alignItems: 'center', marginTop: spacing.lg },
  disabledBtn: { opacity: 0.5 },
  primaryBtnText: { color: colors.white, fontSize: fontSize.md, fontWeight: '600' },
  secondaryBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, borderWidth: 1, borderColor: colors.gray[300], paddingVertical: spacing.md, borderRadius: radius.sm },
  secondaryBtnText: { fontSize: fontSize.md, fontWeight: '600', color: colors.gray[700] },
  dangerBtn: { backgroundColor: colors.danger, paddingVertical: spacing.md, borderRadius: radius.sm, alignItems: 'center' },
});