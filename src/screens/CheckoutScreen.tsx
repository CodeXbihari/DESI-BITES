import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import {
  CHECKOUT_THEME,
  CHECKOUT_HEADER_IMAGE,
  CHECKOUT_FOOTER_IMAGE,
} from '../data/checkoutData';

import { useApp } from '../context/AppContext';
import { canReviewCheckout } from '../services/cart';

interface CheckoutScreenProps {
  onBack?: () => void;
}

export const CheckoutScreen: React.FC<CheckoutScreenProps> = ({ onBack }) => {
  const {
    cart, updateQuantity, cartSubtotal: subtotal, deliveryFee,
    appliedDiscount: discount, appliedCoupon, applyCoupon, removeCoupon,
    finalTotal: grandTotal, fulfillment, setFulfillment,
    deliveryAddressDraft, setDeliveryAddressDraft,
  } = useApp();
  const [promoCode, setPromoCode] = useState('');
  const [promoError, setPromoError] = useState('');
  const [reviewed, setReviewed] = useState(false);
  useEffect(() => {
    setReviewed(false);
  }, [cart, appliedCoupon, subtotal, deliveryFee, discount, grandTotal, fulfillment, deliveryAddressDraft]);
  const ready = canReviewCheckout(cart, fulfillment, deliveryAddressDraft);
  const items = cart.map(({ product, quantity }) => ({ ...product, quantity }));

  const handleApplyPromo = () => {
    setPromoError('');
    if (appliedCoupon) removeCoupon();
    else if (applyCoupon(promoCode)) setPromoCode('');
    else setPromoError('Invalid coupon. Try FESTIVE40, SPICE20 or DESIEXPRESS.');
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── 1. HEADER SECTION (HERITAGE TEMPLE SILHOUETTE, NO APP NAME) ── */}
        <View style={styles.headerSection}>
          <Image
            source={{ uri: CHECKOUT_HEADER_IMAGE }}
            style={styles.headerImage}
            resizeMode="cover"
          />

          {/* Top Navigation Bar: Back Button (Left), Help (Right), NO APP NAME */}
          <SafeAreaView edges={['top']} style={styles.topNavOverlay}>
            <View style={styles.topBar}>
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
                <View style={{ width: 36 }} />
              )}

              {/* Help Button (Single, Top-Right) */}
              <TouchableOpacity
                style={styles.helpButton}
                onPress={() =>
                  Alert.alert(
                    'Help & Support',
                    'Toll Free: 1800-DESI-EXP\nWhatsApp: +91 98765 43210'
                  )
                }
                activeOpacity={0.7}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              >
                <Text style={styles.helpText}>Help</Text>
                <View style={styles.helpIconCircle}>
                  <Text style={styles.helpQuestionMark}>?</Text>
                </View>
              </TouchableOpacity>
            </View>
          </SafeAreaView>

          {/* Center Titles: "आपका ऑर्डर" & "Review your order" */}
          <View style={styles.headerTitleWrap}>
            <Text style={styles.hindiTitle}>आपका ऑर्डर</Text>
            <Text style={styles.englishSubtitle}>Review your order</Text>
          </View>
        </View>

        {/* ── 2. PARCHMENT BODY CARD ── */}
        <View style={styles.parchmentBody}>
          {/* Symmetrical 3-Petal Lotus Bud at Apex */}
          <View style={styles.lotusApexRow}>
            <View style={styles.lotusLeafL} />
            <View style={styles.lotusLeafC} />
            <View style={styles.lotusLeafR} />
          </View>

          {/* Shop card */}
          <View style={styles.restaurantCard}>
            <View style={styles.clocheBadge}>
              <Ionicons name="restaurant" size={20} color="#FFF0D7" />
            </View>
            <View style={styles.restaurantInfo}>
              <Text style={styles.restaurantName}>Desi Bytes</Text>
              <View style={styles.restaurantMetaRow}>
                <Text style={styles.timeText}>Checkout review · no payment collected</Text>
              </View>
            </View>
          </View>

          {/* ── ORDER ITEMS LIST ── */}
          <View style={styles.itemsContainer}>
            {items.map((item, index) => (
              <View
                key={item.id}
                style={[
                  styles.itemRow,
                  index < items.length - 1 && styles.itemRowBorder,
                ]}
              >
                {/* Item Thumbnail */}
                <Image
                  source={{ uri: item.image }}
                  style={styles.itemThumb}
                  resizeMode="cover"
                />

                {/* Name & Variant */}
                <View style={styles.itemDetails}>
                  <Text style={styles.itemName} numberOfLines={1}>
                    {item.name}
                  </Text>
                  {item.weight ? <Text style={styles.itemVariant}>{item.weight}</Text> : null}
                </View>

                {/* Quantity Stepper: [ − 1 + ] */}
                <View style={styles.stepperBox}>
                  <TouchableOpacity
                    style={styles.stepperBtn}
                    onPress={() => updateQuantity(item.id, item.quantity - 1)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.stepperBtnText}>−</Text>
                  </TouchableOpacity>
                  <Text style={styles.stepperQty}>{item.quantity}</Text>
                  <TouchableOpacity
                    style={styles.stepperBtn}
                    onPress={() => updateQuantity(item.id, item.quantity + 1)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.stepperBtnText}>+</Text>
                  </TouchableOpacity>
                </View>

                {/* Price */}
                <Text style={styles.itemPrice}>
                  ₹{((Math.round(item.price * 100) * item.quantity) / 100).toFixed(2)}
                </Text>
              </View>
            ))}

            {items.length === 0 && (
              <Text style={styles.emptyCartText}>
                Your cart is empty. Please add items.
              </Text>
            )}
          </View>

          {/* ── PROMO CODE BAR ── */}
          <View style={styles.promoContainer}>
            <View style={styles.promoInputWrapper}>
              <View style={styles.promoIconPill}>
                <Ionicons name="pricetag" size={13} color="#861C24" />
              </View>
              <TextInput
                style={styles.promoInput}
                placeholder="Promo code"
                placeholderTextColor="#A48978"
                value={appliedCoupon ?? promoCode}
                accessibilityLabel="Coupon code"
                autoCapitalize="characters"
                onChangeText={setPromoCode}
                editable={!appliedCoupon}
              />
            </View>
            <TouchableOpacity
              style={[
                styles.applyPromoBtn,
                appliedCoupon && styles.appliedPromoBtn,
              ]}
              onPress={handleApplyPromo}
              activeOpacity={0.8}
            >
              <Text style={styles.applyPromoBtnText}>
                {appliedCoupon ? 'Remove' : 'Apply'}
              </Text>
            </TouchableOpacity>
          </View>

          {promoError ? <Text accessibilityRole="alert" style={styles.errorText}>{promoError}</Text> : null}

          <View style={styles.billCard}>
            <Text style={styles.totalLabel}>Pickup or Delivery</Text>
            <View style={styles.fulfillmentOptions}>
              {(['pickup', 'delivery'] as const).map(option => (
                <TouchableOpacity
                  key={option}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: fulfillment === option }}
                  onPress={() => { setFulfillment(option); setReviewed(false); }}
                  style={[styles.fulfillmentOption, fulfillment === option && styles.fulfillmentSelected]}
                >
                  <Text style={styles.billLabel}>{option === 'pickup' ? 'Pickup' : 'Delivery'}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.timeText}>{fulfillment === 'pickup' ? 'No delivery address or delivery fee required.' : 'Delivery is handled manually by the shop.'}</Text>
          </View>

          {/* Shared estimate */}
          <View style={styles.billCard}>
            <View style={styles.billRow}>
              <Text style={styles.billLabel}>Subtotal</Text>
              <Text style={styles.billValue}>₹{subtotal}</Text>
            </View>
            <View style={styles.billRow}>
              <Text style={styles.billLabel}>Delivery</Text>
              <Text style={styles.billValue}>₹{deliveryFee}</Text>
            </View>
            {discount > 0 && (
              <View style={styles.billRow}>
                <Text style={[styles.billLabel, { color: '#2E7D32' }]}>
                  Discount
                </Text>
                <Text style={[styles.billValue, { color: '#2E7D32' }]}>
                  −₹{discount}
                </Text>
              </View>
            )}

            <View style={styles.billDivider} />

            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Estimated total</Text>
              <Text style={styles.totalValue}>₹{grandTotal}</Text>
            </View>
          </View>

          {fulfillment === 'delivery' && (
            <View style={styles.billCard}>
              <Text style={styles.addressTitle}>Delivery address (required)</Text>
              <TextInput
                accessibilityLabel="Delivery address"
                style={styles.addressInput}
                value={deliveryAddressDraft}
                onChangeText={value => { setDeliveryAddressDraft(value); setReviewed(false); }}
                placeholder="Enter your full delivery address"
                placeholderTextColor={CHECKOUT_THEME.textMutedBrown}
                multiline
                textAlignVertical="top"
              />
              {!deliveryAddressDraft.trim() && <Text style={styles.errorText}>Enter a delivery address to review checkout.</Text>}
            </View>
          )}

          <Text style={styles.reviewNotice}>
            Estimate only. Pricing and coupons are temporary, pending shop-owner confirmation.
            No payment is collected and no order is created.
          </Text>
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityState={{ disabled: !ready }}
            disabled={!ready}
            style={[styles.continueButton, !ready && styles.disabledButton]}
            onPress={() => setReviewed(true)}
            activeOpacity={0.88}
          >
            <View style={styles.continueButtonInner}>
              <Text style={styles.continueButtonText}>Review checkout · no charge</Text>
            </View>
          </TouchableOpacity>
          {reviewed && ready && (
            <Text accessibilityRole="status" style={styles.reviewNotice}>
              Your current checkout estimate is ready for review. No order has been placed and no payment collected.
            </Text>
          )}

          {/* ── BOTTOM DECORATIVE LOTUS DIVIDER ── */}
          <View style={styles.bottomDividerRow}>
            <View style={styles.dividerLine} />
            <View style={styles.bottomLotus}>
              <View style={styles.bLotusL} />
              <View style={styles.bLotusC} />
              <View style={styles.bLotusR} />
            </View>
            <View style={styles.dividerLine} />
          </View>

          {/* ── BOTTOM HERITAGE VILLAGE LANDSCAPE ── */}
          <View style={styles.footerLandscapeContainer}>
            <Image
              source={{ uri: CHECKOUT_FOOTER_IMAGE }}
              style={styles.footerLandscapeImage}
              resizeMode="cover"
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  fulfillmentOptions: { flexDirection: 'row', gap: 12, marginVertical: 12 },
  fulfillmentOption: { flex: 1, padding: 12, borderWidth: 1, borderRadius: 12, borderColor: CHECKOUT_THEME.cardBorder, alignItems: 'center' },
  fulfillmentSelected: { backgroundColor: '#F0D8BB', borderColor: CHECKOUT_THEME.primaryMaroon },
  addressInput: { minHeight: 88, padding: 12, marginTop: 8, borderWidth: 1, borderRadius: 12, borderColor: CHECKOUT_THEME.cardBorder, color: CHECKOUT_THEME.textDarkBrown, backgroundColor: CHECKOUT_THEME.inputBg },
  errorText: { color: '#A02020', marginBottom: 12, marginTop: 6, fontSize: 12 },
  reviewNotice: { color: CHECKOUT_THEME.textMutedBrown, fontSize: 12, marginBottom: 16, lineHeight: 18 },
  disabledButton: { opacity: 0.5 },
  container: {
    flex: 1,
    backgroundColor: CHECKOUT_THEME.parchmentBg,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },

  // ── Header Section ──
  headerSection: {
    width: '100%',
    height: 175,
    backgroundColor: CHECKOUT_THEME.headerBg,
    position: 'relative',
    overflow: 'hidden',
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
  helpButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    gap: 4,
  },
  helpText: {
    color: '#FFF0D7',
    fontSize: 13,
    fontWeight: '700',
  },
  helpIconCircle: {
    width: 17,
    height: 17,
    borderRadius: 8.5,
    borderWidth: 1.2,
    borderColor: '#FFF0D7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  helpQuestionMark: {
    color: '#FFF0D7',
    fontSize: 10,
    fontWeight: '800',
    marginTop: -1,
  },
  headerTitleWrap: {
    position: 'absolute',
    bottom: 22,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  hindiTitle: {
    fontFamily: 'Mukta',
    fontSize: 27,
    fontWeight: '900',
    color: '#FFF0D7',
    textShadowColor: 'rgba(30, 10, 5, 0.6)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  englishSubtitle: {
    fontSize: 13,
    color: '#FFE2AD',
    fontWeight: '500',
    marginTop: 2,
    letterSpacing: 0.3,
  },

  // ── Parchment Body ──
  parchmentBody: {
    flex: 1,
    backgroundColor: CHECKOUT_THEME.parchmentBg,
    marginTop: -8,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    paddingHorizontal: 16,
    paddingTop: 8,
  },

  // Lotus Apex
  lotusApexRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 2,
    marginBottom: 10,
  },
  lotusLeafL: {
    width: 5,
    height: 9,
    backgroundColor: CHECKOUT_THEME.primaryMaroon,
    borderTopLeftRadius: 8,
    borderBottomRightRadius: 8,
    transform: [{ rotate: '-25deg' }],
  },
  lotusLeafC: {
    width: 7,
    height: 13,
    backgroundColor: CHECKOUT_THEME.primaryMaroon,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
  },
  lotusLeafR: {
    width: 5,
    height: 9,
    backgroundColor: CHECKOUT_THEME.primaryMaroon,
    borderTopRightRadius: 8,
    borderBottomLeftRadius: 8,
    transform: [{ rotate: '25deg' }],
  },

  // Restaurant card
  restaurantCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CHECKOUT_THEME.cardBg,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: CHECKOUT_THEME.cardBorder,
    padding: 12,
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
  clocheBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: CHECKOUT_THEME.primaryMaroon,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1.5,
    borderColor: '#D6A45B',
  },
  restaurantInfo: {
    flex: 1,
  },
  restaurantName: {
    fontSize: 16,
    fontWeight: '800',
    color: CHECKOUT_THEME.textDarkBrown,
  },
  restaurantMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 3,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '700',
    color: CHECKOUT_THEME.textDarkBrown,
  },
  metaDivider: {
    fontSize: 12,
    color: '#A48978',
    marginHorizontal: 2,
  },
  timeText: {
    fontSize: 12,
    color: CHECKOUT_THEME.textMutedBrown,
    fontWeight: '500',
  },

  // Items container
  itemsContainer: {
    backgroundColor: CHECKOUT_THEME.cardBg,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: CHECKOUT_THEME.cardBorder,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 12,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  itemRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(123, 50, 31, 0.12)',
  },
  itemThumb: {
    width: 52,
    height: 52,
    borderRadius: 8,
    marginRight: 10,
    backgroundColor: '#F0D8BB',
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '800',
    color: CHECKOUT_THEME.textDarkBrown,
  },
  itemVariant: {
    fontSize: 11.5,
    color: CHECKOUT_THEME.textMutedBrown,
    marginTop: 2,
  },
  stepperBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.2,
    borderColor: 'rgba(123, 50, 31, 0.35)',
    borderRadius: 8,
    backgroundColor: '#FFF8EC',
    marginRight: 12,
    overflow: 'hidden',
  },
  stepperBtn: {
    width: 26,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepperBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: CHECKOUT_THEME.primaryMaroon,
  },
  stepperQty: {
    width: 20,
    textAlign: 'center',
    fontSize: 13,
    fontWeight: '800',
    color: CHECKOUT_THEME.textDarkBrown,
  },
  itemPrice: {
    fontSize: 15,
    fontWeight: '800',
    color: CHECKOUT_THEME.textDarkBrown,
    minWidth: 44,
    textAlign: 'right',
  },
  emptyCartText: {
    textAlign: 'center',
    paddingVertical: 20,
    color: CHECKOUT_THEME.textMutedBrown,
    fontSize: 13,
  },

  // Promo container
  promoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  promoInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CHECKOUT_THEME.inputBg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(123, 50, 31, 0.35)',
    height: 44,
    paddingHorizontal: 10,
  },
  promoIconPill: {
    marginRight: 8,
  },
  promoInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: CHECKOUT_THEME.textDarkBrown,
  },
  applyPromoBtn: {
    backgroundColor: CHECKOUT_THEME.primaryMaroon,
    borderRadius: 12,
    height: 44,
    paddingHorizontal: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  appliedPromoBtn: {
    backgroundColor: '#2E7D32',
  },
  applyPromoBtnText: {
    color: '#FFF0D7',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.5,
  },

  // Bill card
  billCard: {
    backgroundColor: CHECKOUT_THEME.cardBg,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: CHECKOUT_THEME.cardBorder,
    padding: 14,
    marginBottom: 12,
  },
  billRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  billLabel: {
    fontSize: 13,
    color: CHECKOUT_THEME.textDarkBrown,
    fontWeight: '500',
  },
  billValue: {
    fontSize: 14,
    fontWeight: '700',
    color: CHECKOUT_THEME.textDarkBrown,
  },
  billDivider: {
    height: 1,
    backgroundColor: 'rgba(123, 50, 31, 0.2)',
    marginVertical: 8,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '900',
    color: CHECKOUT_THEME.textDarkBrown,
  },
  totalValue: {
    fontSize: 20,
    fontWeight: '900',
    color: CHECKOUT_THEME.textDarkBrown,
  },

  // Address bar
  addressBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CHECKOUT_THEME.cardBg,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: CHECKOUT_THEME.cardBorder,
    padding: 12,
    marginBottom: 16,
  },
  addressTextColumn: {
    flex: 1,
  },
  addressTitle: {
    fontSize: 11,
    color: CHECKOUT_THEME.textMutedBrown,
    fontWeight: '600',
  },
  addressDetail: {
    fontSize: 12.5,
    fontWeight: '700',
    color: CHECKOUT_THEME.textDarkBrown,
    marginTop: 1,
  },
  addressActionBtn: {
    borderWidth: 1,
    borderColor: 'rgba(123, 50, 31, 0.4)',
    borderRadius: 16,
    paddingVertical: 5,
    paddingHorizontal: 12,
  },
  addressActionText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: CHECKOUT_THEME.textDarkBrown,
  },

  // Continue button
  continueButton: {
    backgroundColor: CHECKOUT_THEME.primaryMaroon,
    borderRadius: 24,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: CHECKOUT_THEME.primaryMaroon,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.35,
        shadowRadius: 6,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  continueButtonInner: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  continueButtonText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFF0D7',
    letterSpacing: 0.4,
  },

  // Bottom Lotus divider
  bottomDividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginVertical: 10,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(123, 50, 31, 0.25)',
  },
  bottomLotus: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 1.5,
  },
  bLotusL: {
    width: 4,
    height: 7,
    backgroundColor: CHECKOUT_THEME.primaryMaroon,
    borderTopLeftRadius: 6,
    borderBottomRightRadius: 6,
    transform: [{ rotate: '-25deg' }],
  },
  bLotusC: {
    width: 6,
    height: 10,
    backgroundColor: CHECKOUT_THEME.primaryMaroon,
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
  },
  bLotusR: {
    width: 4,
    height: 7,
    backgroundColor: CHECKOUT_THEME.primaryMaroon,
    borderTopRightRadius: 6,
    borderBottomLeftRadius: 6,
    transform: [{ rotate: '25deg' }],
  },

  // Footer landscape
  footerLandscapeContainer: {
    width: '100%',
    height: 70,
    overflow: 'hidden',
    borderRadius: 10,
    opacity: 0.7,
  },
  footerLandscapeImage: {
    width: '100%',
    height: '100%',
  },
});

