#!/usr/bin/env node

/**
 * check-i18n-parity：英文文档的 **parity** 与 **结构新鲜度** 守卫。
 *
 * 依据[文档与演示站 §10]：「同步范围」= 英文版最终与中文版保持同步的范围**仅限「指南」与
 * 「组件介绍」**（按批次推进）；设计 / 规范 / 规划等保持骨架 / 中文源，不承诺持续翻译。
 *
 * 规则（全部可判定、全部两向）：
 * 1. `missing-translation`——同步范围内的中文页必须有英文版；确属暂缓者登记在
 *    `MISSING_TRANSLATION_EXEMPTIONS`。**反向**：已登记的豁免若已补齐英文版 → `stale-exemption`（防清单腐烂）。
 * 2. `orphan-translation`——英文页必须有中文源页；纯英文区落地页登记在 `EN_ONLY_PAGES`。
 *    **反向**：登记的落地页若已有中文源页 → `stale-en-only`。
 * 3. `structure-drift`——已配对页面的 H2/H3 章节数必须一致；确属有意差异者登记在
 *    `STRUCTURE_EXEMPTIONS`。**反向**：登记项若已一致 → `stale-structure-exemption`。
 * 4. 受检范围未被静默收窄——同步范围注册表为单一事实源，另设页面数下界、**逐前缀下限**与空扫描拒绝；
 *    三类登记表的键须落在同步范围内且对应源文件存在，由仓库不变量测试断言。
 *
 * 口径说明（为什么用「结构新鲜度」而非时间戳）：内容级新鲜度（按 git 提交时间比对中英两版）
 * 依赖**完整历史**，在浅克隆 CI 下会静默失效（`git log -1` 对所有文件返回同一提交时间）；
 * 故门禁面取「章节数」这一可机检代理——它能拦住「中文加了 / 删了章节而英文没跟」这类
 * 最常见漂移，而措辞级差异不在门禁面（本地实测 3 对页面中文晚于英文，属提示性观察，未入门禁）。
 *
 * 用法：
 *   node scripts/docs/check-i18n-parity.mjs [仓库根目录]
 */
import { readFileSync } from 'node:fs'
import { join, relative, resolve } from 'node:path'
import { isDirectExecution } from '../shared/cli.mjs'
import { collectDocsMarkdownFiles, docsProjectRoot } from './vitepress-site.mjs'

/** 同步范围（§10）：页面相对路径前缀。 */
export const SYNC_SCOPE_PREFIXES = ['guide/', 'components/']
/** 翻译物理路径下的语言目录（当前仅 en-US）。 */
export const TRANSLATION_LOCALE = 'en-US'
/** 同步范围内页面数的下界（防「范围被静默收窄」）。 */
export const MIN_SCOPE_PAGES = 50

/** 同步范围内暂缓翻译的页面（键为中文源页相对路径，值为理由）。当前为空。 */
export const MISSING_TRANSLATION_EXEMPTIONS = {}

/** 纯英文区落地页（无中文源页；键为英文页相对路径，值为理由）。 */
export const EN_ONLY_PAGES = {
    'plan/index.md': '英文规划落地页：规划文档保持中文源（§10 同步范围外），该页为英文入口并链向中文源页',
}

/** 结构差异豁免（键为页面相对路径，值为理由）。 */
export const STRUCTURE_EXEMPTIONS = {
    'components/index.md': '英文概览页按翻译覆盖组织（只列已翻译页），与中文的分组列表结构不同（§10）',
    'guide/release.md': '英文版按主题重组并合并章节，非逐节对译',
}

/**
 * 是否属于 §10 的同步范围。
 *
 * @param {string} page 页面相对路径
 * @param {string[]} prefixes 同步范围前缀（默认取注册表）
 * @returns {boolean} 是否在范围内
 */
export function isInSyncScope(page, prefixes = SYNC_SCOPE_PREFIXES) {
    return prefixes.some((prefix) => page.startsWith(prefix))
}

/**
 * 收集中文页与翻译页的相对路径集合。
 *
 * @param {string} docsRoot 文档站根
 * @returns {{ zhPages: string[], enPages: string[] }} 页面集合
 */
export function collectPageSets(docsRoot) {
    const zhPages = collectDocsMarkdownFiles(docsRoot)
        .map((file) => relative(docsRoot, file).replaceAll('\\', '/'))
        .filter((page) => !page.startsWith('i18n/'))
    const enRoot = join(docsRoot, 'i18n', TRANSLATION_LOCALE)
    const enPages = collectDocsMarkdownFiles(enRoot).map((file) => relative(enRoot, file).replaceAll('\\', '/'))
    return { zhPages, enPages }
}

/**
 * 统计围栏外的 H2 / H3 章节数（结构新鲜度口径）。
 *
 * 口径边界：本仓围栏风格为三反引号；`~~~` 围栏与四反引号嵌套不在解析面（当前全库零使用，
 * 见文档与演示站 §10 的口径说明）。若将来引入这两种写法，需改为复用 VitePress 渲染结果。
 */
export function countSections(content) {
    const lines = content.split(/\r?\n/u)
    let inCode = false
    let h2 = 0
    let h3 = 0
    for (const line of lines) {
        if (/^\s*```/u.test(line)) {
            inCode = !inCode
            continue
        }
        if (inCode) {
            continue
        }
        if (/^##\s/u.test(line)) {
            h2 += 1
        } else if (/^###\s/u.test(line)) {
            h3 += 1
        }
    }
    return { h2, h3 }
}

/**
 * parity 对账（缺翻译 / 孤儿翻译 + 两个反向腐烂检查）。
 *
 * @param {string[]} zhPages 中文页相对路径
 * @param {string[]} enPages 英文页相对路径
 * @param {{ missingExemptions?: Record<string, string>, enOnlyPages?: Record<string, string>, syncScopePrefixes?: string[] }} [registries] 便于单测注入的登记表
 * @returns {Array<{ type: string, page: string, message: string }>} 问题列表
 */
export function findParityIssues(zhPages, enPages, registries = {}) {
    const missingExemptions = registries.missingExemptions ?? MISSING_TRANSLATION_EXEMPTIONS
    const enOnlyPages = registries.enOnlyPages ?? EN_ONLY_PAGES
    const prefixes = registries.syncScopePrefixes ?? SYNC_SCOPE_PREFIXES
    const issues = []
    const zhSet = new Set(zhPages)
    const enSet = new Set(enPages)

    for (const page of zhPages.filter((entry) => isInSyncScope(entry, prefixes))) {
        if (!enSet.has(page) && !missingExemptions[page]) {
            issues.push({ type: 'missing-translation', page, message: `同步范围内的中文页缺少英文版（${TRANSLATION_LOCALE}）：${page}` })
        }
    }
    for (const page of Object.keys(missingExemptions)) {
        if (enSet.has(page)) {
            issues.push({ type: 'stale-exemption', page, message: `豁免项已补齐英文版，请删除登记：${page}` })
        } else if (!zhSet.has(page)) {
            issues.push({ type: 'stale-exemption', page, message: `豁免项登记的中文页已不存在，请删除登记：${page}` })
        }
    }
    for (const page of enPages) {
        if (!zhSet.has(page) && !enOnlyPages[page]) {
            issues.push({ type: 'orphan-translation', page, message: `英文页缺少中文源页：${page}` })
        }
    }
    for (const page of Object.keys(enOnlyPages)) {
        if (zhSet.has(page)) {
            issues.push({ type: 'stale-en-only', page, message: `登记的英文区落地页已有中文源页，请删除登记：${page}` })
        } else if (!enSet.has(page)) {
            issues.push({ type: 'stale-en-only', page, message: `登记的英文区落地页已不存在，请删除登记：${page}` })
        }
    }
    return issues
}

/**
 * 结构新鲜度对账（章节数一致性 + 豁免腐烂检查）。
 *
 * @param {Array<{ page: string, zh: string, en: string }>} pairs 已配对页面的内容
 * @param {Record<string, string>} [exemptions] 便于单测注入的结构差异登记表
 * @returns {Array<{ type: string, page: string, message: string }>} 问题列表
 */
export function findStructureDrift(pairs, exemptions = STRUCTURE_EXEMPTIONS) {
    const issues = []
    const driftedPages = new Set()
    for (const { page, zh, en } of pairs) {
        const zhSections = countSections(zh)
        const enSections = countSections(en)
        const drifted = zhSections.h2 !== enSections.h2 || zhSections.h3 !== enSections.h3
        if (!drifted) {
            continue
        }
        driftedPages.add(page)
        if (!exemptions[page]) {
            issues.push({
                type: 'structure-drift',
                page,
                message: `章节数与中文版不一致（zh h2 ${zhSections.h2} / h3 ${zhSections.h3}；en h2 ${enSections.h2} / h3 ${enSections.h3}）：${page}`,
            })
        }
    }
    // 反向校验遍历**登记表键**：豁免项已一致，或已不在受检对中（改名 / 英文页被删）均须清理
    for (const page of Object.keys(exemptions)) {
        const paired = pairs.some((pair) => pair.page === page)
        if (!paired) {
            issues.push({ type: 'stale-structure-exemption', page, message: `结构豁免项已不在受检对中（页面改名或英文版缺失），请删除登记：${page}` })
        } else if (!driftedPages.has(page)) {
            issues.push({ type: 'stale-structure-exemption', page, message: `结构豁免项已与中文版一致，请删除登记：${page}` })
        }
    }
    return issues
}

/**
 * 执行 parity 与结构新鲜度检查。
 *
 * @param {string} root 仓库根目录
 * @param {{ minScopePages?: number, syncScopePrefixes?: string[], missingExemptions?: Record<string, string>, enOnlyPages?: Record<string, string>, structureExemptions?: Record<string, string> }} [options] 便于单测放宽下界 / 注入范围前缀与登记表
 * @returns {{ issues: Array<object>, zhPages: number, enPages: number, scopedPages: number, pairs: number }} 检查结果
 */
export function runI18nParityCheck(root = docsProjectRoot, options = {}) {
    const minScopePages = options.minScopePages ?? MIN_SCOPE_PAGES
    const prefixes = options.syncScopePrefixes ?? SYNC_SCOPE_PREFIXES
    const missingExemptions = options.missingExemptions ?? MISSING_TRANSLATION_EXEMPTIONS
    const enOnlyPages = options.enOnlyPages ?? EN_ONLY_PAGES
    const structureExemptions = options.structureExemptions ?? STRUCTURE_EXEMPTIONS
    const docsRoot = join(root, 'docs')
    const { zhPages, enPages } = collectPageSets(docsRoot)
    if (zhPages.length === 0 || enPages.length === 0) {
        return {
            issues: [{ type: 'empty-scan', page: '', message: '未收集到中文页或英文页：拒绝以空扫描通过' }],
            zhPages: zhPages.length,
            enPages: enPages.length,
            scopedPages: 0,
            pairs: 0,
        }
    }
    const scopedPages = zhPages.filter((page) => isInSyncScope(page, prefixes))
    const issues = [...findParityIssues(zhPages, enPages, { syncScopePrefixes: prefixes, missingExemptions, enOnlyPages })]

    const enSet = new Set(enPages)
    const pairs = scopedPages
        .filter((page) => enSet.has(page))
        .map((page) => ({
            page,
            zh: readFileSync(join(docsRoot, page), 'utf8'),
            en: readFileSync(join(docsRoot, 'i18n', TRANSLATION_LOCALE, page), 'utf8'),
        }))
    issues.push(...findStructureDrift(pairs, structureExemptions))

    if (scopedPages.length < minScopePages) {
        issues.push({
            type: 'scope-narrowed',
            page: '',
            message: `同步范围内的中文页仅 ${scopedPages.length} 页，低于下界 ${minScopePages}：怀疑受检范围被静默收窄`,
        })
    }
    // 逐前缀下限：只设总数下界时，「某个前缀整体移出范围」会被另一前缀的页数掩盖
    for (const prefix of prefixes) {
        if (!scopedPages.some((page) => page.startsWith(prefix))) {
            issues.push({
                type: 'scope-prefix-empty',
                page: '',
                message: `同步范围前缀「${prefix}」下没有任何中文页：受检范围疑似被静默收窄`,
            })
        }
    }
    return { issues, zhPages: zhPages.length, enPages: enPages.length, scopedPages: scopedPages.length, pairs: pairs.length }
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
        process.stderr.write(`[check-i18n-parity] ${rootError}\n`)
        process.exitCode = 1
    } else {
        const { issues, zhPages, enPages, scopedPages, pairs } = runI18nParityCheck(targetRoot)
        if (issues.length > 0) {
            for (const issue of issues) {
                process.stderr.write(`${issue.page || '<scope>'}:${issue.type}: ${issue.message}\n`)
            }
            process.stderr.write(`[check-i18n-parity] ${issues.length} 处问题（中文 ${zhPages} / 英文 ${enPages} 页；同步范围 ${scopedPages} 页 / 已配对 ${pairs} 对）\n`)
            process.exitCode = 1
        } else {
            process.stdout.write(`[check-i18n-parity] OK：同步范围 ${scopedPages} 页全部有英文版，${pairs} 对页面已对账（其中 ${Object.keys(STRUCTURE_EXEMPTIONS).length} 对为登记的结构差异；中文 ${zhPages} / 英文 ${enPages} 页，登记豁免均仍有效）\n`)
        }
    }
}
