import { spawnSync } from 'node:child_process'
import { existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { afterAll, describe, expect, it } from 'vitest'
import { createSlugResolver, normalizeSidebar } from './vitepress-site.mjs'
import { checkConfigLink, resolveTargetRoot, runConfigLinksCheck } from './check-config-links.mjs'

/** 自工作目录向上定位仓库根（以 `.github/skills` 为锚点）。 */
function resolveRepoRoot() {
    let dir = process.cwd()
    while (!existsSync(join(dir, '.github/skills'))) {
        const parent = dirname(dir)
        if (parent === dir) {
            throw new Error('未能定位仓库根目录')
        }
        dir = parent
    }
    return dir
}

const PROJECT_ROOT = resolveRepoRoot()
const SCRIPT_PATH = join(PROJECT_ROOT, 'scripts/docs/check-config-links.mjs')

const tempDirs = []

afterAll(() => {
    for (const dir of tempDirs) {
        rmSync(dir, { recursive: true, force: true })
    }
})

function createFixture(files) {
    const dir = mkdtempSync(join(tmpdir(), 'check-config-links-'))
    tempDirs.push(dir)
    for (const [relativePath, content] of Object.entries(files)) {
        const file = join(dir, relativePath)
        mkdirSync(dirname(file), { recursive: true })
        writeFileSync(file, content)
    }
    return dir
}

/** 站点夹具：含导航配置与页面，供单条链接与整体检查复用。 */
function createSiteFixture(configBody) {
    return createFixture({
        'docs/index.md': '# 首页\n',
        'docs/guide/a.md': '# a\n\n## 1. 小节\n',
        'docs/i18n/en-US/guide/a.md': '# a\n',
        'docs/.vitepress/config.mjs': `export default {\n  themeConfig: ${configBody},\n}\n`,
    })
}

describe('checkConfigLink', () => {
    it('外部链接与合法站点链接放行', async () => {
        const root = createSiteFixture('{}')
        const siteRoot = join(root, 'docs')
        const { slugsOf } = await createSlugResolver(siteRoot)
        expect(checkConfigLink({ locale: 'root', source: 'nav', link: 'https://example.com' }, siteRoot, slugsOf)).toEqual([])
        expect(checkConfigLink({ locale: 'root', source: 'nav', link: '/guide/a' }, siteRoot, slugsOf)).toEqual([])
        expect(checkConfigLink({ locale: 'root', source: 'nav', link: '/guide/a#_1-小节' }, siteRoot, slugsOf)).toEqual([])
        expect(checkConfigLink({ locale: 'en-US', source: 'nav', link: '/en-US/guide/a' }, siteRoot, slugsOf)).toEqual([])
    })

    it('纯锚点、非站点绝对路径、目标缺失、锚点失效逐类报出', async () => {
        const root = createSiteFixture('{}')
        const siteRoot = join(root, 'docs')
        const { slugsOf } = await createSlugResolver(siteRoot)
        const types = (link) => checkConfigLink({ locale: 'root', source: 'nav', link }, siteRoot, slugsOf).map((issue) => issue.type)
        expect(types('#top')).toEqual(['anchor-only-link'])
        expect(types('guide/a')).toEqual(['non-site-absolute-link'])
        expect(types('/missing/page')).toEqual(['missing-page'])
        expect(types('/guide/a#不存在')).toEqual(['anchor-slug-mismatch'])
    })

    it('越出 docs/ 的站点绝对路径不得被放行，协议相对链接按外部跳过', async () => {
        const root = createSiteFixture('{}')
        const siteRoot = join(root, 'docs')
        const { slugsOf } = await createSlugResolver(siteRoot)
        const types = (link) => checkConfigLink({ locale: 'root', source: 'nav', link }, siteRoot, slugsOf).map((issue) => issue.type)
        expect(types('/../package.json')).toEqual(['path-traversal-link'])
        expect(types('/../docs/guide/a.md')).toEqual(['path-traversal-link'])
        expect(types('/guide/../../package.json')).toEqual(['path-traversal-link'])
        expect(checkConfigLink({ locale: 'root', source: 'nav', link: '//example.com/x' }, siteRoot, slugsOf)).toEqual([])
    })
})

describe('normalizeSidebar', () => {
    it('数组形态（顶层 / locale 级）归一为对象形态，链接不被吞', () => {
        expect(normalizeSidebar(undefined)).toEqual({})
        expect(normalizeSidebar({ '/guide/': [] })).toEqual({ '/guide/': [] })
        expect(normalizeSidebar([{ text: 'A', link: '/guide/a' }])).toEqual({ '/': [{ text: 'A', link: '/guide/a' }] })
        expect(normalizeSidebar([{ text: 'A' }], 'en-US')).toEqual({ '/en-US/': [{ text: 'A' }] })
    })
})

describe('runConfigLinksCheck', () => {
    it('夹具站点中的坏链接被报出，好链接计入受检面', async () => {
        const root = createSiteFixture(
            `{ nav: [{ text: 'A', link: '/guide/a' }, { text: 'Bad', link: '/missing/page' }], sidebar: { '/guide/': [{ text: 'A', link: '/guide/a#_1-小节' }] } }`,
        )
        const result = await runConfigLinksCheck(root)
        expect(result.issues.map((issue) => issue.type)).toEqual(['missing-page'])
        expect(result.linkCount).toBe(3)
        expect(result.navCount).toBe(2)
        expect(result.sidebarCount).toBe(1)
    })

    it('解析不到任何链接时按失败报出（拒绝空扫描通过）', async () => {
        const root = createSiteFixture('{}')
        const result = await runConfigLinksCheck(root)
        expect(result.issues.map((issue) => issue.type)).toEqual(['empty-scan'])
        expect(result.linkCount).toBe(0)
    })

    it('数组形态 sidebar（顶层 + locale 级）的链接计入受检面', async () => {
        const root = createFixture({
            'docs/index.md': '# 首页\n',
            'docs/guide/a.md': '# a\n\n## 1. 小节\n',
            'docs/i18n/en-US/guide/a.md': '# a\n',
            'docs/.vitepress/config.mjs': `export default {
  themeConfig: {
    nav: [{ text: 'A', link: '/guide/a' }],
    sidebar: [{ text: 'A', link: '/guide/a' }, { text: 'B', items: [{ text: 'C', link: '/guide/a#_1-小节' }] }],
  },
  locales: {
    'en-US': { themeConfig: { nav: [{ text: 'A', link: '/en-US/guide/a' }], sidebar: [{ text: 'A', link: '/en-US/guide/a' }] } },
  },
}
`,
        })
        const result = await runConfigLinksCheck(root)
        expect(result.navCount).toBe(2)
        expect(result.sidebarCount).toBe(3)
        expect(result.issues).toEqual([])
    })

    it('nav 有链接而 sidebar 为空时按分面空扫描报出', async () => {
        const root = createSiteFixture(`{ nav: [{ text: 'A', link: '/guide/a' }] }`)
        const result = await runConfigLinksCheck(root)
        expect(result.issues.map((issue) => issue.type)).toEqual(['empty-sidebar-scan'])
        expect(result.sidebarCount).toBe(0)
    })

    it('sidebar 有链接而 nav 为空时按分面空扫描报出', async () => {
        const root = createSiteFixture(`{ sidebar: { '/guide/': [{ text: 'A', link: '/guide/a' }] } }`)
        const result = await runConfigLinksCheck(root)
        expect(result.issues.map((issue) => issue.type)).toEqual(['empty-nav-scan'])
        expect(result.navCount).toBe(0)
    })

    it('站点自定义 anchor.slugify 时报出分叉（不静默漂移）', async () => {
        const root = createFixture({
            'docs/index.md': '# 首页\n',
            'docs/.vitepress/config.mjs': 'export default { markdown: { anchor: { slugify: (value) => String(value) } } }\n',
        })
        const result = await runConfigLinksCheck(root)
        expect(result.issues.map((issue) => issue.type)).toContain('slug-source-diverged')
    })
})

describe('resolveTargetRoot', () => {
    it('未知参数与非仓库目录按错误返回，含 package.json 者被接受', () => {
        expect(resolveTargetRoot('--verbose').error).toContain('不支持的参数')
        expect(resolveTargetRoot(join(tmpdir(), 'missing-root-xyz')).error).toContain('不是仓库根')
        const root = createFixture({ 'package.json': '{}' })
        expect(resolveTargetRoot(root, '/repo')).toEqual({ root, error: null })
    })
})

describe('CLI 退出码', () => {
    it('非法目标目录按失败退出', () => {
        const missing = spawnSync(process.execPath, [SCRIPT_PATH, join(tmpdir(), 'missing-root-xyz')], { encoding: 'utf8' })
        expect(missing.status).toBe(1)
        expect(missing.stderr).toContain('不是仓库根')
    })

    it('仓库自身通过时 exit 0 并打印受检面计数', () => {
        const result = spawnSync(process.execPath, [SCRIPT_PATH], { encoding: 'utf8' })
        expect(result.status).toBe(0)
        expect(result.stdout).toContain('均指向存在的页面且锚点有效')
    })
})

describe('仓库不变量', () => {
    it('受检范围未被静默收窄，且当前仓库零问题', async () => {
        const result = await runConfigLinksCheck(PROJECT_ROOT)
        expect(result.linkCount).toBeGreaterThanOrEqual(100)
        expect(result.navCount).toBeGreaterThanOrEqual(5)
        expect(result.sidebarCount).toBeGreaterThanOrEqual(100)
        expect(result.issues).toEqual([])
    })
})
