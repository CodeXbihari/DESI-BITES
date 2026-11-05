import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { colors } from '../theme/colors';

export const OrdersScreen: React.FC = () => {
  const { orders, activeOrder, setIsTrackingOpen, setActiveOrder } = useApp();

  const handleTrack = (order: any) => {
    setActiveOrder(order);
    setIsTrackingOpen(true);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Your Orders</Text>
        <Text style={styles.subtitle}>Track live deliveries and view receipt history</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Active Order Card */}
        {activeOrder && (
          <View style={styles.activeOrderCard}>
            <View style={styles.activeHeader}>
              <View style={styles.pulsingBadge}>
                <View style={styles.dot} />
                <Text style={styles.activeBadgeText}>ACTIVE ORDER</Text>
              </View>
              <Text style={styles.activeEta}>⚡ In 14 mins</Text>
            </View>

            <Text style={styles.activeOrderId}>{activeOrder.id}</Text>
            <Text style={styles.activeSummary}>
              {activeOrder.items.length} items • ₹{activeOrder.totalAmount}
            </Text>

            <TouchableOpacity
              style={styles.trackBtn}
              activeOpacity={0.8}
              onPress={() => handleTrack(activeOrder)}
            >
              <Text style={styles.trackBtnText}>Track Delivery Status</Text>
              <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        )}

        {/* Previous Orders Header */}
        <Text style={styles.sectionTitle}>
          {orders.length === 0 ? 'No Past Orders' : 'Past Deliveries'}
        </Text>

        {orders.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="receipt-outline" size={56} color={colors.textLight} />
            <Text style={styles.emptyTitle}>No orders yet</Text>
            <Text style={styles.emptySub}>
              Your placed orders and invoices will show up right here.
            </Text>
          </View>
        ) : (
          orders.map((order) => (
            <View key={order.id} style={styles.orderCard}>
              <View style={styles.orderCardTop}>
                <View>
                  <Text style={styles.orderId}>{order.id}</Text>
                  <Text style={styles.orderDate}>Ordered on {order.date}</Text>
                </View>
                <View style={styles.statusPill}>
                  <Text style={styles.statusText}>{order.status.toUpperCase()}</Text>
                </View>
              </View>

              <View style={styles.itemsSummary}>
                {order.items.map((item) => (
                  <Text key={item.product.id} style={styles.itemLine}>
                    • {item.quantity}x {item.product.name}
                  </Text>
                ))}
              </View>

              <View style={styles.orderFooter}>
                <Text style={styles.totalLabel}>
                  Total Paid: <Text style={styles.totalPrice}>₹{order.totalAmount}</Text>
                </Text>
                <TouchableOpacity
                  style={styles.reorderBtn}
                  onPress={() => handleTrack(order)}
                >
                  <Text style={styles.reorderText}>View Tracking</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
  },
  subtitle: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  content: {
    padding: 16,
    paddingBottom: 110,
  },
  activeOrderCard: {
    backgroundColor: '#0F172A',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  activeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  pulsingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#EF4444',
  },
  activeBadgeText: {
    color: '#EF4444',
    fontSize: 10,
    fontWeight: '800',
  },
  activeEta: {
    color: '#22C55E',
    fontSize: 12,
    fontWeight: '700',
  },
  activeOrderId: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    marginTop: 4,
  },
  activeSummary: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 2,
    marginBottom: 14,
  },
  trackBtn: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  trackBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginTop: 12,
  },
  emptySub: {
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 4,
  },
  orderCard: {
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginBottom: 12,
  },
  orderCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    paddingBottom: 8,
    marginBottom: 8,
  },
  orderId: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  orderDate: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 1,
  },
  statusPill: {
    backgroundColor: colors.secondaryLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.secondary,
  },
  itemsSummary: {
    marginVertical: 4,
  },
  itemLine: {
    fontSize: 12,
    color: colors.text,
    lineHeight: 18,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    paddingTop: 8,
    marginTop: 6,
  },
  totalLabel: {
    fontSize: 12,
    color: colors.textMuted,
  },
  totalPrice: {
    fontWeight: '800',
    color: colors.text,
  },
  reorderBtn: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#FFF7ED',
  },
  reorderText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
  },
});

