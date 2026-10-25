import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { toast } from 'sonner';
import * as backupApi from '../../api/backup';
import { formatDateTime } from '../../lib/format';
import { colors, spacing, fontSize, radius } from '../../theme';
import type { BackupRecord } from '../../api/backup';

export default function Backups() {
  const queryClient = useQueryClient();
  const [downloading, setDownloading] = useState<string | null>(null);

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['backups'],
    queryFn: backupApi.list
  });

  const createMutation = useMutation({
    mutationFn: backupApi.create,
    onSuccess: () => {
      Alert.alert('Success', 'Backup created and uploaded to cloud.');
      queryClient.invalidateQueries({ queryKey: ['backups'] });
    },
    onError: (err: any) => Alert.alert('Error', err?.response?.data?.error?.message || 'Failed to create backup')
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => backupApi.remove(id),
    onSuccess: () => {
      Alert.alert('Success', 'Backup deleted.');
      queryClient.invalidateQueries({ queryKey: ['backups'] });
    },
    onError: (err: any) => Alert.alert('Error', err?.response?.data?.error?.message || 'Failed to delete backup')
  });

  const handleDownload = async (backup: BackupRecord) => {
    try {
      setDownloading(backup.id);
      const fileUri = `${FileSystem.documentDirectory}${backup.filename}`;
      
      const { uri } = await FileSystem.downloadAsync(backup.cloudinaryUrl, fileUri);
      
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: 'application/json',
          dialogTitle: 'Save Backup File'
        });
      } else {
        Alert.alert('Downloaded', `Saved to: ${uri}`);
      }
    } catch (err: any) {
      Alert.alert('Download Failed', err.message);
    } finally {
      setDownloading(null);
    }
  };

  const confirmDelete = (id: string, filename: string) => {
    Alert.alert('Delete Backup', `Are you sure you want to delete ${filename}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteMutation.mutate(id) }
    ]);
  };

  const backups = data?.data?.backups || [];

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.createBtn}
        onPress={() => createMutation.mutate()}
        disabled={createMutation.isPending}
      >
        {createMutation.isPending ? (
          <ActivityIndicator color={colors.white} />
        ) : (
          <>
            <Ionicons name="cloud-upload" size={20} color={colors.white} />
            <Text style={styles.createBtnText}>Create Backup Now</Text>
          </>
        )}
      </TouchableOpacity>

      {isLoading ? (
        <ActivityIndicator size="large" color={colors.primary[600]} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={backups}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: spacing.lg }}
          refreshing={isRefetching}
          onRefresh={refetch}
          ListEmptyComponent={<Text style={styles.empty}>No backups created yet.</Text>}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.header}>
                <Text style={styles.filename} numberOfLines={1}>{item.filename}</Text>
                <View style={[styles.badge, item.type === 'auto' ? styles.badgeAuto : styles.badgeManual]}>
                  <Text style={styles.badgeText}>{item.type.toUpperCase()}</Text>
                </View>
              </View>
              
              <Text style={styles.meta}>
                {(item.sizeBytes / 1024 / 1024).toFixed(2)} MB • {formatDateTime(item.createdAt)}
              </Text>

              <View style={styles.actions}>
                <TouchableOpacity 
                  style={styles.actionBtn} 
                  onPress={() => handleDownload(item)}
                  disabled={downloading === item.id}
                >
                  {downloading === item.id ? (
                    <ActivityIndicator size="small" color={colors.primary[600]} />
                  ) : (
                    <>
                      <Ionicons name="download-outline" size={18} color={colors.primary[600]} />
                      <Text style={styles.actionText}>Download</Text>
                    </>
                  )}
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.actionBtn} 
                  onPress={() => confirmDelete(item.id, item.filename)}
                >
                  <Ionicons name="trash-outline" size={18} color={colors.danger} />
                  <Text style={[styles.actionText, { color: colors.danger }]}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.gray[50] },
  createBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary[600],
    margin: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radius.md
  },
  createBtnText: { color: colors.white, fontSize: fontSize.md, fontWeight: '600' },
  empty: { textAlign: 'center', color: colors.gray[400], fontStyle: 'italic', marginTop: spacing.xl },
  card: {
    backgroundColor: colors.white,
    padding: spacing.lg,
    borderRadius: radius.md,
    marginBottom: spacing.md
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.xs },
  filename: { flex: 1, fontSize: fontSize.sm, fontWeight: '600', color: colors.gray[800], fontFamily: 'monospace' },
  badge: { paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: radius.full, marginLeft: spacing.sm },
  badgeAuto: { backgroundColor: '#e3f2fd' },
  badgeManual: { backgroundColor: colors.primary[100] },
  badgeText: { fontSize: fontSize.xs, fontWeight: '700', color: colors.gray[700] },
  meta: { fontSize: fontSize.xs, color: colors.gray[500], marginTop: 2 },
  actions: { flexDirection: 'row', gap: spacing.lg, marginTop: spacing.md, borderTopWidth: 1, borderTopColor: colors.gray[100], paddingTop: spacing.md },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  actionText: { fontSize: fontSize.sm, fontWeight: '600', color: colors.primary[600] }
});