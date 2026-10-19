import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  FlatList
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import * as farmerApi from '../../api/farmer';
import * as settingsApi from '../../api/settings';
import { search as searchCache, replaceAll as replaceCache } from '../../db/farmers.repo';
import { ratePerKg as cachedRate, save as saveSettings } from '../../db/settings.repo';
import { insert as insertOutbox } from '../../db/outbox.repo';
import { useSync } from '../../hooks/useSync';
import { uuid, formatKes } from '../../lib/format';
import { colors, spacing, fontSize, radius } from '../../theme';
import type { CachedFarmer } from '../../db/farmers.repo';

export default function NewDelivery() {
  const navigation = useNavigation<any>();
  const { trigger, online } = useSync();

  const [farmerSearch, setFarmerSearch] = useState('');
  const [selected, setSelected] = useState<CachedFarmer | null>(null);
  const [weight, setWeight] = useState('');
  const [notes, setNotes] = useState('');
  const [rate, setRate] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [cachedFarmers, setCachedFarmers] = useState<CachedFarmer[]>([]);

  const { data: settingsData } = useQuery({
    queryKey: ['settings'],
    queryFn: settingsApi.get
  });

  useEffect(() => {
    (async () => {
      const cached = await cachedRate();
      if (cached !== null) setRate(cached);
      if (settingsData?.data?.settings) {
        await saveSettings(settingsData.data.settings);
        setRate(settingsData.data.settings.business.ratePerKg);
      }
    })();
  }, [settingsData]);

  useEffect(() => {
    (async () => {
      if (online && settingsData === undefined) return;
      const results = await searchCache(farmerSearch);
      setCachedFarmers(results);
    })();
  }, [farmerSearch, online, settingsData]);

  const refreshCache = async () => {
    if (!online) return;
    try {
      const res = await farmerApi.list({ limit: 500, q: '' });
      const farmers = res.data ?? [];
      await replaceCache(farmers);
      const results = await searchCache(farmerSearch);
      setCachedFarmers(results);
    } catch {
      // ignore — use cache
    }
  };

  useEffect(() => {
    refreshCache();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const weightNum = Number(weight);
  const total = rate && weightNum > 0 ? weightNum * rate : 0;

  const onSubmit = async () => {
    if (!selected) {
      Alert.alert('Select a farmer');
      return;
    }
    if (!weightNum || weightNum <= 0) {
      Alert.alert('Invalid weight', 'Enter a weight greater than zero.');
      return;
    }

    setSubmitting(true);
    try {
      const clientRequestId = uuid();
      const now = new Date().toISOString();

      await insertOutbox({
        client_request_id: clientRequestId,
        farmer_id: selected.id,
        farmer_code: selected.code,
        farmer_name: selected.name,
        farmer_phone: selected.phone ?? null,
        weight_kg: weightNum,
        collected_at: now,
        notes: notes.trim() || null,
        status: 'pending',
        error: null,
        attempt_count: 0,
        created_at: now,
        synced_at: null
      });

      await trigger();

      Alert.alert('Saved', 'Delivery recorded. It will sync when online.', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (err: any) {
      Alert.alert('Save failed', err?.message || 'Could not save delivery.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: spacing.lg }}>
      <Text style={styles.label}>Farmer</Text>

      {selected ? (
        <View style={styles.selectedCard}>
          <View style={{ flex: 1 }}>
            <Text style={styles.selectedName}>{selected.name}</Text>
            <Text style={styles.selectedMeta}>
              {selected.code} · {selected.phone}
            </Text>
          </View>
          <TouchableOpacity onPress={() => setSelected(null)}>
            <Ionicons name="close-circle" size={22} color={colors.gray[400]} />
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <TextInput
            style={styles.input}
            value={farmerSearch}
            onChangeText={setFarmerSearch}
            placeholder="Search by name, code or phone"
            placeholderTextColor={colors.gray[400]}
          />
          <View style={styles.results}>
            {cachedFarmers.length === 0 ? (
              <Text style={styles.muted}>
                {online ? 'No matches.' : 'Offline — no cached farmers.'}
              </Text>
            ) : (
              cachedFarmers.slice(0, 8).map((f) => (
                <TouchableOpacity
                  key={f.id}
                  style={styles.resultRow}
                  onPress={() => {
                    setSelected(f);
                    setFarmerSearch('');
                  }}
                >
                  <Text style={styles.resultName}>{f.name}</Text>
                  <Text style={styles.resultMeta}>
                    {f.code} · {f.phone}
                  </Text>
                </TouchableOpacity>
              ))
            )}
          </View>
        </>
      )}

      <Text style={[styles.label, { marginTop: spacing.lg }]}>Weight (kg)</Text>
      <TextInput
        style={styles.input}
        value={weight}
        onChangeText={setWeight}
        keyboardType="decimal-pad"
        placeholder="150"
        placeholderTextColor={colors.gray[400]}
      />

      <Text style={styles.label}>Notes (optional)</Text>
      <TextInput
        style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
        value={notes}
        onChangeText={setNotes}
        multiline
        placeholder="Optional"
        placeholderTextColor={colors.gray[400]}
      />

      {rate !== null && weightNum > 0 && (
        <View style={styles.totalBox}>
          <Text style={styles.totalLabel}>Rate</Text>
          <Text style={styles.totalValue}>{formatKes(rate)}/kg</Text>
          <Text style={[styles.totalLabel, { marginTop: spacing.sm }]}>Total</Text>
          <Text style={styles.totalAmount}>{formatKes(total)}</Text>
        </View>
      )}

      <TouchableOpacity
        style={[styles.submit, submitting && { opacity: 0.6 }]}
        onPress={onSubmit}
        disabled={submitting}
        activeOpacity={0.85}
      >
        {submitting ? (
          <ActivityIndicator color={colors.white} />
        ) : (
          <Text style={styles.submitText}>Save Delivery</Text>
        )}
      </TouchableOpacity>

      {!online && (
        <Text style={styles.offlineNote}>
          You are offline. The delivery will sync automatically when connected.
        </Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  label: { fontSize: fontSize.sm, fontWeight: '600', color: colors.gray[700] },
  input: {
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: fontSize.md,
    color: colors.gray[900],
    marginTop: spacing.sm,
    backgroundColor: colors.white
  },
  results: { marginTop: spacing.sm },
  muted: { color: colors.gray[400], fontStyle: 'italic', padding: spacing.md },
  resultRow: {
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100]
  },
  resultName: { fontSize: fontSize.md, color: colors.gray[800], fontWeight: '500' },
  resultMeta: { fontSize: fontSize.xs, color: colors.gray[500], marginTop: 2 },
  selectedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    backgroundColor: colors.primary[50],
    borderRadius: radius.md,
    marginTop: spacing.sm,
    borderWidth: 1,
    borderColor: colors.primary[200]
  },
  selectedName: { fontSize: fontSize.md, color: colors.primary[800], fontWeight: '600' },
  selectedMeta: { fontSize: fontSize.xs, color: colors.primary[700], marginTop: 2 },
  totalBox: {
    marginTop: spacing.lg,
    padding: spacing.lg,
    backgroundColor: colors.gray[50],
    borderRadius: radius.md
  },
  totalLabel: { fontSize: fontSize.sm, color: colors.gray[500] },
  totalValue: { fontSize: fontSize.md, color: colors.gray[800], fontWeight: '500' },
  totalAmount: { fontSize: fontSize.xl, color: colors.primary[700], fontWeight: '700' },
  submit: {
    backgroundColor: colors.primary[600],
    paddingVertical: spacing.lg,
    borderRadius: radius.md,
    alignItems: 'center',
    marginTop: spacing.xl
  },
  submitText: { color: colors.white, fontSize: fontSize.lg, fontWeight: '600' },
  offlineNote: {
    marginTop: spacing.md,
    textAlign: 'center',
    fontSize: fontSize.sm,
    color: colors.warning
  }
});