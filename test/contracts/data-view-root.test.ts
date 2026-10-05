import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

/**
 * DataView 内容区根规则契约（设计规范 §6）。
 *
 * 契约：内容区**不设内边距与背景**——根规则 `.caomei-data-view` 不得声明
 * `padding*` / `background*`（条目排版由插槽内容决定）；`__header` / `__footer` /
 * `__empty` / `__loading` 的内边距与背景属合法，不在受检面。
 *
 * happy-dom 无布局引擎、也不算 scoped CSS，故这里守住**声明**层面。
 */

const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..')
const DATA_VIEW = join(REPO_ROOT, 'src', 'components', 'data-view', 'data-view.vue')

/** 根规则禁止的声明：内边距（含 `padding-block-start` 等多段长写）与背景（含 background-color / background-image）。 */
const FORBIDDEN_DECLARATION_RE = /(?:^|[;{\s])(padding[\w-]*|background(?:-color|-image)?)\s*:/

/** 根选择器：仅 `.caomei-data-view` 自身，不含 `__` / `--` 修饰。 */
const ROOT_SELECTOR = '.caomei-data-view'

export interface ContractIssue {
    selector: string
    declaration: string
}

function styleOf(source: string): string {
    return [...source.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)].map((match) => match[1]).join('\n')
}

/** 拆出平铺样式规则（剥离注释后；本项目组件样式不使用 CSS 嵌套）。 */
function styleRules(style: string): { selector: string, body: string }[] {
    const stripped = style.replace(/\/\*[\s\S]*?\*\//g, '')
    return [...stripped.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map((match) => ({ selector: match[1].trim(), body: match[2] }))
}

/**
 * 校验 DataView 根规则不声明内边距 / 背景。
 *
 * @param style scoped 样式文本
 * @returns 违约项（空数组即通过）
 */
export function checkDataViewRootContract(style: string): ContractIssue[] {
    const issues: ContractIssue[] = []
    for (const rule of styleRules(style)) {
        const selectors = rule.selector.split(',').map((part) => part.trim())
        if (!selectors.includes(ROOT_SELECTOR)) {
            continue
        }
        const match = FORBIDDEN_DECLARATION_RE.exec(rule.body)
        if (match) {
            issues.push({ selector: ROOT_SELECTOR, declaration: match[1] })
        }
    }
    return issues
}

describe('DataView 根规则契约（判定函数）', () => {
    const cases: { name: string, style: string, issues: number }[] = [
        {
            name: '根规则仅声明文字样式 → 通过',
            style: '.caomei-data-view { color: var(--caomei-color-text); font-family: var(--caomei-font-sans); }',
            issues: 0,
        },
        {
            name: '根规则声明 padding → 违约',
            style: '.caomei-data-view { padding: var(--caomei-space-3); }',
            issues: 1,
        },
        {
            name: '根规则声明 background → 违约',
            style: '.caomei-data-view { background: var(--caomei-color-bg); }',
            issues: 1,
        },
        {
            name: '根规则声明 padding 长写（padding-block-start）→ 违约',
            style: '.caomei-data-view { padding-block-start: var(--caomei-space-3); }',
            issues: 1,
        },
        {
            name: '根规则声明 padding-inline-end → 违约',
            style: '.caomei-data-view { padding-inline-end: 4px; }',
            issues: 1,
        },
        {
            name: '子部件规则声明内边距 → 合法（不在受检面）',
            style: '.caomei-data-view__empty { padding: var(--caomei-space-4); background: var(--caomei-color-bg); }',
            issues: 0,
        },
        {
            name: '根规则与子部件同组选择器 → 命根规则即受检',
            style: '.caomei-data-view, .caomei-data-view__footer { padding: 0; }',
            issues: 1,
        },
        {
            name: '注释内出现 padding 不算声明 → 通过',
            style: '/* .caomei-data-view { padding: 0; } */\n.caomei-data-view { color: red; }',
            issues: 0,
        },
    ]

    it.each(cases)('$name', ({ style, issues }) => {
        expect(checkDataViewRootContract(style)).toHaveLength(issues)
    })
})

describe('DataView 根规则契约（仓库现状）', () => {
    it('根规则不声明内边距 / 背景', () => {
        expect(checkDataViewRootContract(styleOf(readFileSync(DATA_VIEW, 'utf8')))).toEqual([])
    })
})
