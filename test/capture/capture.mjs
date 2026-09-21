#!/usr/bin/env node

/**
 * 计算样式等价采集运行器（样式治理的浏览器侧回归装置）。
 *
 * 为什么需要它：`:where()` 归一化、声明去重、触发器收敛、token 归并这类改动不改变任何
 * 单测可断言的 DOM / 事件契约，其正确性只能由「真实浏览器计算样式逐属性等价」证明。
 * 单测跑在 happy-dom 上（无布局引擎、不算 scoped CSS），故该装置是这类改动的唯一回归载体。
 *
 * 用法：
 *   node test/capture/capture.mjs            # 采集 → 与冻结基线比对（有差异 exit 1）
 *   node test/capture/capture.mjs --freeze   # 采集 → 覆盖冻结基线（基线须随装置同提交）
 *
 * 比对任意两份快照：`node test/capture/diff.mjs <基线.json> <快照.json>`。
 * 采集改动前的基线（A/B 取证）：`CAOMEI_SRC=<HEAD worktree>/src node test/capture/capture.mjs`。
 *
 * 采样面与「未纳入面」的登记见 docs/design/governance/ 下的采集装置交付记录；
 * 命令与运行环境说明见 docs/standards/testing.md。
 *
 * 两个必须遵守的采样纪律（此前一次性装置的实测教训）：
 * 1. 参与 transition 的属性（`box-shadow` / `background-color`）须在状态稳定后再读，否则
 *    取到插值中间态，基线 / 后测「双错同形」会得到 0 差异的假证据；
 * 2. 需交互的采样（触发器开合、浮层开合）必须排在纯静态采样之后，模态遮罩会拦截点击。
 */
import { spawn } from 'node:child_process'
import { mkdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { isDirectExecution, parseCliOptions } from '../../scripts/shared/cli.mjs'
import { DEFAULT_BASELINE_FILE, DEFAULT_SNAPSHOT_FILE, diffEntries, formatDiffs, readEntries } from './diff.mjs'

const dirname = path.dirname(fileURLToPath(import.meta.url))
export const REPO_ROOT = path.resolve(dirname, '..', '..')
const FIXTURE_DIR = path.join(dirname, 'fixture')
const CONFIG_FILE = path.join(FIXTURE_DIR, 'vite.config.mjs')

/** 固定端口：避开 playground（4400）、常驻 E2E（4501）与文档站预览（4173）。 */
const PORT = 4521
const BASE_URL = `http://127.0.0.1:${PORT}/`
/** 固定视口：档位几何与文本排版对视口敏感，冻结基线绑定单一视口。 */
const VIEWPORT = { width: 1280, height: 800 }
/** 状态类采样的稳定等待：`box-shadow` / `border-color` 参与 transition。 */
const SETTLE_MS = 250
/**
 * 剔除无语义的易变属性取值：Vue scoped 哈希（`data-v-*`，跨构建必变）与 Reka 的实例计数器
 * （`…-v-<n>`，随夹具组件数量 / 顺序漂移）。两者都不承载语义，留着会让基线因无关改动误报。
 * 计数器以外的 id 名称保留，从而「`aria-controls` 指向哪一类面板」仍可断言。
 */
const VOLATILE_ATTR_PATTERN = '-v-\\d+'

const SIZES = ['sm', 'md', 'lg']
const TONES = ['neutral', 'primary', 'success', 'warning', 'danger']
const BUTTON_VARIANTS = ['primary', 'secondary', 'ghost']
const BUTTON_TONES = ['none', 'neutral', 'primary', 'success', 'warning', 'danger']
const MESSAGE_VARIANTS = ['soft', 'solid', 'outline', 'simple']
const BOX_VARIANTS = ['soft', 'solid', 'outline']

const SIZE_PROPS = [
    'min-height', 'height', 'padding-top', 'padding-right', 'padding-bottom', 'padding-left',
    'font-size', 'border-top-left-radius',
]
const VARIANT_PROPS = [
    'background-color', 'color', 'border-top-color', 'border-left-color',
    'border-top-width', 'border-left-width',
]
const BUTTON_PROPS = [
    'background-color', 'color', 'border-top-color', 'font-size', 'height', 'padding-left',
    'outline-color', 'outline-style', 'outline-width',
]
const FOCUS_PROPS = ['box-shadow', 'border-top-color']
const TRIGGER_PROPS = ['height', 'padding-left', 'border-top-width', 'border-top-left-radius', 'background-color', 'color', 'font-size']
const DRAWER_PROPS = ['width', 'height', 'animation-duration', 'transition-duration', 'z-index']
const DIALOG_PROPS = ['width', 'z-index']
const Z_PROPS = ['z-index']

/**
 * 采样面声明：`{ key, selector, props }`，逐条对应夹具中的 `data-cap` 标记。
 *
 * 该表是「受检范围」的唯一事实源——采集结束按它自检（见 `verifyCoverage`），删除 / 重命名
 * 采样项会让自检失败，从而避免受检面被静默收窄。
 */
function buildStaticSamples() {
    const samples = []
    const add = (key, selector, props) => samples.push({ key, selector, props })

    // 尺寸档位：既有矩阵
    for (const size of SIZES) {
        add(`size.auto-complete.${size}`, `[data-cap="size:auto-complete:${size}"] .caomei-auto-complete`, SIZE_PROPS)
        add(`size.multi-select.${size}`, `[data-cap="size:multi-select:${size}"] .caomei-multi-select`, SIZE_PROPS)
        add(`size.message.${size}`, `[data-cap="size:message:${size}"] .caomei-message`, SIZE_PROPS)
        add(`size.select.${size}`, `[data-cap="size:select:${size}"] .caomei-select`, SIZE_PROPS)
        add(`size.select-field.${size}`, `[data-cap="size:select:${size}"] .caomei-select__field`, ['font-size'])
        add(`size.select-button.${size}`, `[data-cap="size:select-button:${size}"] .caomei-select-button`, ['height', 'min-height', 'border-top-left-radius'])
        add(`size.select-button-item.${size}`, `[data-cap="size:select-button:${size}"] .caomei-select-button__item`, ['padding-left', 'padding-right', 'font-size', 'min-height'])
    }

    // 尺寸档位：基类 `var(…, fallback)` 消费 + 档位块只声明变量
    for (const size of SIZES) {
        add(`tier.input.${size}`, `[data-cap="tier:input:${size}"] .caomei-input`, SIZE_PROPS)
        add(`tier.textarea.${size}`, `[data-cap="tier:textarea:${size}"] .caomei-textarea`, SIZE_PROPS)
        add(`tier.textarea-control.${size}`, `[data-cap="tier:textarea:${size}"] .caomei-textarea__control`, ['padding-top', 'padding-right', 'padding-bottom', 'padding-left', 'font-size'])
        add(`tier.input-number.${size}`, `[data-cap="tier:input-number:${size}"] .caomei-input-number`, SIZE_PROPS)
        add(`tier.input-number-button.${size}`, `[data-cap="tier:input-number:${size}"] .caomei-input-number__button`, ['width', 'height'])
        add(`tier.date-picker.${size}`, `[data-cap="tier:date-picker:${size}"] .caomei-date-picker`, SIZE_PROPS)
        add(`tier.tag.${size}`, `[data-cap="tier:tag:${size}"] .caomei-tag`, SIZE_PROPS)
        add(`tier.badge.${size}`, `[data-cap="tier:badge:${size}"] .caomei-badge`, SIZE_PROPS)
    }
    for (const size of ['md', 'lg']) {
        add(`tier.badge-dot.${size}`, `[data-cap="tier:badge-dot:${size}"] .caomei-badge`, ['width', 'height', 'min-width', 'padding-left', 'padding-right'])
    }

    // 变体与语气
    for (const tone of TONES) {
        for (const variant of MESSAGE_VARIANTS) {
            add(`variant.message.${tone}.${variant}`, `[data-cap="variant:message:${tone}:${variant}"] .caomei-message`, VARIANT_PROPS)
        }
        for (const variant of BOX_VARIANTS) {
            add(`variant.badge.${tone}.${variant}`, `[data-cap="variant:badge:${tone}:${variant}"] .caomei-badge`, VARIANT_PROPS)
            add(`variant.tag.${tone}.${variant}`, `[data-cap="variant:tag:${tone}:${variant}"] .caomei-tag`, VARIANT_PROPS)
        }
    }

    // 按钮矩阵
    for (const variant of BUTTON_VARIANTS) {
        for (const tone of BUTTON_TONES) {
            for (const size of SIZES) {
                add(`button.${variant}.${tone}.${size}`, `[data-cap="button:${variant}:${tone}:${size}"] .caomei-button`, BUTTON_PROPS)
            }
        }
    }

    // 局部层叠与被覆盖的边框色
    add('radio-group-invalid.indicator', '[data-cap="stack:radio-group-invalid"] .caomei-radio-button:nth-child(2) .caomei-radio-button__indicator', ['border-top-color'])
    add('z.float-label.label', '[data-cap="stack:float-label"] .caomei-float-label > label', Z_PROPS)
    add('z.data-table.th-pinned-start', '[data-cap="stack:data-table"] .caomei-data-table__th.caomei-data-table__cell--pinned-start', Z_PROPS)
    add('z.data-table.td-pinned-start', '[data-cap="stack:data-table"] .caomei-data-table__td.caomei-data-table__cell--pinned-start', Z_PROPS)

    return samples
}

export const STATIC_SAMPLES = buildStaticSamples()

/** 按钮聚焦态采样：强制 `:focus-visible` 后读描边三属性（与 `button.*` 的未聚焦态同选择器）。 */
export const BUTTON_FOCUS_SAMPLES = BUTTON_VARIANTS.flatMap((variant) =>
    BUTTON_TONES.flatMap((tone) =>
        SIZES.map((size) => ({
            key: `button-focus.${variant}.${tone}.${size}`,
            selector: `[data-cap="button:${variant}:${tone}:${size}"] .caomei-button`,
            props: ['outline-color', 'outline-style', 'outline-width'],
        })),
    ),
)

/** 状态采样：先聚焦（可选强制 `:focus-visible`）再读，覆盖 `:focus-within` / `[aria-invalid]` 分支。 */
export const STATE_SAMPLES = [
    { cap: 'state:input:focus', root: '.caomei-input', inner: 'input' },
    { cap: 'state:input:invalid', root: '.caomei-input', inner: 'input' },
    { cap: 'state:textarea:focus', root: '.caomei-textarea', inner: 'textarea' },
    { cap: 'state:textarea:invalid', root: '.caomei-textarea', inner: 'textarea' },
    { cap: 'state:input-number:focus', root: '.caomei-input-number', inner: 'input' },
    { cap: 'state:input-number:invalid', root: '.caomei-input-number', inner: 'input' },
    { cap: 'state:select:focus', root: '.caomei-select', inner: '.caomei-select', focusVisible: true },
    { cap: 'state:select:invalid', root: '.caomei-select', inner: '.caomei-select', focusVisible: true },
].map((entry) => ({ ...entry, key: entry.cap.split(':').join('.'), selector: `[data-cap="${entry.cap}"] ${entry.root}` }))

/** 触发器采样：属性快照（过滤无句义的 scoped 哈希）+ 外观计算样式，含闭合 / 开合两态。 */
export const TRIGGER_SAMPLES = [
    { name: 'date-picker', selector: '[data-cap="trigger:date-picker"] .caomei-date-picker', panel: '.caomei-date-picker__content' },
    { name: 'color-picker', selector: '[data-cap="trigger:color-picker"] .caomei-color-picker__trigger', panel: '.caomei-color-picker__panel' },
    { name: 'split-button-menu', selector: '[data-cap="trigger:split-button"] .caomei-split-button__menu', panel: '.caomei-dropdown-menu__content' },
]

/** 需先聚焦的局部层叠采样（`:focus-within` 生效后才写 z-index；`focus` 为目标元素，默认与 `selector` 同）。 */
export const FOCUS_WITHIN_SAMPLES = [
    { key: 'z.button-group.focus-within', selector: '[data-cap="stack:button-group"] .caomei-button', props: Z_PROPS },
    { key: 'z.input-group.focus-within', selector: '[data-cap="stack:input-group"] .caomei-input-group > *', props: Z_PROPS, focus: '[data-cap="stack:input-group"] input' },
]

/** 浮层尺寸档位与层级：最后采样，避免模态遮罩拦截前面的交互采样。 */
export const OVERLAY_SAMPLES = [
    ...SIZES.map((size) => ({ key: `drawer.${size}.content`, selector: `.caomei-drawer__content--${size}`, props: DRAWER_PROPS })),
    { key: 'drawer.overlay', selector: '.caomei-drawer__overlay', props: ['animation-duration', 'transition-duration', 'z-index'] },
    ...SIZES.map((size) => ({ key: `dialog.${size}.content`, selector: `.caomei-dialog__content--${size}`, props: DIALOG_PROPS })),
    { key: 'dialog.overlay', selector: '.caomei-dialog__overlay', props: Z_PROPS },
]

/** 全部声明式采样项（静态 + 按钮聚焦态 + 状态 + 焦点层叠 + 浮层）；触发器属性快照另按 `TRIGGER_SAMPLES` 生成。 */
export function declaredKeys() {
    return [
        ...STATIC_SAMPLES.map((item) => item.key),
        ...BUTTON_FOCUS_SAMPLES.map((item) => item.key),
        ...STATE_SAMPLES.map((item) => item.key),
        ...FOCUS_WITHIN_SAMPLES.map((item) => item.key),
        ...OVERLAY_SAMPLES.map((item) => item.key),
        ...TRIGGER_SAMPLES.flatMap((item) => [`trigger.${item.name}.attrs`, `trigger.${item.name}.style`, `trigger.${item.name}.open`, `trigger.${item.name}.closed`]),
    ]
}

/**
 * 受检面不变量：每条声明的采样都必须在结果里出现，且选择器命中。
 *
 * @param {Record<string, unknown>} entries 采集结果
 * @param {string[]} keys 声明的采样键（默认取 `declaredKeys()`）
 * @returns {{ ok: boolean, missing: string[], unmatched: string[] }} `missing` = 未采集到；`unmatched` = 选择器未命中
 */
export function verifyCoverage(entries, keys = declaredKeys()) {
    const missing = keys.filter((key) => entries[key] === undefined)
    const unmatched = keys.filter((key) => {
        const value = entries[key]
        return typeof value === 'object' && value !== null && '__missing' in value
    })
    return { ok: missing.length === 0 && unmatched.length === 0, missing, unmatched }
}

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms))
}

async function waitForServer(timeoutMs = 60_000) {
    const start = Date.now()
    while (Date.now() - start < timeoutMs) {
        try {
            const response = await fetch(BASE_URL)
            if (response.ok) {
                return
            }
        } catch {
            // 未就绪，重试
        }
        await sleep(250)
    }
    throw new Error(`夹具服务未就绪：${BASE_URL}`)
}

/** 构造 Chromium 启动参数（root 容器内必须关闭沙箱与 zygote，见测试规范 §7）。 */
export function chromiumArgs({ isRoot = typeof process.getuid === 'function' && process.getuid() === 0, isCI = Boolean(process.env.CI) } = {}) {
    return [
        '--disable-dev-shm-usage',
        ...(isCI || isRoot ? ['--no-sandbox'] : []),
        ...(isRoot ? ['--no-zygote'] : []),
    ]
}

async function collect(page, cdp, rootNodeId) {
    const entries = {}
    const errors = []

    const readStyle = async (key, selector, props) => {
        try {
            entries[key] = await page.evaluate(
                ([target, properties]) => {
                    const element = document.querySelector(target)
                    if (!element) {
                        return { __missing: target }
                    }
                    const computed = getComputedStyle(element)
                    const output = {}
                    for (const property of properties) {
                        output[property] = computed.getPropertyValue(property)
                    }
                    return output
                },
                [selector, props],
            )
        } catch (error) {
            errors.push(`${key}: ${String(error)}`)
        }
    }

    const readAttrs = async (key, selector) => {
        try {
            entries[key] = await page.evaluate(
                ([target, volatilePattern]) => {
                    const element = document.querySelector(target)
                    if (!element) {
                        return { __missing: target }
                    }
                    // 过滤无语义的 scoped 哈希（`data-v-*` 跨构建必然变化）；序列化为单属性对象，
                    // 否则 diff 会按字符串下标展开成上百条假差异。
                    const volatile = new RegExp(volatilePattern, 'g')
                    const names = element.getAttributeNames().filter((name) => !name.startsWith('data-v-')).sort()
                    const dump = names
                        .map((name) => `${name}="${String(element.getAttribute(name)).replace(volatile, '-v-*')}"`)
                        .join(' ')
                    return { dump: `${element.tagName} ${dump}` }
                },
                [selector, VOLATILE_ATTR_PATTERN],
            )
        } catch (error) {
            errors.push(`${key}: ${String(error)}`)
        }
    }

    const forceSiblingPseudo = async (selector, pseudoClasses) => {
        const { nodeId } = await cdp.send('DOM.querySelector', { nodeId: rootNodeId, selector })
        if (!nodeId) {
            // 不静默：强制伪类未生效会让「已聚焦 / 已悬停」的采样退回默认态，与基线「双错同形」时给出假通过
            errors.push(`force-pseudo: 选择器未命中 ${selector}`)
            return false
        }
        await cdp.send('CSS.forcePseudoState', { nodeId, forcedPseudoClasses: pseudoClasses })
        return true
    }

    /** 聚焦后断言焦点确实落在目标或其内部（防止把 `focus()` 打在不可聚焦的包装层上而静默采到未聚焦值）。 */
    const assertFocusedInside = async (key, selector) => {
        const focused = await page.evaluate(
            (target) => {
                const element = document.querySelector(target)
                return Boolean(element) && (document.activeElement === element || element.contains(document.activeElement))
            },
            selector,
        )
        if (!focused) {
            errors.push(`${key}: 聚焦未落到 ${selector}（:focus-within 不会生效）`)
        }
    }

    // ── 静态计算样式 ────────────────────────────────────────────────
    for (const sample of STATIC_SAMPLES) {
        await readStyle(sample.key, sample.selector, sample.props)
    }
    for (const sample of TRIGGER_SAMPLES) {
        await readAttrs(`trigger.${sample.name}.attrs`, sample.selector)
        await readStyle(`trigger.${sample.name}.style`, sample.selector, TRIGGER_PROPS)
    }

    // ── 按钮聚焦态：强制 `:focus-visible` 后读描边 ───────────────────
    for (const sample of BUTTON_FOCUS_SAMPLES) {
        await forceSiblingPseudo(sample.selector, ['focus-visible'])
        await readStyle(sample.key, sample.selector, sample.props)
        await forceSiblingPseudo(sample.selector, [])
    }

    // ── 状态与几何：聚焦 / 非法态 ────────────────────────────────────
    for (const sample of STATE_SAMPLES) {
        await page.locator(`[data-cap="${sample.cap}"] ${sample.inner}`).first().focus()
        if (sample.focusVisible) {
            await forceSiblingPseudo(sample.selector, ['focus-visible'])
        }
        await sleep(SETTLE_MS)
        await readStyle(sample.key, sample.selector, FOCUS_PROPS)
        if (sample.focusVisible) {
            await forceSiblingPseudo(sample.selector, [])
        }
    }

    // ── 局部层叠（需 `:focus-within`）────────────────────────────────
    for (const sample of FOCUS_WITHIN_SAMPLES) {
        const focusTarget = sample.focus ?? sample.selector
        await page.locator(focusTarget).first().focus()
        await assertFocusedInside(sample.key, focusTarget)
        await readStyle(sample.key, sample.selector, sample.props)
    }

    // ── 触发器开合态：闭合态属性快照不足以证明接线等价 ────────────────
    for (const sample of TRIGGER_SAMPLES) {
        await page.locator(sample.selector).first().click()
        await page.waitForSelector(sample.panel, { state: 'visible' })
        await readAttrs(`trigger.${sample.name}.open`, sample.selector)
        await page.keyboard.press('Escape')
        await page.waitForSelector(sample.panel, { state: 'detached' })
        await readAttrs(`trigger.${sample.name}.closed`, sample.selector)
    }

    // ── 浮层尺寸档位与层级（模态遮罩会拦截点击，故排最后）────────────
    await page.evaluate(() => {
        for (const size of ['sm', 'md', 'lg']) {
            window.__ui.setDrawer(size, true)
            window.__ui.setDialog(size, true)
        }
    })
    await page.waitForSelector('.caomei-drawer__content', { state: 'visible' })
    await page.waitForSelector('.caomei-dialog__content', { state: 'visible' })
    await sleep(SETTLE_MS)
    for (const sample of OVERLAY_SAMPLES) {
        await readStyle(sample.key, sample.selector, sample.props)
    }

    return { entries, errors }
}

export async function capture({ freeze = false } = {}) {
    // 动态 import：装置的单测（happy-dom）只需纯函数，不应拉起 Playwright。
    const { chromium } = await import('@playwright/test')

    const vite = spawn('pnpm', ['exec', 'vite', '--config', path.relative(REPO_ROOT, CONFIG_FILE)], {
        cwd: REPO_ROOT,
        stdio: 'ignore',
    })

    let browser
    try {
        await waitForServer()
        browser = await chromium.launch({ args: chromiumArgs() })
        const page = await browser.newPage({ viewport: VIEWPORT })
        const pageErrors = []
        page.on('pageerror', (error) => pageErrors.push(String(error)))
        await page.goto(BASE_URL, { waitUntil: 'networkidle' })
        // 首帧就绪判定：夹具第一个采样段的首个标记
        await page.waitForSelector('[data-cap="size:auto-complete:md"]')
        await page.evaluate(() => document.fonts.ready)
        await sleep(SETTLE_MS)

        const cdp = await page.context().newCDPSession(page)
        await cdp.send('DOM.enable')
        await cdp.send('CSS.enable')
        const { root } = await cdp.send('DOM.getDocument', { depth: -1 })

        const { entries, errors } = await collect(page, cdp, root.nodeId)
        errors.push(...pageErrors.map((error) => `pageerror: ${error}`))

        const coverage = verifyCoverage(entries)
        const payload = {
            capturedAt: new Date().toISOString(),
            chromiumVersion: browser.version(),
            viewport: `${VIEWPORT.width}x${VIEWPORT.height}`,
            entries,
            errors,
        }

        if (!coverage.ok) {
            errors.push(
                `受检面不变量失败：未采集 ${coverage.missing.length} 项${coverage.missing.length > 0 ? `（${coverage.missing.join(', ')}）` : ''}`
                + `、选择器未命中 ${coverage.unmatched.length} 项${coverage.unmatched.length > 0 ? `（${coverage.unmatched.join(', ')}）` : ''}`,
            )
        }

        if (errors.length > 0) {
            for (const error of errors) {
                console.error(`[capture][error] ${error}`)
            }
            throw new Error(`采集失败：${errors.length} 个错误（不写入结果）`)
        }

        const items = Object.keys(entries).length
        if (freeze) {
            mkdirSync(dirname, { recursive: true })
            writeFileSync(DEFAULT_BASELINE_FILE, `${JSON.stringify(payload, null, 4)}\n`)
            console.info(`[capture] 冻结基线写入 ${path.relative(REPO_ROOT, DEFAULT_BASELINE_FILE)}（${items} 项，chromium ${payload.chromiumVersion}）`)
            return { ok: true, items, freeze: true }
        }

        mkdirSync(path.dirname(DEFAULT_SNAPSHOT_FILE), { recursive: true })
        writeFileSync(DEFAULT_SNAPSHOT_FILE, `${JSON.stringify(payload, null, 4)}\n`)

        const baseline = readEntries(DEFAULT_BASELINE_FILE)
        const diffs = diffEntries(baseline, entries)
        if (diffs.length === 0) {
            console.info(`[capture] 0 差异：${items} 项逐属性与冻结基线一致`)
            return { ok: true, items, freeze: false, diffs }
        }

        console.error(`[capture] ${diffs.length} 处差异（相对冻结基线）：`)
        for (const line of formatDiffs(diffs)) {
            console.error(line)
        }
        return { ok: false, items, freeze: false, diffs }
    } finally {
        if (browser) {
            await browser.close()
        }
        vite.kill('SIGTERM')
    }
}

export async function main(argv = process.argv.slice(2)) {
    try {
        // 严格解析：未知参数即失败，避免 '--freeze' 拼错时静默落入比对模式并报「0 差异」
        const { freeze } = parseCliOptions(argv, { defaults: { freeze: false }, flags: { '--freeze': { key: 'freeze' } } })
        const result = await capture({ freeze })
        return result.ok ? 0 : 1
    } catch (error) {
        console.error(`[capture][error] ${error instanceof Error ? error.message : String(error)}`)
        return 1
    }
}

if (isDirectExecution(import.meta.url)) {
    process.exitCode = await main()
}
