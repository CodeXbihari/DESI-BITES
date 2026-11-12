import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { homeTheme as theme } from '../../../theme/homeTheme';
import { useAdminDemo } from '../state/AdminDemoContext';
import type { AdminOrder, AdminOrderStatus } from '../types';
import { AdminButton, AdminEmptyState, AdminFilterRow, AdminPageTitle, AdminPanel, AdminSearchField, AdminStatusPill, AdminConfirmModal } from '../components/AdminUI';

interface Props {
  onOpenOrder: (orderId: string) => void;
  onNotify: (message: string) => void;
}

const statusFilters = [
  { label: 'All orders', value: 'all' },
  { label: 'New', value: 'new' },
  { label: 'Accepted', value: 'accepted' },
  { label: 'Preparing', value: 'preparing' },
  { label: 'Ready', value: 'ready' },
  { label: 'Completed', value: 'completed' },
  { label: 'Cancelled', value: 'cancelled' },
];

export function AdminOrdersScreen({ onOpenOrder, onNotify }: Props) {
  const { orders, updateOrderStatus } = useAdminDemo();
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');
  const [orderToCancel, setOrderToCancel] = useState<AdminOrder | null>(null);
  const filtered = useMemo(() => orders.filter(order => {
    const searchMatch = `${order.id} ${order.customerName}`.toLowerCase().includes(query.trim().toLowerCase());
    return searchMatch && (status === 'all' || order.status === status);
  }), [orders, query, status]);

  const advance = (order: AdminOrder) => {
    const nextStatus: Partial<Record<AdminOrderStatus, AdminOrderStatus>> = { new: 'accepted', accepted: 'preparing', preparing: 'ready', ready: 'completed' };
    const next = nextStatus[order.status];
    if (next) {
      updateOrderStatus(order.id, next);
      onNotify(`${order.id} · ${next.charAt(0).toUpperCase()}${next.slice(1)}`);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
      <AdminPageTitle title="Orders" subtitle="Review incoming orders and move them through the kitchen." action={<View style={styles.live}><View style={styles.liveDot} /><Text style={styles.liveText}>DEMO FEED</Text></View>} />
      <AdminSearchField value={query} onChangeText={setQuery} placeholder="Search order ID or customer" accessibilityLabel="Search orders" />
      <AdminFilterRow options={statusFilters} selected={status} onSelect={setStatus} />
      <Text style={styles.count}>{filtered.length} {filtered.length === 1 ? 'order' : 'orders'} shown</Text>
      {filtered.length ? filtered.map(order => (
        <OrderCard key={order.id} order={order} onOpen={() => onOpenOrder(order.id)} onAdvance={() => advance(order)} onCancel={() => setOrderToCancel(order)} />
      )) : <AdminPanel><AdminEmptyState title="No matching orders" detail="Try a different customer name or order status." icon="search-outline" /></AdminPanel>}
      <AdminConfirmModal
        visible={Boolean(orderToCancel)}
        title="Cancel this order?"
        message={orderToCancel ? `Order ${orderToCancel.id} will be marked cancelled in the demo data.` : ''}
        confirmLabel="Cancel order"
        destructive
        onCancel={() => setOrderToCancel(null)}
        onConfirm={() => {
          if (orderToCancel) updateOrderStatus(orderToCancel.id, 'cancelled');
          setOrderToCancel(null);
          onNotify('Order cancelled · demo only');
        }}
      />
    </ScrollView>
  );
}

function OrderCard({ order, onOpen, onAdvance, onCancel }: { order: AdminOrder; onOpen: () => void; onAdvance: () => void; onCancel: () => void }) {
  const itemCount = order.items.reduce((sum, line) => sum + line.quantity, 0);
  const nextAction: Partial<Record<AdminOrderStatus, string>> = { new: 'Accept', accepted: 'Start prep', preparing: 'Mark ready', ready: 'Complete' };
  return (
    <AdminPanel style={styles.orderCard}>
      <Pressable onPress={onOpen} accessibilityRole="button" accessibilityLabel={`View order ${order.id}`} style={styles.cardTop}>
        <View style={styles.orderIdentity}><Text style={styles.orderId}>#{order.id}</Text><Text style={styles.muted}>{order.placedAt} · {itemCount} {itemCount === 1 ? 'item' : 'items'}</Text></View>
        <AdminStatusPill status={order.status} />
      </Pressable>
      <View style={styles.customerLine}><View style={styles.customerIcon}><Ionicons name="person-outline" size={16} color={theme.primary} /></View><View style={styles.customerCopy}><Text style={styles.customerName}>{order.customerName}</Text><Text style={styles.muted}>{maskPhone(order.customerPhone)}</Text></View><Text style={styles.total}>₹{order.total}</Text></View>
      <View style={styles.itemsPreview}>{order.items.slice(0, 2).map(item => <Text key={item.itemId} numberOfLines={1} style={styles.itemLine}>{item.quantity} × {item.name}</Text>)}{order.items.length > 2 ? <Text style={styles.muted}>+{order.items.length - 2} more items</Text> : null}</View>
      <View style={styles.cardFooter}><View><Text style={styles.payment}>{order.paymentStatus.toUpperCase()} · {order.paymentMethod}</Text><Text style={styles.muted} numberOfLines={1}>{order.deliveryAddress}</Text></View><View style={styles.actions}>{order.status !== 'completed' && order.status !== 'cancelled' ? <Pressable onPress={onCancel} accessibilityRole="button" accessibilityLabel="Cancel order"><Text style={styles.cancelText}>Cancel</Text></Pressable> : null}{nextAction[order.status] ? <AdminButton label={nextAction[order.status]!} onPress={onAdvance} tone="primary" compact /> : <AdminButton label="Details" onPress={onOpen} compact />}</View></View>
    </AdminPanel>
  );
}

function maskPhone(phone: string) {
  return `•••••• ${phone.slice(-4)}`;
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 30, gap: 10 },
  live: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 9, paddingVertical: 7, borderRadius: 99, backgroundColor: '#E8EFE0' },
  liveDot: { width: 7, height: 7, borderRadius: 5, backgroundColor: '#668852' },
  liveText: { color: '#42623B', fontSize: 9, fontWeight: '800' },
  count: { color: theme.muted, fontSize: 11, fontWeight: '700' },
  orderCard: { marginBottom: 0 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8, marginBottom: 12 },
  orderIdentity: { flex: 1 },
  orderId: { color: theme.text, fontSize: 13, fontWeight: '800' },
  muted: { color: theme.muted, fontSize: 10, marginTop: 4 },
  customerLine: { flexDirection: 'row', alignItems: 'center', gap: 9, paddingVertical: 10, borderTopWidth: 1, borderTopColor: theme.border },
  customerIcon: { width: 32, height: 32, borderRadius: 16, backgroundColor: theme.header, alignItems: 'center', justifyContent: 'center' },
  customerCopy: { flex: 1 },
  customerName: { color: theme.text, fontSize: 12, fontWeight: '700' },
  total: { color: theme.text, fontSize: 14, fontWeight: '900' },
  itemsPreview: { paddingVertical: 8, borderTopWidth: 1, borderTopColor: theme.border, gap: 4 },
  itemLine: { color: theme.text, fontSize: 11 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8, paddingTop: 10, borderTopWidth: 1, borderTopColor: theme.border },
  payment: { color: theme.muted, fontSize: 9, fontWeight: '800' },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  cancelText: { color: '#8B3D35', fontSize: 10, fontWeight: '700' },
});
