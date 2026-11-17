import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCustomerOrders } from '../context/CustomerOrdersContext';
import { colors } from '../theme/colors';

export const OrdersScreen: React.FC<{ onOpenOrder?: (id: string) => void; onBack?: () => void }> = ({ onOpenOrder, onBack }) => {
  const orders = useCustomerOrders();
  return <View style={styles.container}>
    <View style={styles.header}>
      {onBack && <TouchableOpacity accessibilityRole="button" onPress={onBack}><Text>Back</Text></TouchableOpacity>}
      <Text style={styles.title}>Your Orders</Text>
      <Text style={styles.subtitle}>Stored orders · payment remains unpaid</Text>
    </View>
    <ScrollView style={styles.content}>
      {orders.loading && <Text>Loading orders…</Text>}
      {!!orders.error && <View><Text accessibilityRole="alert">{orders.error}</Text>
        {orders.enabled && <TouchableOpacity accessibilityRole="button" onPress={() => { void orders.history(); }}><Text>Retry orders</Text></TouchableOpacity>}</View>}
      {!orders.loading && !orders.error && !orders.orders.length && <View style={styles.emptyState}>
        <Text style={styles.emptyTitle}>No orders yet</Text><Text>Your confirmed orders will appear here.</Text>
      </View>}
      {orders.orders.map(order => <View key={order.id} style={styles.orderCard}>
        <Text style={styles.orderId}>{order.id}</Text>
        <Text>{new Date(order.data.createdAt.seconds * 1000).toLocaleString()}</Text>
        <Text>Status: {order.data.status === 'placed' ? 'Placed' : order.data.status.replace('_', ' ')}</Text>
        <Text>{order.data.fulfillment === 'pickup' ? 'Pickup' : 'Delivery'}</Text>
        {order.data.items.map(item => <Text key={item.menuItemId}>{item.quantity} × {item.nameSnapshot}</Text>)}
        <Text>Total: ₹{(order.data.totalPaise / 100).toFixed(2)} · Payment: Unpaid</Text>
        <Text>No payment has been collected.</Text>
        <TouchableOpacity accessibilityRole="button" onPress={() => onOpenOrder?.(order.id)}><Text>View order details</Text></TouchableOpacity>
      </View>)}
      {orders.enabled && <TouchableOpacity accessibilityRole="button" disabled={orders.loading} onPress={() => { void orders.history(); }}><Text>Refresh orders</Text></TouchableOpacity>}
      {orders.more && <TouchableOpacity accessibilityRole="button" disabled={orders.loading} onPress={() => { void orders.history(true); }}><Text>Load more orders</Text></TouchableOpacity>}
    </ScrollView>
  </View>;
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

