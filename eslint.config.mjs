import globals from 'globals'
import pluginJs from '@eslint/js'
import eslintConfigPrettier from 'eslint-config-prettier'

export default [
  { files: ['**/*.js'], languageOptions: { sourceType: 'commonjs' } },
  {
    languageOptions: { globals: {...globals.browser, ...globals.node, strapi: true} },
    rules: {
      indent: ['error', 2, { SwitchCase: 1 }],
      'linebreak-style': ['error', 'unix'],
      'no-console': 0,
      quotes: ['error', 'single'],
      semi: ['error', 'always'],
    },
    ignores: ['.cache', 'build', 'node_modules'],
  },
  eslintConfigPrettier,
  pluginJs.configs.recommended,
]
