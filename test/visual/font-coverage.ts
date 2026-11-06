import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const FONT_DIR = resolve(dirname(fileURLToPath(import.meta.url)), '../e2e/fixtures/fonts')

/** 只依赖 `hasGlyphForCodePoint`，便于用合成字体做单元级负向对照。 */
export interface GlyphFont {
    hasGlyphForCodePoint: (codePoint: number) => boolean
}

export interface TestFonts {
    latin: GlyphFont
    cjk: GlyphFont
}

function isGlyphFont(font: unknown): font is GlyphFont {
    return typeof (font as GlyphFont).hasGlyphForCodePoint === 'function'
}

function openFont(fontkit: typeof import('fontkit'), file: string): GlyphFont {
    const font = fontkit.openSync(resolve(FONT_DIR, file))
    if (!isGlyphFont(font)) {
        throw new Error(`视觉测试字体必须是单字体文件：${file}`)
    }
    return font
}

/** 打开仓库内视觉测试字体（woff2 子集）。 */
export async function openTestFonts(): Promise<TestFonts> {
    const fontkit = await import('fontkit')
    return {
        latin: openFont(fontkit, 'caomei-test-latin.woff2'),
        cjk: openFont(fontkit, 'caomei-test-cjk.woff2'),
    }
}

/** Latin-1 / ASCII / 常用标点：由 `CaomeiTestLatin` 承担。 */
function isLatinRange(codePoint: number): boolean {
    return (codePoint >= 0x20 && codePoint <= 0x7E)
        || (codePoint >= 0xA0 && codePoint <= 0xFF)
        || (codePoint >= 0x2000 && codePoint <= 0x206F)
}

/** CJK 主体 / 扩展 A / CJK 标点 / 全角字符：由 `CaomeiTestCJK` 承担。 */
function isCjkRange(codePoint: number): boolean {
    return (codePoint >= 0x4E00 && codePoint <= 0x9FFF)
        || (codePoint >= 0x3400 && codePoint <= 0x4DBF)
        || (codePoint >= 0x3000 && codePoint <= 0x303F)
        || (codePoint >= 0xFF00 && codePoint <= 0xFFEF)
}

/**
 * 找出字体子集未覆盖的字符。
 *
 * `document.fonts.check()` 只校验字体是否可用，**不校验字形覆盖**；子集外字符会静默回退到
 * 系统字体，正是视觉基线环境差异的来源。这里直接读 cmap 判断：
 * - Latin / 常用标点必须由 `latin` 覆盖；
 * - CJK 必须由 `cjk` 覆盖；
 * - 其他符号（箭头 / 数学符号等）任一子集覆盖即可。
 */
export function findMissingGlyphs(text: string, fonts: TestFonts): number[] {
    const missing = new Set<number>()
    for (const char of text) {
        const codePoint = char.codePointAt(0)
        if (codePoint === undefined || codePoint <= 0x20 || codePoint === 0x7F) {
            continue
        }
        if (isLatinRange(codePoint)) {
            if (!fonts.latin.hasGlyphForCodePoint(codePoint)) {
                missing.add(codePoint)
            }
            continue
        }
        if (isCjkRange(codePoint)) {
            if (!fonts.cjk.hasGlyphForCodePoint(codePoint)) {
                missing.add(codePoint)
            }
            continue
        }
        if (!fonts.latin.hasGlyphForCodePoint(codePoint) && !fonts.cjk.hasGlyphForCodePoint(codePoint)) {
            missing.add(codePoint)
        }
    }
    return [...missing]
}
