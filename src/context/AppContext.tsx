import React, { createContext, useContext, useState, useMemo, useRef } from 'react';
import { canClearSubmittedCart, mergeReorderItems } from '../services/submittedCart';
import type { CartSubmission } from '../services/customerOrderSession';
import { Product, CartProduct, CartItem, Order, CategoryType, DeliveryAddress, FulfillmentType } from '../types';
import { addCartItem, setCartQuantity, calculateCartEstimate, normalizeCoupon } from '../services/cart';
import { useCustomerAccount } from './CustomerAccountContext';
import { formatCustomerAddress } from '../services/customerAccount';
import { PRODUCTS } from '../data/mockData';

interface AppContextType {
  products: Product[];
  activeCategory: CategoryType;
  setActiveCategory: (cat: CategoryType) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  
  // Cart
  cart: CartItem[];
  addToCart: (product: CartProduct) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  cartVersion: number;
  cartInstance: string;
  clearSubmittedCart: (submitted: CartSubmission) => boolean;
  addCurrentMenuItems: (items: { product: CartProduct; quantity: number }[]) => void;
  cartCount: number;
  cartSubtotal: number;
  deliveryFee: number;
  appliedDiscount: number;
  appliedCoupon: string | null;
  applyCoupon: (code: string) => boolean;
  removeCoupon: () => void;
  finalTotal: number;

  // Favorites
  favorites: string[];
  toggleFavorite: (productId: string) => void;

  fulfillment: FulfillmentType;
  setFulfillment: (value: FulfillmentType) => void;
  deliveryAddressDraft: string;

  // Delivery & Address
  addresses: DeliveryAddress[];
  selectedAddress: DeliveryAddress | null;
  setSelectedAddress: (addr: DeliveryAddress) => void;

  // Orders
  orders: Order[];
  activeOrder: Order | null;
  placeOrder: (paymentMethod: string) => Order;
  setActiveOrder: (order: Order | null) => void;

  // Modals state
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  isCheckoutOpen: boolean;
  setIsCheckoutOpen: (open: boolean) => void;
  isTrackingOpen: boolean;
  setIsTrackingOpen: (open: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products] = useState<Product[]>(PRODUCTS);
  const [activeCategory, setActiveCategory] = useState<CategoryType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartVersion, setCartVersion] = useState(0);
  const cartRef = useRef(cart);
  const cartVersionRef = useRef(0);
  // Local identity only (not a security/submission key): prevents a restored
  // attempt from clearing a new cart whose numeric revision happens to match.
  const cartInstance = useRef(`${Date.now()}-${Math.random()}`).current;
  const [fulfillment, setFulfillment] = useState<FulfillmentType>('delivery');
  const account = useCustomerAccount();
  const uidRef = useRef(account.uid);
  uidRef.current = account.uid;
  const deliveryAddressDraft = formatCustomerAddress(account.selectedAddress?.data ?? null);
  const [favorites, setFavorites] = useState<string[]>([]);
  // Read-only compatibility views for retained legacy components; no second address store.
  const addresses: DeliveryAddress[] = account.addresses.map(({ id, data }) => ({
    id, tag: data.label, addressLine: data.addressLine, area: data.area, city: data.city, pincode: data.pincode,
    isDefault: account.profile?.data.defaultAddressId === id,
  }));
  const selectedAddress = addresses.find(address => address.id === account.selectedAddressId) ?? null;
  const setSelectedAddress = (address: DeliveryAddress) => account.selectAddress(address.id);
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);

  // Modals
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isTrackingOpen, setIsTrackingOpen] = useState(false);

  // All menu and checkout controls update this same state.
  const changeCart = (next: CartItem[]) => {
    cartRef.current = next; cartVersionRef.current++; setCartVersion(cartVersionRef.current); setCart(next);
  };
  const addToCart = (product: CartProduct) => changeCart(addCartItem(cartRef.current, product));
  const removeFromCart = (productId: string) => changeCart(setCartQuantity(cartRef.current, productId, 0));
  const updateQuantity = (productId: string, quantity: number) => changeCart(setCartQuantity(cartRef.current, productId, quantity));
  // Reorder explicitly refreshes matching product snapshots to current menu prices.
  const addCurrentMenuItems = (items: { product: CartProduct; quantity: number }[]) => {
    changeCart(mergeReorderItems(cartRef.current, items));
  };

  const clearCart = () => {
    changeCart([]);
    setAppliedCoupon(null);
  };
  const clearSubmittedCart = (submitted: CartSubmission) => {
    if (!canClearSubmittedCart({ uid: uidRef.current ?? '', version: cartVersionRef.current, instance: cartInstance }, submitted)) return false;
    clearCart(); return true;
  };

  const toggleFavorite = (productId: string) => {
    setFavorites(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const estimate = useMemo(() => calculateCartEstimate(cart, appliedCoupon, fulfillment), [cart, appliedCoupon, fulfillment]);
  // Rupee values retained at the presentation boundary for existing components.
  const cartCount = estimate.count;
  const cartSubtotal = estimate.subtotalPaise / 100;
  const deliveryFee = estimate.deliveryFeePaise / 100;
  const appliedDiscount = estimate.discountPaise / 100;
  const finalTotal = estimate.totalPaise / 100;

  const applyCoupon = (code: string): boolean => {
    const coupon = normalizeCoupon(code);
    if (!coupon) return false;
    setAppliedCoupon(coupon);
    return true;
  };
  const removeCoupon = () => setAppliedCoupon(null);

  const placeOrder = (paymentMethod: string): Order => {
    throw new Error('Local order creation is disabled. Use the trusted checkout flow.');
  };

  return (
    <AppContext.Provider
      value={{
        products,
        activeCategory,
        setActiveCategory,
        searchQuery,
        setSearchQuery,
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartVersion,
        cartInstance,
        clearSubmittedCart,
        addCurrentMenuItems,
        cartCount,
        cartSubtotal,
        deliveryFee,
        appliedDiscount,
        appliedCoupon,
        applyCoupon,
        removeCoupon,
        finalTotal,
        fulfillment,
        setFulfillment,
        deliveryAddressDraft,
        favorites,
        toggleFavorite,
        addresses,
        selectedAddress,
        setSelectedAddress,
        orders,
        activeOrder,
        placeOrder,
        setActiveOrder,
        isCartOpen,
        setIsCartOpen,
        isCheckoutOpen,
        setIsCheckoutOpen,
        isTrackingOpen,
        setIsTrackingOpen,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

