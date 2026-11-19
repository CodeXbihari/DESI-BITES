import { httpsCallable } from 'firebase/functions';
import { getCustomerEmulator } from '../../config/customerEmulator.web.ts';

export const DEMO_ADMIN_SHOP_ID = 'demo-desi-bites';
export type ShopStatus = 'placed' | 'preparing' | 'packed' | 'food_ready';
export interface AdminEntity<T> { id: string; data: T }
export interface AdminOrder {
  shopId: string; customerUid: string; items: Array<{ menuItemId: string; nameSnapshot: string; imageAssetKey: string; unitPricePaise: number; quantity: number; lineTotalPaise: number }>;
  currency: 'INR'; subtotalPaise: number; discountPaise: number; deliveryFeePaise: number; totalPaise: number;
  status: ShopStatus; statusVersion: number; payment: { status: 'unpaid' }; fulfillment: 'pickup' | 'delivery';
  addressSnapshot: null | { label: string; addressLine: string; area: string; city: string; pincode: string; deliveryInstructions: string };
  createdAt: { seconds: number; nanoseconds: number }; updatedAt: { seconds: number; nanoseconds: number };
}
export interface AdminMenuItem {
  name: string; categoryId: string; pricePaise: number; currency: 'INR'; imageAssetKey: string; description: string;
  availabilityNote: string; isVeg: boolean; available: boolean; published: boolean; sortOrder: number; revision: number;
  createdAt: { seconds: number; nanoseconds: number }; updatedAt: { seconds: number; nanoseconds: number };
}
export interface AdminCategory {
  name: string; sortOrder: number; isActive: boolean; imageAssetKey: string;
  createdAt: { seconds: number; nanoseconds: number }; updatedAt: { seconds: number; nanoseconds: number };
}
export interface AdminShop {
  name: string; contactEmail: string; currency: 'INR'; timezone: 'Asia/Kolkata'; acceptsOrders: boolean;
  fulfillmentOptions: Array<'pickup' | 'delivery'>; menuVersion: number;
  createdAt: { seconds: number; nanoseconds: number }; updatedAt: { seconds: number; nanoseconds: number };
}
export interface AdminHistory {
  fromStatus: ShopStatus | null; toStatus: ShopStatus; actorUid: string; actorRole: string; statusVersion: number;
  createdAt: { seconds: number; nanoseconds: number };
}
export interface AdminSnapshot<T> { id: string; data: T }
export interface AdminBootstrap {
  shop: AdminSnapshot<AdminShop>; menu: AdminSnapshot<AdminMenuItem>[]; categories: AdminSnapshot<AdminCategory>[];
  period: string; counts: Record<string, number>;
}
export interface AdminOrderPage { orders: AdminSnapshot<AdminOrder>[]; customers?: Array<{ uid: string; displayName: string | null }>; more: boolean }
export interface AdminOrderDetails {
  order: AdminSnapshot<AdminOrder>; history: AdminSnapshot<AdminHistory>[]; more: boolean;
  customer: { uid: string; displayName: string | null; phoneNumber: string | null };
}

export function createAdminApi(uid: string) {
  const { auth, functions } = getCustomerEmulator();
  return createAdminApiForSession(uid, () => auth.currentUser?.uid ?? null,
    input => httpsCallable<Record<string, unknown>, never>(functions, 'adminManage')(input).then(result => result.data));
}

export function createAdminApiForSession(uid: string, getUid: () => string | null, invoke: (input: Record<string, unknown>) => Promise<unknown>) {
  if (getUid() !== uid) throw new Error('Firebase identity differs from the signed-in session.');
  const call = async <T>(input: Record<string, unknown>): Promise<T> => {
    if (getUid() !== uid) throw new Error('Your sign-in changed. Sign in again to continue.');
    return await invoke({ shopId: DEMO_ADMIN_SHOP_ID, ...input }) as T;
  };
  return {
    access: () => call<{ role: 'owner'; uid: string; shop: AdminSnapshot<AdminShop> }>({ op: 'access' }),
    bootstrap: (period: 'all' | 'today' | 'week' | 'month' = 'today') => call<AdminBootstrap>({ op: 'bootstrap', period }),
    orders: (status: 'all' | ShopStatus = 'all', afterId: string | null = null) => call<AdminOrderPage>({ op: 'orders', status, afterId }),
    customerOrders: (customerUid: string, afterId: string | null = null) => call<AdminOrderPage>({ op: 'customerOrders', customerUid, afterId }),
    order: (orderId: string, historyAfter: number | null = null) => call<AdminOrderDetails>({ op: 'order', orderId, historyAfter }),
    status: (orderId: string, expectedVersion: number, status: ShopStatus) => call<{ order: AdminSnapshot<AdminOrder>; alreadyApplied: boolean }>({ op: 'status', orderId, expectedVersion, status }),
    menu: (item: AdminSnapshot<AdminMenuItem>, patch: Partial<Pick<AdminMenuItem, 'name' | 'description' | 'pricePaise' | 'available' | 'isVeg' | 'availabilityNote' | 'categoryId'>>) => call<AdminSnapshot<AdminMenuItem>>({ op: 'menu', itemId: item.id, expectedRevision: item.data.revision, patch }),
    category: (category: AdminSnapshot<AdminCategory>, patch: Partial<Pick<AdminCategory, 'name' | 'isActive'>>) => call<AdminSnapshot<AdminCategory>>({ op: 'category', categoryId: category.id, expectedUpdatedAt: category.data.updatedAt, patch }),
    shop: (shop: AdminSnapshot<AdminShop>, acceptsOrders: boolean) => call<AdminSnapshot<AdminShop>>({ op: 'shop', expectedUpdatedAt: shop.data.updatedAt, patch: { acceptsOrders } }),
  };
}
