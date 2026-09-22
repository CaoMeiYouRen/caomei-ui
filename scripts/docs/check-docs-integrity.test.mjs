import { existsSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { describe, expect, it } from 'vitest'
import {
    STRUCTURAL_HEADING_MAX_LEVEL,
    countHeadings,
    countStructuralHeadings,
    inspectMarkdownContent,
    SHRINK_EXEMPT_FILES,
    SHRINK_MIN_HEAD_LINES,
    shouldWarnShrink,
    shouldWarnStructuralHeadingLoss,
} from './check-docs-integrity.mjs'

/** 自工作目录向上定位仓库根（以 `.github/skills` 为锚点）。 */
function resolveRepoRoot() {
    let dir = process.cwd()
    while (!existsSync(join(dir, '.github/skills'))) {
        const parent = dirname(dir)
        if (parent === dir) {
            throw new Error('未能定位仓库根目录')
        }
        dir = parent
    }
    return dir
}

const PROJECT_ROOT = resolveRepoRoot()

describe('inspectMarkdownContent', () => {
    it('放行正常文档', () => {
        const content = '# 标题\n\n正文段落。\n\n| 列 A | 列 B |\n| --- | --- |\n| 1 | 2 |\n'
        expect(inspectMarkdownContent(content)).toEqual([])
    })

    it('检出空文档与纯空白文档', () => {
        expect(inspectMarkdownContent('')).toEqual([expect.objectContaining({ type: 'empty' })])
        expect(inspectMarkdownContent('\n\n   \n')).toEqual([expect.objectContaining({ type: 'empty' })])
    })

    it('检出代码围栏不成对', () => {
        expect(inspectMarkdownContent('# 标题\n\n```\ncode\n')).toEqual([expect.objectContaining({ type: 'unbalanced-code-fence' })])
        expect(inspectMarkdownContent('# 标题\n\n~~~\ncode\n')).toEqual([expect.objectContaining({ type: 'unbalanced-code-fence' })])
    })

    it('放行成对的代码围栏', () => {
        expect(inspectMarkdownContent('# 标题\n\n```ts\nconst a = 1\n```\n')).toEqual([])
        expect(inspectMarkdownContent('# 标题\n\n~~~md\ntext\n~~~\n')).toEqual([])
    })

    it('检出孤立表格行（缺分隔行）', () => {
        expect(inspectMarkdownContent('# 标题\n\n| 孤立行 | 说明 |\n')).toEqual([expect.objectContaining({ type: 'orphan-table-row' })])
    })

    it('检出被截断的表格（有数据行但缺分隔行）', () => {
        expect(inspectMarkdownContent('| 表头 | 表头 |\n| 数据 | 数据 |\n')).toEqual([expect.objectContaining({ type: 'orphan-table-row' })])
    })

    it('跳过围栏代码块内的 | 行（``` / ~~~ / 四反引号嵌套）', () => {
        expect(inspectMarkdownContent('# 标题\n\n```md\n| 片段 | 无分隔行 |\n```\n')).toEqual([])
        expect(inspectMarkdownContent('# 标题\n\n~~~\n| pipe | no-delimiter |\n~~~\n')).toEqual([])
        expect(inspectMarkdownContent('# 标题\n\n````md\n```\n| pipe |\n```\n````\n')).toEqual([])
    })

    it('跳过缩进代码块内的 | 行', () => {
        expect(inspectMarkdownContent('# 标题\n\n    | raw | pipe |\n')).toEqual([])
    })

    it('放行首行即分隔行的表格块（列表项内表格 / 续行边界）', () => {
        expect(inspectMarkdownContent('- | a | b |\n  | --- | --- |\n')).toEqual([])
    })

    it('放行带对齐的表格', () => {
        expect(inspectMarkdownContent('# 标题\n\n| 左 | 中 | 右 |\n| :-- | :-: | --: |\n| 1 | 2 | 3 |\n')).toEqual([])
    })
})

describe('shouldWarnShrink', () => {
    it('HEAD 过短时不比对', () => {
        expect(shouldWarnShrink(SHRINK_MIN_HEAD_LINES - 1, 0)).toBe(false)
    })

    it('行数远低于 HEAD 时告警（清空 / 大面积截断）', () => {
        expect(shouldWarnShrink(200, 0)).toBe(true)
        expect(shouldWarnShrink(200, 59)).toBe(true)
    })

    it('正常删减与增长不告警', () => {
        expect(shouldWarnShrink(200, 60)).toBe(false)
        expect(shouldWarnShrink(200, 240)).toBe(false)
    })

    it('HEAD 不存在（新文件）时不告警', () => {
        expect(shouldWarnShrink(0, 0)).toBe(false)
    })
})

describe('shouldWarnStructuralHeadingLoss（豁免文件的 H1/H2 骨架下界）', () => {
    it('阶段 / 条目标题（H3/H4）移除不告警（归档形态）', () => {
        const head = '# 待办事项\n\n## 当前阶段\n\n### Phase 11：说明\n\n#### M1 主线\n\n#### M2 主线\n'
        const current = '# 待办事项\n\n## 当前阶段\n\n无进行中阶段。\n'
        // 收紧前后的差别即本守卫的「有意收窄」：全标题数确实减少，但骨架未受损
        expect(countHeadings(current)).toBeLessThan(countHeadings(head))
        expect(shouldWarnStructuralHeadingLoss(head, current)).toBe(false)
    })

    it('骨架标题（H2）缺失时告警（截断形态）', () => {
        const head = '# 待办事项\n\n## 当前阶段\n\n## 未完成项汇总\n'
        const current = '# 待办事项\n\n## 当前阶段\n'
        expect(shouldWarnStructuralHeadingLoss(head, current)).toBe(true)
    })

    it('一级标题（H1）缺失时告警', () => {
        expect(shouldWarnStructuralHeadingLoss('# 标题\n\n## 一节\n', '## 一节\n')).toBe(true)
    })

    it('骨架标题数不变或增长时不告警', () => {
        const head = '# 标题\n\n## 一节\n'
        expect(shouldWarnStructuralHeadingLoss(head, '# 标题\n\n## 一节\n')).toBe(false)
        expect(shouldWarnStructuralHeadingLoss(head, '# 标题\n\n## 一节\n\n## 二节\n')).toBe(false)
    })

    it('HEAD 缺失（新文件）或空内容时不告警', () => {
        expect(shouldWarnStructuralHeadingLoss(null, '## 一节\n')).toBe(false)
        expect(shouldWarnStructuralHeadingLoss('', '## 一节\n')).toBe(false)
    })
})

describe('countStructuralHeadings', () => {
    it('只统计围栏外的 H1/H2', () => {
        const content = ['# 一级', '## 二级', '### 三级', '#### 四级', '```md', '# 围栏内不算', '```'].join('\n')
        expect(countStructuralHeadings(content)).toBe(2)
        expect(countHeadings(content)).toBe(4)
    })

    it('骨架层级由 STRUCTURAL_HEADING_MAX_LEVEL 单点派生', () => {
        const content = '# 一级\n## 二级\n### 三级\n'
        expect(STRUCTURAL_HEADING_MAX_LEVEL).toBe(2)
        expect(countHeadings(content, STRUCTURAL_HEADING_MAX_LEVEL)).toBe(2)
        expect(countStructuralHeadings(content)).toBe(2)
        expect(countHeadings(content, 3)).toBe(3)
        expect(countHeadings(content)).toBe(3)
    })
})

describe('countHeadings', () => {
    it('只统计围栏外的标题', () => {
        const content = '# 标题\n\n```md\n# 不是标题\n```\n\n## 二级\n'
        expect(countHeadings(content)).toBe(2)
    })
})

describe('SHRINK_EXEMPT_FILES', () => {
    it('当前仅豁免按设计越清理越短的载体', () => {
        expect(SHRINK_EXEMPT_FILES).toEqual(['docs/plan/todo.md'])
    })
})

describe('仓库不变量（结构下界）', () => {
    it('豁免文件的骨架标题仍在，且收窄口径已声明', () => {
        expect(STRUCTURAL_HEADING_MAX_LEVEL).toBe(2)
        const content = readFileSync(join(PROJECT_ROOT, 'docs/plan/todo.md'), 'utf8')
        // 有意的仓库状态断言：豁免文件须保留骨架标题（归档会合并 H2 时须同步改本行）
        expect(countStructuralHeadings(content)).toBeGreaterThanOrEqual(3)
    })
})
