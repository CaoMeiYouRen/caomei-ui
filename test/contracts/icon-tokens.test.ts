import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

/**
 * 图标样式 token 契约：默认值 + 组件引用 + 中英组件页「样式定制」披露。
 *
 * 覆盖 `--caomei-icon-size-{sm,md,lg}` 与 `--caomei-icon-stroke-width`；默认值进入 token 冻结面，
 * 组件页披露面与其保持一致，`CaomeiIcon` 必须实际消费这些 token（防「token 变死值」）。
 */

const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..')
const THEME_CSS = join(REPO_ROOT, 'src', 'styles', 'theme.css')
const ICON_VUE = join(REPO_ROOT, 'src', 'icons', 'icon.vue')
const ZH_DOC = join(REPO_ROOT, 'docs', 'components', 'icons.md')
const EN_DOC = join(REPO_ROOT, 'docs', 'i18n', 'en-US', 'components', 'icons.md')

const TOKENS: Record<string, string> = {
    '--caomei-icon-size-sm': '16px',
    '--caomei-icon-size-md': '20px',
    '--caomei-icon-size-lg': '24px',
    '--caomei-icon-stroke-width': '2',
}

/** 取选择器对应的规则体（括号配平）。 */
function blockOf(css: string, selector: string): string {
    const index = css.indexOf(selector)
    if (index === -1) {
        return ''
    }
    const open = css.indexOf('{', index + selector.length)
    if (open === -1) {
        return ''
    }
    let depth = 0
    for (let i = open; i < css.length; i += 1) {
        if (css[i] === '{') {
            depth += 1
        } else if (css[i] === '}') {
            depth -= 1
            if (depth === 0) {
                return css.slice(open + 1, i)
            }
        }
    }
    return ''
}

/** 解析 token 声明。 */
function tokensOf(body: string): Map<string, string> {
    const tokens = new Map<string, string>()
    for (const match of body.matchAll(/(--caomei-icon-[a-z0-9-]+)\s*:\s*([^;]+);/g)) {
        tokens.set(match[1], match[2].trim())
    }
    return tokens
}

/** 取 markdown 二级标题段落。 */
function sectionOf(markdown: string, heading: string): string {
    const start = markdown.indexOf(`## ${heading}`)
    if (start === -1) {
        return ''
    }
    const rest = markdown.slice(start + heading.length + 3)
    const next = rest.search(/^## /m)
    return next === -1 ? rest : rest.slice(0, next)
}

const themeCss = readFileSync(THEME_CSS, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '')
const iconSource = readFileSync(ICON_VUE, 'utf8')

describe('图标样式 token', () => {
    it('theme.css 的 :root 声明 4 个默认值', () => {
        expect(Object.fromEntries(tokensOf(blockOf(themeCss, ':root')))).toEqual(TOKENS)
    })

    it('图标 token 只在 :root 声明一次（不随 density / 媒体查询漂移）', () => {
        const declared = [...themeCss.matchAll(/(--caomei-icon-[a-z0-9-]+)\s*:/g)].map((match) => match[1])
        expect([...declared].sort()).toEqual(Object.keys(TOKENS).sort())
    })

    it('CaomeiIcon 实际引用 4 个 token 与档位类', () => {
        expect(iconSource).toContain('var(--caomei-icon-size-sm')
        expect(iconSource).toContain('var(--caomei-icon-size-md')
        expect(iconSource).toContain('var(--caomei-icon-size-lg')
        expect(iconSource).toContain('var(--caomei-icon-stroke-width')
        for (const size of ['sm', 'md', 'lg']) {
            expect(iconSource).toContain(`.caomei-icon--${size}`)
        }
    })

    it('默认线宽只作用于 Lucide 图标，自备 SVG 保留自身 stroke-width', () => {
        expect(iconSource).toContain('.caomei-icon--default-stroke.lucide')
        expect(iconSource).not.toMatch(/\.caomei-icon--default-stroke\s*\{/)
    })

    it.each([
        ['zh-CN', ZH_DOC, '样式定制'],
        ['en-US', EN_DOC, 'Style customization'],
    ])('%s 图标页「样式定制」披露 token 与默认值', (_locale, file, heading) => {
        const section = sectionOf(readFileSync(file, 'utf8'), heading)
        for (const [name, value] of Object.entries(TOKENS)) {
            expect(section, `${file} 缺少 ${name}`).toContain(name)
            expect(section, `${file} 的 ${name} 默认值应为 ${value}`).toContain(`\`${value}\``)
        }
    })
})
