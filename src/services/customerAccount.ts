import type { Repositories } from '../backend/repositories';
import type { AddressInput, CustomerAddress, CustomerProfile, Entity } from '../backend/types';
import { id, validateAddress, validateAddressDocument, validateProfile, validateProfileDocument } from '../backend/validation.ts';

export type AccountRepository = Pick<Repositories, 'kind' | 'profile' | 'addresses'>;
// An emulator bootstrap must supply its real Auth SDK UID getter, from the
// SAME isolated app as the repository. A claimed UID is not authorization.
export interface AccountBinding { repository: AccountRepository; getUid: () => string | null }
export interface AccountSnapshot {
  uid: string | null;
  source: Repositories['kind'];
  profile: Entity<CustomerProfile> | null;
  addresses: Entity<CustomerAddress>[];
  selectedAddressId: string | null;
  selectionNotice: string | null;
  loading: boolean;
  busy: boolean;
  error: string | null;
}

export function addressInput(address: AddressInput): AddressInput {
  const { label, addressLine, area, city, pincode, deliveryInstructions } = address;
  return { label, addressLine, area, city, pincode, deliveryInstructions };
}
export function selectedCustomerAddress(state: AccountSnapshot) {
  return state.addresses.find(address => address.id === state.selectedAddressId) ?? null;
}
export function formatCustomerAddress(address: AddressInput | null): string {
  return address ? `${address.addressLine}, ${address.area}, ${address.city} - ${address.pincode}` : '';
}
export function accountReady(state: AccountSnapshot): boolean {
  return !!state.uid && !state.loading && !state.busy && !state.error;
}
export function hasValidDeliveryAddress(state: AccountSnapshot): boolean {
  if (!accountReady(state)) return false;
  const selected = selectedCustomerAddress(state);
  if (!selected) return false;
  try { validateAddress(addressInput(selected.data)); return true; } catch { return false; }
}

// An external store shared by Profile, Home and Checkout; all persistence goes
// through Stage 1. No UID parameters are exposed on any customer operation.
export function createCustomerAccountSession(
  uid: string | null,
  getSessionUid: () => string | null,
  loadBinding: () => Promise<AccountBinding>,
) {
  if (uid) id(uid);
  const empty = (): AccountSnapshot => ({ uid, source: binding?.repository.kind ?? 'demo', profile: null, addresses: [], selectedAddressId: null, selectionNotice: null, loading: false, busy: false, error: null });
  let binding: AccountBinding | undefined;
  let state: AccountSnapshot = { ...empty(), loading: !!uid };
  let active = false, version = 0;
  // undefined permits default restoration only for a fresh session. Errors
  // clear visible data, but must not discard the customer's selection intent.
  let selectionIntent: string | null | undefined;
  let selectionNotice: string | null = null;
  const listeners = new Set<() => void>();
  function publish(next: AccountSnapshot) { state = next; for (const listener of listeners) listener(); }
  function current(ticket: number) { return active && version === ticket && getSessionUid() === uid; }
  function identity() {
    if (!active || !uid || getSessionUid() !== uid || (binding && binding.getUid() !== uid)) throw new Error('Customer session changed. Sign in again.');
  }
  function ready() {
    identity();
    if (!accountReady(state)) throw new Error('Wait for your profile and addresses to load, or retry.');
  }
  async function read(preferred: string | null | undefined) {
    identity();
    if (!binding) binding = await loadBinding();
    identity();
    if (!['demo', 'emulator'].includes(binding.repository.kind)) throw new Error('Unsupported customer repository.');
    const [profile, addresses] = await Promise.all([binding.repository.profile.get(), binding.repository.addresses.list()]);
    identity();
    if (profile) {
      if (profile.id !== uid) throw new Error('Profile identity mismatch.');
      validateProfileDocument(profile.data);
    }
    const seen = new Set<string>();
    for (const address of addresses) {
      id(address.id); validateAddressDocument(address.data);
      if (seen.has(address.id)) throw new Error('Duplicate address ID.');
      seen.add(address.id);
    }
    const candidate = preferred === undefined ? profile?.data.defaultAddressId ?? null : preferred;
    const selectedAddressId = addresses.some(address => address.id === candidate) ? candidate ?? null : null;
    return { profile, addresses, selectedAddressId, selectionNotice: selectedAddressId ? null : candidate
      ? 'Your selected address is no longer available. Select a saved address for delivery.' : selectionNotice };
  }
  function rememberSelection(data: Pick<AccountSnapshot, 'selectedAddressId' | 'selectionNotice'>) {
    selectionIntent = data.selectedAddressId;
    selectionNotice = data.selectionNotice;
  }
  async function retry() {
    if (!active || getSessionUid() !== uid || state.busy) return;
    const ticket = ++version, preferred = selectionIntent;
    publish({ ...empty(), loading: !!uid });
    if (!uid) return;
    try {
      const data = await read(preferred);
      if (current(ticket)) { rememberSelection(data); publish({ ...empty(), ...data }); }
    } catch {
      if (current(ticket)) publish({ ...empty(), error: 'Profile and addresses could not be loaded. Retry loading.' });
    }
  }
  async function mutate(run: (repository: AccountRepository) => Promise<void>, preferred = selectionIntent) {
    ready();
    const ticket = ++version;
    publish({ ...state, busy: true });
    try {
      identity();
      await run(binding!.repository);
      identity();
      const data = await read(preferred);
      if (!current(ticket)) throw new Error('Customer session changed.');
      rememberSelection(data);
      publish({ ...empty(), ...data });
    } catch {
      if (current(ticket)) publish({ ...empty(), error: 'Change failed or could not be refreshed. It may have saved; retry loading before trying again.' });
      throw new Error('Change failed or the customer session changed. Retry loading.');
    }
  }
  return {
    getSnapshot: () => state,
    subscribe: (listener: () => void) => { listeners.add(listener); return () => { listeners.delete(listener); }; },
    start() { active = true; void retry(); },
    dispose() { active = false; version++; selectionIntent = undefined; selectionNotice = null; state = empty(); listeners.clear(); },
    retry,
    selectAddress(addressId: string) {
      ready(); id(addressId);
      if (!state.addresses.some(address => address.id === addressId)) throw new Error('Select one of your saved addresses.');
      rememberSelection({ selectedAddressId: addressId, selectionNotice: null });
      publish({ ...state, selectedAddressId: addressId, selectionNotice: null });
    },
    async saveProfile(displayName: string) {
      ready();
      const input = validateProfile({ displayName: displayName.trim(), defaultAddressId: state.profile?.data.defaultAddressId ?? null });
      await mutate(repository => repository.profile.save(input));
    },
    async setDefaultAddress(addressId: string) {
      ready(); id(addressId);
      if (!state.profile) throw new Error('Save your profile before choosing a default address.');
      if (!state.addresses.some(address => address.id === addressId)) throw new Error('Select one of your saved addresses.');
      const input = validateProfile({ displayName: state.profile.data.displayName, defaultAddressId: addressId });
      await mutate(repository => repository.profile.save(input), addressId);
    },
    async saveAddress(addressId: string, input: AddressInput, mustExist = false) {
      ready(); id(addressId); const validated = validateAddress(input);
      const exists = state.addresses.some(address => address.id === addressId);
      if (mustExist && !exists) throw new Error('This address is no longer available. Close the edit form and select a saved address.');
      const preferred = exists ? selectionIntent : addressId;
      await mutate(repository => repository.addresses.save(addressId, validated), preferred);
    },
    async removeAddress(addressId: string) {
      ready(); id(addressId);
      if (!state.addresses.some(address => address.id === addressId)) throw new Error('Address is not in your saved addresses.');
      await mutate(repository => repository.addresses.remove(addressId));
    },
  };
}
