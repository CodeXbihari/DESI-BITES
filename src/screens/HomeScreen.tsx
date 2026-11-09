import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '../components/Header';
import { BannerSlider } from '../components/BannerSlider';
import { CategoryPills } from '../components/CategoryPills';
import { ProductCard } from '../components/ProductCard';
import { HomeServiceCards } from '../components/HomeServiceCards';
import { HomeFoodCategories } from '../components/HomeFoodCategories';
import { HomeFoodDiscovery } from '../components/HomeFoodDiscovery';
import { useApp } from '../context/AppContext';
import { homeTheme as theme } from '../theme/homeTheme';
import type { SearchMenuItem } from '../data/searchMenuData';
import type { Product } from '../types';

interface HomeScreenProps {
  bottomContentInset?: number;
  onOpenMenu: (category: SearchMenuItem['category']) => void;
  onOpenProfile: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  bottomContentInset = 0,
  onOpenMenu,
  onOpenProfile,
}) => {
  const { products, activeCategory, searchQuery } = useApp();
  const listRef = useRef<FlatList<Product>>(null);
  const [essentialsOffset, setEssentialsOffset] = useState(0);
  const query = searchQuery.trim().toLowerCase();

  const filteredProducts = products.filter(product => {
    const matchesCategory = activeCategory === 'all' || product.category === activeCategory;
    const matchesSearch = !query || product.name.toLowerCase().includes(query)
      || product.hindiName?.includes(query);
    return matchesCategory && matchesSearch;
  });

  const openEssentials = () => {
    listRef.current?.scrollToOffset({ offset: essentialsOffset, animated: true });
  };

  return (
    <View style={styles.container}>
      <Header variant="home" onOpenProfile={onOpenProfile} />
      <FlatList
        ref={listRef}
        testID="home-product-list"
        style={styles.list}
        data={filteredProducts}
        keyExtractor={item => item.id}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        contentContainerStyle={[styles.listContent, { paddingBottom: bottomContentInset }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View>
            {!query && (
              <>
                <Text style={styles.welcome}>What sounds <Text style={styles.welcomeAccent}>good today?</Text></Text>
                <HomeServiceCards onOpenFood={() => onOpenMenu('All')} onOpenEssentials={openEssentials} />
                <BannerSlider variant="home" />
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>What's on your mind?</Text>
                  <TouchableOpacity onPress={() => onOpenMenu('All')} accessibilityRole="button" accessibilityLabel="Browse all food categories">
                    <Text style={styles.sectionLink}>See all →</Text>
                  </TouchableOpacity>
                </View>
                <HomeFoodCategories onOpenMenu={onOpenMenu} />
                <View style={styles.divider} accessible={false}>
                  <View style={styles.dividerLine} />
                  <Ionicons name="leaf-outline" size={15} color={theme.gold} />
                  <View style={styles.dividerLine} />
                </View>
              </>
            )}
            <HomeFoodDiscovery searchQuery={searchQuery} onOpenMenu={onOpenMenu} />
            <View onLayout={({ nativeEvent: { layout } }) => setEssentialsOffset(layout.y)}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>{query ? 'Matching essentials' : 'Your daily essentials'}</Text>
                <Text style={styles.itemsCount}>{filteredProducts.length} items</Text>
              </View>
              <CategoryPills variant="home" />
            </View>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.cardWrapper}>
            <ProductCard product={item} variant="home" />
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="search-outline" size={38} color={theme.muted} />
            <Text style={styles.emptyText}>No matching essentials</Text>
            <Text style={styles.emptySubText}>Try another search or choose a different grocery category.</Text>
          </View>
        }
        ListFooterComponent={
          <Image
            source={require('../../assets/images/login_footer_landscape.jpg')}
            style={styles.footer}
            resizeMode="cover"
            accessible={false}
          />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, width: '100%', maxWidth: 720, alignSelf: 'center', backgroundColor: theme.background },
  list: { flex: 1 },
  listContent: { flexGrow: 1 },
  welcome: { fontFamily: theme.headingFont, fontSize: 24, lineHeight: 31, fontWeight: '700', color: theme.text, marginHorizontal: 16, marginTop: 20, marginBottom: 14 },
  welcomeAccent: { color: theme.primary },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8, paddingHorizontal: 16, marginTop: 22, marginBottom: 14 },
  sectionTitle: { flexShrink: 1, fontFamily: theme.headingFont, fontSize: 20, fontWeight: '700', color: theme.text },
  sectionLink: { color: theme.primary, fontSize: 11, fontWeight: '700' },
  itemsCount: { fontSize: 11, color: theme.muted },
  divider: { flexDirection: 'row', alignItems: 'center', gap: 10, marginHorizontal: 16, marginTop: 24, marginBottom: 22 },
  dividerLine: { flex: 1, height: 1, backgroundColor: theme.border },
  columnWrapper: { paddingHorizontal: 16, justifyContent: 'space-between' },
  cardWrapper: { width: '48.5%', paddingTop: 8 },
  emptyContainer: { alignItems: 'center', padding: 28 },
  emptyText: { fontFamily: theme.headingFont, fontSize: 17, color: theme.text, fontWeight: '700', marginTop: 12 },
  emptySubText: { color: theme.muted, fontSize: 12, textAlign: 'center', lineHeight: 18, marginTop: 6 },
  footer: { width: '100%', height: 96 },
});
