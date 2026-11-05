import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import {
  PAYMENT_THEME,
  PAYMENT_HEADER_IMAGE,
  PAYMENT_FOOTER_IMAGE,
  PAYMENT_OPTIONS,
  PaymentMethodId,
} from '../data/paymentData';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface PaymentScreenProps {
  amount?: number;
  onBack?: () => void;
  onPaymentSuccess?: () => void;
}

export const PaymentScreen: React.FC<PaymentScreenProps> = ({
  amount = 502,
  onBack,
  onPaymentSuccess,
}) => {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethodId>('upi');
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePay = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      Alert.alert(
        'भुगतान सफल! (Payment Successful)',
        `₹${amount} paid successfully via ${
          selectedMethod === 'upi'
            ? 'UPI (Google Pay/PhonePe)'
            : selectedMethod === 'card'
            ? 'Credit/Debit Card'
            : selectedMethod === 'netbanking'
            ? 'Net Banking'
            : 'Cash on Delivery'
        }.\n\nआपका खाना जल्द पहुंचेगा! (Your food will arrive in 25-35 mins)`,
        [
          {
            text: 'Track Order',
            onPress: () => {
              if (onPaymentSuccess) {
                onPaymentSuccess();
              }
            },
          },
        ]
      );
    }, 600);
  };

  const renderIcon = (type: string) => {
    switch (type) {
      case 'upi':
        return (
          <View style={styles.upiLogoBox}>
            <Text style={styles.upiText}>UPI</Text>
            <View style={styles.upiTriangles}>
              <View style={[styles.upiTri, { backgroundColor: '#097939' }]} />
              <View style={[styles.upiTri, { backgroundColor: '#ED752E' }]} />
            </View>
          </View>
        );
      case 'card':
        return (
          <View style={styles.cardIconBox}>
            <View style={styles.cardIconChip} />
            <View style={styles.cardIconLine} />
          </View>
        );
      case 'bank':
        return (
          <View style={styles.bankIconBox}>
            <Ionicons name="business" size={20} color="#1D4ED8" />
          </View>
        );
      case 'cash':
        return (
          <View style={styles.cashIconBox}>
            <Text style={styles.cashGlyph}>₹</Text>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* ── 1. HEADER SECTION (HERITAGE BIHARI CHARACTER, NO APP NAME) ── */}
        <View style={styles.headerSection}>
          <Image
            source={{ uri: PAYMENT_HEADER_IMAGE }}
            style={styles.headerImage}
            resizeMode="cover"
          />

          {/* Top Bar: Back Button (Left), Help (Right), NO APP NAME */}
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

              {/* Single Help Button */}
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
        </View>

        {/* ── 2. PARCHMENT BODY ── */}
        <View style={styles.parchmentBody}>
          {/* Symmetrical 3-Petal Lotus Bud at Apex */}
          <View style={styles.lotusApexRow}>
            <View style={styles.lotusLeafL} />
            <View style={styles.lotusLeafC} />
            <View style={styles.lotusLeafR} />
          </View>

          {/* Heading in Devanagari */}
          <View style={styles.titleWrap}>
            <Text style={styles.hindiHeading}>भुगतान करें</Text>
            <View style={styles.subtitleRow}>
              <View style={styles.subLine} />
              <Text style={styles.englishSubtitle}>Choose your payment method</Text>
              <View style={styles.subLine} />
            </View>
          </View>

          {/* ── TOTAL PAYABLE CARD ── */}
          <View style={styles.totalPayableCard}>
            <View style={styles.payableLeft}>
              <View style={styles.pouchIconBox}>
                <Ionicons name="bag-handle" size={18} color="#FFF0D7" />
              </View>
              <Text style={styles.payableLabel}>Total payable</Text>
            </View>
            <Text style={styles.payableAmount}>₹{amount}</Text>
          </View>

          {/* ── PAYMENT METHODS LIST ── */}
          <View style={styles.methodsList}>
            {PAYMENT_OPTIONS.map((opt) => {
              const isSelected = selectedMethod === opt.id;
              return (
                <TouchableOpacity
                  key={opt.id}
                  style={[
                    styles.methodCard,
                    isSelected && styles.methodCardActive,
                  ]}
                  onPress={() => setSelectedMethod(opt.id)}
                  activeOpacity={0.8}
                >
                  {/* Radio Indicator */}
                  <View
                    style={[
                      styles.radioCircle,
                      isSelected && styles.radioCircleActive,
                    ]}
                  >
                    {isSelected && <View style={styles.radioDot} />}
                  </View>

                  {/* Method Icon Box */}
                  <View style={styles.methodIconWrapper}>
                    {renderIcon(opt.iconType)}
                  </View>

                  {/* Method Vertical Divider */}
                  <View style={styles.methodDividerV} />

                  {/* Name and Subtitle */}
                  <View style={styles.methodTextColumn}>
                    <Text style={styles.methodName}>{opt.name}</Text>
                    <Text style={styles.methodSubtitle}>{opt.subtitle}</Text>
                  </View>

                  {/* Checked Badge (if selected) */}
                  {isSelected && (
                    <View style={styles.checkCircle}>
                      <Ionicons name="checkmark" size={14} color="#FFF0D7" />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* ── SECURITY ENCRYPTION ROW ── */}
          <View style={styles.securityRow}>
            <View style={styles.secLine} />
            <View style={styles.secBadge}>
              <Ionicons name="lock-closed" size={12} color="#542719" />
              <Text style={styles.secText}>
                Your payment information is secure and encrypted
              </Text>
            </View>
            <View style={styles.secLine} />
          </View>

          {/* ── PRIMARY PAY BUTTON: "Pay ₹502 →" ── */}
          <TouchableOpacity
            style={styles.payButton}
            onPress={handlePay}
            disabled={isProcessing}
            activeOpacity={0.88}
          >
            <View style={styles.payButtonInner}>
              <Text style={styles.payButtonText}>
                {isProcessing ? 'Processing...' : `Pay ₹${amount}`}
              </Text>
              <Ionicons
                name="arrow-forward"
                size={18}
                color="#FFF0D7"
                style={{ marginLeft: 8 }}
              />
            </View>
          </TouchableOpacity>

          {/* ── DETAILS PROTECTED NOTICE ── */}
          <View style={styles.bottomProtectionRow}>
            <Ionicons name="lock-closed" size={13} color="#542719" />
            <Text style={styles.bottomProtectionText}>
              Secure payment • Your details are protected
            </Text>
          </View>

          {/* ── BOTTOM LOTUS DIVIDER ── */}
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
              source={{ uri: PAYMENT_FOOTER_IMAGE }}
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
  container: {
    flex: 1,
    backgroundColor: PAYMENT_THEME.parchmentBg,
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
    height: 295,
    backgroundColor: PAYMENT_THEME.headerBg,
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

  // ── Parchment Body ──
  parchmentBody: {
    flex: 1,
    backgroundColor: PAYMENT_THEME.parchmentBg,
    marginTop: -28,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 16,
    paddingTop: 8,
  },

  lotusApexRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 2,
    marginBottom: 8,
  },
  lotusLeafL: {
    width: 5,
    height: 9,
    backgroundColor: PAYMENT_THEME.primaryMaroon,
    borderTopLeftRadius: 8,
    borderBottomRightRadius: 8,
    transform: [{ rotate: '-25deg' }],
  },
  lotusLeafC: {
    width: 7,
    height: 13,
    backgroundColor: PAYMENT_THEME.primaryMaroon,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
  },
  lotusLeafR: {
    width: 5,
    height: 9,
    backgroundColor: PAYMENT_THEME.primaryMaroon,
    borderTopRightRadius: 8,
    borderBottomLeftRadius: 8,
    transform: [{ rotate: '25deg' }],
  },

  titleWrap: {
    alignItems: 'center',
    marginBottom: 14,
  },
  hindiHeading: {
    fontFamily: 'Mukta',
    fontSize: 28,
    fontWeight: '900',
    color: PAYMENT_THEME.textDarkBrown,
    textAlign: 'center',
  },
  subtitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 2,
  },
  subLine: {
    width: 32,
    height: 1,
    backgroundColor: 'rgba(123, 50, 31, 0.4)',
  },
  englishSubtitle: {
    fontSize: 13,
    color: PAYMENT_THEME.textDarkBrown,
    fontWeight: '600',
  },

  // Total payable card
  totalPayableCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: PAYMENT_THEME.cardBg,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(123, 50, 31, 0.28)',
    paddingVertical: 12,
    paddingHorizontal: 16,
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
  payableLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  pouchIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: PAYMENT_THEME.primaryMaroon,
    justifyContent: 'center',
    alignItems: 'center',
  },
  payableLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: PAYMENT_THEME.textDarkBrown,
  },
  payableAmount: {
    fontSize: 24,
    fontWeight: '900',
    color: PAYMENT_THEME.textDarkBrown,
  },

  // Methods list
  methodsList: {
    gap: 10,
    marginBottom: 14,
  },
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: PAYMENT_THEME.cardBg,
    borderRadius: 14,
    borderWidth: 1.2,
    borderColor: 'rgba(123, 50, 31, 0.25)',
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  methodCardActive: {
    borderColor: '#7B321F',
    backgroundColor: '#FFFDF9',
    borderWidth: 1.5,
    ...Platform.select({
      ios: {
        shadowColor: '#7B321F',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.12,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.8,
    borderColor: '#8C6C58',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  radioCircleActive: {
    borderColor: PAYMENT_THEME.primaryMaroon,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: PAYMENT_THEME.primaryMaroon,
  },
  methodIconWrapper: {
    width: 58,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  methodDividerV: {
    width: 1,
    height: 28,
    backgroundColor: 'rgba(123, 50, 31, 0.2)',
    marginRight: 12,
  },
  methodTextColumn: {
    flex: 1,
  },
  methodName: {
    fontSize: 14,
    fontWeight: '800',
    color: PAYMENT_THEME.textDarkBrown,
  },
  methodSubtitle: {
    fontSize: 11.5,
    color: PAYMENT_THEME.textMutedBrown,
    marginTop: 2,
  },
  checkCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: PAYMENT_THEME.primaryMaroon,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },

  // UPI Box
  upiLogoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  upiText: {
    fontFamily: Platform.OS === 'ios' ? 'HelveticaNeue-CondensedBlack' : 'sans-serif-black',
    fontSize: 16,
    fontWeight: '900',
    fontStyle: 'italic',
    color: '#4B5563',
    letterSpacing: -0.5,
  },
  upiTriangles: {
    flexDirection: 'row',
    gap: 1.5,
  },
  upiTri: {
    width: 4,
    height: 14,
    borderRadius: 1,
    transform: [{ skewX: '-20deg' }],
  },

  // Card Icon
  cardIconBox: {
    width: 38,
    height: 24,
    borderRadius: 4,
    backgroundColor: '#3B82F6',
    padding: 3,
    justifyContent: 'space-between',
  },
  cardIconChip: {
    width: 7,
    height: 5,
    borderRadius: 1.5,
    backgroundColor: '#FDE047',
  },
  cardIconLine: {
    width: '100%',
    height: 3,
    backgroundColor: '#1E3A8A',
    borderRadius: 1,
  },

  // Bank Icon
  bankIconBox: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Cash Icon
  cashIconBox: {
    width: 38,
    height: 22,
    borderRadius: 4,
    backgroundColor: '#15803D',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#86EFAC',
  },
  cashGlyph: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
  },

  // Security notice
  securityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
    gap: 8,
  },
  secLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(123, 50, 31, 0.2)',
  },
  secBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  secText: {
    fontSize: 11,
    color: PAYMENT_THEME.textDarkBrown,
    fontWeight: '600',
  },

  // Pay button
  payButton: {
    backgroundColor: PAYMENT_THEME.primaryMaroon,
    borderRadius: 24,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 10,
    ...Platform.select({
      ios: {
        shadowColor: PAYMENT_THEME.primaryMaroon,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.35,
        shadowRadius: 6,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  payButtonInner: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  payButtonText: {
    fontSize: 17,
    fontWeight: '800',
    color: '#FFF0D7',
    letterSpacing: 0.5,
  },

  // Bottom protection
  bottomProtectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    marginVertical: 6,
  },
  bottomProtectionText: {
    fontSize: 11.5,
    color: PAYMENT_THEME.textDarkBrown,
    fontWeight: '600',
  },

  // Lotus divider
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
    backgroundColor: PAYMENT_THEME.primaryMaroon,
    borderTopLeftRadius: 6,
    borderBottomRightRadius: 6,
    transform: [{ rotate: '-25deg' }],
  },
  bLotusC: {
    width: 6,
    height: 10,
    backgroundColor: PAYMENT_THEME.primaryMaroon,
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
  },
  bLotusR: {
    width: 4,
    height: 7,
    backgroundColor: PAYMENT_THEME.primaryMaroon,
    borderTopRightRadius: 6,
    borderBottomLeftRadius: 6,
    transform: [{ rotate: '25deg' }],
  },

  // Footer landscape
  footerLandscapeContainer: {
    width: '100%',
    height: 70,
    overflow: 'hidden',
    borderRadius: 8,
    opacity: 0.75,
  },
  footerLandscapeImage: {
    width: '100%',
    height: '100%',
  },
});

