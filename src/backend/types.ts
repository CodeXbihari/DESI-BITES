// Domain values never depend on a platform Firebase SDK.
export interface Instant { seconds: number; nanoseconds: number }
export interface AuditFields { createdAt: Instant; updatedAt: Instant }
export interface Entity<T> { id: string; data: T }
export type Fulfillment = 'pickup' | 'delivery';
export type OrderStatus = 'placed' | 'preparing' | 'packed' | 'food_ready';

export interface Shop extends AuditFields {
  name: string;
  contactEmail: string;
  currency: 'INR';
  timezone: 'Asia/Kolkata';
  acceptsOrders: boolean;
  fulfillmentOptions: Fulfillment[];
  menuVersion: number;
}
export interface MenuCategory extends AuditFields {
  name: string;
  sortOrder: number;
  isActive: boolean;
  imageAssetKey: string;
}
export interface MenuItem extends AuditFields {
  name: string;
  categoryId: string;
  pricePaise: number;
  currency: 'INR';
  imageAssetKey: string;
  description: string;
  availabilityNote: string;
  isVeg: boolean;
  available: boolean;
  published: boolean;
  sortOrder: number;
  revision: number;
}
export interface CustomerProfile extends AuditFields {
  displayName: string;
  defaultAddressId: string | null;
}
export interface AddressSnapshot {
  label: 'Home' | 'Work' | 'Other';
  addressLine: string;
  area: string;
  city: string;
  pincode: string;
  deliveryInstructions: string;
}
export interface CustomerAddress extends AddressSnapshot, AuditFields {}
export interface OrderLine {
  menuItemId: string;
  nameSnapshot: string;
  imageAssetKey: string;
  unitPricePaise: number;
  quantity: number;
  lineTotalPaise: number;
  menuRevision: number;
}
interface OrderBase extends AuditFields {
  shopId: string;
  customerUid: string;
  items: OrderLine[];
  currency: 'INR';
  subtotalPaise: number;
  discountPaise: number;
  deliveryFeePaise: number;
  totalPaise: number;
  status: OrderStatus;
  statusVersion: number;
  payment: { status: 'unpaid' };
}
export type Order = OrderBase & (
  { fulfillment: 'pickup'; addressSnapshot: null }
  | { fulfillment: 'delivery'; addressSnapshot: AddressSnapshot }
);
export interface OrderStatusHistory {
  fromStatus: OrderStatus | null;
  toStatus: OrderStatus;
  actorUid: string;
  actorRole: 'customer' | 'owner' | 'system';
  statusVersion: number;
  createdAt: Instant;
}
export interface ShopMembership {
  role: 'owner';
  active: boolean;
  grantedBy: string;
  grantedAt: Instant;
}
export type ProfileInput = Pick<CustomerProfile, 'displayName' | 'defaultAddressId'>;
export type AddressInput = AddressSnapshot;
export type OwnerMenuPatch = Partial<Pick<MenuItem, 'pricePaise' | 'available'>>;
