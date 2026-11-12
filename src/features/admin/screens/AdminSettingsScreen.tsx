import React, { useEffect, useMemo, useState } from 'react';
import { Image, ImageStyle, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { homeTheme as theme } from '../../../theme/homeTheme';
import { useAdminDemo } from '../state/AdminDemoContext';
import { AdminButton, AdminPageTitle, AdminPanel, AdminToggleRow } from '../components/AdminUI';

interface Props { onNotify: (message: string) => void; }

export function AdminSettingsScreen({ onNotify }: Props) {
  const { settings, menu, updateSettings } = useAdminDemo();
  const [name, setName] = useState(settings.name);
  const [logoImage, setLogoImage] = useState(settings.logoImage);
  const [phone, setPhone] = useState(settings.phone);
  const [address, setAddress] = useState(settings.address);
  const [hours, setHours] = useState(settings.openingHours);
  const [error, setError] = useState('');
  const [showLogoPicker, setShowLogoPicker] = useState(false);
  const logoSamples = useMemo(() => menu.filter((item, index, all) => all.findIndex(candidate => candidate.image === item.image) === index).slice(0, 12), [menu]);

  useEffect(() => {
    setName(settings.name); setLogoImage(settings.logoImage); setPhone(settings.phone); setAddress(settings.address); setHours(settings.openingHours);
  }, [settings.name, settings.logoImage, settings.phone, settings.address, settings.openingHours]);

  const save = () => {
    if (name.trim().length < 2) return setError('Restaurant name is required.');
    if (!/^\+?[0-9 ()-]{8,18}$/.test(phone.trim())) return setError('Enter a valid contact number.');
    if (address.trim().length < 8) return setError('Enter a complete restaurant address.');
    if (hours.trim().length < 5) return setError('Enter opening hours.');
    updateSettings({ name: name.trim(), logoImage, phone: phone.trim(), address: address.trim(), openingHours: hours.trim() });
    setError('');
    onNotify('Restaurant settings saved · demo only');
  };

  return (
    <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
      <AdminPageTitle title="Restaurant settings" subtitle="Preview restaurant details and order availability controls." />
      {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
      <AdminPanel>
        <Text style={styles.panelTitle}>Restaurant profile</Text>
        <Text style={styles.label}>Restaurant logo</Text>
        <Pressable onPress={() => setShowLogoPicker(true)} accessibilityRole="button" accessibilityLabel="Choose restaurant logo" style={styles.logoPicker}>
          {logoImage ? <Image source={{ uri: logoImage }} style={styles.logoImage as ImageStyle} /> : <View style={[styles.logoImage, styles.logoPlaceholder]}><Ionicons name="restaurant-outline" size={21} color={theme.primary} /></View>}
          <View style={styles.logoCopy}><Text style={styles.logoTitle}>Choose a logo image</Text><Text style={styles.note}>Select a bundled dish photo for this preview.</Text></View>
          <Ionicons name="images-outline" size={19} color={theme.primary} />
        </Pressable>
        <Field label="Restaurant name" value={name} onChangeText={setName} placeholder="Restaurant name" />
        <Field label="Contact number" value={phone} onChangeText={setPhone} placeholder="+91" keyboardType="phone-pad" />
        <Field label="Address" value={address} onChangeText={setAddress} placeholder="Restaurant address" multiline />
        <Field label="Opening hours" value={hours} onChangeText={setHours} placeholder="9:00 AM – 11:00 PM" />
        <AdminButton label="Save profile details" icon="checkmark" tone="primary" onPress={save} />
      </AdminPanel>
      <AdminPanel>
        <Text style={styles.panelTitle}>Order availability</Text>
        <AdminToggleRow title="Restaurant open" detail="Customers can view the restaurant and menu." value={settings.isOpen} onValueChange={value => { updateSettings({ isOpen: value }); onNotify(value ? 'Restaurant marked open · demo only' : 'Restaurant marked closed · demo only'); }} />
        <AdminToggleRow title="Accepting orders" detail="Pause incoming demo orders independently of opening status." value={settings.acceptingOrders} onValueChange={value => { updateSettings({ acceptingOrders: value }); onNotify(value ? 'Accepting orders · demo only' : 'Orders paused · demo only'); }} />
        <Text style={styles.note}>Changes remain in the current Admin preview session only.</Text>
      </AdminPanel>
      <Modal visible={showLogoPicker} transparent animationType="slide" onRequestClose={() => setShowLogoPicker(false)}>
        <View style={styles.modalBackdrop}><View style={styles.logoSheet}>
          <View style={styles.sheetHeader}><Text style={styles.panelTitle}>Choose a restaurant logo</Text><Pressable onPress={() => setShowLogoPicker(false)} accessibilityRole="button" accessibilityLabel="Close logo choices"><Ionicons name="close" size={21} color={theme.text} /></Pressable></View>
          <ScrollView contentContainerStyle={styles.logoGrid}>{logoSamples.map(item => <Pressable key={item.id} onPress={() => { setLogoImage(item.image); setShowLogoPicker(false); }} accessibilityRole="button" accessibilityLabel={`Use ${item.name} as restaurant logo`} style={styles.logoOption}><Image source={{ uri: item.image }} style={styles.logoOptionImage as ImageStyle} /><Text numberOfLines={1} style={styles.logoOptionLabel}>{item.name}</Text></Pressable>)}</ScrollView>
        </View></View>
      </Modal>
    </ScrollView>
  );
}

function Field({ label, value, onChangeText, placeholder, multiline = false, keyboardType = 'default' }: {
  label: string; value: string; onChangeText: (value: string) => void; placeholder: string; multiline?: boolean; keyboardType?: 'default' | 'phone-pad';
}) {
  return <View style={styles.field}><Text style={styles.label}>{label}</Text><TextInput value={value} onChangeText={onChangeText} placeholder={placeholder} placeholderTextColor={theme.muted} multiline={multiline} keyboardType={keyboardType} style={[styles.input, multiline && styles.multiline]} textAlignVertical={multiline ? 'top' : 'center'} /></View>;
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 30, gap: 1 },
  error: { color: '#8B3D35', backgroundColor: '#F5E1DD', padding: 10, borderRadius: 9, marginBottom: 12, fontSize: 11, fontWeight: '600' },
  panelTitle: { color: theme.text, fontSize: 13, fontWeight: '800', marginBottom: 4 },
  field: { marginBottom: 12 },
  label: { color: theme.muted, fontSize: 10, fontWeight: '800', marginBottom: 5 },
  input: { minHeight: 42, paddingHorizontal: 10, paddingVertical: 8, borderWidth: 1, borderColor: theme.border, borderRadius: 9, backgroundColor: '#FFFCF7', color: theme.text, fontSize: 13 },
  multiline: { minHeight: 66 },
  note: { color: theme.muted, fontSize: 10, marginTop: 10, lineHeight: 15 },
  logoPicker: { minHeight: 60, flexDirection: 'row', alignItems: 'center', gap: 10, padding: 8, borderWidth: 1, borderColor: theme.border, borderRadius: 10, backgroundColor: '#FFFCF7', marginBottom: 12 },
  logoImage: { width: 44, height: 44, borderRadius: 10, backgroundColor: theme.header },
  logoPlaceholder: { alignItems: 'center', justifyContent: 'center' },
  logoCopy: { flex: 1 },
  logoTitle: { color: theme.text, fontSize: 11, fontWeight: '700' },
  modalBackdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(37,19,12,0.45)' },
  logoSheet: { maxHeight: '72%', backgroundColor: theme.background, borderTopLeftRadius: 22, borderTopRightRadius: 22, padding: 16 },
  sheetHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  logoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, paddingBottom: 12 },
  logoOption: { width: '31%', minWidth: 82 },
  logoOptionImage: { width: '100%', aspectRatio: 1, borderRadius: 10, backgroundColor: theme.header },
  logoOptionLabel: { color: theme.text, fontSize: 9, marginTop: 4 },
});
