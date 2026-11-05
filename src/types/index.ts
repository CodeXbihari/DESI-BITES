export type CategoryType = 
  | 'all'
  | 'groceries'
  | 'desi_sweets'
  | 'spices_masala'
  | 'dairy_fresh'
  | 'street_food'
  | 'beverages';

export interface Product {
  id: string;
  name: string;
  hindiName?: string;
  category: CategoryType;
  price: number;
  originalPrice: number;
  weight: string;
  image: string;
  rating: number;
  ratingCount: number;
  isVeg: boolean;
  isBestseller?: boolean;
  deliveryMinutes: number;
  description: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Banner {
  id: string;
  title: string;
  subtitle: string;
  code: string;
  discount: string;
  bgGradient: [string, string];
  icon: string;
}

export interface Order {
  id: string;
  date: string;
  items: CartItem[];
  totalAmount: number;
  status: 'confirmed' | 'preparing' | 'on_the_way' | 'delivered';
  deliveryAddress: string;
  paymentMethod: string;
  estimatedDelivery: string;
}

export interface DeliveryAddress {
  id: string;
  tag: 'Home' | 'Work' | 'Other';
  addressLine: string;
  area: string;
  city: string;
  pincode: string;
  isDefault: boolean;
}

