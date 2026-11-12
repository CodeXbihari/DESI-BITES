import { SEARCH_MENU_ITEMS } from '../../../data/searchMenuData';
import type {
  AdminCategory,
  AdminCustomer,
  AdminDemoData,
  AdminMenuItem,
  AdminOrder,
  AdminOrderLine,
  AdminOrderStatus,
  SalesPeriod,
  SalesPoint,
} from '../types';

const demoCustomers: AdminCustomer[] = [
  { id: 'customer-arjun', name: 'Arjun Sharma', phoneNumber: '+91 98765 24821', email: 'arjun.demo@example.com', orderCount: 18, totalSpend: 8420, lastOrder: 'Today, 12:42 PM' },
  { id: 'customer-meera', name: 'Meera Nair', phoneNumber: '+91 98765 21904', email: 'meera.demo@example.com', orderCount: 12, totalSpend: 6180, lastOrder: 'Today, 12:38 PM' },
  { id: 'customer-kabir', name: 'Kabir Rao', phoneNumber: '+91 98765 27732', email: 'kabir.demo@example.com', orderCount: 9, totalSpend: 4960, lastOrder: 'Today, 12:31 PM' },
  { id: 'customer-sana', name: 'Sana Khan', phoneNumber: '+91 98765 24519', email: 'sana.demo@example.com', orderCount: 6, totalSpend: 2840, lastOrder: 'Today, 12:22 PM' },
  { id: 'customer-isha', name: 'Isha Menon', phoneNumber: '+91 98765 20167', email: 'isha.demo@example.com', orderCount: 4, totalSpend: 1760, lastOrder: 'Yesterday, 8:14 PM' },
];

function createMenu(): AdminMenuItem[] {
  return SEARCH_MENU_ITEMS.map((item, index) => ({
    ...item,
    stockCount: index === 5 ? 0 : index === 2 ? 3 : 8 + (index % 14),
  }));
}

function createCategories(menu: AdminMenuItem[]): AdminCategory[] {
  const seen = new Set<string>();
  return menu.reduce<AdminCategory[]>((result, item) => {
    const normalized = item.category.trim().toLowerCase();
    if (!seen.has(normalized)) {
      seen.add(normalized);
      result.push({
        id: `category-${normalized.replace(/[^a-z0-9]+/g, '-')}`,
        name: item.category,
        image: item.image,
        isActive: true,
      });
    }
    return result;
  }, []);
}

function makeLine(menu: AdminMenuItem[], name: string, quantity: number): AdminOrderLine {
  const item = menu.find(entry => entry.name.toLowerCase() === name.toLowerCase()) ?? menu[0];
  return {
    itemId: item.id,
    name: item.name,
    image: item.image,
    isVeg: item.isVeg,
    price: item.price,
    quantity,
  };
}

function makeOrder(
  menu: AdminMenuItem[],
  values: Omit<AdminOrder, 'items' | 'total'> & { lines: Array<[string, number]> },
): AdminOrder {
  const items = values.lines.map(([name, quantity]) => makeLine(menu, name, quantity));
  const { lines: _lines, ...order } = values;
  return { ...order, items, total: items.reduce((sum, item) => sum + item.price * item.quantity, 0) };
}

export function createInitialAdminData(): AdminDemoData {
  const menu = createMenu();
  const orders: AdminOrder[] = [
    makeOrder(menu, { id: 'DB-48291', customerId: 'customer-arjun', customerName: 'Arjun Sharma', customerPhone: '+91 98765 24821', status: 'new', lines: [['Veg Pizza', 2], ['Hot Tea', 1]], paymentStatus: 'paid', paymentMethod: 'UPI', placedAt: 'Today, 12:42 PM', deliveryAddress: '12th Main Road, Indiranagar, Bengaluru' }),
    makeOrder(menu, { id: 'DB-48290', customerId: 'customer-meera', customerName: 'Meera Nair', customerPhone: '+91 98765 21904', status: 'preparing', lines: [['Paneer Pizza', 1], ['Mango Juice', 1]], paymentStatus: 'paid', paymentMethod: 'Card', placedAt: 'Today, 12:38 PM', deliveryAddress: 'HAL 2nd Stage, Indiranagar, Bengaluru' }),
    makeOrder(menu, { id: 'DB-48289', customerId: 'customer-kabir', customerName: 'Kabir Rao', customerPhone: '+91 98765 27732', status: 'ready', lines: [['Veg Cheese Burger', 2], ['Veg Pasta', 1]], paymentStatus: 'paid', paymentMethod: 'UPI', placedAt: 'Today, 12:31 PM', deliveryAddress: 'CMH Road, Indiranagar, Bengaluru' }),
    makeOrder(menu, { id: 'DB-48288', customerId: 'customer-sana', customerName: 'Sana Khan', customerPhone: '+91 98765 24519', status: 'completed', lines: [['Paneer Sandwich', 2], ['Sweet Lassi', 1]], paymentStatus: 'paid', paymentMethod: 'Cash', placedAt: 'Today, 12:22 PM', deliveryAddress: 'Domlur, Bengaluru' }),
    makeOrder(menu, { id: 'DB-48287', customerId: 'customer-isha', customerName: 'Isha Menon', customerPhone: '+91 98765 20167', status: 'accepted', lines: [['Veg Maggi', 1], ['Fresh Lime Juice', 1]], paymentStatus: 'paid', paymentMethod: 'UPI', placedAt: 'Today, 12:15 PM', deliveryAddress: 'Indiranagar, Bengaluru' }),
    makeOrder(menu, { id: 'DB-48286', customerId: 'customer-arjun', customerName: 'Arjun Sharma', customerPhone: '+91 98765 24821', status: 'cancelled', lines: [['Mushroom Pizza', 1]], paymentStatus: 'refunded', paymentMethod: 'Card', placedAt: 'Today, 11:58 AM', deliveryAddress: '12th Main Road, Indiranagar, Bengaluru' }),
  ];

  return {
    menu,
    categories: createCategories(menu),
    orders,
    customers: demoCustomers,
    settings: {
      name: 'Desi Bites Cafe',
      logoImage: menu[0]?.image ?? '',
      phone: '+91 80 4567 8900',
      address: '12th Main Road, Indiranagar, Bengaluru',
      openingHours: '9:00 AM – 11:00 PM',
      isOpen: true,
      acceptingOrders: true,
    },
  };
}

const salesByPeriod: Record<SalesPeriod, { total: number; orders: number; points: SalesPoint[] }> = {
  today: {
    total: 24860,
    orders: 86,
    points: [
      { label: '9 AM', value: 18 }, { label: '11 AM', value: 32 }, { label: '1 PM', value: 63 },
      { label: '3 PM', value: 42 }, { label: '5 PM', value: 54 }, { label: '7 PM', value: 88 },
      { label: '9 PM', value: 69 }, { label: 'Now', value: 96 },
    ],
  },
  week: {
    total: 142800,
    orders: 472,
    points: [
      { label: 'Mon', value: 51 }, { label: 'Tue', value: 62 }, { label: 'Wed', value: 48 },
      { label: 'Thu', value: 76 }, { label: 'Fri', value: 69 }, { label: 'Sat', value: 94 }, { label: 'Sun', value: 84 },
    ],
  },
  month: {
    total: 542300,
    orders: 1849,
    points: [
      { label: 'Week 1', value: 58 }, { label: 'Week 2', value: 68 }, { label: 'Week 3', value: 80 }, { label: 'Week 4', value: 100 },
    ],
  },
};

export function getSalesSummary(period: SalesPeriod) {
  return salesByPeriod[period];
}

export function getAdminStatusLabel(status: AdminOrderStatus): string {
  const labels: Record<AdminOrderStatus, string> = {
    new: 'New', accepted: 'Accepted', preparing: 'Preparing', ready: 'Ready', completed: 'Completed', cancelled: 'Cancelled',
  };
  return labels[status];
}

export const ADMIN_DEMO_PROFILE = {
  name: 'Riya Kapoor',
  email: 'riya.admin@desibites.demo',
  restaurant: 'Desi Bites Cafe',
};
