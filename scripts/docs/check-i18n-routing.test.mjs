import { existsSync, mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { ROUTING_CASES, checkPage, collectHrefsForLabel } from './check-i18n-routing.mjs'

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

const desktopAnchor =
    '<a class="VPLink link" href="/en-US/components/locale"><!--[--><span>English</span><!--]--></a>'
const mobileAnchor = '<a class="link" href="/en-US/components/locale">English</a>'
const tabletAnchor =
    '<a class="VPLink link" href="/en-US/components/locale"><span>English</span></a>'

describe('collectHrefsForLabel', () => {
    it('提取默认主题三种菜单标记下的链接', () => {
        const html = `<nav>${desktopAnchor}${mobileAnchor}${tabletAnchor}</nav>`

        expect(collectHrefsForLabel(html, 'English')).toEqual([
            '/en-US/components/locale',
            '/en-US/components/locale',
            '/en-US/components/locale',
        ])
    })

    it('只收集文本完全匹配的锚点', () => {
        const html = '<a href="/en-US/">English</a><a href="/components/locale">简体中文</a>'

        expect(collectHrefsForLabel(html, '简体中文')).toEqual(['/components/locale'])
        expect(collectHrefsForLabel(html, 'Deutsch')).toEqual([])
    })
})

function writeDist(files) {
    const dir = mkdtempSync(join(tmpdir(), 'caomei-i18n-routing-'))
    for (const [name, content] of Object.entries(files)) {
        writeFileSync(join(dir, name), content)
    }
    return dir
}

describe('checkPage', () => {
    it('产物缺失时报告错误', () => {
        const errors = checkPage('/tmp/not-exist-caomei', {
            page: 'components/locale.html',
            label: 'English',
            expected: '/en-US/components/locale',
            reason: '已翻译页回切对应路由',
        })

        expect(errors[0]).toContain('缺少构建产物')
    })

    it('链接符合期望时通过', () => {
        const dir = writeDist({ 'locale.html': desktopAnchor })
        expect(
            checkPage(dir, {
                page: 'locale.html',
                label: 'English',
                expected: '/en-US/components/locale',
                reason: '已翻译页回切对应路由',
            }),
        ).toEqual([])
    })

    it('出现回首页链接时报告不一致', () => {
        const dir = writeDist({ 'locale.html': '<a href="/en-US/">English</a>' })
        const errors = checkPage(dir, {
            page: 'locale.html',
            label: 'English',
            expected: '/en-US/components/locale',
            reason: '已翻译页回切对应路由',
        })

        expect(errors).toHaveLength(1)
        expect(errors[0]).toContain('链接为 /en-US/')
    })
})

describe('仓库不变量（回链策略受检面）', () => {
    /** 受检页面 → 仓库内源 markdown 路径。 */
    const sourceOf = (page) => {
        const md = page.replace(/\.html$/u, '.md')
        return md.startsWith('en-US/')
            ? join(PROJECT_ROOT, 'docs/i18n/en-US', md.replace(/^en-US\//u, ''))
            : join(PROJECT_ROOT, 'docs', md)
    }

    it('三类覆盖规则均有受检用例，且受检页面的源文件存在', () => {
        const reasons = ROUTING_CASES.map((entry) => entry.reason)
        expect(reasons.some((reason) => reason.includes('已翻译'))).toBe(true)
        expect(reasons.some((reason) => reason.includes('未翻译'))).toBe(true)
        expect(reasons.some((reason) => reason.includes('反向'))).toBe(true)
        expect(ROUTING_CASES.length).toBeGreaterThanOrEqual(5)
        for (const entry of ROUTING_CASES) {
            expect(existsSync(sourceOf(entry.page))).toBe(true)
        }
    })
})
