import React, { useMemo, useState } from 'react';
import { View, Text, Image, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SEARCH_MENU_ITEMS, type SearchMenuItem } from '../data/searchMenuData';
import { homeTheme as theme } from '../theme/homeTheme';

interface HomeFoodDiscoveryProps {
  searchQuery: string;
  onOpenMenu: (category: SearchMenuItem['category']) => void;
}

const filters = [
  { id: 'All', label: 'All favourites' },
  { id: 'Nashta', label: 'Nashta' },
  { id: 'Thali', label: 'Thali' },
  { id: 'Under100', label: 'Under ₹100' },
] as const;
type FoodFilter = typeof filters[number]['id'];

export function HomeFoodDiscovery({ searchQuery, onOpenMenu }: HomeFoodDiscoveryProps) {
  const [filter, setFilter] = useState<FoodFilter>('All');
  const dishes = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return SEARCH_MENU_ITEMS.filter(item => {
      const matchesSearch = !query || item.name.toLowerCase().includes(query)
        || item.hindiName?.includes(query) || item.description.toLowerCase().includes(query);
      const matchesFilter = filter === 'All' || (filter === 'Under100' ? item.price < 100 : item.category === filter);
      return matchesSearch && matchesFilter;
    });
  }, [searchQuery, filter]);

  return (
    <View>
      <View style={styles.headingRow}>
        <Text style={styles.heading}>From our kitchen</Text>
        <TouchableOpacity onPress={() => onOpenMenu('All')} accessibilityRole="button" accessibilityLabel="View full food menu">
          <Text style={styles.menuLink}>View menu →</Text>
        </TouchableOpacity>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
        {filters.map(item => (
          <TouchableOpacity
            key={item.id}
            style={[styles.filter, filter === item.id && styles.filterActive]}
            onPress={() => setFilter(item.id)}
            accessibilityRole="button"
            accessibilityState={{ selected: filter === item.id }}
          >
            <Text style={[styles.filterText, filter === item.id && styles.filterTextActive]}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      {dishes.length ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dishes}>
          {dishes.map(item => (
            <TouchableOpacity
              key={item.id}
              style={styles.card}
              onPress={() => onOpenMenu(item.category)}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel={`${item.name}, ₹${item.price}. View ${item.category} menu`}
            >
              <View style={styles.photo}>
                <Image source={{ uri: item.image }} style={styles.image} />
                <Text style={styles.price}>From ₹{item.price}</Text>
              </View>
              <View style={styles.body}>
                <Text style={styles.title} numberOfLines={2}>{item.name}</Text>
                <Text style={styles.description} numberOfLines={2}>{item.description}</Text>
                <View style={styles.action}>
                  <Text style={styles.menuLink}>View menu</Text>
                  <Ionicons name="arrow-forward" size={12} color={theme.primary} />
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      ) : <Text style={styles.empty}>No matching dishes. Try another search or filter.</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  headingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8, paddingHorizontal: 16, marginBottom: 12 },
  heading: { flexShrink: 1, fontFamily: theme.headingFont, fontSize: 20, fontWeight: '700', color: theme.text },
  menuLink: { color: theme.primary, fontSize: 11, fontWeight: '700' },
  filters: { paddingHorizontal: 16, gap: 8, paddingBottom: 14 },
  filter: { backgroundColor: theme.card, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: theme.border },
  filterActive: { backgroundColor: theme.primary, borderColor: theme.primary },
  filterText: { fontSize: 11, color: theme.text },
  filterTextActive: { color: theme.card },
  dishes: { paddingHorizontal: 16, gap: 12, paddingBottom: 3 },
  card: { width: 164, backgroundColor: theme.card, borderWidth: 1, borderColor: theme.border, borderRadius: 14, overflow: 'hidden' },
  photo: { height: 112, backgroundColor: theme.header },
  image: { width: '100%', height: '100%' },
  price: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingVertical: 7, paddingHorizontal: 10, backgroundColor: 'rgba(84,39,25,0.86)', color: theme.card, fontSize: 12, fontWeight: '700' },
  body: { padding: 10, flex: 1 },
  title: { fontFamily: theme.headingFont, color: theme.text, fontSize: 14, fontWeight: '700', minHeight: 36, lineHeight: 18 },
  description: { fontSize: 10, lineHeight: 15, color: theme.muted, minHeight: 30, marginVertical: 5 },
  action: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', paddingVertical: 6 },
  empty: { color: theme.muted, fontSize: 12, paddingHorizontal: 16, paddingVertical: 16 },
});
