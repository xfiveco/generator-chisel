import { fileURLToPath } from 'node:url';
import { includeIgnoreFile } from '@eslint/compat';
import js from '@eslint/js';
import globals from 'globals';
import react from 'eslint-plugin-react';
import prettierRecommended from 'eslint-plugin-prettier/recommended';

export default [
  includeIgnoreFile(fileURLToPath(new URL('.gitignore', import.meta.url))),
  { ignores: ['**/dist/', '**/build/', '**/vendor/', '.claude/'] },
  { files: ['**/*.jsx'] },

  js.configs.recommended,
  react.configs.flat.recommended,
  prettierRecommended,

  {
    languageOptions: {
      globals: globals.browser,
    },
    settings: {
      // 'detect' crashes eslint-plugin-react 7.37 on ESLint 10.
      react: { version: '19' },
    },
    rules: {
      'react/react-in-jsx-scope': 'off',
      'react/display-name': 'off',
      'react/prop-types': 'off',
    },
  },

  {
    files: ['webpack.config.js'],
    languageOptions: {
      sourceType: 'commonjs',
      globals: globals.node,
    },
  },
];
