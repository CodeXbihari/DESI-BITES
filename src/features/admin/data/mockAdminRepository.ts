import { createInitialAdminData } from './mockAdminData';
import type { AdminDemoData } from '../types';

// Deliberately separate from Firebase. Replace this adapter with an authorized
// service later; this demo loader never reads or writes customer data.
export async function loadAdminDemoData(): Promise<AdminDemoData> {
  await new Promise(resolve => setTimeout(resolve, 220));
  return createInitialAdminData();
}
