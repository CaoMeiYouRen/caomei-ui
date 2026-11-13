#!/usr/bin/env node

/**
 * probe-home-hydration：文档站首页 hydration 一致性探针（真实 Chromium + 构建产物）。
 *
 * 背景：Backlog 曾登记「文档站首页 hydration mismatch」但长期未定性。VitePress 生产构建
 * 不会输出 hydration 告警（Vue 生产版静默修补），单靠 console 无法判定；本探针改用
 * **SSG 与 hydration 后 DOM 的结构快照对照**：
 *
 * 1. **静态面（JS 关闭）**：直接加载构建产物，取首页受检选择器的文本与 `innerHTML` 长度；
 * 2. **水合后（JS 开启）**：同页加载，等待 Vue 应用挂载后取同一组快照；
 * 3. 两组快照逐项相等且无 hydration 告警 → 判定「未复现」；任一不等、告警出现或**快照面归零** → exit 1。
 *
 * 抗静默假通过（与 `check-docs-axe` 同约定）：
 * - 启动前校验 `dist/index.html` 存在，缺失直接失败；
 * - 受检选择器必须全部命中且文本非空，任一 `missing` / 空文本即失败（空快照不能与空快照「相等」）；
 * - 水合就绪以 `#app.__vue_app__`（Vue 挂载标记）轮询判定，超时失败，固定等待只作兜底。
 *
 * 为什么以「innerHTML 长度 + 归一化文本」而非逐字节 HTML 比对：水合会补上客户端属性
 * （如 `data-v-*`、事件挂载标记），逐字节必然不等；长度 + 文本能捕捉**内容级**差异
 * （元素增减、文本变化），这正是 hydration mismatch 的主要表现面。**属性级**差异
 * （class / href / data-*）不在本判别面内，结论须带此限定。
 *
 * 已知边界：
 * - 只覆盖 `--page` 指定的单页（默认 `/`）与受检选择器；不宣称整站一致；
 * - 依赖 `docs/.vitepress/dist`（脚本不代跑 `docs:build`）；
 * - 客户端专属状态（主题预设 / 暗色）在 `onMounted` 后写入，不属于 mismatch；脚本以干净
 *   上下文为默认，`--stored-preset` 可用于验证该路径不产生告警。预设键名从主题层源文件读取，
 *   键名漂移时 fail-closed。
 *
 * 用法：
 *   pnpm docs:build
 *   pnpm docs:probe:hydration
 *   pnpm docs:probe:hydration --page=/en-US/ --color-scheme=dark
 *   pnpm docs:probe:hydration --stored-preset=sakura
 */
import { createServer } from 'node:http'
import { readFile, stat } from 'node:fs/promises'
import { extname, join, normalize, resolve, sep } from 'node:path'
import process from 'node:process'
import { chromium } from '@playwright/test'
import { isDirectExecution, parseCliOptions } from '../shared/cli.mjs'

export const projectRoot = resolve(process.cwd())
export const DEFAULT_DIST_ROOT = join(projectRoot, 'docs', '.vitepress', 'dist')

/** 受检快照面：首页静态区域选择器 */
export const SNAPSHOT_TARGETS = ['.VPHero', '.VPFeatures', '.VPNavBarTitle']

/** 主题预设的存储键由主题层维护；脚本从源文件读取，避免两处字面量漂移 */
export const PRESET_SWITCHER_FILE = join(projectRoot, 'docs', '.vitepress', 'theme', 'components', 'theme-preset-switcher.vue')

const MIME_TYPES = {
    '.css': 'text/css',
    '.html': 'text/html',
    '.ico': 'image/x-icon',
    '.js': 'text/javascript',
    '.mjs': 'text/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.svg': 'image/svg+xml',
    '.webmanifest': 'application/manifest+json',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
}

/** 归一化文本：折叠空白，避免缩进差异影响判定 */
export function normalizeText(text) {
    return text.replace(/\s+/g, ' ').trim()
}

/**
 * 生成快照（每条 = `归一化文本|innerHTML 长度`；未命中记为 `missing`）。
 *
 * @param {Array<{ text: string, length: number } | null>} targets 各选择器的命中结果
 * @returns {string[]} 逐目标快照
 */
export function formatSnapshot(targets) {
    return targets.map((target) =>
        target === null ? 'missing' : `${normalizeText(target.text)}|${target.length}`,
    )
}

/** 快照面就绪校验：任一未命中或文本为空都判失败（防止「空对空」被当成一致） */
export function assertSnapshotReady(snapshot, targets = SNAPSHOT_TARGETS) {
    const issues = []
    snapshot.forEach((entry, index) => {
        const selector = targets[index] ?? `#${index + 1}`
        if (entry === 'missing') {
            issues.push(`受检选择器 ${selector} 未命中`)
            return
        }
        const text = entry.slice(0, entry.lastIndexOf('|'))
        if (text.length === 0) {
            issues.push(`受检选择器 ${selector} 文本为空`)
        }
    })
    return issues
}

/** 比较两份快照，返回差异描述（空数组即一致） */
export function compareSnapshots(staticSnapshot, hydratedSnapshot) {
    const issues = []
    const count = Math.max(staticSnapshot.length, hydratedSnapshot.length)
    for (let index = 0; index < count; index += 1) {
        const left = staticSnapshot[index]
        const right = hydratedSnapshot[index]
        if (left !== right) {
            issues.push(`第 ${index + 1} 个快照不一致：SSG=${left ?? 'n/a'} / 水合后=${right ?? 'n/a'}`)
        }
    }
    return issues
}

/** 构建产物前置校验：缺失即失败（fail-closed） */
export async function assertDistReady(distRoot = DEFAULT_DIST_ROOT) {
    const indexFile = join(distRoot, 'index.html')
    try {
        const info = await stat(indexFile)
        if (!info.isFile() || info.size === 0) {
            throw new Error(`构建产物为空：${indexFile}`)
        }
    } catch (error) {
        throw new Error(`构建产物缺失（先执行 \`pnpm docs:build\`）：${indexFile}（${error.code ?? error.message}）`)
    }
    return distRoot
}

/** 读取主题预设的存储键（从主题层源文件解析；解析失败即失败，避免写到无人读取的键） */
export async function readPresetStorageKey(file = PRESET_SWITCHER_FILE) {
    const source = await readFile(file, 'utf8')
    const matched = /const STORAGE_KEY = '([^']+)'/.exec(source)
    if (matched === null || matched[1].length === 0) {
        throw new Error(`未能从主题层解析 STORAGE_KEY：${file}`)
    }
    return matched[1]
}

/** 静态文件服务（仅受检构建产物，路径越界一律 404） */
export function createStaticServer(root = DEFAULT_DIST_ROOT) {
    const normalizedRoot = resolve(root)
    return createServer(async (req, res) => {
        const pathname = (req.url ?? '/').split('?')[0]
        let normalizedPath
        try {
            normalizedPath = normalize(decodeURIComponent(pathname)).replace(/^([/\\])+/, '')
        } catch {
            // 畸形百分号序列：按 404 fail-closed，避免未处理异常把连接挂住
            res.statusCode = 404
            res.end('not found')
            return
        }
        const file = resolve(normalizedRoot, normalizedPath.endsWith('/') || normalizedPath === ''
            ? join(normalizedPath, 'index.html')
            : normalizedPath)
        // 越界判定用「根 + 分隔符」前缀，避免 /a/b 前缀匹配到 /a/bc
        if (file !== normalizedRoot && !file.startsWith(`${normalizedRoot}${sep}`)) {
            res.statusCode = 404
            res.end('not found')
            return
        }
        try {
            const body = await readFile(file)
            res.setHeader('content-type', MIME_TYPES[extname(file)] ?? 'application/octet-stream')
            res.end(body)
        } catch {
            res.statusCode = 404
            res.end('not found')
        }
    })
}

/** 打开页面并采样：`javaScriptEnabled` 为 false 时得到 SSG 静态面 */
async function collectSnapshot(browser, url, { javaScriptEnabled, storedPreset, colorScheme }) {
    const context = await browser.newContext({
        javaScriptEnabled,
        ...(colorScheme ? { colorScheme } : {}),
    })
    if (storedPreset) {
        await context.addInitScript(([key, preset]) => {
            localStorage.setItem(key, preset)
        }, [storedPreset.key, storedPreset.value])
    }
    const page = await context.newPage()
    const warnings = []
    if (javaScriptEnabled) {
        page.on('console', (message) => {
            if (/hydration|mismatch/i.test(message.text())) {
                warnings.push(`${message.type()}: ${message.text()}`)
            }
        })
        page.on('pageerror', (error) => warnings.push(`pageerror: ${error.message}`))
    }
    let snapshot = []
    try {
        await page.goto(url, { waitUntil: javaScriptEnabled ? 'networkidle' : 'load', timeout: 60_000 })
        if (javaScriptEnabled) {
            // Vue 挂载后会在容器上写入 __vue_app__；以它作为确定性水合标记，超时即失败
            await page.waitForFunction(
                () => Boolean(document.querySelector('#app')?.__vue_app__),
                undefined,
                { timeout: 30_000 },
            )
            await page.waitForTimeout(300)
        }
        const targets = await page.evaluate((selectors) => selectors.map((selector) => {
            const element = document.querySelector(selector)
            return element === null ? null : { text: element.textContent ?? '', length: element.innerHTML.length }
        }), SNAPSHOT_TARGETS)
        snapshot = formatSnapshot(targets)
    } finally {
        await context.close()
    }
    return { snapshot, warnings }
}

async function main() {
    const options = parseCliOptions(process.argv, {
        values: {
            '--page': { key: 'page' },
            '--port': { key: 'port', type: 'number' },
            '--dist': { key: 'dist' },
            '--color-scheme': { key: 'colorScheme' },
            '--stored-preset': { key: 'storedPreset' },
        },
    })
    const pagePath = options.page ?? '/'
    const port = options.port ?? 4330
    if (!Number.isInteger(port) || port <= 0 || port > 65535) {
        throw new Error(`--port 非法：${port}`)
    }
    if (options.colorScheme && !['light', 'dark', 'no-preference'].includes(options.colorScheme)) {
        throw new Error(`--color-scheme 非法：${options.colorScheme}`)
    }

    const distRoot = await assertDistReady(options.dist ? resolve(options.dist) : DEFAULT_DIST_ROOT)
    const storedPreset = options.storedPreset
        ? { key: await readPresetStorageKey(), value: options.storedPreset }
        : null

    const server = createStaticServer(distRoot)
    await new Promise((done) => server.listen(port, '127.0.0.1', done))
    const url = `http://127.0.0.1:${port}${pagePath.startsWith('/') ? pagePath : `/${pagePath}`}`

    const browser = await chromium.launch()
    try {
        const staticResult = await collectSnapshot(browser, url, { javaScriptEnabled: false })
        const hydratedResult = await collectSnapshot(browser, url, {
            javaScriptEnabled: true,
            storedPreset,
            colorScheme: options.colorScheme,
        })

        const issues = [
            ...assertSnapshotReady(staticResult.snapshot),
            ...assertSnapshotReady(hydratedResult.snapshot),
            ...compareSnapshots(staticResult.snapshot, hydratedResult.snapshot),
            ...hydratedResult.warnings.map((line) => `水合告警：${line}`),
        ]

        console.info(`[probe-home-hydration] 页面 ${pagePath}（受检面 ${SNAPSHOT_TARGETS.length} 项）`)
        if (issues.length === 0) {
            console.info('[probe-home-hydration] 未复现 hydration mismatch：SSG 与 hydration 后静态区域一致')
            return
        }
        issues.forEach((issue) => console.error(`[probe-home-hydration] ${issue}`))
        process.exitCode = 1
    } finally {
        await browser.close()
        await new Promise((done) => server.close(done))
    }
}

if (isDirectExecution(import.meta.url)) {
    try {
        await main()
    } catch (error) {
        console.error(`[probe-home-hydration][error] ${error instanceof Error ? error.message : String(error)}`)
        process.exitCode = 1
    }
}
