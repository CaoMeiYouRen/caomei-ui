import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterAll, describe, expect, it } from 'vitest'
import {
    MIN_PHASE,
    checkArchiveSections,
    checkBlock,
    collectBlocks,
    countBullets,
    extractSubsection,
    splitPhaseBlocks,
} from './check-archive-sections.mjs'

const tempDirs = []

function createArchiveRoot({ main = '', deep = {} } = {}) {
    const dir = mkdtempSync(join(tmpdir(), 'check-archive-sections-'))
    tempDirs.push(dir)
    mkdirSync(join(dir, 'docs', 'plan', 'archive'), { recursive: true })
    writeFileSync(join(dir, 'docs', 'plan', 'todo-archive.md'), main)
    for (const [name, content] of Object.entries(deep)) {
        writeFileSync(join(dir, 'docs', 'plan', 'archive', name), content)
    }
    return dir
}

/** 完整合规的阶段块。 */
export const COMPLETE_BLOCK = [
    '## Phase 39：示例阶段（**2026-11-21 完成并归档；本阶段不发布**）',
    '',
    '- 时间：2026-11-21 登记。',
    '- 范围与授权：2 条主线 / 4 条原子条目。',
    '- 非目标：不发布。',
    '',
    '### M1 示例主线（2 条）',
    '',
    '- **M1-1 实现**：说明。RG `quick` `Pass`。',
    '',
    '### 阶段总结',
    '',
    '- 2 条主线全部交付；质量门 `pnpm test` 全绿。',
    '',
    '### 未覆盖边界',
    '',
    '- 真机验收未执行。',
    '',
    '### 遗留与后续候选',
    '',
    '- 其余候选见 Backlog。',
    '',
].join('\n')

afterAll(() => {
    for (const dir of tempDirs) {
        rmSync(dir, { recursive: true, force: true })
    }
})

describe('check-archive-sections 解析辅助', () => {
    it('splitPhaseBlocks 按 ## Phase <n> 切块', () => {
        const content = `${COMPLETE_BLOCK}\n## Phase 40：下一阶段（**完成并归档**）\n\n- 时间：x\n`
        const blocks = splitPhaseBlocks(content, 'todo-archive.md')
        expect(blocks.map((block) => block.phase)).toEqual([39, 40])
        expect(blocks[0].title).toContain('示例阶段')
    })

    it('extractSubsection 截到下一个二 / 三级标题', () => {
        const body = '\n### 阶段总结\n\n- 甲\n- 乙\n\n### 未覆盖边界\n\n- 丙\n'
        expect(extractSubsection(body, '阶段总结')).toContain('- 甲')
        expect(extractSubsection(body, '阶段总结')).not.toContain('- 丙')
        expect(extractSubsection(body, '不存在的节')).toBeUndefined()
    })

    it('countBullets 只统计顶层 bullet', () => {
        expect(countBullets('- 甲\n- 乙\n  - 缩进子条\n\n正文')).toBe(2)
    })
})

describe('check-archive-sections 6 项必填', () => {
    const base = { phase: 39, source: 'todo-archive.md' }

    it('完整块零问题', () => {
        const [block] = splitPhaseBlocks(COMPLETE_BLOCK, 'todo-archive.md')
        expect(checkBlock(block)).toEqual([])
    })

    it('标题缺「完成并归档」标记时报错', () => {
        const block = { ...base, title: '示例阶段（进行中）', body: splitPhaseBlocks(COMPLETE_BLOCK, 'a.md')[0].body }
        expect(checkBlock(block).join('\n')).toContain('完成并归档')
    })

    it('缺「未覆盖边界」时报错（历史归档块的原始缺陷）', () => {
        const content = COMPLETE_BLOCK.replace(/### 未覆盖边界[\s\S]*?(?=### 遗留)/u, '')
        const [block] = splitPhaseBlocks(content, 'docs/plan/archive/todo-archive-phases-39.md')
        expect(checkBlock(block).join('\n')).toContain('未覆盖边界')
    })

    it('小节只有标题没有条目时报错', () => {
        const content = COMPLETE_BLOCK.replace('- 真机验收未执行。\n', '')
        const [block] = splitPhaseBlocks(content, 'a.md')
        expect(checkBlock(block).join('\n')).toContain('没有任何条目')
    })

    it('元信息出现在第一个 ### 之后时不计入', () => {
        const content = COMPLETE_BLOCK
            .replace('- 非目标：不发布。\n', '')
            .replace('### 阶段总结', '### 阶段总结\n\n- 非目标：不发布。')
        const [block] = splitPhaseBlocks(content, 'a.md')
        expect(checkBlock(block).join('\n')).toContain('缺少元信息「非目标：」')
    })

    it('缺主线小节时报错', () => {
        const content = COMPLETE_BLOCK.replace('### M1 示例主线（2 条）', '### 说明')
        const [block] = splitPhaseBlocks(content, 'a.md')
        expect(checkBlock(block).join('\n')).toContain('缺少主线小节')
    })

    it('阶段总结缺质量门结论时报错', () => {
        const content = COMPLETE_BLOCK.replace('；质量门 `pnpm test` 全绿', '')
        const [block] = splitPhaseBlocks(content, 'a.md')
        expect(checkBlock(block).join('\n')).toContain('阶段总结未写明质量门结论')
    })

    it('块内没有任何 Review Gate 结论时报错', () => {
        const content = COMPLETE_BLOCK.replace('RG `quick` `Pass`。', '')
        const [block] = splitPhaseBlocks(content, 'a.md')
        expect(checkBlock(block).join('\n')).toContain('Review Gate')
    })

    it('「回扫口径」为豁免项，缺失不报错', () => {
        const [block] = splitPhaseBlocks(COMPLETE_BLOCK, 'a.md')
        expect(block.body).not.toContain('回扫口径')
        expect(checkBlock(block)).toEqual([])
    })
})

describe('check-archive-sections 受检面', () => {
    it('只收 Phase >= 39 的块', () => {
        const oldBlock = COMPLETE_BLOCK.replace('Phase 39', 'Phase 38')
        const dir = createArchiveRoot({ main: oldBlock })
        expect(collectBlocks(dir)).toEqual([])
        expect(MIN_PHASE).toBe(39)
    })

    it('主窗口与深度归档同时受检', () => {
        const dir = createArchiveRoot({
            main: COMPLETE_BLOCK,
            deep: { 'todo-archive-phases-40.md': COMPLETE_BLOCK.replace('Phase 39', 'Phase 40') },
        })
        const result = checkArchiveSections(dir)
        expect(result.ok).toBe(true)
        expect(result.checked).toBe(2)
    })

    it('受检面为空时报错（防静默收窄）', () => {
        const dir = createArchiveRoot({ main: '# 空\n' })
        const result = checkArchiveSections(dir)
        expect(result.ok).toBe(false)
        expect(result.errors.join('\n')).toContain('受检面为空')
    })

    it('任一深度归档块缺节即失败', () => {
        const broken = COMPLETE_BLOCK.replace('### 未覆盖边界', '### 其他')
        const dir = createArchiveRoot({
            main: COMPLETE_BLOCK,
            deep: { 'todo-archive-phases-39.md': broken },
        })
        const result = checkArchiveSections(dir)
        expect(result.ok).toBe(false)
        expect(result.errors.join('\n')).toContain('todo-archive-phases-39.md')
    })

    it('仓库当前通过全部检查', () => {
        const result = checkArchiveSections()
        expect(result.errors).toEqual([])
        expect(result.ok).toBe(true)
    })
})
