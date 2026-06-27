import js from '@eslint/js'
import globals from 'globals'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'

export default [
  { ignores: ['dist'] },
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    plugins: {
      react,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      // Mark identifiers used only as JSX (incl. `<motion.div>` member usage) as used.
      'react/jsx-uses-vars': 'error',
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
    },
  },
  // Node-context config + tooling files
  {
    files: ['*.config.js', '*.config.mjs', 'playwright.config.js'],
    languageOptions: { globals: globals.node },
  },
  // Playwright tests run in Node with test globals
  {
    files: ['tests/**/*.{js,jsx}', '**/*.spec.js', '**/*.test.js'],
    languageOptions: { globals: { ...globals.node } },
  },
]
