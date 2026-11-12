import React, { useMemo, useState } from 'react';
import { Image, ImageStyle, Modal, Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { homeTheme as theme } from '../../../theme/homeTheme';
import { useAdminDemo, getCategoryItemCount } from '../state/AdminDemoContext';
import type { AdminCategory } from '../types';
import { AdminButton, AdminConfirmModal, AdminEmptyState, AdminPageTitle, AdminPanel, AdminStatusPill } from '../components/AdminUI';

interface Props { onNotify: (message: string) => void; }

export function AdminCategoriesScreen({ onNotify }: Props) {
  const { categories, menu, addCategory, updateCategory, deleteCategory } = useAdminDemo();
  const [formTarget, setFormTarget] = useState<AdminCategory | null | 'new'>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminCategory | null>(null);
  const [query, setQuery] = useState('');
  const filtered = useMemo(() => categories.filter(category => category.name.toLowerCase().includes(query.trim().toLowerCase())), [categories, query]);
  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <AdminPageTitle title="Categories" subtitle="Organize dishes and control which categories are active." action={<AdminButton label="Add category" icon="add" tone="primary" onPress={() => setFormTarget('new')} compact />} />
      <TextInput value={query} onChangeText={setQuery} placeholder="Search categories" placeholderTextColor={theme.muted} style={styles.search} accessibilityLabel="Search categories" />
      {filtered.length ? filtered.map(category => {
        const count = getCategoryItemCount(category, menu);
        return (
          <AdminPanel key={category.id} style={styles.categoryCard}>
            <Image source={{ uri: category.image }} style={styles.image as ImageStyle} />
            <View style={styles.categoryCopy}><Text style={styles.categoryName}>{category.name}</Text><Text style={styles.categoryInfo}>{count} {count === 1 ? 'dish' : 'dishes'}</Text><AdminStatusPill status={category.isActive ? 'active' : 'inactive'} /></View>
            <View style={styles.categoryActions}><Switch value={category.isActive} onValueChange={value => { updateCategory(category.id, { name: category.name, image: category.image, isActive: value }); onNotify(`${category.name} ${value ? 'activated' : 'paused'}`); }} trackColor={{ false: '#CFBFAE', true: '#8DAB7D' }} thumbColor={category.isActive ? theme.primary : theme.card} accessibilityLabel={`${category.name} active`} /><Pressable onPress={() => setFormTarget(category)} accessibilityRole="button" accessibilityLabel={`Edit ${category.name}`} style={styles.iconButton}><Ionicons name="create-outline" size={17} color={theme.primary} /></Pressable><Pressable onPress={() => setDeleteTarget(category)} accessibilityRole="button" accessibilityLabel={`Delete ${category.name}`} style={styles.iconButton}><Ionicons name="trash-outline" size={17} color="#8B3D35" /></Pressable></View>
          </AdminPanel>
        );
      }) : <AdminPanel><AdminEmptyState title="No categories found" detail="Try another name or add a new category." icon="pricetags-outline" action={<AdminButton label="Add category" icon="add" tone="primary" onPress={() => setFormTarget('new')} />} /></AdminPanel>}
      <Text style={styles.note}>Categories with menu items can be renamed, but cannot be deleted until their items are moved.</Text>
      <CategoryForm visible={formTarget !== null} category={formTarget === 'new' ? null : formTarget} onClose={() => setFormTarget(null)} onSave={draft => { if (formTarget === 'new') addCategory(draft); else if (formTarget) updateCategory(formTarget.id, draft); setFormTarget(null); onNotify(formTarget === 'new' ? 'Category added · demo only' : 'Category updated · demo only'); }} />
      <AdminConfirmModal visible={Boolean(deleteTarget)} title="Delete category?" message={deleteTarget ? `${getCategoryItemCount(deleteTarget, menu)} menu items are assigned to ${deleteTarget.name}. Only empty categories can be deleted.` : ''} confirmLabel="Delete category" destructive onCancel={() => setDeleteTarget(null)} onConfirm={() => { if (deleteTarget && deleteCategory(deleteTarget.id)) onNotify('Category deleted · demo only'); else onNotify('Move dishes out of this category first.'); setDeleteTarget(null); }} />
    </ScrollView>
  );
}

function CategoryForm({ visible, category, onClose, onSave }: { visible: boolean; category: AdminCategory | null; onClose: () => void; onSave: (draft: { name: string; image: string; isActive: boolean }) => void }) {
  const { categories, menu } = useAdminDemo();
  const [name, setName] = useState('');
  const [image, setImage] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [showPhotos, setShowPhotos] = useState(false);
  const [error, setError] = useState('');
  const samples = useMemo(() => menu.filter((item, index, all) => all.findIndex(other => other.image === item.image) === index).slice(0, 12), [menu]);

  React.useEffect(() => {
    if (visible) {
      setName(category?.name ?? '');
      setImage(category?.image ?? samples[0]?.image ?? '');
      setIsActive(category?.isActive ?? true);
      setError('');
    }
  }, [visible, category, samples]);

  const save = () => {
    const trimmed = name.trim();
    if (trimmed.length < 2) return setError('Enter a category name with at least 2 characters.');
    if (categories.some(item => item.name.toLowerCase() === trimmed.toLowerCase() && item.id !== category?.id)) return setError('A category with this name already exists.');
    onSave({ name: trimmed, image, isActive });
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalBackdrop}><View style={[styles.formSheet, showPhotos && styles.photoSheet]}>
        {showPhotos ? <>
          <View style={styles.sheetHeader}><Text style={styles.sheetTitle}>Choose an image</Text><Pressable onPress={() => setShowPhotos(false)} accessibilityRole="button" accessibilityLabel="Close image choices"><Ionicons name="close" size={21} color={theme.text} /></Pressable></View>
          <ScrollView contentContainerStyle={styles.photoGrid}>{samples.map(item => <Pressable key={item.id} onPress={() => { setImage(item.image); setShowPhotos(false); }} accessibilityRole="button" accessibilityLabel={`Choose ${item.name} category image`} style={styles.photoChoice}><Image source={{ uri: item.image }} style={styles.photoImage as ImageStyle} /><Text style={styles.photoLabel} numberOfLines={1}>{item.category}</Text></Pressable>)}</ScrollView>
        </> : <>
          <View style={styles.sheetHeader}><Text style={styles.sheetTitle}>{category ? 'Edit category' : 'Add category'}</Text><Pressable onPress={onClose} accessibilityRole="button" accessibilityLabel="Cancel category form"><Ionicons name="close" size={21} color={theme.text} /></Pressable></View>
          {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
          <Text style={styles.label}>Category name</Text><TextInput value={name} onChangeText={value => { setName(value); setError(''); }} placeholder="e.g. Pizza" placeholderTextColor={theme.muted} style={styles.input} />
          <Text style={styles.label}>Category image</Text><Pressable onPress={() => setShowPhotos(true)} accessibilityRole="button" style={styles.imageChoice}><Image source={{ uri: image }} style={styles.imagePreview as ImageStyle} /><Text style={styles.imageCopy}>Choose from menu photos</Text><Ionicons name="images-outline" size={18} color={theme.primary} /></Pressable>
          <View style={styles.statusRow}><View style={styles.categoryCopy}><Text style={styles.categoryName}>Active category</Text><Text style={styles.categoryInfo}>Show this group in the customer menu.</Text></View><Switch value={isActive} onValueChange={setIsActive} trackColor={{ false: '#CFBFAE', true: '#8DAB7D' }} thumbColor={isActive ? theme.primary : theme.card} accessibilityLabel="Category active" /></View>
          <View style={styles.formActions}><AdminButton label="Cancel" onPress={onClose} tone="quiet" /><AdminButton label="Save category" onPress={save} tone="primary" icon="checkmark" /></View>
        </>}
      </View></View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 30, gap: 10 },
  search: { minHeight: 42, paddingHorizontal: 11, borderWidth: 1, borderColor: theme.border, borderRadius: 11, backgroundColor: theme.card, color: theme.text, fontSize: 13 },
  categoryCard: { flexDirection: 'row', alignItems: 'center', gap: 11, padding: 11, marginBottom: 0 },
  image: { width: 58, height: 58, borderRadius: 11, backgroundColor: theme.header },
  categoryCopy: { flex: 1, minWidth: 0, gap: 4 },
  categoryName: { color: theme.text, fontSize: 13, fontWeight: '800' },
  categoryInfo: { color: theme.muted, fontSize: 10 },
  categoryActions: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  iconButton: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center', borderRadius: 9, backgroundColor: theme.header },
  note: { color: theme.muted, fontSize: 10, lineHeight: 15, paddingHorizontal: 3 },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(37,19,12,0.45)', justifyContent: 'flex-end' },
  formSheet: { backgroundColor: theme.background, borderTopLeftRadius: 22, borderTopRightRadius: 22, padding: 17 },
  sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  sheetTitle: { color: theme.text, fontSize: 17, fontWeight: '800' },
  error: { backgroundColor: '#F5E1DD', color: '#8B3D35', padding: 9, borderRadius: 8, fontSize: 11, marginBottom: 10 },
  label: { color: theme.text, fontSize: 11, fontWeight: '800', marginBottom: 6 },
  input: { minHeight: 42, paddingHorizontal: 10, borderWidth: 1, borderColor: theme.border, borderRadius: 9, backgroundColor: theme.card, color: theme.text, fontSize: 13, marginBottom: 13 },
  imageChoice: { flexDirection: 'row', alignItems: 'center', gap: 9, padding: 8, borderWidth: 1, borderColor: theme.border, borderRadius: 10, backgroundColor: theme.card, marginBottom: 10 },
  imagePreview: { width: 40, height: 40, borderRadius: 7, backgroundColor: theme.header },
  imageCopy: { flex: 1, color: theme.text, fontSize: 11, fontWeight: '600' },
  statusRow: { minHeight: 58, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, borderTopWidth: 1, borderTopColor: theme.border, paddingVertical: 8 },
  formActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 7, marginTop: 10 },
  photoSheet: { maxHeight: '70%', backgroundColor: theme.background, borderRadius: 18, padding: 15 },
  photoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, paddingBottom: 4 },
  photoChoice: { width: '30%', minWidth: 80 },
  photoImage: { width: '100%', aspectRatio: 1, borderRadius: 9, backgroundColor: theme.header },
  photoLabel: { color: theme.text, fontSize: 9, marginTop: 4 },
});
