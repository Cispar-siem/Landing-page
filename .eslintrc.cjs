module.exports = {
  root: true,
  env: { browser: true, es2022: true, node: true },
  globals: { React: 'readonly' },
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'react', 'react-hooks'],
  extends: ['eslint:recommended', 'plugin:react-hooks/recommended'],
  settings: { react: { version: 'detect' } },
  ignorePatterns: ['dist', 'node_modules'],
  rules: { 'react/react-in-jsx-scope': 'off', 'no-unused-vars': 'off' },
};
