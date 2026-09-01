// @ts-check
import js from '@eslint/js';
import tseslint from 'typescript-eslint';

/** Reglas base compartidas por apps/api y apps/web. Cada app agrega su propio plugin de framework. */
export const baseConfig = tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_', destructuredArrayIgnorePattern: '^_' },
      ],
    },
  },
  {
    ignores: ['dist/**', '.next/**', 'node_modules/**', 'coverage/**'],
  },
);
