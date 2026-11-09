import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CATEGORIES } from '../data/mockData';
import { useApp } from '../context/AppContext';
import { colors } from '../theme/colors';
import { homeTheme as theme } from '../theme/homeTheme';

interface CategoryPillsProps { variant?: 'default' | 'home' }

export const CategoryPills: React.FC<CategoryPillsProps> = ({ variant = 'default' }) => {
  const { activeCategory, setActiveCategory } = useApp();
  const isHome = variant === 'home';

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {CATEGORIES.map((cat) => {
          const isActive = activeCategory === cat.id;
          return (
            <TouchableOpacity
              key={cat.id}
              activeOpacity={0.7}
              onPress={() => setActiveCategory(cat.id)}
              style={[
                styles.pill,
                isHome && homeStyles.pill,
                isActive && styles.pillActive,
                isHome && isActive && homeStyles.pillActive,
              ]}
            >
              <Ionicons
                name={cat.icon as any}
                size={16}
                color={isActive ? (isHome ? theme.card : '#FFFFFF') : (isHome ? theme.muted : colors.textMuted)}
              />
              <Text
                style={[
                  styles.pillText,
                  isHome && homeStyles.pillText,
                  isActive && styles.pillTextActive,
                ]}
              >
                {cat.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 6,
  },
  pillActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  pillText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
  },
  pillTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});

const homeStyles = StyleSheet.create({
  pill: { backgroundColor: theme.card, borderColor: theme.border, paddingHorizontal: 12 },
  pillActive: { backgroundColor: theme.primary, borderColor: theme.primary },
  pillText: { color: theme.text, fontSize: 11 },
});

