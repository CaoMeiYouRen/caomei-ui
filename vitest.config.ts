import path from 'node:path'
import { fileURLToPath } from 'node:url'
import vue from '@vitejs/plugin-vue'
import { configDefaults, defineConfig } from 'vitest/config'

const dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
    plugins: [vue()],
    test: {
        environment: 'happy-dom',
        passWithNoTests: true,
        /**
         * `.temp/` 是临时夹具与一次性探针的落点（已 gitignore，ESLint 亦忽略）；不排除会让遗留的
         * `*.test.mjs` 探针混进全量单测，使 `pnpm test` / `pnpm verify` 因无关文件静默失败。
         */
        exclude: [...configDefaults.exclude, '.temp/**'],
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
