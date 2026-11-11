import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { useApp } from '../context/AppContext';
import { asCartProduct, type SearchMenuItem } from '../data/searchMenuData';
import { homeTheme as theme } from '../theme/homeTheme';

export function RestaurantFoodCard({ item }: { item: SearchMenuItem }) {
  const { cart, addToCart, updateQuantity } = useApp();
  const quantity = cart.find(entry => entry.product.id === item.id)?.quantity ?? 0;
  return <View style={styles.card} testID={`food-card-${item.id}`}>
    <View style={styles.photo}>
      <Image source={{ uri: item.image }} style={styles.image} accessibilityLabel={item.name} />
      <View style={[styles.veg, !item.isVeg && styles.nonVeg]} accessibilityLabel={item.isVeg ? 'Vegetarian' : 'Non vegetarian'}><View style={[styles.dot, !item.isVeg && styles.nonVegDot]} /></View>
    </View>
    <View style={styles.body}>
      <Text style={styles.name} numberOfLines={2}>{item.name}</Text>
      <View style={styles.bottom}>
        <Text style={styles.price}>₹{item.price}</Text>
        {!item.available ? <Text style={styles.unavailable}>Unavailable</Text> : quantity === 0 ?
          <TouchableOpacity style={styles.add} onPress={() => addToCart(asCartProduct(item))} accessibilityRole="button" accessibilityLabel={`Add ${item.name}`}><Text style={styles.buttonText}>Add ＋</Text></TouchableOpacity> :
          <View style={styles.stepper}>
            <TouchableOpacity style={styles.step} onPress={() => updateQuantity(item.id, quantity - 1)} accessibilityRole="button" accessibilityLabel={`Remove one ${item.name}`}><Text style={styles.buttonText}>−</Text></TouchableOpacity>
            <Text style={styles.quantity} accessibilityLabel={`${quantity} in cart`}>{quantity}</Text>
            <TouchableOpacity style={styles.step} onPress={() => updateQuantity(item.id, quantity + 1)} accessibilityRole="button" accessibilityLabel={`Add one ${item.name}`}><Text style={styles.buttonText}>+</Text></TouchableOpacity>
          </View>}
      </View>
    </View>
  </View>;
}

const styles = StyleSheet.create({
  card: { flex: 1, minWidth: 0, borderWidth: 1, borderColor: theme.border, borderRadius: 16, backgroundColor: theme.card, overflow: 'hidden', shadowColor: theme.text, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 4, elevation: 2 },
  photo: { width: '100%', aspectRatio: 1.8 }, image: { width: '100%', height: '100%' },
  veg: { position: 'absolute', top: 7, right: 7, width: 19, height: 19, backgroundColor: '#fff', borderWidth: 2, borderColor: '#149B42', borderRadius: 3, alignItems: 'center', justifyContent: 'center' },
  dot: { width: 9, height: 9, borderRadius: 5, backgroundColor: '#149B42' }, nonVeg: { borderColor: '#B72C2C' }, nonVegDot: { backgroundColor: '#B72C2C' },
  body: { padding: 9 }, name: { color: theme.text, fontSize: 14, fontWeight: '600', minHeight: 36 },
  bottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 4, flexWrap: 'wrap' }, price: { fontSize: 18, color: theme.text, fontWeight: '800' },
  add: { backgroundColor: theme.primary, borderRadius: 24, paddingHorizontal: 15, minHeight: 36, justifyContent: 'center' },
  buttonText: { color: theme.card, fontSize: 15, textAlign: 'center' }, stepper: { flexDirection: 'row', backgroundColor: theme.primary, borderRadius: 24, alignItems: 'center' },
  step: { minWidth: 30, minHeight: 36, justifyContent: 'center' }, quantity: { color: theme.card, minWidth: 16, textAlign: 'center', fontSize: 14, fontWeight: '700' }, unavailable: { color: theme.muted, fontSize: 12 },
});
