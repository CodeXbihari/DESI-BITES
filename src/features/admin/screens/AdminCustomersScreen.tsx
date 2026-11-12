import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { homeTheme as theme } from '../../../theme/homeTheme';
import { useAdminDemo } from '../state/AdminDemoContext';
import type { AdminCustomer } from '../types';
import { AdminEmptyState, AdminPageTitle, AdminPanel, AdminSearchField } from '../components/AdminUI';

interface Props { onOpenCustomer: (id: string) => void; }

export function AdminCustomersScreen({ onOpenCustomer }: Props) {
  const { customers } = useAdminDemo();
  const [query, setQuery] = useState('');
  const filtered = useMemo(() => customers.filter(customer => `${customer.name} ${customer.phoneNumber}`.toLowerCase().includes(query.trim().toLowerCase())), [customers, query]);
  return (
    <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
      <AdminPageTitle title="Customers" subtitle={`${customers.length} sample customer profiles · contact details are masked.`} />
      <AdminSearchField value={query} onChangeText={setQuery} placeholder="Search customer or phone" accessibilityLabel="Search customers" />
      {filtered.length ? filtered.map(customer => <CustomerRow key={customer.id} customer={customer} onPress={() => onOpenCustomer(customer.id)} />) : <AdminPanel><AdminEmptyState title="No customers found" detail="Try another customer name or phone number." icon="people-outline" /></AdminPanel>}
      <Text style={styles.privacy}>Customer records shown here are fictional demo data.</Text>
    </ScrollView>
  );
}

function CustomerRow({ customer, onPress }: { customer: AdminCustomer; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={`Open customer history for ${customer.name}`} style={styles.row}>
      <View style={styles.avatar}><Text style={styles.avatarText}>{customer.name.split(' ').map(part => part.charAt(0)).slice(0, 2).join('').toUpperCase()}</Text></View>
      <View style={styles.copy}><Text style={styles.name}>{customer.name}</Text><Text style={styles.secondary}>{customer.email}</Text><Text style={styles.secondary}>•••••• {customer.phoneNumber.slice(-4)}</Text><Text style={styles.secondary}>{customer.orderCount} orders · last {customer.lastOrder}</Text></View>
      <View style={styles.spend}><Text style={styles.amount}>₹{customer.totalSpend.toLocaleString('en-IN')}</Text><Text style={styles.secondary}>spent</Text></View>
      <Ionicons name="chevron-forward" size={16} color={theme.muted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 30, gap: 10 },
  row: { minHeight: 79, flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 12, paddingVertical: 11, borderWidth: 1, borderColor: theme.border, borderRadius: 14, backgroundColor: theme.card },
  avatar: { width: 42, height: 42, borderRadius: 21, backgroundColor: theme.header, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: theme.primary, fontSize: 11, fontWeight: '800' },
  copy: { flex: 1, minWidth: 0 },
  name: { color: theme.text, fontSize: 12, fontWeight: '800' },
  secondary: { color: theme.muted, fontSize: 9, marginTop: 4 },
  spend: { alignItems: 'flex-end' },
  amount: { color: theme.text, fontSize: 12, fontWeight: '800' },
  privacy: { color: theme.muted, fontSize: 10, paddingHorizontal: 4 },
});
