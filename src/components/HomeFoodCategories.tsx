import React from 'react';
import { ScrollView, View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { SEARCH_MENU_ITEMS, type SearchMenuItem } from '../data/searchMenuData';
import { homeTheme as theme } from '../theme/homeTheme';
const categories = ['Pizza', 'Sandwiches', 'Burgers', 'Pasta', 'Taste of Bihar', 'Maggi', 'Rolls', 'Juice', 'Lassi', 'Paratha'];
export function HomeFoodCategories({ onOpenMenu }: { onOpenMenu: (category: SearchMenuItem['category']) => void }) {
  return <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.list}>
    {categories.map(category => { const item = SEARCH_MENU_ITEMS.find(entry => entry.category === category); return item ? <TouchableOpacity key={category} style={styles.category} onPress={() => onOpenMenu(category)} accessibilityRole="button" accessibilityLabel={`Browse ${category}`}><View style={styles.photo}><Image source={{ uri: item.image }} style={styles.image} /></View><Text style={styles.label}>{category}</Text></TouchableOpacity> : null; })}
  </ScrollView>;
}
const styles = StyleSheet.create({ list: { gap: 12, paddingHorizontal: 16, paddingTop: 16 }, category: { width: 71, alignItems: 'center' }, photo: { width: 71, height: 65, backgroundColor: '#FBE6D4', borderRadius: 20, overflow: 'hidden' }, image: { width: '100%', height: '100%' }, label: { fontSize: 12, color: theme.text, textAlign: 'center', marginTop: 6, lineHeight: 16 } });
