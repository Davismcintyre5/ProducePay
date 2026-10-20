import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, TextInput, ActivityIndicator, Alert } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import * as userApi from '../../api/user';
import { formatPhone } from '../../lib/format';
import { colors, spacing, fontSize, radius } from '../../theme';
import type { User } from '../../types';

export default function Users() {
  const queryClient = useQueryClient();
  const [modalVisible, setModalVisible] = useState(false);
  
  // Form State
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'CLERK' | 'MANAGER' | 'ADMIN'>('CLERK');

  const { data, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: () => userApi.list({ limit: 50 }),
  });

  const createMutation = useMutation({
    mutationFn: (payload: any) => userApi.create(payload),
    onSuccess: () => {
      Alert.alert('Success', 'User created successfully.');
      setModalVisible(false);
      queryClient.invalidateQueries({ queryKey: ['users'] });
      // Reset form
      setUsername(''); setFullName(''); setEmail(''); setPhone(''); setPassword(''); setRole('CLERK');
    },
    onError: (err: any) => Alert.alert('Error', err?.response?.data?.error?.message || 'Failed to create user')
  });

  const removeMutation = useMutation({
    mutationFn: (id: string) => userApi.remove(id),
    onSuccess: () => {
      Alert.alert('Success', 'User deactivated.');
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (err: any) => Alert.alert('Error', err?.response?.data?.error?.message || 'Failed to deactivate')
  });

  const handleCreate = () => {
    if (!username || !fullName || !email || !phone || !password) {
      Alert.alert('Missing fields', 'Please fill all fields.');
      return;
    }
    createMutation.mutate({ username, fullName, email, phone, password, role });
  };

  const confirmDelete = (id: string, name: string) => {
    Alert.alert('Deactivate User', `Are you sure you want to deactivate ${name}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Deactivate', style: 'destructive', onPress: () => removeMutation.mutate(id) }
    ]);
  };

  const users = data?.data || [];

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.addBtn} onPress={() => setModalVisible(true)}>
        <Ionicons name="add" size={20} color={colors.white} />
        <Text style={styles.addBtnText}>Add User</Text>
      </TouchableOpacity>

      {isLoading ? (
        <ActivityIndicator size="large" color={colors.primary[600]} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={users}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: spacing.lg }}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.rowHeader}>
                <View>
                  <Text style={styles.name}>{item.fullName}</Text>
                  <Text style={styles.sub}>@{item.username}</Text>
                </View>
                <View style={[styles.badge, item.role === 'ADMIN' ? styles.badgeAdmin : null]}>
                  <Text style={styles.badgeText}>{item.role}</Text>
                </View>
              </View>
              <Text style={styles.contact}>{item.email}</Text>
              <Text style={styles.contact}>{formatPhone(item.phone)}</Text>
              
              <TouchableOpacity style={styles.deleteBtn} onPress={() => confirmDelete(item.id, item.fullName)}>
                <Ionicons name="trash-outline" size={16} color={colors.danger} />
                <Text style={styles.deleteText}>Deactivate</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}

      {/* Add User Modal */}
      <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add New User</Text>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Ionicons name="close" size={24} color={colors.gray[500]} />
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Full Name</Text>
          <TextInput style={styles.input} value={fullName} onChangeText={setFullName} placeholder="John Doe" />

          <Text style={styles.label}>Username</Text>
          <TextInput style={styles.input} value={username} onChangeText={setUsername} autoCapitalize="none" placeholder="johndoe" />

          <Text style={styles.label}>Email</Text>
          <TextInput style={styles.input} value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" placeholder="john@example.com" />

          <Text style={styles.label}>Phone</Text>
          <TextInput style={styles.input} value={phone} onChangeText={setPhone} keyboardType="phone-pad" placeholder="0712345678" />

          <Text style={styles.label}>Password</Text>
          <TextInput style={styles.input} value={password} onChangeText={setPassword} secureTextEntry placeholder="Min 8 characters" />

          <Text style={styles.label}>Role</Text>
          <View style={styles.roleRow}>
            {['CLERK', 'MANAGER', 'ADMIN'].map((r) => (
              <TouchableOpacity
                key={r}
                style={[styles.roleBtn, role === r && styles.roleBtnActive]}
                onPress={() => setRole(r as any)}
              >
                <Text style={[styles.roleText, role === r && styles.roleTextActive]}>{r}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={styles.saveBtn} onPress={handleCreate} disabled={createMutation.isPending}>
            {createMutation.isPending ? <ActivityIndicator color={colors.white} /> : <Text style={styles.saveText}>Create User</Text>}
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.gray[50] },
  addBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, backgroundColor: colors.primary[600], margin: spacing.lg, paddingVertical: spacing.md, borderRadius: radius.md },
  addBtnText: { color: colors.white, fontSize: fontSize.md, fontWeight: '600' },
  card: { backgroundColor: colors.white, padding: spacing.lg, borderRadius: radius.md, marginBottom: spacing.md },
  rowHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.sm },
  name: { fontSize: fontSize.md, fontWeight: '600', color: colors.gray[800] },
  sub: { fontSize: fontSize.xs, color: colors.gray[500] },
  badge: { backgroundColor: colors.gray[200], paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: radius.full },
  badgeAdmin: { backgroundColor: colors.primary[100] },
  badgeText: { fontSize: fontSize.xs, fontWeight: '700', color: colors.gray[700] },
  contact: { fontSize: fontSize.sm, color: colors.gray[500], marginTop: 2 },
  deleteBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: spacing.md, alignSelf: 'flex-start' },
  deleteText: { fontSize: fontSize.sm, color: colors.danger, fontWeight: '500' },
  
  modalContainer: { flex: 1, backgroundColor: colors.white, padding: spacing.lg },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.lg, marginTop: spacing.md },
  modalTitle: { fontSize: fontSize.xl, fontWeight: '700', color: colors.gray[800] },
  label: { fontSize: fontSize.sm, color: colors.gray[600], marginTop: spacing.md, marginBottom: 4 },
  input: { borderWidth: 1, borderColor: colors.gray[300], borderRadius: radius.sm, padding: spacing.md, fontSize: fontSize.md },
  roleRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.xs },
  roleBtn: { flex: 1, paddingVertical: spacing.sm, alignItems: 'center', borderWidth: 1, borderColor: colors.gray[300], borderRadius: radius.md },
  roleBtnActive: { borderColor: colors.primary[600], backgroundColor: colors.primary[50] },
  roleText: { fontSize: fontSize.xs, fontWeight: '600', color: colors.gray[600] },
  roleTextActive: { color: colors.primary[700] },
  saveBtn: { backgroundColor: colors.primary[600], paddingVertical: spacing.lg, borderRadius: radius.md, alignItems: 'center', marginTop: spacing.xl },
  saveText: { color: colors.white, fontSize: fontSize.md, fontWeight: '600' },
});