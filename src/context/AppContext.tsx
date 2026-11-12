import React, { createContext, useContext, useState, useMemo } from 'react';
import { Product, CartItem, Order, CategoryType, DeliveryAddress } from '../types';
import { PRODUCTS, INITIAL_ADDRESSES } from '../data/mockData';

interface AppContextType {
  products: Product[];
  activeCategory: CategoryType;
  setActiveCategory: (cat: CategoryType) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  
  // Cart
  cart: CartItem[];
  addToCart: (product: Product) => void;
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

  // Cart operations
  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prev =>
      prev.map(item =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

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

  // Calculations
  const cartCount = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  }, [cart]);

  const cartSubtotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  }, [cart]);

  const deliveryFee = useMemo(() => {
    if (cartSubtotal === 0) return 0;
    if (appliedCoupon === 'DESIEXPRESS' || cartSubtotal >= 499) return 0;
    return 35;
  }, [cartSubtotal, appliedCoupon]);

  const appliedDiscount = useMemo(() => {
    if (!appliedCoupon) return 0;
    if (appliedCoupon === 'FESTIVE40') {
      return Math.round(cartSubtotal * 0.4);
    }
    if (appliedCoupon === 'SPICE20') {
      return Math.round(cartSubtotal * 0.2);
    }
    return 0;
  }, [cartSubtotal, appliedCoupon]);

  const applyCoupon = (code: string): boolean => {
    const upper = code.trim().toUpperCase();
    if (upper === 'FESTIVE40' || upper === 'DESIEXPRESS' || upper === 'SPICE20') {
      setAppliedCoupon(upper);
      return true;
    }
    return false;
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
  };

  const finalTotal = useMemo(() => {
    const total = cartSubtotal - appliedDiscount + deliveryFee;
    return Math.max(0, total);
  }, [cartSubtotal, appliedDiscount, deliveryFee]);

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

