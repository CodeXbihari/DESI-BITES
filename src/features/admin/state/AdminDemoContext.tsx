import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { loadAdminDemoData } from '../data/mockAdminRepository';
import { createInitialAdminData } from '../data/mockAdminData';
import type { AdminCategory, AdminDemoData, AdminOrderStatus, CategoryDraft, MenuItemDraft } from '../types';

interface AdminDemoContextValue extends AdminDemoData {
  isLoading: boolean;
  loadError: string | null;
  reload: () => void;
  updateOrderStatus: (orderId: string, status: AdminOrderStatus) => void;
  addMenuItem: (draft: MenuItemDraft) => string;
  updateMenuItem: (id: string, draft: MenuItemDraft) => void;
  deleteMenuItem: (id: string) => void;
  toggleMenuAvailability: (id: string) => void;
  setMenuStock: (id: string, stockCount: number) => void;
  addCategory: (draft: CategoryDraft) => void;
  updateCategory: (id: string, draft: CategoryDraft) => void;
  deleteCategory: (id: string) => boolean;
  updateSettings: (patch: Partial<AdminDemoData['settings']>) => void;
  resetDemoData: () => void;
}

const AdminDemoContext = createContext<AdminDemoContextValue | null>(null);

export function AdminDemoProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<AdminDemoData>(() => createInitialAdminData());
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const reload = useCallback(() => {
    let isMounted = true;
    setIsLoading(true);
    setLoadError(null);
    void loadAdminDemoData().then(nextData => {
      if (isMounted) setData(nextData);
    }).catch(() => {
      if (isMounted) setLoadError('Demo data could not be loaded. Try again.');
    }).finally(() => {
      if (isMounted) setIsLoading(false);
    });
    return () => { isMounted = false; };
  }, []);

  useEffect(() => reload(), [reload]);

  const updateOrderStatus = useCallback((orderId: string, status: AdminOrderStatus) => {
    setData(current => ({ ...current, orders: current.orders.map(order => order.id === orderId ? { ...order, status } : order) }));
  }, []);

  const addMenuItem = useCallback((draft: MenuItemDraft) => {
    const id = `demo-menu-${Date.now()}`;
    setData(current => ({ ...current, menu: [{ ...draft, id, stockCount: 12, availabilityNote: '' }, ...current.menu] }));
    return id;
  }, []);

  const updateMenuItem = useCallback((id: string, draft: MenuItemDraft) => {
    setData(current => ({ ...current, menu: current.menu.map(item => item.id === id ? { ...item, ...draft } : item) }));
  }, []);

  const deleteMenuItem = useCallback((id: string) => {
    setData(current => ({ ...current, menu: current.menu.filter(item => item.id !== id) }));
  }, []);

  const toggleMenuAvailability = useCallback((id: string) => {
    setData(current => ({ ...current, menu: current.menu.map(item => item.id === id ? { ...item, available: !item.available } : item) }));
  }, []);

  const setMenuStock = useCallback((id: string, stockCount: number) => {
    setData(current => ({ ...current, menu: current.menu.map(item => item.id === id ? { ...item, stockCount: Math.max(0, stockCount), available: stockCount > 0 ? item.available : false } : item) }));
  }, []);

  const addCategory = useCallback((draft: CategoryDraft) => {
    const id = `category-${Date.now()}`;
    setData(current => ({ ...current, categories: [...current.categories, { ...draft, id }] }));
  }, []);

  const updateCategory = useCallback((id: string, draft: CategoryDraft) => {
    setData(current => {
      const previous = current.categories.find(category => category.id === id);
      return {
        ...current,
        categories: current.categories.map(category => category.id === id ? { ...category, ...draft } : category),
        menu: previous && previous.name !== draft.name
          ? current.menu.map(item => item.category === previous.name ? { ...item, category: draft.name } : item)
          : current.menu,
      };
    });
  }, []);

  const deleteCategory = useCallback((id: string) => {
    const category = data.categories.find(item => item.id === id);
    if (!category || data.menu.some(item => item.category === category.name)) return false;
    setData(current => ({ ...current, categories: current.categories.filter(item => item.id !== id) }));
    return true;
  }, [data.categories, data.menu]);

  const updateSettings = useCallback((patch: Partial<AdminDemoData['settings']>) => {
    setData(current => ({ ...current, settings: { ...current.settings, ...patch } }));
  }, []);

  const resetDemoData = useCallback(() => {
    setData(createInitialAdminData());
    setLoadError(null);
  }, []);

  const value = useMemo<AdminDemoContextValue>(() => ({
    ...data,
    isLoading,
    loadError,
    reload,
    updateOrderStatus,
    addMenuItem,
    updateMenuItem,
    deleteMenuItem,
    toggleMenuAvailability,
    setMenuStock,
    addCategory,
    updateCategory,
    deleteCategory,
    updateSettings,
    resetDemoData,
  }), [data, isLoading, loadError, reload, updateOrderStatus, addMenuItem, updateMenuItem, deleteMenuItem,
    toggleMenuAvailability, setMenuStock, addCategory, updateCategory, deleteCategory, updateSettings, resetDemoData]);

  return <AdminDemoContext.Provider value={value}>{children}</AdminDemoContext.Provider>;
}

export function useAdminDemo() {
  const context = useContext(AdminDemoContext);
  if (!context) throw new Error('useAdminDemo must be used inside AdminDemoProvider.');
  return context;
}

export function getCategoryItemCount(category: AdminCategory, menu: AdminDemoData['menu']) {
  return menu.filter(item => item.category === category.name).length;
}
