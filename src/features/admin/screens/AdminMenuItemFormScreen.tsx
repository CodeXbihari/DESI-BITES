import React, { useEffect, useMemo, useState } from 'react';
import { Image, ImageStyle, Modal, Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { homeTheme as theme } from '../../../theme/homeTheme';
import { useAdminDemo } from '../state/AdminDemoContext';
import type { AdminStackParamList, MenuItemDraft } from '../types';
import { AdminButton, AdminPageTitle, AdminPanel } from '../components/AdminUI';

type Props = NativeStackScreenProps<AdminStackParamList, 'AdminMenuItemForm'>;

export function AdminMenuItemFormScreen({ navigation, route }: Props) {
  const { menu, categories, addMenuItem, updateMenuItem } = useAdminDemo();
  const current = route.params.menuItemId ? menu.find(item => item.id === route.params.menuItemId) : undefined;
  const [name, setName] = useState(current?.name ?? '');
  const [description, setDescription] = useState(current?.description ?? '');
  const [price, setPrice] = useState(current ? String(current.price) : '');
  const [category, setCategory] = useState(current?.category ?? categories[0]?.name ?? '');
  const [image, setImage] = useState(current?.image ?? menu[0]?.image ?? '');
  const [isVeg, setIsVeg] = useState(current?.isVeg ?? true);
  const [available, setAvailable] = useState(current?.available ?? true);
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    navigation.setOptions({ title: current ? 'Edit menu item' : 'Add menu item' });
  }, [current, navigation]);

  const samples = useMemo(() => menu.filter((item, index, all) => all.findIndex(candidate => candidate.image === item.image) === index).slice(0, 12), [menu]);

  const save = () => {
    const numericPrice = Number(price);
    if (name.trim().length < 2) return setError('Enter a dish name with at least 2 characters.');
    if (!description.trim()) return setError('Add a short description for the dish.');
    if (!Number.isFinite(numericPrice) || numericPrice <= 0) return setError('Enter a price greater than ₹0.');
    if (!category.trim()) return setError('Choose a category.');
    const draft: MenuItemDraft = { name: name.trim(), description: description.trim(), price: numericPrice, category, image, isVeg, available };
    if (current) updateMenuItem(current.id, draft); else addMenuItem(draft);
    navigation.goBack();
  };

  return (
    <>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <AdminPageTitle title={current ? 'Edit dish' : 'Add a dish'} subtitle="Menu edits stay in the Admin demo session." />
        {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
        <AdminPanel>
          <Text style={styles.label}>Food photo</Text>
          <Pressable onPress={() => setShowImagePicker(true)} accessibilityRole="button" style={styles.imageChoice}>
            <Image source={{ uri: image }} style={styles.previewImage as ImageStyle} />
            <View style={styles.imageCopy}><Text style={styles.imageTitle}>Choose a menu photo</Text><Text style={styles.helper}>Select from the bundled demo dish images.</Text></View>
            <Ionicons name="images-outline" size={20} color={theme.primary} />
          </Pressable>

          <Field label="Dish name" value={name} onChangeText={value => { setName(value); setError(null); }} placeholder="e.g. Paneer Pizza" />
          <Field label="Description" value={description} onChangeText={value => { setDescription(value); setError(null); }} placeholder="A short description of the dish" multiline />
          <Field label="Price (₹)" value={price} onChangeText={value => { setPrice(value.replace(/[^0-9.]/g, '')); setError(null); }} placeholder="0" keyboardType="decimal-pad" />

          <Text style={styles.label}>Category</Text>
          <View style={styles.categoryList}>{categories.map(item => <Pressable key={item.id} onPress={() => { setCategory(item.name); setError(null); }} accessibilityRole="button" accessibilityState={{ selected: category === item.name }} style={[styles.categoryChip, category === item.name && styles.categoryChipSelected]}><Text style={[styles.categoryText, category === item.name && styles.categoryTextSelected]}>{item.name}</Text></Pressable>)}</View>

          <AdminToggleLine title="Vegetarian item" detail="Show the green vegetarian indicator." value={isVeg} onValueChange={setIsVeg} />
          <AdminToggleLine title="Available to order" detail="Pause the dish when it is sold out." value={available} onValueChange={setAvailable} />
        </AdminPanel>
        <View style={styles.formActions}><AdminButton label="Cancel" onPress={() => navigation.goBack()} tone="quiet" /><AdminButton label={current ? 'Save changes' : 'Add dish'} icon="checkmark" onPress={save} tone="primary" /></View>
      </ScrollView>
      <Modal visible={showImagePicker} transparent animationType="slide" onRequestClose={() => setShowImagePicker(false)}>
        <View style={styles.modalBackdrop}><View style={styles.imageSheet}><View style={styles.sheetHeader}><Text style={styles.sheetTitle}>Choose a dish photo</Text><Pressable onPress={() => setShowImagePicker(false)} accessibilityRole="button" accessibilityLabel="Close photo picker"><Ionicons name="close" size={21} color={theme.text} /></Pressable></View><ScrollView contentContainerStyle={styles.photoGrid}>{samples.map(item => <Pressable key={item.id} style={styles.photoOption} onPress={() => { setImage(item.image); setShowImagePicker(false); }} accessibilityRole="button" accessibilityLabel={`Select photo for ${item.name}`}><Image source={{ uri: item.image }} style={styles.photoThumb as ImageStyle} /><Text numberOfLines={1} style={styles.photoLabel}>{item.name}</Text></Pressable>)}</ScrollView></View></View>
      </Modal>
    </>
  );
}

function Field({ label, value, onChangeText, placeholder, multiline = false, keyboardType = 'default' }: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  multiline?: boolean;
  keyboardType?: 'default' | 'decimal-pad';
}) {
  return <View style={styles.field}><Text style={styles.label}>{label}</Text><TextInput value={value} onChangeText={onChangeText} placeholder={placeholder} placeholderTextColor={theme.muted} keyboardType={keyboardType} multiline={multiline} style={[styles.input, multiline && styles.multiline]} textAlignVertical={multiline ? 'top' : 'center'} /></View>;
}

function AdminToggleLine({ title, detail, value, onValueChange }: { title: string; detail: string; value: boolean; onValueChange: (value: boolean) => void }) {
  return <View style={styles.toggleRow}><View style={styles.toggleCopy}><Text style={styles.toggleTitle}>{title}</Text><Text style={styles.helper}>{detail}</Text></View><Switch value={value} onValueChange={onValueChange} trackColor={{ false: '#CFBFAE', true: '#8DAB7D' }} thumbColor={value ? theme.primary : theme.card} accessibilityLabel={title} /></View>;
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 28 },
  error: { color: '#8B3D35', backgroundColor: '#F5E1DD', padding: 10, borderRadius: 9, marginBottom: 12, fontSize: 12, fontWeight: '600' },
  label: { color: theme.text, fontSize: 12, fontWeight: '800', marginBottom: 6 },
  field: { marginTop: 13 },
  input: { minHeight: 43, paddingHorizontal: 11, paddingVertical: 9, borderWidth: 1, borderColor: theme.border, borderRadius: 10, backgroundColor: '#FFFCF7', color: theme.text, fontSize: 13 },
  multiline: { minHeight: 76 },
  imageChoice: { flexDirection: 'row', alignItems: 'center', gap: 11, padding: 10, borderWidth: 1, borderColor: theme.border, borderRadius: 12, backgroundColor: '#FFFCF7' },
  previewImage: { width: 58, height: 58, borderRadius: 9, backgroundColor: theme.header },
  imageCopy: { flex: 1 },
  imageTitle: { color: theme.text, fontSize: 12, fontWeight: '700' },
  helper: { color: theme.muted, fontSize: 10, lineHeight: 14, marginTop: 3 },
  categoryList: { flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginBottom: 10 },
  categoryChip: { paddingHorizontal: 10, paddingVertical: 7, borderRadius: 99, borderWidth: 1, borderColor: theme.border, backgroundColor: theme.card },
  categoryChipSelected: { backgroundColor: theme.primary, borderColor: theme.primary },
  categoryText: { color: theme.muted, fontSize: 10, fontWeight: '700' },
  categoryTextSelected: { color: theme.card },
  toggleRow: { minHeight: 60, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10, borderTopWidth: 1, borderTopColor: theme.border, paddingTop: 8, marginTop: 6 },
  toggleCopy: { flex: 1 },
  toggleTitle: { color: theme.text, fontSize: 12, fontWeight: '700' },
  formActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8 },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(37,19,12,0.45)', justifyContent: 'flex-end' },
  imageSheet: { maxHeight: '76%', backgroundColor: theme.background, borderTopLeftRadius: 22, borderTopRightRadius: 22, padding: 16 },
  sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 13 },
  sheetTitle: { color: theme.text, fontSize: 17, fontWeight: '800' },
  photoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, paddingBottom: 14 },
  photoOption: { width: '31%', minWidth: 86 },
  photoThumb: { width: '100%', aspectRatio: 1, borderRadius: 10, backgroundColor: theme.header },
  photoLabel: { color: theme.text, fontSize: 9, fontWeight: '600', marginTop: 4 },
});
