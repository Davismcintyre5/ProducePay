import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, 
  RefreshControl, Modal, KeyboardAvoidingView, Platform, ScrollView, Alert, ActivityIndicator 
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as farmerApi from '../../api/farmer';
import { formatPhone } from '../../lib/format';
import { colors, spacing, fontSize, radius } from '../../theme';

export default function FarmerList() {
  const navigation = useNavigation<any>();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [modalVisible, setModalVisible] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [location, setLocation] = useState('');
  const [farmSize, setFarmSize] = useState('');

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['farmers', search],
    queryFn: () => farmerApi.list({ q: search, limit: 50 }),
  });

  const createMutation = useMutation({
    mutationFn: (payload: any) => farmerApi.create(payload),
    onSuccess: () => {
      Alert.alert('Success', 'Farmer registered successfully.');
      setModalVisible(false);
      queryClient.invalidateQueries({ queryKey: ['farmers'] });
      // Reset form
      setName(''); setPhone(''); setEmail(''); setLocation(''); setFarmSize('');
    },
    onError: (err: any) => {
      const details = err?.response?.data?.error?.details;
      if (details && details.length > 0) {
        Alert.alert('Validation Error', `${details[0].field}: ${details[0].issue}`);
      } else {
        Alert.alert('Error', err?.response?.data?.error?.message || 'Failed to register farmer');
      }
    }
  });

  const handleCreate = () => {
    if (!name || !phone || !location) {
      Alert.alert('Missing fields', 'Name, phone, and location are required.');
      return;
    }
    
    const phoneRegex = /^(\+?254|0)\d{9}$/;
    if (!phoneRegex.test(phone.replace(/\s+/g, ''))) {
      Alert.alert('Invalid Phone', 'Please use a valid Kenyan number (e.g., 0712345678).');
      return;
    }

    createMutation.mutate({
      name: name.trim(),
      phone: phone.replace(/\s+/g, '').trim(),
      email: email.trim() || undefined,
      location: location.trim(),
      farmSizeAcres: farmSize ? Number(farmSize) : undefined
    });
  };

  const farmers = data?.data || [];

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={colors.gray[400]} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name, code or phone..."
          placeholderTextColor={colors.gray[400]}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {isLoading ? (
        <ActivityIndicator size="large" color={colors.primary[600]} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={farmers}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: spacing.lg, paddingBottom: 80 }}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
          ListEmptyComponent={<Text style={styles.empty}>No farmers found.</Text>}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => navigation.navigate('FarmerDetail', { id: item.id })}
              activeOpacity={0.7}
            >
              <View style={styles.header}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.code}>{item.code}</Text>
              </View>
              <Text style={styles.meta}>{formatPhone(item.phone)}</Text>
              <Text style={styles.meta}>{item.location}</Text>
              <View style={styles.footer}>
                <Text style={styles.farmSize}>{item.farmSizeAcres ? `${item.farmSizeAcres} acres` : 'Size not set'}</Text>
                <Ionicons name="chevron-forward" size={16} color={colors.gray[400]} />
              </View>
            </TouchableOpacity>
          )}
        />
      )}

      {/* Floating Action Button */}
      <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
        <Ionicons name="add" size={28} color={colors.white} />
      </TouchableOpacity>

      {/* Add Farmer Modal */}
      <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet">
        <KeyboardAvoidingView 
          style={{ flex: 1, backgroundColor: colors.white }} 
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView contentContainerStyle={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Register Farmer</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={28} color={colors.gray[500]} />
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>Full Name *</Text>
            <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="David Ruto" placeholderTextColor={colors.gray[400]} />

            <Text style={styles.label}>Phone Number *</Text>
            <TextInput style={styles.input} value={phone} onChangeText={setPhone} keyboardType="phone-pad" placeholder="0712345678" placeholderTextColor={colors.gray[400]} />

            <Text style={styles.label}>Location *</Text>
            <TextInput style={styles.input} value={location} onChangeText={setLocation} placeholder="Moiben" placeholderTextColor={colors.gray[400]} />

            <Text style={styles.label}>Email (Optional)</Text>
            <TextInput style={styles.input} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" placeholder="david@gmail.com" placeholderTextColor={colors.gray[400]} />

            <Text style={styles.label}>Farm Size in Acres (Optional)</Text>
            <TextInput style={styles.input} value={farmSize} onChangeText={setFarmSize} keyboardType="decimal-pad" placeholder="2.5" placeholderTextColor={colors.gray[400]} />

            <TouchableOpacity style={styles.saveBtn} onPress={handleCreate} disabled={createMutation.isPending}>
              {createMutation.isPending ? <ActivityIndicator color={colors.white} /> : <Text style={styles.saveText}>Register Farmer</Text>}
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.gray[50] },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white, margin: spacing.lg, marginBottom: 0, paddingHorizontal: spacing.md, borderRadius: radius.md, borderWidth: 1, borderColor: colors.gray[200] },
  searchIcon: { marginRight: spacing.sm },
  searchInput: { flex: 1, paddingVertical: spacing.md, fontSize: fontSize.md, color: colors.gray[800] },
  empty: { textAlign: 'center', marginTop: spacing.xl, color: colors.gray[400], fontStyle: 'italic' },
  card: { backgroundColor: colors.white, padding: spacing.lg, borderRadius: radius.md, marginBottom: spacing.md },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  name: { fontSize: fontSize.md, fontWeight: '600', color: colors.gray[800] },
  code: { fontSize: fontSize.xs, fontFamily: 'monospace', color: colors.gray[500], backgroundColor: colors.gray[100], paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  meta: { fontSize: fontSize.sm, color: colors.gray[500], marginTop: 2 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.md, borderTopWidth: 1, borderTopColor: colors.gray[100], paddingTop: spacing.sm },
  farmSize: { fontSize: fontSize.xs, color: colors.primary[600], fontWeight: '500' },
  fab: { position: 'absolute', bottom: spacing.xl, right: spacing.xl, width: 60, height: 60, borderRadius: 30, backgroundColor: colors.primary[600], justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 6 },
  modalContainer: { padding: spacing.lg, paddingBottom: spacing.xxl },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.lg, marginTop: spacing.md },
  modalTitle: { fontSize: fontSize.xl, fontWeight: '700', color: colors.gray[800] },
  label: { fontSize: fontSize.sm, fontWeight: '600', color: colors.gray[700], marginTop: spacing.md, marginBottom: 6 },
  input: { borderWidth: 1, borderColor: colors.gray[300], borderRadius: radius.md, paddingHorizontal: spacing.md, paddingVertical: spacing.md, fontSize: fontSize.md, color: colors.gray[900], backgroundColor: colors.gray[50] },
  saveBtn: { backgroundColor: colors.primary[600], paddingVertical: spacing.lg, borderRadius: radius.md, alignItems: 'center', marginTop: spacing.xl },
  saveText: { color: colors.white, fontSize: fontSize.md, fontWeight: '700' }
});