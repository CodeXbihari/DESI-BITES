import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Product } from '../types';
import { useApp } from '../context/AppContext';
import { colors } from '../theme/colors';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { cart, addToCart, updateQuantity, favorites, toggleFavorite } = useApp();

  const cartItem = cart.find(item => item.product.id === product.id);
  const quantity = cartItem?.quantity || 0;
  const isFav = favorites.includes(product.id);

  const discountPercent = Math.round(
    ((product.originalPrice - product.price) / product.originalPrice) * 100
  );

  return (
    <View style={styles.card}>
      {/* Image Container with Badges */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: product.image }}
          style={styles.image}
          resizeMode="cover"
        />

        {/* Favorite Icon */}
        <TouchableOpacity
          style={styles.favoriteBtn}
          onPress={() => toggleFavorite(product.id)}
          activeOpacity={0.7}
        >
          <Ionicons
            name={isFav ? 'heart' : 'heart-outline'}
            size={18}
            color={isFav ? colors.danger : colors.textMuted}
          />
        </TouchableOpacity>

        {/* Bestseller / Discount Tags */}
        <View style={styles.topBadges}>
          {product.isBestseller && (
            <View style={styles.bestsellerBadge}>
              <Text style={styles.bestsellerText}>BESTSELLER</Text>
            </View>
          )}
          {discountPercent > 0 && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>{discountPercent}% OFF</Text>
            </View>
          )}
        </View>

        {/* Delivery Time Badge */}
        <View style={styles.timeBadge}>
          <Ionicons name="time" size={11} color={colors.text} />
          <Text style={styles.timeText}>{product.deliveryMinutes} mins</Text>
        </View>
      </View>

      {/* Product Details */}
      <View style={styles.detailsContainer}>
        {/* Veg Badge & Weight */}
        <View style={styles.metaRow}>
          <View style={styles.vegIndicator}>
            <View style={styles.vegDot} />
          </View>
          <Text style={styles.weightText}>{product.weight}</Text>
        </View>

        {/* Title & Hindi Subtitle */}
        <Text style={styles.title} numberOfLines={2}>
          {product.name}
        </Text>
        {product.hindiName && (
          <Text style={styles.hindiSubtitle} numberOfLines={1}>
            {product.hindiName}
          </Text>
        )}

        {/* Rating Row */}
        <View style={styles.ratingRow}>
          <View style={styles.ratingBadge}>
            <Ionicons name="star" size={11} color="#FFFFFF" />
            <Text style={styles.ratingText}>{product.rating.toFixed(1)}</Text>
          </View>
          <Text style={styles.ratingCount}>({product.ratingCount})</Text>
        </View>

        {/* Price & Add Action */}
        <View style={styles.bottomRow}>
          <View style={styles.priceContainer}>
            <Text style={styles.price}>₹{product.price}</Text>
            {product.originalPrice > product.price && (
              <Text style={styles.originalPrice}>₹{product.originalPrice}</Text>
            )}
          </View>

          {quantity === 0 ? (
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => addToCart(product)}
              activeOpacity={0.8}
            >
              <Text style={styles.addButtonText}>ADD</Text>
              <Ionicons name="add" size={14} color={colors.primary} />
            </TouchableOpacity>
          ) : (
            <View style={styles.stepperContainer}>
              <TouchableOpacity
                style={styles.stepperBtn}
                onPress={() => updateQuantity(product.id, quantity - 1)}
              >
                <Ionicons name="remove" size={14} color="#FFFFFF" />
              </TouchableOpacity>
              <Text style={styles.stepperCount}>{quantity}</Text>
              <TouchableOpacity
                style={styles.stepperBtn}
                onPress={() => updateQuantity(product.id, quantity + 1)}
              >
                <Ionicons name="add" size={14} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.borderLight,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 12,
  },
  imageContainer: {
    width: '100%',
    height: 140,
    backgroundColor: '#F1F5F9',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  favoriteBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  topBadges: {
    position: 'absolute',
    top: 8,
    left: 8,
    gap: 4,
  },
  bestsellerBadge: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  bestsellerText: {
    color: '#F8FAFC',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  discountBadge: {
    backgroundColor: colors.secondary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  discountText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
  timeBadge: {
    position: 'absolute',
    bottom: 6,
    left: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    gap: 3,
  },
  timeText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.text,
  },
  detailsContainer: {
    padding: 10,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  vegIndicator: {
    width: 13,
    height: 13,
    borderWidth: 1.5,
    borderColor: colors.veg,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 2,
  },
  vegDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: colors.veg,
  },
  weightText: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '500',
  },
  title: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
    minHeight: 34,
    lineHeight: 17,
  },
  hindiSubtitle: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 1,
    marginBottom: 4,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginVertical: 4,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#15803D',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
    gap: 2,
  },
  ratingText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  ratingCount: {
    fontSize: 10,
    color: colors.textLight,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  price: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.text,
  },
  originalPrice: {
    fontSize: 11,
    color: colors.textLight,
    textDecorationLine: 'line-through',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF5EB',
    borderWidth: 1,
    borderColor: colors.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
    gap: 2,
  },
  addButtonText: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.primary,
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingHorizontal: 4,
    paddingVertical: 3,
    gap: 8,
  },
  stepperBtn: {
    padding: 2,
  },
  stepperCount: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
    minWidth: 16,
    textAlign: 'center',
  },
});

