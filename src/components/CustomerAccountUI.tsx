import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useCustomerAccount } from '../context/CustomerAccountContext';
import { useAuth } from '../context/AuthContext';
import type { AddressInput } from '../backend/types';
import { accountReady, addressInput, formatCustomerAddress } from '../services/customerAccount';
import { homeTheme as theme } from '../theme/homeTheme';

export function CustomerAccountStatus() {
  const account = useCustomerAccount();
  return <View style={styles.status}>
    <Text style={styles.muted}>{account.source === 'demo' ? 'Local demo profile and addresses · saved for this app session' : 'Local emulator profile and addresses'}</Text>
    {!account.uid ? <Text>Sign in to manage your profile and addresses.</Text> : account.loading ?
      <><ActivityIndicator color={theme.primary} /><Text>Loading profile and addresses…</Text></> : account.error ?
      <><Text accessibilityRole="alert">{account.error}</Text><TouchableOpacity accessibilityRole="button" onPress={() => void account.retry()}><Text style={styles.link}>Retry loading</Text></TouchableOpacity></> :
      account.busy ? <Text>Saving changes…</Text> : null}
  </View>;
}

export function CustomerProfileEditor() {
  const account = useCustomerAccount();
  const { user } = useAuth();
  const [editing, setEditing] = useState(false), [name, setName] = useState(''), [error, setError] = useState('');
  const ready = accountReady(account);
  async function save() {
    setError('');
    if (!name.trim() || name.trim().length > 80) { setError('Enter a name of 1–80 characters.'); return; }
    try { await account.saveProfile(name); setEditing(false); } catch (reason) { setError(reason instanceof Error ? reason.message : 'Profile could not be saved.'); }
  }
  return <View style={styles.card}>
    <CustomerAccountStatus />
    {ready && !account.profile && <Text>No saved profile yet. Save your name to create one.</Text>}
    {editing ? <>
      <TextInput accessibilityLabel="Profile name" value={name} onChangeText={setName} editable={ready} maxLength={80} style={styles.input} />
      <View style={styles.row}><Action label="Save profile" disabled={!ready} onPress={() => void save()} /><Action label="Cancel profile edit" disabled={account.busy} onPress={() => { setEditing(false); setError(''); }} /></View>
    </> : <Action label="Edit profile name" disabled={!ready} onPress={() => { setName(account.profile?.data.displayName ?? user?.displayName ?? ''); setError(''); setEditing(true); }} />}
    {!!error && <Text accessibilityRole="alert" style={styles.error}>{error}</Text>}
  </View>;
}

const blank = (): AddressInput => ({ label: 'Other', addressLine: '', area: '', city: '', pincode: '', deliveryInstructions: '' });
const newId = () => `address-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
const fields = [ ['addressLine', 'Street address'], ['area', 'Area / locality'], ['city', 'City'], ['pincode', 'PIN code'], ['deliveryInstructions', 'Delivery instructions (optional)'] ] as const;

export function SavedAddresses() {
  const account = useCustomerAccount();
  const ready = accountReady(account);
  const [draft, setDraft] = useState<AddressInput>(blank), [editingId, setEditingId] = useState<string | null>(null);
  const [formId, setFormId] = useState(newId), [showForm, setShowForm] = useState(false), [error, setError] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  async function act(action: () => Promise<void>) {
    setError('');
    try { await action(); setConfirmDelete(null); return true; }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'Address change failed.'); return false; }
  }
  return <View>
    <CustomerAccountStatus />
    {!!account.selectionNotice && <Text accessibilityRole="alert">{account.selectionNotice}</Text>}
    {ready && account.addresses.length === 0 && <Text>No saved addresses yet. Add one for delivery.</Text>}
    {account.selectedAddress && <Text accessibilityLabel="Selected delivery address">Selected: {formatCustomerAddress(account.selectedAddress.data)}</Text>}
    <ScrollView style={{ maxHeight: 300 }} keyboardShouldPersistTaps="handled">
      {account.addresses.map(address => <View key={address.id} style={styles.card}>
        <Text style={styles.title}>{address.data.label}{account.profile?.data.defaultAddressId === address.id ? ' · Default' : ''}</Text>
        <Text>{formatCustomerAddress(address.data)}</Text>
        {!!address.data.deliveryInstructions && <Text>{address.data.deliveryInstructions}</Text>}
        <View style={styles.row}>
          <TouchableOpacity accessibilityRole="radio" accessibilityLabel={`Use address ${address.id}`} accessibilityState={{ checked: account.selectedAddressId === address.id, disabled: !ready }} disabled={!ready} onPress={() => { try { account.selectAddress(address.id); setError(''); } catch { setError('Address selection failed. Retry loading.'); } }}><Text style={styles.link}>{account.selectedAddressId === address.id ? 'Selected' : 'Use address'}</Text></TouchableOpacity>
          <Action label={`Edit address ${address.id}`} text="Edit" disabled={!ready} onPress={() => { setEditingId(address.id); setDraft(addressInput(address.data)); setError(''); setShowForm(true); }} />
          <Action label={`Delete address ${address.id}`} text="Delete" disabled={!ready} onPress={() => setConfirmDelete(address.id)} />
          <Action label={`Make default address ${address.id}`} text="Make default" disabled={!ready || !account.profile} onPress={() => void act(() => account.setDefaultAddress(address.id))} />
        </View>
        {confirmDelete === address.id && <View><Text>Delete this saved address?</Text><View style={styles.row}><Action label="Confirm delete address" disabled={!ready} onPress={() => void act(() => account.removeAddress(address.id))} /><Action label="Cancel address deletion" disabled={account.busy} onPress={() => setConfirmDelete(null)} /></View></View>}
      </View>)}
    </ScrollView>
    {!account.profile && ready && account.addresses.length > 0 && <Text style={styles.muted}>Save your profile name to enable a default address.</Text>}
    {!showForm ? <Action label="Add new address" disabled={!ready} onPress={() => { setDraft(blank()); setEditingId(null); setFormId(newId()); setError(''); setShowForm(true); }} /> : <SavedAddressEditor
      key={editingId ?? formId}
      editingId={editingId}
      formId={formId}
      initialDraft={draft}
      onClose={message => { setShowForm(false); setEditingId(null); setError(message ?? ''); }}
    />}
    {!!error && <Text accessibilityRole="alert" style={styles.error}>{error}</Text>}
  </View>;
}


// Kept separate so a stale edit has no rendered Save action even before the
// cleanup effect closes it. The session also rejects stale captured callbacks.
export function SavedAddressEditor({ editingId, formId, initialDraft, onClose }: {
  editingId: string | null; formId: string; initialDraft: AddressInput; onClose: (message?: string) => void;
}) {
  const account = useCustomerAccount();
  const ready = accountReady(account);
  const [draft, setDraft] = useState(() => ({ ...initialDraft })), [error, setError] = useState('');
  const stale = ready && editingId !== null && !account.addresses.some(address => address.id === editingId);
  const missingMessage = 'This address was deleted or is no longer available. Choose another saved address.';
  useEffect(() => { if (stale) onClose(missingMessage); }, [stale, onClose]);
  async function save() {
    if (!ready) return;
    if (stale) { onClose(missingMessage); return; }
    setError('');
    const input = { ...draft, addressLine: draft.addressLine.trim(), area: draft.area.trim(), city: draft.city.trim(), pincode: draft.pincode.trim(), deliveryInstructions: draft.deliveryInstructions.trim() };
    if (!input.addressLine || !input.area || !input.city || !/^[1-9][0-9]{5}$/.test(input.pincode)) {
      setError('Enter street address, area, city and a valid six-digit PIN code.'); return;
    }
    try {
      await account.saveAddress(editingId ?? formId, input, editingId !== null);
      onClose();
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Address change failed.'); }
  }
  if (stale) return <Text accessibilityRole="alert">{missingMessage}</Text>;
  return <View style={styles.card}>
    <Text style={styles.title}>{editingId ? 'Edit saved address' : 'Add saved address'}</Text>
    <View style={styles.row}>{(['Home', 'Work', 'Other'] as const).map(label => <TouchableOpacity key={label} accessibilityRole="radio" accessibilityLabel={`Address label ${label}`} accessibilityState={{ checked: draft.label === label, disabled: !ready }} disabled={!ready} onPress={() => setDraft(value => ({ ...value, label }))}><Text style={styles.link}>{draft.label === label ? '● ' : '○ '}{label}</Text></TouchableOpacity>)}</View>
    {fields.map(([field, label]) => <TextInput key={field} accessibilityLabel={label} placeholder={label} value={draft[field]} editable={ready} onChangeText={value => setDraft(previous => ({ ...previous, [field]: value }))} keyboardType={field === 'pincode' ? 'number-pad' : 'default'} maxLength={field === 'pincode' ? 6 : field === 'addressLine' ? 400 : field === 'deliveryInstructions' ? 500 : 120} style={styles.input} />)}
    <View style={styles.row}><Action label="Save address" disabled={!ready} onPress={() => void save()} /><Action label="Cancel address edit" disabled={account.busy} onPress={() => onClose()} /></View>
    {!!error && <Text accessibilityRole="alert" style={styles.error}>{error}</Text>}
  </View>;
}

function Action({ label, text = label, disabled, onPress }: { label: string; text?: string; disabled: boolean; onPress: () => void }) {
  return <TouchableOpacity accessibilityRole="button" accessibilityLabel={label} accessibilityState={{ disabled }} disabled={disabled} onPress={onPress} style={{ paddingVertical: 10, opacity: disabled ? 0.5 : 1 }}><Text style={styles.link}>{text}</Text></TouchableOpacity>;
}
const styles = StyleSheet.create({
  status: { gap: 8, paddingVertical: 10 }, muted: { color: theme.muted, fontSize: 12 },
  card: { padding: 12, marginVertical: 8, borderWidth: 1, borderColor: theme.border, borderRadius: 12, backgroundColor: theme.card, gap: 8 },
  row: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 14 },
  input: { borderWidth: 1, borderColor: theme.border, borderRadius: 8, padding: 10, color: theme.text, backgroundColor: theme.background, minHeight: 44 },
  link: { color: theme.primary, fontWeight: '600' }, error: { color: '#A02020', paddingVertical: 8 }, title: { fontWeight: '700', color: theme.text },
});
