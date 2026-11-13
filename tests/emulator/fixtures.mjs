import { Timestamp } from 'firebase/firestore';

// Synthetic fixtures only. No import of the shop catalog or production records.
export const time = Timestamp.fromMillis(1000);
export const address = { label: 'Home', addressLine: 'Synthetic address', area: 'Test area', city: 'Test city', pincode: '560001', deliveryInstructions: '' };
export const profile = { displayName: 'Synthetic customer', defaultAddressId: null, createdAt: time, updatedAt: time };
export const item = {
  name: 'Synthetic dish', categoryId: 'fixture-category', pricePaise: 13000,
  currency: 'INR', imageAssetKey: 'fixture-image.jpg', description: 'Synthetic fixture',
  availabilityNote: '', isVeg: true, available: true, published: true,
  sortOrder: 0, revision: 1, createdAt: time, updatedAt: time,
};
export const order = {
  shopId: 'shop-a', customerUid: 'customer-a', currency: 'INR',
  items: [{ menuItemId: 'fixture-item', nameSnapshot: 'Synthetic dish', imageAssetKey: 'fixture-image.jpg', unitPricePaise: 13000, quantity: 1, lineTotalPaise: 13000, menuRevision: 1 }],
  subtotalPaise: 13000, discountPaise: 0, deliveryFeePaise: 0, totalPaise: 13000,
  status: 'placed', statusVersion: 1, payment: { status: 'unpaid' },
  fulfillment: 'pickup', addressSnapshot: null, createdAt: time, updatedAt: time,
};
export const history = { fromStatus: null, toStatus: 'placed', actorUid: 'customer-a', actorRole: 'customer', statusVersion: 1, createdAt: time };
export const membership = { role: 'owner', active: true, grantedBy: 'synthetic-administrator', grantedAt: time };
export function fixtureDocuments() {
  return [
    ['shops/shop-a', { name: 'Synthetic shop A', contactEmail: 'fixture@example.invalid', currency: 'INR', timezone: 'Asia/Kolkata', acceptsOrders: false, fulfillmentOptions: ['pickup', 'delivery'], menuVersion: 1, createdAt: time, updatedAt: time }],
    ['shops/shop-b', { name: 'Synthetic shop B' }],
    ['shops/shop-a/members/owner-a', membership],
    ['shops/shop-a/members/inactive-owner', { ...membership, active: false }],
    ['shops/shop-b/members/owner-b', membership],
    ['shops/shop-a/menuCategories/fixture-category', { name: 'Synthetic category', isActive: true, sortOrder: 0, imageAssetKey: 'fixture-image.jpg', createdAt: time, updatedAt: time }],
    ['shops/shop-a/menuCategories/inactive', { name: 'Inactive', isActive: false, sortOrder: 1 }],
    ['shops/shop-a/menuItems/fixture-item', item],
    ['shops/shop-a/menuItems/unpublished', { ...item, published: false, sortOrder: 1 }],
    ['users/customer-a', profile], ['users/customer-b', profile],
    ['users/customer-a/addresses/home', { ...address, createdAt: time, updatedAt: time }],
    ['users/customer-b/addresses/foreign-home', { ...address, createdAt: time, updatedAt: time }],
    ['orders/fixture-order', order],
    ['orders/fixture-order/statusHistory/initial', history],
    ['orders/foreign-order', { ...order, shopId: 'shop-b', customerUid: 'customer-b' }],
  ];
}
