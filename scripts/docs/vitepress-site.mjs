/**
 * vitepress-site：文档站（VitePress）解析工具。
 *
 * slug 生成、路由与配置解析都是 VitePress 的实现细节；自行复刻会在其小版本升级后
 * 静默漂移（本仓已有先例：`looseNorm` 通过 ≠ 锚点有效）。本模块直接调用 VitePress
 * 的渲染器与配置解析器，保证守卫与站点实际行为同源。
 *
 * slug 来源口径（改动前必读）：`createMarkdownRenderer` 内部**硬编码** VitePress 自带的
 * slugify，并在其后展开站点的 `markdown.anchor` —— 故唯一会与本守卫分叉的配置是
 * **自定义 `markdown.anchor.slugify`**，由 `findSlugSourceDivergence()` 显式拦截（不静默漂移）。
 * 站点 `markdown.config` 钩子（本仓注册 demo 插件）不参与：它依赖 Vite 管线，且不改变标题 id。
 * 另注：VitePress 的 `createMarkdownRenderer` 是**模块级单例**（内部 `if (md) return md`），
 * 同一进程内只有首次调用的参数生效；消费方不要指望第二次传入不同的 options 会改变行为。
 *
 * 消费方：`check-docs-structure.mjs`（锚点 / 侧栏不变式）；`collectNavigationLinks` 供
 * nav / sidebar 链接校验复用。
 */
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { dirname, isAbsolute, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createMarkdownRenderer, resolveConfig } from 'vitepress'

/** 仓库根（由本模块位置推导，不依赖 cwd）。 */
export const docsProjectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..')
/** 文档站根（VitePress root）。 */
export const docsRoot = join(docsProjectRoot, 'docs')
/** 文档翻译的物理路径根：`docs/i18n/<locale>/`。 */
export const i18nRoot = join(docsRoot, 'i18n')

/** 外部链接谓词（含协议相对 `//host`）；站内锚点/页面链接的判定不复用本常量。 */
export const EXTERNAL_LINK_RE = /^(?:https?:|mailto:|tel:|\/\/)/

/** 非文档页的目录（站点产物 / 依赖）。 */
export const DOCS_EXCLUDED_DIRS = new Set(['.vitepress', 'node_modules'])

/** 文档站当前登记的 locale（与 config.ts 的 locales 对齐）。 */
export const SITE_LOCALES = ['root', 'en-US']

/**
 * 收集站点页面（`docs/**` 下的 markdown，含 `i18n/`）。
 *
 * @param {string} root 文档站根
 * @returns {string[]} 绝对路径列表（已排序）
 */
export function collectDocsMarkdownFiles(root = docsRoot) {
    const files = []
    const walk = (dir) => {
        for (const entry of readdirSync(dir, { withFileTypes: true })) {
            if (entry.name.startsWith('.') || DOCS_EXCLUDED_DIRS.has(entry.name)) {
                continue
            }
            const full = join(dir, entry.name)
            if (entry.isDirectory()) {
                walk(full)
            } else if (entry.name.endsWith('.md')) {
                files.push(full)
            }
        }
    }
    if (existsSync(root)) {
        walk(root)
    }
    return files.sort()
}

/**
 * slug 来源分叉检测：站点若自定义 `markdown.anchor.slugify`，本守卫的实算结果会与站点分叉。
 *
 * @param {Record<string, unknown>} markdownOptions 已解析配置的 `markdown` 选项
 * @returns {string | null} 分叉说明（无分叉时返回 null）
 */
export function findSlugSourceDivergence(markdownOptions) {
    const anchor = markdownOptions?.anchor
    if (anchor && (typeof anchor.slugify === 'function' || typeof anchor.slugifyWithState === 'function')) {
        return '站点自定义了 markdown.anchor.slugify：守卫的实算 slug 需同步扩展（见 docs/design/documentation-site.md §13）'
    }
    return null
}

/**
 * 创建 slug 解析器：按 VitePress 实算结果返回某页的标题 slug 集合（带缓存）。
 *
 * `root` 作为 srcDir 传给 VitePress（用于 snippet 等路径解析）；站点的 markdown 选项
 * **不传入**（见模块 docstring：`markdown.config` 钩子不参与、自定义 `anchor.slugify` 由
 * `findSlugSourceDivergence` 显式拦截）。
 *
 * @param {string} root 文档站根（srcDir）
 * @returns {Promise<{ slugsOf: (file: string) => Set<string> }>} 解析器
 */
export async function createSlugResolver(root = docsRoot) {
    const renderer = await createMarkdownRenderer(root)
    const cache = new Map()
    return {
        slugsOf(file) {
            if (!cache.has(file)) {
                const html = renderer.render(readFileSync(file, 'utf8'))
                const slugs = new Set()
                for (const match of html.matchAll(/<h[1-6] id="([^"]*)"/g)) {
                    slugs.add(decodeURIComponent(match[1]))
                }
                cache.set(file, slugs)
            }
            return cache.get(file)
        },
    }
}

/**
 * 站点绝对路径的页面候选（含翻译物理路径 `docs/i18n/<locale>/`）。
 *
 * @param {string} root 文档站根
 * @param {string} sitePath 去掉前导 `/` 的站点路径
 * @returns {string[]} 候选绝对路径
 */
function buildSitePageCandidates(root, sitePath) {
    const i18nDir = join(root, 'i18n')
    return [
        join(root, sitePath),
        join(root, `${sitePath}.md`),
        join(root, sitePath, 'index.md'),
        join(i18nDir, sitePath),
        join(i18nDir, `${sitePath}.md`),
        join(i18nDir, sitePath, 'index.md'),
    ]
}

/**
 * 取候选中的第一个**存在且未越出站点根**的页面文件（越界候选一律跳过，防 `docs/` 外的路径被放行）。
 *
 * @param {string} root 文档站根
 * @param {string[]} candidates 候选绝对路径
 * @returns {string | null} 目标文件绝对路径
 */
function firstExistingPage(root, candidates) {
    for (const candidate of candidates) {
        if (!existsSync(candidate) || !statSync(candidate).isFile()) {
            continue
        }
        if (relative(root, candidate).startsWith('..')) {
            continue
        }
        return candidate
    }
    return null
}

/**
 * 把 markdown 链接目标解析为**站点页面**的绝对路径。
 *
 * 口径与 `check-links.mjs` 一致：兼容相对路径、省略 `.md`、站点根路径（`/xxx`）
 * 与翻译物理路径（`docs/i18n/<locale>/`）；目标越出 `docs/` 或不存在时返回 null
 * （越界链接由 `docs:build` 的 dead-link 校验兜底，见文档与演示站 §13）。
 *
 * @param {string} fromFile 链接所在文件的绝对路径
 * @param {string} raw 原始链接目标
 * @param {string} root 文档站根（便于单测注入夹具）
 * @returns {string | null} 目标文件绝对路径
 */
export function resolveDocsPageTarget(fromFile, raw, root = docsRoot) {
    if (raw.startsWith('#') || EXTERNAL_LINK_RE.test(raw)) {
        return null
    }
    const pathPart = raw.split('#')[0].trim().split(/\s+/)[0]
    if (!pathPart) {
        return null
    }
    if (pathPart.startsWith('/')) {
        if (relative(root, fromFile).startsWith('..')) {
            return null
        }
        return firstExistingPage(root, buildSitePageCandidates(root, pathPart.replace(/^\//, '')))
    }
    if (isAbsolute(pathPart)) {
        return null
    }
    const absolute = resolve(dirname(fromFile), pathPart)
    return firstExistingPage(root, [absolute, `${absolute}.md`, join(absolute, 'index.md')])
}

/**
 * 把**站点绝对路径**（`/xxx`，配置内 nav / sidebar 的链接形态）解析为站点页面的绝对路径。
 *
 * 与 `resolveDocsPageTarget` 的差别：没有「来源文件」，故不接受相对路径与 `.md` 省略以外的
 * 省略写法（配置链接按 VitePress 约定必须是站点绝对路径）；解析面同样含翻译物理路径，
 * 并同样做越界收敛。
 *
 * @param {string} raw 原始链接目标
 * @param {string} root 文档站根
 * @returns {string | null} 目标文件绝对路径
 */
export function resolveSitePath(raw, root = docsRoot) {
    if (raw.startsWith('#') || EXTERNAL_LINK_RE.test(raw)) {
        return null
    }
    const pathPart = raw.split('#')[0].trim().split(/\s+/)[0]
    if (!pathPart || !pathPart.startsWith('/') || pathPart.startsWith('//')) {
        return null
    }
    return firstExistingPage(root, buildSitePageCandidates(root, pathPart.replace(/^\//, '')))
}

/**
 * 读取**已解析**的站点配置（含 locale 级 `nav` / `sidebar`）。
 *
 * 用 VitePress 的 `resolveConfig` 而非静态解析 `config.ts`：后者无法覆盖计算式配置，
 * 会把「受检范围」静默收窄成「正则能匹配到的那些链接」。
 *
 * @param {string} root 文档站根
 * @returns {Promise<{ locales: string[], nav: Record<string, unknown[]>, sidebar: Record<string, unknown>, markdown: Record<string, unknown> }>} 站点导航配置与 markdown 选项
 */
export async function loadSiteNavigation(root = docsRoot) {
    const config = await resolveConfig(root, {}, 'build')
    const site = config.site
    const nav = { root: site.themeConfig?.nav ?? [] }
    const sidebar = normalizeSidebar(site.themeConfig?.sidebar, 'root')
    for (const locale of SITE_LOCALES) {
        if (locale === 'root') {
            continue
        }
        const localeConfig = site.locales?.[locale]?.themeConfig ?? {}
        nav[locale] = localeConfig.nav ?? []
        Object.assign(sidebar, normalizeSidebar(localeConfig.sidebar, locale))
    }
    return { locales: [...SITE_LOCALES], nav, sidebar, markdown: config.markdown ?? {} }
}

/**
 * 归一化侧栏形态：VitePress 支持**对象形态**（`SidebarMulti`：路径前缀 → 条目数组）与
 * **数组形态**（单一侧栏，顶层或 locale 级）。数组若不归一会被后续展平逻辑当成伪分组，
 * 其顶层 `link` 会被静默吞掉（受检面静默收窄）。
 *
 * @param {unknown} sidebar 站点配置中的 sidebar
 * @param {string} locale locale 标识（`root` 或语言标签）
 * @returns {Record<string, unknown>} 归一化后的对象形态侧栏
 */
export function normalizeSidebar(sidebar, locale = 'root') {
    if (!sidebar || typeof sidebar !== 'object') {
        return {}
    }
    if (Array.isArray(sidebar)) {
        return { [locale === 'root' ? '/' : `/${locale}/`]: sidebar }
    }
    return { ...sidebar }
}

/**
 * 展平 nav / sidebar 中的全部 `link`（保留来源描述，供报告定位）。
 *
 * @param {{ nav: Record<string, unknown[]>, sidebar: Record<string, unknown> }} navigation 站点导航配置
 * @returns {Array<{ locale: string, source: string, link: string }>} 链接清单
 */
export function collectNavigationLinks(navigation) {
    const links = []

    const visitItems = (items, locale, source) => {
        for (const item of items ?? []) {
            if (!item || typeof item !== 'object') {
                continue
            }
            if (typeof item.link === 'string' && item.link.length > 0) {
                links.push({ locale, source, link: item.link })
            }
            if (Array.isArray(item.items)) {
                visitItems(item.items, locale, source)
            }
        }
    }

    for (const [locale, navGroups] of Object.entries(navigation.nav)) {
        for (const group of navGroups ?? []) {
            if (group?.link) {
                links.push({ locale, source: 'nav', link: group.link })
            }
            if (Array.isArray(group?.items)) {
                visitItems(group.items, locale, 'nav')
            }
        }
    }
    for (const [key, value] of Object.entries(navigation.sidebar)) {
        const locale = SITE_LOCALES.find((entry) => entry !== 'root' && key.startsWith(`/${entry}/`)) ?? 'root'
        const groups = Array.isArray(value) ? value : Object.entries(value ?? {}).map(([text, items]) => ({ text, items }))
        for (const group of groups) {
            if (group?.link) {
                links.push({ locale, source: `sidebar(${key})`, link: group.link })
            }
            visitItems(group?.items, locale, `sidebar(${key})`)
        }
    }
    return links
}
