export interface EmulatorTarget {
  mode: 'emulator';
  development: true;
  projectId: string;
  host: '127.0.0.1' | 'localhost' | '10.0.2.2';
  authPort: number;
  firestorePort: number;
}

// No defaults, environment discovery, cloud fallback, or permissive host URLs.
export function requireEmulatorTarget(value: unknown, platform: 'web' | 'android'): EmulatorTarget {
  if (typeof __DEV__ !== 'undefined' && !__DEV__) throw new Error('Emulator repositories are disabled in release builds.');
  if (!value || typeof value !== 'object') throw new Error('Explicit Emulator configuration is required.');
  const t = value as Record<string, unknown>;
  const hosts = platform === 'android' ? ['10.0.2.2', '127.0.0.1', 'localhost'] : ['127.0.0.1', 'localhost'];
  const port = (v: unknown) => typeof v === 'number' && Number.isInteger(v) && v >= 1024 && v <= 65535;
  if (t.mode !== 'emulator' || t.development !== true
    || typeof t.projectId !== 'string'
    || !/^(demo-[a-z0-9-]+|desi-bytes-dbc89)$/.test(t.projectId)
    || typeof t.host !== 'string' || !hosts.includes(t.host) || !port(t.authPort) || !port(t.firestorePort)
    || t.authPort === t.firestorePort) throw new Error('Invalid or unsafe Emulator configuration.');
  return Object.freeze({
    mode: 'emulator', development: true, projectId: t.projectId,
    host: t.host as EmulatorTarget['host'], authPort: t.authPort as number,
    firestorePort: t.firestorePort as number,
  });
}

export function assertMatchingProject(actual: string | undefined, target: EmulatorTarget): void {
  if (actual !== target.projectId) throw new Error('Firebase app and Emulator project IDs must match.');
}
