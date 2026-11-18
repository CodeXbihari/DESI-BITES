import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useStaff } from './StaffContext';
import { errorMessage, StaffBrand, StaffButton, StaffNotice, staffColors, staffStyles, StatusBadge } from './StaffUI';
import { deliveryAction, deliveryCounts, deliveryStatusLabel } from './staffDemo';
import type { DeliveryOrder } from './staffDemo';

const tabs = [
  { key: 'home', label: 'Home', icon: 'home-outline' },
  { key: 'orders', label: 'My Orders', icon: 'receipt-outline' },
  { key: 'history', label: 'History', icon: 'time-outline' },
  { key: 'profile', label: 'Profile', icon: 'person-circle-outline' },
] as const;

export function DeliveryDashboardScreen({ onLogout }: { onLogout: () => void }) {
  const { account, orders, advanceOrder } = useStaff();
  const [tab, setTab] = useState<(typeof tabs)[number]['key']>('home');
  const [pending, setPending] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  if (account?.role !== 'delivery') return null;

  const counts = deliveryCounts(orders);
  const stats = [
    { label: 'Assigned Orders', count: counts.assigned, icon: 'receipt-outline' },
    { label: 'Pending Pickups', count: counts.pickups, icon: 'bag-handle-outline' },
    { label: 'Out for Delivery', count: counts.out, icon: 'bicycle-outline' },
    { label: 'Completed Deliveries', count: counts.delivered, icon: 'checkmark-done-outline' },
  ] as const;
  const history = tab === 'history';
  const visibleOrders = orders.filter(order => (order.status === 'delivered') === history);

  async function advance(order: DeliveryOrder) {
    if (pending) return;
    setPending(order.id);
    setError('');
    setNotice('');
    try {
      await advanceOrder(order.id, order.status);
      const next = deliveryAction[order.status]?.next;
      if (next) setNotice(`Order ${order.id}: ${deliveryStatusLabel[next]}.`);
    } catch (failure) { setError(errorMessage(failure)); }
    finally { setPending(null); }
  }

  return (
    <SafeAreaView style={staffStyles.screen}>
      <View style={styles.header}>
        <StaffBrand caption="DELIVERY PARTNER" />
        <View style={staffStyles.row}>
          <Pressable accessibilityRole="button" accessibilityLabel="Open delivery profile" onPress={() => setTab('profile')} style={styles.profileButton}>
            <Ionicons name="person-circle-outline" size={23} color={staffColors.burgundy} />
          </Pressable>
          <StaffButton label="Logout" icon="log-out-outline" onPress={onLogout} disabled={pending !== null} />
        </View>
      </View>
      <ScrollView key={tab} style={styles.scroll} contentContainerStyle={staffStyles.content}>
        {tab === 'home' ? <>
          <View style={styles.titleBlock}>
            <Text style={staffStyles.eyebrow}>DEVELOPMENT DEMO</Text>
            <Text accessibilityRole="header" style={staffStyles.title}>Welcome back, {account.name}</Text>
          </View>
          <View style={styles.metrics}>
            {stats.map(stat => <View key={stat.label} style={[staffStyles.card, styles.metric]}>
              <Ionicons name={stat.icon} size={20} color={staffColors.burgundy} />
              <Text style={staffStyles.title}>{stat.count}</Text>
              <Text style={staffStyles.label}>{stat.label}</Text>
            </View>)}
          </View>
        </> : null}
        {tab === 'profile' ? (
          <View style={staffStyles.card}>
            <Text accessibilityRole="header" style={staffStyles.title}>Profile</Text>
            <Text style={staffStyles.sectionTitle}>{account.name}</Text>
            <Text style={staffStyles.text}>+91 {account.phone}</Text>
            <StatusBadge label="Active delivery partner" active />
          </View>
        ) : (
          <>
            <Text accessibilityRole="header" style={tab === 'home' ? staffStyles.sectionTitle : staffStyles.title}>{history ? 'Delivery history' : 'My Assigned Orders'}</Text>
            {error ? <StaffNotice message={error} error /> : null}
            {notice ? <StaffNotice message={notice} /> : null}
            {visibleOrders.length ? visibleOrders.map(order => <OrderCard key={order.id} order={order} pending={pending} onAdvance={() => void advance(order)} />) : (
              <View style={staffStyles.card}>
                <Text style={staffStyles.sectionTitle}>{history ? 'No completed deliveries yet' : 'No orders assigned right now'}</Text>
                <Text style={staffStyles.muted}>{history ? 'Delivered orders will appear here.' : 'Orders assigned to your account will appear here.'}</Text>
              </View>
            )}
          </>
        )}
      </ScrollView>
      <View accessibilityLabel="Delivery navigation" style={styles.navigation}>
        {tabs.map(item => <Pressable key={item.key} accessibilityRole="tab" accessibilityState={{ selected: tab === item.key }} onPress={() => setTab(item.key)}
          style={[styles.navItem, tab === item.key && styles.selected]}>
          <Ionicons name={item.icon} size={20} color={tab === item.key ? staffColors.burgundy : staffColors.terracotta} />
          <Text style={styles.navText}>{item.label}</Text>
        </Pressable>)}
      </View>
    </SafeAreaView>
  );
}

function OrderCard({ order, pending, onAdvance }: { order: DeliveryOrder; pending: string | null; onAdvance: () => void }) {
  const action = deliveryAction[order.status];
  return (
    <View style={staffStyles.card}>
      <View style={[staffStyles.row, styles.spread]}>
        <Text style={staffStyles.sectionTitle}>Order #{order.id}</Text>
        <StatusBadge label={deliveryStatusLabel[order.status]} active={order.status === 'delivered'} />
      </View>
      <View style={styles.titleBlock}>
        <Text style={staffStyles.label}>{order.customer}</Text>
        <Text style={staffStyles.muted}>+91 {order.phone}</Text>
        <Text style={staffStyles.text}>{order.address}</Text>
      </View>
      <View style={styles.items}>
        {order.items.map((item, index) => <Text key={`${item.name}-${index}`} style={staffStyles.text}>{item.quantity} × {item.name}</Text>)}
      </View>
      <View style={[staffStyles.row, styles.spread]}>
        <Text style={staffStyles.label}>₹{order.total.toLocaleString('en-IN')} · {order.payment}</Text>
        {action ? <StaffButton primary label={action.label} onPress={onAdvance} busy={pending === order.id} disabled={pending !== null} /> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { backgroundColor: staffColors.ivory, borderBottomColor: staffColors.beige, borderBottomWidth: 1, padding: 12, flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'space-between', gap: 8 },
  profileButton: { minWidth: 44, minHeight: 44, justifyContent: 'center', alignItems: 'center' },
  scroll: { flex: 1 },
  titleBlock: { gap: 4 },
  metrics: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  metric: { flexGrow: 1, flexBasis: '44%', maxWidth: '100%', padding: 12, gap: 4 },
  spread: { justifyContent: 'space-between' },
  items: { borderTopWidth: 1, borderTopColor: staffColors.beige, paddingTop: 10, gap: 4 },
  navigation: { flexDirection: 'row', justifyContent: 'center', gap: 4, padding: 6, borderTopColor: staffColors.beige, borderTopWidth: 1, backgroundColor: staffColors.ivory },
  navItem: { flex: 1, maxWidth: 170, minHeight: 46, paddingHorizontal: 2, alignItems: 'center', justifyContent: 'center', borderRadius: 12, gap: 2 },
  selected: { backgroundColor: staffColors.peach },
  navText: { color: staffColors.burgundy, fontSize: 12, fontWeight: '700' },
});
