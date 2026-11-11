import { Asset } from 'expo-asset';
import catalog from './restaurantMenu.json';
import { MENU_IMAGES } from './menuImages';
import type { SearchMenuItem } from './searchMenuData';
import type { Product } from '../types';

// The JSON catalog is shared with the standalone browser preview.
export const SEARCH_MENU_ITEMS: SearchMenuItem[] = catalog.map(item => ({
  ...item,
  image: Asset.fromModule(MENU_IMAGES[item.image]).uri,
}));
export const MENU_CATEGORIES = ['All', ...new Set(catalog.map(item => item.category))];

// Adapt restaurant items to the existing cart contract without a second cart.
export function asCartProduct(item: SearchMenuItem): Product {
  return {
    id: item.id, name: item.name, category: 'street_food', price: item.price,
    originalPrice: item.price, weight: item.availabilityNote || '1 serving',
    image: item.image, rating: 0, ratingCount: 0, isVeg: item.isVeg,
    deliveryMinutes: 20, description: item.description,
  };
}
