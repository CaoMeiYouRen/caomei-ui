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
        /**
         * 并行负载 flaky 兜底：默认 worker 数 = CPU 核数，8 核机器满负载时，
         * 「交互后单 tick 断言」类用例会偶发读到更新前状态（根因、逐例修复与实测证据见
         * `docs/design/governance/2026-10-01-phase18-m2-1-flaky-class.md`）。
         * 限定并发上限后全量套件连续多轮复跑零失败；代价是单轮耗时约 1.8 ~ 2 倍
         * （本机实测：4 并发 47 ~ 70s / 8 并发 26 ~ 35s，随负载波动）。
         * 逐例的时序修复（`test/helpers/settle.ts` 的条件轮询）仍为主手段，本项只是兜底。
         */
        maxWorkers: 4,
        /**
         * 交互类用例的上限放宽：并行负载下 Reka 的异步写回可能远超单 tick，
         * 断言改用 `test/helpers/settle.ts` 的轮询（默认 5s），故用例上限须高于该轮询上限。
         */
        testTimeout: 15_000,
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
