#!/usr/bin/env node

/**
 * check-demo-transition-copies：文档站动效层 transition 副本一致性守卫。
 *
 * 为什么需要它：`docs/.vitepress/theme/motion.css` 为「演示区 opt-in」按组件重声明了一批
 * `transition` 完整 shorthand（VitePress 在 reduce 下会压平全部过渡）。这些副本**值同步自组件
 * 基础层声明**——组件调整过渡属性后，副本会静默漂移：demo 少恢复一个属性、或恢复了组件已删除
 * 的属性，都不会有任何报错。本守卫把该约定变为可判定门禁。
 *
 * 校验：
 * 1. `TRANSITION_COPIES` 中每条登记必须同时存在于组件源与 `motion.css` 副本，且两处的
 *    transition 属性名集合与登记**完全一致**（防源漂移 / 副本漂移 / 登记过期）；
 * 2. 登记源文件内**任何**基础层 transition（排除 `expressive` 轴与 reduce 块）都必须已登记
 *    （组件新增过渡时守卫失败）；
 * 3. `motion.css` 中带 transition 的 demo 规则必须能在登记表中找到对应项（防孤儿副本）；
 * 4. 受检面下界 `MIN_TRANSITION_COPIES` 防静默收窄。
 *
 * 边界：只比较「选择器 → transition 属性名集合」，不比较时长 / 缓动 / 值；属性名通过
 * `var(--x)` 间接声明时按同文件的变量声明展开一层（足够覆盖 `--caomei-field-transition`）。
 *
 * 用法：
 *   node scripts/governance/check-demo-transition-copies.mjs   # 有违规 exit 1
 */
import { readFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { isDirectExecution } from '../shared/cli.mjs'

export const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..')

/** 文档站动效层（副本所在）。 */
export const MOTION_FILE = 'docs/.vitepress/theme/motion.css'

/** 副本前缀（demo 容器）。 */
export const DEMO_PREFIX = '.vitepress-demo-plugin__container'

/** 受检面下界（防静默收窄；登记表来自 docs/design/governance/2026-11-13-phase32-m3-1-demo-transition.md §2 的 25 行清单，合并行展开后为 27 条）。 */
export const MIN_TRANSITION_COPIES = 27

/**
 * 登记表：组件基础层 transition → demo 副本。
 *
 * `selector` 为组件内选择器（与源码逐字一致），`file` 为声明该选择器的源码文件，
 * `properties` 为经 `var()` 展开后的 transition 属性名集合（顺序无关）。
 * 记录 §2 中一行含两个选择器的（toolbar button / link、radio indicator / ::after）在此展开为两条。
 */
export const TRANSITION_COPIES = [
    { file: 'src/styles/field-shell.css', selector: '.caomei-field', properties: ['border-color', 'box-shadow'] },
    { file: 'src/components/button/button.vue', selector: '.caomei-button', properties: ['opacity', 'color', 'background-color', 'border-color'] },
    { file: 'src/components/float-label/float-label.vue', selector: '.caomei-float-label :deep(> label)', demoSelector: '.caomei-float-label > label', properties: ['top', 'font-size', 'color', 'transform'] },
    { file: 'src/components/accordion/accordion-item.vue', selector: '.caomei-accordion__trigger', properties: ['background-color'] },
    { file: 'src/components/accordion/accordion-item.vue', selector: '.caomei-accordion__chevron', properties: ['transform'] },
    { file: 'src/components/badge/badge.vue', selector: '.caomei-badge', properties: ['background-color', 'color', 'min-width'] },
    { file: 'src/components/card/card.vue', selector: '.caomei-card--hoverable', properties: ['box-shadow', 'transform'] },
    { file: 'src/components/checkbox/checkbox.vue', selector: '.caomei-checkbox__control', properties: ['background-color', 'border-color'] },
    { file: 'src/components/file-upload/file-upload.vue', selector: '.caomei-file-upload__dropzone', properties: ['border-color', 'background-color'] },
    { file: 'src/components/image/image.vue', selector: '.caomei-image__preview-icon', properties: ['opacity'] },
    { file: 'src/components/menu/menu.vue', selector: '.caomei-menu .caomei-menu__item', properties: ['background-color', 'color'] },
    { file: 'src/components/menu/sub-menu.vue', selector: '.caomei-menu__submenu-indicator', properties: ['transform'] },
    { file: 'src/components/paginator/paginator.vue', selector: '.caomei-paginator__control', properties: ['border-color', 'background-color', 'color'] },
    { file: 'src/components/password/password.vue', selector: '.caomei-password__meter-fill', properties: ['width', 'background-color'] },
    { file: 'src/components/progress-bar/progress-bar.vue', selector: '.caomei-progress-bar__indicator', properties: ['width'] },
    { file: 'src/components/radio-group/radio-button.vue', selector: '.caomei-radio-button__indicator', properties: ['background-color', 'border-color'] },
    { file: 'src/components/radio-group/radio-button.vue', selector: '.caomei-radio-button__indicator::after', properties: ['transform'] },
    { file: 'src/components/select-button/select-button.vue', selector: '.caomei-select-button__item', properties: ['background-color', 'color'] },
    { file: 'src/components/switch/switch.vue', selector: '.caomei-switch', properties: ['background-color', 'border-color'] },
    { file: 'src/components/switch/switch.vue', selector: '.caomei-switch__thumb', properties: ['transform'] },
    { file: 'src/components/tabs/tabs-trigger.vue', selector: '.caomei-tabs__trigger', properties: ['color', 'border-color'] },
    { file: 'src/components/stepper/stepper-trigger.vue', selector: '.caomei-stepper__trigger', properties: ['color', 'background-color'] },
    { file: 'src/components/toolbar/toolbar.vue', selector: '.caomei-toolbar__button', properties: ['background-color', 'color'] },
    { file: 'src/components/toolbar/toolbar-link.vue', selector: '.caomei-toolbar__link', properties: ['background-color', 'color'] },
    { file: 'src/components/toggle-button/toggle-button.vue', selector: '.caomei-toggle-button', properties: ['background-color', 'color', 'border-color'] },
    { file: 'src/components/dropdown-menu/dropdown-menu-trigger.vue', selector: '.caomei-dropdown-menu__trigger', properties: ['background-color', 'border-color'] },
    { file: 'src/components/popover/popover-trigger.vue', selector: '.caomei-popover__trigger', properties: ['background-color', 'border-color'] },
]

/** 选择器 / 值规范化：折叠空白。 */
function normalizeText(value) {
    return value.replace(/\s+/g, ' ').trim()
}

/** 从 SFC 提取 `<style>` 块；纯 CSS 文件整体返回。 */
export function extractStyleBlocks(text, filePath) {
    if (!filePath.endsWith('.vue')) {
        return [text]
    }
    const blocks = []
    const re = /<style[^>]*>([\s\S]*?)<\/style>/g
    let match
    while ((match = re.exec(text)) !== null) {
        blocks.push(match[1])
    }
    return blocks
}

/** 找与 `open` 处的 `{` 配对的 `}`（注释已被剥离）。 */
function findBlockEnd(source, open) {
    let depth = 0
    for (let index = open; index < source.length; index += 1) {
        if (source[index] === '{') {
            depth += 1
        } else if (source[index] === '}') {
            depth -= 1
            if (depth === 0) {
                return index
            }
        }
    }
    return source.length
}

/**
 * 解析 CSS 文本为规则列表。
 *
 * 跳过 `@keyframes` / `@font-face` 等非选择器块；递归进入 `@media` / `@supports`
 * （`prefers-reduced-motion: reduce` 上下文标记为 `reduce`）。
 */
export function parseRules(source, options = {}) {
    const rules = []
    const clean = source.replace(/\/\*[\s\S]*?\*\//g, '')
    const walk = (start, end, reduce) => {
        let index = start
        let selectorStart = start
        while (index < end) {
            const char = clean[index]
            if (char === ';') {
                selectorStart = index + 1
                index += 1
            } else if (char === '{') {
                const prelude = normalizeText(clean.slice(selectorStart, index))
                const close = findBlockEnd(clean, index)
                if (prelude.startsWith('@')) {
                    if (/^@(?:keyframes|-webkit-keyframes|font-face|page|property)/i.test(prelude)) {
                        // 非选择器块：跳过
                    } else {
                        const isReduce = reduce || /prefers-reduced-motion\s*:\s*reduce/.test(prelude)
                        walk(index + 1, close, isReduce)
                    }
                } else if (prelude.length > 0) {
                    rules.push({
                        selector: prelude,
                        body: clean.slice(index + 1, close),
                        reduce,
                    })
                }
                index = close + 1
                selectorStart = index
            } else {
                index += 1
            }
        }
    }
    walk(0, clean.length, Boolean(options.reduce))
    return rules
}

/** 解析声明块为 `Map<prop, value>`（同名取最后一个）。 */
export function parseDeclarations(body) {
    const declarations = new Map()
    let depth = 0
    let start = 0
    const parts = []
    for (let index = 0; index < body.length; index += 1) {
        const char = body[index]
        if (char === '(') {
            depth += 1
        } else if (char === ')') {
            depth -= 1
        } else if (char === ';' && depth === 0) {
            parts.push(body.slice(start, index))
            start = index + 1
        }
    }
    parts.push(body.slice(start))
    for (const part of parts) {
        const colon = part.indexOf(':')
        if (colon === -1) {
            continue
        }
        const prop = part.slice(0, colon).trim()
        const value = part.slice(colon + 1).trim()
        if (prop.length > 0) {
            declarations.set(prop, value)
        }
    }
    return declarations
}

/** 顶层逗号切分（忽略括号内的逗号）。 */
function splitTopLevel(value, separator) {
    const parts = []
    let depth = 0
    let start = 0
    for (let index = 0; index < value.length; index += 1) {
        const char = value[index]
        if (char === '(') {
            depth += 1
        } else if (char === ')') {
            depth -= 1
        } else if (char === separator && depth === 0) {
            parts.push(value.slice(start, index))
            start = index + 1
        }
    }
    parts.push(value.slice(start))
    return parts.map((part) => part.trim()).filter((part) => part.length > 0)
}

/**
 * 从 `transition` 简写值提取属性名集合。
 *
 * `var(--x)` 按 `variables` 展开（最多 3 层），`none` 视为空集。
 */
export function transitionProperties(value, variables = new Map(), depth = 0) {
    const trimmed = value.replace(/!important/i, '').trim()
    if (trimmed === '' || trimmed === 'none' || depth > 3) {
        return new Set()
    }
    const properties = new Set()
    for (const part of splitTopLevel(trimmed, ',')) {
        const first = part.split(/\s+/)[0]
        if (first.startsWith('var(')) {
            const match = /^var\(\s*(--[\w-]+)/.exec(first)
            const resolved = match ? variables.get(match[1]) : undefined
            if (resolved !== undefined) {
                for (const property of transitionProperties(resolved, variables, depth + 1)) {
                    properties.add(property)
                }
                continue
            }
        }
        if (first.length > 0) {
            properties.add(first)
        }
    }
    return properties
}

/** 文件级变量表（声明在任意规则里的 `--*`，后者覆盖前者）。 */
function fileVariables(rules) {
    const variables = new Map()
    for (const rule of rules) {
        for (const [prop, value] of parseDeclarations(rule.body)) {
            if (prop.startsWith('--')) {
                variables.set(prop, value)
            }
        }
    }
    return variables
}

/** 读取文件规则（缓存由调用方按需构建）。 */
function readRules(root, file) {
    const text = readFileSync(join(root, file), 'utf8')
    const rules = []
    for (const block of extractStyleBlocks(text, file)) {
        rules.push(...parseRules(block))
    }
    return rules
}

/** 选择器比较键：折叠空白并统一 `>` 两侧空格。 */
function selectorKey(selector) {
    return normalizeText(selector).replace(/\s*>\s*/g, ' > ')
}

/**
 * 执行守卫。
 * @param {string} root 仓库根
 * @param {{ motionFile?: string, registry?: typeof TRANSITION_COPIES, minCopies?: number }} options 测试用覆盖
 */
export function checkDemoTransitionCopies(root = REPO_ROOT, options = {}) {
    const motionFile = options.motionFile ?? MOTION_FILE
    const registry = options.registry ?? TRANSITION_COPIES
    const minCopies = options.minCopies ?? MIN_TRANSITION_COPIES
    const errors = []

    if (registry.length < minCopies) {
        errors.push(`受检面收窄：登记 ${registry.length} 条 < 下界 ${minCopies}`)
    }

    const motionRules = readRules(root, motionFile)
    const motionVariables = fileVariables(motionRules)
    const demoRules = new Map()
    for (const rule of motionRules) {
        // demo 副本本身就位于 `@media (prefers-reduced-motion: reduce)` 内，不能按 reduce 跳过
        const declarations = parseDeclarations(rule.body)
        if (!declarations.has('transition')) {
            continue
        }
        const transitionValue = declarations.get('transition')
        // 副本必须逐属性 !important，否则压不过 VitePress 的 `* { transition-duration: 0s !important }`
        if (!/!\s*important/i.test(transitionValue)) {
            errors.push(`副本缺少 !important：${motionFile} ${rule.selector}`)
        }
        const properties = transitionProperties(transitionValue, motionVariables)
        // 同名规则可能合并多个选择器（toolbar button / link），逐选择器登记
        for (const selector of splitTopLevel(rule.selector, ',')) {
            const key = selectorKey(selector)
            if (key.startsWith(`${DEMO_PREFIX} `)) {
                demoRules.set(key, properties)
            }
        }
    }

    const sourceFiles = new Map()
    const registeredSourceKeys = new Set()
    for (const entry of registry) {
        const fileRules = sourceFiles.get(entry.file) ?? readRules(root, entry.file)
        sourceFiles.set(entry.file, fileRules)
        const variables = fileVariables(fileRules)
        const key = `${entry.file}::${selectorKey(entry.selector)}`
        registeredSourceKeys.add(key)

        const sourceRule = fileRules.find((rule) => !rule.reduce && selectorKey(rule.selector) === selectorKey(entry.selector))
        if (!sourceRule) {
            errors.push(`源规则缺失：${entry.file} 中找不到 ${entry.selector}`)
            continue
        }
        const sourceDeclarations = parseDeclarations(sourceRule.body)
        const sourceProperties = transitionProperties(sourceDeclarations.get('transition') ?? '', variables)
        const expected = [...entry.properties].sort()
        if ([...sourceProperties].sort().join(',') !== expected.join(',')) {
            errors.push(
                `源漂移：${entry.file} ${entry.selector} 属性 [${[...sourceProperties].sort().join(', ')}] ≠ 登记 [${expected.join(', ')}]`,
            )
        }

        const demoKey = selectorKey(`${DEMO_PREFIX} ${entry.demoSelector ?? entry.selector}`)
        const demoProperties = demoRules.get(demoKey)
        if (!demoProperties) {
            errors.push(`副本缺失：${motionFile} 中找不到 ${DEMO_PREFIX} ${entry.demoSelector ?? entry.selector}`)
            continue
        }
        if ([...demoProperties].sort().join(',') !== expected.join(',')) {
            errors.push(
                `副本漂移：${motionFile} ${entry.selector} 属性 [${[...demoProperties].sort().join(', ')}] ≠ 登记 [${expected.join(', ')}]`,
            )
        }
    }

    // 登记源文件内不得存在未登记的基础层 transition（`expressive` / reduce 块跳过）
    for (const [file, rules] of sourceFiles) {
        const variables = fileVariables(rules)
        for (const rule of rules) {
            if (rule.reduce || /\[data-motion\s*=\s*['"]expressive['"]\]/.test(rule.selector)) {
                continue
            }
            const declarations = parseDeclarations(rule.body)
            if (!declarations.has('transition')) {
                continue
            }
            if (transitionProperties(declarations.get('transition'), variables).size === 0) {
                continue
            }
            const key = `${file}::${selectorKey(rule.selector)}`
            if (!registeredSourceKeys.has(key)) {
                errors.push(`未登记的组件过渡：${file} ${rule.selector}（新增过渡需同步登记并复制到 ${motionFile}）`)
            }
        }
    }

    // demo 层不得存在孤儿副本
    const registeredDemoKeys = new Set(
        registry.map((entry) => selectorKey(`${DEMO_PREFIX} ${entry.demoSelector ?? entry.selector}`)),
    )
    for (const demoKey of demoRules.keys()) {
        if (!registeredDemoKeys.has(demoKey)) {
            errors.push(`孤儿副本：${motionFile} ${demoKey} 未在登记表`)
        }
    }

    return { ok: errors.length === 0, errors }
}

if (isDirectExecution(import.meta.url)) {
    const result = checkDemoTransitionCopies(REPO_ROOT)
    if (result.ok) {
        console.info(`[check-demo-transition-copies] 通过：${TRANSITION_COPIES.length} 条 transition 副本与组件源一致`)
    } else {
        console.error(`[check-demo-transition-copies] ${result.errors.length} 处违规：`)
        for (const error of result.errors) {
            console.error(`  - ${error}`)
        }
        process.exitCode = 1
    }
}
