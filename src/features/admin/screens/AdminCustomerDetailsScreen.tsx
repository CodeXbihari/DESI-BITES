import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { homeTheme as theme } from '../../../theme/homeTheme';
import { useAdminDemo } from '../state/AdminDemoContext';
import type { AdminStackParamList } from '../types';
import { AdminEmptyState, AdminMetric, AdminPageTitle, AdminPanel, AdminStatusPill } from '../components/AdminUI';

type Props = NativeStackScreenProps<AdminStackParamList, 'AdminCustomerDetails'>;

export function AdminCustomerDetailsScreen({ navigation, route }: Props) {
  const { customers, orders } = useAdminDemo();
  const customer = customers.find(item => item.id === route.params.customerId);
  if (!customer) return <View style={styles.missing}><AdminEmptyState title="Customer not found" detail="This customer is not part of the demo list." /></View>;
  const customerOrders = orders.filter(order => order.customerId === customer.id);
  const phoneLastFour = customer.phoneNumber.slice(-4);
  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <AdminPageTitle title={customer.name} subtitle="Customer profile · demo data" action={<View style={styles.avatar}><Text style={styles.avatarText}>{initials(customer.name)}</Text></View>} />
      <View style={styles.metrics}><AdminMetric label="Total orders" value={String(customer.orderCount)} icon="receipt-outline" /><AdminMetric label="Total spending" value={`₹${customer.totalSpend.toLocaleString('en-IN')}`} icon="wallet-outline" accent /></View>
      <AdminPanel>
        <Text style={styles.sectionTitle}>Contact details</Text>
        <View style={styles.detailRow}><Ionicons name="call-outline" size={17} color={theme.primary} /><View><Text style={styles.detailLabel}>Phone number</Text><Text style={styles.detailValue}>•••••• {phoneLastFour}</Text></View></View>
        <View style={styles.detailRow}><Ionicons name="mail-outline" size={17} color={theme.primary} /><View><Text style={styles.detailLabel}>Email</Text><Text style={styles.detailValue}>{customer.email}</Text></View></View>
        <View style={styles.detailRow}><Ionicons name="time-outline" size={17} color={theme.primary} /><View><Text style={styles.detailLabel}>Last order</Text><Text style={styles.detailValue}>{customer.lastOrder}</Text></View></View>
      </AdminPanel>
      <AdminPanel>
        <Text style={styles.sectionTitle}>Recent order history</Text>
        {customerOrders.length ? customerOrders.map(order => <View key={order.id} style={styles.orderRow}><View style={styles.orderCopy}><Text style={styles.orderId}>#{order.id}</Text><Text style={styles.detailLabel}>{order.placedAt} · {order.items.length} items</Text></View><View style={styles.orderRight}><Text style={styles.orderAmount}>₹{order.total}</Text><AdminStatusPill status={order.status} /></View></View>) : <AdminEmptyState title="No demo orders" detail="Orders for this customer will appear here." />}
      </AdminPanel>
      <Text style={styles.privacy}>Personal information is masked where full details are not needed.</Text>
    </ScrollView>
  );
}

function initials(name: string) { return name.split(' ').map(part => part.charAt(0)).slice(0, 2).join('').toUpperCase(); }

const styles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 28 },
  missing: { flex: 1, justifyContent: 'center', padding: 16 },
  avatar: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.primary },
  avatarText: { color: theme.card, fontSize: 13, fontWeight: '800' },
  metrics: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  sectionTitle: { color: theme.text, fontSize: 13, fontWeight: '800', marginBottom: 9 },
  detailRow: { minHeight: 51, flexDirection: 'row', alignItems: 'center', gap: 10, borderTopWidth: 1, borderTopColor: theme.border },
  detailLabel: { color: theme.muted, fontSize: 10, marginTop: 2 },
  detailValue: { color: theme.text, fontSize: 12, fontWeight: '600', marginTop: 2 },
  orderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8, paddingVertical: 10, borderTopWidth: 1, borderTopColor: theme.border },
  orderCopy: { flex: 1 },
  orderId: { color: theme.text, fontSize: 11, fontWeight: '800' },
  orderRight: { alignItems: 'flex-end', gap: 5 },
  orderAmount: { color: theme.text, fontSize: 12, fontWeight: '800' },
  privacy: { color: theme.muted, fontSize: 10, lineHeight: 15, paddingHorizontal: 4 },
});
