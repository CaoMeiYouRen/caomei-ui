import { existsSync, lstatSync, mkdirSync, mkdtempSync, realpathSync, rmSync, symlinkSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterAll, describe, expect, it } from 'vitest'
import { ensureFixtureLink, findMissingMarkers, HTML_MARKERS, CSS_MARKERS, REPO_ROOT, resolveNuxtBin } from './check-nuxt.mjs'

const tempDirs = []

function createTempRoot() {
    const dir = mkdtempSync(join(tmpdir(), 'check-nuxt-'))
    tempDirs.push(dir)
    return dir
}

afterAll(() => {
    for (const dir of tempDirs) {
        rmSync(dir, { recursive: true, force: true })
    }
})

describe('findMissingMarkers', () => {
    it('返回未命中的标记描述', () => {
        const markers = [
            { label: '命中项', test: () => true },
            { label: '缺失项', test: () => false },
        ]

        expect(findMissingMarkers('content', markers)).toEqual(['缺失项'])
    })

    it('全部命中时返回空数组', () => {
        expect(findMissingMarkers('content', [{ label: 'a', test: () => true }])).toEqual([])
    })
})

describe('fixture 标记定义', () => {
    it('HTML 与 CSS 标记均可在样例内容上判定', () => {
        const html = [
            '<html data-preset="caomei" data-scheme="auto">',
            '<span class="caomei-button caomei-tag"></span>',
            '<p data-testid="theme-mode">auto</p>',
        ].join('')
        const css = [
            '.caomei-root{font-family:system-ui}',
            ':root{--caomei-color-bg:#fff;--caomei-color-primary:#123456;--caomei-color-primary-foreground:#fefefe}',
            '.caomei-button{}',
        ].join('')

        expect(findMissingMarkers(html, HTML_MARKERS)).toEqual([])
        expect(findMissingMarkers(css, CSS_MARKERS)).toEqual([])
    })
})

describe('ensureFixtureLink', () => {
    it('建立指向仓库根的软链且幂等', () => {
        const root = createTempRoot()
        mkdirSync(join(root, 'playground', 'nuxt'), { recursive: true })

        ensureFixtureLink(root)
        const linkPath = join(root, 'playground', 'nuxt', 'node_modules', 'caomei-ui')

        expect(lstatSync(linkPath).isSymbolicLink()).toBe(true)

        expect(() => ensureFixtureLink(root)).not.toThrow()
        expect(realpathSync(linkPath)).toBe(realpathSync(root))
    })

    it('指向他处的软链会被重建为仓库根', () => {
        const root = createTempRoot()
        const other = createTempRoot()
        const linkDir = join(root, 'playground', 'nuxt', 'node_modules')
        mkdirSync(linkDir, { recursive: true })

        const linkPath = join(linkDir, 'caomei-ui')
        symlinkSync(other, linkPath, 'dir')

        ensureFixtureLink(root)

        expect(realpathSync(linkPath)).toBe(realpathSync(root))
    })

    it('悬空软链会被重建', () => {
        const root = createTempRoot()
        const linkDir = join(root, 'playground', 'nuxt', 'node_modules')
        mkdirSync(linkDir, { recursive: true })

        const linkPath = join(linkDir, 'caomei-ui')
        symlinkSync(join(root, 'does-not-exist'), linkPath, 'dir')

        expect(() => ensureFixtureLink(root)).not.toThrow()
        expect(realpathSync(linkPath)).toBe(realpathSync(root))
    })
})

describe('resolveNuxtBin', () => {
    it('解析到实际存在的 nuxt 入口', () => {
        expect(existsSync(resolveNuxtBin(REPO_ROOT))).toBe(true)
    })
})
