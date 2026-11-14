import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// No auto-install/download of a Java runtime. Stop before launching the CLI.
const java = spawnSync('java', ['-version'], { encoding: 'utf8' });
const major = Number((java.stderr + java.stdout).match(/version "(\d+)/)?.[1]);
if (java.status !== 0 || major < 21 || !Number.isFinite(major)) {
  console.error('BLOCKED: Emulator tests require Java 21 or newer. No runtime will be downloaded.');
  process.exit(1);
}
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const result = spawnSync(process.execPath, [
  path.join(root, 'node_modules/firebase-tools/lib/bin/firebase.js'),
  'emulators:exec', '--config', 'firebase.emulators.json',
  '--project', 'demo-desiibites-stage1', '--only', 'auth,firestore',
  'node --experimental-strip-types --test --test-concurrency=1 tests/emulator/*.test.mjs',
], {
  cwd: root, stdio: 'inherit',
  env: { ...process.env, CI: 'true', FIREBASE_CLI_DISABLE_TELEMETRY: '1' },
});
process.exit(result.status ?? 1);
