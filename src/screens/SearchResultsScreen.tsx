import React, { useMemo, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { SEARCH_MENU_ITEMS } from '../data/searchMenuData';
import { RestaurantFoodCard } from '../components/RestaurantFoodCard';
import { useApp } from '../context/AppContext';
import { searchMenu } from '../services/menuSearch';
import { homeTheme as theme } from '../theme/homeTheme';
import homeSections from '../data/homeSections.json';

interface Props { initialQuery?: string; initialCollection?: 'popular' | 'recommended'; initialCategory?: string; onBack: () => void }
export function SearchResultsScreen({ initialQuery = '', initialCollection, initialCategory, onBack }: Props) {
  const [query, setQuery] = useState(initialQuery);
  const [collection, setCollection] = useState(initialCollection);
  const [category, setCategory] = useState(initialCategory);
  const { cartCount, setIsCartOpen } = useApp();
  const results = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (normalized) return searchMenu(SEARCH_MENU_ITEMS, query);
    if (category) return SEARCH_MENU_ITEMS.filter(item => item.category === category);
    return collection ? homeSections[collection].map(id => SEARCH_MENU_ITEMS.find(item => item.id === id)).filter((item): item is typeof SEARCH_MENU_ITEMS[number] => !!item) : [];
  }, [query, collection, category]);
  const updateQuery = (value: string) => { setCollection(undefined); setCategory(undefined); setQuery(value); };
  return <SafeAreaView style={styles.safe} edges={['top', 'bottom', 'left', 'right']}>
    <StatusBar style="dark" />
    <View style={styles.content}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.icon} onPress={onBack} accessibilityRole="button" accessibilityLabel="Back"><Ionicons name="arrow-back" size={27} color={theme.primary} /></TouchableOpacity>
        <Text style={styles.title}>Desi Bites</Text>
        <TouchableOpacity style={styles.icon} onPress={() => setIsCartOpen(true)} accessibilityRole="button" accessibilityLabel={`Open cart, ${cartCount} items`}><Ionicons name="cart-outline" size={29} color={theme.primary} />{cartCount > 0 && <View style={styles.badge}><Text style={styles.badgeText}>{cartCount}</Text></View>}</TouchableOpacity>
      </View>
      <View style={styles.search}>
        <Ionicons name="search-outline" size={25} color={theme.text} />
        <TextInput style={styles.input} value={query} onChangeText={updateQuery} placeholder="Search for food…" placeholderTextColor={theme.muted} autoFocus autoCapitalize="none" autoCorrect={false} returnKeyType="search" accessibilityLabel="Search the restaurant menu" />
        {!!query && <TouchableOpacity onPress={() => updateQuery('')} style={styles.icon} accessibilityRole="button" accessibilityLabel="Clear search"><Ionicons name="close" size={25} color={theme.muted} /></TouchableOpacity>}
      </View>
      <View style={styles.resultHeading}>
        <Text style={styles.heading}>{query.trim() ? <>Showing results for “<Text style={styles.query}>{query.trim()}</Text>”</> : category ? `Showing results for “${category}”` : collection ? collection === 'popular' ? 'Popular Items' : 'Recommended for You' : 'Search the Desi Bites menu'}</Text>
        {!!query.trim() && <TouchableOpacity onPress={() => updateQuery('')} accessibilityRole="button" accessibilityLabel="Clear query"><Text style={styles.clear}>Clear</Text></TouchableOpacity>}
      </View>
      <FlatList data={results} numColumns={2} keyExtractor={item => item.id} columnWrapperStyle={styles.row} contentContainerStyle={styles.list} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag" renderItem={({ item }) => <View style={styles.cell}><RestaurantFoodCard item={item} /></View>} ListEmptyComponent={<View style={styles.empty}><Ionicons name="search-outline" size={40} color={theme.muted} /><Text style={styles.emptyTitle}>{query.trim() ? 'No matching dishes' : 'What are you craving?'}</Text><Text style={styles.emptyText}>{query.trim() ? 'Try another food name or clear your search.' : 'Type a food name to find dishes across our full menu.'}</Text></View>} />
    </View>
  </SafeAreaView>;
}
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.background }, content: { flex: 1, width: '100%', maxWidth: 720, alignSelf: 'center', paddingHorizontal: 14 },
  header: { flexDirection: 'row', alignItems: 'center', paddingVertical: 13 }, icon: { width: 42, height: 42, alignItems: 'center', justifyContent: 'center' },
  title: { flex: 1, textAlign: 'center', color: theme.primary, fontSize: 25, fontWeight: '700' }, badge: { position: 'absolute', right: 0, top: 0, backgroundColor: '#EE102A', borderRadius: 12, minWidth: 20, paddingHorizontal: 4, alignItems: 'center' }, badgeText: { color: '#fff', fontSize: 12, lineHeight: 20 },
  search: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingLeft: 15, paddingRight: 5, borderRadius: 30, backgroundColor: theme.card, borderWidth: 1, borderColor: theme.border, shadowColor: theme.primary, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 5, elevation: 2 }, input: { flex: 1, minWidth: 0, paddingVertical: 14, fontSize: 17, color: theme.text },
  resultHeading: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 20 }, heading: { flex: 1, color: theme.text, fontSize: 16, fontWeight: '500' }, query: { color: theme.primary, fontWeight: '700' }, clear: { color: theme.primary, fontSize: 16 },
  row: { justifyContent: 'space-between', marginBottom: 14 }, cell: { width: '48.5%', flexGrow: 0, flexShrink: 1 }, list: { paddingBottom: 20 }, empty: { alignItems: 'center', paddingVertical: 65, paddingHorizontal: 20 }, emptyTitle: { color: theme.text, fontSize: 19, fontWeight: '600', marginTop: 14 }, emptyText: { color: theme.muted, fontSize: 14, textAlign: 'center', lineHeight: 21, marginTop: 8 },
});
