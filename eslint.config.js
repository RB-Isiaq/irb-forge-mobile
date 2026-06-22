// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const prettier = require('eslint-config-prettier');

module.exports = defineConfig([
  expoConfig,
  // Must be last — disables all ESLint rules that conflict with Prettier
  prettier,
  {
    ignores: ['dist/*', '.expo/*'],
  },
]);
