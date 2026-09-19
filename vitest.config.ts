import path from 'node:path'
import { fileURLToPath } from 'node:url'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vitest/config'

const dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
    plugins: [vue()],
    test: {
        environment: 'happy-dom',
        passWithNoTests: true,
        coverage: {
            provider: 'v8',
            reporter: ['text', 'html', 'json-summary', 'lcov'],
            include: ['src/**'],
        },
    },
    resolve: {
        alias: {
            '@': path.resolve(dirname, 'src'),
        },
    },
    root: path.resolve('./'),
})
