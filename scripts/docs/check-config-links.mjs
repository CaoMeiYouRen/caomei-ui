#!/usr/bin/env node

/**
 * check-config-links：把 `themeConfig.nav` / `sidebar` 的链接纳入链接校验覆盖面。
 *
 * 为什么需要它：配置内链接此前只靠构建期的 VitePress dead-link 校验兜底——`docs:check`
 * 的链接面只遍历 `.md`，`pnpm lint:md:check` 与 `docs:check:links` 都看不到 `config.ts`；
 * 改错一条侧栏链接要等 `docs:build`（约 30 秒）才知道。本守卫把「路径存在 + 锚点有效」
 * 前移到 `docs:check`。
 *
 * 口径：
 * - 用 VitePress 的 `resolveConfig` 取**已解析**的 nav / sidebar（不静态解析 `config.ts`，
 *   否则计算式配置会被静默排除在受检面之外）；
 * - 配置链接必须是**站点绝对路径**（`/xxx`）；解析面含翻译物理路径（`docs/i18n/<locale>/`）；
 * - 锚点（如 `/components/button#用法`）按 VitePress 实算 slug 校验（同 `docs:check:structure`）；
 * - 外部链接（`http(s)` / `mailto` / `tel`）与非站点链接跳过。
 *
 * 用法：
 *   node scripts/docs/check-config-links.mjs [仓库根目录]
 */
import { readFileSync } from 'node:fs'
import { join, relative, resolve } from 'node:path'
import { isDirectExecution } from '../shared/cli.mjs'
import {
    EXTERNAL_LINK_RE,
    collectNavigationLinks,
    createSlugResolver,
    docsProjectRoot,
    findSlugSourceDivergence,
    loadSiteNavigation,
    resolveSitePath,
} from './vitepress-site.mjs'

/**
 * 校验单条配置链接。
 *
 * @param {{ locale: string, source: string, link: string }} entry 链接条目
 * @param {string} siteRoot 文档站根
 * @param {(file: string) => Set<string>} slugsOf slug 解析函数
 * @returns {Array<{ type: string, message: string }>} 问题列表
 */
export function checkConfigLink(entry, siteRoot, slugsOf) {
    const issues = []
    const location = `${entry.locale} / ${entry.source}`
    const raw = entry.link
    if (EXTERNAL_LINK_RE.test(raw)) {
        return issues
    }
    if (raw.startsWith('#')) {
        return [{ type: 'anchor-only-link', message: `${location}：配置链接不得使用纯锚点（${raw}），须为站点绝对路径` }]
    }
    const pathPart = raw.split('#')[0]
    // 外部链接（含协议相对）已在上方跳过，故此处只需判定站点绝对路径
    if (!pathPart.startsWith('/')) {
        return [{ type: 'non-site-absolute-link', message: `${location}：配置链接须为站点绝对路径（/xxx），实为 ${raw}` }]
    }
    if (pathPart.split('/').includes('..')) {
        return [{ type: 'path-traversal-link', message: `${location}：配置链接不得包含 .. 路径段（${raw}）` }]
    }
    const target = resolveSitePath(raw, siteRoot)
    if (!target) {
        return [{ type: 'missing-page', message: `${location}：链接目标不存在：${raw}` }]
    }
    const anchor = raw.includes('#') ? raw.split('#').slice(1).join('#') : ''
    if (!anchor) {
        return issues
    }
    let decoded = anchor
    try {
        decoded = decodeURIComponent(anchor)
    } catch {
        // 保留原文
    }
    if (!slugsOf(target).has(decoded)) {
        issues.push({
            type: 'anchor-slug-mismatch',
            message: `${location}：锚点 #${anchor} 不在 ${relative(docsProjectRoot, target).replaceAll('\\', '/')} 的 VitePress slug 中`,
        })
    }
    return issues
}

/**
 * 执行配置链接校验。
 *
 * @param {string} root 仓库根目录
 * @returns {Promise<{ issues: Array<object>, linkCount: number, navCount: number, sidebarCount: number }>} 检查结果
 */
export async function runConfigLinksCheck(root = docsProjectRoot) {
    const siteRoot = join(root, 'docs')
    const navigation = await loadSiteNavigation(siteRoot)
    const divergence = findSlugSourceDivergence(navigation.markdown)
    const issues = []
    if (divergence) {
        issues.push({ type: 'slug-source-diverged', message: divergence })
    }

    const links = collectNavigationLinks(navigation)
    if (links.length === 0) {
        return {
            issues: [...issues, { type: 'empty-scan', message: '未从 nav / sidebar 解析到任何链接：拒绝以空扫描通过' }],
            linkCount: 0,
            navCount: 0,
            sidebarCount: 0,
        }
    }
    const { slugsOf } = await createSlugResolver(siteRoot)
    for (const entry of links) {
        issues.push(...checkConfigLink(entry, siteRoot, slugsOf))
    }
    const navCount = links.filter((entry) => entry.source === 'nav').length
    const sidebarCount = links.length - navCount
    // 分面非空下限：只拦「总数为 0」会漏掉「一类整体丢失、另一类撑住总数」的静默收窄
    if (navCount === 0) {
        issues.push({ type: 'empty-nav-scan', message: '未从 nav 解析到任何链接：拒绝以空扫描通过' })
    }
    if (sidebarCount === 0) {
        issues.push({ type: 'empty-sidebar-scan', message: '未从 sidebar 解析到任何链接：拒绝以空扫描通过' })
    }
    return { issues, linkCount: links.length, navCount, sidebarCount }
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
        process.stderr.write(`[check-config-links] ${rootError}\n`)
        process.exitCode = 1
    } else {
        const { issues, linkCount, navCount, sidebarCount } = await runConfigLinksCheck(targetRoot)
        if (issues.length > 0) {
            for (const issue of issues) {
                process.stderr.write(`config:${issue.type}: ${issue.message}\n`)
            }
            process.stderr.write(`[check-config-links] ${issues.length} 处问题（受检 ${linkCount} 条配置链接：nav ${navCount} / sidebar ${sidebarCount}）\n`)
            process.exitCode = 1
        } else {
            process.stdout.write(`[check-config-links] OK：${linkCount} 条 nav / sidebar 链接（nav ${navCount} / sidebar ${sidebarCount}）均指向存在的页面且锚点有效\n`)
        }
    }
}
