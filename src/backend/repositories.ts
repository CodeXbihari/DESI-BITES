import type { AddressInput, CustomerAddress, CustomerProfile, Entity, MenuCategory, MenuItem, Order, OrderStatusHistory, OwnerMenuPatch, ProfileInput, Shop, ShopMembership } from './types';

export interface Page { limit?: number; afterId?: string }
export interface Repositories {
  readonly kind: 'emulator' | 'demo';
  shop: { get(shopId: string): Promise<Entity<Shop> | null> };
  menu: {
    list(shopId: string, categoryId?: string): Promise<Array<Entity<MenuItem>>>;
    categories(shopId: string): Promise<Array<Entity<MenuCategory>>>;
    ownerList(shopId: string): Promise<Array<Entity<MenuItem>>>;
    updateExisting(shopId: string, itemId: string, patch: OwnerMenuPatch, expectedRevision: number): Promise<void>;
  };
  profile: {
    get(): Promise<Entity<CustomerProfile> | null>;
    save(input: ProfileInput): Promise<void>;
  };
  addresses: {
    list(): Promise<Array<Entity<CustomerAddress>>>;
    save(addressId: string, input: AddressInput): Promise<void>;
    remove(addressId: string): Promise<void>;
  };
  membership: { get(shopId: string): Promise<Entity<ShopMembership> | null> };
  orders: {
    mine(shopId: string, page?: Page): Promise<Array<Entity<Order>>>;
    forShop(shopId: string, page?: Page): Promise<Array<Entity<Order>>>;
    history(orderId: string): Promise<Array<Entity<OrderStatusHistory>>>;
  };
  // No order/payment/history/membership mutation API in Stage 1.
}
