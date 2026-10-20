import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as settingsApi from '../../api/settings';
import { colors, spacing, fontSize, radius } from '../../theme';
import type { Settings as SettingsType } from '../../types';

export default function Settings() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<SettingsType | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: settingsApi.get,
  });

  useEffect(() => {
    if (data?.data?.settings) {
      setForm(data.data.settings);
    }
  }, [data]);

  const mutation = useMutation({
    mutationFn: (payload: Partial<SettingsType>) => settingsApi.update(payload),
    onSuccess: () => {
      Alert.alert('Success', 'Settings saved successfully.');
      queryClient.invalidateQueries({ queryKey: ['settings'] });
    },
    onError: (err: any) => {
      Alert.alert('Error', err?.response?.data?.error?.message || 'Failed to save settings.');
    }
  });

  if (isLoading || !form) {
    return <View style={styles.container}><ActivityIndicator size="large" color={colors.primary[600]} style={{ marginTop: 40 }} /></View>;
  }

  const handleChange = (section: keyof SettingsType, key: string, value: any) => {
    setForm((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        [section]: {
          ...prev[section],
          [key]: value
        }
      };
    });
  };

  const onSubmit = () => {
    mutation.mutate(form);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: spacing.lg }}>
      
      {/* Organisation */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Organisation</Text>
        
        <Text style={styles.label}>Name</Text>
        <TextInput style={styles.input} value={form.organisation.orgName} onChangeText={(v) => handleChange('organisation', 'orgName', v)} />
        
        <Text style={styles.label}>Phone</Text>
        <TextInput style={styles.input} value={form.organisation.phone} onChangeText={(v) => handleChange('organisation', 'phone', v)} keyboardType="phone-pad" />
        
        <Text style={styles.label}>Email</Text>
        <TextInput style={styles.input} value={form.organisation.email} onChangeText={(v) => handleChange('organisation', 'email', v)} keyboardType="email-address" autoCapitalize="none" />
      </View>

      {/* Business */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Business Rules</Text>
        
        <Text style={styles.label}>Rate per kg (KES)</Text>
        <TextInput style={styles.input} value={String(form.business.ratePerKg)} onChangeText={(v) => handleChange('business', 'ratePerKg', Number(v) || 0)} keyboardType="numeric" />
        
        <Text style={styles.label}>Max Delivery Weight (kg)</Text>
        <TextInput style={styles.input} value={String(form.business.maxDeliveryWeightKg)} onChangeText={(v) => handleChange('business', 'maxDeliveryWeightKg', Number(v) || 0)} keyboardType="numeric" />
      </View>

      <TouchableOpacity style={styles.saveBtn} onPress={onSubmit} disabled={mutation.isPending}>
        {mutation.isPending ? <ActivityIndicator color={colors.white} /> : <Text style={styles.saveText}>Save Changes</Text>}
      </TouchableOpacity>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.gray[50] },
  card: { backgroundColor: colors.white, borderRadius: radius.md, padding: spacing.lg, marginBottom: spacing.lg },
  sectionTitle: { fontSize: fontSize.md, fontWeight: '700', color: colors.primary[800], marginBottom: spacing.md, textTransform: 'uppercase' },
  label: { fontSize: fontSize.sm, color: colors.gray[600], marginTop: spacing.sm, marginBottom: 4 },
  input: { borderWidth: 1, borderColor: colors.gray[300], borderRadius: radius.sm, padding: spacing.md, fontSize: fontSize.md, color: colors.gray[900] },
  saveBtn: { backgroundColor: colors.primary[600], paddingVertical: spacing.lg, borderRadius: radius.md, alignItems: 'center', marginBottom: spacing.xl },
  saveText: { color: colors.white, fontSize: fontSize.md, fontWeight: '600' },
});