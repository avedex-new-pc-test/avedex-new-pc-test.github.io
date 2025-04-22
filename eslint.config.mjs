// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt({
  // Your custom configs here
  files: ['src/**/*.{ts,js,vue}'],
  rules: {
    quotes: ['warn', 'single'],
    semi: ['error', 'never'],
    '@typescript-eslint/no-explicit-any': 'off'
  }
})
