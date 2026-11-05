import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BANNERS } from '../data/mockData';
import { useApp } from '../context/AppContext';

const { width } = Dimensions.get('window');
const BANNER_WIDTH = width - 48;

export const BannerSlider: React.FC = () => {
  const { applyCoupon, setIsCartOpen } = useApp();

  const handleBannerPress = (code: string) => {
    applyCoupon(code);
    setIsCartOpen(true);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        decelerationRate="fast"
        snapToInterval={BANNER_WIDTH + 12}
        snapToAlignment="start"
      >
        {BANNERS.map((banner) => (
          <TouchableOpacity
            key={banner.id}
            activeOpacity={0.9}
            style={[styles.card, { backgroundColor: banner.bgGradient[0] }]}
            onPress={() => handleBannerPress(banner.code)}
          >
            <View style={styles.content}>
              <View style={styles.badge}>
                <Ionicons name="pricetag" size={12} color="#FFFFFF" />
                <Text style={styles.badgeText}>{banner.discount}</Text>
              </View>
              <Text style={styles.title}>{banner.title}</Text>
              <Text style={styles.subtitle}>{banner.subtitle}</Text>
              <View style={styles.codeRow}>
                <Text style={styles.codeLabel}>Use code:</Text>
                <View style={styles.codeBadge}>
                  <Text style={styles.codeText}>{banner.code}</Text>
                </View>
              </View>
            </View>
            <View style={styles.decorIconContainer}>
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
    width: BANNER_WIDTH,
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

