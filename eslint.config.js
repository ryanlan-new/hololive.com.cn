import js from '@eslint/js'
import globals from 'globals'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['src/**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    rules: {
      'no-unused-vars': ['error', { varsIgnorePattern: '^(?:[A-Z_]|motion)$' }],
      'no-console': 'error',
      'no-restricted-globals': [
        'error',
        {
          name: 'alert',
          message: 'Use useUIFeedback().notify() instead of native alert().',
        },
        {
          name: 'confirm',
          message: 'Use useUIFeedback().confirm() instead of native confirm().',
        },
      ],
      'no-restricted-properties': [
        'error',
        {
          object: 'window',
          property: 'alert',
          message: 'Use useUIFeedback().notify() instead of window.alert().',
        },
        {
          object: 'window',
          property: 'confirm',
          message: 'Use useUIFeedback().confirm() instead of window.confirm().',
        },
      ],
    },
  },
  {
    files: ['backend/scripts/**/*.js'],
    extends: [js.configs.recommended],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.node,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    rules: {
      'no-console': 'error',
      'no-unused-vars': [
        'error',
        {
          varsIgnorePattern: '^[A-Z_]',
          argsIgnorePattern: '^_',
          caughtErrors: 'none',
        },
      ],
    },
  },
  {
    files: ['backend/scripts/logger.js'],
    rules: {
      'no-console': 'off',
    },
  },
  {
    files: ['src/lib/appLogger.js'],
    rules: {
      'no-console': 'off',
    },
  },
  {
    files: ['src/pages/admin/**/*.jsx'],
    rules: {
      'no-console': 'error',
    },
  },
  {
    files: ['src/components/admin/**/*.jsx'],
    rules: {
      'no-console': 'error',
    },
  },
  {
    files: ['src/hooks/**/*.js'],
    rules: {
      'no-console': 'error',
    },
  },
  {
    files: ['src/router.jsx'],
    rules: {
      'react-refresh/only-export-components': 'off',
    },
  },
  {
    files: ['backend/pb_migrations/**/*.js'],
    extends: [js.configs.recommended],
    languageOptions: {
      ecmaVersion: 2020,
      globals: {
        ...globals.node,
        migrate: 'readonly',
        Collection: 'readonly',
        Record: 'readonly',
        Field: 'readonly',
      },
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    rules: {
      'no-console': 'error',
      'no-undef': 'off',
      'no-unused-vars': 'off',
      'no-empty': 'off',
    },
  },
])
