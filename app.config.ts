import type { ExpoConfig } from 'expo/config';

// The Google Sign-In iOS config plugin needs the *reversed* iOS OAuth client ID as a
// URL scheme. Derive it from the env var so the client ID stays the single source of
// truth (kept in .env.local, never committed) rather than being duplicated here.
//   1234-abc.apps.googleusercontent.com  ->  com.googleusercontent.apps.1234-abc
const iosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;
const googleIosUrlScheme = iosClientId
  ? `com.googleusercontent.apps.${iosClientId.replace(/\.apps\.googleusercontent\.com$/, '')}`
  : undefined;

const plugins: NonNullable<ExpoConfig['plugins']> = [
  'expo-router',
  [
    'expo-splash-screen',
    {
      backgroundColor: '#208AEF',
      android: {
        image: './assets/images/splash-icon.png',
        imageWidth: 76,
      },
    },
  ],
  'expo-secure-store',
  'expo-web-browser',
  [
    'expo-notifications',
    {
      icon: './assets/images/icon.png',
      color: '#4f46e5',
    },
  ],
  // Build Google Sign-In's transitive pods (AppCheckCore, GoogleUtilities,
  // RecaptchaInterop) as static *frameworks* so they generate module maps —
  // without this, `pod install` fails: "Swift pods cannot be integrated as
  // static libraries ... do not define modules".
  [
    'expo-build-properties',
    {
      ios: { useFrameworks: 'static' },
    },
  ],
];

// Only register the Google Sign-In plugin once the iOS client ID is configured — the
// plugin requires iosUrlScheme at prebuild time and would otherwise fail the iOS build.
// Mirrors the runtime "button hidden until configured" behaviour in src/lib/auth/google.ts.
if (googleIosUrlScheme) {
  plugins.push(['@react-native-google-signin/google-signin', { iosUrlScheme: googleIosUrlScheme }]);
}

const config: ExpoConfig = {
  name: 'irb-forge-mobile',
  slug: 'irb-forge-mobile',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/images/icon.png',
  scheme: 'com.irbforge.mobile',
  userInterfaceStyle: 'automatic',
  ios: {
    icon: './assets/images/icon.png',
    bundleIdentifier: 'com.irbforge.mobile',
  },
  android: {
    package: 'com.irbforge.mobile',
    adaptiveIcon: {
      backgroundColor: '#4f46e5',
      foregroundImage: './assets/images/android-icon-foreground.png',
    },
    predictiveBackGestureEnabled: false,
  },
  web: {
    output: 'static',
    favicon: './assets/images/favicon.png',
  },
  plugins,
  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },
  extra: {
    router: {},
    eas: {
      projectId: '368b2c30-cf2c-422a-b0f4-7bad37880753',
    },
  },
  owner: 'rb-isiaq',
};

export default config;
