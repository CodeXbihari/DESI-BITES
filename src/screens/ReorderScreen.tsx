import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { useCustomerOrders } from '../context/CustomerOrdersContext';
import { asCartProduct } from '../data/searchMenuData';
import { useCustomerMenu } from '../context/CustomerMenuContext';
import { CustomerMenuStatus } from '../components/CustomerMenuStatus';
import { homeTheme as theme } from '../theme/homeTheme';
import type { Order, Entity } from '../backend/types';

export function ReorderScreen() {
  const { items: menuItems, loading, error } = useCustomerMenu();
  const history = useCustomerOrders();
  const orders = history.orders;
  const { addCurrentMenuItems, setIsCartOpen } = useApp();
  const [notice, setNotice] = useState('');
  const menuReady = !loading && !error && menuItems.length > 0 && history.enabled && !history.loading && !history.error;

  useEffect(() => { setNotice(''); }, [menuItems, loading, error]);

  const reorder = (order: Entity<Order>) => {
    if (!menuReady) return;
    const unavailable: string[] = [];
    let added = 0;
    const additions: { product: ReturnType<typeof asCartProduct>; quantity: number }[] = [];
    order.data.items.forEach(({ menuItemId, nameSnapshot, quantity }) => {
      const current = menuItems.find(item => item.id === menuItemId);
      if (!current?.available) {
        unavailable.push(nameSnapshot);
        return;
      }
      additions.push({ product: asCartProduct(current), quantity });
      added += quantity;
    });
    if (additions.length) addCurrentMenuItems(additions);
    setNotice(unavailable.length ? `Unavailable now: ${unavailable.join(', ')}.` : 'Added at current menu prices. Review a new quote before ordering.');
    if (added) setIsCartOpen(true);
  };

  return <View style={styles.container}>
    <View style={styles.header}>
      <Text style={styles.title}>Reorder</Text>
      <Text style={styles.subtitle}>Add dishes from a past order to your cart</Text>
    </View>
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <CustomerMenuStatus />
      {history.loading && <Text>Loading order history…</Text>}
      {!!history.error && <Text accessibilityRole="alert">{history.error}</Text>}
      {history.enabled && <TouchableOpacity accessibilityRole="button" onPress={() => { void history.history(); }}><Text>Refresh order history</Text></TouchableOpacity>}
      {history.more && <TouchableOpacity accessibilityRole="button" disabled={history.loading} onPress={() => { void history.history(true); }}><Text>Load more orders</Text></TouchableOpacity>}
      {!!notice && <Text style={styles.notice} accessibilityRole="alert">{notice}</Text>}
      {orders.length ? orders.map(order => <View key={order.id} style={styles.card}>
        <Text style={styles.orderId}>{order.id}</Text>
        <Text style={styles.date}>Ordered on {new Date(order.data.createdAt.seconds * 1000).toLocaleString()}</Text>
        {order.data.items.map(item => <Text key={item.menuItemId} style={styles.item}>{item.quantity}× {item.nameSnapshot}</Text>)}
        <TouchableOpacity style={[styles.button, !menuReady && styles.disabledButton]} disabled={!menuReady} accessibilityState={{ disabled: !menuReady }} onPress={() => reorder(order)} accessibilityRole="button" accessibilityLabel={`Add dishes from order ${order.id} to cart`}>
          <Ionicons name="repeat-outline" size={18} color={theme.card} />
          <Text style={styles.buttonText}>Add to cart</Text>
        </TouchableOpacity>
      </View>) : !history.loading && !history.error ? <View style={styles.empty}>
        <Ionicons name="receipt-outline" size={52} color={theme.muted} />
        <Text style={styles.emptyTitle}>No past orders yet</Text>
        <Text style={styles.emptyText}>After you place an order, its dishes will appear here for a quick reorder.</Text>
      </View> : null}
    </ScrollView>
  </View>;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background },
  header: { backgroundColor: theme.header, paddingHorizontal: 18, paddingVertical: 18, borderBottomWidth: 1, borderBottomColor: theme.border },
  title: { color: theme.primary, fontSize: 24, fontWeight: '800' },
  subtitle: { color: theme.muted, marginTop: 4, fontSize: 13 },
  content: { padding: 16, paddingBottom: 36 },
  notice: { color: theme.primary, fontSize: 13, marginBottom: 12 },
  card: { backgroundColor: theme.card, borderColor: theme.border, borderWidth: 1, borderRadius: 16, padding: 16, marginBottom: 14 },
  orderId: { color: theme.text, fontSize: 17, fontWeight: '700' },
  date: { color: theme.muted, fontSize: 12, marginTop: 3, marginBottom: 12 },
  item: { color: theme.text, fontSize: 14, marginBottom: 5 },
  button: { backgroundColor: theme.primary, borderRadius: 22, alignSelf: 'flex-end', flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 18, paddingVertical: 11, marginTop: 10 },
  buttonText: { color: theme.card, fontSize: 14, fontWeight: '700' },
  disabledButton: { opacity: 0.5 },
  empty: { alignItems: 'center', paddingHorizontal: 32, paddingTop: 72 },
  emptyTitle: { color: theme.text, fontSize: 19, fontWeight: '700', marginTop: 16 },
  emptyText: { color: theme.muted, fontSize: 14, textAlign: 'center', lineHeight: 21, marginTop: 8 },
});
