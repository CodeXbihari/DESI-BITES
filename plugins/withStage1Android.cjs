const fs = require('node:fs');
const path = require('node:path');
const { withAppBuildGradle, withMainApplication, withMainActivity, withDangerousMod } = require('@expo/config-plugins');

const begin = '// DESII_STAGE1_BEGIN';
const end = '// DESII_STAGE1_END';
const gradle = `
${begin}
// Dedicated build type: never alter the existing debug/release identities.
android {
  buildTypes {
    stage1 {
      initWith debug
      applicationIdSuffix '.stage1'
      matchingFallbacks = ['debug']
      debuggable true
      resValue 'string', 'app_name', 'Desii Bites — Emulator'
    }
  }
}
react { debuggableVariants.add('stage1') }
dependencies {
  stage1Implementation platform('com.google.firebase:firebase-bom:35.0.2')
  stage1Implementation 'com.google.firebase:firebase-auth'
  stage1Implementation 'com.google.firebase:firebase-firestore'
}
def stage1Config = file('src/stage1/google-services.json')
def validateStage1Config = {
  if (!stage1Config.isFile()) throw new GradleException('Missing synthetic Stage 1 Firebase configuration.')
  def data = new groovy.json.JsonSlurper().parse(stage1Config)
  def client = data.client instanceof List && data.client.size() == 1 ? data.client[0] : null
  def keys = { value, fields -> value instanceof Map && value.keySet() == fields.toSet() }
  if (!keys(data, ['project_info', 'client', 'configuration_version']) ||
      !keys(data.project_info, ['project_number', 'project_id']) ||
      !keys(client, ['client_info', 'api_key']) ||
      !keys(client?.client_info, ['mobilesdk_app_id', 'android_client_info']) ||
      !keys(client?.client_info?.android_client_info, ['package_name']) ||
      data.configuration_version != '1' ||
      data.project_info?.project_id != 'demo-desiibites-stage1' ||
      data.project_info?.project_number != '123456789012' ||
      client?.client_info?.android_client_info?.package_name != 'com.desi.app.stage1' ||
      client?.client_info?.mobilesdk_app_id != '1:123456789012:android:0000000000000000000000' ||
      !(client?.api_key instanceof List) || client.api_key.size() != 1 ||
      !keys(client.api_key[0], ['current_key']) ||
      client.api_key[0]?.current_key != 'AIzaSy000000000000000000000000000000000' ||
      !(client.api_key[0].current_key ==~ /AIza[A-Za-z0-9_-]{35}/)) {
    throw new GradleException('Invalid synthetic Stage 1 Firebase configuration.')
  }
}
// Reject missing synthetic input before the Google Services plugin can fall back.
if (gradle.startParameter.taskNames.any { it.toLowerCase().contains('stage1') }) {
  validateStage1Config()
  if (!plugins.hasPlugin('com.google.gms.google-services')) {
    throw new GradleException('Stage 1 requires the existing Google Services plugin; no manual resource fallback.')
  }
}
tasks.matching { it.name == 'processStage1GoogleServices' }.configureEach {
  doFirst {
    validateStage1Config()
    def selected = googleServicesJsonFiles.get().find { it.isFile() }
    if (selected == null || selected.canonicalFile != stage1Config.canonicalFile) {
      throw new GradleException('Stage 1 must use its own synthetic Google Services file.')
    }
  }
}
${end}
`;

function addGradle(source) {
  const owned = gradle.trim();
  if (source.includes(begin) || source.includes(end)) {
    if (source.split(begin).length !== 2 || source.split(end).length !== 2 || !source.includes(owned)) {
      throw new Error('Unexpected existing Stage 1 Gradle block; refusing to overwrite.');
    }
    if (/\bstage1\b|DESII_STAGE1/i.test(source.replace(owned, ''))) throw new Error('Conflicting Stage 1 Gradle configuration.');
    return source;
  }
  if (/\bstage1\b|DESII_STAGE1/i.test(source)) throw new Error('Conflicting Stage 1 Gradle configuration.');
  return source + '\n' + gradle;
}
function replaceOnce(source, needle, replacement, marker) {
  if (source.includes(marker)) {
    if (source.split(marker).length !== 2 || source.split(replacement).length !== 2) {
      throw new Error(`Corrupted or duplicate ${marker} block.`);
    }
    return source;
  }
  if (source.split(needle).length !== 2) throw new Error(`Cannot safely locate ${marker} insertion point.`);
  return source.replace(needle, replacement);
}
function addApplication(source) {
  const bootstrap = `super.onCreate()
    // DESII_STAGE1_BOOTSTRAP: before loadReactNative; reflection keeps debug/release free of stage1 classes.
    if (BuildConfig.BUILD_TYPE == "stage1") {
      Class.forName("com.desi.app.stage1.Stage1FirebaseBootstrap")
        .getMethod("initialize", android.app.Application::class.java).invoke(null, this)
    }`;
  const registration = `PackageList(this).packages.apply {
          // DESII_STAGE1_PACKAGE
          if (BuildConfig.BUILD_TYPE == "stage1") {
            add(Class.forName("com.desi.app.stage1.Stage1RuntimePackage").getDeclaredConstructor().newInstance() as com.facebook.react.ReactPackage)
          }`;
  const remainder = source.replace(bootstrap, '').replace(registration, '');
  if (/Stage1FirebaseBootstrap|Stage1RuntimePackage|DESII_STAGE1/.test(remainder)) throw new Error('Conflicting or corrupted Stage 1 application hooks.');
  let result = replaceOnce(source, 'super.onCreate()', bootstrap, 'DESII_STAGE1_BOOTSTRAP');
  return replaceOnce(result, 'PackageList(this).packages.apply {', registration, 'DESII_STAGE1_PACKAGE');
}
function addActivity(source) {
  const root = `// DESII_STAGE1_ROOT: missing JS/native readiness can never mount the customer root.
  override fun getMainComponentName(): String = if (BuildConfig.BUILD_TYPE == "stage1") "DesiiBitesStage1" else "main"`;
  if (/DesiiBitesStage1|DESII_STAGE1/.test(source.replace(root, ''))) throw new Error('Conflicting or corrupted Stage 1 activity root.');
  return replaceOnce(source, 'override fun getMainComponentName(): String = "main"', root, 'DESII_STAGE1_ROOT');
}
function validateSynthetic(data) {
  const client = Array.isArray(data?.client) && data.client.length === 1 ? data.client[0] : null;
  const keys = (value, fields) => value && typeof value === 'object' && !Array.isArray(value)
    && Object.keys(value).length === fields.length && fields.every(k => Object.hasOwn(value, k));
  if (!keys(data, ['project_info', 'client', 'configuration_version'])
    || !keys(data.project_info, ['project_number', 'project_id'])
    || !keys(client, ['client_info', 'api_key'])
    || !keys(client?.client_info, ['mobilesdk_app_id', 'android_client_info'])
    || !keys(client?.client_info?.android_client_info, ['package_name'])
    || data?.configuration_version !== '1'
    || data?.project_info?.project_id !== 'demo-desiibites-stage1'
    || data?.project_info?.project_number !== '123456789012'
    || client?.client_info?.android_client_info?.package_name !== 'com.desi.app.stage1'
    || client?.client_info?.mobilesdk_app_id !== '1:123456789012:android:0000000000000000000000'
    || !Array.isArray(client?.api_key) || client.api_key.length !== 1
    || !keys(client.api_key[0], ['current_key'])
    || client.api_key[0]?.current_key !== 'AIzaSy000000000000000000000000000000000'
    || !/^AIza[A-Za-z0-9_-]{35}$/.test(client.api_key[0].current_key)) {
    throw new Error('Invalid synthetic Stage 1 Firebase configuration.');
  }
}
module.exports = function withStage1Android(config) {
  config = withAppBuildGradle(config, c => { c.modResults.contents = addGradle(c.modResults.contents); return c; });
  config = withMainApplication(config, c => {
    if (c.modResults.language !== 'kt') throw new Error('Stage 1 requires Kotlin MainApplication.');
    c.modResults.contents = addApplication(c.modResults.contents); return c;
  });
  config = withMainActivity(config, c => {
    if (c.modResults.language !== 'kt') throw new Error('Stage 1 requires Kotlin MainActivity.');
    c.modResults.contents = addActivity(c.modResults.contents); return c;
  });
  return withDangerousMod(config, ['android', async c => {
    const source = path.join(c.modRequest.projectRoot, 'config/firebase/stage1.google-services.json');
    validateSynthetic(JSON.parse(fs.readFileSync(source, 'utf8')));
    const target = path.join(c.modRequest.platformProjectRoot, 'app/src/stage1');
    const outputs = [[path.join(target, 'google-services.json'), fs.readFileSync(source, 'utf8')],
      [path.join(target, 'AndroidManifest.xml'), fs.readFileSync(path.join(__dirname, 'stage1/AndroidManifest.xml'), 'utf8')]];
    for (const name of ['Stage1FirebaseBootstrap.kt', 'Stage1RuntimePackage.kt']) {
      outputs.push([path.join(target, 'java/com/desi/app/stage1', name), fs.readFileSync(path.join(__dirname, 'stage1', name), 'utf8')]);
    }
    // Check every destination before writing any of them. Never repair unknown
    // generated files by overwriting them or partially applying a template set.
    for (const [file, contents] of outputs) {
      if (fs.existsSync(file) && fs.readFileSync(file, 'utf8') !== contents) {
        throw new Error(`Refusing to overwrite differing Stage 1 generated file: ${path.basename(file)}`);
      }
    }
    for (const [file, contents] of outputs) {
      if (!fs.existsSync(file)) { fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, contents); }
    }
    return c;
  }]);
};
module.exports.transforms = { addGradle, addApplication, addActivity, validateSynthetic };
