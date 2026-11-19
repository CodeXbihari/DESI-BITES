import React, { useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useStaff } from './StaffContext';
import { errorMessage, initials, PinField, StaffButton, StaffField, StaffNotice, staffColors, staffStyles, StatusBadge } from './StaffUI';
import { deliveryCounts, generateDemoPin } from './staffDemo';
import type { PartnerDraft, StaffAccount } from './staffDemo';

type Partner = Omit<StaffAccount, 'pin'>;
type Editor = { kind: 'add' } | { kind: 'edit' | 'reset' | 'delete'; partner: Partner };
const filters = ['All', 'Active', 'Inactive'] as const;

export function DeliveryManagementScreen() {
  const { partners, orders, setPartnerActive } = useStaff();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<(typeof filters)[number]>('All');
  const [editor, setEditor] = useState<Editor | null>(null);
  const [notice, setNotice] = useState<{ message: string; error?: boolean } | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const query = search.trim().toLowerCase();
  const phoneQuery = query.replace(/[\s()-]/g, '');
  const visible = partners.filter(partner =>
    (filter === 'All' || partner.active === (filter === 'Active'))
    && (partner.name.toLowerCase().includes(query) || (phoneQuery && partner.phone.includes(phoneQuery)))
  );

  function saved(message: string) {
    setEditor(null);
    setNotice({ message });
    if (editor?.kind === 'add') { setFilter('All'); setSearch(''); }
  }

  async function toggle(partner: Partner, active: boolean) {
    setNotice(null);
    setUpdatingId(partner.id);
    try {
      await setPartnerActive(partner.id, active);
      setNotice({ message: active ? 'Delivery agent activated.' : 'Delivery agent deactivated.' });
    } catch (failure) { setNotice({ message: errorMessage(failure), error: true }); }
    finally { setUpdatingId(null); }
  }

  return (
    <ScrollView style={staffStyles.screen} contentContainerStyle={staffStyles.content} keyboardShouldPersistTaps="handled">
      <View style={styles.heading}>
        <View style={styles.headingText}>
          <Text style={staffStyles.eyebrow}>DESI BITES · ADMIN PANEL</Text>
          <Text accessibilityRole="header" style={staffStyles.title}>Delivery Management</Text>
          <Text style={staffStyles.muted}>Create delivery agent accounts and manage their access.</Text>
        </View>
        <StaffButton primary icon="add" label="Add Delivery Agent" onPress={() => { setNotice(null); setEditor({ kind: 'add' }); }} />
      </View>
      <StaffField label="Search delivery agents" placeholder="Search name or mobile number" value={search} onChangeText={setSearch} />
      <View style={staffStyles.row} accessibilityLabel="Filter delivery agents">
        {filters.map(value => <StaffButton key={value} label={value} primary={filter === value} onPress={() => setFilter(value)} />)}
      </View>
      {notice ? <StaffNotice message={notice.message} error={notice.error} /> : null}
      {visible.length ? visible.map(partner => {
        const counts = deliveryCounts(orders.filter(order => order.partnerId === partner.id));
        return (
          <View key={partner.id} style={staffStyles.card}>
            <View style={styles.heading}>
              <View style={staffStyles.row}>
                <View style={staffStyles.avatar}><Text style={staffStyles.avatarText}>{initials(partner.name)}</Text></View>
                <View style={styles.headingText}>
                  <Text style={staffStyles.sectionTitle}>{partner.name}</Text>
                  <Text style={staffStyles.muted}>{partner.phone}</Text>
                </View>
              </View>
              <StatusBadge label={partner.active ? 'Active' : 'Inactive'} active={partner.active} />
            </View>
            <View style={staffStyles.row}>
              <Text style={staffStyles.text}>{counts.assigned} assigned orders</Text>
              <Text style={staffStyles.muted}>·</Text>
              <Text style={staffStyles.text}>{counts.delivered} completed deliveries</Text>
            </View>
            <View style={styles.heading}>
              <View style={staffStyles.row}>
                <StaffButton label="Edit" onPress={() => setEditor({ kind: 'edit', partner })} />
                <StaffButton label="Reset PIN" onPress={() => setEditor({ kind: 'reset', partner })} />
                <StaffButton label="Delete" onPress={() => setEditor({ kind: 'delete', partner })} />
              </View>
              <View style={staffStyles.row}>
                <Text style={staffStyles.label}>{partner.active ? 'Deactivate' : 'Activate'}</Text>
                <Switch accessibilityLabel={`${partner.active ? 'Deactivate' : 'Activate'} ${partner.name}`} value={partner.active}
                  disabled={updatingId !== null} onValueChange={value => void toggle(partner, value)}
                  trackColor={{ false: staffColors.beige, true: staffColors.teal }} thumbColor={staffColors.ivory} />
              </View>
            </View>
          </View>
        );
      }) : (
        <View style={staffStyles.card}>
          <Text style={staffStyles.sectionTitle}>{partners.length ? 'No matching agents' : 'No delivery agents yet'}</Text>
          <Text style={staffStyles.muted}>{partners.length ? 'Try a different search or status filter.' : 'Add an agent and assign a six-digit PIN so they can sign in through the shared login.'}</Text>
        </View>
      )}
      {editor ? <PartnerEditor editor={editor} onCancel={() => setEditor(null)} onSaved={saved} /> : null}
    </ScrollView>
  );
}

function PartnerEditor({ editor, onCancel, onSaved }: { editor: Editor; onCancel: () => void; onSaved: (message: string) => void }) {
  const { savePartner, resetPartnerPin, deletePartner } = useStaff();
  const partner = editor.kind === 'add' ? undefined : editor.partner;
  const [draft, setDraft] = useState<PartnerDraft>({ name: partner?.name ?? '', phone: partner?.phone ?? '', pin: '', active: partner?.active ?? true });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const form = editor.kind === 'add' || editor.kind === 'edit';
  const showPin = editor.kind === 'add' || editor.kind === 'reset';
  const titles = { add: 'Add Delivery Agent', edit: 'Edit Delivery Agent', reset: 'Reset Login PIN', delete: 'Delete Delivery Agent?' };

  async function submit() {
    if (busy) return;
    setError('');
    setBusy(true);
    try {
      switch (editor.kind) {
        case 'add':
        case 'edit':
          await savePartner(draft, partner?.id);
          onSaved(editor.kind === 'add' ? 'Delivery agent added. They can now use the shared login when active.' : 'Delivery agent updated.');
          break;
        case 'reset':
          await resetPartnerPin(editor.partner.id, draft.pin);
          onSaved('Login PIN updated.');
          break;
        case 'delete':
          await deletePartner(editor.partner.id);
          onSaved('Delivery agent deleted.');
          break;
      }
    } catch (failure) { setError(errorMessage(failure)); }
    finally { setBusy(false); }
  }

  function update(patch: Partial<PartnerDraft>) {
    setDraft({ ...draft, ...patch });
    setError('');
  }

  return (
    <Modal visible transparent animationType="fade" onRequestClose={busy ? undefined : onCancel}>
      <SafeAreaView style={styles.overlay}>
        <KeyboardAvoidingView style={styles.modalFlex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.modalScroll}>
            <View accessibilityViewIsModal style={[staffStyles.card, styles.modalCard]}>
              <Text style={staffStyles.eyebrow}>DELIVERY MANAGEMENT</Text>
              <Text accessibilityRole="header" style={staffStyles.title}>{titles[editor.kind]}</Text>
              {editor.kind === 'delete' ? <Text style={staffStyles.text}>Remove {partner?.name}’s demo account? Their orders will lose the partner assignment.</Text> : null}
              {editor.kind === 'reset' ? <Text style={staffStyles.text}>Set a new PIN for {partner?.name}.</Text> : null}
              {form ? <>
                <StaffField label="Full Name" value={draft.name} onChangeText={name => update({ name })} maxLength={80} editable={!busy} />
                <StaffField label="Mobile Number" value={draft.phone} onChangeText={phone => update({ phone: phone.replace(/\D/g, '') })}
                  maxLength={10} keyboardType="number-pad" editable={!busy} />
              </> : null}
              {showPin ? <>
                <PinField label="6-Digit Login PIN" value={draft.pin} onChange={pin => update({ pin })} disabled={busy} />
                <View style={staffStyles.row}><StaffButton label="Generate Random PIN" onPress={() => update({ pin: generateDemoPin() })} disabled={busy} /></View>
              </> : null}
              {form ? <View style={staffStyles.row}>
                <Text style={staffStyles.label}>{draft.active ? 'Active' : 'Inactive'}</Text>
                <Switch accessibilityLabel="Delivery agent active" value={draft.active} onValueChange={active => update({ active })} disabled={busy}
                  trackColor={{ false: staffColors.beige, true: staffColors.teal }} thumbColor={staffColors.ivory} />
              </View> : null}
              {error ? <StaffNotice message={error} error /> : null}
              <View style={staffStyles.row}>
                <StaffButton label="Cancel" onPress={onCancel} disabled={busy} />
                <StaffButton primary label={editor.kind === 'delete' ? 'Delete Agent' : editor.kind === 'reset' ? 'Save PIN' : 'Save Delivery Agent'}
                  busy={busy} onPress={() => void submit()} />
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  heading: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 },
  headingText: { flexShrink: 1, gap: 4 },
  overlay: { flex: 1, backgroundColor: '#4D2B2066' },
  modalFlex: { flex: 1 },
  modalScroll: { flexGrow: 1, justifyContent: 'center', padding: 16 },
  modalCard: { width: '100%', maxWidth: 460, alignSelf: 'center', padding: 20 },
});
