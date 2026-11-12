import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { homeTheme as theme } from '../../../theme/homeTheme';
import { ADMIN_DEMO_PROFILE } from '../data/mockAdminData';
import { useAdminDemo } from '../state/AdminDemoContext';
import { AdminButton, AdminConfirmModal, AdminDemoLabel, AdminPageTitle, AdminPanel } from '../components/AdminUI';

export function AdminProfileScreen({ onLogout }: { onLogout: () => void }) {
  const { settings } = useAdminDemo();
  const [confirmLogout, setConfirmLogout] = useState(false);
  return (
    <ScrollView contentContainerStyle={styles.root} showsVerticalScrollIndicator={false}>
      <AdminPageTitle title="Admin profile" subtitle="Preview account and restaurant details." action={<AdminDemoLabel />} />
      <AdminPanel style={styles.profileCard}>
        <View style={styles.avatar}><Text style={styles.avatarText}>RK</Text></View>
        <View style={styles.profileCopy}>
          <Text style={styles.name}>{ADMIN_DEMO_PROFILE.name}</Text>
          <Text style={styles.muted}>{ADMIN_DEMO_PROFILE.email}</Text>
          <Text style={styles.muted}>Demo restaurant administrator</Text>
        </View>
      </AdminPanel>
      <AdminPanel>
        <Text style={styles.section}>Restaurant information</Text>
        <Detail icon="restaurant-outline" label="Restaurant" value={settings.name} />
        <Detail icon="location-outline" label="Address" value={settings.address} />
        <Detail icon="call-outline" label="Contact" value={settings.phone} />
        <Detail icon="time-outline" label="Hours" value={settings.openingHours} last />
      </AdminPanel>
      <Pressable onPress={() => setConfirmLogout(true)} accessibilityRole="button" style={styles.logout}>
        <Ionicons name="log-out-outline" size={18} color="#8B3D35" />
        <Text style={styles.logoutText}>Exit Admin preview</Text>
      </Pressable>
      <Text style={styles.note}>This local preview uses fictional data. It does not sign in an Admin or connect to Firebase.</Text>
      <AdminConfirmModal visible={confirmLogout} title="Exit Admin preview?" message="You will return to Developer Tools. Demo changes will be reset for the next preview session." confirmLabel="Exit preview" onCancel={() => setConfirmLogout(false)} onConfirm={() => { setConfirmLogout(false); onLogout(); }} />
    </ScrollView>
  );
}

function Detail({ icon, label, value, last }: { icon: React.ComponentProps<typeof Ionicons>['name']; label: string; value: string; last?: boolean }) {
  return <View style={[styles.detail, last && styles.lastDetail]}><Ionicons name={icon} size={17} color={theme.primary} /><View style={styles.detailCopy}><Text style={styles.label}>{label}</Text><Text style={styles.value}>{value}</Text></View></View>;
}

const styles = StyleSheet.create({
  root: { flex: 1, padding: 16 },
  profileCard: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  avatar: { width: 58, height: 58, borderRadius: 29, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.primary },
  avatarText: { color: theme.card, fontSize: 17, fontWeight: '900' },
  profileCopy: { flex: 1 },
  name: { color: theme.text, fontSize: 15, fontWeight: '800' },
  muted: { color: theme.muted, fontSize: 11, marginTop: 4 },
  section: { color: theme.text, fontSize: 13, fontWeight: '800', marginBottom: 8 },
  detail: { flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 52, borderTopWidth: 1, borderTopColor: theme.border },
  lastDetail: { borderBottomWidth: 0 },
  detailCopy: { flex: 1 },
  label: { color: theme.muted, fontSize: 9, fontWeight: '700' },
  value: { color: theme.text, fontSize: 11, fontWeight: '600', marginTop: 3 },
  logout: { minHeight: 46, alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, borderWidth: 1, borderColor: '#E4C4B9', borderRadius: 11, backgroundColor: '#F5E1DD' },
  logoutText: { color: '#8B3D35', fontSize: 12, fontWeight: '800' },
  note: { color: theme.muted, fontSize: 10, lineHeight: 15, marginTop: 4 },
});
