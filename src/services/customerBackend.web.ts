import { httpsCallable } from 'firebase/functions';
import { getCustomerEmulator } from '../config/customerEmulator.web';
import { createCustomerOrderApi } from './customerOrders';
import type { CustomerBackend } from './customerBackend.ts';
export type { CustomerBackend } from './customerBackend.ts';
export async function loadCustomerBackend(uid: string): Promise<CustomerBackend> {
  const { auth, repository, functions } = getCustomerEmulator();
  const getUid = () => auth.currentUser?.uid ?? null;
  if (getUid() !== uid) throw new Error('Firebase identity differs from the customer session.');
  const newKey = () => {
    if (!globalThis.crypto?.getRandomValues) throw new Error('Secure submission keys are unavailable.');
    return [...globalThis.crypto.getRandomValues(new Uint8Array(16))].map(n => n.toString(16).padStart(2, '0')).join('');
  };
  return { repository, account: { repository, getUid }, orders: createCustomerOrderApi(uid, getUid, repository,
    async (name, input) => (await httpsCallable(functions, name)(input)).data, newKey) };
}
