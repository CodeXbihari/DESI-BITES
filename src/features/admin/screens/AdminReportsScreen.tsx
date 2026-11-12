import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { homeTheme as theme } from '../../../theme/homeTheme';
import { useAdminDemo } from '../state/AdminDemoContext';
import { getSalesSummary } from '../data/mockAdminData';
import type { SalesPeriod } from '../types';
import { AdminButton, AdminEmptyState, AdminFilterRow, AdminMetric, AdminPageTitle, AdminPanel, AdminSalesChart, AdminSectionTitle } from '../components/AdminUI';

const periods: Array<{ label: string; value: SalesPeriod }> = [
  { label: 'Today', value: 'today' }, { label: 'This week', value: 'week' }, { label: 'This month', value: 'month' },
];

export function AdminReportsScreen() {
  const { orders } = useAdminDemo();
  const [period, setPeriod] = useState<SalesPeriod>('today');
  const summary = getSalesSummary(period);
  const completed = orders.filter(order => order.status === 'completed').length;
  const averageOrder = summary.orders > 0 ? Math.round(summary.total / summary.orders) : 0;
  const bestSellers = useMemo(() => {
    const counts = new Map<string, { name: string; quantity: number; revenue: number }>();
    orders.filter(order => order.status !== 'cancelled').forEach(order => order.items.forEach(line => {
      const row = counts.get(line.itemId) ?? { name: line.name, quantity: 0, revenue: 0 };
      row.quantity += line.quantity;
      row.revenue += line.quantity * line.price;
      counts.set(line.itemId, row);
    }));
    return [...counts.values()].sort((a, b) => b.quantity - a.quantity).slice(0, 5);
  }, [orders]);
  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <AdminPageTitle title="Sales & reports" subtitle="Sales performance and order summaries · all numbers are demo data." action={<AdminButton label="Share summary" icon="share-outline" onPress={() => { void Share.share({ message: `Desi Bites demo sales: ₹${summary.total.toLocaleString('en-IN')}, ${summary.orders} orders.` }).catch(() => {}); }} compact />} />
      <AdminFilterRow options={periods} selected={period} onSelect={value => setPeriod(value as SalesPeriod)} />
      <View style={styles.metrics}><AdminMetric label="Sales" value={`₹${summary.total.toLocaleString('en-IN')}`} note={periodLabel(period)} icon="cash-outline" /><AdminMetric label="Orders" value={String(summary.orders)} note="Selected period" icon="receipt-outline" /><AdminMetric label="Avg. order value" value={`₹${averageOrder}`} note="Sales divided by orders" icon="trending-up-outline" accent /><AdminMetric label="Completed today" value={String(completed)} note="Demo order feed" icon="checkmark-done-outline" /></View>
      <AdminPanel><AdminSectionTitle title="Sales trend" trailing={<Text style={styles.chartUnit}>₹ INR · demo</Text>} /><AdminSalesChart points={summary.points} /></AdminPanel>
      <AdminPanel>
        <AdminSectionTitle title="Best-selling dishes" trailing={<Text style={styles.chartUnit}>by quantity</Text>} />
        {bestSellers.length ? bestSellers.map((item, index) => <View key={item.name} style={styles.bestRow}><View style={styles.rank}><Text style={styles.rankText}>{index + 1}</Text></View><Text style={styles.bestName} numberOfLines={1}>{item.name}</Text><Text style={styles.bestQuantity}>{item.quantity} sold</Text><Text style={styles.bestRevenue}>₹{item.revenue}</Text></View>) : <AdminEmptyState title="No report data" detail="Sales will appear when demo orders are available." />}
      </AdminPanel>
      <AdminPanel>
        <AdminSectionTitle title="Order summary" />
        <SummaryRow label="New / accepted / preparing" value={String(orders.filter(order => ['new', 'accepted', 'preparing'].includes(order.status)).length)} />
        <SummaryRow label="Ready for pickup" value={String(orders.filter(order => order.status === 'ready').length)} />
        <SummaryRow label="Completed" value={String(orders.filter(order => order.status === 'completed').length)} />
        <SummaryRow label="Cancelled" value={String(orders.filter(order => order.status === 'cancelled').length)} last />
      </AdminPanel>
    </ScrollView>
  );
}

function SummaryRow({ label, value, last }: { label: string; value: string; last?: boolean }) {
  return <View style={[styles.summaryRow, last && styles.summaryRowLast]}><Text style={styles.summaryLabel}>{label}</Text><Text style={styles.summaryValue}>{value}</Text></View>;
}

function periodLabel(period: SalesPeriod) { return period === 'today' ? 'Today · demo data' : period === 'week' ? 'This week · demo data' : 'This month · demo data'; }

const styles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 30, gap: 9 },
  metrics: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chartUnit: { color: theme.muted, fontSize: 9, fontWeight: '600' },
  bestRow: { minHeight: 46, flexDirection: 'row', alignItems: 'center', gap: 8, borderTopWidth: 1, borderTopColor: theme.border, paddingVertical: 7 },
  rank: { width: 23, height: 23, borderRadius: 8, backgroundColor: theme.header, alignItems: 'center', justifyContent: 'center' },
  rankText: { color: theme.primary, fontSize: 10, fontWeight: '800' },
  bestName: { flex: 1, color: theme.text, fontSize: 11, fontWeight: '700' },
  bestQuantity: { color: theme.muted, fontSize: 9 },
  bestRevenue: { color: theme.text, fontSize: 10, fontWeight: '800' },
  summaryRow: { minHeight: 37, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: theme.border },
  summaryRowLast: { borderBottomWidth: 0 },
  summaryLabel: { color: theme.muted, fontSize: 11 },
  summaryValue: { color: theme.text, fontSize: 12, fontWeight: '800' },
});
