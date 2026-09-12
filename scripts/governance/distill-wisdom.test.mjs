import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import {
    checkWisdom,
    countActiveEntries,
    isActiveEntryLine,
    parseWisdom,
    readWisdom,
    resolveThreshold,
    runDistillWisdom,
} from './distill-wisdom.mjs'

const sample = `# Session Wisdom

## 当前条目 (Active)

### 2026-09-12

- **[env] tmpdir**：可写 TMPDIR
- **[pattern] docs**：文档站链路

## 已蒸馏条目 (Historical)

- [2026-01-01] [bug] old → docs
`

describe('distill-wisdom', () => {
    const tempDirs = []

    // 仅清理本测试自建于系统临时目录下的 mkdtemp 目录
    function writeWisdom(content) {
        const dir = mkdtempSync(join(tmpdir(), 'caomei-wisdom-'))
        tempDirs.push(dir)
        const file = join(dir, 'wisdom.md')
        writeFileSync(file, content, 'utf8')
        return file
    }

    afterEach(() => {
        while (tempDirs.length > 0) {
            rmSync(tempDirs.pop(), { recursive: true, force: true })
        }
    })

    it('只统计活跃段条目，排除已蒸馏段', () => {
        expect(countActiveEntries(sample)).toBe(2)
        expect(parseWisdom(sample)).toEqual([
            '**[env] tmpdir**：可写 TMPDIR',
            '**[pattern] docs**：文档站链路',
        ])
    })

    it('忽略缩进子 bullet，只计顶层条目', () => {
        const markdown = `## 当前条目 (Active)\n\n- 顶层条目\n  - 子说明（不计入）\n- 另一条\n`
        expect(countActiveEntries(markdown)).toBe(2)
    })

    it('兼容无 bullet 的迁移摘要行', () => {
        const markdown = `## 当前条目 (Active)\n\n[2026-09-12] [env] a → docs/x.md\n- [2026-09-13] [bug] b\n`
        expect(countActiveEntries(markdown)).toBe(2)
    })

    it('兼容 CRLF 换行', () => {
        const markdown = '## 当前条目 (Active)\r\n\r\n- a\r\n- b\r\n'
        expect(countActiveEntries(markdown)).toBe(2)
    })

    it('isActiveEntryLine 识别两类条目行', () => {
        expect(isActiveEntryLine('- entry')).toBe(true)
        expect(isActiveEntryLine('[2026-09-12] [env] x')).toBe(true)
        expect(isActiveEntryLine('  - nested')).toBe(false)
        expect(isActiveEntryLine('### 2026-09-12')).toBe(false)
    })

    it('文件缺失时视为跳过且不报错', () => {
        expect(readWisdom('/nonexistent/caomei/wisdom.md')).toBeNull()
        expect(checkWisdom('/nonexistent/caomei/wisdom.md', 20)).toEqual({
            available: false,
            count: 0,
            threshold: 20,
            needsDistill: false,
        })
    })

    it('达到阈值时判定需要蒸馏', () => {
        const file = writeWisdom(sample)
        expect(checkWisdom(file, 2).needsDistill).toBe(true)
        expect(checkWisdom(file, 5).needsDistill).toBe(false)
    })

    it('阈值非法时回退默认值', () => {
        expect(resolveThreshold('abc')).toBe(20)
        expect(resolveThreshold('0')).toBe(20)
        expect(resolveThreshold('-3')).toBe(20)
        expect(resolveThreshold('15')).toBe(15)
    })

    it('CLI 输出契约：check / report / skipped', () => {
        const file = writeWisdom(sample)
        expect(runDistillWisdom(['--check'], { file }).message).toBe('WISDOM_OK: 2 active entries (threshold 20)')
        expect(runDistillWisdom(['--check', '--threshold=2'], { file }).message).toBe('WISDOM_NEEDS_DISTILL: 2 active entries (threshold 2)')
        expect(runDistillWisdom([], { file }).message).toBe('WISDOM_REPORT: 2 active entries (threshold 20)')
        expect(runDistillWisdom(['--check'], { file: '/nonexistent/caomei/wisdom.md' }).message).toBe('WISDOM_SKIPPED: wisdom not found')
    })
})
