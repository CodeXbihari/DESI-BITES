import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BANNERS } from '../data/mockData';
import { useApp } from '../context/AppContext';
import { homeTheme as theme } from '../theme/homeTheme';
import { SEARCH_MENU_ITEMS } from '../data/searchMenuData';

interface BannerSliderProps { variant?: 'default' | 'home' }

export const BannerSlider: React.FC<BannerSliderProps> = ({ variant = 'default' }) => {
  const { applyCoupon, setIsCartOpen } = useApp();
  const [containerWidth, setContainerWidth] = useState(Dimensions.get('window').width);
  const isHome = variant === 'home';
  const bannerWidth = isHome ? Math.max(220, Math.min(320, containerWidth - 64)) : containerWidth - 48;

  const handleBannerPress = (code: string) => {
    applyCoupon(code);
    setIsCartOpen(true);
  };

  return (
    <View style={styles.container} onLayout={({ nativeEvent: { layout } }) => setContainerWidth(layout.width)}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        decelerationRate="fast"
        snapToInterval={bannerWidth + 12}
        snapToAlignment="start"
      >
        {BANNERS.map((banner, index) => (
          <TouchableOpacity
            key={banner.id}
            activeOpacity={0.9}
            style={[styles.card, { width: bannerWidth, backgroundColor: banner.bgGradient[0] }, isHome && homeStyles.card, isHome && index === 1 && homeStyles.oliveCard]}
            onPress={() => handleBannerPress(banner.code)}
            accessibilityRole="button"
            accessibilityLabel={`${banner.discount}. Apply ${banner.code} and open grocery cart`}
          >
            {isHome && <Image source={{ uri: SEARCH_MENU_ITEMS[index === 0 ? 12 : index === 1 ? 0 : 7].image }} style={homeStyles.image} />}
            <View style={styles.content}>
              <View style={styles.badge}>
                <Ionicons name="pricetag" size={12} color="#FFFFFF" />
                <Text style={[styles.badgeText, isHome && homeStyles.badgeText]}>{banner.discount}</Text>
              </View>
              <Text style={[styles.title, isHome && homeStyles.title]}>{banner.title}</Text>
              <Text style={[styles.subtitle, isHome && homeStyles.subtitle]}>{banner.subtitle}</Text>
              <View style={styles.codeRow}>
                <Text style={styles.codeLabel}>Use code:</Text>
                <View style={[styles.codeBadge, isHome && homeStyles.codeBadge]}>
                  <Text style={[styles.codeText, isHome && homeStyles.codeText]}>{banner.code}</Text>
                </View>
              </View>
            </View>
            <View style={[styles.decorIconContainer, isHome && homeStyles.hideIcon]}>
              <Ionicons name={banner.icon as any} size={64} color="rgba(255,255,255,0.22)" />
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 12,
  },
  card: {
    borderRadius: 16,
    padding: 16,
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3,
  },
  content: {
    zIndex: 1,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
    marginBottom: 6,
    gap: 4,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 4,
  },
  subtitle: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 10,
  },
  codeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  codeLabel: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 11,
    fontWeight: '500',
  },
  codeBadge: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  codeText: {
    color: '#1E293B',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  decorIconContainer: {
    position: 'absolute',
    right: 8,
    bottom: -6,
  },
});

const homeStyles = StyleSheet.create({
  card: { backgroundColor: theme.primary, borderWidth: 1, borderColor: theme.gold, padding: 17, minHeight: 150, shadowColor: theme.text, shadowOpacity: 0.1, elevation: 2 },
  oliveCard: { backgroundColor: theme.olive },
  image: { position: 'absolute', right: -20, bottom: -23, width: 120, height: 120, borderRadius: 60, opacity: 0.8, borderWidth: 3, borderColor: theme.gold },
  badgeText: { color: theme.card, fontSize: 9, letterSpacing: 1 },
  title: { fontFamily: theme.headingFont, color: theme.card, fontSize: 23, lineHeight: 27, maxWidth: '80%', marginVertical: 5 },
  subtitle: { color: theme.background, fontSize: 11, lineHeight: 16, maxWidth: '75%', marginBottom: 12 },
  codeBadge: { backgroundColor: 'transparent', borderWidth: 1, borderStyle: 'dashed', borderColor: theme.gold, paddingVertical: 4 },
  codeText: { color: theme.card, fontSize: 10 },
  hideIcon: { display: 'none' },
});

