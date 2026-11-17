import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('../../', import.meta.url));
const java = spawnSync('java', ['-version'], { encoding: 'utf8' });
const major = Number((java.stderr + java.stdout).match(/version "(\d+)/)?.[1]);
if (java.status !== 0 || !Number.isFinite(major) || major < 21) {
  console.error('BLOCKED: quote integration/rules tests require Java >=21. Nothing started; no Java installation.');
  process.exit(1);
}
const build = spawnSync('npm', ['--prefix', 'functions', 'run', 'build'], { cwd: root, stdio: 'inherit' });
if (build.status !== 0) process.exit(build.status ?? 1);
const result = spawnSync(process.execPath, [
  'node_modules/firebase-tools/lib/bin/firebase.js', 'emulators:exec',
  '--config', 'firebase.emulators.json', '--project', 'demo-desiibites-stage1',
  '--only', 'auth,firestore,functions',
  'node --experimental-strip-types --test --test-concurrency=1 tests/emulator/*.test.mjs functions/tests/emulator/*.test.mjs',
], { cwd: root, stdio: 'inherit', env: { ...process.env, CI: 'true', FIREBASE_CLI_DISABLE_TELEMETRY: '1', FUNCTIONS_EMULATOR_HOST: '127.0.0.1:5001' } });
process.exit(result.status ?? 1);
