import { mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { checkPage, collectHrefsForLabel } from './check-i18n-routing.mjs'

const desktopAnchor =
    '<a class="VPLink link" href="/en-US/guide/locale"><!--[--><span>English</span><!--]--></a>'
const mobileAnchor = '<a class="link" href="/en-US/guide/locale">English</a>'
const tabletAnchor =
    '<a class="VPLink link" href="/en-US/guide/locale"><span>English</span></a>'

describe('collectHrefsForLabel', () => {
    it('提取默认主题三种菜单标记下的链接', () => {
        const html = `<nav>${desktopAnchor}${mobileAnchor}${tabletAnchor}</nav>`

        expect(collectHrefsForLabel(html, 'English')).toEqual([
            '/en-US/guide/locale',
            '/en-US/guide/locale',
            '/en-US/guide/locale',
        ])
    })

    it('只收集文本完全匹配的锚点', () => {
        const html = '<a href="/en-US/">English</a><a href="/guide/locale">简体中文</a>'

        expect(collectHrefsForLabel(html, '简体中文')).toEqual(['/guide/locale'])
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
            page: 'guide/locale.html',
            label: 'English',
            expected: '/en-US/guide/locale',
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
                expected: '/en-US/guide/locale',
                reason: '已翻译页回切对应路由',
            }),
        ).toEqual([])
    })

    it('出现回首页链接时报告不一致', () => {
        const dir = writeDist({ 'locale.html': '<a href="/en-US/">English</a>' })
        const errors = checkPage(dir, {
            page: 'locale.html',
            label: 'English',
            expected: '/en-US/guide/locale',
            reason: '已翻译页回切对应路由',
        })

        expect(errors).toHaveLength(1)
        expect(errors[0]).toContain('链接为 /en-US/')
    })
})
