import React, { useMemo, useState } from 'react';
import { Image, ImageStyle, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { homeTheme as theme } from '../../../theme/homeTheme';
import { useAdminDemo } from '../state/AdminDemoContext';
import type { AdminMenuItem } from '../types';
import { AdminEmptyState, AdminFilterRow, AdminMetric, AdminPageTitle, AdminPanel, AdminSearchField, AdminStatusPill } from '../components/AdminUI';

interface Props { onNotify: (message: string) => void; }
type InventoryFilter = 'all' | 'available' | 'low' | 'out';

const filters = [
  { label: 'All items', value: 'all' }, { label: 'Available', value: 'available' }, { label: 'Low stock', value: 'low' }, { label: 'Sold out', value: 'out' },
];

export function AdminInventoryScreen({ onNotify }: Props) {
  const { menu, toggleMenuAvailability, setMenuStock } = useAdminDemo();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<InventoryFilter>('all');
  const lowCount = menu.filter(item => item.stockCount > 0 && item.stockCount <= 5).length;
  const outCount = menu.filter(item => item.stockCount === 0 || !item.available).length;
  const availableCount = menu.filter(item => item.available && item.stockCount > 0).length;
  const filtered = useMemo(() => menu.filter(item => {
    const matchesQuery = `${item.name} ${item.category}`.toLowerCase().includes(query.trim().toLowerCase());
    const matchesFilter = filter === 'all' || (filter === 'available' ? item.available && item.stockCount > 0 : filter === 'low' ? item.stockCount > 0 && item.stockCount <= 5 : item.stockCount === 0 || !item.available);
    return matchesQuery && matchesFilter;
  }), [menu, query, filter]);

  return (
    <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
      <AdminPageTitle title="Inventory & availability" subtitle="Quickly pause sold-out dishes and watch low stock." />
      <View style={styles.metrics}><AdminMetric label="Available dishes" value={String(availableCount)} icon="checkmark-circle-outline" /><AdminMetric label="Low stock" value={String(lowCount)} note="5 portions or fewer" icon="warning-outline" accent /><AdminMetric label="Sold out / paused" value={String(outCount)} icon="remove-circle-outline" /><AdminMetric label="Menu items" value={String(menu.length)} icon="restaurant-outline" /></View>
      <AdminSearchField value={query} onChangeText={setQuery} placeholder="Search dish or category" accessibilityLabel="Search inventory" />
      <AdminFilterRow options={filters} selected={filter} onSelect={value => setFilter(value as InventoryFilter)} />
      {filtered.length ? filtered.map(item => <InventoryRow key={item.id} item={item} onStockChange={value => { setMenuStock(item.id, value); onNotify(value ? `${item.name} stock updated` : `${item.name} marked sold out`); }} onAvailability={() => { if (item.stockCount === 0 && !item.available) return; toggleMenuAvailability(item.id); onNotify(`${item.name} availability updated`); }} />) : <AdminPanel><AdminEmptyState title="No inventory matches" detail="Change the search or inventory filter to see more items." icon="search-outline" /></AdminPanel>}
      <Text style={styles.note}>Stock counts are sample values for the frontend preview; they are not live inventory.</Text>
    </ScrollView>
  );
}

function InventoryRow({ item, onStockChange, onAvailability }: { item: AdminMenuItem; onStockChange: (count: number) => void; onAvailability: () => void }) {
  const soldOut = item.stockCount === 0;
  const status = soldOut ? 'out' : item.stockCount <= 5 ? 'low' : item.available ? 'active' : 'inactive';
  const statusLabel = soldOut ? 'Sold out' : item.stockCount <= 5 ? `${item.stockCount} left` : item.available ? 'In stock' : 'Paused';
  return (
    <AdminPanel style={styles.rowPanel}>
      <View style={styles.rowTop}>
        <Image source={{ uri: item.image }} style={styles.image as ImageStyle} />
        <View style={styles.itemCopy}><Text style={styles.itemName} numberOfLines={1}>{item.name}</Text><Text style={styles.itemMeta}>{item.category} · ₹{item.price}</Text></View>
        <AdminStatusPill status={status} label={statusLabel} />
      </View>
      <View style={styles.rowBottom}>
        <View style={styles.stockControl}><Text style={styles.stockLabel}>Portions</Text><Pressable onPress={() => onStockChange(item.stockCount - 1)} accessibilityRole="button" accessibilityLabel={`Reduce ${item.name} stock`} style={styles.stepper}><Ionicons name="remove" size={15} color={theme.primary} /></Pressable><Text style={styles.stockValue}>{item.stockCount}</Text><Pressable onPress={() => onStockChange(item.stockCount + 1)} accessibilityRole="button" accessibilityLabel={`Increase ${item.name} stock`} style={styles.stepper}><Ionicons name="add" size={15} color={theme.primary} /></Pressable></View>
        <View style={styles.available}><Text style={styles.stockLabel}>{soldOut ? 'Restock to enable' : item.available ? 'Available to order' : 'Paused'}</Text><Switch value={item.available && !soldOut} onValueChange={onAvailability} disabled={soldOut} trackColor={{ false: '#CFBFAE', true: '#8DAB7D' }} thumbColor={item.available ? theme.primary : theme.card} accessibilityLabel={`Toggle availability for ${item.name}`} /></View>
      </View>
    </AdminPanel>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 30, gap: 10 },
  metrics: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 2 },
  rowPanel: { marginBottom: 0, padding: 12 },
  rowTop: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  image: { width: 46, height: 46, borderRadius: 10, backgroundColor: theme.header },
  itemCopy: { flex: 1, minWidth: 0 },
  itemName: { color: theme.text, fontSize: 12, fontWeight: '800' },
  itemMeta: { color: theme.muted, fontSize: 10, marginTop: 4 },
  rowBottom: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 8, borderTopWidth: 1, borderTopColor: theme.border, marginTop: 10, paddingTop: 8 },
  stockControl: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  available: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  stockLabel: { color: theme.muted, fontSize: 10, fontWeight: '600' },
  stockValue: { color: theme.text, fontSize: 12, fontWeight: '800', minWidth: 20, textAlign: 'center' },
  stepper: { width: 28, height: 28, borderRadius: 9, borderWidth: 1, borderColor: theme.border, backgroundColor: '#FFFCF7', alignItems: 'center', justifyContent: 'center' },
  note: { color: theme.muted, fontSize: 10, lineHeight: 15, paddingHorizontal: 3 },
});
