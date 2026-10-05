import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

/**
 * 字段 invalid 语义契约（设计规范 §6）。
 *
 * 契约：校验态用**类 / 属性驱动的 invalid 语义**表达——`src/styles/field-shell.css`
 * 必须存在 `.caomei-field--invalid` 语义钩子；该钩子**不得以色值类命名**
 * （如 `--danger` / `--red`），其颜色声明必须经 `var(--caomei-*)` token，
 * 不得使用 `#hex` / `rgb()` / `hsl()` 字面量。
 *
 * happy-dom 无布局引擎，故这里守住**声明**层面。
 */

const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..')
const FIELD_SHELL = join(REPO_ROOT, 'src', 'styles', 'field-shell.css')

const INVALID_SELECTOR_RE = /\.caomei-field--invalid(?![\w-])/
/** 以颜色词 / 色值语气命名的状态类（invalid 语义不得如此表达）。 */
const COLOR_NAMED_HOOK_RE = /\.caomei-field--(?:red|orange|yellow|green|blue|purple|pink|gray|grey|black|white|cyan|teal|magenta|lime|navy|olive|maroon|silver|aqua|fuchsia|danger|warning|success|error|info)(?![\w-])/i
/** 原始颜色字面量（hex / 函数式 / CSS 命名色；token 引用 `var(--caomei-*)` 不含在内）。 */
const RAW_COLOR_RE = /#[0-9a-f]{3,8}\b|\brgba?\(|\bhsla?\(|\b(?:red|orange|yellow|green|blue|purple|pink|gray|grey|black|white|cyan|teal|magenta|lime|navy|olive|maroon|silver|aqua|fuchsia)\b/i

export interface ContractIssue {
    reason: string
}

function styleRules(css: string): { selector: string, body: string }[] {
    const stripped = css.replace(/\/\*[\s\S]*?\*\//g, '')
    return [...stripped.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map((match) => ({ selector: match[1].trim(), body: match[2] }))
}

/**
 * 校验字段 invalid 语义表达。
 *
 * @param css `field-shell.css` 文本
 * @returns 违约项（空数组即通过）
 */
export function checkFieldInvalidSemantics(css: string): ContractIssue[] {
    const rules = styleRules(css)
    const issues: ContractIssue[] = []
    const invalidRules = rules.filter((rule) => INVALID_SELECTOR_RE.test(rule.selector))
    if (invalidRules.length === 0) {
        issues.push({ reason: '缺少 `.caomei-field--invalid` 语义钩子' })
    }
    for (const rule of rules) {
        if (COLOR_NAMED_HOOK_RE.test(rule.selector)) {
            issues.push({ reason: `invalid 语义不得以色值类表达：${rule.selector.split(',').map((part) => part.trim()).find((part) => COLOR_NAMED_HOOK_RE.test(part)) ?? rule.selector}` })
        }
    }
    for (const rule of invalidRules) {
        if (RAW_COLOR_RE.test(rule.body)) {
            issues.push({ reason: 'invalid 规则使用原始颜色字面量，须走 `var(--caomei-*)` token' })
        }
    }
    return issues
}

describe('字段 invalid 语义契约（判定函数）', () => {
    const cases: { name: string, css: string, issues: number }[] = [
        {
            name: 'invalid 钩子 + token 颜色 → 通过',
            css: '.caomei-field--invalid { border-color: var(--caomei-field-invalid-border-color); }',
            issues: 0,
        },
        {
            name: '缺少 invalid 钩子 → 违约',
            css: '.caomei-field:focus-within { border-color: var(--caomei-color-primary); }',
            issues: 1,
        },
        {
            name: 'invalid 规则使用 #hex → 违约',
            css: '.caomei-field--invalid { border-color: #ff0000; }',
            issues: 1,
        },
        {
            name: 'invalid 规则使用 CSS 命名色 red → 违约',
            css: '.caomei-field--invalid { border-color: red; }',
            issues: 1,
        },
        {
            name: '色值类钩子 .caomei-field--yellow → 违约（与 invalid 钩子并存时仅计色值类）',
            css: '.caomei-field--invalid { border-color: var(--caomei-field-invalid-border-color); }\n.caomei-field--yellow { border-color: var(--caomei-color-warning); }',
            issues: 1,
        },
        {
            name: '色值类钩子 .caomei-field--danger → 违约（与 invalid 钩子并存时仅计色值类）',
            css: '.caomei-field--invalid { border-color: var(--caomei-field-invalid-border-color); }\n.caomei-field--danger { border-color: var(--caomei-color-danger); }',
            issues: 1,
        },
        {
            name: '注释内出现 invalid 类名不计入钩子 → 违约（缺钩子）',
            css: '/* .caomei-field--invalid {} */\n.caomei-field { border-color: var(--caomei-color-border); }',
            issues: 1,
        },
    ]

    it.each(cases)('$name', ({ css, issues }) => {
        expect(checkFieldInvalidSemantics(css)).toHaveLength(issues)
    })
})

describe('字段 invalid 语义契约（仓库现状）', () => {
    it('field-shell.css 以 `.caomei-field--invalid` + token 表达非法态', () => {
        expect(checkFieldInvalidSemantics(readFileSync(FIELD_SHELL, 'utf8'))).toEqual([])
    })
})
