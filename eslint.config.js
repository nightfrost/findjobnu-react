import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import unicorn from 'eslint-plugin-unicorn'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  { ignores: ['dist', 'src/findjobnu-api/*', 'src/findjobnu-auth/*'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      'unicorn': unicorn,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      // Allow both camelCase (utils/hooks) and PascalCase (Components/Views)
      'unicorn/filename-case': ['error', { cases: { camelCase: true, pascalCase: true } }],
    },
  },
  // Vite requires this exact filename; ignore the unicorn filename rule here
  {
    files: ['src/vite-env.d.ts'],
    rules: {
      'unicorn/filename-case': 'off',
    },
  },
)
