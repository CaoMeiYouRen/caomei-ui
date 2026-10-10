import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterAll, describe, expect, it } from 'vitest'
import {
    checkGovernanceCounts,
    COUNT_FAMILIES,
    extractCounts,
    parseIndexEntries,
    projectRoot,
} from './check-governance-counts.mjs'

const tempDirs = []

afterAll(() => {
    for (const dir of tempDirs) {
        rmSync(dir, { recursive: true, force: true })
    }
})

/** 构造治理目录夹具：`index.md` + 各记录本体。 */
function createFixture(entries) {
    const dir = mkdtempSync(join(tmpdir(), 'check-governance-counts-'))
    tempDirs.push(dir)
    const govDir = join(dir, 'docs', 'design', 'governance')
    mkdirSync(govDir, { recursive: true })
    const index = entries.map((entry) => `- [${entry.file}](./${entry.file})：${entry.index}`).join('\n')
    writeFileSync(join(govDir, 'index.md'), `${index}\n`)
    for (const entry of entries) {
        writeFileSync(join(govDir, entry.file), entry.body)
    }
    return dir
}

describe('COUNT_FAMILIES', () => {
    it('至少覆盖一个计数族', () => {
        expect(COUNT_FAMILIES.length).toBeGreaterThan(0)
    })
})

describe('extractCounts', () => {
    it('测试计数容忍 `文件 / 例` 与 `文件 例` 两种写法', () => {
        expect(extractCounts('test 104 文件 / 2157 例').get('test')).toEqual(new Set(['104/2157']))
        expect(extractCounts('test 104 文件 2157 例').get('test')).toEqual(new Set(['104/2157']))
    })

    it('提取 e2e 计数', () => {
        expect(extractCounts('test:e2e 318 passed').get('e2e')).toEqual(new Set(['318']))
    })

    it('提取 e2e `N tests` 与多位数边界', () => {
        expect(extractCounts('15 tests').get('e2e')).toEqual(new Set(['15']))
        expect(extractCounts('119 passed').get('e2e')).toEqual(new Set(['119']))
        expect(extractCounts('11 文件 / 119 例').get('test')).toEqual(new Set(['11/119']))
    })

    it('提取 md / 命令计数', () => {
        expect(extractCounts('301 md / 166 命令').get('mdcmd')).toEqual(new Set(['301/166']))
    })

    it('提取治理记录计数', () => {
        expect(extractCounts('149 记录 / 339 指针').get('records')).toEqual(new Set(['149/339']))
    })
})

describe('parseIndexEntries', () => {
    it('只取治理目录内存在的记录', () => {
        const dir = createFixture([{ file: 'a.md', index: 'x', body: 'y' }])
        expect(parseIndexEntries(dir).map((entry) => entry.file)).toEqual(['a.md'])
    })
})

describe('checkGovernanceCounts', () => {
    it('仓库现状：索引摘要与记录本体计数一致', () => {
        const result = checkGovernanceCounts(projectRoot)
        expect(result.errors).toEqual([])
        expect(result.ok).toBe(true)
    })

    it('索引计数与本体矛盾时报错', () => {
        const dir = createFixture([
            { file: 'a.md', index: 'test 115 文件 / 2274 例', body: 'test 115 文件 / 2280 例' },
        ])
        const result = checkGovernanceCounts(dir, { minReconciled: 1 })
        expect(result.ok).toBe(false)
        expect(result.errors.join('\n')).toContain('未在记录本体出现')
    })

    it('本体无该族计数时跳过（不判失败）', () => {
        const dir = createFixture([
            { file: 'a.md', index: 'test 115 文件 / 2274 例', body: '本记录不含测试计数' },
        ])
        const result = checkGovernanceCounts(dir, { minReconciled: 0 })
        expect(result.errors).toEqual([])
        expect(result.ok).toBe(true)
        expect(result.reconciled).toBe(0)
    })

    it('受检面下界收窄时报错', () => {
        const dir = createFixture([
            { file: 'a.md', index: 'test 1 文件 / 2 例', body: 'test 1 文件 / 2 例' },
        ])
        const result = checkGovernanceCounts(dir, { minReconciled: 5 })
        expect(result.ok).toBe(false)
        expect(result.errors.join('\n')).toContain('受检面收窄')
    })
})
