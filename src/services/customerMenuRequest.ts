import type { SearchMenuItem } from '../data/searchMenuData';
import type { CustomerMenuRepository } from './customerMenu';

export interface CustomerMenuSnapshot {
  items: SearchMenuItem[];
  loading: boolean;
  error: string | null;
  source: CustomerMenuRepository['kind'];
}

// The provider's effect owns this request and returns its cleanup function.
// Requests are not aborted at the repository layer, but cleaned-up requests
// cannot publish either a success or failure into the current consumer state.
export function startCustomerMenuRequest(
  load: () => Promise<Pick<CustomerMenuSnapshot, 'items' | 'source'>>,
  source: CustomerMenuSnapshot['source'],
  publish: (state: CustomerMenuSnapshot) => void,
): () => void {
  let active = true;
  publish({ items: [], loading: true, error: null, source });
  void Promise.resolve().then(load).then(result => {
    if (active) publish({ ...result, loading: false, error: null });
  }).catch(() => {
    if (active) publish({ items: [], loading: false, error: 'Menu could not be loaded. Please retry.', source });
  });
  return () => { active = false; };
}
