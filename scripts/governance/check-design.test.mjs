import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import {
    OPACITY_BUDGET,
    RGB_BUDGET,
    Z_INDEX_BUDGET,
    collectGlobalTokens,
    collectLocalTokens,
    declarationsOf,
    findLegacyNaming,
    findOpacityLiterals,
    findRawColors,
    findNonWhereSizeSelectors,
    findScopedVariableDeclarations,
    findTierBlockPropertyDeclarations,
    findTokenIssues,
    findTypeScaleIssues,
    findZIndexLiterals,
    runChecks,
    scanRules,
} from './check-design.mjs'

const REPO_ROOT = join(fileURLToPath(import.meta.url), '..', '..', '..')
const readCss = (name) => readFileSync(join(REPO_ROOT, 'src/styles', name), 'utf8')

describe('check-design 仓库不变量', () => {
    it('仓库当前通过全部检查', () => {
        const result = runChecks()
        expect(result.tokenIssues).toEqual([])
        expect(result.rawColors.errors).toEqual([])
        expect(result.typeIssues).toEqual([])
        expect(result.legacyNaming).toEqual([])
        expect(result.rawColors.warnings).toEqual([])
        expect(result.tierBlockDeclarations).toEqual([])
        expect(result.scopedVariableDeclarations).toEqual([])
        expect(result.nonWhereSizeSelectors).toEqual([])
        expect(result.opacityLiterals).toEqual([])
        expect(result.zIndexLiterals).toEqual([])
        expect(RGB_BUDGET).toBe(0)
        expect(OPACITY_BUDGET).toBe(0)
        expect(Z_INDEX_BUDGET).toBe(0)
    })

    it('全局 token 覆盖基础与两套预设', () => {
        expect([...collectGlobalTokens()]).toEqual(
            expect.arrayContaining(['--caomei-color-primary', '--caomei-color-bg', '--caomei-radius-md']),
        )
    })

    it('预设取值与设计规范一致（关键锚点）', () => {
        const caomei = readCss('presets/caomei.css')
        expect(caomei).toContain('--caomei-color-primary: #e63946')
        expect(caomei).toContain('--caomei-color-bg: #18181b')
        expect(caomei).toContain('--caomei-color-bg-elevated: #27272a')

        const momei = readCss('presets/momei.css')
        expect(momei).toContain('--caomei-color-primary: #64748b')
        expect(momei).toContain('--caomei-color-bg: #020617')
        expect(momei).toContain('--caomei-color-text: #f1f5f9')
    })
})

describe('check-design 负向用例', () => {
    it('识别未定义且无 fallback 的 token 引用', () => {
        const entries = [{ file: '/tmp/opencode/x.vue', text: '<style>.a { color: var(--caomei-not-exist); }</style>' }]
        expect(findTokenIssues(entries, new Set())).toHaveLength(1)
    })

    it('带 fallback 的引用放行', () => {
        const entries = [{ file: '/tmp/opencode/x.vue', text: '<style>.a { color: var(--caomei-not-exist, red); }</style>' }]
        expect(findTokenIssues(entries, new Set())).toEqual([])
    })

    it('同文件局部定义的 token 放行', () => {
        const entries = [{ file: '/tmp/opencode/x.vue', text: '<style>.a { --caomei-local: red; color: var(--caomei-local); }</style>' }]
        expect(collectLocalTokens(entries[0].text).has('--caomei-local')).toBe(true)
        expect(findTokenIssues(entries, new Set())).toEqual([])
    })

    it('识别组件内原始 hex 色值', () => {
        const entries = [{ file: '/tmp/opencode/x.vue', text: '<style>.a { color: #fff; }</style>' }]
        expect(findRawColors(entries).errors).toHaveLength(1)
    })

    it('识别组件内原始 rgb 色值（预算为 0 时任何一处都超预算）', () => {
        const entries = [{ file: '/tmp/opencode/x.vue', text: '<style>.a { box-shadow: 0 8px 24px rgb(0 0 0 / 0.12); }</style>' }]
        const warnings = findRawColors(entries).warnings
        expect(warnings).toHaveLength(1)
        expect(warnings.length).toBeGreaterThan(RGB_BUDGET)
    })

    it('script / template 内容不误报', () => {
        const entries = [{ file: '/tmp/opencode/x.vue', text: '<script>const c = "#fff"</script><style>.a { color: red; }</style>' }]
        expect(findRawColors(entries).errors).toEqual([])
    })

    it('档位不一致时逐项报错', () => {
        const text = [
            'export type ComponentSize = \'small\' | \'md\'',
            'export type ComponentVariant = \'primary\'',
            'export type ComponentTone = \'danger\'',
        ].join('\n')
        expect(findTypeScaleIssues(text)).toHaveLength(3)
    })

    it('识别 PrimeVue 旧尺寸命名', () => {
        expect(findLegacyNaming([{ file: '/tmp/opencode/x.ts', text: 'size?: \'small\'' }])).toHaveLength(1)
    })
})

const vue = (css) => [{ file: '/tmp/opencode/x.vue', text: `<style>${css}</style>` }]

describe('check-design 档位块属性守卫（G1）', () => {
    it('反例：档位 :where() 块内直接声明属性', () => {
        expect(findTierBlockPropertyDeclarations(vue(':where(.caomei-message--sm) { padding: 0; }'))).toHaveLength(1)
    })

    it('反例：元素修饰符与后代限定形态同样命中', () => {
        const rules = ':where(.caomei-select-button--sm) .caomei-select-button__item { padding: 0; font-size: 12px; }'
        expect(findTierBlockPropertyDeclarations(vue(rules))).toHaveLength(2)
    })

    it('正例：档位块只声明 CSS 变量', () => {
        const rules = ':where(.caomei-message--sm) { --caomei-message-font-size: 12px; }'
        expect(findTierBlockPropertyDeclarations(vue(rules))).toEqual([])
    })

    it('正例：结构型 :where() 覆盖（非受控枚举修饰符）不误报', () => {
        const rules = ':where(.caomei-skeleton--circular) .caomei-skeleton__line { border-radius: 50%; }'
        expect(findTierBlockPropertyDeclarations(vue(rules))).toEqual([])
    })
})

describe('check-design scoped 变量声明守卫（G2）', () => {
    const globalTokens = new Set(['--caomei-color-primary'])

    it('反例：基类预声明组件命名空间变量', () => {
        expect(findScopedVariableDeclarations(vue('.caomei-button { --caomei-button-bg: red; }'), globalTokens)).toHaveLength(1)
    })

    it('正例：:where() 选择器内声明', () => {
        const rules = ':where(.caomei-button--tone-danger) { --caomei-button-bg: red; }'
        expect(findScopedVariableDeclarations(vue(rules), globalTokens)).toEqual([])
    })

    it('正例：全局 token 覆写与消费处回退不纳入', () => {
        const rules = '.caomei-confirm-dialog__confirm--danger { --caomei-color-primary: red; }'
        expect(findScopedVariableDeclarations(vue(rules), globalTokens)).toEqual([])
    })
})

describe('check-design 尺寸档位选择器归一守卫（G5）', () => {
    it('反例：档位类直接作为选择器主体（归一化收敛前的真实形态）', () => {
        const rules = '.caomei-input--sm { height: 24px; padding: 0 8px; }'
        expect(findNonWhereSizeSelectors(vue(rules))).toHaveLength(1)
    })

    it('反例：后代限定形态（归一化收敛前的 textarea / input-number 形态）', () => {
        const rules = '.caomei-textarea--sm .caomei-textarea__control { padding: 4px 8px; }'
        expect(findNonWhereSizeSelectors(vue(rules))).toHaveLength(1)
    })

    it('反例：复合块中尺寸部分未包裹', () => {
        const rules = '.caomei-badge--dot.caomei-badge--lg { width: 10px; }'
        expect(findNonWhereSizeSelectors(vue(rules))).toHaveLength(1)
    })

    it('反例：同一选择器内多处未包裹逐处命中', () => {
        const rules = '.caomei-tag--md, .caomei-tag--lg { height: 32px; }'
        expect(findNonWhereSizeSelectors(vue(rules))).toHaveLength(2)
    })

    it('正例：` :where()` 包裹（含空白）放行', () => {
        const rules = ':where(.caomei-input--sm) { --caomei-input-height: 24px; } :where( .caomei-tag--lg ) { --caomei-tag-height: 40px; }'
        expect(findNonWhereSizeSelectors(vue(rules))).toEqual([])
    })

    it('正例：结构修饰符保持常规特异性、尺寸部分经 :where() 归零（badge 复合块现行写法）', () => {
        const rules = '.caomei-badge--dot:where(.caomei-badge--lg) { width: 10px; height: 10px; }'
        expect(findNonWhereSizeSelectors(vue(rules))).toEqual([])
    })

    it('正例：`:where()` 内分组写法放行', () => {
        const rules = ':where(.caomei-button--sm, .caomei-button--lg) { --caomei-button-height: 36px; }'
        expect(findNonWhereSizeSelectors(vue(rules))).toEqual([])
    })

    it('正例：`:not(:where(...))` 归零写法放行；裸 `:not(...)` 命中', () => {
        expect(findNonWhereSizeSelectors(vue(':not(:where(.caomei-input--sm)) { opacity: 0.6; }'))).toEqual([])
        expect(findNonWhereSizeSelectors(vue('.caomei-input:not(.caomei-input--sm) { opacity: 1; }'))).toHaveLength(1)
    })

    it('正例：`:where()` 内再嵌 `:not()` / `:is()` 仍属已归零', () => {
        expect(findNonWhereSizeSelectors(vue(':where(:not(.caomei-input--sm)) { opacity: 0.6; }'))).toEqual([])
        expect(findNonWhereSizeSelectors(vue(':where(:is(.caomei-input--sm, .caomei-input--lg)) { --caomei-input-height: 24px; }'))).toEqual([])
    })

    it('正例：变体 / 语气档位块不在规则面（其档位块本就声明属性）', () => {
        const rules = '.caomei-button--primary { background: var(--caomei-color-primary); } :where(.caomei-button--tone-danger) { --caomei-button-bg: red; }'
        expect(findNonWhereSizeSelectors(vue(rules))).toEqual([])
    })

    it('反例：媒体查询内的裸用档位类同样命中', () => {
        const rules = '@media (max-width: 640px) { .caomei-select-button__item--md { min-height: 32px; } }'
        expect(findNonWhereSizeSelectors(vue(rules))).toHaveLength(1)
    })

    it('正例：属性选择器取值中的 `where(` / 类名形态不干扰判定', () => {
        const rules = ':where(.caomei-input--sm) [data-x="where("] { color: red; } [data-y=".caomei-input--md"] { color: blue; }'
        expect(findNonWhereSizeSelectors(vue(rules))).toEqual([])
    })

    it('正例：非受控枚举修饰符（结构型）不属于规则面', () => {
        const rules = '.caomei-skeleton--circular { border-radius: 50%; } .caomei-badge--dot { width: 8px; }'
        expect(findNonWhereSizeSelectors(vue(rules))).toEqual([])
    })

    it('正例：媒体查询内的 :where() 档位块放行', () => {
        const rules = '@media (max-width: 640px) { :where(.caomei-select-button-item--md) { --caomei-select-button-item-min-height: 32px; } }'
        expect(findNonWhereSizeSelectors(vue(rules))).toEqual([])
    })
})

describe('check-design 禁用态 opacity 守卫（G3）', () => {
    it('反例：规则内出现 0.5 / 0.6 字面量', () => {
        expect(findOpacityLiterals(vue('.caomei-foo { opacity: 0.6; }'))).toHaveLength(1)
        expect(findOpacityLiterals(vue('.caomei-foo { opacity: 0.5; }'))).toHaveLength(1)
    })

    it('正例：其它不透明度值不报（视觉档位不得顺手归并）', () => {
        expect(findOpacityLiterals(vue('.caomei-foo { opacity: 0.7; }'))).toEqual([])
    })

    it('正例：@keyframes 块被跳过', () => {
        const keyframes = '@keyframes x { from { opacity: 0.5; } to { opacity: 1; } }'
        expect(findOpacityLiterals(vue(keyframes))).toEqual([])
    })
})

describe('check-design 层级字面量守卫（G4）', () => {
    it('反例：数字 z-index', () => {
        expect(findZIndexLiterals(vue('.caomei-foo { z-index: 1000; }'))).toHaveLength(1)
    })

    it('正例：token 与 calc 包装放行', () => {
        expect(findZIndexLiterals(vue('.caomei-foo { z-index: var(--caomei-z-modal); }'))).toEqual([])
        expect(findZIndexLiterals(vue('.caomei-foo { z-index: calc(var(--caomei-z-toast) + 1); }'))).toEqual([])
    })

    it('正例：关键字放行', () => {
        expect(findZIndexLiterals(vue('.caomei-foo { z-index: auto; }'))).toEqual([])
    })
})

describe('check-design 语句型 at-rule 切分（scanRules）', () => {
    it('反例：@import 语句不吞掉后续规则', () => {
        const rules = scanRules('@import "x.css"; .caomei-a--sm { z-index: 1 }')
        expect(rules.map((r) => r.selector)).toEqual(['.caomei-a--sm'])
        expect(declarationsOf(rules[0].body)).toEqual([{ property: 'z-index', value: '1' }])
        expect(findZIndexLiterals(vue('@import "x.css"; .caomei-a--sm { z-index: 1 }'))).toHaveLength(1)
    })

    it('正例：@charset / @layer 语句与带块 @media 混排仍逐条扫描', () => {
        const css = [
            '@charset "utf-8";',
            '@layer reset;',
            '@media (min-width: 640px) { .caomei-b--sm { z-index: 1 } }',
        ].join('\n')
        expect(scanRules(css).map((r) => r.selector)).toEqual(['.caomei-b--sm'])
    })

    it('正例：字符串内的分号不作语句边界', () => {
        const rules = scanRules('@import "a;b.css"; .caomei-c--sm { z-index: 1 }')
        expect(rules.map((r) => r.selector)).toEqual(['.caomei-c--sm'])
    })
})

describe('scanRules 边界（W3：注释与字符串中的花括号不得破坏配平）', () => {
    it('字符串字面量内的 } 不结束当前块', () => {
        const rules = scanRules('.caomei-a { content: "}"; color: red } .caomei-b { z-index: 1 }')

        expect(rules.map((rule) => rule.selector)).toEqual(['.caomei-a', '.caomei-b'])
        expect(rules[1].body).toContain('z-index: 1')
    })

    it('规则体内注释含 } 时后续声明与规则仍被扫描', () => {
        const rules = scanRules('.caomei-a { /* } */ color: red } .caomei-b { z-index: 1 }')

        expect(rules.map((rule) => rule.selector)).toEqual(['.caomei-a', '.caomei-b'])
        expect(rules[0].body).toContain('color: red')
    })

    it('@starting-style 等新 at-rule 内的规则参与扫描', () => {
        const rules = scanRules('@starting-style { .caomei-a--sm { z-index: 1 } }')

        expect(rules.map((rule) => rule.selector)).toEqual(['.caomei-a--sm'])
    })
})
