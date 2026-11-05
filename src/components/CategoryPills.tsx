import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CATEGORIES } from '../data/mockData';
import { useApp } from '../context/AppContext';
import { colors } from '../theme/colors';

export const CategoryPills: React.FC = () => {
  const { activeCategory, setActiveCategory } = useApp();

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
                isActive && styles.pillActive,
              ]}
            >
              <Ionicons
                name={cat.icon as any}
                size={16}
                color={isActive ? '#FFFFFF' : colors.textMuted}
              />
              <Text
                style={[
                  styles.pillText,
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

