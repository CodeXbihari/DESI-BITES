import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { useApp } from '../context/AppContext';

export const Header: React.FC = () => {
  const { fulfillment, deliveryAddressDraft, searchQuery, setSearchQuery, cartCount, setIsCartOpen } = useApp();

  return (
    <View style={styles.container}>
      {/* Top Location & Profile Row */}
      <View style={styles.topRow}>
        <View style={styles.locationContainer}>
          <View style={styles.deliveryBadge}>
            <Ionicons name="flash" size={12} color="#FFFFFF" />
            <Text style={styles.deliveryBadgeText}>DESI BYTES</Text>
          </View>
          <TouchableOpacity style={styles.addressSelector} activeOpacity={0.7}>
            <Text style={styles.addressTitle} numberOfLines={1}>
              {fulfillment === 'pickup' ? 'Pickup' : 'Delivery'}
            </Text>
            <Ionicons name="chevron-down" size={16} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.addressSubtitle} numberOfLines={1}>
            {fulfillment === 'pickup' ? 'No delivery address needed' : deliveryAddressDraft.trim() || 'Enter address at checkout'}
          </Text>
        </View>

        <View style={styles.actionsRow}>
          <TouchableOpacity 
            style={styles.cartIconBtn} 
            activeOpacity={0.7}
            onPress={() => setIsCartOpen(true)}
          >
            <Ionicons name="cart-outline" size={24} color={colors.text} />
            {cartCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{cartCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Input Bar */}
      <View style={styles.searchBar}>
        <Ionicons name="search" size={20} color={colors.textMuted} style={styles.searchIcon} />
        <TextInput
          style={styles.input}
          placeholder='Search "Atta", "Gulab Jamun", "Paneer"...'
          placeholderTextColor={colors.textLight}
          value={searchQuery}
          onChangeText={setSearchQuery}
          clearButtonMode="while-editing"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons name="close-circle" size={18} color={colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  locationContainer: {
    flex: 1,
    marginRight: 12,
  },
  deliveryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: colors.primary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 4,
    gap: 3,
  },
  deliveryBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  addressSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  addressTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    maxWidth: '85%',
  },
  addressSubtitle: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cartIconBtn: {
    position: 'relative',
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: colors.primary,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    paddingVertical: 0,
  },
});

