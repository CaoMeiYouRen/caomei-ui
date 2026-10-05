import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

/**
 * TabList 分隔线契约（设计规范 §6 / 开发规范 §7）。
 *
 * 契约：列表底部分隔线用**内容盒之下的 1px 内边距 + 内阴影**表达（而非 `border-bottom`）——
 * `overflow` 非 `visible` 时在**内边距盒**处裁剪，原 `border-bottom`（边框盒、比内容盒低 1px）
 * 与激活指示条（触发器 `margin-bottom: -1px` 越界 1px）不在同一像素行，指示条无法盖住它；
 * 改为内边距盒底边的内阴影后，2px 指示条正好落在这 1px 上把它整行盖住，且列表总高不变。
 * 纵向排布不裁剪（`overflow: visible`，指示条靠 `margin-right: -1px` 压右边框），须重置横向的
 * 分隔线实现。
 *
 * happy-dom 无布局引擎，故这里守住**声明**层面；真实几何与像素对照由
 * `test/e2e/tabs-indicator.e2e.ts` 承担。
 */

const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..')
const TABS_LIST = join(REPO_ROOT, 'src', 'components', 'tabs', 'tabs-list.vue')

export interface SeparatorContractIssue {
    reason: string
}

function styleOf(source: string): string {
    return [...source.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)].map((match) => match[1]).join('\n')
}

function styleRules(style: string): { selector: string, body: string }[] {
    const stripped = style.replace(/\/\*[\s\S]*?\*\//g, '')
    return [...stripped.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map((match) => ({ selector: match[1].trim(), body: match[2] }))
}

function ruleFor(style: string, selector: string): string | null {
    const rule = styleRules(style).find((item) => item.selector.split(',').map((part) => part.trim()).includes(selector))
    return rule ? rule.body : null
}

/**
 * 校验 TabList 分隔线契约。
 *
 * @param style `tabs-list.vue` scoped 样式文本
 * @returns 违约项（空数组即通过）
 */
export function checkTabsSeparatorContract(style: string): SeparatorContractIssue[] {
    const issues: SeparatorContractIssue[] = []
    const base = ruleFor(style, '.caomei-tabs__list')
    const vertical = ruleFor(style, ':where(.caomei-tabs--vertical) .caomei-tabs__list')

    if (base === null) {
        issues.push({ reason: '缺少 `.caomei-tabs__list` 基类规则' })
    } else {
        if (!/(?:^|[;{\s])padding-bottom\s*:\s*1px\b/.test(base)) {
            issues.push({ reason: '基类缺少 `padding-bottom: 1px`（分隔线所在的内边距盒底边）' })
        }
        if (!/(?:^|[;{\s])box-shadow\s*:[^;]*inset/.test(base)) {
            issues.push({ reason: '基类缺少内阴影分隔线（`box-shadow: inset …`）' })
        }
        if (/(?:^|[;{\s])border-bottom(?:-width)?\s*:/.test(base)) {
            issues.push({ reason: '基类不得再声明 `border-bottom`（会与指示条错行、无法被盖住）' })
        }
    }

    if (vertical === null) {
        issues.push({ reason: '缺少纵向覆盖规则（`:where(.caomei-tabs--vertical) .caomei-tabs__list`）' })
    } else {
        if (!/(?:^|[;{\s])padding-bottom\s*:\s*0\b/.test(vertical)) {
            issues.push({ reason: '纵向覆盖须重置 `padding-bottom: 0`' })
        }
        if (!/(?:^|[;{\s])box-shadow\s*:\s*none\b/.test(vertical)) {
            issues.push({ reason: '纵向覆盖须重置 `box-shadow: none`' })
        }
    }
    return issues
}

const BASE = '.caomei-tabs__list { overflow: auto hidden; padding-bottom: 1px; box-shadow: inset 0 -1px 0 0 var(--caomei-tabs-border); }'
const VERTICAL = ':where(.caomei-tabs--vertical) .caomei-tabs__list { overflow: visible; padding-bottom: 0; box-shadow: none; border-right: 1px solid var(--caomei-tabs-border); }'

describe('TabList 分隔线契约（判定函数）', () => {
    const cases: { name: string, style: string, issues: number }[] = [
        { name: '基类内边距 + 内阴影、纵向重置 → 通过', style: `${BASE}\n${VERTICAL}`, issues: 0 },
        { name: '基类缺 padding-bottom → 违约', style: `.caomei-tabs__list { overflow: auto hidden; box-shadow: inset 0 -1px 0 0 var(--caomei-tabs-border); }\n${VERTICAL}`, issues: 1 },
        { name: '基类缺内阴影 → 违约', style: `.caomei-tabs__list { overflow: auto hidden; padding-bottom: 1px; }\n${VERTICAL}`, issues: 1 },
        { name: '基类仍声明 border-bottom → 违约', style: `.caomei-tabs__list { overflow: auto hidden; padding-bottom: 1px; box-shadow: inset 0 -1px 0 0 var(--caomei-tabs-border); border-bottom: 1px solid var(--caomei-color-border); }\n${VERTICAL}`, issues: 1 },
        { name: '纵向未重置 padding-bottom → 违约', style: `${BASE}\n:where(.caomei-tabs--vertical) .caomei-tabs__list { overflow: visible; box-shadow: none; }`, issues: 1 },
        { name: '注释内出现 border-bottom 不算声明 → 通过', style: `/* 不用 border-bottom */.caomei-tabs__list { padding-bottom: 1px; box-shadow: inset 0 -1px 0 0 var(--caomei-tabs-border); }\n${VERTICAL}`, issues: 0 },
    ]

    it.each(cases)('$name', ({ style, issues }) => {
        expect(checkTabsSeparatorContract(style)).toHaveLength(issues)
    })
})

describe('TabList 分隔线契约（仓库现状）', () => {
    it('tabs-list.vue 采用内边距 + 内阴影分隔线且纵向重置', () => {
        expect(checkTabsSeparatorContract(styleOf(readFileSync(TABS_LIST, 'utf8')))).toEqual([])
    })
})
