export type StaffRole = 'admin' | 'delivery';
export type StaffPath = '/login' | '/admin/dashboard' | '/admin/delivery' | '/delivery/dashboard';
export const loginPath = '/login';
export const roleDashboard = { admin: '/admin/dashboard', delivery: '/delivery/dashboard' } as const;

export type DeliveryStatus = 'assigned' | 'accepted' | 'picked-up' | 'out-for-delivery' | 'delivered';

export interface StaffAccount {
  id: string;
  role: StaffRole;
  name: string;
  phone: string;
  pin: string;
  active: boolean;
}

export interface PartnerDraft {
  name: string;
  phone: string;
  pin: string;
  active: boolean;
}

export interface DeliveryOrder {
  id: string;
  partnerId: string | null;
  customer: string;
  phone: string;
  address: string;
  items: { name: string; quantity: number }[];
  total: number;
  payment: 'UPI' | 'Card' | 'Cash';
  status: DeliveryStatus;
}

export interface StaffData {
  accounts: StaffAccount[];
  orders: DeliveryOrder[];
}

export const deliveryStatusLabel: Record<DeliveryStatus, string> = {
  assigned: 'Assigned', accepted: 'Accepted', 'picked-up': 'Picked up',
  'out-for-delivery': 'Out for delivery', delivered: 'Delivered',
};

export const deliveryAction: Partial<Record<DeliveryStatus, { label: string; next: DeliveryStatus }>> = {
  assigned: { label: 'Accept Order', next: 'accepted' },
  accepted: { label: 'Mark Picked Up', next: 'picked-up' },
  'picked-up': { label: 'Out for Delivery', next: 'out-for-delivery' },
  'out-for-delivery': { label: 'Mark Delivered', next: 'delivered' },
};

export function createStaffData(): StaffData {
  return {
    accounts: [
      { id: 'demo-admin', role: 'admin', name: 'Riya Kapoor', phone: '9999999999', pin: '123456', active: true },
      { id: 'demo-partner', role: 'delivery', name: 'Arjun Mehta', phone: '8888888888', pin: '654321', active: true },
      { id: 'demo-paused', role: 'delivery', name: 'Nisha Rao', phone: '7777777777', pin: '456789', active: false },
    ],
    orders: [
      { id: 'DB-1042', partnerId: 'demo-partner', customer: 'Meera Rao', phone: '9000000142', address: '14 Lake Road, Mysuru', items: [{ name: 'Paneer Tikka Pizza', quantity: 1 }, { name: 'Sweet Lassi', quantity: 1 }], total: 250, payment: 'UPI', status: 'assigned' },
      { id: 'DB-1041', partnerId: 'demo-partner', customer: 'Kabir Shah', phone: '9000000141', address: '28 Temple Road, Mysuru', items: [{ name: 'Veg Cheese Burger', quantity: 2 }], total: 180, payment: 'Cash', status: 'accepted' },
      { id: 'DB-1040', partnerId: 'demo-partner', customer: 'Sana Khan', phone: '9000000140', address: '6 Market Road, Mysuru', items: [{ name: 'Paneer Sandwich', quantity: 1 }], total: 80, payment: 'Card', status: 'out-for-delivery' },
      { id: 'DB-1039', partnerId: 'demo-partner', customer: 'Isha Menon', phone: '9000000139', address: '9 Park Road, Mysuru', items: [{ name: 'Veg Pizza', quantity: 1 }], total: 130, payment: 'UPI', status: 'delivered' },
    ],
  };
}

export function checkCredentials(data: StaffData, phone: string, pin: string): StaffAccount {
  if (!/^\d{10}$/.test(phone)) throw new Error('Enter a 10-digit mobile number.');
  if (!/^\d{6}$/.test(pin)) throw new Error('Enter a 6-digit PIN.');
  const account = data.accounts.find(item => item.phone === phone);
  if (!account || account.pin !== pin) throw new Error('The mobile number or PIN did not match.');
  if (!account.active) throw new Error('This account is inactive. Ask your cafe admin to activate it.');
  return account;
}

export function readStaffPath(pathname: string): StaffPath | null {
  const path = pathname.replace(/\/+$/, '');
  if (path === loginPath || path === '/admin/delivery') return path;
  if (path === '/admin' || path.startsWith('/admin/')) return roleDashboard.admin;
  if (path === '/delivery' || path.startsWith('/delivery/')) return roleDashboard.delivery;
  return null;
}

export function allowedStaffPath(requested: StaffPath, role?: StaffRole): StaffPath {
  if (!role) return loginPath;
  if (role === 'admin' && requested === '/admin/delivery') return requested;
  return roleDashboard[role];
}

export function saveDeliveryPartner(data: StaffData, id: string, draft: PartnerDraft, editing: boolean): StaffData {
  const name = draft.name.trim();
  if (name.length < 2 || name.length > 80) throw new Error('Enter a full name between 2 and 80 characters.');
  if (!/^\d{10}$/.test(draft.phone)) throw new Error('Enter a 10-digit mobile number.');
  if (!/^\d{6}$/.test(draft.pin)) throw new Error('Enter a 6-digit PIN.');
  const previous = data.accounts.find(account => account.id === id);
  if ((editing && previous?.role !== 'delivery') || (!editing && previous)) throw new Error('This partner record is no longer available.');
  if (data.accounts.some(account => account.phone === draft.phone && account.id !== id)) {
    throw new Error('This mobile number is already registered.');
  }
  const partner: StaffAccount = { ...draft, id, name, role: 'delivery' };
  const accounts = editing ? data.accounts.map(account => account.id === id ? partner : account) : [...data.accounts, partner];
  return { ...data, accounts };
}

export function removeDeliveryPartner(data: StaffData, id: string): StaffData {
  if (!data.accounts.some(account => account.id === id && account.role === 'delivery')) throw new Error('This partner record is no longer available.');
  return {
    accounts: data.accounts.filter(account => account.id !== id),
    orders: data.orders.map(order => order.partnerId === id ? { ...order, partnerId: null } : order),
  };
}

export function progressOrder(data: StaffData, partnerId: string, orderId: string, expected: DeliveryStatus): StaffData {
  const order = data.orders.find(item => item.id === orderId && item.partnerId === partnerId);
  const next = order && order.status === expected ? deliveryAction[order.status]?.next : undefined;
  if (!next) throw new Error('That order action is no longer available.');
  return { ...data, orders: data.orders.map(item => item.id === orderId ? { ...item, status: next } : item) };
}

export function deliveryCounts(orders: DeliveryOrder[]) {
  return {
    assigned: orders.filter(order => order.status !== 'delivered').length,
    pickups: orders.filter(order => order.status === 'assigned' || order.status === 'accepted').length,
    out: orders.filter(order => order.status === 'out-for-delivery').length,
    delivered: orders.filter(order => order.status === 'delivered').length,
  };
}

export function generateDemoPin(): string {
  return String(Math.floor(Math.random() * 1_000_000)).padStart(6, '0');
}
