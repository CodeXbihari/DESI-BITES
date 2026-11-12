import React, { useEffect, useRef, useState } from 'react';
import { Image, ImageStyle, Modal, Pressable, ScrollView, StyleSheet, Switch, Text, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { homeTheme as theme } from '../../../theme/homeTheme';
import { AdminDemoLabel, AdminErrorNotice, AdminLoadingState, AdminToast } from '../components/AdminUI';
import { AdminCategoriesScreen } from './AdminCategoriesScreen';
import { AdminCustomersScreen } from './AdminCustomersScreen';
import { AdminDashboardScreen } from './AdminDashboardScreen';
import { AdminInventoryScreen } from './AdminInventoryScreen';
import { AdminMenuScreen } from './AdminMenuScreen';
import { AdminOrdersScreen } from './AdminOrdersScreen';
import { AdminProfileScreen } from './AdminProfileScreen';
import { AdminReportsScreen } from './AdminReportsScreen';
import { AdminSettingsScreen } from './AdminSettingsScreen';
import { useAdminDemo } from '../state/AdminDemoContext';
import type { AdminPage, AdminStackParamList, AdminTab } from '../types';

type Props = NativeStackScreenProps<AdminStackParamList, 'AdminWorkspace'> & { onExit: () => void };

const primaryNavigation: Array<{ page: AdminTab; label: string; icon: React.ComponentProps<typeof Ionicons>['name'] }> = [
  { page: 'dashboard', label: 'Dashboard', icon: 'grid-outline' },
  { page: 'orders', label: 'Orders', icon: 'receipt-outline' },
  { page: 'menu', label: 'Menu', icon: 'restaurant-outline' },
  { page: 'reports', label: 'Reports', icon: 'stats-chart-outline' },
  { page: 'profile', label: 'Profile', icon: 'person-circle-outline' },
];

const adminTools: Array<{ page: Exclude<AdminPage, AdminTab>; label: string; icon: React.ComponentProps<typeof Ionicons>['name'] }> = [
  { page: 'categories', label: 'Categories', icon: 'pricetags-outline' },
  { page: 'inventory', label: 'Inventory', icon: 'cube-outline' },
  { page: 'customers', label: 'Customers', icon: 'people-outline' },
  { page: 'settings', label: 'Settings', icon: 'settings-outline' },
];

export function AdminWorkspaceScreen({ navigation, onExit }: Props) {
  const { width } = useWindowDimensions();
  const isWide = width >= 900;
  const { settings, updateSettings, isLoading, loadError, reload, resetDemoData } = useAdminDemo();
  const [page, setPage] = useState<AdminPage>('dashboard');
  const [toolsVisible, setToolsVisible] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const notify = (message: string) => {
    setToast(message);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2400);
  };
  useEffect(() => () => { if (toastTimer.current) clearTimeout(toastTimer.current); }, []);
  const openPage = (next: AdminPage) => { setPage(next); setToolsVisible(false); };
  const exit = () => { resetDemoData(); onExit(); };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right', 'bottom']}>
      <View style={styles.workspace}>
        <Header
          restaurantName={settings.name}
          logoImage={settings.logoImage}
          isOpen={settings.isOpen}
          acceptingOrders={settings.acceptingOrders}
          onToggleOpen={value => { updateSettings({ isOpen: value }); notify(value ? 'Restaurant marked open · demo only' : 'Restaurant marked closed · demo only'); }}
          onToggleOrders={value => { updateSettings({ acceptingOrders: value }); notify(value ? 'Accepting orders · demo only' : 'Orders paused · demo only'); }}
          onTools={() => setToolsVisible(true)}
          showTools={!isWide}
        />
        <View style={styles.body}>
          {isWide ? <SideNavigation page={page} onNavigate={openPage} /> : null}
          <View style={styles.main}>
            {loadError ? <AdminErrorNotice message={loadError} onRetry={reload} /> : null}
            {isLoading ? <AdminLoadingState /> : <PageContent
              page={page}
              onNavigate={openPage}
              onOpenOrder={orderId => navigation.navigate('AdminOrderDetails', { orderId })}
              onOpenCustomer={customerId => navigation.navigate('AdminCustomerDetails', { customerId })}
              onAddMenu={() => navigation.navigate('AdminMenuItemForm', {})}
              onEditMenu={menuItemId => navigation.navigate('AdminMenuItemForm', { menuItemId })}
              onNotify={notify}
              onExit={exit}
            />}
          </View>
        </View>
        {!isWide ? <BottomNavigation page={page} onNavigate={openPage} /> : null}
        <AdminToast message={toast} bottomOffset={isWide ? 16 : 70} />
      </View>
      <ToolsModal visible={toolsVisible} onClose={() => setToolsVisible(false)} page={page} onNavigate={openPage} />
    </SafeAreaView>
  );
}

function Header({ restaurantName, logoImage, isOpen, acceptingOrders, onToggleOpen, onToggleOrders, onTools, showTools }: {
  restaurantName: string; logoImage: string; isOpen: boolean; acceptingOrders: boolean; onToggleOpen: (value: boolean) => void; onToggleOrders: (value: boolean) => void; onTools: () => void; showTools: boolean;
}) {
  const { width } = useWindowDimensions();
  const compact = width < 620;
  return (
    <View style={[styles.header, compact && styles.headerCompact]}>
      <View style={styles.brandGroup}>
        {logoImage ? <Image source={{ uri: logoImage }} style={styles.logoImage as ImageStyle} /> : <View style={styles.logo}><Ionicons name="restaurant" size={21} color={theme.card} /></View>}
        <View style={styles.brandCopy}><Text style={styles.brand}>DESI BITES</Text><Text style={styles.brandCaption}>CAFE MANAGEMENT</Text></View>
      </View>
      <View style={[styles.headerStatus, compact && styles.headerStatusCompact]}>
        <View style={[styles.restaurantText, compact && styles.restaurantTextCompact]}><Text style={styles.restaurantName} numberOfLines={1}>{restaurantName}</Text><Text style={styles.restaurantSubtitle}>{isOpen ? 'Restaurant open' : 'Restaurant closed'} · {acceptingOrders ? 'accepting orders' : 'orders paused'}</Text></View>
        <View style={styles.switches}>
          <View style={styles.switchPair}><Text style={styles.switchLabel}>Open</Text><Switch value={isOpen} onValueChange={onToggleOpen} trackColor={{ false: '#CFBFAE', true: '#8DAB7D' }} thumbColor={isOpen ? theme.primary : theme.card} accessibilityLabel="Restaurant open or closed" /></View>
          <View style={styles.switchPair}><Text style={styles.switchLabel}>Orders</Text><Switch value={acceptingOrders} onValueChange={onToggleOrders} trackColor={{ false: '#CFBFAE', true: '#8DAB7D' }} thumbColor={acceptingOrders ? theme.primary : theme.card} accessibilityLabel="Accepting orders" /></View>
        </View>
        {showTools ? <Pressable onPress={onTools} style={styles.toolsButton} accessibilityRole="button"><Ionicons name="apps-outline" size={17} color={theme.primary} /><Text style={styles.toolsButtonText}>Tools</Text></Pressable> : null}
      </View>
    </View>
  );
}

function SideNavigation({ page, onNavigate }: { page: AdminPage; onNavigate: (page: AdminPage) => void }) {
  return (
    <ScrollView style={styles.sideRail} contentContainerStyle={styles.sideRailContent} showsVerticalScrollIndicator={false}>
      <Text style={styles.navLabel}>WORKSPACE</Text>
      {primaryNavigation.map(item => <NavButton key={item.page} {...item} selected={page === item.page} onPress={() => onNavigate(item.page)} />)}
      <Text style={[styles.navLabel, styles.toolsLabel]}>MANAGEMENT</Text>
      {adminTools.map(item => <NavButton key={item.page} {...item} selected={page === item.page} onPress={() => onNavigate(item.page)} />)}
      <View style={styles.sidebarDemo}><AdminDemoLabel /><Text style={styles.sidebarDemoText}>All activity is local preview data.</Text></View>
    </ScrollView>
  );
}

function BottomNavigation({ page, onNavigate }: { page: AdminPage; onNavigate: (page: AdminPage) => void }) {
  return <View style={styles.bottomNav}>{primaryNavigation.map(item => {
    const selected = page === item.page;
    return <Pressable key={item.page} onPress={() => onNavigate(item.page)} accessibilityRole="button" accessibilityState={{ selected }} style={styles.bottomItem}><Ionicons name={selected ? item.icon.replace('-outline', '') as React.ComponentProps<typeof Ionicons>['name'] : item.icon} size={19} color={selected ? theme.primary : theme.muted} /><Text style={[styles.bottomLabel, selected && styles.bottomLabelActive]}>{item.label}</Text></Pressable>;
  })}</View>;
}

function NavButton({ page, label, icon, selected, onPress }: { page: AdminPage; label: string; icon: React.ComponentProps<typeof Ionicons>['name']; selected: boolean; onPress: () => void }) {
  return <Pressable onPress={onPress} accessibilityRole="button" accessibilityState={{ selected }} style={[styles.navButton, selected && styles.navButtonSelected]}><Ionicons name={icon} size={18} color={selected ? theme.primary : theme.muted} /><Text style={[styles.navButtonText, selected && styles.navButtonTextSelected]}>{label}</Text>{selected ? <View style={styles.navSelectedMark} /> : null}</Pressable>;
}

function ToolsModal({ visible, onClose, page, onNavigate }: { visible: boolean; onClose: () => void; page: AdminPage; onNavigate: (page: AdminPage) => void }) {
  return <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}><Pressable style={styles.modalBackdrop} onPress={onClose}><View style={styles.toolsSheet}><Text style={styles.toolsTitle}>Management tools</Text><Text style={styles.toolsSubtitle}>Restaurant operations · demo only</Text>{adminTools.map(item => <NavButton key={item.page} {...item} selected={page === item.page} onPress={() => onNavigate(item.page)} />)}</View></Pressable></Modal>;
}

function PageContent({ page, onNavigate, onOpenOrder, onOpenCustomer, onAddMenu, onEditMenu, onNotify, onExit }: {
  page: AdminPage; onNavigate: (page: AdminPage) => void; onOpenOrder: (id: string) => void; onOpenCustomer: (id: string) => void; onAddMenu: () => void; onEditMenu: (id: string) => void; onNotify: (message: string) => void; onExit: () => void;
}) {
  switch (page) {
    case 'dashboard': return <AdminDashboardScreen onNavigate={onNavigate} onOpenOrder={onOpenOrder} onAddMenu={onAddMenu} />;
    case 'orders': return <AdminOrdersScreen onOpenOrder={onOpenOrder} onNotify={onNotify} />;
    case 'menu': return <AdminMenuScreen onAdd={onAddMenu} onEdit={onEditMenu} onNotify={onNotify} />;
    case 'reports': return <AdminReportsScreen />;
    case 'profile': return <AdminProfileScreen onLogout={onExit} />;
    case 'categories': return <AdminCategoriesScreen onNotify={onNotify} />;
    case 'inventory': return <AdminInventoryScreen onNotify={onNotify} />;
    case 'customers': return <AdminCustomersScreen onOpenCustomer={onOpenCustomer} />;
    case 'settings': return <AdminSettingsScreen onNotify={onNotify} />;
  }
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.background },
  workspace: { flex: 1, backgroundColor: theme.background },
  header: { minHeight: 74, paddingHorizontal: 20, paddingVertical: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 14, borderBottomWidth: 1, borderBottomColor: theme.border, backgroundColor: theme.card },
  headerCompact: { minHeight: 124, paddingHorizontal: 12, paddingVertical: 8, flexWrap: 'wrap', rowGap: 2 },
  brandGroup: { flexDirection: 'row', alignItems: 'center', gap: 10, minWidth: 145 },
  logo: { width: 40, height: 40, borderRadius: 13, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.primary },
  logoImage: { width: 40, height: 40, borderRadius: 13, backgroundColor: theme.primary },
  brandCopy: { justifyContent: 'center' },
  brand: { color: theme.text, fontSize: 15, fontWeight: '900', letterSpacing: 1.2 },
  brandCaption: { color: theme.muted, fontSize: 8, fontWeight: '800', letterSpacing: 1, marginTop: 2 },
  headerStatus: { flexDirection: 'row', alignItems: 'center', gap: 12, flexShrink: 1 },
  headerStatusCompact: { flexBasis: '100%', flexWrap: 'wrap', justifyContent: 'space-between', gap: 5 },
  restaurantText: { maxWidth: 220, alignItems: 'flex-end' },
  restaurantTextCompact: { flexBasis: '100%', maxWidth: '100%', alignItems: 'flex-start' },
  restaurantName: { color: theme.text, fontSize: 11, fontWeight: '800' },
  restaurantSubtitle: { color: theme.muted, fontSize: 9, marginTop: 3, textAlign: 'right' },
  switches: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  switchPair: { flexDirection: 'row', alignItems: 'center', gap: 1 },
  switchLabel: { color: theme.muted, fontSize: 8, fontWeight: '700' },
  toolsButton: { minHeight: 36, paddingHorizontal: 10, borderRadius: 10, borderWidth: 1, borderColor: theme.border, flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: theme.background },
  toolsButtonText: { color: theme.primary, fontSize: 10, fontWeight: '800' },
  body: { flex: 1, flexDirection: 'row', width: '100%', maxWidth: 1440, alignSelf: 'center' },
  sideRail: { width: 220, borderRightWidth: 1, borderRightColor: theme.border, backgroundColor: theme.card },
  sideRailContent: { padding: 13, paddingBottom: 22 },
  navLabel: { color: theme.muted, fontSize: 8, fontWeight: '900', letterSpacing: 1.1, marginHorizontal: 10, marginTop: 9, marginBottom: 8 },
  toolsLabel: { marginTop: 22 },
  navButton: { minHeight: 42, paddingHorizontal: 11, flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 10, marginBottom: 3 },
  navButtonSelected: { backgroundColor: '#F4E7D2' },
  navButtonText: { flex: 1, color: theme.muted, fontSize: 11, fontWeight: '600' },
  navButtonTextSelected: { color: theme.primary, fontWeight: '800' },
  navSelectedMark: { width: 5, height: 5, borderRadius: 3, backgroundColor: theme.primary },
  sidebarDemo: { marginTop: 22, paddingHorizontal: 8 },
  sidebarDemoText: { color: theme.muted, fontSize: 9, lineHeight: 14, marginTop: 8 },
  main: { flex: 1, minWidth: 0, backgroundColor: theme.background },
  bottomNav: { minHeight: 60, paddingHorizontal: 5, paddingBottom: 2, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', borderTopWidth: 1, borderTopColor: theme.border, backgroundColor: theme.card },
  bottomItem: { flex: 1, minHeight: 56, alignItems: 'center', justifyContent: 'center', gap: 3 },
  bottomLabel: { color: theme.muted, fontSize: 8, fontWeight: '600' },
  bottomLabelActive: { color: theme.primary, fontWeight: '800' },
  modalBackdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(37,19,12,0.36)' },
  toolsSheet: { padding: 17, borderTopLeftRadius: 20, borderTopRightRadius: 20, backgroundColor: theme.background },
  toolsTitle: { color: theme.text, fontSize: 17, fontWeight: '800' },
  toolsSubtitle: { color: theme.muted, fontSize: 10, marginTop: 4, marginBottom: 12 },
});
