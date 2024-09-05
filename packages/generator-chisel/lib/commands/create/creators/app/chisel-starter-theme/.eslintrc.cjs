/** @type {import('eslint').Linter.Config} */
module.exports = {
  root: true,

  env: {
    browser: true,
    es2021: true,
  },

  extends: ['eslint:recommended', '@xfive/eslint-config-prettier', 'plugin:react/recommended'],

  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },

  rules: {
    'react/react-in-jsx-scope': 'off',
    'react/display-name': 'off',
    'react/prop-types': 'off',
  },

  overrides: [
    {
      files: ['.eslintrc.cjs', 'webpack.config.js'],
      env: {
        node: true,
      },
      parserOptions: {
        sourceType: 'script',
      },
    },
  ],

  ignorePatterns: ['.eslintrc.cjs', 'webpack.config.js', '**/node_modules/**', '**/dist/**', '**/build/**', '**/vendor/**'],
};
