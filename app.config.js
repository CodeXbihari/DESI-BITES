const fs = require('fs');

module.exports = ({ config }) => {
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
    ],
  };
};
