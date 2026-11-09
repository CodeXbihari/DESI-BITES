import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  TextInput,
  Image,
  ScrollView,
  FlatList,
  Animated,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import {
  SEARCH_THEME,
  SEARCH_HEADER_IMAGE,
  SEARCH_FOOTER_LANDSCAPE,
  SEARCH_MENU_ITEMS,
  SearchMenuItem,
} from '../data/searchMenuData';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type MenuCategory = SearchMenuItem['category'];

const CATEGORY_PILLS: MenuCategory[] = ['All', 'Nashta', 'Thali', 'Mithai', 'Chai'];

interface SearchMenuScreenProps {
  onBack?: () => void;
  onViewCart?: () => void;
  initialCategory?: MenuCategory;
}

export const SearchMenuScreen: React.FC<SearchMenuScreenProps> = ({
  onBack,
  onViewCart,
  initialCategory = 'All',
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<MenuCategory>(initialCategory);
  const [cart, setCart] = useState<Record<string, number>>({});
  const searchInputRef = useRef<any>(null);

  useEffect(() => {
    setActiveCategory(initialCategory);
  }, [initialCategory]);

  // Filter items by search + category
  const filteredItems = useMemo(() => {
    return SEARCH_MENU_ITEMS.filter((item) => {
      const matchesCat = activeCategory === 'All' || item.category === activeCategory;
      const matchesSearch =
        searchQuery.trim() === '' ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.hindiName && item.hindiName.includes(searchQuery)) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCat && matchesSearch;
    });
  }, [searchQuery, activeCategory]);

  // Cart helpers
  const cartItemCount = useMemo(() => {
    return Object.values(cart).reduce((sum, qty) => sum + qty, 0);
  }, [cart]);

  const cartTotal = useMemo(() => {
    return Object.entries(cart).reduce((sum, [id, qty]) => {
      const item = SEARCH_MENU_ITEMS.find((m) => m.id === id);
      return sum + (item ? item.price * qty : 0);
    }, 0);
  }, [cart]);

  const addToCart = (id: string) => {
    setCart((prev) => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => {
      const qty = (prev[id] || 0) - 1;
      if (qty <= 0) {
        const next = { ...prev };
        delete next[id];
        return next;
      }
      return { ...prev, [id]: qty };
    });
  };

  const renderMenuItem = ({ item }: { item: SearchMenuItem }) => {
    const qty = cart[item.id] || 0;

    return (
      <View style={styles.menuItemCard}>
        {/* Thumbnail */}
        <View style={styles.thumbContainer}>
          <Image
            source={{ uri: item.image }}
            style={styles.thumbImage}
            resizeMode="cover"
          />
        </View>

        {/* Item Info */}
        <View style={styles.itemInfoColumn}>
          {/* Veg indicator + Name */}
          <View style={styles.nameRow}>
            <View
              style={[
                styles.vegIndicator,
                { borderColor: item.isVeg ? SEARCH_THEME.vegGreen : '#C62828' },
              ]}
            >
              <View
                style={[
                  styles.vegDot,
                  { backgroundColor: item.isVeg ? SEARCH_THEME.vegGreen : '#C62828' },
                ]}
              />
            </View>
            <Text style={styles.itemName} numberOfLines={1}>
              {item.name}
            </Text>
          </View>

          {/* Description */}
          <Text style={styles.itemDesc} numberOfLines={1}>
            {item.description}
          </Text>

          {/* Price */}
          <Text style={styles.itemPrice}>₹{item.price}</Text>
        </View>

        {/* ADD / Quantity Stepper */}
        <View style={styles.addButtonColumn}>
          {qty > 0 ? (
            <View style={styles.stepperContainer}>
              <TouchableOpacity
                style={styles.stepperBtn}
                onPress={() => removeFromCart(item.id)}
                activeOpacity={0.7}
              >
                <Text style={styles.stepperBtnText}>−</Text>
              </TouchableOpacity>
              <Text style={styles.stepperQty}>{qty}</Text>
              <TouchableOpacity
                style={styles.stepperBtn}
                onPress={() => addToCart(item.id)}
                activeOpacity={0.7}
              >
                <Text style={styles.stepperBtnText}>+</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.addBtn}
              onPress={() => addToCart(item.id)}
              activeOpacity={0.7}
            >
              <Text style={styles.addBtnText}>ADD</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* ── HEADER: Heritage palace artwork with wave curve ── */}
      <View style={styles.headerSection}>
        <Image
          source={{ uri: SEARCH_HEADER_IMAGE }}
          style={styles.headerImage}
          resizeMode="cover"
        />

        {/* Top Bar Overlay */}
        <SafeAreaView edges={['top']} style={styles.topNavOverlay}>
          <View style={styles.topBar}>
            {/* Back button */}
            {onBack ? (
              <TouchableOpacity
                onPress={onBack}
                style={styles.backButton}
                activeOpacity={0.7}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              >
                <Ionicons name="arrow-back" size={22} color="#FFF0D7" />
              </TouchableOpacity>
            ) : (
              <View style={{ width: 40 }} />
            )}

            {/* Cart icon with badge */}
            <TouchableOpacity
              onPress={onViewCart}
              style={styles.cartButton}
              activeOpacity={0.7}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="cart-outline" size={24} color="#FFF0D7" />
              {cartItemCount > 0 && (
                <View style={styles.cartBadge}>
                  <Text style={styles.cartBadgeText}>{cartItemCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </SafeAreaView>

        {/* Hindi Heading */}
        <View style={styles.heroTitleOverlay}>
          <Text style={styles.heroTitle}>आज क्या खाएंगे?</Text>
        </View>
      </View>

      {/* ── PARCHMENT BODY ── */}
      <View style={styles.parchmentBody}>
        {/* Lotus ornament at the wave apex */}
        <View style={styles.lotusOrnamentRow}>
          <View style={styles.lotusLeafL} />
          <View style={styles.lotusLeafC} />
          <View style={styles.lotusLeafR} />
        </View>

        {/* Search Bar */}
        <View style={styles.searchBarContainer}>
          <Ionicons
            name="search-outline"
            size={18}
            color="#8C6C58"
            style={{ marginLeft: 14 }}
          />
          <TextInput
            ref={searchInputRef}
            style={styles.searchInput}
            placeholder="Search litti, chai, thekua"
            placeholderTextColor="#A48978"
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearchQuery('')}
              style={styles.clearSearchBtn}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="close-circle" size={18} color="#8C6C58" />
            </TouchableOpacity>
          )}
        </View>

        {/* Category Filter Pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.pillsRow}
          style={styles.pillsScroll}
        >
          {CATEGORY_PILLS.map((cat) => {
            const isActive = activeCategory === cat;
            return (
              <TouchableOpacity
                key={cat}
                style={[styles.categoryPill, isActive && styles.categoryPillActive]}
                onPress={() => setActiveCategory(cat)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.categoryPillText,
                    isActive && styles.categoryPillTextActive,
                  ]}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Section Label */}
        <View style={styles.sectionLabelRow}>
          <Text style={styles.sectionLabel}>POPULAR TODAY</Text>
          <View style={styles.sectionLotus}>
            <View style={styles.sectionLeafL} />
            <View style={styles.sectionLeafC} />
            <View style={styles.sectionLeafR} />
          </View>
        </View>

        {/* Menu Items List */}
        <FlatList
          data={filteredItems}
          keyExtractor={(item) => item.id}
          renderItem={renderMenuItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.menuListContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="search-outline" size={42} color="#C4A882" />
              <Text style={styles.emptyTitle}>कुछ नहीं मिला</Text>
              <Text style={styles.emptySubtitle}>
                Try a different search or category
              </Text>
            </View>
          }
          ListFooterComponent={
            <View style={styles.footerLandscapeWrap}>
              <Image
                source={{ uri: SEARCH_FOOTER_LANDSCAPE }}
                style={styles.footerLandscapeImg}
                resizeMode="cover"
              />
            </View>
          }
        />
      </View>

      {/* ── FLOATING CART BAR ── */}
      {cartItemCount > 0 && (
        <TouchableOpacity
          style={styles.floatingCartBar}
          onPress={onViewCart}
          activeOpacity={0.85}
        >
          <View style={styles.cartBarLeft}>
            <Text style={styles.cartBarItemCount}>
              {cartItemCount} {cartItemCount === 1 ? 'Item' : 'Items'}
            </Text>
            <Text style={styles.cartBarTotal}>₹{cartTotal}</Text>
          </View>
          <View style={styles.cartBarRight}>
            <Text style={styles.cartBarBtnText}>View cart</Text>
            <Ionicons name="arrow-forward" size={16} color="#FFF0D7" />
          </View>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: SEARCH_THEME.parchmentBg,
  },

  // ── Header ──
  headerSection: {
    width: '100%',
    height: 185,
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: SEARCH_THEME.headerBg,
  },
  headerImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
  },
  topNavOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 4,
  },
  backButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartButton: {
    position: 'relative',
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadge: {
    position: 'absolute',
    top: 0,
    right: -2,
    backgroundColor: SEARCH_THEME.primaryMaroon,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 3,
    borderWidth: 1.5,
    borderColor: '#FFF0D7',
  },
  cartBadgeText: {
    color: '#FFF0D7',
    fontSize: 9,
    fontWeight: '800',
  },
  heroTitleOverlay: {
    position: 'absolute',
    bottom: 24,
    left: 20,
    right: 20,
    zIndex: 5,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFF0D7',
    textShadowColor: 'rgba(40, 15, 5, 0.6)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },

  // ── Parchment Body ──
  parchmentBody: {
    flex: 1,
    backgroundColor: SEARCH_THEME.parchmentBg,
    marginTop: -6,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    overflow: 'hidden',
  },

  // Lotus ornament
  lotusOrnamentRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 2,
    paddingTop: 10,
    paddingBottom: 6,
  },
  lotusLeafL: {
    width: 5,
    height: 9,
    backgroundColor: SEARCH_THEME.primaryMaroon,
    borderTopLeftRadius: 8,
    borderBottomRightRadius: 8,
    transform: [{ rotate: '-25deg' }],
  },
  lotusLeafC: {
    width: 7,
    height: 13,
    backgroundColor: SEARCH_THEME.primaryMaroon,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
  },
  lotusLeafR: {
    width: 5,
    height: 9,
    backgroundColor: SEARCH_THEME.primaryMaroon,
    borderTopRightRadius: 8,
    borderBottomLeftRadius: 8,
    transform: [{ rotate: '25deg' }],
  },

  // Search bar
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: SEARCH_THEME.inputBg,
    borderWidth: 1,
    borderColor: 'rgba(123, 50, 31, 0.3)',
    borderRadius: 12,
    height: 46,
    marginHorizontal: 18,
    marginTop: 4,
    marginBottom: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#71351E',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  searchInput: {
    flex: 1,
    height: '100%',
    paddingHorizontal: 10,
    fontSize: 15,
    color: SEARCH_THEME.textDarkBrown,
    fontWeight: '500',
  },
  clearSearchBtn: {
    paddingRight: 14,
    justifyContent: 'center',
  },

  // Category pills
  pillsScroll: {
    maxHeight: 44,
    marginBottom: 10,
  },
  pillsRow: {
    paddingHorizontal: 18,
    gap: 8,
    alignItems: 'center',
  },
  categoryPill: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(123, 50, 31, 0.35)',
    backgroundColor: 'transparent',
  },
  categoryPillActive: {
    backgroundColor: SEARCH_THEME.primaryMaroon,
    borderColor: SEARCH_THEME.primaryMaroon,
  },
  categoryPillText: {
    fontSize: 13,
    fontWeight: '700',
    color: SEARCH_THEME.textDarkBrown,
  },
  categoryPillTextActive: {
    color: '#FFF0D7',
  },

  // Section label
  sectionLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    marginBottom: 8,
    gap: 10,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: SEARCH_THEME.textDarkBrown,
    letterSpacing: 1.2,
  },
  sectionLotus: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 1,
  },
  sectionLeafL: {
    width: 4,
    height: 7,
    backgroundColor: SEARCH_THEME.primaryMaroon,
    borderTopLeftRadius: 6,
    borderBottomRightRadius: 6,
    transform: [{ rotate: '-25deg' }],
  },
  sectionLeafC: {
    width: 5,
    height: 10,
    backgroundColor: SEARCH_THEME.primaryMaroon,
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
  },
  sectionLeafR: {
    width: 4,
    height: 7,
    backgroundColor: SEARCH_THEME.primaryMaroon,
    borderTopRightRadius: 6,
    borderBottomLeftRadius: 6,
    transform: [{ rotate: '25deg' }],
  },

  // Menu list
  menuListContent: {
    paddingHorizontal: 18,
    paddingBottom: 90,
  },

  // Menu item card
  menuItemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: SEARCH_THEME.cardBg,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: SEARCH_THEME.cardBorder,
    padding: 10,
    marginBottom: 10,
    ...Platform.select({
      ios: {
        shadowColor: '#71351E',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  thumbContainer: {
    width: 72,
    height: 72,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#F0D8BB',
    marginRight: 12,
  },
  thumbImage: {
    width: '100%',
    height: '100%',
  },
  itemInfoColumn: {
    flex: 1,
    justifyContent: 'center',
    gap: 2,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  vegIndicator: {
    width: 14,
    height: 14,
    borderRadius: 3,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  vegDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  itemName: {
    fontSize: 15,
    fontWeight: '800',
    color: SEARCH_THEME.textDarkBrown,
    flex: 1,
  },
  itemDesc: {
    fontSize: 12,
    color: SEARCH_THEME.textMutedBrown,
    fontWeight: '500',
    marginTop: 1,
  },
  itemPrice: {
    fontSize: 15,
    fontWeight: '800',
    color: SEARCH_THEME.primaryMaroon,
    marginTop: 2,
  },

  // ADD button
  addButtonColumn: {
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  addBtn: {
    backgroundColor: SEARCH_THEME.primaryMaroon,
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 8,
    ...Platform.select({
      ios: {
        shadowColor: SEARCH_THEME.primaryMaroon,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  addBtnText: {
    color: '#FFF0D7',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.5,
  },

  // Quantity stepper
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: SEARCH_THEME.primaryMaroon,
    borderRadius: 8,
    overflow: 'hidden',
  },
  stepperBtn: {
    width: 30,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  stepperBtnText: {
    fontSize: 18,
    fontWeight: '700',
    color: SEARCH_THEME.primaryMaroon,
  },
  stepperQty: {
    width: 24,
    textAlign: 'center',
    fontSize: 15,
    fontWeight: '800',
    color: SEARCH_THEME.textDarkBrown,
  },

  // Empty state
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: SEARCH_THEME.textDarkBrown,
    marginTop: 12,
  },
  emptySubtitle: {
    fontSize: 13,
    color: SEARCH_THEME.textMutedBrown,
    marginTop: 4,
  },

  // Footer landscape
  footerLandscapeWrap: {
    width: '100%',
    height: 80,
    overflow: 'hidden',
    marginTop: 8,
    borderRadius: 12,
    opacity: 0.5,
  },
  footerLandscapeImg: {
    width: '100%',
    height: '100%',
  },

  // Floating cart bar
  floatingCartBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#3A1810',
    paddingHorizontal: 20,
    paddingVertical: 14,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        paddingBottom: 28,
      },
      android: {
        elevation: 12,
      },
    }),
  },
  cartBarLeft: {
    gap: 2,
  },
  cartBarItemCount: {
    fontSize: 12,
    fontWeight: '600',
    color: '#C4A882',
  },
  cartBarTotal: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFF0D7',
  },
  cartBarRight: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: SEARCH_THEME.primaryMaroon,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
    ...Platform.select({
      ios: {
        shadowColor: SEARCH_THEME.primaryMaroon,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.4,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  cartBarBtnText: {
    color: '#FFF0D7',
    fontSize: 14,
    fontWeight: '800',
  },
});
