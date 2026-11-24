import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-config-prettier';

export default tseslint.config(
  { ignores: ['dist', 'dev-dist', 'node_modules', 'scripts'] },
  {
    files: ['**/*.{ts,tsx}'],
    extends: [js.configs.recommended, ...tseslint.configs.recommended, prettier],
    languageOptions: { globals: { ...globals.browser } },
    plugins: { 'react-hooks': reactHooks },
    rules: {
      ...reactHooks.configs.recommended.rules,
      '@typescript-eslint/consistent-type-imports': 'error',
      // Regra de dependência da arquitetura: o domínio não conhece frameworks.
      'no-restricted-imports': ['error', { patterns: [{ group: ['react', 'react-dom', 'zod'], message: 'Use apenas nas camadas presentation/infrastructure.' }] }],
    },
  },
  {
    files: ['src/presentation/**', 'src/infrastructure/**', 'src/main.tsx', 'src/**/*.test.{ts,tsx}', 'src/test/**'],
    rules: { 'no-restricted-imports': 'off' },
  },
  {
    // Code smells: funções e arquivos que crescem demais, complexas ou com muitos parâmetros viram erro.
    files: ['src/**/*.{ts,tsx}'],
    ignores: ['src/**/*.test.{ts,tsx}', 'src/test/**'],
    rules: {
      complexity: ['error', 10],
      'max-lines-per-function': ['error', { max: 80, skipBlankLines: true, skipComments: true }],
      'max-lines': ['error', { max: 200, skipBlankLines: true, skipComments: true }],
      'max-params': ['error', 4],
      'max-depth': ['error', 3],
    },
  },
);
