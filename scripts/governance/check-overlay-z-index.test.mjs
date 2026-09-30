import { describe, expect, it } from 'vitest'
import {
    FLOATING_TIER_ORDER,
    HOOK_NAME_EXCEPTIONS,
    KNOWN_TIERS,
    MIN_FLOATING_DECLARATIONS,
    MODAL_CONTENT_SELECTORS,
    RESERVED_TIERS,
    collectZIndexDeclarations,
    excludesClass,
    extractTemplateText,
    findAllowlistIssues,
    findFloatingTierIssues,
    findScopeIssues,
    findStaticVariantIssues,
    findTierOrderIssues,
    findTierSelectorIssues,
    findUnparsedTierIssues,
    parseZIndexTiers,
    parseZIndexValue,
    runChecks,
} from './check-overlay-z-index.mjs'

const TIERS = new Map([
    ['overlay', 1000],
    ['modal', 1001],
    ['dropdown', 1050],
    ['tooltip', 1060],
    ['toast', 1100],
])

/** 构造一个组件样式条目（路径按 `src/components/<dir>/<file>` 形态，供钩子名一致性判定） */
const entryOf = (dir, styleBody, templateBody = '') => ({
    file: `src/components/${dir}/${dir}.vue`,
    text: `<template><div class="x">${templateBody}</div></template><style>${styleBody}</style>`,
})

const declarationsOfEntry = (dir, styleBody, templateBody) =>
    collectZIndexDeclarations([entryOf(dir, styleBody, templateBody)])

describe('check-overlay-z-index 仓库不变量', () => {
    it('仓库当前通过全部检查', () => {
        const result = runChecks()
        expect(result.tierOrderIssues).toEqual([])
        expect(result.tierSelectorIssues).toEqual([])
        expect(result.floatingTierIssues).toEqual([])
        expect(result.staticVariantIssues).toEqual([])
        expect(result.scopeIssues).toEqual([])
    })

    it('档位表与设计规范 §2.5 一致（关键锚点）', () => {
        expect([...KNOWN_TIERS]).toEqual(FLOATING_TIER_ORDER)
        expect(MODAL_CONTENT_SELECTORS).toEqual(new Set([
            '.caomei-dialog__content',
            '.caomei-confirm-dialog__content',
            '.caomei-drawer__content',
        ]))
        expect(RESERVED_TIERS.has('tooltip')).toBe(true)
        expect(HOOK_NAME_EXCEPTIONS.get('src/components/image/image.vue')).toBe('--caomei-image-preview-z-index')
    })

    it('浮层档位声明数与受检面下界一致（防清单被静默收窄）', () => {
        const result = runChecks()
        expect(result.counts.floatingDeclarations).toBeGreaterThanOrEqual(MIN_FLOATING_DECLARATIONS)
        // 7 个 portal 面板 + Image 预览遮罩 + 预览内容 + Toast 视口
        expect(result.counts.floatingDeclarations).toBe(10)
    })
})

describe('check-overlay-z-index 档位解析', () => {
    it('识别 theme.css 的档位表', () => {
        const tiers = parseZIndexTiers('--caomei-z-overlay: 1000;\n--caomei-z-modal: 1001;\n--caomei-z-dropdown: 1050;')
        expect(tiers.get('dropdown')).toBe(1050)
        expect(tiers.size).toBe(3)
    })

    it('解析纯档位与覆盖钩子两种形态', () => {
        expect(parseZIndexValue('var(--caomei-z-dropdown)')).toEqual({ kind: 'plain', tier: 'dropdown', hook: null, offset: false })
        expect(parseZIndexValue('var(--caomei-select-z-index, var(--caomei-z-dropdown))')).toEqual({
            kind: 'hook',
            tier: 'dropdown',
            hook: '--caomei-select-z-index',
            offset: false,
        })
    })

    it('解析 calc 包裹形态（Image 预览内容）', () => {
        expect(parseZIndexValue('calc(var(--caomei-image-preview-z-index, var(--caomei-z-toast)) + 1)')).toEqual({
            kind: 'hook',
            tier: 'toast',
            hook: '--caomei-image-preview-z-index',
            offset: true,
        })
    })

    it('数字字面量与关键字不归本守卫（由 check:design 的 G4 兜底）', () => {
        expect(parseZIndexValue('1000')).toBeNull()
        expect(parseZIndexValue('auto')).toBeNull()
    })
})

describe('check-overlay-z-index 档位表守卫（T1）', () => {
    it('反例：浮层档位被调到模态之下', () => {
        const issues = findTierOrderIssues(new Map([...TIERS, ['dropdown', 1000]]))
        expect(issues.some((issue) => issue.includes('[tier-order]'))).toBe(true)
    })

    it('反例：档位表被删项', () => {
        const tiers = new Map(TIERS)
        tiers.delete('modal')
        expect(findTierOrderIssues(tiers).some((issue) => issue.includes('[tier-missing]'))).toBe(true)
    })

    it('正例：现行档位表通过', () => {
        expect(findTierOrderIssues(TIERS)).toEqual([])
    })
})

describe('check-overlay-z-index 选择器语义守卫（T2 / T3）', () => {
    it('反例：浮层面板使用遮罩档位（本次用户报告缺陷的真实形态）', () => {
        const declarations = declarationsOfEntry('select', '.caomei-select__content { z-index: var(--caomei-z-overlay); }')
        const issues = findTierSelectorIssues(declarations)
        expect(issues).toHaveLength(1)
        expect(issues[0]).toContain('[overlay-misuse]')
    })

    it('反例：浮层面板使用模态内容档位（ColorPicker 修复前形态）', () => {
        const declarations = declarationsOfEntry('color-picker', '.caomei-color-picker__panel { z-index: var(--caomei-z-modal); }')
        expect(findTierSelectorIssues(declarations)[0]).toContain('[modal-misuse]')
    })

    it('正例：遮罩使用遮罩档位、模态内容使用模态档位', () => {
        const mask = declarationsOfEntry('dialog', '.caomei-dialog__overlay { z-index: var(--caomei-z-overlay); }')
        expect(findTierSelectorIssues(mask)).toEqual([])
        const content = [{ file: 'src/components/dialog/dialog.vue', selector: '.caomei-dialog__content', value: 'var(--caomei-z-modal)', parsed: { kind: 'plain', tier: 'modal', hook: null, offset: false } }]
        expect(findTierSelectorIssues(content)).toEqual([])
    })
})

describe('check-overlay-z-index 浮层档位守卫（T4 / T5）', () => {
    it('反例：浮层档位数值低于模态内容（档位表被改坏）', () => {
        const declarations = declarationsOfEntry('select', '.caomei-select__content { z-index: var(--caomei-select-z-index, var(--caomei-z-dropdown)); }')
        const brokenTiers = new Map([...TIERS, ['dropdown', 1000]])
        expect(findFloatingTierIssues(declarations, brokenTiers).some((issue) => issue.includes('[tier-below-modal]'))).toBe(true)
    })

    it('反例：浮层档位的钩子回退到遮罩档位（由 T2 拦下）', () => {
        const declarations = declarationsOfEntry('select', '.caomei-select__content { z-index: var(--caomei-select-z-index, var(--caomei-z-overlay)); }')
        expect(findTierSelectorIssues(declarations)[0]).toContain('[overlay-misuse]')
        // T4 只判「浮层档位数值 ≤ 模态数值」，overlay 档位不在其规则面
        expect(findFloatingTierIssues(declarations, TIERS)).toEqual([])
    })

    it('反例：浮层档位缺覆盖钩子', () => {
        const declarations = declarationsOfEntry('select', '.caomei-select__content { z-index: var(--caomei-z-dropdown); }')
        expect(findFloatingTierIssues(declarations, TIERS)).toEqual([
            expect.stringContaining('[hook-missing]'),
        ])
    })

    it('反例：钩子名拼写漂移（会静默回退到默认档位）', () => {
        const declarations = declarationsOfEntry('select', '.caomei-select__content { z-index: var(--caomei-selct-z-index, var(--caomei-z-dropdown)); }')
        expect(findFloatingTierIssues(declarations, TIERS)[0]).toContain('[hook-name]')
    })

    it('反例：钩子名与组件目录不一致', () => {
        const declarations = declarationsOfEntry('popover', '.caomei-popover__content { z-index: var(--caomei-dropdown-menu-z-index, var(--caomei-z-dropdown)); }')
        expect(findFloatingTierIssues(declarations, TIERS)[0]).toContain('[hook-name]')
    })

    it('正例：目录一致的覆盖钩子放行', () => {
        const declarations = declarationsOfEntry('select', '.caomei-select__content { z-index: var(--caomei-select-z-index, var(--caomei-z-dropdown)); }')
        expect(findFloatingTierIssues(declarations, TIERS)).toEqual([])
    })

    it('正例：登记的钩子名例外放行，例外值漂移仍报错', () => {
        const ok = [{ file: 'src/components/image/image.vue', selector: '.caomei-image__preview-overlay', value: '', parsed: { kind: 'hook', tier: 'toast', hook: '--caomei-image-preview-z-index', offset: false } }]
        expect(findFloatingTierIssues(ok, TIERS)).toEqual([])
        const drift = [{ ...ok[0], parsed: { ...ok[0].parsed, hook: '--caomei-image-z-index' } }]
        expect(findFloatingTierIssues(drift, TIERS)[0]).toContain('[hook-name]')
    })
})

describe('check-overlay-z-index 未识别形态守卫（T8）', () => {
    it('反例：带字面量回退的遮罩档位（静默绕过 T2 的形态）', () => {
        const declarations = declarationsOfEntry('select', '.caomei-select__content { z-index: var(--caomei-z-overlay, 9999); }')
        expect(declarations[0].parsed).toBeNull()
        expect(findUnparsedTierIssues(declarations)[0]).toContain('[unparsed-tier-form]')
    })

    it('反例：带字面量回退的缺钩子形态（静默绕过 T5 的形态）', () => {
        const declarations = declarationsOfEntry('select', '.caomei-select__content { z-index: var(--caomei-z-dropdown, 1050); }')
        expect(findUnparsedTierIssues(declarations)[0]).toContain('[unparsed-tier-form]')
    })

    it('正例：数字字面量与关键字不报（由 check:design 的 G4 兜底）', () => {
        const numeric = declarationsOfEntry('select', '.caomei-select__content { z-index: 1000; }')
        expect(findUnparsedTierIssues(numeric)).toEqual([])
    })

    it('正例：规范形态解析成功、不落入未识别分支', () => {
        const declarations = declarationsOfEntry('select', '.caomei-select__content { z-index: var(--caomei-select-z-index, var(--caomei-z-dropdown)); }')
        expect(findUnparsedTierIssues(declarations)).toEqual([])
    })
})

describe('check-overlay-z-index 允许名单反向校验（T9）', () => {
    it('反例：例外条目未在产物中命中（清单腐烂）', () => {
        const declarations = declarationsOfEntry('select', '.caomei-select__content { z-index: var(--caomei-select-z-index, var(--caomei-z-dropdown)); }')
        const issues = findAllowlistIssues(declarations)
        expect(issues.some((issue) => issue.includes('[stale-exception]'))).toBe(true)
        expect(issues.filter((issue) => issue.includes('[stale-modal-selector]'))).toHaveLength(3)
    })

    it('正例：三类清单均与产物一致', () => {
        const declarations = [
            ...declarationsOfEntry('select', '.caomei-select__content { z-index: var(--caomei-select-z-index, var(--caomei-z-dropdown)); }'),
            { file: 'src/components/image/image.vue', selector: '.caomei-image__preview-overlay', value: '', parsed: { kind: 'hook', tier: 'toast', hook: '--caomei-image-preview-z-index', offset: false } },
            ...[...MODAL_CONTENT_SELECTORS].map((selector) => ({
                file: 'src/components/dialog/dialog.vue',
                selector,
                value: '',
                parsed: { kind: 'plain', tier: 'modal', hook: null, offset: false },
            })),
        ]
        expect(findAllowlistIssues(declarations)).toEqual([])
    })
})

describe('check-overlay-z-index 静态变体守卫（T6）', () => {
    it('反例：静态变体继承浮层档位（ColorPicker inline 的真实形态）', () => {
        const declarations = declarationsOfEntry(
            'color-picker',
            '.caomei-color-picker__panel { z-index: var(--caomei-color-picker-z-index, var(--caomei-z-dropdown)); }',
            '<div class="caomei-color-picker__panel caomei-color-picker__panel--inline"></div>',
        )
        const templates = new Map([['src/components/color-picker/color-picker.vue', 'caomei-color-picker__panel--inline']])
        expect(findStaticVariantIssues(declarations, templates)[0]).toContain('[static-variant]')
    })

    it('正例：`:not()` 确实排除了该变体类', () => {
        const declarations = declarationsOfEntry(
            'color-picker',
            '.caomei-color-picker__panel:not(.caomei-color-picker__panel--inline) { z-index: var(--caomei-color-picker-z-index, var(--caomei-z-dropdown)); }',
        )
        const templates = new Map([['src/components/color-picker/color-picker.vue', 'caomei-color-picker__panel--inline']])
        expect(findStaticVariantIssues(declarations, templates)).toEqual([])
    })

    it('反例：无关的 `:not()` 不构成排除', () => {
        const declarations = declarationsOfEntry(
            'color-picker',
            '.caomei-color-picker__panel:not([data-x]) { z-index: var(--caomei-color-picker-z-index, var(--caomei-z-dropdown)); }',
        )
        const templates = new Map([['src/components/color-picker/color-picker.vue', 'caomei-color-picker__panel--inline']])
        expect(findStaticVariantIssues(declarations, templates)[0]).toContain('[static-variant]')
    })

    it('正例：无同名变体时放行', () => {
        const declarations = declarationsOfEntry('select', '.caomei-select__content { z-index: var(--caomei-select-z-index, var(--caomei-z-dropdown)); }')
        expect(findStaticVariantIssues(declarations, new Map([['src/components/select/select.vue', '<div class="caomei-select__content">']]))).toEqual([])
    })

    it('模板提取只取 `<template>` 内容，script / style 中的同名文本不参与', () => {
        const text = '<template><div class="a"></div></template><script>const s = "caomei-color-picker__panel--inline"</script><style>.a {}</style>'
        expect(extractTemplateText('src/components/x/x.vue', text)).not.toContain('--inline')
    })
})

describe('check-overlay-z-index 受检面守卫（T7）', () => {
    it('反例：受检面被静默收窄', () => {
        const issues = findScopeIssues({ files: 1, rules: 1, floatingDeclarations: 0, consumedTiers: new Set() })
        expect(issues.filter((issue) => issue.includes('[scan-scope-narrowed]'))).toHaveLength(3)
    })

    it('反例：预留档位出现消费点', () => {
        const issues = findScopeIssues({ files: 99, rules: 999, floatingDeclarations: 9, consumedTiers: new Set(['tooltip']) })
        expect(issues[0]).toContain('[reserved-tier-consumed]')
    })

    it('正例：现行受检面通过', () => {
        expect(findScopeIssues({ files: 83, rules: 796, floatingDeclarations: 9, consumedTiers: new Set(['overlay', 'modal', 'dropdown', 'toast']) })).toEqual([])
    })
})
