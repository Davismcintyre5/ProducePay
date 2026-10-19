import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../hooks/useAuth';
import { useSync } from '../../hooks/useSync';
import { formatPhone } from '../../lib/format';
import { colors, spacing, fontSize, radius } from '../../theme';

export default function Profile() {
  const navigation = useNavigation<any>();
  const { user, logout } = useAuth();
  const { pending, online } = useSync();

  const handleLogout = () => {
    Alert.alert('Log out', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log out', style: 'destructive', onPress: () => logout() }
    ]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: spacing.lg }}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {(user?.fullName || user?.username || '?').charAt(0).toUpperCase()}
          </Text>
        </View>
        <Text style={styles.name}>{user?.fullName || user?.username}</Text>
        <Text style={styles.role}>{user?.role}</Text>
      </View>

      <View style={styles.card}>
        <InfoRow label="Email" value={user?.email ?? '—'} />
        <InfoRow label="Phone" value={formatPhone(user?.phone)} />
      </View>

      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('SyncStatus')}
        activeOpacity={0.7}
      >
        <View style={styles.linkRow}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
            <Ionicons name="cloud-upload-outline" size={20} color={colors.primary[600]} />
            <Text style={styles.linkLabel}>Sync status</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
            <Text style={styles.linkValue}>
              {!online ? 'Offline' : pending.length > 0 ? `${pending.length} pending` : 'All synced'}
            </Text>
            <Ionicons name="chevron-forward" size={18} color={colors.gray[400]} />
          </View>
        </View>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.card, styles.logout]} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={20} color={colors.danger} />
        <Text style={styles.logoutText}>Log out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.gray[50] },
  header: { alignItems: 'center', paddingVertical: spacing.xl },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary[600],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md
  },
  avatarText: { color: colors.white, fontSize: 32, fontWeight: '700' },
  name: { fontSize: fontSize.xl, fontWeight: '700', color: colors.gray[800] },
  role: { fontSize: fontSize.sm, color: colors.gray[500], marginTop: 2 },
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: spacing.lg,
    marginBottom: spacing.md
  },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.sm },
  infoLabel: { fontSize: fontSize.sm, color: colors.gray[500] },
  infoValue: { fontSize: fontSize.sm, color: colors.gray[800], fontWeight: '500' },
  linkRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  linkLabel: { fontSize: fontSize.md, color: colors.gray[800] },
  linkValue: { fontSize: fontSize.sm, color: colors.gray[500] },
  logout: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  logoutText: { fontSize: fontSize.md, color: colors.danger, fontWeight: '600' }
});