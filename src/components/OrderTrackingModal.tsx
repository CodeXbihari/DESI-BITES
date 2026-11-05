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
              <Ionicons name="close" size={20} color={colors.text} />
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
                  <Ionicons name="checkmark" size={14} color="#FFFFFF" />
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
                  <Ionicons name="cube" size={14} color="#FFFFFF" />
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
                  <Ionicons name="bicycle" size={14} color={colors.primary} />
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
                  <Ionicons name="home" size={14} color={colors.textLight} />
                </View>
                <View style={styles.stepInfo}>
                  <Text style={[styles.stepTitle, { color: colors.textMuted }]}>Delivered</Text>
                  <Text style={styles.stepSub}>{activeOrder.deliveryAddress}</Text>
                </View>
              </View>
            </View>

            {/* Delivery Partner Profile Card */}
            <View style={styles.riderCard}>
              <View style={styles.riderAvatar}>
                <Ionicons name="person" size={24} color="#FFFFFF" />
              </View>
              <View style={styles.riderDetails}>
                <Text style={styles.riderName}>Ramesh Kumar</Text>
                <Text style={styles.riderRating}>⭐ 4.9 (Vaccinated & verified)</Text>
              </View>
              <View style={styles.riderActions}>
                <TouchableOpacity style={styles.actionBtn}>
                  <Ionicons name="call" size={18} color={colors.primary} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionBtn}>
                  <Ionicons name="chatbubble-ellipses" size={18} color={colors.primary} />
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
    backgroundColor: colors.background,
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
  orderIdText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '700',
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
  content: {
    padding: 16,
  },
  timeCard: {
    backgroundColor: '#0F172A',
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  timeLabel: {
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  timeValue: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '900',
    marginTop: 2,
  },
  deliveryBadge: {
    backgroundColor: colors.secondary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  timelineCard: {
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.borderLight,
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
    backgroundColor: colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepIconPending: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFF7ED',
    borderWidth: 1.5,
    borderColor: colors.primaryLight,
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
    color: colors.text,
  },
  stepSub: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 1,
  },
  stepTime: {
    fontSize: 11,
    color: colors.textLight,
  },
  stepConnectorActive: {
    width: 2,
    height: 20,
    backgroundColor: colors.secondary,
    marginLeft: 13,
    marginVertical: 2,
  },
  stepConnector: {
    width: 2,
    height: 20,
    backgroundColor: colors.border,
    marginLeft: 13,
    marginVertical: 2,
  },
  riderCard: {
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.borderLight,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  riderAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
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
    color: colors.text,
  },
  riderRating: {
    fontSize: 11,
    color: colors.textMuted,
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
    backgroundColor: '#FFF7ED',
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemsCard: {
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginBottom: 14,
  },
  itemsCardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 10,
  },
  miniItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  miniItemName: {
    fontSize: 12,
    color: colors.text,
    flex: 1,
    marginRight: 8,
  },
  miniItemPrice: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
  },
  miniTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    paddingTop: 8,
    marginTop: 8,
  },
  miniTotalLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
  },
  miniTotalValue: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.primary,
  },
  footer: {
    backgroundColor: colors.card,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  doneBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  doneBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
  },
});

