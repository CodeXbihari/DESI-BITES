import React, { createContext, useContext, useEffect, useState } from 'react';
import { Asset } from 'expo-asset';
import { Platform } from 'react-native';
import catalog from '../data/restaurantMenu.json';
import { MENU_IMAGES } from '../data/menuImages';
import { createRepositories } from '../backend/createRepositories';
import { catalogMenuSeed, DEMO_MENU_SHOP, loadCustomerMenu, type CustomerMenuRepository } from '../services/customerMenu';
import { startCustomerMenuRequest, type CustomerMenuSnapshot } from '../services/customerMenuRequest';

interface MenuState extends CustomerMenuSnapshot {
  retry: () => void;
}
const Context = createContext<MenuState | null>(null);

// An emulator bootstrap can supply an already-authenticated, isolated repository.
// This provider never initializes Firebase or redirects an existing Auth session.
export function CustomerMenuProvider({ children, repository, shopId = DEMO_MENU_SHOP }: {
  children: React.ReactNode; repository?: CustomerMenuRepository; shopId?: string;
}) {
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState<Omit<MenuState, 'retry'>>({ items: [], loading: true, error: null, source: repository?.kind ?? 'demo' });
  useEffect(() => {
    return startCustomerMenuRequest(async () => {
      if (!__DEV__) throw new Error('Customer menu integration currently supports development demo/emulator mode only.');
      const selected = repository ?? await createRepositories({ authMode: 'mock', platform: Platform.OS === 'android' ? 'android' : 'web', demoMenu: catalogMenuSeed(catalog) });
      const items = await loadCustomerMenu(selected, shopId, key => {
        if (!Object.hasOwn(MENU_IMAGES, key)) throw new Error(`Unknown bundled menu image: ${key}`);
        return Asset.fromModule(MENU_IMAGES[key]).uri;
      });
      return { items, source: selected.kind };
    }, repository?.kind ?? 'demo', setState);
  }, [repository, shopId, attempt]);
  return <Context.Provider value={{ ...state, retry: () => setAttempt(value => value + 1) }}>{children}</Context.Provider>;
}

export function useCustomerMenu() {
  const state = useContext(Context);
  if (!state) throw new Error('CustomerMenuProvider is required.');
  return state;
}
