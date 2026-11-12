import React, { useEffect, useState } from 'react';
import { Image, ImageStyle, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { homeTheme as theme } from '../../../theme/homeTheme';
import { useAdminDemo } from '../state/AdminDemoContext';
import { getAdminStatusLabel } from '../data/mockAdminData';
import type { AdminOrderStatus, AdminStackParamList } from '../types';
import { AdminButton, AdminConfirmModal, AdminEmptyState, AdminPageTitle, AdminPanel, AdminStatusPill } from '../components/AdminUI';

type Props = NativeStackScreenProps<AdminStackParamList, 'AdminOrderDetails'>;

const nextState: Partial<Record<AdminOrderStatus, AdminOrderStatus>> = {
  new: 'accepted', accepted: 'preparing', preparing: 'ready', ready: 'completed',
};

export function AdminOrderDetailsScreen({ navigation, route }: Props) {
  const { orders, updateOrderStatus } = useAdminDemo();
  const order = orders.find(item => item.id === route.params.orderId);
  const [showCancel, setShowCancel] = useState(false);
  const [success, setSuccess] = useState('');

  useEffect(() => navigation.setOptions({ title: `Order ${route.params.orderId}` }), [navigation, route.params.orderId]);

  if (!order) return <View style={styles.missing}><AdminEmptyState title="Order not found" detail="This order may have been removed from the demo data." action={<AdminButton label="Go back" onPress={() => navigation.goBack()} />} /></View>;

  const next = nextState[order.status];
  const changeStatus = (status: AdminOrderStatus) => {
    updateOrderStatus(order.id, status);
    setSuccess(`Order ${getAdminStatusLabel(status).toLowerCase()} · demo only`);
  };

  return (
    <>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <AdminPageTitle title={`Order #${order.id}`} subtitle={`${order.placedAt} · ${order.items.reduce((sum, item) => sum + item.quantity, 0)} items`} action={<AdminStatusPill status={order.status} />} />
        {success ? <View style={styles.success}><Ionicons name="checkmark-circle" size={17} color="#42623B" /><Text style={styles.successText}>{success}</Text></View> : null}

        <AdminPanel>
          <View style={styles.panelHeading}><Text style={styles.panelTitle}>Customer details</Text><Ionicons name="person-circle-outline" size={20} color={theme.primary} /></View>
          <Text style={styles.customerName}>{order.customerName}</Text>
          <Text style={styles.secondary}>Phone · {maskPhone(order.customerPhone)}</Text>
          <View style={styles.addressRow}><Ionicons name="location-outline" size={16} color={theme.primary} /><Text style={styles.address}>{order.deliveryAddress}</Text></View>
        </AdminPanel>

        <AdminPanel>
          <View style={styles.panelHeading}><Text style={styles.panelTitle}>Ordered items</Text><Text style={styles.secondary}>{order.items.length} line items</Text></View>
          {order.items.map((line, index) => <View key={`${line.itemId}-${index}`} style={styles.itemRow}><Image source={{ uri: line.image }} style={styles.itemImage as ImageStyle} /><View style={styles.itemCopy}><Text style={styles.itemName}>{line.name}</Text><Text style={styles.secondary}>₹{line.price} × {line.quantity}</Text></View><Text style={styles.itemAmount}>₹{line.price * line.quantity}</Text></View>)}
          <View style={styles.billRow}><Text style={styles.billLabel}>Order total</Text><Text style={styles.billTotal}>₹{order.total}</Text></View>
        </AdminPanel>

        <AdminPanel>
          <View style={styles.panelHeading}><Text style={styles.panelTitle}>Payment</Text><AdminStatusPill status={order.paymentStatus === 'paid' ? 'active' : order.paymentStatus === 'refunded' ? 'cancelled' : 'new'} label={order.paymentStatus} /></View>
          <Text style={styles.secondary}>Method · {order.paymentMethod}</Text>
        </AdminPanel>

        <AdminPanel>
          <Text style={styles.panelTitle}>Update order status</Text>
          <Text style={styles.secondary}>Status changes are kept in this development demo only.</Text>
          <View style={styles.actions}>
            {next ? <AdminButton label={`Mark ${getAdminStatusLabel(next).toLowerCase()}`} icon="arrow-forward" tone="primary" onPress={() => changeStatus(next)} /> : null}
            {order.status !== 'completed' && order.status !== 'cancelled' ? <AdminButton label="Cancel order" icon="close-circle-outline" tone="danger" onPress={() => setShowCancel(true)} /> : null}
            {order.status === 'cancelled' ? <AdminButton label="Restore as new" icon="refresh-outline" onPress={() => changeStatus('new')} /> : null}
          </View>
        </AdminPanel>
      </ScrollView>
      <AdminConfirmModal visible={showCancel} title="Cancel this order?" message={`Order ${order.id} will be marked cancelled in the demo data.`} destructive confirmLabel="Cancel order" onCancel={() => setShowCancel(false)} onConfirm={() => { changeStatus('cancelled'); setShowCancel(false); }} />
    </>
  );
}

function maskPhone(value: string) { return `•••••• ${value.slice(-4)}`; }

const styles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 30 },
  missing: { flex: 1, justifyContent: 'center', padding: 16 },
  success: { flexDirection: 'row', alignItems: 'center', gap: 7, padding: 10, borderRadius: 9, backgroundColor: '#E8EFE0', marginBottom: 12 },
  successText: { color: '#42623B', fontSize: 11, fontWeight: '700' },
  panelHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 10 },
  panelTitle: { color: theme.text, fontSize: 13, fontWeight: '800' },
  customerName: { color: theme.text, fontSize: 14, fontWeight: '800' },
  secondary: { color: theme.muted, fontSize: 11, marginTop: 4, lineHeight: 16 },
  addressRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 7, paddingTop: 12 },
  address: { flex: 1, color: theme.text, fontSize: 11, lineHeight: 16 },
  itemRow: { minHeight: 58, flexDirection: 'row', alignItems: 'center', gap: 9, borderTopWidth: 1, borderTopColor: theme.border, paddingVertical: 8 },
  itemImage: { width: 42, height: 42, borderRadius: 9, backgroundColor: theme.header },
  itemCopy: { flex: 1 },
  itemName: { color: theme.text, fontSize: 11, fontWeight: '700' },
  itemAmount: { color: theme.text, fontSize: 12, fontWeight: '800' },
  billRow: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: theme.border, paddingTop: 11, marginTop: 4 },
  billLabel: { color: theme.text, fontSize: 12, fontWeight: '800' },
  billTotal: { color: theme.primary, fontSize: 15, fontWeight: '900' },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 14 },
});
