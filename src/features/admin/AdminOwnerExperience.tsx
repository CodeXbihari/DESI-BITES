import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { homeTheme as theme } from '../../theme/homeTheme';
import { AdminButton, AdminEmptyState, AdminMetric, AdminPanel, AdminStatusPill } from './components/AdminUI';
import { createAdminApi, type AdminBootstrap, type AdminCategory, type AdminEntity, type AdminMenuItem, type AdminOrder, type AdminOrderDetails, type AdminOrderPage, type ShopStatus } from './adminBackend.web';

type Api = ReturnType<typeof createAdminApi>;
type Page = 'dashboard' | 'orders' | 'menu' | 'categories' | 'settings';
const tabs: Array<{ id: Page; label: string; icon: React.ComponentProps<typeof Ionicons>['name'] }> = [
  { id: 'dashboard', label: 'Overview', icon: 'grid-outline' }, { id: 'orders', label: 'Orders', icon: 'receipt-outline' },
  { id: 'menu', label: 'Menu', icon: 'restaurant-outline' }, { id: 'categories', label: 'Categories', icon: 'pricetags-outline' },
  { id: 'settings', label: 'Orders setting', icon: 'settings-outline' },
];
const statuses: Array<'all' | ShopStatus> = ['all', 'placed', 'preparing', 'packed', 'food_ready'];
const nextStatus: Partial<Record<ShopStatus, ShopStatus>> = { placed: 'preparing', preparing: 'packed', packed: 'food_ready' };
const labelStatus = (status: string) => status.replace('_', ' ').replace(/^./, value => value.toUpperCase());
const rupees = (paise: number) => `₹${(paise / 100).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
const date = (instant: { seconds: number }) => new Date(instant.seconds * 1000).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });

export function AdminOwnerExperience({ uid, onExit }: { uid: string; onExit: () => void }) {
  const api = useMemo(() => createAdminApi(uid), [uid]);
  const [page, setPage] = useState<Page>('dashboard');
  const [bootstrap, setBootstrap] = useState<AdminBootstrap | null>(null);
  const [orderPage, setOrderPage] = useState<AdminOrderPage>({ orders: [], more: false });
  const [orderFilter, setOrderFilter] = useState<'all' | ShopStatus>('all');
  const [detail, setDetail] = useState<AdminOrderDetails | null>(null);
  const [historyOrders, setHistoryOrders] = useState<AdminEntity<AdminOrder>[]>([]);
  const [historyUid, setHistoryUid] = useState<string | null>(null);
  const [historyMore, setHistoryMore] = useState(false);
  const [busy, setBusy] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [accessChecked, setAccessChecked] = useState(false);
  const [authorized, setAuthorized] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [saving, setSaving] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const load = useCallback(async (refresh = false) => {
    refresh ? setRefreshing(true) : setBusy(true); setError(null);
    try {
      // This callable verifies the current UID's active owner membership before returning any shop data.
      await api.access(); setAuthorized(true); setAccessChecked(true);
      const [summary, orders] = await Promise.all([api.bootstrap('today'), api.orders(orderFilter, null)]);
      setBootstrap(summary); setOrderPage(orders);
      if (detail) setDetail(await api.order(detail.order.id));
    } catch (cause) { setError(message(cause)); setAuthorized(false); setAccessChecked(true); }
    finally { setBusy(false); setRefreshing(false); }
  }, [api, orderFilter]);
  useEffect(() => { void load(); }, [load]);
  useEffect(() => {
    if (!authorized) return;
    const timer = setInterval(() => { void load(true); }, 15_000);
    return () => clearInterval(timer);
  }, [authorized, load]);

  async function perform(key: string, action: () => Promise<unknown>, reload = true) {
    setSaving(key); setActionError(null);
    try {
      await action();
      if (key === 'status' && detail) setDetail(await api.order(detail.order.id));
      if (reload) await load(true);
    }
    catch (cause) { setActionError(message(cause)); }
    finally { setSaving(null); }
  }
  async function openOrder(orderId: string) {
    setSaving('order-detail'); setActionError(null);
    try { setDetail(await api.order(orderId)); }
    catch (cause) { setActionError(message(cause)); }
    finally { setSaving(null); }
  }
  async function loadMoreOrders() {
    const last = orderPage.orders.at(-1); if (!last || !orderPage.more || saving) return;
    setSaving('orders-page'); setActionError(null);
    try { const next = await api.orders(orderFilter, last.id); setOrderPage(current => ({ ...next, orders: [...current.orders, ...next.orders] })); }
    catch (cause) { setActionError(message(cause)); }
    finally { setSaving(null); }
  }
  async function openCustomerHistory(customerUid: string) {
    setHistoryUid(customerUid); setHistoryOrders([]); setHistoryMore(false); setSaving('customer-history'); setActionError(null);
    try { const result = await api.customerOrders(customerUid); setHistoryOrders(result.orders); setHistoryMore(result.more); }
    catch (cause) { setActionError(message(cause)); }
    finally { setSaving(null); }
  }
  async function loadMoreCustomerHistory() {
    if (!historyUid || !historyMore || saving) return;
    const last = historyOrders.at(-1); if (!last) return;
    setSaving('customer-history'); setActionError(null);
    try { const result = await api.customerOrders(historyUid, last.id); setHistoryOrders(current => [...current, ...result.orders]); setHistoryMore(result.more); }
    catch (cause) { setActionError(message(cause)); }
    finally { setSaving(null); }
  }
  async function loadMoreHistory() {
    if (!detail?.more || saving) return;
    const after = detail.history.at(-1)?.data.statusVersion;
    if (after === undefined) return;
    setSaving('history-page'); setActionError(null);
    try { const next = await api.order(detail.order.id, after); setDetail(current => current ? { ...next, history: [...current.history, ...next.history] } : next); }
    catch (cause) { setActionError(message(cause)); }
    finally { setSaving(null); }
  }

  const filteredMenu = bootstrap?.menu.filter(item => `${item.data.name} ${bootstrap.categories.find(category => category.id === item.data.categoryId)?.data.name ?? ''}`.toLowerCase().includes(search.toLowerCase())) ?? [];
  const filteredCategories = bootstrap?.categories.filter(item => item.data.name.toLowerCase().includes(search.toLowerCase())) ?? [];
  const filteredOrders = orderPage.orders;

  if (!authorized) return <SafeAreaView style={styles.safe}><View style={styles.center}>{!accessChecked ? <><ActivityIndicator color={theme.primary} /><Text style={styles.muted}>Verifying shop owner access…</Text></> : <><Text style={styles.bold}>Owner access required</Text><Text style={styles.muted}>{error ?? 'This account is not an active owner for this shop.'}</Text>{error && !error.includes('not an active owner') ? <AdminButton label="Retry" onPress={() => void load(true)} /> : null}<AdminButton label="Back to customer app" onPress={onExit} /></>}</View></SafeAreaView>;

  return <SafeAreaView style={styles.safe}>
    <View style={styles.header}>
      <View style={styles.brand}><View style={styles.brandIcon}><Ionicons name="restaurant" size={20} color="#FFF" /></View><View><Text style={styles.brandTitle}>DESI BITES</Text><Text style={styles.brandSub}>{bootstrap?.shop.data.name ?? 'Shop management'} · OWNER</Text></View></View>
      <View style={styles.headerActions}><Text style={styles.secure}><Ionicons name="shield-checkmark" size={13} color="#477444" /> Server verified</Text><Pressable accessibilityRole="button" onPress={onExit} style={styles.exit}><Ionicons name="arrow-back" size={15} color={theme.primary} /><Text style={styles.exitText}>Customer app</Text></Pressable></View>
    </View>
    <View style={styles.nav}>{tabs.map(tab => <Pressable key={tab.id} onPress={() => { setPage(tab.id); setDetail(null); setHistoryUid(null); }} accessibilityRole="button" accessibilityState={{ selected: page === tab.id }} style={[styles.navItem, page === tab.id && styles.navSelected]}><Ionicons name={tab.icon} size={16} color={page === tab.id ? theme.primary : theme.muted} /><Text style={[styles.navText, page === tab.id && styles.navTextSelected]}>{tab.label}</Text></Pressable>)}<Pressable accessibilityRole="button" accessibilityLabel="Refresh Admin data" onPress={() => void load(true)} style={styles.refresh}><Ionicons name="refresh" size={17} color={theme.primary} /></Pressable></View>
    {error ? <View style={styles.error}><Text style={styles.errorText}>{error}</Text><AdminButton label="Retry" onPress={() => void load(true)} compact /></View> : null}
    {actionError ? <Pressable onPress={() => setActionError(null)} style={styles.actionError}><Text style={styles.errorText}>{actionError}</Text><Text style={styles.dismiss}>Dismiss</Text></Pressable> : null}
    {busy && !bootstrap ? <View style={styles.center}><ActivityIndicator color={theme.primary} /><Text style={styles.muted}>Loading shop data…</Text></View> : !bootstrap ? <View style={styles.center}><Text style={styles.muted}>Shop data is unavailable.</Text><AdminButton label="Retry" onPress={() => void load(true)} /></View> : <ScrollView key={`${page}-${detail?.order.id ?? ''}-${historyUid ?? ''}`} style={styles.scroll} contentContainerStyle={styles.content} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void load(true)} tintColor={theme.primary} />}>
      {detail ? <OrderDetails detail={detail} saving={saving} onBack={() => setDetail(null)} onChange={status => void perform('status', () => api.status(detail.order.id, detail.order.data.statusVersion, status))} onHistory={openCustomerHistory} onMoreHistory={loadMoreHistory} />
        : historyUid ? <CustomerHistory uid={historyUid} orders={historyOrders} onBack={() => setHistoryUid(null)} onOpen={openOrder} saving={saving} more={historyMore} onMore={loadMoreCustomerHistory} />
        : page === 'dashboard' ? <Dashboard bootstrap={bootstrap} orders={filteredOrders} onOpen={openOrder} onPage={setPage} />
        : page === 'orders' ? <Orders orders={filteredOrders} filter={orderFilter} onFilter={value => { setOrderFilter(value); setOrderPage({ orders: [], more: false }); }} onOpen={openOrder} onMore={loadMoreOrders} more={orderPage.more} saving={saving} onHistory={openCustomerHistory} />
        : page === 'menu' ? <Menu items={filteredMenu} categories={bootstrap.categories} search={search} setSearch={setSearch} saving={saving} onPatch={(item, patch) => void perform(item.id, () => api.menu(item, patch))} />
        : page === 'categories' ? <Categories items={filteredCategories} search={search} setSearch={setSearch} saving={saving} onPatch={(item, patch) => void perform(item.id, () => api.category(item, patch))} />
        : <Settings bootstrap={bootstrap} saving={saving} onToggle={value => void perform('shop', async () => { const saved = await api.shop(bootstrap.shop, value); setBootstrap(current => current ? { ...current, shop: saved } : current); })} />}
    </ScrollView>}
  </SafeAreaView>;
}

function Dashboard({ bootstrap, orders, onOpen, onPage }: { bootstrap: AdminBootstrap; orders: AdminEntity<AdminOrder>[]; onOpen: (id: string) => void; onPage: (page: Page) => void }) {
  const counts = bootstrap.counts;
  return <><Title title="Shop dashboard" subtitle="Today’s orders and kitchen queue" /><View style={styles.metrics}><AdminMetric label="Orders today" value={String(counts.total ?? 0)} icon="receipt-outline" /><AdminMetric label="Placed" value={String(counts.placed ?? 0)} icon="time-outline" accent /><AdminMetric label="Preparing" value={String(counts.preparing ?? 0)} icon="flame-outline" /><AdminMetric label="Packed / ready" value={String((counts.packed ?? 0) + (counts.food_ready ?? 0))} icon="checkmark-done-outline" /></View><Section title="Incoming orders" trailing={<Pressable onPress={() => onPage('orders')}><Text style={styles.link}>All orders ›</Text></Pressable>} />{orders.length ? orders.slice(0, 8).map(item => <OrderRow key={item.id} item={item} onPress={() => onOpen(item.id)} />) : <AdminPanel><AdminEmptyState title="No orders today" detail="New orders will appear here after customers place them." /></AdminPanel>}<Section title="Catalog" /><View style={styles.summaryRow}><Text style={styles.body}>Menu items</Text><Text style={styles.bold}>{bootstrap.menu.length}</Text><Text style={styles.body}>Categories</Text><Text style={styles.bold}>{bootstrap.categories.length}</Text></View></>;
}

function Orders({ orders, filter, onFilter, onOpen, onMore, more, saving, onHistory }: { orders: AdminEntity<AdminOrder>[]; filter: 'all' | ShopStatus; onFilter: (status: 'all' | ShopStatus) => void; onOpen: (id: string) => void; onMore: () => void; more: boolean; saving: string | null; onHistory: (uid: string) => void }) {
  return <><Title title="Orders" subtitle="Every status remains unpaid until a verified payment integration exists." /><ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>{statuses.map(status => <Pressable key={status} onPress={() => onFilter(status)} style={[styles.filter, filter === status && styles.filterActive]}><Text style={[styles.filterText, filter === status && styles.filterTextActive]}>{status === 'all' ? 'All orders' : labelStatus(status)}</Text></Pressable>)}</ScrollView>{orders.length ? orders.map(item => <OrderRow key={item.id} item={item} onPress={() => onOpen(item.id)} customerAction={() => onHistory(item.data.customerUid)} />) : <AdminPanel><AdminEmptyState title="No matching orders" detail="Choose another status or refresh when new orders arrive." /></AdminPanel>}{more ? <AdminButton label={saving === 'orders-page' ? 'Loading…' : 'Load more orders'} disabled={Boolean(saving)} onPress={onMore} /> : null}</>;
}

function OrderRow({ item, onPress, customerAction }: { item: AdminEntity<AdminOrder>; onPress: () => void; customerAction?: () => void }) {
  const order = item.data;
  return <Pressable onPress={onPress} style={styles.orderRow} accessibilityRole="button"><View style={styles.orderMain}><Text style={styles.bold}>#{item.id}</Text><Text style={styles.muted}>{date(order.createdAt)} · {order.items.reduce((sum, line) => sum + line.quantity, 0)} items</Text><Text style={styles.body}>{order.fulfillment === 'delivery' ? `${order.addressSnapshot?.area}, ${order.addressSnapshot?.city}` : 'Pickup'} · Payment unpaid</Text></View><View style={styles.orderSide}><AdminStatusPill status={order.status === 'food_ready' ? 'ready' : order.status === 'packed' ? 'preparing' : order.status === 'preparing' ? 'preparing' : 'new'} label={labelStatus(order.status)} /><Text style={styles.bold}>{rupees(order.totalPaise)}</Text>{customerAction ? <Pressable onPress={event => { event.stopPropagation(); customerAction(); }}><Text style={styles.link}>Customer history</Text></Pressable> : null}</View></Pressable>;
}

function OrderDetails({ detail, saving, onBack, onChange, onHistory, onMoreHistory }: { detail: AdminOrderDetails; saving: string | null; onBack: () => void; onChange: (status: ShopStatus) => void; onHistory: (uid: string) => void; onMoreHistory: () => void }) {
  const order = detail.order.data, next = nextStatus[order.status];
  return <><AdminButton label="Back to orders" onPress={onBack} compact /><Title title={`Order #${detail.order.id}`} subtitle={`${date(order.createdAt)} · ${order.fulfillment === 'delivery' ? 'Delivery' : 'Pickup'}`} /><AdminPanel><View style={styles.detailHead}><Text style={styles.bold}>Kitchen status</Text><Text style={styles.bold}>{labelStatus(order.status)}</Text></View>{next ? <AdminButton label={`Move to ${labelStatus(next)}`} disabled={Boolean(saving)} onPress={() => onChange(next)} tone="primary" /> : <Text style={styles.body}>This order has reached the final supported kitchen status.</Text>}<Text style={styles.note}>Status changes are recorded with a server timestamp. Payment is unpaid.</Text></AdminPanel><Section title="Items" />{order.items.map((line, index) => <View key={`${line.menuItemId}-${index}`} style={styles.line}><Text style={styles.body}>{line.quantity} × {line.nameSnapshot}</Text><Text style={styles.bold}>{rupees(line.lineTotalPaise)}</Text></View>)}<AdminPanel><View style={styles.line}><Text style={styles.body}>Subtotal</Text><Text style={styles.body}>{rupees(order.subtotalPaise)}</Text></View><View style={styles.line}><Text style={styles.body}>Discount</Text><Text style={styles.body}>−{rupees(order.discountPaise)}</Text></View><View style={styles.line}><Text style={styles.body}>Delivery fee</Text><Text style={styles.body}>{rupees(order.deliveryFeePaise)}</Text></View><View style={styles.line}><Text style={styles.bold}>Total · Unpaid</Text><Text style={styles.bold}>{rupees(order.totalPaise)}</Text></View></AdminPanel>{order.fulfillment === 'delivery' && order.addressSnapshot ? <AdminPanel><Text style={styles.bold}>Delivery address</Text><Text style={styles.body}>{order.addressSnapshot.addressLine}, {order.addressSnapshot.area}, {order.addressSnapshot.city} {order.addressSnapshot.pincode}</Text><Text style={styles.note}>{order.addressSnapshot.deliveryInstructions}</Text></AdminPanel> : null}<Section title="Customer" /><AdminPanel><Text style={styles.bold}>{detail.customer.displayName ?? 'Customer'}</Text><Text style={styles.body}>{detail.customer.phoneNumber ?? 'Phone unavailable'}</Text><AdminButton label="View customer order history" onPress={() => onHistory(order.customerUid)} compact /></AdminPanel><Section title="Status history" />{detail.history.length ? detail.history.map(event => <View key={event.id} style={styles.historyRow}><Text style={styles.bold}>{event.data.fromStatus ? labelStatus(event.data.fromStatus) : 'Order created'} → {labelStatus(event.data.toStatus)}</Text><Text style={styles.muted}>{date(event.data.createdAt)} · {event.data.actorRole}</Text></View>) : <Text style={styles.body}>No status history returned.</Text>}{detail.more ? <AdminButton label={saving === 'history-page' ? 'Loading history…' : 'Load more history'} disabled={Boolean(saving)} onPress={onMoreHistory} compact /> : null}</>;
}

function CustomerHistory({ uid, orders, onBack, onOpen, saving, more, onMore }: { uid: string; orders: AdminEntity<AdminOrder>[]; onBack: () => void; onOpen: (id: string) => void; saving: string | null; more: boolean; onMore: () => void }) {
  return <><AdminButton label="Back to order" onPress={onBack} compact /><Title title="Customer order history" subtitle={`Customer ${uid}`} />{orders.length ? orders.map(item => <OrderRow key={item.id} item={item} onPress={() => onOpen(item.id)} />) : saving ? <ActivityIndicator color={theme.primary} /> : <AdminPanel><AdminEmptyState title="No order history" detail="No orders were found for this customer." /></AdminPanel>}{more ? <AdminButton label="Load more history" disabled={Boolean(saving)} onPress={onMore} compact /> : null}</>;
}

type MenuPatch = Partial<Pick<AdminMenuItem, 'name' | 'description' | 'pricePaise' | 'available' | 'isVeg' | 'availabilityNote' | 'categoryId'>>;
type CategoryPatch = Partial<Pick<AdminCategory, 'name' | 'isActive'>>;
function Menu({ items, categories, search, setSearch, saving, onPatch }: { items: AdminEntity<AdminMenuItem>[]; categories: AdminBootstrap['categories']; search: string; setSearch: (value: string) => void; saving: string | null; onPatch: (item: AdminEntity<AdminMenuItem>, patch: MenuPatch) => void }) {
  return <><Title title="Menu and availability" subtitle="Edit existing dishes. IDs, photos, category order and publication stay protected." /><TextInput value={search} onChangeText={setSearch} placeholder="Search menu" style={styles.search} />{items.length ? items.map(item => <MenuRow key={item.id} item={item} categories={categories} saving={saving === item.id} onPatch={patch => onPatch(item, patch)} />) : <AdminPanel><AdminEmptyState title="No menu items match" detail="Try a different search." /></AdminPanel>}</>;
}
function MenuRow({ item, categories, saving, onPatch }: { item: AdminEntity<AdminMenuItem>; categories: AdminBootstrap['categories']; saving: boolean; onPatch: (patch: MenuPatch) => void }) {
  const [name, setName] = useState(item.data.name), [price, setPrice] = useState(String(item.data.pricePaise / 100));
  const [description, setDescription] = useState(item.data.description), [availabilityNote, setAvailabilityNote] = useState(item.data.availabilityNote);
  const [categoryId, setCategoryId] = useState(item.data.categoryId);
  useEffect(() => { setName(item.data.name); setPrice(String(item.data.pricePaise / 100)); setDescription(item.data.description); setAvailabilityNote(item.data.availabilityNote); setCategoryId(item.data.categoryId); }, [item.data.name, item.data.pricePaise, item.data.description, item.data.availabilityNote, item.data.categoryId]);
  return <AdminPanel><TextInput value={name} onChangeText={setName} style={styles.search} accessibilityLabel={`Name for ${item.data.name}`} /><Text style={styles.note}>Item ID and photo mapping are preserved · revision {item.data.revision}</Text><View style={styles.editRow}><TextInput value={price} onChangeText={setPrice} keyboardType="decimal-pad" style={[styles.search, styles.priceInput]} accessibilityLabel={`Price for ${item.data.name}`} /><AdminButton label="Save price" disabled={saving} compact onPress={() => { const value = Number(price); if (Number.isFinite(value) && value > 0) onPatch({ pricePaise: Math.round(value * 100) }); }} /><View style={styles.toggle}><Text style={styles.body}>Available</Text><Switch value={item.data.available} disabled={saving} onValueChange={available => onPatch({ available })} /></View><View style={styles.toggle}><Text style={styles.body}>Vegetarian</Text><Switch value={item.data.isVeg} disabled={saving} onValueChange={isVeg => onPatch({ isVeg })} /></View></View><TextInput value={description} onChangeText={setDescription} multiline style={[styles.search, styles.description]} placeholder="Description" /><TextInput value={availabilityNote} onChangeText={setAvailabilityNote} style={[styles.search, { marginTop: 7 }]} placeholder="Availability note" /><Text style={styles.note}>Category</Text><View style={styles.editRow}>{categories.map(category => <Pressable key={category.id} disabled={saving || !category.data.isActive} onPress={() => setCategoryId(category.id)} style={[styles.filter, categoryId === category.id && styles.filterActive]}><Text style={[styles.filterText, categoryId === category.id && styles.filterTextActive]}>{category.data.name}</Text></Pressable>)}</View><AdminButton label="Save dish details" disabled={saving || (name === item.data.name && description === item.data.description && availabilityNote === item.data.availabilityNote && categoryId === item.data.categoryId)} compact onPress={() => onPatch({ name: name.trim(), description, availabilityNote, categoryId })} /></AdminPanel>;
}

function Categories({ items, search, setSearch, saving, onPatch }: { items: AdminBootstrap['categories']; search: string; setSearch: (value: string) => void; saving: string | null; onPatch: (item: AdminBootstrap['categories'][number], patch: CategoryPatch) => void }) {
  return <><Title title="Categories" subtitle="Rename or activate existing categories. Create and delete are not enabled by this backend." /><TextInput value={search} onChangeText={setSearch} placeholder="Search categories" style={styles.search} />{items.length ? items.map(item => <CategoryRow key={item.id} item={item} saving={saving === item.id} onPatch={patch => onPatch(item, patch)} />) : <AdminPanel><AdminEmptyState title="No categories match" detail="Try a different search." /></AdminPanel>}</>;
}
function CategoryRow({ item, saving, onPatch }: { item: AdminBootstrap['categories'][number]; saving: boolean; onPatch: (patch: CategoryPatch) => void }) {
  const [name, setName] = useState(item.data.name);
  useEffect(() => { setName(item.data.name); }, [item.data.name]);
  return <AdminPanel><TextInput value={name} onChangeText={setName} style={styles.search} accessibilityLabel={`Category name ${item.data.name}`} /><View style={styles.editRow}><Text style={styles.body}>Active</Text><Switch value={item.data.isActive} disabled={saving} onValueChange={isActive => onPatch({ isActive })} /><AdminButton label="Save name" compact disabled={saving || name.trim() === item.data.name} onPress={() => onPatch({ name: name.trim() })} /></View><Text style={styles.note}>Category image and sort order are preserved.</Text></AdminPanel>;
}

function Settings({ bootstrap, saving, onToggle }: { bootstrap: AdminBootstrap; saving: string | null; onToggle: (value: boolean) => void }) {
  return <><Title title="Order availability" subtitle="This is the only shop setting supported by the current schema." /><AdminPanel><View style={styles.toggle}><View style={{ flex: 1 }}><Text style={styles.bold}>Accepting orders</Text><Text style={styles.note}>Controls whether the shop accepts new customer orders.</Text></View><Switch value={bootstrap.shop.data.acceptsOrders} disabled={saving === 'shop'} onValueChange={onToggle} /></View></AdminPanel><AdminPanel><Text style={styles.bold}>Shop details</Text><Text style={styles.body}>{bootstrap.shop.data.name}</Text><Text style={styles.body}>{bootstrap.shop.data.contactEmail}</Text><Text style={styles.note}>Fulfillment supported: {bootstrap.shop.data.fulfillmentOptions.join(', ')}. No delivery behavior is changed here.</Text></AdminPanel></>;
}

function Title({ title, subtitle }: { title: string; subtitle: string }) { return <View style={styles.title}><Text style={styles.eyebrow}>DESI BITES · SECURE ADMIN</Text><Text style={styles.titleText}>{title}</Text><Text style={styles.muted}>{subtitle}</Text></View>; }
function Section({ title, trailing }: { title: string; trailing?: React.ReactNode }) { return <View style={styles.section}><Text style={styles.sectionTitle}>{title}</Text>{trailing}</View>; }
function message(error: unknown) { const code = (error as { code?: string })?.code; if (code === 'functions/permission-denied') return 'This signed-in account is not an active owner for this shop.'; if (code === 'functions/unauthenticated') return 'Sign in with the Firebase Auth emulator to continue.'; return error instanceof Error ? error.message : 'Admin request failed. Refresh and retry.'; }

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.background }, scroll: { flex: 1 }, content: { padding: 16, paddingBottom: 40, gap: 10 },
  header: { minHeight: 66, paddingHorizontal: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: theme.card, borderBottomWidth: 1, borderColor: theme.border },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 9 }, brandIcon: { width: 38, height: 38, borderRadius: 12, backgroundColor: theme.primary, alignItems: 'center', justifyContent: 'center' }, brandTitle: { color: theme.text, fontSize: 14, fontWeight: '900', letterSpacing: 1 }, brandSub: { color: theme.muted, fontSize: 9, marginTop: 3 },
  headerActions: { alignItems: 'flex-end', gap: 5 }, secure: { color: '#477444', fontSize: 9, fontWeight: '700' }, exit: { flexDirection: 'row', alignItems: 'center', gap: 4 }, exitText: { color: theme.primary, fontSize: 10, fontWeight: '700' },
  nav: { flexDirection: 'row', alignItems: 'center', gap: 4, padding: 7, backgroundColor: theme.card, borderBottomWidth: 1, borderColor: theme.border }, navItem: { flex: 1, minHeight: 42, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 5, borderRadius: 9 }, navSelected: { backgroundColor: '#F4E7D2' }, navText: { color: theme.muted, fontSize: 9, fontWeight: '600' }, navTextSelected: { color: theme.primary, fontWeight: '800' }, refresh: { width: 32, alignItems: 'center' },
  title: { gap: 4, marginBottom: 3 }, eyebrow: { color: theme.primary, fontSize: 8, fontWeight: '900', letterSpacing: 1 }, titleText: { color: theme.text, fontSize: 22, fontWeight: '900' }, muted: { color: theme.muted, fontSize: 10 }, body: { color: theme.text, fontSize: 11 }, bold: { color: theme.text, fontSize: 12, fontWeight: '800' }, note: { color: theme.muted, fontSize: 9, marginTop: 5 }, link: { color: theme.primary, fontSize: 10, fontWeight: '800' },
  metrics: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 }, section: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }, sectionTitle: { color: theme.text, fontSize: 13, fontWeight: '800' }, orderRow: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 11, borderWidth: 1, borderColor: theme.border, borderRadius: 12, backgroundColor: theme.card }, orderMain: { flex: 1, gap: 4 }, orderSide: { alignItems: 'flex-end', gap: 6 },
  filters: { gap: 6, paddingVertical: 2 }, filter: { paddingHorizontal: 10, paddingVertical: 7, borderRadius: 99, borderWidth: 1, borderColor: theme.border, backgroundColor: theme.card }, filterActive: { backgroundColor: theme.primary, borderColor: theme.primary }, filterText: { color: theme.muted, fontSize: 9 }, filterTextActive: { color: '#FFF', fontWeight: '800' }, search: { minHeight: 38, paddingHorizontal: 10, borderWidth: 1, borderColor: theme.border, borderRadius: 9, color: theme.text, backgroundColor: theme.card, fontSize: 11 }, priceInput: { width: 85 }, description: { minHeight: 58, marginTop: 8, textAlignVertical: 'top' }, editRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 8, marginTop: 8 }, toggle: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 }, error: { padding: 10, backgroundColor: '#F5E1DD', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, actionError: { padding: 9, backgroundColor: '#F5E1DD', flexDirection: 'row', justifyContent: 'space-between' }, errorText: { color: '#8B3D35', fontSize: 10, flex: 1 }, dismiss: { color: '#8B3D35', fontSize: 10, paddingLeft: 8 }, summaryRow: { flexDirection: 'row', justifyContent: 'space-between', padding: 12, backgroundColor: theme.card, borderRadius: 10 }, detailHead: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }, line: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 7 }, historyRow: { padding: 10, borderLeftWidth: 2, borderColor: theme.primary, backgroundColor: theme.card, gap: 4 },
});
