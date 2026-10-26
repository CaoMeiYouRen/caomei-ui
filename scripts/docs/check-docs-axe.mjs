#!/usr/bin/env node

/**
 * check-docs-axe：文档站页面的 axe 抽检（真实 Chromium + 构建产物）。
 *
 * 为什么需要它：组件级 a11y 装置（`test/a11y`）跑在 happy-dom 里，与滚动 / 布局相关的规则
 * （`scrollable-region-focusable`）以及文档站示例的可访问名（`button-name`）都不在它的受检面内。
 * 这两类问题只在**真实渲染**下可判定，且此前一直是人工 V 阶段的一次性抽检——没有可复现的退出码，
 * 门禁无法采信。本脚本把抽检收成可执行证据：`vitepress preview` 起构建产物 → 注入 axe-core →
 * 按**页面矩阵 + WCAG 规则面**审计 → 有违规即 exit 1。
 *
 * 受检面（默认矩阵，见 `docs/design/documentation-site.md` §17）：`/components/data-table`、
 * `/components/select` 中英、`/components/showcase` 中英；两条 WCAG 规则（`button-name` /
 * `scrollable-region-focusable`）对全部登记页统一执行，不做按页裁剪。不纳入
 * best-practice / experimental 规则（如 `focus-order-semantics`）：可聚焦的滚动容器必然命中
 * 「Element does not have a widget role」，把它纳入会让合规模式本身无法通过。
 *
 * 抗静默收窄（两层）：
 * 1. **DOM 层**：每页有「就绪选择器 + 最小命中数」下界，示例被删 / 页面渲染失败直接失败；
 * 2. **规则层**：每页登记「规则 × 最小适用节点数」，axe 的 `passes` 计数低于下界即失败——
 *    防止「规则不适用、什么都没检查」被当成零违规。
 * 另：空页面清单 / 空规则清单、端口被占用、页面加载超时、预览服务器提前退出均 fail-closed。
 *
 * 已知边界（有意）：
 * - 只审计**构建产物**（`docs/.vitepress/dist` 必须已存在；脚本不代跑 `docs:build`）；
 * - 只跑 Chromium（与画廊 / 视觉基线同内核）；Firefox / WebKit 的渲染差异不在面内；
 * - 只覆盖登记的 5 页与 2 条规则，不宣称「整站 a11y 合规」；
 * - 单页只审计一次（默认视口 1440×1000）；窄屏 / 暗色主题的差异由专项用例承担。
 *
 * 用法：
 *   pnpm docs:build
 *   pnpm docs:check:axe                                        # 全矩阵
 *   node scripts/docs/check-docs-axe.mjs --pages=select-zh,showcase-zh
 *   node scripts/docs/check-docs-axe.mjs --base-url=http://127.0.0.1:4173
 *   node scripts/docs/check-docs-axe.mjs --report=test-results/docs-axe/report.json
 */
import { spawn, spawnSync } from 'node:child_process'
import { createRequire } from 'node:module'
import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { createServer } from 'node:net'
import { dirname, isAbsolute, join, relative, resolve, sep } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { isDirectExecution, parseCliOptions } from '../shared/cli.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
export const projectRoot = resolve(__dirname, '..', '..')

/** VitePress CLI 入口（直接走文件路径：`vitepress/bin/*` 被 exports 收窄，`require.resolve` 不可用）。 */
const VITEPRESS_CLI = join(projectRoot, 'node_modules', 'vitepress', 'bin', 'vitepress.js')

/** 构建产物入口（脚本以它作为「已构建」判定）。 */
export const DIST_INDEX = 'docs/.vitepress/dist/index.html'

/** 默认规则面：滚动容器键盘可达与示例可访问名两条 WCAG 规则。 */
export const DEFAULT_RULES = ['button-name', 'scrollable-region-focusable']

/**
 * 默认页面矩阵（key 供 `--pages` 过滤）。
 *
 * - `ready` + `minSubjects`：DOM 层下界（取实测值，只增不减）；
 * - `minApplies`：规则层下界（该页承载的规则 × 最小适用节点数 = 通过 + 违规 + 待复核），
 *   防「规则未生效被当成零违规」；取「该页必须至少被该规则审计到的节点数」，不是精确计数。
 */
export const PAGES = [
    { key: 'data-table', path: '/components/data-table', ready: '.caomei-data-table', minSubjects: 14, minApplies: { 'scrollable-region-focusable': 1 } },
    { key: 'select-zh', path: '/components/select', ready: '.caomei-select', minSubjects: 17, minApplies: { 'button-name': 17 } },
    { key: 'select-en', path: '/en-US/components/select', ready: '.caomei-select', minSubjects: 17, minApplies: { 'button-name': 17 } },
    { key: 'showcase-zh', path: '/components/showcase', ready: '.caomei-showcase__card', minSubjects: 15, minApplies: { 'button-name': 15 } },
    { key: 'showcase-en', path: '/en-US/components/showcase', ready: '.caomei-showcase__card', minSubjects: 15, minApplies: { 'button-name': 15 } },
]

/** 默认预览端口：避开画廊（4173）与主 E2E 夹具（4501）。 */
export const DEFAULT_PORT = 4174

const VIEWPORT = { width: 1440, height: 1000 }
const READY_TIMEOUT_MS = 30_000
const SERVER_TIMEOUT_MS = 30_000
/** 受检面稳定后的短暂等待：hydration 完成后 demo 插件仍可能补渲染一轮。 */
const SETTLE_MS = 300
const SERVER_STOP_TIMEOUT_MS = 3_000

const IS_ROOT = typeof process.getuid === 'function' && process.getuid() === 0

/** 与 Playwright 配置同源：容器内需关闭沙箱与 zygote（`--single-process` 会阻止多 context，不采用）。 */
const CHROMIUM_ARGS = [
    '--disable-dev-shm-usage',
    ...(process.env.CI || IS_ROOT ? ['--no-sandbox'] : []),
    ...(IS_ROOT ? ['--no-zygote'] : []),
]

/**
 * 解析 `--pages` / `--rules` 的逗号清单。
 *
 * @param {string | null} raw 原始值（null 表示未提供）
 * @param {string[]} fallback 缺省值
 * @param {string} label 报错用的选项名
 * @returns {string[]} 去空白后的清单（保持输入顺序，去重）
 */
export function splitList(raw, fallback, label) {
    if (raw === null || raw === undefined) {
        return [...fallback]
    }
    const items = raw.split(',').map((item) => item.trim()).filter(Boolean)
    if (items.length === 0) {
        throw new Error(`${label} 不得为空（空清单会让受检面静默归零）`)
    }
    return [...new Set(items)]
}

/**
 * 按 `--pages` 过滤页面矩阵。
 *
 * @param {string[]} selectors 页面 key 或站点路径
 * @returns {typeof PAGES} 选中的页面（保持矩阵顺序）
 */
export function selectPages(selectors) {
    const requested = new Set(selectors)
    const unknown = [...requested].filter(
        (selector) => !PAGES.some((page) => page.key === selector || page.path === selector),
    )
    if (unknown.length > 0) {
        const known = PAGES.map((page) => `${page.key}（${page.path}）`).join(' / ')
        throw new Error(`未知页面：${unknown.join(', ')}；可选：${known}`)
    }
    return PAGES.filter((page) => requested.has(page.key) || requested.has(page.path))
}

/**
 * 汇总一次审计的判定：违规非空、DOM 受检面低于下界、或登记规则未达最小适用数即失败。
 *
 * @param {Array<{ page: object, subjects: number, violations: object[], passes: Record<string, number>, violationNodes?: Record<string, number>, incomplete?: Record<string, number> }>} entries
 * @param {string[] | null} [activeRules] 本轮实际审计的规则；缺省时判定全部登记规则
 * @returns {{ ok: boolean, violations: number, failures: string[] }}
 */
export function evaluateOutcome(entries, activeRules = null) {
    const failures = []
    let violations = 0
    for (const entry of entries) {
        violations += entry.violations.length
        if (entry.subjects < entry.page.minSubjects) {
            failures.push(
                `${entry.page.path} 受检面收窄：${entry.page.ready} 命中 ${entry.subjects}（下界 ${entry.page.minSubjects}）`,
            )
        }
        for (const [rule, minimum] of Object.entries(entry.page.minApplies ?? {})) {
            // `--rules` 收窄时跳过未审计的规则：未跑的规则无法判定「是否生效」
            if (activeRules && !activeRules.includes(rule)) {
                continue
            }
            // 「适用节点」= 通过 + 违规 + 待复核：违规节点同样证明规则已生效，不能只数 passes
            const applies = (entry.passes?.[rule] ?? 0)
                + (entry.violationNodes?.[rule] ?? 0)
                + (entry.incomplete?.[rule] ?? 0)
            if (applies < minimum) {
                failures.push(
                    `${entry.page.path} 规则未生效：${rule} 适用节点 ${applies}（下界 ${minimum}）`,
                )
            }
        }
    }
    if (violations > 0) {
        failures.unshift(`${violations} 项 axe 违规`)
    }
    return { ok: failures.length === 0, violations, failures }
}

/**
 * 渲染人类可读报告。
 *
 * @param {{ entries: Array<{ page: object, subjects: number, violations: object[], passes: Record<string, number>, violationNodes?: Record<string, number>, incomplete?: Record<string, number> }>, rules: string[] }} result
 * @returns {string} 报告文本
 */
export function formatReport({ entries, rules }) {
    const lines = [`[docs-axe] 规则面：${rules.join(', ')}`]
    for (const { page, subjects, violations, passes, violationNodes, incomplete } of entries) {
        const status = violations.length === 0 ? 'OK' : `FAIL（${violations.length}）`
        lines.push(`[docs-axe] ${page.path} → ${status}；受检元素 ${subjects}（就绪选择器 ${page.ready}）`)
        const counts = rules.map((rule) => {
            const passed = passes?.[rule] ?? 0
            const failed = violationNodes?.[rule] ?? 0
            const pending = incomplete?.[rule] ?? 0
            return `${rule}：通过 ${passed} / 违规 ${failed} / 待复核 ${pending}`
        })
        lines.push(`  规则节点：${counts.join('；')}`)
        for (const violation of violations) {
            lines.push(`  - ${violation.id}（${violation.impact ?? 'n/a'}）：${violation.targets.join(' | ')}`)
        }
    }
    return lines.join('\n')
}

/**
 * 把 `--report` 解析为仓库内路径（越界即拒绝，避免写到任意位置）。
 *
 * @param {string} root 仓库根
 * @param {string} raw 原始值
 * @returns {string} 绝对路径
 */
export function resolveReportPath(root, raw) {
    const target = resolve(root, raw)
    const rel = relative(root, target)
    if (!rel || rel === '..' || rel.startsWith(`..${sep}`) || isAbsolute(rel)) {
        throw new Error(`--report 必须落在仓库内：${raw}`)
    }
    return target
}

/**
 * 解析命令行参数。
 *
 * @param {string[]} argv 原始 argv（含 node / 脚本名）
 * @returns {{ pages: typeof PAGES, rules: string[], port: number, baseUrl: string | null, report: string | null }}
 */
export function parseOptions(argv) {
    const options = parseCliOptions(argv, {
        values: {
            '--pages': { key: 'pages' },
            '--rules': { key: 'rules' },
            '--port': { key: 'port', type: 'number' },
            '--base-url': { key: 'baseUrl' },
            '--report': { key: 'report' },
        },
        flags: {},
    })
    const pages = selectPages(splitList(options.pages ?? null, PAGES.map((page) => page.key), '--pages'))
    const rules = splitList(options.rules ?? null, DEFAULT_RULES, '--rules')
    const port = options.port ?? DEFAULT_PORT
    if (!Number.isInteger(port) || port <= 0 || port > 65535) {
        throw new Error(`--port 非法：${port}`)
    }
    const baseUrl = options.baseUrl ? options.baseUrl.replace(/\/$/, '') : null
    if (baseUrl && !/^https?:\/\//.test(baseUrl)) {
        throw new Error(`--base-url 必须以 http(s):// 开头：${baseUrl}`)
    }
    return { pages, rules, port, baseUrl, report: options.report ?? null }
}

/**
 * 等待预览服务器可用（fail-closed：超时即抛错）。
 *
 * @param {string} baseUrl 站点根
 * @param {{ timeoutMs?: number, probe?: (url: string) => Promise<unknown>, sleep?: (ms: number) => Promise<void> }} [options]
 *   测试注入点：`probe` 默认 fetch，`sleep` 默认定时器
 * @returns {Promise<void>}
 */
export async function waitForServer(baseUrl, options = {}) {
    const timeoutMs = options.timeoutMs ?? SERVER_TIMEOUT_MS
    const probe = options.probe ?? (async (url) => {
        const response = await fetch(url)
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`)
        }
    })
    const sleep = options.sleep ?? ((ms) => new Promise((resolvePromise) => setTimeout(resolvePromise, ms)))
    const deadline = Date.now() + timeoutMs
    while (Date.now() < deadline) {
        try {
            await probe(baseUrl)
            return
        } catch {
            // 服务器尚未就绪：继续轮询
        }
        await sleep(250)
    }
    throw new Error(`预览服务器在 ${timeoutMs}ms 内未就绪：${baseUrl}`)
}

/**
 * 端口占用预检（避免连到外来服务：VitePress 的 preview 不实现 `--strictPort`）。
 *
 * @param {number} port 端口
 * @returns {Promise<void>}
 */
export async function ensurePortFree(port) {
    await new Promise((resolvePromise, rejectPromise) => {
        const probe = createServer()
        probe.once('error', (error) => {
            rejectPromise(new Error(`端口 ${port} 不可用（${error.code ?? error.message}），请先释放或改用 --port`))
        })
        probe.once('listening', () => {
            probe.close(() => resolvePromise())
        })
        probe.listen(port, '127.0.0.1')
    })
}

/**
 * 停止预览服务器：先 SIGTERM，超时后 SIGKILL，并等待真实退出。
 *
 * @param {import('node:child_process').ChildProcess} server 子进程
 * @returns {Promise<void>}
 */
async function stopServer(server) {
    // 被信号终止时 `exitCode` 仍为 null、`signalCode` 有值：两者都要判，否则会白等 3 秒且事件已错过
    if (!server || server.exitCode !== null || server.signalCode !== null) {
        return
    }
    const exited = new Promise((resolveExit) => server.once('exit', resolveExit))
    server.kill('SIGTERM')
    const timer = setTimeout(() => server.kill('SIGKILL'), SERVER_STOP_TIMEOUT_MS)
    await exited
    clearTimeout(timer)
}

/**
 * 子进程失败信息（spawn 失败 / 非零退出）。
 *
 * @param {import('node:child_process').ChildProcess} server 子进程
 * @returns {{ promise: Promise<string>, text: () => string }} 退出信号与 stderr 摘要
 */
function trackServer(server) {
    let stderr = ''
    server.stderr?.on('data', (chunk) => {
        stderr += chunk.toString()
    })
    const promise = new Promise((resolveExit) => {
        server.once('error', (error) => {
            stderr ||= error.message
            resolveExit('error')
        })
        server.once('exit', () => resolveExit('exit'))
    })
    return { promise, text: () => stderr.trim() }
}

/**
 * 审计单页。
 *
 * @param {import('@playwright/test').Page} page Playwright 页面
 * @param {object} definition 页面定义
 * @param {string} axeSource axe-core 源码
 * @param {string[]} rules 规则清单
 * @param {string} baseUrl 站点根
 * @returns {Promise<{ page: object, subjects: number, violations: object[], passes: Record<string, number>, violationNodes: Record<string, number>, incomplete: Record<string, number> }>}
 */
async function auditPage(page, definition, axeSource, rules, baseUrl) {
    await page.goto(`${baseUrl}${definition.path}`, { waitUntil: 'load' })
    // DOM 层就绪：命中数达到下界（比固定等待更抗慢机器与 hydration 抖动）
    await page.waitForFunction(
        ({ ready, minimum }) => globalThis.document.querySelectorAll(ready).length >= minimum,
        { ready: definition.ready, minimum: definition.minSubjects },
        { timeout: READY_TIMEOUT_MS },
    )
    await page.waitForTimeout(SETTLE_MS)
    await page.addScriptTag({ content: axeSource })

    const result = await page.evaluate(async ({ ruleIds, ready }) => {
        const results = await globalThis.axe.run(globalThis.document, {
            runOnly: { type: 'rule', values: ruleIds },
        })
        const countOf = (collection) => Object.fromEntries(collection.map((item) => [item.id, item.nodes.length]))
        return {
            subjects: globalThis.document.querySelectorAll(ready).length,
            violations: results.violations.map((violation) => ({
                id: violation.id,
                impact: violation.impact,
                targets: violation.nodes.map((node) => node.target.join(' ')),
            })),
            passes: countOf(results.passes),
            violationNodes: countOf(results.violations),
            incomplete: countOf(results.incomplete),
        }
    }, { ruleIds: rules, ready: definition.ready })

    return { page: definition, ...result }
}

/**
 * 起预览服务器 → 跑浏览器 → 关服务器。
 *
 * @param {object} options 解析后的选项
 * @returns {Promise<number>} 退出码
 */
async function run(options) {
    const require = createRequire(join(projectRoot, 'package.json'))
    const { chromium } = require('@playwright/test')
    const axeSource = readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8')

    let server = null
    let browser = null
    try {
        let baseUrl = options.baseUrl
        if (!baseUrl) {
            if (!existsSync(join(projectRoot, DIST_INDEX))) {
                throw new Error(`缺少文档站构建产物：${DIST_INDEX}；请先运行 pnpm docs:build`)
            }
            await ensurePortFree(options.port)
            baseUrl = `http://127.0.0.1:${options.port}`
            server = spawn(
                process.execPath,
                [VITEPRESS_CLI, 'preview', 'docs', '--port', String(options.port)],
                { cwd: projectRoot, stdio: ['ignore', 'ignore', 'pipe'] },
            )
            const { promise: exited, text: serverError } = trackServer(server)
            const first = await Promise.race([waitForServer(baseUrl).then(() => 'ready'), exited])
            if (first !== 'ready') {
                throw new Error(`vitepress preview 提前退出${serverError() ? `：${serverError()}` : ''}`)
            }
            if (server.exitCode !== null) {
                throw new Error(`vitepress preview 已退出（code ${server.exitCode}）${serverError() ? `：${serverError()}` : ''}`)
            }
        }

        browser = await chromium.launch({ args: CHROMIUM_ARGS })
        const context = await browser.newContext({ viewport: VIEWPORT, reducedMotion: 'reduce' })
        const page = await context.newPage()
        const entries = []
        for (const definition of options.pages) {
            entries.push(await auditPage(page, definition, axeSource, options.rules, baseUrl))
        }
        const outcome = evaluateOutcome(entries, options.rules)
        console.info(formatReport({ entries, rules: options.rules }))
        if (options.report) {
            const reportPath = resolveReportPath(projectRoot, options.report)
            mkdirSync(dirname(reportPath), { recursive: true })
            const distIndex = join(projectRoot, DIST_INDEX)
            const head = spawnSync('git', ['rev-parse', '--short', 'HEAD'], { cwd: projectRoot, encoding: 'utf8' })
            writeFileSync(
                reportPath,
                JSON.stringify({
                    generatedAt: new Date().toISOString(),
                    head: head.status === 0 ? head.stdout.trim() : null,
                    distIndexMtime: existsSync(distIndex) ? statSync(distIndex).mtime.toISOString() : null,
                    baseUrl,
                    rules: options.rules,
                    entries,
                    outcome,
                }, null, 2),
            )
            console.info(`[docs-axe] 报告已写入：${options.report}`)
        }
        if (outcome.ok) {
            console.info('[docs-axe] OK：受检页面在规则面内零违规')
            return 0
        }
        for (const failure of outcome.failures) {
            console.error(`[docs-axe] FAIL：${failure}`)
        }
        return 1
    } finally {
        try {
            if (browser) {
                await browser.close()
            }
        } finally {
            await stopServer(server)
        }
    }
}

if (isDirectExecution(import.meta.url)) {
    try {
        const options = parseOptions(process.argv)
        process.exitCode = await run(options)
    } catch (error) {
        console.error(`[docs-axe] ${error.message}`)
        process.exitCode = 1
    }
}
