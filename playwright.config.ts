import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig, devices } from '@playwright/test'

const dirname = path.dirname(fileURLToPath(import.meta.url))

/** 夹具服务端口：避开 playground（4400）与文档站预览（4173） */
const E2E_PORT = 4501
const E2E_BASE_URL = `http://127.0.0.1:${E2E_PORT}`

/** 以 root 运行（容器内常见）时 Chromium 必须关闭沙箱，普通开发机保留沙箱 */
const IS_ROOT = typeof process.getuid === 'function' && process.getuid() === 0

/**
 * Chromium 启动参数（测试规范 §7）：
 * - `--disable-dev-shm-usage`：容器内 `/dev/shm` 过小；
 * - `--no-sandbox`：仅在 CI 或 root 下下发，本地开发保留沙箱；
 * - 不加 `--single-process`——它会阻止创建第二个 context，仅在容器内 headless 崩溃时才需要；
 * - `/tmp` 不可写的环境以 `TMPDIR=<可写目录> pnpm test:e2e` 运行。
 */
const CHROMIUM_ARGS = [
    '--disable-dev-shm-usage',
    ...(process.env.CI || IS_ROOT ? ['--no-sandbox'] : []),
]

/**
 * 响应式设计 §4 的验收视口（mobile 390×844 / tablet 768×1024 / desktop 1280×800）。
 * 每个视口一个 project、常驻用例跑三遍；desktop 档同时承担形态回归。
 *
 * 设备描述符取对应形态（手机 / 平板 / 桌面），视口按 §4 覆盖——库内断点只消费视口宽度，
 * 但 UA / 触摸 / DPR 保持形态一致，避免「名为手机实为桌面 UA」的失真（`isMobile` 影响
 * meta viewport 与滚动条渲染）。
 */
const PROJECTS = [
    { name: 'mobile', device: 'Pixel 5', width: 390, height: 844 },
    { name: 'tablet', device: 'Galaxy Tab S4', width: 768, height: 1024 },
    { name: 'desktop', device: 'Desktop Chrome', width: 1280, height: 800 },
] as const

export default defineConfig({
    testDir: './test/e2e',
    testMatch: '**/*.e2e.ts',
    fullyParallel: true,
    forbidOnly: Boolean(process.env.CI),
    retries: process.env.CI ? 1 : 0,
    workers: process.env.CI ? 1 : undefined,
    reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : [['list']],
    /** 报告与 trace 落 gitignored 目录（测试规范 §7）；`outputDir` 只清空自身，不动 `test-results/<批次>/` */
    outputDir: 'test-results/e2e',
    use: {
        baseURL: E2E_BASE_URL,
        trace: 'on-first-retry',
        launchOptions: { args: CHROMIUM_ARGS },
        /**
         * 布局断言基于几何，统一以 reduced-motion 运行以消除入场动画（scale / opacity）对
         * `boundingBox()` 的干扰，使测量确定性可复现（相关组件样式声明了 reduced-motion 分支）。
         *
         * **代价（已登记）**：本套用例不再经过默认动效路径；「默认动效（`no-preference`）无常驻
         * E2E 覆盖」登记于 Backlog §1.6 的「常驻 E2E 规格 follow-up」。动效的一次性实测见
         * `docs/design/governance/2026-09-16-m3-demo-motion-validation.md`。
         */
        reducedMotion: 'reduce',
    },
    projects: PROJECTS.map(({ name, device, width, height }) => ({
        name,
        use: {
            ...devices[device],
            viewport: { width, height },
        },
    })),
    webServer: {
        command: 'pnpm exec vite --config test/e2e/fixtures/vite.config.ts',
        url: E2E_BASE_URL,
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
        cwd: dirname,
    },
})
