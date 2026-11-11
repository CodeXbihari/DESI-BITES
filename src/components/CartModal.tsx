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
              <Ionicons name="close" size={20} color={colors.text} />
            </TouchableOpacity>
          </View>

          {cart.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="basket-outline" size={72} color={colors.textLight} />
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
                  <Ionicons name="bicycle" size={18} color={colors.secondary} />
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
                          <Ionicons name="remove" size={14} color={colors.primary} />
                        </TouchableOpacity>
                        <Text style={styles.stepCount}>{item.quantity}</Text>
                        <TouchableOpacity
                          style={styles.stepBtn}
                          onPress={() =>
                            updateQuantity(item.product.id, item.quantity + 1)
                          }
                        >
                          <Ionicons name="add" size={14} color={colors.primary} />
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
                        <Ionicons name="checkmark-circle" size={16} color={colors.secondary} />
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
                      <Text style={[styles.billLabel, { color: colors.secondary }]}>
                        Coupon Discount
                      </Text>
                      <Text style={[styles.billValue, { color: colors.secondary }]}>
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
                  <Ionicons name="chevron-forward" size={18} color="#FFFFFF" />
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
    backgroundColor: colors.background,
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
    backgroundColor: colors.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
  },
  headerSubtitle: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.background,
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
    color: colors.text,
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
  shopNowBtn: {
    marginTop: 20,
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  shopNowBtnText: {
    color: '#FFFFFF',
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
    backgroundColor: colors.secondaryLight,
    padding: 10,
    borderRadius: 10,
    gap: 8,
    marginBottom: 12,
  },
  freeDeliveryText: {
    color: colors.secondary,
    fontSize: 12,
    fontWeight: '700',
  },
  itemsSection: {
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginBottom: 12,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  itemImage: {
    width: 52,
    height: 52,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
  },
  itemInfo: {
    flex: 1,
    marginLeft: 12,
  },
  itemName: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
  },
  itemWeight: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  itemPrice: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.text,
    marginTop: 3,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.primaryLight,
    backgroundColor: '#FFF7ED',
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
    color: colors.primary,
    minWidth: 14,
    textAlign: 'center',
  },
  sectionCard: {
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 10,
  },
  couponInputRow: {
    flexDirection: 'row',
    gap: 8,
  },
  couponInput: {
    flex: 1,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    fontSize: 13,
    height: 40,
    fontWeight: '600',
  },
  applyBtn: {
    backgroundColor: colors.text,
    paddingHorizontal: 16,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  applyBtnText: {
    color: '#FFFFFF',
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
    backgroundColor: '#FFF7ED',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.primaryLight,
  },
  quickChipText: {
    fontSize: 11,
    color: colors.primary,
    fontWeight: '700',
  },
  appliedCouponRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.secondaryLight,
    padding: 10,
    borderRadius: 8,
  },
  couponTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  couponTagText: {
    color: colors.secondary,
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
    color: colors.textMuted,
  },
  billValue: {
    fontSize: 13,
    color: colors.text,
    fontWeight: '600',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    paddingTop: 8,
    marginTop: 8,
  },
  grandTotalLabel: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.text,
  },
  grandTotalValue: {
    fontSize: 17,
    fontWeight: '900',
    color: colors.primary,
  },
  footer: {
    backgroundColor: colors.card,
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerLabel: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '500',
  },
  footerTotal: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.text,
  },
  checkoutBtn: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 6,
  },
  checkoutBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
});

