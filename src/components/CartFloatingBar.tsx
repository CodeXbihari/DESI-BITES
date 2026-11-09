import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { colors } from '../theme/colors';

interface CartFloatingBarProps {
  onBottomSpaceChange?: (height: number) => void;
}

export const CartFloatingBar: React.FC<CartFloatingBarProps> = ({ onBottomSpaceChange }) => {
  const { cartCount, finalTotal, setIsCartOpen } = useApp();

  if (cartCount === 0) return null;

  return (
    <View
      style={styles.outerContainer}
      onLayout={({ nativeEvent: { layout } }) => {
        onBottomSpaceChange?.(layout.height + styles.outerContainer.bottom);
      }}
    >
      <TouchableOpacity
        style={styles.container}
        activeOpacity={0.9}
        onPress={() => setIsCartOpen(true)}
      >
        <View style={styles.leftInfo}>
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{cartCount}</Text>
          </View>
          <View>
            <Text style={styles.totalText}>₹{finalTotal}</Text>
            <Text style={styles.extraText}>Plus taxes & delivery</Text>
          </View>
        </View>

        <View style={styles.rightAction}>
          <Text style={styles.viewCartText}>View Cart</Text>
          <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
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

