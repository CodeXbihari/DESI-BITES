import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SEARCH_MENU_ITEMS } from '../data/searchMenuData';
import { homeTheme as theme } from '../theme/homeTheme';

interface HomeServiceCardsProps {
  onOpenFood: () => void;
  onOpenEssentials: () => void;
}

export function HomeServiceCards({ onOpenFood, onOpenEssentials }: HomeServiceCardsProps) {
  return (
    <View style={styles.row}>
      <TouchableOpacity
        style={[styles.card, styles.foodCard]}
        onPress={onOpenFood}
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityLabel="Explore food delivery menu"
      >
        <Image source={{ uri: SEARCH_MENU_ITEMS[7].image }} style={styles.image} />
        <Text style={styles.title}>Food delivery</Text>
        <Text style={styles.subtitle}>Fresh, local & full of flavour</Text>
        <Text style={styles.tag}>EXPLORE MENU</Text>
        <View style={styles.arrow}><Ionicons name="arrow-forward" size={15} color={theme.card} /></View>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.card}
        onPress={onOpenEssentials}
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityLabel="Shop daily essentials"
      >
        <Image source={{ uri: SEARCH_MENU_ITEMS[5].image }} style={styles.image} />
        <Text style={styles.title}>Daily essentials</Text>
        <Text style={styles.subtitle}>Your everyday desi staples</Text>
        <Text style={styles.tag}>12–15 MINS</Text>
        <View style={styles.arrow}><Ionicons name="arrow-forward" size={15} color={theme.card} /></View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 12, paddingHorizontal: 16, marginBottom: 4 },
  card: {
    flex: 1, minHeight: 150, padding: 12, borderRadius: 16, overflow: 'hidden',
    backgroundColor: theme.card, borderWidth: 1, borderColor: theme.border,
  },
  foodCard: { backgroundColor: '#F9E6CA' },
  image: {
    position: 'absolute', width: 88, height: 76, borderRadius: 44,
    bottom: -10, right: -14, transform: [{ rotate: '-7deg' }],
  },
  title: { color: theme.text, fontFamily: theme.headingFont, fontSize: 18, fontWeight: '700', marginBottom: 5 },
  subtitle: { color: theme.muted, fontSize: 10, lineHeight: 15, maxWidth: 150 },
  tag: {
    alignSelf: 'flex-start', fontSize: 9, letterSpacing: 0.4, fontWeight: '800',
    color: theme.primary, backgroundColor: '#F5E0C3', paddingHorizontal: 6,
    paddingVertical: 4, borderRadius: 5, marginTop: 10, marginBottom: 12,
  },
  arrow: {
    width: 26, height: 26, borderRadius: 13, backgroundColor: theme.primary,
    alignItems: 'center', justifyContent: 'center', marginTop: 'auto',
  },
});
