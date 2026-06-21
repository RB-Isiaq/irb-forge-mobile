/** @type {import('jest').Config} */
module.exports = {
  preset: 'jest-expo',
  // Expo/RN ships untranspiled ESM in node_modules; let babel-jest transform the
  // RN/Expo/community packages instead of ignoring them.
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|@tanstack/.*))',
  ],
  // @testing-library/react-native v14 auto-extends Jest with its matchers
  // (toBeOnTheScreen, etc.) on first import, so no setupFilesAfterEnv is needed.
  moduleNameMapper: {
    // Web-only CSS imports (e.g. `@/global.css`) aren't parseable by Jest.
    '\\.css$': '<rootDir>/__mocks__/style-mock.js',
    // Mirror the tsconfig `@/*` path alias.
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  collectCoverageFrom: ['src/**/*.{ts,tsx}', '!src/**/*.d.ts'],
};
