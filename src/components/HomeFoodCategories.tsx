import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { SEARCH_MENU_ITEMS, type SearchMenuItem } from '../data/searchMenuData';
import { homeTheme as theme } from '../theme/homeTheme';

interface HomeFoodCategoriesProps {
  onOpenMenu: (category: SearchMenuItem['category']) => void;
}

const categories = [
  { id: 'sm_1', label: 'Litti Chokha' },
  { id: 'sm_2', label: 'Paratha' },
  { id: 'sm_6', label: 'Thali' },
  { id: 'sm_3', label: 'Chai' },
  { id: 'sm_8', label: 'Biryani' },
  { id: 'sm_13', label: 'Mithai' },
  { id: 'sm_4', label: 'Thekua' },
  { id: 'sm_15', label: 'Lassi' },
];

export function HomeFoodCategories({ onOpenMenu }: HomeFoodCategoriesProps) {
  return (
    <View style={styles.grid}>
      {categories.map(category => {
        const item = SEARCH_MENU_ITEMS.find(dish => dish.id === category.id);
        if (!item) return null;
        return (
          <TouchableOpacity
            key={category.id}
            style={styles.category}
            onPress={() => onOpenMenu(item.category)}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel={`Browse ${category.label}`}
          >
            <Image source={{ uri: item.image }} style={styles.image} />
            <Text style={styles.label}>{category.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 10, rowGap: 16, paddingBottom: 6 },
  category: { width: '25%', alignItems: 'center', paddingHorizontal: 6 },
  image: {
    width: '100%', maxWidth: 66, aspectRatio: 1, borderRadius: 40,
    borderWidth: 3, borderColor: theme.card, backgroundColor: theme.header, marginBottom: 8,
  },
  label: { fontSize: 11, color: theme.text, textAlign: 'center', lineHeight: 15 },
});
