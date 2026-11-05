import React, { useState, useEffect } from 'react';
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
  TRACKING_THEME,
  TRACKING_HEADER_IMAGE,
  TRACKING_FOOTER_IMAGE,
  ORDER_TRACKING_STEPS,
  TrackingStep,
} from '../data/trackingData';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface OrderTrackingScreenProps {
  orderId?: string;
  totalAmount?: number;
  onBackToHome: () => void;
}

export const OrderTrackingScreen: React.FC<OrderTrackingScreenProps> = ({
  orderId = '#DB-84920',
  totalAmount = 502,
  onBackToHome,
}) => {
  const [steps, setSteps] = useState<TrackingStep[]>(ORDER_TRACKING_STEPS);
  const [estimatedMinutes, setEstimatedMinutes] = useState(25);

  // Live countdown timer for estimated minutes
  useEffect(() => {
    const timer = setInterval(() => {
      setEstimatedMinutes((prev) => (prev > 1 ? prev - 1 : 1));
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const handleCallRider = () => {
    Alert.alert(
      'Call Delivery Partner',
      'Calling Raju Bhaiya (+91 98765 12345)...',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Call Now', onPress: () => {} },
      ]
    );
  };

  const handleChatRider = () => {
    Alert.alert(
      'Message Raju Bhaiya',
      'Raju Bhaiya is on his way to the kitchen on his cycle. He will pick up your hot fresh meal soon!',
      [{ text: 'OK' }]
    );
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
        {/* ── 1. HEADER SECTION (HERITAGE TEMPLE SILHOUETTES, NO APP NAME) ── */}
        <View style={styles.headerSection}>
          <Image
            source={{ uri: TRACKING_HEADER_IMAGE }}
            style={styles.headerImage}
            resizeMode="cover"
          />

          {/* Top Bar: Back to Home (Left), Help (Right), NO APP NAME */}
          <SafeAreaView edges={['top']} style={styles.topNavOverlay}>
            <View style={styles.topBar}>
              <TouchableOpacity
                onPress={onBackToHome}
                style={styles.backButton}
                activeOpacity={0.7}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              >
                <Ionicons name="arrow-back" size={22} color="#FFF0D7" />
              </TouchableOpacity>

              {/* Single Help Button */}
              <TouchableOpacity
                style={styles.helpButton}
                onPress={() =>
                  Alert.alert(
                    'Order Help & Support',
                    `Order ID: ${orderId}\nToll Free: 1800-DESI-EXP\nWhatsApp: +91 98765 43210`
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

          {/* Heading */}
          <View style={styles.headerTitleWrap}>
            <Text style={styles.hindiTitle}>ऑर्डर ट्रैक करें</Text>
            <Text style={styles.englishSubtitle}>Live Order Tracking</Text>
          </View>
        </View>

        {/* ── 2. PARCHMENT CONTENT BODY ── */}
        <View style={styles.parchmentBody}>
          {/* Symmetrical 3-Petal Lotus Bud at Apex */}
          <View style={styles.lotusApexRow}>
            <View style={styles.lotusLeafL} />
            <View style={styles.lotusLeafC} />
            <View style={styles.lotusLeafR} />
          </View>

          {/* ── LIVE STATUS BANNER CARD ── */}
          <View style={styles.liveStatusCard}>
            <View style={styles.statusHeaderRow}>
              <View style={styles.livePulseWrap}>
                <View style={styles.pulseDot} />
                <Text style={styles.liveStatusText}>
                  रसोई में तैयारी हो रही है
                </Text>
              </View>
              <View style={styles.onTimeBadge}>
                <Text style={styles.onTimeBadgeText}>ON TIME</Text>
              </View>
            </View>

            <View style={styles.estimatedTimeRow}>
              <View>
                <Text style={styles.estLabel}>ESTIMATED ARRIVAL</Text>
                <Text style={styles.estMinutes}>
                  ⚡ {estimatedMinutes} - {estimatedMinutes + 5} Mins
                </Text>
              </View>
              <Text style={styles.estSubTime}>Arriving ~02:15 PM</Text>
            </View>

            {/* Heritage styled progress bar */}
            <View style={styles.progressTrack}>
              <View style={styles.progressFill} />
            </View>
          </View>

          {/* ── DELIVERY PARTNER CARD (राजू भैया) ── */}
          <View style={styles.riderCard}>
            <View style={styles.riderAvatarBox}>
              <Ionicons name="bicycle" size={26} color="#FFF0D7" />
            </View>
            <View style={styles.riderInfoColumn}>
              <Text style={styles.riderName}>राजू भैया (Raju Bhaiya)</Text>
              <View style={styles.riderMetaRow}>
                <Ionicons name="star" size={13} color="#D6A45B" />
                <Text style={styles.riderRating}>4.9</Text>
                <Text style={styles.riderMetaText}>
                  • Desi Cycle Partner
                </Text>
              </View>
            </View>
            <View style={styles.riderActionsRow}>
              <TouchableOpacity
                style={styles.riderActionBtn}
                onPress={handleCallRider}
                activeOpacity={0.7}
              >
                <Ionicons name="call" size={16} color="#861C24" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.riderActionBtn}
                onPress={handleChatRider}
                activeOpacity={0.7}
              >
                <Ionicons name="chatbubble-ellipses" size={16} color="#861C24" />
              </TouchableOpacity>
            </View>
          </View>

          {/* ── TIMELINE STEPPER ── */}
          <View style={styles.timelineCard}>
            <Text style={styles.timelineCardTitle}>ORDER STATUS</Text>

            {steps.map((step, index) => {
              const isCompleted = step.status === 'completed';
              const isActive = step.status === 'active';
              const isLast = index === steps.length - 1;

              return (
                <View key={step.id} style={styles.timelineStepWrap}>
                  <View style={styles.stepIndicatorCol}>
                    <View
                      style={[
                        styles.stepDot,
                        isCompleted && styles.stepDotCompleted,
                        isActive && styles.stepDotActive,
                      ]}
                    >
                      {isCompleted ? (
                        <Ionicons name="checkmark" size={12} color="#FFF0D7" />
                      ) : isActive ? (
                        <View style={styles.stepActiveInnerDot} />
                      ) : (
                        <View style={styles.stepPendingDot} />
                      )}
                    </View>
                    {!isLast && (
                      <View
                        style={[
                          styles.stepLine,
                          isCompleted && styles.stepLineCompleted,
                        ]}
                      />
                    )}
                  </View>

                  <View style={styles.stepDetailsCol}>
                    <View style={styles.stepTitleRow}>
                      <Text
                        style={[
                          styles.stepTitleHindi,
                          (isCompleted || isActive) && styles.stepTextEmphasized,
                        ]}
                      >
                        {step.titleHindi}
                      </Text>
                      <Text style={styles.stepTimeText}>{step.time}</Text>
                    </View>
                    <Text style={styles.stepTitleEnglish}>
                      {step.titleEnglish}
                    </Text>
                    <Text style={styles.stepSubtitle}>{step.subtitle}</Text>
                  </View>
                </View>
              );
            })}
          </View>

          {/* ── ORDER SUMMARY CARD ── */}
          <View style={styles.summaryCard}>
            <View style={styles.summaryHeaderRow}>
              <View>
                <Text style={styles.summaryOrderId}>{orderId}</Text>
                <Text style={styles.summaryRestName}>घर का स्वाद (Ghar Ka Swad)</Text>
              </View>
              <View style={styles.paidBadge}>
                <Text style={styles.paidBadgeText}>PAID ₹{totalAmount}</Text>
              </View>
            </View>

            <View style={styles.summaryDivider} />

            <View style={styles.itemsList}>
              <View style={styles.itemSummaryLine}>
                <Text style={styles.itemQuantity}>1x</Text>
                <Text style={styles.itemSummaryName}>Paneer Butter Masala (Regular)</Text>
                <Text style={styles.itemSummaryPrice}>₹249</Text>
              </View>
              <View style={styles.itemSummaryLine}>
                <Text style={styles.itemQuantity}>2x</Text>
                <Text style={styles.itemSummaryName}>Butter Naan (2 Pieces)</Text>
                <Text style={styles.itemSummaryPrice}>₹99</Text>
              </View>
              <View style={styles.itemSummaryLine}>
                <Text style={styles.itemQuantity}>1x</Text>
                <Text style={styles.itemSummaryName}>Masala Chaas (Regular)</Text>
                <Text style={styles.itemSummaryPrice}>₹149</Text>
              </View>
            </View>

            <View style={styles.summaryDivider} />

            <View style={styles.addressRow}>
              <Ionicons
                name="location"
                size={16}
                color="#861C24"
                style={{ marginRight: 6 }}
              />
              <Text style={styles.addressText} numberOfLines={1}>
                123, Green Park, New Delhi – 110016
              </Text>
            </View>
          </View>

          {/* ── BACK TO HOME BUTTON ── */}
          <TouchableOpacity
            style={styles.homeButton}
            onPress={onBackToHome}
            activeOpacity={0.88}
          >
            <View style={styles.homeButtonInner}>
              <Ionicons
                name="home"
                size={18}
                color="#FFF0D7"
                style={{ marginRight: 8 }}
              />
              <Text style={styles.homeButtonText}>
                होम पेज पर जाएं • Back to Home
              </Text>
            </View>
          </TouchableOpacity>

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
              source={{ uri: TRACKING_FOOTER_IMAGE }}
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
    backgroundColor: TRACKING_THEME.parchmentBg,
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
    backgroundColor: TRACKING_THEME.headerBg,
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
    backgroundColor: TRACKING_THEME.parchmentBg,
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
    backgroundColor: TRACKING_THEME.primaryMaroon,
    borderTopLeftRadius: 8,
    borderBottomRightRadius: 8,
    transform: [{ rotate: '-25deg' }],
  },
  lotusLeafC: {
    width: 7,
    height: 13,
    backgroundColor: TRACKING_THEME.primaryMaroon,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
  },
  lotusLeafR: {
    width: 5,
    height: 9,
    backgroundColor: TRACKING_THEME.primaryMaroon,
    borderTopRightRadius: 8,
    borderBottomLeftRadius: 8,
    transform: [{ rotate: '25deg' }],
  },

  // Live status card
  liveStatusCard: {
    backgroundColor: TRACKING_THEME.cardBg,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: TRACKING_THEME.cardBorder,
    padding: 14,
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
  statusHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  livePulseWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  pulseDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#2E7D32',
  },
  liveStatusText: {
    fontSize: 14,
    fontWeight: '800',
    color: TRACKING_THEME.textDarkBrown,
  },
  onTimeBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#86EFAC',
  },
  onTimeBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#15803D',
  },
  estimatedTimeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 10,
  },
  estLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: TRACKING_THEME.textMutedBrown,
    letterSpacing: 0.8,
  },
  estMinutes: {
    fontSize: 20,
    fontWeight: '900',
    color: TRACKING_THEME.primaryMaroon,
    marginTop: 2,
  },
  estSubTime: {
    fontSize: 12,
    fontWeight: '600',
    color: TRACKING_THEME.textDarkBrown,
  },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: '#EBD2B8',
    overflow: 'hidden',
  },
  progressFill: {
    width: '45%',
    height: '100%',
    backgroundColor: TRACKING_THEME.primaryMaroon,
    borderRadius: 3,
  },

  // Rider Card
  riderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: TRACKING_THEME.cardBg,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: TRACKING_THEME.cardBorder,
    padding: 12,
    marginBottom: 12,
  },
  riderAvatarBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: TRACKING_THEME.primaryMaroon,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    borderWidth: 1.5,
    borderColor: '#D6A45B',
  },
  riderInfoColumn: {
    flex: 1,
  },
  riderName: {
    fontSize: 14.5,
    fontWeight: '800',
    color: TRACKING_THEME.textDarkBrown,
  },
  riderMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  riderRating: {
    fontSize: 12,
    fontWeight: '700',
    color: TRACKING_THEME.textDarkBrown,
  },
  riderMetaText: {
    fontSize: 11,
    color: TRACKING_THEME.textMutedBrown,
  },
  riderActionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  riderActionBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(134, 28, 36, 0.35)',
    backgroundColor: '#FFF8EC',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Timeline Card
  timelineCard: {
    backgroundColor: TRACKING_THEME.cardBg,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: TRACKING_THEME.cardBorder,
    padding: 14,
    marginBottom: 12,
  },
  timelineCardTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: TRACKING_THEME.textDarkBrown,
    letterSpacing: 1.2,
    marginBottom: 14,
  },
  timelineStepWrap: {
    flexDirection: 'row',
    minHeight: 52,
  },
  stepIndicatorCol: {
    width: 24,
    alignItems: 'center',
    marginRight: 12,
  },
  stepDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#EBD2B8',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#C4A882',
    zIndex: 2,
  },
  stepDotCompleted: {
    backgroundColor: TRACKING_THEME.primaryMaroon,
    borderColor: TRACKING_THEME.primaryMaroon,
  },
  stepDotActive: {
    backgroundColor: '#FFF0D7',
    borderColor: TRACKING_THEME.primaryMaroon,
    borderWidth: 2,
  },
  stepActiveInnerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: TRACKING_THEME.primaryMaroon,
  },
  stepPendingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#C4A882',
  },
  stepLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#EBD2B8',
    marginVertical: 2,
  },
  stepLineCompleted: {
    backgroundColor: TRACKING_THEME.primaryMaroon,
  },
  stepDetailsCol: {
    flex: 1,
    paddingBottom: 14,
  },
  stepTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stepTitleHindi: {
    fontSize: 13.5,
    fontWeight: '700',
    color: TRACKING_THEME.textMutedBrown,
  },
  stepTextEmphasized: {
    fontWeight: '800',
    color: TRACKING_THEME.textDarkBrown,
  },
  stepTimeText: {
    fontSize: 11,
    color: '#8C6C58',
    fontWeight: '600',
  },
  stepTitleEnglish: {
    fontSize: 11.5,
    color: TRACKING_THEME.textMutedBrown,
    marginTop: 1,
  },
  stepSubtitle: {
    fontSize: 11,
    color: '#A48978',
    marginTop: 2,
  },

  // Summary Card
  summaryCard: {
    backgroundColor: TRACKING_THEME.cardBg,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: TRACKING_THEME.cardBorder,
    padding: 14,
    marginBottom: 16,
  },
  summaryHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryOrderId: {
    fontSize: 14,
    fontWeight: '900',
    color: TRACKING_THEME.textDarkBrown,
  },
  summaryRestName: {
    fontSize: 12,
    color: TRACKING_THEME.textMutedBrown,
    marginTop: 1,
  },
  paidBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#86EFAC',
  },
  paidBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#15803D',
  },
  summaryDivider: {
    height: 1,
    backgroundColor: 'rgba(123, 50, 31, 0.15)',
    marginVertical: 10,
  },
  itemsList: {
    gap: 4,
  },
  itemSummaryLine: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  itemQuantity: {
    fontSize: 12,
    fontWeight: '800',
    color: TRACKING_THEME.primaryMaroon,
    width: 22,
  },
  itemSummaryName: {
    flex: 1,
    fontSize: 12,
    color: TRACKING_THEME.textDarkBrown,
    fontWeight: '600',
  },
  itemSummaryPrice: {
    fontSize: 12,
    fontWeight: '700',
    color: TRACKING_THEME.textDarkBrown,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addressText: {
    fontSize: 12,
    color: TRACKING_THEME.textDarkBrown,
    fontWeight: '600',
    flex: 1,
  },

  // Home Button
  homeButton: {
    backgroundColor: TRACKING_THEME.primaryMaroon,
    borderRadius: 24,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: TRACKING_THEME.primaryMaroon,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.35,
        shadowRadius: 6,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  homeButtonInner: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  homeButtonText: {
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
    marginVertical: 8,
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
    backgroundColor: TRACKING_THEME.primaryMaroon,
    borderTopLeftRadius: 6,
    borderBottomRightRadius: 6,
    transform: [{ rotate: '-25deg' }],
  },
  bLotusC: {
    width: 6,
    height: 10,
    backgroundColor: TRACKING_THEME.primaryMaroon,
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
  },
  bLotusR: {
    width: 4,
    height: 7,
    backgroundColor: TRACKING_THEME.primaryMaroon,
    borderTopRightRadius: 6,
    borderBottomLeftRadius: 6,
    transform: [{ rotate: '25deg' }],
  },

  // Footer landscape
  footerLandscapeContainer: {
    width: '100%',
    height: 65,
    overflow: 'hidden',
    borderRadius: 8,
    opacity: 0.7,
  },
  footerLandscapeImage: {
    width: '100%',
    height: '100%',
  },
});

