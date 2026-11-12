import React, { useMemo, useState } from 'react';
import { Image, ImageStyle, Pressable, ScrollView, StyleSheet, Switch, Text, View, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { homeTheme as theme } from '../../../theme/homeTheme';
import { useAdminDemo } from '../state/AdminDemoContext';
import type { AdminMenuItem } from '../types';
import { AdminButton, AdminConfirmModal, AdminEmptyState, AdminFilterRow, AdminPageTitle, AdminPanel, AdminSearchField, AdminStatusPill } from '../components/AdminUI';

interface Props {
  onAdd: () => void;
  onEdit: (id: string) => void;
  onNotify: (message: string) => void;
}

export function AdminMenuScreen({ onAdd, onEdit, onNotify }: Props) {
  const { width } = useWindowDimensions();
  const { menu, categories, toggleMenuAvailability, deleteMenuItem } = useAdminDemo();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [sort, setSort] = useState<'name' | 'price'>('name');
  const [deleteTarget, setDeleteTarget] = useState<AdminMenuItem | null>(null);
  const filtered = useMemo(() => menu.filter(item => {
    const textMatch = `${item.name} ${item.description} ${item.category}`.toLowerCase().includes(query.trim().toLowerCase());
    return textMatch && (category === 'all' || item.category === category);
  }).sort((a, b) => sort === 'name' ? a.name.localeCompare(b.name) : a.price - b.price), [menu, query, category, sort]);
  const options = [{ label: 'All categories', value: 'all' }, ...categories.map(item => ({ label: item.name, value: item.name }))];

  return (
    <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
      <AdminPageTitle title="Menu management" subtitle={`${menu.length} dishes from the shared Desi Bites menu catalog.`} action={<AdminButton label="Add item" icon="add" tone="primary" onPress={onAdd} compact />} />
      <AdminSearchField value={query} onChangeText={setQuery} placeholder="Search dishes or categories" accessibilityLabel="Search menu items" />
      <View style={styles.toolsRow}><AdminFilterRow options={options} selected={category} onSelect={setCategory} /><Pressable style={styles.sortButton} onPress={() => setSort(current => current === 'name' ? 'price' : 'name')} accessibilityRole="button"><Ionicons name="swap-vertical" size={15} color={theme.primary} /><Text style={styles.sortText}>Sort {sort === 'name' ? 'A–Z' : 'price'}</Text></Pressable></View>
      <Text style={styles.count}>{filtered.length} {filtered.length === 1 ? 'dish' : 'dishes'} · changes are demo-only</Text>
      {filtered.length ? <View style={styles.grid}>
        {filtered.map(item => <MenuItemCard key={item.id} item={item} wide={width >= 850} onEdit={() => onEdit(item.id)} onDelete={() => setDeleteTarget(item)} onAvailability={value => { if (item.available !== value) toggleMenuAvailability(item.id); onNotify(`${item.name} ${value ? 'available' : 'paused'}`); }} />)}
      </View> : <AdminPanel><AdminEmptyState title="No dishes found" detail="Adjust your search or category filter, or add a dish to the demo menu." icon="restaurant-outline" action={<AdminButton label="Add item" tone="primary" icon="add" onPress={onAdd} />} /></AdminPanel>}
      <AdminConfirmModal
        visible={Boolean(deleteTarget)}
        title="Delete menu item?"
        message={deleteTarget ? `${deleteTarget.name} will be removed from this demo menu.` : ''}
        confirmLabel="Delete item"
        destructive
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) deleteMenuItem(deleteTarget.id);
          setDeleteTarget(null);
          onNotify('Menu item deleted · demo only');
        }}
      />
    </ScrollView>
  );
}

function MenuItemCard({ item, wide, onEdit, onDelete, onAvailability }: {
  item: AdminMenuItem;
  wide: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onAvailability: (value: boolean) => void;
}) {
  return (
    <AdminPanel style={[styles.itemCard, wide && styles.itemCardWide]}>
      <View style={styles.cardTop}>
        <Image source={{ uri: item.image }} style={styles.image as ImageStyle} />
        <View style={styles.cardInfo}>
          <Text style={styles.name} numberOfLines={2}>{item.name}</Text>
          <Text style={styles.description} numberOfLines={2}>{item.description || 'No description added.'}</Text>
          <View style={styles.meta}><View style={[styles.vegIndicator, !item.isVeg && styles.nonVeg]} /><Text style={styles.metaText}>{item.isVeg ? 'Vegetarian' : 'Non-vegetarian'}</Text><Text style={styles.metaText}>· {item.category}</Text></View>
        </View>
        <View style={styles.priceBlock}><Text style={styles.price}>₹{item.price}</Text><Text style={styles.priceCaption}>per serving</Text></View>
      </View>
      <View style={styles.cardFooter}>
        <View style={styles.availability}><AdminStatusPill status={item.available ? 'active' : 'inactive'} label={item.available ? 'Available' : 'Unavailable'} /><Switch value={item.available} onValueChange={onAvailability} trackColor={{ false: '#CFBFAE', true: '#8DAB7D' }} thumbColor={item.available ? theme.primary : theme.card} accessibilityLabel={`${item.name} availability`} /></View>
        <View style={styles.actions}><Pressable onPress={onDelete} accessibilityRole="button" accessibilityLabel={`Delete ${item.name}`} style={styles.iconButton}><Ionicons name="trash-outline" size={16} color="#8B3D35" /></Pressable><AdminButton label="Edit" icon="create-outline" onPress={onEdit} compact /></View>
      </View>
    </AdminPanel>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 30, gap: 10 },
  toolsRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sortButton: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 9, minHeight: 34, borderWidth: 1, borderColor: theme.border, borderRadius: 10, backgroundColor: theme.card },
  sortText: { color: theme.primary, fontSize: 10, fontWeight: '700' },
  count: { color: theme.muted, fontSize: 10, fontWeight: '700' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  itemCard: { flexBasis: '100%', marginBottom: 0, padding: 12 },
  itemCardWide: { flexBasis: '48%', flexGrow: 1 },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  image: { width: 74, height: 74, borderRadius: 11, backgroundColor: theme.header },
  cardInfo: { flex: 1, minWidth: 0 },
  name: { color: theme.text, fontSize: 13, fontWeight: '800', lineHeight: 18 },
  description: { color: theme.muted, fontSize: 10, lineHeight: 14, marginTop: 4 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 5, flexWrap: 'wrap', marginTop: 7 },
  vegIndicator: { width: 9, height: 9, borderRadius: 2, borderWidth: 1.5, borderColor: '#3E7B4B', backgroundColor: '#3E7B4B' },
  nonVeg: { borderColor: '#9A4B3E', backgroundColor: '#9A4B3E' },
  metaText: { color: theme.muted, fontSize: 9, fontWeight: '600' },
  priceBlock: { alignItems: 'flex-end' },
  price: { color: theme.primary, fontSize: 15, fontWeight: '900' },
  priceCaption: { color: theme.muted, fontSize: 8, marginTop: 2 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8, borderTopWidth: 1, borderTopColor: theme.border, marginTop: 11, paddingTop: 8 },
  availability: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  iconButton: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F5E1DD' },
});
