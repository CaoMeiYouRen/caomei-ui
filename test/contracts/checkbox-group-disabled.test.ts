import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

/**
 * CheckboxGroup 禁用态契约（设计规范 §6）。
 *
 * 契约：禁用态**不在分组层叠加透明度**——分组根 / 修饰规则不得声明 `opacity`；
 * 子项各自已按 `--caomei-disabled-opacity` 处理，分组再乘会双重变淡。
 *
 * happy-dom 无布局引擎，故这里守住**声明**层面。
 */

const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..')
const CHECKBOX_GROUP = join(REPO_ROOT, 'src', 'components', 'checkbox-group', 'checkbox-group.vue')

/** 分组层选择器：根 `.caomei-checkbox-group` 或其 `--` 修饰（`__` 子部件不在受检面）。 */
const GROUP_SELECTOR_RE = /\.caomei-checkbox-group(?:--[\w-]+)?(?![\w-])/
const OPACITY_RE = /(?:^|[;{\s])opacity\s*:/

export interface ContractIssue {
    selector: string
}

function styleOf(source: string): string {
    return [...source.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)].map((match) => match[1]).join('\n')
}

function styleRules(style: string): { selector: string, body: string }[] {
    const stripped = style.replace(/\/\*[\s\S]*?\*\//g, '')
    return [...stripped.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map((match) => ({ selector: match[1].trim(), body: match[2] }))
}

/**
 * 校验分组层不声明 `opacity`。
 *
 * @param style scoped 样式文本
 * @returns 违约项（空数组即通过）
 */
export function checkCheckboxGroupDisabledContract(style: string): ContractIssue[] {
    const issues: ContractIssue[] = []
    for (const rule of styleRules(style)) {
        for (const part of rule.selector.split(',').map((value) => value.trim())) {
            if (GROUP_SELECTOR_RE.test(part) && OPACITY_RE.test(rule.body)) {
                issues.push({ selector: part })
            }
        }
    }
    return issues
}

describe('CheckboxGroup 禁用态契约（判定函数）', () => {
    const cases: { name: string, style: string, issues: number }[] = [
        {
            name: '分组根仅声明 gap / 排版 → 通过',
            style: '.caomei-checkbox-group { display: flex; gap: var(--caomei-checkbox-group-gap, var(--caomei-space-2)); }',
            issues: 0,
        },
        {
            name: '分组根声明 opacity → 违约',
            style: '.caomei-checkbox-group { opacity: var(--caomei-disabled-opacity); }',
            issues: 1,
        },
        {
            name: '分组 --disabled 修饰声明 opacity → 违约',
            style: '.caomei-checkbox-group--disabled { opacity: 0.5; }',
            issues: 1,
        },
        {
            name: '子部件 __options 声明 opacity → 不在分组层受检面',
            style: '.caomei-checkbox-group__options { opacity: 0.5; }',
            issues: 0,
        },
        {
            name: '注释内出现 opacity 不算声明 → 通过',
            style: '/* 禁用态不叠加 opacity */.caomei-checkbox-group { gap: 0; }',
            issues: 0,
        },
    ]

    it.each(cases)('$name', ({ style, issues }) => {
        expect(checkCheckboxGroupDisabledContract(style)).toHaveLength(issues)
    })
})

describe('CheckboxGroup 禁用态契约（仓库现状）', () => {
    it('分组层不声明 opacity', () => {
        expect(checkCheckboxGroupDisabledContract(styleOf(readFileSync(CHECKBOX_GROUP, 'utf8')))).toEqual([])
    })
})
