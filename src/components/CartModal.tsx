import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Image,
  TextInput,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { colors } from '../theme/colors';
import { homeTheme } from '../theme/homeTheme';

const { height } = Dimensions.get('window');

export const CartModal: React.FC = () => {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    cartSubtotal,
    deliveryFee,
    appliedDiscount,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    finalTotal,
    setIsCheckoutOpen,
    selectedAddress,
  } = useApp();

  const [inputCoupon, setInputCoupon] = useState('');
  const [couponError, setCouponError] = useState('');

  const handleApplyCoupon = (code: string) => {
    const success = applyCoupon(code);
    if (success) {
      setCouponError('');
      setInputCoupon('');
    } else {
      setCouponError('Invalid coupon code. Try FESTIVE40 or DESIEXPRESS');
    }
  };

  const handleProceedToCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  return (
    <Modal
      visible={isCartOpen}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setIsCartOpen(false)}
    >
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.headerTitle}>My Desi Cart</Text>
              <Text style={styles.headerSubtitle}>
                Delivering to {selectedAddress.tag} ({selectedAddress.area})
              </Text>
            </View>
            <TouchableOpacity
              style={styles.closeBtn}
              accessibilityRole="button"
              accessibilityLabel="Close cart"
              onPress={() => setIsCartOpen(false)}
            >
              <Ionicons name="close" size={20} color={homeTheme.text} />
            </TouchableOpacity>
          </View>

          {cart.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="basket-outline" size={72} color={homeTheme.muted} />
              <Text style={styles.emptyTitle}>Your cart is empty</Text>
              <Text style={styles.emptySubtitle}>
                Add delicious Desi sweets, staples, and fresh dairy to get started!
              </Text>
              <TouchableOpacity
                style={styles.shopNowBtn}
                onPress={() => setIsCartOpen(false)}
              >
                <Text style={styles.shopNowBtnText}>Explore Products</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <ScrollView
                style={styles.scrollArea}
                showsVerticalScrollIndicator={false}
              >
                {/* Free Delivery Callout */}
                <View style={styles.freeDeliveryBanner}>
                  <Ionicons name="bicycle" size={18} color={homeTheme.primary} />
                  <Text style={styles.freeDeliveryText}>
                    {cartSubtotal >= 499 || appliedCoupon === 'DESIEXPRESS'
                      ? '🎉 Yay! Free delivery applied to your order'
                      : `Add ₹${499 - cartSubtotal} more for FREE delivery`}
                  </Text>
                </View>

                {/* Items List */}
                <View style={styles.itemsSection}>
                  {cart.map((item) => (
                    <View key={item.product.id} style={styles.itemRow}>
                      <Image
                        source={{ uri: item.product.image }}
                        style={styles.itemImage}
                      />
                      <View style={styles.itemInfo}>
                        <Text style={styles.itemName} numberOfLines={1}>
                          {item.product.name}
                        </Text>
                        <Text style={styles.itemWeight}>
                          {item.product.weight}
                        </Text>
                        <Text style={styles.itemPrice}>
                          ₹{item.product.price * item.quantity}
                        </Text>
                      </View>

                      {/* Stepper */}
                      <View style={styles.stepper}>
                        <TouchableOpacity
                          style={styles.stepBtn}
                          onPress={() =>
                            updateQuantity(item.product.id, item.quantity - 1)
                          }
                        >
                          <Ionicons name="remove" size={14} color={homeTheme.primary} />
                        </TouchableOpacity>
                        <Text style={styles.stepCount}>{item.quantity}</Text>
                        <TouchableOpacity
                          style={styles.stepBtn}
                          onPress={() =>
                            updateQuantity(item.product.id, item.quantity + 1)
                          }
                        >
                          <Ionicons name="add" size={14} color={homeTheme.primary} />
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))}
                </View>

                {/* Coupon Section */}
                <View style={styles.sectionCard}>
                  <Text style={styles.sectionTitle}>Apply Coupon</Text>
                  {appliedCoupon ? (
                    <View style={styles.appliedCouponRow}>
                      <View style={styles.couponTag}>
                        <Ionicons name="checkmark-circle" size={16} color={homeTheme.gold} />
                        <Text style={styles.couponTagText}>{appliedCoupon} applied!</Text>
                      </View>
                      <TouchableOpacity onPress={removeCoupon}>
                        <Text style={styles.removeCouponText}>Remove</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <>
                      <View style={styles.couponInputRow}>
                        <TextInput
                          style={styles.couponInput}
                          placeholder="Enter promo code"
                          value={inputCoupon}
                          onChangeText={setInputCoupon}
                          autoCapitalize="characters"
                        />
                        <TouchableOpacity
                          style={styles.applyBtn}
                          onPress={() => handleApplyCoupon(inputCoupon)}
                        >
                          <Text style={styles.applyBtnText}>Apply</Text>
                        </TouchableOpacity>
                      </View>
                      {couponError ? (
                        <Text style={styles.couponError}>{couponError}</Text>
                      ) : null}

                      {/* Quick Coupon Chips */}
                      <View style={styles.quickChipsRow}>
                        <TouchableOpacity
                          style={styles.quickChip}
                          onPress={() => handleApplyCoupon('FESTIVE40')}
                        >
                          <Text style={styles.quickChipText}>✨ FESTIVE40 (40% OFF)</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.quickChip}
                          onPress={() => handleApplyCoupon('DESIEXPRESS')}
                        >
                          <Text style={styles.quickChipText}>⚡ DESIEXPRESS (Free Ship)</Text>
                        </TouchableOpacity>
                      </View>
                    </>
                  )}
                </View>

                {/* Bill Breakdown */}
                <View style={styles.sectionCard}>
                  <Text style={styles.sectionTitle}>Bill Details</Text>
                  <View style={styles.billRow}>
                    <Text style={styles.billLabel}>Item Total</Text>
                    <Text style={styles.billValue}>₹{cartSubtotal}</Text>
                  </View>
                  {appliedDiscount > 0 && (
                    <View style={styles.billRow}>
                      <Text style={[styles.billLabel, { color: homeTheme.muted }]}>
                        Coupon Discount
                      </Text>
                      <Text style={[styles.billValue, { color: homeTheme.muted }]}>
                        -₹{appliedDiscount}
                      </Text>
                    </View>
                  )}
                  <View style={styles.billRow}>
                    <Text style={styles.billLabel}>Delivery Fee</Text>
                    <Text style={styles.billValue}>
                      {deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}
                    </Text>
                  </View>
                  <View style={styles.billRow}>
                    <Text style={styles.billLabel}>Handling & Packaging</Text>
                    <Text style={styles.billValue}>FREE</Text>
                  </View>
                  <View style={[styles.billRow, styles.totalRow]}>
                    <Text style={styles.grandTotalLabel}>To Pay</Text>
                    <Text style={styles.grandTotalValue}>₹{finalTotal}</Text>
                  </View>
                </View>
              </ScrollView>

              {/* Bottom Checkout CTA */}
              <View style={styles.footer}>
                <View>
                  <Text style={styles.footerLabel}>Total Amount</Text>
                  <Text style={styles.footerTotal}>₹{finalTotal}</Text>
                </View>
                <TouchableOpacity
                  style={styles.checkoutBtn}
                  activeOpacity={0.8}
                  onPress={handleProceedToCheckout}
                >
                  <Text style={styles.checkoutBtnText}>Select Address & Pay</Text>
                  <Ionicons name="chevron-forward" size={18} color={homeTheme.background} />
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: homeTheme.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: height * 0.88,
    minHeight: height * 0.5,
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 18,
    backgroundColor: homeTheme.header,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderBottomWidth: 1,
    borderBottomColor: homeTheme.border,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: homeTheme.text,
  },
  headerSubtitle: {
    fontSize: 12,
    color: homeTheme.muted,
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: homeTheme.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: homeTheme.text,
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 13,
    color: homeTheme.muted,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
  shopNowBtn: {
    marginTop: 20,
    backgroundColor: homeTheme.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  shopNowBtnText: {
    color: homeTheme.background,
    fontWeight: '700',
    fontSize: 14,
  },
  scrollArea: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  freeDeliveryBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: homeTheme.header,
    padding: 10,
    borderRadius: 10,
    gap: 8,
    marginBottom: 12,
  },
  freeDeliveryText: {
    color: homeTheme.muted,
    fontSize: 12,
    fontWeight: '700',
  },
  itemsSection: {
    backgroundColor: homeTheme.card,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: homeTheme.border,
    marginBottom: 12,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: homeTheme.border,
  },
  itemImage: {
    width: 52,
    height: 52,
    borderRadius: 8,
    backgroundColor: homeTheme.header,
  },
  itemInfo: {
    flex: 1,
    marginLeft: 12,
  },
  itemName: {
    fontSize: 13,
    fontWeight: '700',
    color: homeTheme.text,
  },
  itemWeight: {
    fontSize: 11,
    color: homeTheme.muted,
    marginTop: 2,
  },
  itemPrice: {
    fontSize: 13,
    fontWeight: '800',
    color: homeTheme.text,
    marginTop: 3,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: homeTheme.border,
    backgroundColor: homeTheme.header,
    borderRadius: 8,
    paddingHorizontal: 4,
    paddingVertical: 2,
    gap: 6,
  },
  stepBtn: {
    padding: 4,
  },
  stepCount: {
    fontSize: 12,
    fontWeight: '800',
    color: homeTheme.primary,
    minWidth: 14,
    textAlign: 'center',
  },
  sectionCard: {
    backgroundColor: homeTheme.card,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: homeTheme.border,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: homeTheme.text,
    marginBottom: 10,
  },
  couponInputRow: {
    flexDirection: 'row',
    gap: 8,
  },
  couponInput: {
    flex: 1,
    backgroundColor: homeTheme.card,
    borderWidth: 1,
    borderColor: homeTheme.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    fontSize: 13,
    height: 40,
    fontWeight: '600',
    color: homeTheme.text,
  },
  applyBtn: {
    backgroundColor: homeTheme.primaryDark,
    paddingHorizontal: 16,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  applyBtnText: {
    color: homeTheme.background,
    fontWeight: '700',
    fontSize: 13,
  },
  couponError: {
    color: colors.danger,
    fontSize: 11,
    marginTop: 6,
  },
  quickChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 10,
  },
  quickChip: {
    backgroundColor: homeTheme.header,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: homeTheme.border,
  },
  quickChipText: {
    fontSize: 11,
    color: homeTheme.primary,
    fontWeight: '700',
  },
  appliedCouponRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: homeTheme.header,
    padding: 10,
    borderRadius: 8,
  },
  couponTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  couponTagText: {
    color: homeTheme.muted,
    fontSize: 12,
    fontWeight: '700',
  },
  removeCouponText: {
    color: colors.danger,
    fontSize: 12,
    fontWeight: '700',
  },
  billRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  billLabel: {
    fontSize: 13,
    color: homeTheme.muted,
  },
  billValue: {
    fontSize: 13,
    color: homeTheme.text,
    fontWeight: '600',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: homeTheme.border,
    paddingTop: 8,
    marginTop: 8,
  },
  grandTotalLabel: {
    fontSize: 15,
    fontWeight: '800',
    color: homeTheme.text,
  },
  grandTotalValue: {
    fontSize: 17,
    fontWeight: '900',
    color: homeTheme.primary,
  },
  footer: {
    backgroundColor: homeTheme.card,
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: homeTheme.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerLabel: {
    fontSize: 11,
    color: homeTheme.muted,
    fontWeight: '500',
  },
  footerTotal: {
    fontSize: 18,
    fontWeight: '900',
    color: homeTheme.text,
  },
  checkoutBtn: {
    backgroundColor: homeTheme.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 6,
  },
  checkoutBtnText: {
    color: homeTheme.background,
    fontSize: 14,
    fontWeight: '800',
  },
});

