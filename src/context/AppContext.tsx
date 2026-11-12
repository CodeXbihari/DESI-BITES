import React, { createContext, useContext, useState, useMemo } from 'react';
import { Product, CartProduct, CartItem, Order, CategoryType, DeliveryAddress, FulfillmentType } from '../types';
import { addCartItem, setCartQuantity, calculateCartEstimate, normalizeCoupon } from '../services/cart';
import { PRODUCTS, INITIAL_ADDRESSES } from '../data/mockData';

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
  setDeliveryAddressDraft: (value: string) => void;

  // Delivery & Address
  addresses: DeliveryAddress[];
  selectedAddress: DeliveryAddress;
  setSelectedAddress: (addr: DeliveryAddress) => void;
  addAddress: (addr: DeliveryAddress) => void;

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
  const [fulfillment, setFulfillment] = useState<FulfillmentType>('delivery');
  const [deliveryAddressDraft, setDeliveryAddressDraft] = useState('');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [addresses, setAddresses] = useState<DeliveryAddress[]>(INITIAL_ADDRESSES);
  const [selectedAddress, setSelectedAddress] = useState<DeliveryAddress>(INITIAL_ADDRESSES[0]);
  const addAddress = (address: DeliveryAddress) => { setAddresses(prev => [...prev, address]); setSelectedAddress(address); };
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);

  // Modals
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isTrackingOpen, setIsTrackingOpen] = useState(false);

  // All menu and checkout controls update this same state.
  const addToCart = (product: CartProduct) => setCart(prev => addCartItem(prev, product));
  const removeFromCart = (productId: string) => setCart(prev => setCartQuantity(prev, productId, 0));
  const updateQuantity = (productId: string, quantity: number) => setCart(prev => setCartQuantity(prev, productId, quantity));

  const clearCart = () => {
    setCart([]);
    setAppliedCoupon(null);
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
    const newOrder: Order = {
      id: `DESI-${Math.floor(100000 + Math.random() * 900000)}`,
      date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      items: [...cart],
      totalAmount: finalTotal,
      status: 'confirmed',
      deliveryAddress: `${selectedAddress.addressLine}, ${selectedAddress.area}`,
      paymentMethod,
      estimatedDelivery: '15 - 20 mins',
    };

    setOrders(prev => [newOrder, ...prev]);
    setActiveOrder(newOrder);
    clearCart();
    setIsCheckoutOpen(false);
    setIsCartOpen(false);
    setIsTrackingOpen(true);
    return newOrder;
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
        setDeliveryAddressDraft,
        favorites,
        toggleFavorite,
        addresses,
        selectedAddress,
        setSelectedAddress,
        addAddress,
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

