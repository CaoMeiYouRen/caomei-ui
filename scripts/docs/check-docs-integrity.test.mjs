import { describe, expect, it } from 'vitest'
import {
    countHeadings,
    inspectMarkdownContent,
    SHRINK_EXEMPT_FILES,
    SHRINK_MIN_HEAD_LINES,
    shouldWarnHeadingLoss,
    shouldWarnShrink,
} from './check-docs-integrity.mjs'

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

describe('shouldWarnHeadingLoss（豁免文件的标题数结构下界）', () => {
    it('标题数减少时告警', () => {
        const head = '# 标题\n\n## 1\n\n## 2\n\n## 3\n'
        const current = '# 标题\n\n## 1\n'
        expect(shouldWarnHeadingLoss(head, current)).toBe(true)
    })

    it('标题数不变或增长时不告警（允许删减正文）', () => {
        const head = '# 标题\n\n## 1\n\n## 2\n'
        expect(shouldWarnHeadingLoss(head, '# 标题\n\n## 1\n\n## 2\n')).toBe(false)
        expect(shouldWarnHeadingLoss(head, '# 标题\n\n## 1\n\n## 2\n\n## 3\n')).toBe(false)
        // 归档清理的典型形态：正文大幅缩减但章节骨架不变
        const longBody = `${Array.from({ length: 86 }, (_, i) => `- 行 ${i}`).join('\n')}\n## 1\n## 2\n`
        expect(shouldWarnHeadingLoss(longBody, '## 1\n## 2\n')).toBe(false)
    })

    it('HEAD 缺失（新文件）或空内容时不告警', () => {
        expect(shouldWarnHeadingLoss(null, '## 1\n')).toBe(false)
        expect(shouldWarnHeadingLoss('', '## 1\n')).toBe(false)
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
