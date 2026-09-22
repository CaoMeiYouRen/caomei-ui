#!/usr/bin/env node

/**
 * check-docs-structure：文档站结构一致性守卫（两类规则）。
 *
 * 规则一 `anchor-slug-mismatch`——**锚点按 VitePress 实算 slug 校验**。
 *   受检面：`docs/` 内 markdown 的站内链接（含翻译页）；目标必须落在 `docs/` 内。
 *   为什么需要它：`check-links.mjs` 的 `looseNorm` 会剥离 `-` / `_` / 标点，
 *   **「链接检查通过」不能证明锚点有效**（见[文档与演示站 §13]）。本仓已登记的实证形态：
 *   数字开头标题的 slug 会补 `_` 前缀（`## 4. 阶段与条目命名` → `#_4-阶段与条目命名`）、
 *   全角标点与空格归一为 `-`（`## 附录 A 可复现材料` → `#附录-a-可复现材料`）。
 *   边界：源文件不在 `docs/` 内者（仓库根 / `.github` 下的 md 由 GitHub 渲染，slug 规则不同）
 *   与其目标越出 `docs/` 者不在受检面；行号锚点（`#L12`）跳过。
 *
 * 规则二 `sidebar-order`——**组件区侧栏的分区与排序不变式**。
 *   依据[文档与演示站 §11]：6 个组件分组的组间顺序固定为该节登记表自上而下的顺序，
 *   组内按英文组件名字母序，中英两侧同分组划分与同组件顺序，且「总览」在 6 组之前、
 *   「能力说明」在其后。守卫以 §11 的表为单一事实源，与 `config.ts` 的已解析 sidebar 对账。
 *
 * 用法：
 *   node scripts/docs/check-docs-structure.mjs [仓库根目录]
 */
import { readFileSync } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'
import { isDirectExecution } from '../shared/cli.mjs'
import {
    collectDocsMarkdownFiles,
    createSlugResolver,
    docsProjectRoot,
    docsRoot,
    findSlugSourceDivergence,
    loadSiteNavigation,
    resolveDocsPageTarget,
} from './vitepress-site.mjs'

/** 需求依据文档（侧栏不变式的单一事实源）。 */
export const DESIGN_DOC = 'docs/design/documentation-site.md'

/** 组件区侧栏的键（zh / en）与首尾固定条目。 */
export const COMPONENT_SIDEBAR_KEYS = { root: '/components/', 'en-US': '/en-US/components/' }
export const COMPONENT_SIDEBAR_EDGES = {
    root: { head: '总览', tail: '能力说明', headLink: '/components/' },
    'en-US': { head: 'Overview', tail: 'Capabilities', headLink: '/en-US/components/' },
}

/** 组件条目数的下界（防「受检范围被静默收窄」：解析不到 sidebar 时不得静默通过）。 */
export const MIN_COMPONENT_ENTRIES = 45

export const MD_LINK_RE = /\[([^\]]*)\]\(([^)]+)\)/g

/**
 * 提取文档中「## 11. 组件分区与排序」小节正文。
 *
 * @param {string} markdown 设计文档内容
 * @returns {string} 小节正文（不含标题行）
 */
export function extractComponentGroupSection(markdown) {
    const lines = markdown.split(/\r?\n/)
    const start = lines.findIndex((line) => /^##\s+11\.\s/.test(line))
    if (start === -1) {
        return ''
    }
    const rest = lines.slice(start + 1)
    const end = rest.findIndex((line) => /^##\s/.test(line))
    return (end === -1 ? rest : rest.slice(0, end)).join('\n')
}

/**
 * 解析 §11 的分组登记表：分组中文名 / 英文名 / 组内组件（顿号分隔的英文名）。
 *
 * @param {string} markdown 设计文档内容
 * @returns {Array<{ zh: string, en: string, components: string[] }>} 分组登记
 */
export function parseComponentGroupTable(markdown) {
    const groups = []
    for (const line of extractComponentGroupSection(markdown).split(/\r?\n/)) {
        const match = line.match(/^\|\s*([^|]+?)\s*\|\s*([^|]+?)\s*\|\s*([^|]+?)\s*\|\s*$/)
        if (!match) {
            continue
        }
        const [, zh, en, list] = match
        if (/^:?-{2,}/.test(zh) || zh === '分组') {
            continue
        }
        const components = list
            .split('、')
            .map((name) => name.trim())
            .filter((name) => name.length > 0)
        if (components.length === 0) {
            continue
        }
        groups.push({ zh, en, components })
    }
    return groups
}

/** 英文组件名 → 链接 basename（`ButtonGroup` → `button-group`）。 */
export function kebabCase(name) {
    return name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()
}

function linkBasename(link) {
    return String(link ?? '').split(/[?#]/)[0].replace(/\/$/, '').split('/').pop()
}

/**
 * 侧栏不变式：已解析的两个 locale sidebar 与 §11 登记表的对账。
 *
 * @param {Record<string, unknown>} sidebar 已解析的 sidebar（含 `/components/` 与 `/en-US/components/`）
 * @param {Array<{ zh: string, en: string, components: string[] }>} tableGroups §11 登记表
 * @returns {Array<{ type: string, message: string }>} 问题列表
 */
export function checkComponentSidebar(sidebar, tableGroups) {
    const issues = []
    const push = (message) => issues.push({ type: 'sidebar-order', message })

    if (tableGroups.length === 0) {
        push('未从文档与演示站 §11 解析到分组登记表：拒绝以空扫描通过')
        return issues
    }

    const resolved = {}
    for (const [locale] of Object.entries(COMPONENT_SIDEBAR_KEYS)) {
        const key = COMPONENT_SIDEBAR_KEYS[locale]
        const value = sidebar[key]
        if (!Array.isArray(value)) {
            push(`${locale} 侧栏 ${key} 不存在或不是数组（已解析配置）`)
            continue
        }
        const edge = COMPONENT_SIDEBAR_EDGES[locale]
        const head = value[0]
        const tail = value[value.length - 1]
        if (head?.text !== edge.head || linkBasename(head?.link) !== linkBasename(edge.headLink)) {
            push(`${locale} 侧栏首项应为「${edge.head}」并指向 ${edge.headLink}，实为「${head?.text}」→ ${head?.link}`)
        }
        if (tail?.text !== edge.tail) {
            push(`${locale} 侧栏末项应为「${edge.tail}」，实为「${tail?.text}」`)
        }
        resolved[locale] = value.slice(1, -1).map((group) => ({
            text: group?.text,
            items: (group?.items ?? []).map((item) => linkBasename(item?.link)),
        }))
    }

    if (!resolved.root || !resolved['en-US']) {
        return issues
    }
    if (resolved.root.length !== tableGroups.length) {
        push(`组件分组数应为 ${tableGroups.length}（§11 登记表），zh 实为 ${resolved.root.length}`)
    }
    if (resolved['en-US'].length !== resolved.root.length) {
        push(`中英组件分组数不一致：zh ${resolved.root.length} / en ${resolved['en-US'].length}`)
    }

    tableGroups.forEach((group, index) => {
        const expected = group.components.map(kebabCase)
        for (const locale of ['root', 'en-US']) {
            const actual = resolved[locale][index]
            const expectedText = locale === 'root' ? group.zh : group.en
            if (!actual) {
                push(`${locale} 侧栏缺少第 ${index + 1} 组「${expectedText}」`)
                continue
            }
            if (actual.text !== expectedText) {
                push(`${locale} 侧栏第 ${index + 1} 组应为「${expectedText}」，实为「${actual.text}」`)
            }
            if (actual.items.join('、') !== expected.join('、')) {
                push(`${locale} 侧栏「${expectedText}」组内成员或顺序与 §11 表不一致：期望 ${expected.join('、')}，实为 ${actual.items.join('、')}`)
            }
        }
    })

    return issues
}

/**
 * 锚点规则：docs/ 内链接的锚点必须命中目标页的 VitePress 实算 slug。
 *
 * @param {string[]} files 受检文件（绝对路径）
 * @param {(file: string) => Set<string>} slugsOf slug 解析函数
 * @param {string} root 文档站根（便于单测注入夹具）
 * @returns {Array<{ type: string, file: string, line: number, message: string }>} 问题列表
 */
export function collectAnchorIssues(files, slugsOf, root = docsRoot) {
    const issues = []
    for (const file of files) {
        const relFile = relative(dirname(root), file).replaceAll('\\', '/')
        const lines = readFileSync(file, 'utf8').split(/\r?\n/)
        let inCode = false
        lines.forEach((line, index) => {
            if (/^\s*```/.test(line)) {
                inCode = !inCode
                return
            }
            if (inCode) {
                return
            }
            for (const match of line.replace(/`[^`]*`/g, '').matchAll(MD_LINK_RE)) {
                const raw = match[2]
                const anchor = raw.includes('#') ? raw.split('#').slice(1).join('#') : ''
                if (!anchor || /^L\d+$/.test(anchor)) {
                    continue
                }
                const target = raw.startsWith('#') ? file : resolveDocsPageTarget(file, raw, root)
                if (!target) {
                    continue
                }
                let decoded = anchor
                try {
                    decoded = decodeURIComponent(anchor)
                } catch {
                    // 保留原文
                }
                if (slugsOf(target).has(decoded)) {
                    continue
                }
                issues.push({
                    type: 'anchor-slug-mismatch',
                    file: relFile,
                    line: index + 1,
                    message: `锚点 #${anchor} 不在 ${relative(dirname(root), target).replaceAll('\\', '/')} 的 VitePress slug 中（实算 slug 见 docs:build 后的页面标题 id）`,
                })
            }
        })
    }
    return issues
}

/**
 * 执行两类规则，返回结果与受检面计数。
 *
 * @param {string} root 仓库根目录
 * @returns {Promise<{ anchorIssues: Array<object>, sidebarIssues: Array<object>, pageCount: number, anchorLinks: number, componentEntries: number, tableGroups: number }>} 检查结果
 */
export async function runDocsStructureCheck(root = docsProjectRoot) {
    const siteRoot = join(root, 'docs')
    const files = collectDocsMarkdownFiles(siteRoot)
    if (files.length === 0) {
        return {
            anchorIssues: [],
            sidebarIssues: [{ type: 'empty-scan', message: '未收集到任何文档页：拒绝以空扫描通过' }],
            pageCount: 0,
            anchorLinks: 0,
            componentEntries: 0,
            tableGroups: 0,
        }
    }
    const navigation = await loadSiteNavigation(siteRoot)
    const divergence = findSlugSourceDivergence(navigation.markdown)
    const sidebarIssues = []
    if (divergence) {
        sidebarIssues.push({ type: 'slug-source-diverged', message: divergence })
    }

    const { slugsOf } = await createSlugResolver(siteRoot)
    const anchorIssues = collectAnchorIssues(files, slugsOf, siteRoot)

    const designDoc = readFileSync(resolve(root, DESIGN_DOC), 'utf8')
    const tableGroups = parseComponentGroupTable(designDoc)
    sidebarIssues.push(...checkComponentSidebar(navigation.sidebar, tableGroups))

    const zhEntries = Array.isArray(navigation.sidebar[COMPONENT_SIDEBAR_KEYS.root])
        ? navigation.sidebar[COMPONENT_SIDEBAR_KEYS.root].slice(1, -1).reduce((sum, group) => sum + (group?.items?.length ?? 0), 0)
        : 0
    let anchorLinks = 0
    for (const file of files) {
        anchorLinks += countAnchorLinks(file)
    }
    if (zhEntries < MIN_COMPONENT_ENTRIES) {
        sidebarIssues.push({
            type: 'sidebar-scope-narrowed',
            message: `组件条目数 ${zhEntries} 低于下界 ${MIN_COMPONENT_ENTRIES}：怀疑 sidebar 解析面被静默收窄`,
        })
    }
    return {
        anchorIssues,
        sidebarIssues,
        pageCount: files.length,
        anchorLinks,
        componentEntries: zhEntries,
        tableGroups: tableGroups.length,
    }
}

function countAnchorLinks(file) {
    const lines = readFileSync(file, 'utf8').split(/\r?\n/)
    let inCode = false
    let count = 0
    for (const line of lines) {
        if (/^\s*```/.test(line)) {
            inCode = !inCode
            continue
        }
        if (inCode) {
            continue
        }
        for (const match of line.replace(/`[^`]*`/g, '').matchAll(MD_LINK_RE)) {
            const raw = match[2]
            if (/^(?:https?:|mailto:|tel:|\/\/)/.test(raw)) {
                continue
            }
            const anchor = raw.includes('#') ? raw.split('#').slice(1).join('#') : ''
            if (!anchor || /^L\d+$/.test(anchor)) {
                continue
            }
            if (raw.startsWith('#') || resolveDocsPageTarget(file, raw)) {
                count += 1
            }
        }
    }
    return count
}

/**
 * 校验命令行传入的目标目录：必须是含 `package.json` 的仓库根（本守卫按该根解析 `docs/` 与设计文档）。
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
        process.stderr.write(`[check-docs-structure] ${rootError}\n`)
        process.exitCode = 1
    } else {
        const result = await runDocsStructureCheck(targetRoot)
        const issues = [...result.sidebarIssues, ...result.anchorIssues]
        if (issues.length > 0) {
            for (const issue of issues) {
                const location = issue.file ? `${issue.file}:${issue.line}` : '<sidebar>'
                process.stderr.write(`${location}:${issue.type}: ${issue.message}\n`)
            }
            process.stderr.write(`[check-docs-structure] ${issues.length} 处问题（侧栏 ${result.sidebarIssues.length} / 锚点 ${result.anchorIssues.length}；受检 ${result.pageCount} 页 / ${result.anchorLinks} 条站内锚点链接 / ${result.componentEntries} 个组件条目）\n`)
            process.exitCode = 1
        } else {
            process.stdout.write(`[check-docs-structure] OK：${result.pageCount} 页锚点与 VitePress slug 一致，侧栏 ${result.tableGroups} 组 / ${result.componentEntries} 个组件条目符合 §11 登记\n`)
        }
    }
}
