import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CATEGORIES } from '../data/mockData';
import { ProductCard } from '../components/ProductCard';
import { useApp } from '../context/AppContext';
import { colors } from '../theme/colors';

export const ExploreScreen: React.FC = () => {
  const { products, activeCategory, setActiveCategory } = useApp();
  const [filterBestseller, setFilterBestseller] = useState(false);
  const [filterUnder200, setFilterUnder200] = useState(false);

  const filtered = products.filter(p => {
    const matchesCat = activeCategory === 'all' || p.category === activeCategory;
    const matchesBestseller = !filterBestseller || p.isBestseller;
    const matchesPrice = !filterUnder200 || p.price <= 200;
    return matchesCat && matchesBestseller && matchesPrice;
  });

  return (
    <View style={styles.container}>
      {/* Screen Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Explore Desi Market</Text>
        <Text style={styles.subtitle}>Handpicked authentic categories & spices</Text>
      </View>

      {/* Category Icons Row */}
      <View style={styles.catGrid}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catList}>
          {CATEGORIES.map(cat => {
            const isSelected = activeCategory === cat.id;
            return (
              <TouchableOpacity
                key={cat.id}
                style={[styles.catCard, isSelected && styles.catCardSelected]}
                onPress={() => setActiveCategory(cat.id)}
                activeOpacity={0.7}
              >
                <View style={[styles.iconWrap, isSelected && styles.iconWrapSelected]}>
                  <Ionicons
                    name={cat.icon as any}
                    size={20}
                    color={isSelected ? '#FFFFFF' : colors.primary}
                  />
                </View>
                <Text style={[styles.catName, isSelected && styles.catNameSelected]} numberOfLines={1}>
                  {cat.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Filter Badges */}
      <View style={styles.filtersRow}>
        <TouchableOpacity
          style={[styles.filterChip, filterBestseller && styles.filterChipActive]}
          onPress={() => setFilterBestseller(!filterBestseller)}
        >
          <Ionicons
            name="flame"
            size={14}
            color={filterBestseller ? '#FFFFFF' : colors.textMuted}
          />
          <Text style={[styles.filterChipText, filterBestseller && styles.filterChipTextActive]}>
            Bestsellers
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterChip, filterUnder200 && styles.filterChipActive]}
          onPress={() => setFilterUnder200(!filterUnder200)}
        >
          <Ionicons
            name="pricetag"
            size={14}
            color={filterUnder200 ? '#FFFFFF' : colors.textMuted}
          />
          <Text style={[styles.filterChipText, filterUnder200 && styles.filterChipTextActive]}>
            Under ₹200
          </Text>
        </TouchableOpacity>

        {(filterBestseller || filterUnder200) && (
          <TouchableOpacity
            style={styles.clearFilters}
            onPress={() => {
              setFilterBestseller(false);
              setFilterUnder200(false);
            }}
          >
            <Text style={styles.clearFiltersText}>Clear</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Products Grid */}
      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <View style={styles.cardWrapper}>
            <ProductCard product={item} />
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="filter-outline" size={48} color={colors.textLight} />
            <Text style={styles.emptyTitle}>No matching items</Text>
            <Text style={styles.emptySub}>Try removing some filters</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    backgroundColor: colors.card,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
  },
  subtitle: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  catGrid: {
    backgroundColor: colors.card,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  catList: {
    paddingHorizontal: 16,
    gap: 12,
  },
  catCard: {
    alignItems: 'center',
    width: 76,
  },
  catCardSelected: {
    transform: [{ scale: 1.05 }],
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFF7ED',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
    borderWidth: 1,
    borderColor: colors.primaryLight,
  },
  iconWrapSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  catName: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textMuted,
    textAlign: 'center',
  },
  catNameSelected: {
    color: colors.primary,
    fontWeight: '700',
  },
  filtersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 4,
  },
  filterChipActive: {
    backgroundColor: colors.text,
    borderColor: colors.text,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  clearFilters: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  clearFiltersText: {
    color: colors.danger,
    fontSize: 12,
    fontWeight: '700',
  },
  listContent: {
    paddingBottom: 110,
  },
  columnWrapper: {
    paddingHorizontal: 16,
    justifyContent: 'space-between',
  },
  cardWrapper: {
    width: '48.5%',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginTop: 12,
  },
  emptySub: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 4,
  },
});

