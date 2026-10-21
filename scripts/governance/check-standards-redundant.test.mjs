import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { afterAll, describe, expect, it } from 'vitest'
import {
    DEFAULT_KEYWORDS,
    MIN_STANDARDS_FILES,
    OPTIONAL_KEYWORDS,
    scanFile,
    scanStandards,
} from './check-standards-redundant.mjs'

const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..')

const tempDirs = []

afterAll(() => {
    for (const dir of tempDirs) {
        rmSync(dir, { recursive: true, force: true })
    }
})

function createFixture(files) {
    const root = mkdtempSync(join(tmpdir(), 'check-standards-redundant-'))
    tempDirs.push(root)
    for (const [relativePath, content] of Object.entries(files)) {
        const file = join(root, relativePath)
        mkdirSync(dirname(file), { recursive: true })
        writeFileSync(file, content)
    }
    return root
}

describe('scanFile', () => {
    it('命中关键词并给出行列与片段', () => {
        const root = createFixture({ 'a.md': '第一行\n这里是一段经验总结\n' })
        const hits = scanFile(join(root, 'a.md'))

        expect(hits).toHaveLength(1)
        expect(hits[0]).toMatchObject({ line: 2, keyword: '经验' })
        expect(hits[0].snippet).toContain('经验')
    })

    it('围栏代码块内不扫', () => {
        const root = createFixture({ 'a.md': '```md\n经验\n```\n' })
        expect(scanFile(join(root, 'a.md'))).toEqual([])
    })

    it('行内代码不扫', () => {
        const root = createFixture({ 'a.md': '写作 `经验` 与 `教训` 都不计\n' })
        expect(scanFile(join(root, 'a.md'))).toEqual([])
    })

    it('同一行多次命中分别计数', () => {
        const root = createFixture({ 'a.md': '经验与经验\n' })
        expect(scanFile(join(root, 'a.md'))).toHaveLength(2)
    })

    it('可选关键词默认不纳入', () => {
        const root = createFixture({ 'a.md': '沉淀\n' })
        const file = join(root, 'a.md')
        expect(scanFile(file)).toEqual([])
        expect(scanFile(file, [...DEFAULT_KEYWORDS, ...OPTIONAL_KEYWORDS])).toHaveLength(1)
    })
})

describe('scanStandards', () => {
    it('只扫 docs/standards 下的 md 并只返回有命中的文件', () => {
        const root = createFixture({
            'docs/standards/a.md': '教训\n',
            'docs/standards/b.md': '规范正文\n',
            'docs/standards/c.txt': '教训\n',
        })
        const results = scanStandards(root)

        expect(results).toHaveLength(1)
        expect(results[0].file).toBe(join('docs', 'standards', 'a.md'))
        expect(results[0].hits).toHaveLength(1)
    })

    it('includeSediment 控制「沉淀」关键词', () => {
        const root = createFixture({ 'docs/standards/a.md': '沉淀\n' })

        expect(scanStandards(root)).toEqual([])
        expect(scanStandards(root, { includeSediment: true })).toHaveLength(1)
    })

    it('受检面低于下界时 fail-closed', () => {
        const root = createFixture({ 'docs/standards/a.md': 'A\n' })
        expect(() => scanStandards(root, { minFiles: 2 })).toThrow(/受检面收窄/)
    })

    it('仓库现状：规范目录不少于下界且 0 命中', () => {
        const results = scanStandards(REPO_ROOT, { minFiles: MIN_STANDARDS_FILES })
        expect(results).toEqual([])
    })
})
