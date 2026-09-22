#!/usr/bin/env node

/**
 * check-showcase-registry：组件画廊登记表（`docs/.vitepress/showcase-registry.json`）的对账守卫。
 *
 * 为什么需要它：画廊页是**登记表驱动**的——页面只写一个 `<ShowcaseGrid />`，卡片由 JSON 生成。
 * 于是「登记项 ↔ 组件页 / 示例 / 分组」之间没有任何构建期约束：写错组件名、指向不存在的组件页、
 * 或把示例挂到别的组件目录下，`docs:build` 与链接检查都不会报错（页面照常渲染，只是少一张卡、
 * 或预览退化为空）。本守卫把这层对账前移到 `docs:check`。
 *
 * 依据[文档与演示站 §16]，登记表是画廊的单一事实源；分组与组件名的权威来源是**同一文档 §11**
 * （复用 `check-docs-structure.mjs` 的表解析，避免另立一套分组口径）。
 *
 * 规则：
 * 1. 结构合法：每项含非空 `name` / `group.zh` / `group.en` / `description.zh` / `description.en`；
 *    `example` 形如 `<组件目录>/<文件>.vue`，不得为绝对路径、含 `.` / `..` 路径段，且目录等于组件名的 kebab-case。
 * 2. 分组对账：`group.zh` 必须是 §11 登记分组之一，`group.en` 与该分组英文名一致，且 `name` 属于该分组的组件清单。
 * 3. 页面与示例存在：每项的中英组件页（`docs/components/<name>.md` 与 `docs/i18n/en-US/components/<name>.md`）
 *    与中英示例（`docs/examples/` 与 `docs/i18n/en-US/examples/` 下的登记路径）都必须存在。
 * 4. 顺序：登记顺序须为「§11 分组顺序 + 组内英文组件名字母序」（与 §11 侧栏定序同口径）。
 * 5. 页面接线：中英画廊页均存在且含 `<ShowcaseGrid />` 挂载点。
 * 6. 抗静默收窄：登记表非空、项数 ≥ 下界、覆盖分组数 ≥ 下界；§11 解析为空时直接失败。
 *
 * 用法：
 *   node scripts/docs/check-showcase-registry.mjs [仓库根目录]
 */
import { existsSync, readFileSync, statSync } from 'node:fs'
import { isAbsolute, join, relative, resolve } from 'node:path'
import { isDirectExecution } from '../shared/cli.mjs'
import { DESIGN_DOC, kebabCase, parseComponentGroupTable } from './check-docs-structure.mjs'
import { docsProjectRoot } from './vitepress-site.mjs'

/** 登记表（画廊的单一事实源）。 */
export const SHOWCASE_REGISTRY = 'docs/.vitepress/showcase-registry.json'

/** 中英画廊页（挂载点所在文件）。 */
export const SHOWCASE_PAGES = {
    root: 'docs/components/showcase.md',
    'en-US': 'docs/i18n/en-US/components/showcase.md',
}

/** 页面挂载点（组件由主题全局注册）；用带边界的正则匹配，避免 `<ShowcaseGridLegacy />` 之类被误判命中。 */
export const SHOWCASE_WIDGET_RE = /<ShowcaseGrid[\s/>]/

/** 受影响面下界（防「登记表被清空 / 整组丢失」被静默通过）。 */
export const MIN_SHOWCASE_ITEMS = 9
export const MIN_SHOWCASE_GROUPS = 3

function isNonEmptyString(value) {
    return typeof value === 'string' && value.trim().length > 0
}

function isFile(target) {
    return existsSync(target) && statSync(target).isFile()
}

function toRepoPath(root, target) {
    return relative(root, target).replaceAll('\\', '/')
}

/**
 * 读取并解析登记表。
 *
 * @param {string} root 仓库根目录
 * @returns {{ items: object[] | null, error: string | null }} 登记项或解析错误
 */
export function loadShowcaseRegistry(root = docsProjectRoot) {
    let raw
    try {
        raw = readFileSync(resolve(root, SHOWCASE_REGISTRY), 'utf8')
    } catch (error) {
        return { items: null, error: `登记表不可读：${SHOWCASE_REGISTRY}（${error.message}）` }
    }
    let parsed
    try {
        parsed = JSON.parse(raw)
    } catch (error) {
        return { items: null, error: `登记表不是合法 JSON：${SHOWCASE_REGISTRY}（${error.message}）` }
    }
    if (!Array.isArray(parsed)) {
        return { items: null, error: `登记表顶层必须是数组（实为 ${typeof parsed}）` }
    }
    return { items: parsed, error: null }
}

/**
 * 校验 `example` 的形态：`<组件目录>/<文件>.vue`，且目录等于组件名的 kebab-case。
 *
 * 该形态与渲染侧的取用方式绑定：组件用两级目录通配的 glob 取示例（见 `showcase-grid.vue`），
 * 故三级路径、非 `.vue` 文件、以及挂到别的组件目录下的示例都无法被渲染。
 *
 * @param {unknown} example 登记值
 * @param {string} kebab 组件名 kebab-case
 * @returns {string | null} 问题说明（合法时为 null）
 */
export function checkExampleShape(example, kebab) {
    if (!isNonEmptyString(example)) {
        return 'example 必须是非空字符串'
    }
    if (isAbsolute(example) || example.includes('\\')) {
        return `example 必须是相对路径且用 / 分隔（实为 ${example}）`
    }
    const segments = example.split('/')
    if (segments.includes('..') || segments.includes('.')) {
        return `example 不得包含 . / .. 路径段（实为 ${example}）`
    }
    if (segments.length !== 2 || !example.endsWith('.vue')) {
        return `example 必须是 <组件目录>/<文件>.vue 两级 .vue 路径（实为 ${example}）`
    }
    if (segments[0] !== kebab) {
        return `example 的目录必须等于组件名的 kebab-case（${kebab}），实为 ${segments[0]}`
    }
    return null
}

/**
 * 单个登记项的结构校验（不含示例形态 / 文件存在性 / 顺序）。
 *
 * @param {object} item 登记项
 * @param {number} index 登记序号（从 0 起）
 * @returns {Array<{ type: string, message: string }>} 问题列表
 */
export function checkRegistryEntryShape(item, index) {
    const location = `登记表第 ${index + 1} 项`
    if (!item || typeof item !== 'object' || Array.isArray(item)) {
        return [{ type: 'showcase-entry-invalid', message: `${location}：必须是对象` }]
    }
    const issues = []
    if (!isNonEmptyString(item.name)) {
        issues.push({ type: 'showcase-entry-invalid', message: `${location}：缺少非空 name` })
    }
    for (const [field, zh, en] of [
        ['group', item.group?.zh, item.group?.en],
        ['description', item.description?.zh, item.description?.en],
    ]) {
        if (!isNonEmptyString(zh) || !isNonEmptyString(en)) {
            issues.push({ type: 'showcase-entry-invalid', message: `${location}：${field}.zh / ${field}.en 都必须是非空字符串` })
        }
    }
    return issues
}

/**
 * 逐项对账：分组归属、组件页与示例存在性、登记顺序。
 *
 * @param {object[]} items 登记项
 * @param {Array<{ zh: string, en: string, components: string[] }>} tableGroups §11 分组登记
 * @param {string} root 仓库根目录
 * @returns {Array<{ type: string, message: string }>} 问题列表
 */
export function checkRegistryAgainstSite(items, tableGroups, root = docsProjectRoot) {
    const issues = []
    if (tableGroups.length === 0) {
        return [{ type: 'showcase-groups-unparsed', message: `未从 ${DESIGN_DOC} §11 解析到分组登记表：拒绝以空扫描通过` }]
    }
    const groupOrder = new Map(tableGroups.map((group, index) => [group.zh, index]))
    const seen = new Set()
    let previousGroup = -1
    let previousName = ''

    items.forEach((item, index) => {
        const location = `登记表第 ${index + 1} 项`
        issues.push(...checkRegistryEntryShape(item, index))
        if (!isNonEmptyString(item?.name) || !isNonEmptyString(item?.group?.zh)) {
            return
        }
        const { name } = item
        const kebab = kebabCase(name)
        const group = groupOrder.get(item.group.zh)
        if (group === undefined) {
            issues.push({ type: 'showcase-unknown-group', message: `${location}（${name}）：分组「${item.group.zh}」不在 ${DESIGN_DOC} §11 的登记分组中` })
            return
        }
        if (seen.has(name)) {
            issues.push({ type: 'showcase-duplicate-item', message: `${location}：组件 ${name} 在登记表中重复` })
        }
        seen.add(name)

        const expected = tableGroups[group]
        if (item.group.en !== expected.en) {
            issues.push({ type: 'showcase-group-label-mismatch', message: `${location}（${name}）：分组「${expected.zh}」的英文名应为 ${expected.en}，实为 ${item.group.en}` })
        }
        if (!expected.components.includes(name)) {
            issues.push({ type: 'showcase-name-not-in-group', message: `${location}（${name}）：组件不在 §11「${expected.zh}」分组的组件清单中（清单见 ${DESIGN_DOC} §11）` })
        }

        // 顺序：分组序号非降 + 组内字母序严格递增（与 §11 侧栏定序同口径）。
        // 比较用 kebab-case：与英文组件名的字母序在当前组件集下等价（`check-docs-structure` 的侧栏定序亦用 kebab）。
        if (group < previousGroup) {
            issues.push({ type: 'showcase-group-order', message: `${location}（${name}）：分组「${expected.zh}」出现在更靠后的分组之后：登记顺序须为 §11 的分组顺序` })
        } else if (group === previousGroup && previousName && kebab <= previousName) {
            issues.push({ type: 'showcase-item-order', message: `${location}（${name}）：组内顺序须按英文组件名字母序，「${kebab}」不得排在「${previousName}」之后` })
        }
        previousGroup = group
        previousName = kebab

        const exampleIssue = checkExampleShape(item.example, kebab)
        if (exampleIssue) {
            issues.push({ type: 'showcase-example-invalid', message: `${location}（${name}）：${exampleIssue}` })
        } else {
            for (const [target, label] of [
                [join(root, 'docs', 'examples', item.example), '中文示例'],
                [join(root, 'docs', 'i18n', 'en-US', 'examples', item.example), '英文示例'],
            ]) {
                if (!isFile(target)) {
                    issues.push({ type: 'showcase-example-missing', message: `${location}（${name}）：${label}不存在：${toRepoPath(root, target)}` })
                }
            }
        }

        for (const page of [`docs/components/${kebab}.md`, `docs/i18n/en-US/components/${kebab}.md`]) {
            if (!isFile(resolve(root, page))) {
                issues.push({ type: 'showcase-component-page-missing', message: `${location}（${name}）：组件页不存在：${page}（画廊卡片链接由组件名推导，缺页即死链）` })
            }
        }
    })

    return issues
}

/**
 * 页面接线与抗静默收窄断言。
 *
 * @param {object[]} items 登记项
 * @param {string} root 仓库根目录
 * @returns {Array<{ type: string, message: string }>} 问题列表
 */
export function checkShowcaseWiring(items, root = docsProjectRoot) {
    const issues = []
    for (const page of Object.values(SHOWCASE_PAGES)) {
        const target = resolve(root, page)
        if (!isFile(target)) {
            issues.push({ type: 'showcase-page-missing', message: `画廊页不存在：${page}` })
        } else if (!SHOWCASE_WIDGET_RE.test(readFileSync(target, 'utf8'))) {
            issues.push({ type: 'showcase-widget-missing', message: `${page} 未包含 <ShowcaseGrid /> 挂载点：登记表不会被渲染` })
        }
    }
    if (items.length === 0) {
        issues.push({ type: 'showcase-empty-registry', message: `登记表为空：拒绝以空扫描通过（${SHOWCASE_REGISTRY}）` })
        return issues
    }
    if (items.length < MIN_SHOWCASE_ITEMS) {
        issues.push({ type: 'showcase-scope-narrowed', message: `登记项数 ${items.length} 低于下界 ${MIN_SHOWCASE_ITEMS}：受检面疑似被静默收窄` })
    }
    const groups = new Set(items.map((item) => item?.group?.zh).filter(isNonEmptyString))
    if (groups.size < MIN_SHOWCASE_GROUPS) {
        issues.push({ type: 'showcase-scope-narrowed', message: `登记项覆盖 ${groups.size} 个分组，低于下界 ${MIN_SHOWCASE_GROUPS}：受检面疑似被静默收窄` })
    }
    return issues
}

/**
 * 执行登记表对账。
 *
 * @param {string} root 仓库根目录
 * @returns {Promise<{ issues: Array<object>, itemCount: number, groupCount: number, tableGroups: number }>} 检查结果
 */
export async function runShowcaseRegistryCheck(root = docsProjectRoot) {
    const { items, error } = loadShowcaseRegistry(root)
    if (error) {
        return { issues: [{ type: 'showcase-registry-unreadable', message: error }], itemCount: 0, groupCount: 0, tableGroups: 0 }
    }
    let tableGroups
    try {
        tableGroups = parseComponentGroupTable(readFileSync(resolve(root, DESIGN_DOC), 'utf8'))
    } catch (readError) {
        return {
            issues: [{ type: 'showcase-design-doc-unreadable', message: `无法读取 ${DESIGN_DOC}（${readError.message}）` }],
            itemCount: items.length,
            groupCount: 0,
            tableGroups: 0,
        }
    }
    const issues = [...checkShowcaseWiring(items, root), ...checkRegistryAgainstSite(items, tableGroups, root)]
    const groupCount = new Set(items.map((item) => item?.group?.zh).filter(isNonEmptyString)).size
    return { issues, itemCount: items.length, groupCount, tableGroups: tableGroups.length }
}

/**
 * 校验命令行传入的目标目录：必须是含 `package.json` 的仓库根。
 *
 * @param {string | undefined} arg 位置参数
 * @param {string} fallbackRoot 未传参时的默认根目录
 * @returns {{ root: string | null, error: string | null }} 目标根或错误原因
 */
export function resolveTargetRoot(arg, fallbackRoot = docsProjectRoot) {
    if (!arg) {
        return { root: fallbackRoot, error: null }
    }
    if (arg.startsWith('-')) {
        return { root: null, error: `不支持的参数：${arg}` }
    }
    try {
        readFileSync(resolve(arg, 'package.json'), 'utf8')
    } catch {
        return { root: null, error: `目标目录不是仓库根（缺 package.json）：${arg}` }
    }
    return { root: arg, error: null }
}

if (isDirectExecution(import.meta.url)) {
    const { root: targetRoot, error: rootError } = resolveTargetRoot(process.argv[2])
    if (rootError) {
        process.stderr.write(`[check-showcase-registry] ${rootError}\n`)
        process.exitCode = 1
    } else {
        const { issues, itemCount, groupCount, tableGroups } = await runShowcaseRegistryCheck(targetRoot)
        if (issues.length > 0) {
            for (const issue of issues) {
                process.stderr.write(`showcase:${issue.type}: ${issue.message}\n`)
            }
            process.stderr.write(`[check-showcase-registry] ${issues.length} 处问题（受检 ${itemCount} 项 / ${groupCount} 个分组；§11 登记 ${tableGroups} 组）\n`)
            process.exitCode = 1
        } else {
            process.stdout.write(`[check-showcase-registry] OK：${itemCount} 项登记（覆盖 ${groupCount} 个分组 / §11 登记 ${tableGroups} 组）的中英组件页、中英示例与登记顺序均可对账\n`)
        }
    }
}
