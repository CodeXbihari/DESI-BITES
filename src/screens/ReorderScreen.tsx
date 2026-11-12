import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { SEARCH_MENU_ITEMS, asCartProduct } from '../data/searchMenuData';
import { homeTheme as theme } from '../theme/homeTheme';
import type { Order } from '../types';

export function ReorderScreen() {
  const { orders, addToCart, setIsCartOpen } = useApp();
  const [notice, setNotice] = useState('');

  const reorder = (order: Order) => {
    const unavailable: string[] = [];
    let added = 0;
    order.items.forEach(({ product, quantity }) => {
      const current = SEARCH_MENU_ITEMS.find(item => item.id === product.id);
      if (!current?.available) {
        unavailable.push(product.name);
        return;
      }
      for (let i = 0; i < quantity; i += 1) addToCart(asCartProduct(current));
      added += quantity;
    });
    setNotice(unavailable.length ? `Unavailable now: ${unavailable.join(', ')}.` : '');
    if (added) setIsCartOpen(true);
  };

  return <View style={styles.container}>
    <View style={styles.header}>
      <Text style={styles.title}>Reorder</Text>
      <Text style={styles.subtitle}>Add dishes from a past order to your cart</Text>
    </View>
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {!!notice && <Text style={styles.notice} accessibilityRole="alert">{notice}</Text>}
      {orders.length ? orders.map(order => <View key={order.id} style={styles.card}>
        <Text style={styles.orderId}>{order.id}</Text>
        <Text style={styles.date}>Ordered on {order.date}</Text>
        {order.items.map(item => <Text key={item.product.id} style={styles.item}>{item.quantity}× {item.product.name}</Text>)}
        <TouchableOpacity style={styles.button} onPress={() => reorder(order)} accessibilityRole="button" accessibilityLabel={`Add dishes from order ${order.id} to cart`}>
          <Ionicons name="repeat-outline" size={18} color={theme.card} />
          <Text style={styles.buttonText}>Add to cart</Text>
        </TouchableOpacity>
      </View>) : <View style={styles.empty}>
        <Ionicons name="receipt-outline" size={52} color={theme.muted} />
        <Text style={styles.emptyTitle}>No past orders yet</Text>
        <Text style={styles.emptyText}>After you place an order, its dishes will appear here for a quick reorder.</Text>
      </View>}
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
  empty: { alignItems: 'center', paddingHorizontal: 32, paddingTop: 72 },
  emptyTitle: { color: theme.text, fontSize: 19, fontWeight: '700', marginTop: 16 },
  emptyText: { color: theme.muted, fontSize: 14, textAlign: 'center', lineHeight: 21, marginTop: 8 },
});
