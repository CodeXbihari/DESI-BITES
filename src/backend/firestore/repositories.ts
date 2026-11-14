import type { Repositories, Page } from '../repositories';
import type { CustomerAddress, CustomerProfile, MenuCategory, Shop, ShopMembership } from '../types';
import type { Data, QuerySpec, StorePort } from './adapterTypes';
import { entity, historyEntity, menuEntity, orderEntity } from './mappers.ts';
import { id, integer, validateAddress, validateAddressDocument, validateCategory, validateMembership, validateOwnerMenuPatch, validateProfile, validateProfileDocument, validateShop } from '../validation.ts';

export function buildRepositories(store: StorePort, kind: Repositories['kind'] = 'emulator'): Repositories {
  function uid() { const u = store.uid(); if (!u) throw new Error('Firebase authentication is required.'); return id(u); }
  function assertActor(actor: string) {
    if (store.uid() !== actor) throw new Error('Authentication changed during request.');
  }
  const shopPath = (shop: string) => `shops/${id(shop)}`;
  function mapped<T>(documentId: string, data: Data, validate: (value: unknown) => void) {
    const result = entity<T>(documentId, data); validate(result.data); return result;
  }
  async function read<T>(path: string, validate: (value: unknown) => void) {
    const actor = uid(), d = await store.get(path);
    assertActor(actor);
    return d ? mapped<T>(path.split('/').at(-1)!, d, validate) : null;
  }
  async function readList<T>(actor: string, path: string, query: QuerySpec, map: (documentId: string, data: Data) => T): Promise<T[]> {
    assertActor(actor);
    const documents = await store.list(path, query);
    assertActor(actor);
    return documents.map(x => map(x.id, x.data));
  }
  async function owner(shop: string, actor = uid()) {
    const m = await store.get(`${shopPath(shop)}/members/${actor}`);
    assertActor(actor);
    if (m?.role !== 'owner' || m.active !== true) throw new Error('Active shop-owner authorization is required.');
  }
  function pageQuery(page: Page = {}): QuerySpec {
    const limit = page.limit ?? 20; integer(limit, 1);
    if (limit > 100) throw new Error('Page limit exceeds 100.');
    return { limit, order: ['createdAt', 'desc'], ...(page.afterId ? { afterId: id(page.afterId) } : {}) };
  }
  return {
    kind,
    shop: { get: async shop => read<Shop>(shopPath(shop), validateShop) },
    menu: {
      async list(shop, category) {
        const actor = uid(), filters: NonNullable<QuerySpec['filters']> = [['published', true]];
        if (category) filters.push(['categoryId', id(category)]);
        return readList(actor, `${shopPath(shop)}/menuItems`, { filters, order: ['sortOrder', 'asc'], limit: 1000 }, menuEntity);
      },
      async categories(shop) {
        return readList(uid(), `${shopPath(shop)}/menuCategories`, { filters: [['isActive', true]], order: ['sortOrder', 'asc'], limit: 100 }, (documentId, data) => mapped<MenuCategory>(documentId, data, validateCategory));
      },
      async ownerList(shop) {
        const actor = uid(); await owner(shop, actor);
        return readList(actor, `${shopPath(shop)}/menuItems`, { order: ['sortOrder', 'asc'], limit: 1000 }, menuEntity);
      },
      async updateExisting(shop, item, value, revision) {
        const patch = validateOwnerMenuPatch(value); integer(revision, 1);
        const actor = uid(), path = `${shopPath(shop)}/menuItems/${id(item)}`;
        await owner(shop, actor);
        await store.transaction(async tx => {
          if (uid() !== actor) throw new Error('Authentication changed during request.');
          const current = await tx.get(path);
          if (!current || current.revision !== revision) throw new Error('Stale or missing menu item. Reload before editing.');
          tx.update(path, { ...patch, revision: revision + 1, updatedAt: store.serverTimestamp() });
        });
      },
    },
    profile: {
      get: async () => read<CustomerProfile>(`users/${uid()}`, validateProfileDocument),
      async save(value) {
        const input = validateProfile(value), actor = uid(), path = `users/${actor}`;
        await store.transaction(async tx => {
          if (uid() !== actor) throw new Error('Authentication changed during request.');
          const current = await tx.get(path);
          if (input.defaultAddressId !== null && !await tx.get(`${path}/addresses/${input.defaultAddressId}`)) throw new Error('Default address must belong to the current customer and exist.');
          const time = store.serverTimestamp();
          tx.set(path, { ...input, createdAt: current?.createdAt ?? time, updatedAt: time });
        });
      },
    },
    addresses: {
      async list() {
        const actor = uid();
        return readList(actor, `users/${actor}/addresses`, { limit: 100 }, (documentId, data) => mapped<CustomerAddress>(documentId, data, validateAddressDocument));
      },
      async save(addressId, value) {
        const input = validateAddress(value), actor = uid(), path = `users/${actor}/addresses/${id(addressId)}`;
        await store.transaction(async tx => {
          if (uid() !== actor) throw new Error('Authentication changed during request.');
          const current = await tx.get(path), time = store.serverTimestamp();
          tx.set(path, { ...input, createdAt: current?.createdAt ?? time, updatedAt: time });
        });
      },
      async remove(addressId) {
        const actor = uid(), profile = `users/${actor}`, address = id(addressId);
        await store.transaction(async tx => {
          if (uid() !== actor) throw new Error('Authentication changed during request.');
          const current = await tx.get(profile);
          if (current?.defaultAddressId === address) tx.update(profile, { defaultAddressId: null, updatedAt: store.serverTimestamp() });
          tx.delete(`${profile}/addresses/${address}`);
        });
      },
    },
    membership: { get: async shop => read<ShopMembership>(`${shopPath(shop)}/members/${uid()}`, validateMembership) },
    orders: {
      async mine(shop, page) {
        const actor = uid(), query = { ...pageQuery(page), filters: [['customerUid', actor], ['shopId', id(shop)]] as NonNullable<QuerySpec['filters']> };
        return readList(actor, 'orders', query, orderEntity);
      },
      async forShop(shop, page) {
        const actor = uid(); await owner(shop, actor);
        return readList(actor, 'orders', { ...pageQuery(page), filters: [['shopId', id(shop)]] }, orderEntity);
      },
      async history(order) {
        return readList(uid(), `orders/${id(order)}/statusHistory`, { order: ['statusVersion', 'asc'], limit: 100 }, historyEntity);
      },
    },
  };
}
