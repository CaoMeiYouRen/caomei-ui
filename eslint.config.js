import { defineConfig } from 'eslint/config'
import cmyr from 'eslint-config-cmyr/vue'

export default defineConfig([
    {
        ignores: [
            'docs/.vitepress/dist/**',
            'docs/.vitepress/cache/**',
            'docs/.vitepress/data/**',
            '**/dist/**',
            'coverage/**',
            'playwright-report/**',
            'test-results/**',
        ],
    },
    cmyr,
    {
        files: ['**/*.{vue,ts,js}'],
        rules: {
        },
    },
])
