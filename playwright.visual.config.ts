import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig, devices } from '@playwright/test'

/**
 * 视觉回归基线的专用 Playwright 配置。
 *
 * 定位（见 docs/design/governance/2026-10-08-m7-1-visual-regression-baseline-evaluation.md）：
 * 补足装置空白——`capture:styles` 管**声明式样式逐属性等价**、E2E 管**几何 / 交互**，本套管
 * **真实渲染的整体像素**（组合 / 布局 / 字体 / 层叠的综合结果）。与既有 E2E 配置隔离：
 * 独立 config / testDir / 端口，断言的是 `src/` 源码夹具（Vite 即时编译，无需先 build）。
 *
 * 纪律：
 * - **固定环境**：chromium、固定 viewport、DPR 1、locale `zh-CN`、固定时区、`colorScheme`、
 *   `reducedMotion: 'reduce'`；基线**须在与 CI 相同环境生成**（本仓 CI = `ubuntu-latest`）。
 * - **串行 + 不重试**（`workers: 1` / `retries: 0`）：不稳定即失败并归因，不用重试掩盖抖动。
 * - **双轴容差**：`threshold`（色差轴）+ 绝对 `maxDiffPixels`（面积轴）——细粒度 token 改动不被
 *   视口比例吞掉（下游实证口径）。
 * - 基线随仓库提交（`test/visual/__screenshots__/`）；失败产物落 gitignored 的 `test-results/visual/`。
 * - **不进 `pnpm verify` 常驻链**（需真实浏览器）；命令 `pnpm test:visual` / `pnpm test:visual:update`。
 */

const dirname = path.dirname(fileURLToPath(import.meta.url))

/** 夹具端口：避开主 E2E（4501）与画廊（4173），可并行探活 */
const VISUAL_PORT = 4601
const VISUAL_BASE_URL = `http://127.0.0.1:${VISUAL_PORT}`

const IS_ROOT = typeof process.getuid === 'function' && process.getuid() === 0

/** 与主 E2E 同源（测试规范 §7）：容器内需关闭沙箱与 zygote，`--single-process` 会阻止多 context，不采用 */
const CHROMIUM_ARGS = [
    '--disable-dev-shm-usage',
    ...(process.env.CI || IS_ROOT ? ['--no-sandbox'] : []),
    ...(IS_ROOT ? ['--no-zygote'] : []),
]

export default defineConfig({
    testDir: './test/visual',
    testMatch: '**/*.visual.ts',
    fullyParallel: false,
    forbidOnly: Boolean(process.env.CI),
    retries: 0,
    workers: 1,
    reporter: [['list']],
    outputDir: 'test-results/visual',
    /** 基线路径模板：`test/visual/__screenshots__/<spec 文件名>/<arg>.png`（单 project，不带 platform 后缀） */
    snapshotPathTemplate: '{testDir}/__screenshots__/{testFileName}/{arg}{ext}',
    expect: {
        toHaveScreenshot: {
            /** 色差轴（pixelmatch YIQ 感知色差）：收敛到 0.1 以检出实底色变（下游实证） */
            threshold: 0.1,
            /** 面积轴：绝对像素数，避免被视口比例吞掉细粒度改动 */
            maxDiffPixels: 100,
            /** 渲染确定化：停 CSS 动画 / 过渡 / Web Animations；隐藏光标；CSS 像素一图点 */
            animations: 'disabled',
            caret: 'hide',
            scale: 'css',
        },
    },
    use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 800 },
        deviceScaleFactor: 1,
        locale: 'zh-CN',
        timezoneId: 'Asia/Shanghai',
        colorScheme: 'light',
        reducedMotion: 'reduce',
        baseURL: VISUAL_BASE_URL,
        trace: 'off',
        launchOptions: { args: CHROMIUM_ARGS },
    },
    webServer: {
        command: `pnpm exec vite --config test/e2e/fixtures/vite.config.ts --port ${VISUAL_PORT} --strictPort`,
        url: VISUAL_BASE_URL,
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
        cwd: dirname,
    },
})
