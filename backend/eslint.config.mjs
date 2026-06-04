import eslint from '@eslint/js';
import tslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';
import prettier from 'eslint-config-prettier';

export default [
  eslint.configs.recommended,
  {
    files: ['src/**/*.ts', 'tests/**/*.ts'],
    languageOptions: {
      parser: tsparser,
      globals: {
        process: 'readonly',
        console: 'readonly',
        node: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': tslint,
    },
    rules: {
      ...tslint.configs.recommended.rules,
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'no-undef': 'off',
    },
  },
  prettier,
];
