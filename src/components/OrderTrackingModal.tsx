import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { colors } from '../theme/colors';
import { homeTheme } from '../theme/homeTheme';

const { height } = Dimensions.get('window');

export const OrderTrackingModal: React.FC = () => {
  const { isTrackingOpen, setIsTrackingOpen, activeOrder } = useApp();

  if (!activeOrder) return null;

  return (
    <Modal
      visible={isTrackingOpen}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setIsTrackingOpen(false)}
    >
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.headerTitle}>Order Tracking 🛵</Text>
              <Text style={styles.orderIdText}>{activeOrder.id}</Text>
            </View>
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => setIsTrackingOpen(false)}
            >
              <Ionicons name="close" size={20} color={homeTheme.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Delivery Time Card */}
            <View style={styles.timeCard}>
              <View>
                <Text style={styles.timeLabel}>ESTIMATED ARRIVAL</Text>
                <Text style={styles.timeValue}>⚡ 14 - 18 Mins</Text>
              </View>
              <View style={styles.deliveryBadge}>
                <Text style={styles.badgeText}>ON TIME</Text>
              </View>
            </View>

            {/* Stepper Status */}
            <View style={styles.timelineCard}>
              {/* Step 1 */}
              <View style={styles.stepRow}>
                <View style={styles.stepIconCompleted}>
                  <Ionicons name="checkmark" size={14} color={homeTheme.background} />
                </View>
                <View style={styles.stepInfo}>
                  <Text style={styles.stepTitle}>Order Placed & Confirmed</Text>
                  <Text style={styles.stepSub}>Store accepted your order</Text>
                </View>
                <Text style={styles.stepTime}>{activeOrder.date}</Text>
              </View>
              <View style={styles.stepConnectorActive} />

              {/* Step 2 */}
              <View style={styles.stepRow}>
                <View style={styles.stepIconCompleted}>
                  <Ionicons name="cube" size={14} color={homeTheme.background} />
                </View>
                <View style={styles.stepInfo}>
                  <Text style={styles.stepTitle}>Packing Fresh Items</Text>
                  <Text style={styles.stepSub}>Desi Store partner is packing</Text>
                </View>
                <Text style={styles.stepTime}>Just now</Text>
              </View>
              <View style={styles.stepConnector} />

              {/* Step 3 */}
              <View style={styles.stepRow}>
                <View style={styles.stepIconPending}>
                  <Ionicons name="bicycle" size={14} color={homeTheme.primary} />
                </View>
                <View style={styles.stepInfo}>
                  <Text style={styles.stepTitle}>Out for Delivery</Text>
                  <Text style={styles.stepSub}>Rider will pick up shortly</Text>
                </View>
              </View>
              <View style={styles.stepConnector} />

              {/* Step 4 */}
              <View style={styles.stepRow}>
                <View style={styles.stepIconPending}>
                  <Ionicons name="home" size={14} color={homeTheme.muted} />
                </View>
                <View style={styles.stepInfo}>
                  <Text style={[styles.stepTitle, { color: homeTheme.muted }]}>Delivered</Text>
                  <Text style={styles.stepSub}>{activeOrder.deliveryAddress}</Text>
                </View>
              </View>
            </View>

            {/* Delivery Partner Profile Card */}
            <View style={styles.riderCard}>
              <View style={styles.riderAvatar}>
                <Ionicons name="person" size={24} color={homeTheme.background} />
              </View>
              <View style={styles.riderDetails}>
                <Text style={styles.riderName}>Ramesh Kumar</Text>
                <Text style={styles.riderRating}>⭐ 4.9 (Vaccinated & verified)</Text>
              </View>
              <View style={styles.riderActions}>
                <TouchableOpacity style={styles.actionBtn}>
                  <Ionicons name="call" size={18} color={homeTheme.primary} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionBtn}>
                  <Ionicons name="chatbubble-ellipses" size={18} color={homeTheme.primary} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Order Items Preview */}
            <View style={styles.itemsCard}>
              <Text style={styles.itemsCardTitle}>Order Details ({activeOrder.items.length} items)</Text>
              {activeOrder.items.map((item) => (
                <View key={item.product.id} style={styles.miniItemRow}>
                  <Text style={styles.miniItemName}>
                    {item.quantity}x {item.product.name}
                  </Text>
                  <Text style={styles.miniItemPrice}>
                    ₹{item.product.price * item.quantity}
                  </Text>
                </View>
              ))}
              <View style={styles.miniTotalRow}>
                <Text style={styles.miniTotalLabel}>Total Paid ({activeOrder.paymentMethod})</Text>
                <Text style={styles.miniTotalValue}>₹{activeOrder.totalAmount}</Text>
              </View>
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.doneBtn}
              onPress={() => setIsTrackingOpen(false)}
            >
              <Text style={styles.doneBtnText}>Back to Shopping</Text>
            </TouchableOpacity>
          </View>
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
    maxHeight: height * 0.9,
    minHeight: height * 0.6,
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
  orderIdText: {
    fontSize: 12,
    color: homeTheme.primary,
    fontWeight: '700',
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
  content: {
    padding: 16,
  },
  timeCard: {
    backgroundColor: homeTheme.primaryDark,
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  timeLabel: {
    color: homeTheme.header,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  timeValue: {
    color: homeTheme.background,
    fontSize: 20,
    fontWeight: '900',
    marginTop: 2,
  },
  deliveryBadge: {
    backgroundColor: homeTheme.gold,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: {
    color: homeTheme.text,
    fontSize: 11,
    fontWeight: '800',
  },
  timelineCard: {
    backgroundColor: homeTheme.card,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: homeTheme.border,
    marginBottom: 14,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepIconCompleted: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: homeTheme.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepIconPending: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: homeTheme.header,
    borderWidth: 1.5,
    borderColor: homeTheme.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepInfo: {
    flex: 1,
    marginLeft: 12,
  },
  stepTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: homeTheme.text,
  },
  stepSub: {
    fontSize: 11,
    color: homeTheme.muted,
    marginTop: 1,
  },
  stepTime: {
    fontSize: 11,
    color: homeTheme.muted,
  },
  stepConnectorActive: {
    width: 2,
    height: 20,
    backgroundColor: homeTheme.primary,
    marginLeft: 13,
    marginVertical: 2,
  },
  stepConnector: {
    width: 2,
    height: 20,
    backgroundColor: homeTheme.border,
    marginLeft: 13,
    marginVertical: 2,
  },
  riderCard: {
    backgroundColor: homeTheme.card,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: homeTheme.border,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  riderAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: homeTheme.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  riderDetails: {
    flex: 1,
    marginLeft: 12,
  },
  riderName: {
    fontSize: 14,
    fontWeight: '700',
    color: homeTheme.text,
  },
  riderRating: {
    fontSize: 11,
    color: homeTheme.muted,
    marginTop: 2,
  },
  riderActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: homeTheme.header,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemsCard: {
    backgroundColor: homeTheme.card,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: homeTheme.border,
    marginBottom: 14,
  },
  itemsCardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: homeTheme.text,
    marginBottom: 10,
  },
  miniItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  miniItemName: {
    fontSize: 12,
    color: homeTheme.text,
    flex: 1,
    marginRight: 8,
  },
  miniItemPrice: {
    fontSize: 12,
    fontWeight: '600',
    color: homeTheme.text,
  },
  miniTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: homeTheme.border,
    paddingTop: 8,
    marginTop: 8,
  },
  miniTotalLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: homeTheme.text,
  },
  miniTotalValue: {
    fontSize: 14,
    fontWeight: '800',
    color: homeTheme.primary,
  },
  footer: {
    backgroundColor: homeTheme.card,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: homeTheme.border,
  },
  doneBtn: {
    backgroundColor: homeTheme.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  doneBtnText: {
    color: homeTheme.background,
    fontWeight: '800',
    fontSize: 14,
  },
});

