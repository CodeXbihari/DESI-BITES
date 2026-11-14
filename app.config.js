const fs = require('fs');

module.exports = ({ config }) => {
  const target = process.env.DESII_BUILD_TARGET;
  if (target && target !== 'stage1') throw new Error('Unknown DESII_BUILD_TARGET.');
  const stage1 = target === 'stage1';
  if (stage1 && (process.env.EXPO_PUBLIC_AUTH_MODE === 'mock' || process.env.EXPO_PUBLIC_ADMIN_PREVIEW === '1')) {
    throw new Error('Stage 1 cannot use mock authentication or the admin preview.');
  }
  const androidConfig = process.env.GOOGLE_SERVICES_JSON || './google-services.json';
  const iosConfig = process.env.GOOGLE_SERVICE_INFO_PLIST || './GoogleService-Info.plist';
  const hasAndroid = fs.existsSync(androidConfig);
  const hasIos = fs.existsSync(iosConfig);
  return {
    ...config,
    ios: {
      ...config.ios,
      ...(hasIos ? {
        googleServicesFile: iosConfig,
        infoPlist: {
          ...config.ios?.infoPlist,
          UIBackgroundModes: [...new Set([...(config.ios?.infoPlist?.UIBackgroundModes || []), 'fetch', 'remote-notification'])],
        },
      } : {}),
    },
    // Native Stage 1 identity is supplied by its build type, not Metro metadata.
    android: { ...config.android, ...(hasAndroid ? { googleServicesFile: androidConfig } : {}) },
    plugins: [
      ...(config.plugins || []),
      ...((hasAndroid || hasIos) ? [
        '@react-native-firebase/app',
        '@react-native-firebase/auth',
      ] : []),
      ['expo-build-properties', {
        android: { kotlinVersion: '2.4.20' },
        ios: { useFrameworks: 'dynamic' },
      }],
      './plugins/withStage1Android.cjs',
    ],
  };
};
