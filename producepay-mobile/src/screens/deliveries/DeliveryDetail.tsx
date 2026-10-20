import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import * as deliveryApi from '../../api/delivery';
import { useAuth } from '../../hooks/useAuth';
import { formatKes, formatKg, formatDateTime } from '../../lib/format';
import { colors, spacing, fontSize, radius } from '../../theme';

export default function DeliveryDetail() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { id } = route.params;
  const queryClient = useQueryClient();
  const { hasRole } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [weight, setWeight] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['deliveries', id],
    queryFn: () => deliveryApi.get(id)
  });

  const updateMutation = useMutation({
    mutationFn: (newWeight: number) => deliveryApi.update(id, { weightKg: newWeight }),
    onSuccess: () => {
      Alert.alert('Success', 'Delivery updated.');
      setIsEditing(false);
      queryClient.invalidateQueries({ queryKey: ['deliveries', id] });
      queryClient.invalidateQueries({ queryKey: ['deliveries'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
    onError: (err: any) => Alert.alert('Error', err?.response?.data?.error?.message || 'Failed to update.')
  });

  const deleteMutation = useMutation({
    mutationFn: () => deliveryApi.remove(id),
    onSuccess: () => {
      Alert.alert('Success', 'Delivery deleted.');
      queryClient.invalidateQueries({ queryKey: ['deliveries'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      navigation.goBack();
    },
    onError: (err: any) => Alert.alert('Error', err?.response?.data?.error?.message || 'Failed to delete.')
  });

  const handleUpdate = () => {
    const w = Number(weight);
    if (!w || w <= 0) return Alert.alert('Invalid Weight', 'Enter a weight greater than 0.');
    updateMutation.mutate(w);
  };

  const confirmDelete = () => {
    Alert.alert('Delete Delivery', 'Are you sure you want to delete this delivery?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteMutation.mutate() }
    ]);
  };

  if (isLoading || !data?.data?.delivery) {
    return <View style={styles.container}><ActivityIndicator size="large" color={colors.primary[600]} style={{ marginTop: 40 }} /></View>;
  }

  const delivery = data.data.delivery;
  const canEdit = hasRole('MANAGER', 'ADMIN');

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: spacing.lg }}>
      
      <View style={styles.card}>
        <Row label="Code" value={delivery.code} mono />
        <Row label="Farmer" value={delivery.farmerSnapshot.name} />
        <Row label="Farmer code" value={delivery.farmerSnapshot.code} mono />
        
        {isEditing ? (
          <View style={{ paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.gray[100] }}>
            <Text style={styles.rowLabel}>Weight (kg)</Text>
            <TextInput
              style={styles.input}
              value={weight}
              onChangeText={setWeight}
              keyboardType="decimal-pad"
              autoFocus
            />
            <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm }}>
              <TouchableOpacity style={[styles.primaryBtn, { flex: 1, marginTop: 0 }]} onPress={handleUpdate} disabled={updateMutation.isPending}>
                <Text style={styles.primaryBtnText}>Save</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.secondaryBtn, { flex: 1 }]} onPress={() => setIsEditing(false)}>
                <Text style={styles.secondaryBtnText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View style={{ flex: 1 }}>
              <Row label="Weight" value={formatKg(delivery.weightKg)} />
            </View>
            {canEdit && (
              <TouchableOpacity onPress={() => { setWeight(String(delivery.weightKg)); setIsEditing(true); }} style={{ padding: spacing.sm }}>
                <Ionicons name="pencil" size={16} color={colors.primary[600]} />
              </TouchableOpacity>
            )}
          </View>
        )}

        <Row label="Rate" value={`${formatKes(delivery.ratePerKg)}/kg`} />
        <Row label="Total" value={formatKes(delivery.totalKes)} strong />
        <Row label="Collected" value={formatDateTime(delivery.collectedAt)} />
        {delivery.notes ? <Row label="Notes" value={delivery.notes} /> : null}
      </View>

      {canEdit && (
        <TouchableOpacity style={styles.deleteBtn} onPress={confirmDelete} disabled={deleteMutation.isPending}>
          <Ionicons name="trash-outline" size={20} color={colors.danger} />
          <Text style={styles.deleteText}>Delete Delivery</Text>
        </TouchableOpacity>
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
  input: { borderWidth: 1, borderColor: colors.gray[300], borderRadius: radius.sm, padding: spacing.md, fontSize: fontSize.md, marginTop: 4 },
  primaryBtn: { backgroundColor: colors.primary[600], paddingVertical: spacing.md, borderRadius: radius.sm, alignItems: 'center' },
  primaryBtnText: { color: colors.white, fontSize: fontSize.md, fontWeight: '600' },
  secondaryBtn: { borderWidth: 1, borderColor: colors.gray[300], paddingVertical: spacing.md, borderRadius: radius.sm, alignItems: 'center' },
  secondaryBtnText: { fontSize: fontSize.md, fontWeight: '600', color: colors.gray[700] },
  deleteBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, backgroundColor: '#fee2e2', paddingVertical: spacing.lg, borderRadius: radius.md },
  deleteText: { color: colors.danger, fontSize: fontSize.md, fontWeight: '600' },
});