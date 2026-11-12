import React, { useMemo } from 'react';
import { Image, ImageStyle, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { homeTheme as theme } from '../../../theme/homeTheme';
import { useAdminDemo } from '../state/AdminDemoContext';
import { getSalesSummary } from '../data/mockAdminData';
import type { AdminOrder, AdminPage } from '../types';
import { AdminButton, AdminDemoLabel, AdminEmptyState, AdminMetric, AdminPageTitle, AdminPanel, AdminSalesChart, AdminSectionTitle, AdminStatusPill } from '../components/AdminUI';

interface Props {
  onNavigate: (page: AdminPage) => void;
  onOpenOrder: (orderId: string) => void;
  onAddMenu: () => void;
}

export function AdminDashboardScreen({ onNavigate, onOpenOrder, onAddMenu }: Props) {
  const { menu, orders, customers, settings, isLoading } = useAdminDemo();
  const sales = getSalesSummary('today');
  const pending = orders.filter(order => ['new', 'accepted', 'preparing'].includes(order.status)).length;
  const completed = orders.filter(order => order.status === 'completed').length;
  const popular = useMemo(() => {
    const counts = new Map<string, { itemId: string; count: number; revenue: number }>();
    orders.filter(order => order.status !== 'cancelled').forEach(order => order.items.forEach(line => {
      const current = counts.get(line.itemId) ?? { itemId: line.itemId, count: 0, revenue: 0 };
      current.count += line.quantity;
      current.revenue += line.quantity * line.price;
      counts.set(line.itemId, current);
    }));
    return [...counts.values()].sort((a, b) => b.count - a.count).slice(0, 4).map(entry => ({ ...entry, item: menu.find(item => item.id === entry.itemId) }));
  }, [menu, orders]);
  const recentOrders = [...orders].sort((a, b) => b.placedAt.localeCompare(a.placedAt)).slice(0, 4);

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <AdminPageTitle title="Good morning, Riya" subtitle="Here’s what’s happening at your restaurant today." action={<AdminDemoLabel />} />
      <View style={styles.metrics}>
        <AdminMetric label="Today’s sales" value={`₹${sales.total.toLocaleString('en-IN')}`} note="Demo revenue" icon="cash-outline" />
        <AdminMetric label="Orders today" value={String(sales.orders)} note="From the demo order feed" icon="receipt-outline" />
        <AdminMetric label="Pending orders" value={String(pending)} note="Needs your attention" icon="time-outline" accent />
        <AdminMetric label="Completed" value={String(completed)} note="Demo orders delivered" icon="checkmark-done-outline" />
        <AdminMetric label="Total customers" value={customers.length.toLocaleString('en-IN')} note="Sample customer list" icon="people-outline" />
      </View>

      <View style={styles.quickRow}>
        <Text style={styles.quickLabel}>Quick actions</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickButtons}>
          <AdminButton label="Add dish" icon="add" tone="primary" onPress={onAddMenu} compact />
          <AdminButton label="Manage inventory" icon="cube-outline" onPress={() => onNavigate('inventory')} compact />
          <AdminButton label="Review orders" icon="receipt-outline" onPress={() => onNavigate('orders')} compact />
        </ScrollView>
      </View>

      <View style={styles.mainGrid}>
        <AdminPanel style={styles.salesPanel}>
          <AdminSectionTitle title="Sales overview" trailing={<Text style={styles.chartRange}>Today · INR</Text>} />
          {isLoading ? <Text style={styles.loadingText}>Preparing demo chart…</Text> : <AdminSalesChart points={sales.points} />}
        </AdminPanel>
        <AdminPanel style={styles.popularPanel}>
          <AdminSectionTitle title="Popular dishes" trailing={<Pressable onPress={() => onNavigate('menu')} accessibilityRole="button"><Text style={styles.linkText}>Full menu ›</Text></Pressable>} />
          {popular.length ? popular.map(({ item, count, revenue }) => item ? (
            <View key={item.id} style={styles.popularRow}>
              <Image source={{ uri: item.image }} style={styles.foodThumb as ImageStyle} />
              <View style={styles.popularCopy}><Text style={styles.popularName} numberOfLines={1}>{item.name}</Text><Text style={styles.secondary}>{count} sold · {item.category}</Text></View>
              <Text style={styles.popularRevenue}>₹{revenue.toLocaleString('en-IN')}</Text>
            </View>
          ) : null) : <AdminEmptyState title="No sales yet" detail="Popular dishes will appear after demo orders are placed." />}
        </AdminPanel>
      </View>

      <AdminPanel>
        <AdminSectionTitle title="Recent orders" trailing={<Pressable onPress={() => onNavigate('orders')} accessibilityRole="button"><Text style={styles.linkText}>All orders ›</Text></Pressable>} />
        {recentOrders.length ? recentOrders.map(order => <RecentOrderRow key={order.id} order={order} onPress={() => onOpenOrder(order.id)} />) : <AdminEmptyState title="No recent orders" detail="New demo orders will show up here." />}
      </AdminPanel>

      <AdminPanel>
        <AdminSectionTitle title="Restaurant status" trailing={<AdminStatusPill status={settings.isOpen && settings.acceptingOrders ? 'active' : 'inactive'} label={settings.isOpen && settings.acceptingOrders ? 'Open · accepting orders' : 'Paused'} />} />
        <Text style={styles.secondary}>{settings.name} · {settings.openingHours}</Text>
        <Pressable onPress={() => onNavigate('settings')} accessibilityRole="button" style={styles.manageStatus}>
          <Text style={styles.linkText}>Manage restaurant settings</Text><Ionicons name="arrow-forward" size={15} color={theme.primary} />
        </Pressable>
      </AdminPanel>
    </ScrollView>
  );
}

function RecentOrderRow({ order, onPress }: { order: AdminOrder; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={`Open order ${order.id}`} style={styles.orderRow}>
      <View style={styles.orderIdBlock}><Text style={styles.orderId}>#{order.id}</Text><Text style={styles.secondary}>{order.placedAt}</Text></View>
      <View style={styles.orderCustomer}><Text style={styles.orderName} numberOfLines={1}>{order.customerName}</Text><Text style={styles.secondary}>{order.items.reduce((sum, item) => sum + item.quantity, 0)} items</Text></View>
      <Text style={styles.orderTotal}>₹{order.total}</Text>
      <AdminStatusPill status={order.status} />
      <Ionicons name="chevron-forward" size={16} color={theme.muted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 28, gap: 2 },
  metrics: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 7 },
  quickRow: { marginBottom: 12 },
  quickLabel: { color: theme.muted, fontSize: 10, fontWeight: '800', letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 7 },
  quickButtons: { gap: 8, paddingRight: 12 },
  mainGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  salesPanel: { flexGrow: 1, flexBasis: 300, marginBottom: 0 },
  popularPanel: { flexGrow: 1, flexBasis: 260, marginBottom: 0 },
  chartRange: { color: theme.muted, fontSize: 10, fontWeight: '600' },
  loadingText: { color: theme.muted, fontSize: 12, paddingVertical: 50, textAlign: 'center' },
  popularRow: { flexDirection: 'row', alignItems: 'center', gap: 9, paddingVertical: 7 },
  foodThumb: { width: 42, height: 42, borderRadius: 10, backgroundColor: theme.header },
  popularCopy: { flex: 1, minWidth: 0 },
  popularName: { color: theme.text, fontSize: 12, fontWeight: '700' },
  secondary: { color: theme.muted, fontSize: 10, marginTop: 3 },
  popularRevenue: { color: theme.text, fontSize: 11, fontWeight: '800' },
  linkText: { color: theme.primary, fontSize: 11, fontWeight: '800' },
  orderRow: { minHeight: 58, flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 8, borderTopWidth: 1, borderTopColor: theme.border },
  orderIdBlock: { flex: 1, minWidth: 82 },
  orderId: { color: theme.text, fontSize: 11, fontWeight: '800' },
  orderCustomer: { flex: 1, minWidth: 65 },
  orderName: { color: theme.text, fontSize: 11, fontWeight: '700' },
  orderTotal: { color: theme.text, fontSize: 11, fontWeight: '800' },
  manageStatus: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', paddingTop: 12 },
});
