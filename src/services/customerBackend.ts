import type { CustomerOrderApi } from './customerOrders';
import type { AccountBinding } from './customerAccount';
import type { Repositories } from '../backend/repositories';
export interface CustomerBackend { account: AccountBinding; orders: CustomerOrderApi; repository: Repositories }
export async function loadCustomerBackend(_uid: string): Promise<CustomerBackend> {
  throw new Error('Persistent ordering requires the browser with local Firebase emulator sign-in. Demo sessions cannot place orders.');
}
