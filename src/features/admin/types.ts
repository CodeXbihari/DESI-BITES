import type { SearchMenuItem } from '../../data/searchMenuData';

export type AdminTab = 'dashboard' | 'orders' | 'menu' | 'reports' | 'profile';
export type AdminPage = AdminTab | 'categories' | 'inventory' | 'customers' | 'settings';
export type AdminOrderStatus = 'new' | 'accepted' | 'preparing' | 'ready' | 'completed' | 'cancelled';

export type AdminStackParamList = {
  AdminWorkspace: undefined;
  AdminOrderDetails: { orderId: string };
  AdminMenuItemForm: { menuItemId?: string };
  AdminCustomerDetails: { customerId: string };
};

export interface AdminMenuItem extends SearchMenuItem {
  stockCount: number;
}

export interface AdminCategory {
  id: string;
  name: string;
  image: string;
  isActive: boolean;
}

export interface AdminOrderLine {
  itemId: string;
  name: string;
  image: string;
  isVeg: boolean;
  price: number;
  quantity: number;
}

export interface AdminOrder {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  status: AdminOrderStatus;
  items: AdminOrderLine[];
  total: number;
  paymentStatus: 'paid' | 'pending' | 'refunded';
  paymentMethod: 'UPI' | 'Card' | 'Cash';
  placedAt: string;
  deliveryAddress: string;
}

export interface AdminCustomer {
  id: string;
  name: string;
  phoneNumber: string;
  email: string;
  orderCount: number;
  totalSpend: number;
  lastOrder: string;
}

export interface SalesPoint {
  label: string;
  value: number;
}

export type SalesPeriod = 'today' | 'week' | 'month';

export interface AdminRestaurantSettings {
  name: string;
  logoImage: string;
  phone: string;
  address: string;
  openingHours: string;
  isOpen: boolean;
  acceptingOrders: boolean;
}

export interface AdminDemoData {
  menu: AdminMenuItem[];
  categories: AdminCategory[];
  orders: AdminOrder[];
  customers: AdminCustomer[];
  settings: AdminRestaurantSettings;
}

export interface MenuItemDraft {
  name: string;
  description: string;
  price: number;
  category: string;
  isVeg: boolean;
  image: string;
  available: boolean;
}

export interface CategoryDraft {
  name: string;
  image: string;
  isActive: boolean;
}
