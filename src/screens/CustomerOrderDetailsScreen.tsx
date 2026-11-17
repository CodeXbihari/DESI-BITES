import React, { useEffect } from 'react';
import { ScrollView, Text, TouchableOpacity, View, StyleSheet } from 'react-native';
import { useCustomerOrders } from '../context/CustomerOrdersContext';

export function CustomerOrderDetailsScreen({ orderId, confirmation = false, onBack, onHistory, onDetails }: {
  orderId: string; confirmation?: boolean; onBack: () => void; onHistory: () => void; onDetails?: () => void;
}) {
  const orders = useCustomerOrders();
  useEffect(() => { void orders.loadOrder(orderId); }, [orderId, orders.loadOrder]);
  const order = orders.detailId === orderId ? orders.detail : null;
  return <ScrollView contentContainerStyle={styles.page}>
    <TouchableOpacity accessibilityRole="button" onPress={onBack}><Text>Back</Text></TouchableOpacity>
    <Text style={styles.title}>{confirmation ? 'Order placed' : 'Order details'}</Text>
    <Text selectable>Order ID: {orderId}</Text>
    {!orders.enabled && <Text accessibilityRole="alert">{orders.error}</Text>}
    {orders.enabled && (orders.detailId !== orderId || orders.detailLoading) && <Text>Loading order…</Text>}
    {!!orders.detailError && <View><Text accessibilityRole="alert">{orders.detailError}</Text>
      <TouchableOpacity accessibilityRole="button" onPress={() => { void orders.loadOrder(orderId); }}><Text>Retry order</Text></TouchableOpacity></View>}
    {order && <View style={styles.card}>
      <Text>Status: {order.data.status === 'placed' ? 'Placed' : order.data.status.replace('_', ' ')}</Text>
      <Text>Payment status: Unpaid</Text><Text>No payment has been collected.</Text>
      <Text>{order.data.fulfillment === 'pickup' ? 'Pickup' : 'Delivery'}</Text>
      {order.data.addressSnapshot && <Text>{order.data.addressSnapshot.addressLine}, {order.data.addressSnapshot.area}, {order.data.addressSnapshot.city} – {order.data.addressSnapshot.pincode}</Text>}
      {order.data.items.map(item => <Text key={item.menuItemId}>{item.quantity} × {item.nameSnapshot} · ₹{(item.lineTotalPaise / 100).toFixed(2)}</Text>)}
      <Text style={styles.title}>Total: ₹{(order.data.totalPaise / 100).toFixed(2)}</Text>
    </View>}
    {!!onDetails && <TouchableOpacity accessibilityRole="button" onPress={onDetails}><Text>View order details</Text></TouchableOpacity>}
    <TouchableOpacity accessibilityRole="button" onPress={onHistory}><Text>View order history</Text></TouchableOpacity>
  </ScrollView>;
}
const styles = StyleSheet.create({ page: { padding: 24, gap: 18 }, title: { fontSize: 22, fontWeight: '700' }, card: { padding: 18, gap: 12, backgroundColor: '#FFF0D7', borderRadius: 12 } });
