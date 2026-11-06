import { describe, expect, it } from 'vitest'
import { findMissingGlyphs, type GlyphFont, type TestFonts } from './font-coverage'

function font(hasGlyph: (codePoint: number) => boolean): GlyphFont {
    return { hasGlyphForCodePoint: hasGlyph }
}

const fonts: TestFonts = {
    latin: font((codePoint) => (codePoint >= 0x20 && codePoint <= 0x7E) || codePoint === 0x00D7),
    cjk: font((codePoint) => codePoint === 0x4E2D || codePoint === 0xFF08),
}

describe('findMissingGlyphs', () => {
    it('Latin 分支由 latin 字体判定', () => {
        expect(findMissingGlyphs('A ×', fonts)).toEqual([])
        expect(findMissingGlyphs('€', fonts)).toEqual([0x20AC])
    })

    it('Latin 分支缺少字形时报告缺失', () => {
        expect(findMissingGlyphs('A', { latin: font(() => false), cjk: font(() => true) })).toEqual([0x41])
    })

    it('CJK 分支由 cjk 字体判定', () => {
        expect(findMissingGlyphs('中（', fonts)).toEqual([])
        expect(findMissingGlyphs('文', fonts)).toEqual([0x6587])
    })

    it('其他符号任一字集覆盖即可', () => {
        const onlyLatin = {
            latin: font((codePoint) => codePoint === 0x2264),
            cjk: font(() => false),
        }
        expect(findMissingGlyphs('≤', onlyLatin)).toEqual([])
        expect(findMissingGlyphs('①', onlyLatin)).toEqual([0x2460])
    })

    it('忽略空白与控制字符', () => {
        expect(findMissingGlyphs(' \n\t\u007F', fonts)).toEqual([])
    })

    it('CJK 扩展 A 与全角字符走 cjk 分支', () => {
        const extended = {
            latin: font(() => false),
            cjk: font((codePoint) => codePoint === 0x3400 || codePoint === 0xFF08),
        }
        expect(findMissingGlyphs('㐀（', extended)).toEqual([])
        expect(findMissingGlyphs('㐁', extended)).toEqual([0x3401])
    })
})
