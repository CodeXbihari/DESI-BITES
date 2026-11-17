import React from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import { useCustomerMenu } from '../context/CustomerMenuContext';
import { homeTheme } from '../theme/homeTheme';

export function CustomerMenuStatus() {
  const { items, loading, error, source, retry } = useCustomerMenu();
  return <View style={{ padding: 14, gap: 8 }}>
    <Text style={{ color: homeTheme.muted }}>{source === 'demo' ? 'Local demo menu · bundled catalog · no live stock' : 'Local emulator menu · test data'}</Text>
    {loading ? <><ActivityIndicator color={homeTheme.primary} /><Text>Loading menu…</Text></> : error ?
      <><Text accessibilityRole="alert">{error}</Text><TouchableOpacity accessibilityRole="button" onPress={retry}><Text style={{ color: homeTheme.primary }}>Retry menu</Text></TouchableOpacity></> :
      items.length === 0 ? <Text>No menu items are available.</Text> : null}
  </View>;
}
