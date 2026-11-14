import type { EmulatorTarget } from '../config/firebaseTarget';
import type { Repositories } from './repositories';
import type { StorePort } from './firestore/adapterTypes';
import { requireEmulatorTarget } from '../config/firebaseTarget.ts';
import { createDemoRepositories } from './demoRepositories.ts';
import { buildRepositories } from './firestore/repositories.ts';

export interface RepositoryOptions {
  authMode: 'mock' | 'firebase';
  platform: 'web' | 'android';
  target?: EmulatorTarget;
  demoUid?: string;
}
// The platform app bootstrap supplies a loader bound to its existing Firebase
// app. There is deliberately no automatic app initialization or production URL.
export async function createRepositories(
  options: RepositoryOptions,
  loadAdapter?: (target: EmulatorTarget) => Promise<StorePort>,
): Promise<Repositories> {
  if (options.authMode === 'mock') return createDemoRepositories(options.demoUid);
  if (options.authMode !== 'firebase' || !['web', 'android'].includes(options.platform)) throw new Error('Unsupported repository mode.');
  const target = requireEmulatorTarget(options.target, options.platform);
  if (!loadAdapter) throw new Error('An explicitly configured Emulator adapter is required.');
  return buildRepositories(await loadAdapter(target));
}
