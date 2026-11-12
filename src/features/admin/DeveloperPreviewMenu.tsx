import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { homeTheme as theme } from '../../theme/homeTheme';
import { ADMIN_DEMO_PROFILE } from './data/mockAdminData';
import { AdminButton, AdminPanel, AdminPreviewIndicator } from './components/AdminUI';

export function DeveloperPreviewMenu({ onOpenAdmin, onExit }: { onOpenAdmin: () => void; onExit: () => void }) {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right', 'bottom']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.brandRow}>
          <View style={styles.brandIcon}><Ionicons name="restaurant" size={25} color={theme.card} /></View>
          <View>
            <Text style={styles.brand}>DESI BITES</Text>
            <Text style={styles.brandCaption}>DEVELOPER TOOLS</Text>
          </View>
        </View>

        <AdminPreviewIndicator />
        <Text style={styles.title}>Development preview</Text>
        <Text style={styles.subtitle}>Open the Admin frontend with a fictional local session. This preview does not sign in with Firebase or change real restaurant data.</Text>

        <AdminPanel style={styles.sessionPanel}>
          <View style={styles.avatar}><Text style={styles.avatarText}>RK</Text></View>
          <View style={styles.sessionCopy}>
            <Text style={styles.sessionTitle}>Mock Admin session</Text>
            <Text style={styles.sessionName}>{ADMIN_DEMO_PROFILE.name}</Text>
            <Text style={styles.sessionEmail}>{ADMIN_DEMO_PROFILE.email}</Text>
            <Text style={styles.sessionNote}>Fictional identity · development only</Text>
          </View>
        </AdminPanel>

        <AdminButton label="Open Admin Preview" onPress={onOpenAdmin} tone="primary" icon="grid-outline" />

        <View style={styles.infoRow}>
          <Ionicons name="information-circle-outline" size={19} color={theme.primary} />
          <Text style={styles.infoText}>Demo changes are held locally and reset when you exit the Admin preview.</Text>
        </View>

        <AdminButton label="Exit developer tools" onPress={onExit} tone="quiet" icon="arrow-back-outline" />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.background },
  content: { flexGrow: 1, width: '100%', maxWidth: 640, alignSelf: 'center', justifyContent: 'center', padding: 22, gap: 16 },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 },
  brandIcon: { width: 50, height: 50, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.primary },
  brand: { color: theme.text, fontSize: 19, fontWeight: '900', letterSpacing: 1.4 },
  brandCaption: { color: theme.muted, fontSize: 9, fontWeight: '800', letterSpacing: 1.3, marginTop: 3 },
  title: { color: theme.text, fontSize: 28, fontWeight: '900', marginTop: 2 },
  subtitle: { color: theme.muted, fontSize: 14, lineHeight: 21, marginTop: -8 },
  sessionPanel: { flexDirection: 'row', alignItems: 'center', gap: 14, marginTop: 2, marginBottom: 0 },
  avatar: { width: 54, height: 54, borderRadius: 27, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.primary },
  avatarText: { color: theme.card, fontSize: 17, fontWeight: '900' },
  sessionCopy: { flex: 1, minWidth: 0 },
  sessionTitle: { color: theme.primary, fontSize: 10, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.8 },
  sessionName: { color: theme.text, fontSize: 15, fontWeight: '800', marginTop: 4 },
  sessionEmail: { color: theme.muted, fontSize: 11, marginTop: 2 },
  sessionNote: { color: theme.muted, fontSize: 10, marginTop: 5 },
  infoRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 9, paddingHorizontal: 2 },
  infoText: { flex: 1, color: theme.muted, fontSize: 11, lineHeight: 16 },
});
