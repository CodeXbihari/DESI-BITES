import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readdirSync, existsSync } from 'node:fs';
import { homedir } from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const require = createRequire(import.meta.url);
const list = p => existsSync(p) ? readdirSync(p, { withFileTypes: true }) : [];

test('installed Google Services Property API executes the real guard; original .files access fails', t => {
  const cache = process.env.GRADLE_USER_HOME || path.join(homedir(), '.gradle');
  const wrapper = path.join(cache, 'wrapper/dists/gradle-9.4.1-bin');
  const lib = list(wrapper).filter(x => x.isDirectory()).map(x => path.join(wrapper, x.name, 'gradle-9.4.1/lib')).find(existsSync);
  const plugins = path.join(cache, 'caches/modules-2/files-2.1/com.google.gms/google-services/4.4.4');
  const jar = list(plugins).filter(x => x.isDirectory()).flatMap(x => list(path.join(plugins, x.name))
    .filter(f => f.name.endsWith('.jar')).map(f => path.join(plugins, x.name, f.name)))[0];
  if (!lib || !jar) { t.skip('Requires the already-cached Gradle 9.4.1/Groovy and Google Services 4.4.4 JARs. No download.'); return; }
  const { transforms } = require('../../plugins/withStage1Android.cjs');
  const generated = transforms.addGradle('');
  const validator = generated.slice(generated.indexOf('def stage1Config ='), generated.indexOf('// Reject missing synthetic input'));
  const guard = generated.match(/doFirst \{\n([\s\S]*?)\n  \}\n\}/)?.[1];
  assert.ok(guard, 'Must extract the actual task guard, not a reconstructed expression.');
  const script = `
import org.gradle.api.provider.Property
import java.lang.reflect.Proxy
import com.google.gms.googleservices.GoogleServicesTask
def type = GoogleServicesTask.getMethod('getGoogleServicesJsonFiles').genericReturnType
assert type.rawType == Property
assert type.actualTypeArguments[0].typeName == 'java.util.Collection<java.io.File>'
def expected = new File(${JSON.stringify(path.resolve('config/firebase/stage1.google-services.json'))})
def execute = { String body, List<File> files ->
  def property = Proxy.newProxyInstance(Property.classLoader, [Property] as Class[], { proxy, method, args ->
    if (method.name == 'get') return files
    throw new UnsupportedOperationException(method.name)
  } as java.lang.reflect.InvocationHandler)
  new GroovyShell(new Binding([file: { ignored -> expected }, googleServicesJsonFiles: property]))
    .evaluate('import org.gradle.api.GradleException\\n' + ${JSON.stringify(validator)} + '\\n' + body)
}
def body = ${JSON.stringify(guard)}
execute(body, [new File(expected.parent, 'absent-google-services.json'), expected])
try {
  execute(body.replace('googleServicesJsonFiles.get()', 'googleServicesJsonFiles.files'), [expected])
  throw new AssertionError('Original bug unexpectedly accepted')
} catch (groovy.lang.MissingPropertyException requiredFailure) { }
try {
  execute(body, [new File(${JSON.stringify(path.resolve('package.json'))}), expected])
  throw new AssertionError('Non-Stage-1 fallback unexpectedly accepted')
} catch (org.gradle.api.GradleException denied) {
  assert denied.message.contains('must use its own synthetic')
}
println 'Google Services 4.4.4 API, corrected guard, original-bug rejection and canonical fallback rejection: PASS'
`;
  // Run Groovy as a plain language interpreter, NOT Gradle/GradleRunner/tasks.
  const java = process.env.JAVA_HOME ? path.join(process.env.JAVA_HOME, 'bin/java') : 'java';
  const output = execFileSync(java, ['-cp', `${lib}/*${path.delimiter}${jar}`, 'groovy.ui.GroovyMain', '-e', script], { encoding: 'utf8', timeout: 30000 });
  assert.match(output, /canonical fallback rejection: PASS/);
});
