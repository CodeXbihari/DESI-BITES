import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { colors } from '../theme/colors';
import { homeTheme as theme } from '../theme/homeTheme';

interface CartFloatingBarProps {
  onBottomSpaceChange?: (height: number) => void;
  variant?: 'default' | 'home' | 'profile';
  bottomOffset?: number;
}

export const CartFloatingBar: React.FC<CartFloatingBarProps> = ({ onBottomSpaceChange, variant = 'default', bottomOffset = 60 }) => {
  const { cartCount, finalTotal, cartSubtotal, setIsCartOpen } = useApp();
  const isHome = variant === 'home';
  const usesLoginPalette = isHome || variant === 'profile';
  const isProfile = variant === 'profile';

  if (cartCount === 0) return null;

  return (
    <View
      style={[styles.outerContainer, { bottom: bottomOffset }]}
      onLayout={({ nativeEvent: { layout } }) => {
        onBottomSpaceChange?.(layout.height + bottomOffset);
      }}
    >
      <TouchableOpacity
        style={[styles.container, isHome && homeStyles.container, isProfile && profileStyles.container]}
        activeOpacity={0.9}
        onPress={() => setIsCartOpen(true)}
        accessibilityRole="button"
        accessibilityLabel={`View cart, ${cartCount} items, ₹${isHome ? cartSubtotal : finalTotal}`}
      >
        <View style={styles.leftInfo}>
          <View style={[styles.countBadge, isHome && homeStyles.countBadge, isProfile && profileStyles.countBadge]}>
            <Text style={[styles.countText, isProfile && profileStyles.countText]}>{cartCount}</Text>
          </View>
          <View>
            <Text style={[styles.totalText, isProfile && profileStyles.totalText]}>
              ₹{isHome ? cartSubtotal : finalTotal}
            </Text>
            <Text style={[styles.extraText, usesLoginPalette && homeStyles.extraText]}>Plus taxes & delivery</Text>
          </View>
        </View>

        <View style={[styles.rightAction, isHome && homeStyles.rightAction, isProfile && profileStyles.rightAction]}>
          <Text style={[styles.viewCartText, isProfile && profileStyles.viewCartText]}>View Cart</Text>
          <Ionicons name="arrow-forward" size={16} color={isProfile ? theme.background : '#FFFFFF'} />
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    position: 'absolute',
    bottom: 60, // Above bottom tab bar
    left: 16,
    right: 16,
    zIndex: 99,
  },
  container: {
    backgroundColor: '#1E293B',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
  },
  leftInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  countBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  countText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
  },
  totalText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  extraText: {
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: '500',
  },
  rightAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  viewCartText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});

const homeStyles = StyleSheet.create({
  container: { backgroundColor: theme.primary, borderRadius: 30, borderWidth: 1, borderColor: theme.border, shadowColor: theme.text, flexWrap: 'wrap', gap: 8 },
  countBadge: { backgroundColor: theme.primaryDark },
  extraText: { color: theme.background },
  rightAction: { backgroundColor: theme.primaryDark, paddingHorizontal: 10 },
});

const profileStyles = StyleSheet.create({
  container: { backgroundColor: theme.primary, shadowColor: theme.text },
  countBadge: { backgroundColor: theme.primaryDark },
  countText: { color: theme.background },
  totalText: { color: theme.background },
  rightAction: { backgroundColor: theme.primaryDark },
  viewCartText: { color: theme.background },
});

