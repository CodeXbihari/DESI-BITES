import React from 'react';
import { View, Text, StyleSheet, FlatList, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '../components/Header';
import { BannerSlider } from '../components/BannerSlider';
import { CategoryPills } from '../components/CategoryPills';
import { ProductCard } from '../components/ProductCard';
import { useApp } from '../context/AppContext';
import { colors } from '../theme/colors';

export const HomeScreen: React.FC = () => {
  const { products, activeCategory, searchQuery } = useApp();

  const filteredProducts = products.filter(product => {
    const matchesCategory =
      activeCategory === 'all' || product.category === activeCategory;
    const matchesSearch =
      searchQuery.trim() === '' ||
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (product.hindiName && product.hindiName.includes(searchQuery));
    return matchesCategory && matchesSearch;
  });

  return (
    <View style={styles.container}>
      <Header />
      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <>
            {searchQuery === '' && (
              <>
                <BannerSlider />
                {/* 12-Min Promise Ribbon */}
                <View style={styles.promiseBanner}>
                  <View style={styles.promiseItem}>
                    <Ionicons name="flash" size={16} color={colors.primary} />
                    <Text style={styles.promiseText}>12-15 Mins</Text>
                  </View>
                  <View style={styles.promiseDivider} />
                  <View style={styles.promiseItem}>
                    <Ionicons name="shield-checkmark" size={16} color={colors.secondary} />
                    <Text style={styles.promiseText}>100% Shudh</Text>
                  </View>
                  <View style={styles.promiseDivider} />
                  <View style={styles.promiseItem}>
                    <Ionicons name="pricetags" size={16} color={colors.accent} />
                    <Text style={styles.promiseText}>Best Price</Text>
                  </View>
                </View>
              </>
            )}

            <CategoryPills />

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                {searchQuery
                  ? `Results for "${searchQuery}"`
                  : activeCategory === 'all'
                  ? 'Desi Favorites & Essentials'
                  : 'Items in category'}
              </Text>
              <Text style={styles.itemsCount}>
                {filteredProducts.length} items
              </Text>
            </View>
          </>
        }
        renderItem={({ item }) => (
          <View style={styles.cardWrapper}>
            <ProductCard product={item} />
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="search-outline" size={48} color={colors.textLight} />
            <Text style={styles.emptyText}>No items found</Text>
            <Text style={styles.emptySubText}>
              Try searching for something else like "atta", "paneer", or "ghee"
            </Text>
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
  listContent: {
    paddingBottom: 110,
  },
  promiseBanner: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: colors.card,
    marginHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginBottom: 8,
  },
  promiseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  promiseText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text,
  },
  promiseDivider: {
    width: 1,
    height: 16,
    backgroundColor: colors.border,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: 14,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
  },
  itemsCount: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '600',
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
  emptyText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginTop: 12,
  },
  emptySubText: {
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 4,
  },
});

