import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

/**
 * InputGroup + Select 示例的可访问名契约。
 *
 * 契约：`CaomeiSelect` 的 `placeholder` 只作可见占位文案，不构成触发器的可访问名；
 * 示例必须显式给出 `aria-label`（或 `label`），否则文档站的示例在真实浏览器里是无名组合框。
 * 本契约守护中英两份示例源，并与 `test/a11y` 的组件级审计互补（后者不覆盖文档站示例）。
 */

const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..')

const EXAMPLES = [
    {
        locale: 'zh',
        file: join(REPO_ROOT, 'docs', 'examples', 'input-group', 'with-select.vue'),
        expectedName: '筛选状态',
    },
    {
        locale: 'en-US',
        file: join(REPO_ROOT, 'docs', 'i18n', 'en-US', 'examples', 'input-group', 'with-select.vue'),
        expectedName: 'Filter by status',
    },
]

/** 受检面下界：每份示例至少 1 个选择器（防止示例被清空后守卫空转） */
const MIN_SELECTS = 1

export interface SelectNameIssue {
    reason: string
}

/** 可访问名属性：`label` / `aria-label`（含 `:` / `v-bind:` 动态绑定形态） */
const NAME_ATTR_RE = /(?:^|\s)(?::|v-bind:)?(?:aria-)?label="([^"]*)"/g

/** 命中其一且值非纯空白即视为具备可访问名 */
function hasAccessibleName(attrs: string): boolean {
    return [...attrs.matchAll(NAME_ATTR_RE)].some((match) => match[1].trim().length > 0)
}

/**
 * 校验示例中每个 `CaomeiSelect` 都带非空可访问名。
 *
 * @param source 示例文件文本
 * @returns 违约项（空数组即通过）
 */
export function checkSelectAccessibleName(source: string): SelectNameIssue[] {
    const issues: SelectNameIssue[] = []
    const blocks = [...source.matchAll(/<CaomeiSelect\b([^>]*?)\/?>/g)]

    if (blocks.length < MIN_SELECTS) {
        issues.push({ reason: `未找到 CaomeiSelect（下界 ${MIN_SELECTS}）` })
    }

    blocks.forEach((match, index) => {
        if (!hasAccessibleName(match[1])) {
            issues.push({ reason: `第 ${index + 1} 个 CaomeiSelect 缺少显式可访问名（label / aria-label）` })
        }
    })

    return issues
}

describe('InputGroup + Select 示例可访问名', () => {
    it.each(EXAMPLES)('$locale 示例给出显式可访问名', ({ file, expectedName }) => {
        const source = readFileSync(file, 'utf8')

        expect(checkSelectAccessibleName(source)).toEqual([])
        expect(source).toContain(`aria-label="${expectedName}"`)
    })

    it('仅用 placeholder 时判为违约', () => {
        const source = '<template><CaomeiSelect placeholder="筛选状态" /></template>'

        expect(checkSelectAccessibleName(source)).toEqual([
            { reason: '第 1 个 CaomeiSelect 缺少显式可访问名（label / aria-label）' },
        ])
    })

    it('可访问名为纯空白时判为违约', () => {
        const source = '<template><CaomeiSelect aria-label=" " /></template>'

        expect(checkSelectAccessibleName(source)).toEqual([
            { reason: '第 1 个 CaomeiSelect 缺少显式可访问名（label / aria-label）' },
        ])
    })

    it('label 属性同样满足契约', () => {
        const source = '<template><CaomeiSelect label="筛选状态" /></template>'

        expect(checkSelectAccessibleName(source)).toEqual([])
    })
})
