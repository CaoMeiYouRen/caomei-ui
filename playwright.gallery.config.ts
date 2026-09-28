import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig, devices } from '@playwright/test'

/**
 * 组件画廊浏览器回归的专用 Playwright 配置（见 docs/design/governance/2026-09-28-m4-test-regression.md）。
 *
 * 画廊是**文档站**页面（`/components/showcase`），不在 E2E 夹具应用里，故与
 * `playwright.config.ts`（夹具应用 + 三档视口）分离：
 * - `webServer` 先 `docs:build` 再 `vitepress preview`，断言的是**构建产物**（与 V 阶段同口径）；
 * - 单 project、单 worker、`reducedMotion: 'reduce'`，列数 / 溢出断言在用例内逐档 `setViewportSize`；
 * - 主配置以 `testIgnore` 排除 `gallery.e2e.ts`，避免夹具 project 误跑。
 *
 * 命令：`pnpm test:e2e:gallery`
 */

const dirname = path.dirname(fileURLToPath(import.meta.url))

const GALLERY_PORT = 4173
const GALLERY_BASE_URL = `http://127.0.0.1:${GALLERY_PORT}`

const IS_ROOT = typeof process.getuid === 'function' && process.getuid() === 0

/** 与主配置同源（测试规范 §7）：容器内需关闭沙箱与 zygote，`--single-process` 会阻止多 context，不采用 */
const CHROMIUM_ARGS = [
    '--disable-dev-shm-usage',
    ...(process.env.CI || IS_ROOT ? ['--no-sandbox'] : []),
    ...(IS_ROOT ? ['--no-zygote'] : []),
]

export default defineConfig({
    testDir: './test/e2e',
    testMatch: '**/gallery.e2e.ts',
    fullyParallel: false,
    forbidOnly: Boolean(process.env.CI),
    retries: process.env.CI ? 1 : 0,
    workers: 1,
    reporter: [['list']],
    outputDir: 'test-results/e2e-gallery',
    use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1440, height: 1000 },
        baseURL: GALLERY_BASE_URL,
        trace: 'on-first-retry',
        launchOptions: { args: CHROMIUM_ARGS },
        reducedMotion: 'reduce',
    },
    webServer: {
        command: `pnpm docs:build && pnpm exec vitepress preview docs --port ${GALLERY_PORT} --strictPort`,
        url: GALLERY_BASE_URL,
        reuseExistingServer: !process.env.CI,
        timeout: 300_000,
        cwd: dirname,
    },
})
