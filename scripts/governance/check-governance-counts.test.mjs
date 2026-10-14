import { spawnSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { afterAll, describe, expect, it } from 'vitest'
import {
    checkGovernanceCounts,
    checkIndexReadingResidue,
    collectCodeConstants,
    hasSnapshotMarker,
    ISSUE_CODES,
    MIN_CITED_CONSTANTS,
} from './check-governance-counts.mjs'

const SCRIPT = resolve(dirname(fileURLToPath(import.meta.url)), 'check-governance-counts.mjs')

const tempDirs = []

afterAll(() => {
    for (const dir of tempDirs) {
        rmSync(dir, { recursive: true, force: true })
    }
})

/** 建夹具仓库：`code` = 代码侧文件（相对 `scripts/`），`docs` = 文档侧文件（相对 `docs/`）。 */
function createFixture({ code = {}, docs = {} }) {
    const root = mkdtempSync(join(tmpdir(), 'check-governance-counts-'))
    tempDirs.push(root)
    const write = (relativePath, content) => {
        const file = join(root, relativePath)
        mkdirSync(dirname(file), { recursive: true })
        writeFileSync(file, content)
    }
    for (const [name, content] of Object.entries(code)) {
        write(`scripts/${name}`, content)
    }
    for (const [name, content] of Object.entries(docs)) {
        write(`docs/${name}`, content)
    }
    return root
}

function runCli(args) {
    return spawnSync('node', [SCRIPT, ...args], { encoding: 'utf8' })
}

const CODE = 'export const FLOOR_A = 10\n'

describe('collectCodeConstants', () => {
    it('采集 export const 数值常量与 SCOPE_FLOOR 键', () => {
        const root = createFixture({
            code: { 'a.mjs': 'export const FLOOR_A = 10\nexport const SCOPE_FLOOR = { files: 20 }\n' },
        })
        const map = collectCodeConstants(root)
        expect([...map.get('FLOOR_A')]).toEqual(['10'])
        expect([...map.get('SCOPE_FLOOR.files')]).toEqual(['20'])
    })

    it('同名常量跨文件收录为取值集合', () => {
        const root = createFixture({
            code: { 'a.mjs': 'export const FLOOR_A = 10\n', 'b.mjs': 'export const FLOOR_A = 25\n' },
        })
        expect([...collectCodeConstants(root).get('FLOOR_A')].sort()).toEqual(['10', '25'])
    })
})

describe('checkGovernanceCounts（夹具）', () => {
    it('引述与代码一致时不报问题', () => {
        const root = createFixture({ code: { 'a.mjs': CODE }, docs: { 'x.md': '`FLOOR_A = 10`\n' } })
        const result = checkGovernanceCounts(root, { enforceScope: false })
        expect(result.issues).toEqual([])
        expect(result.cited).toBe(1)
    })

    it('引述值与代码不符判 const-value-mismatch 并列出候选取值', () => {
        const root = createFixture({ code: { 'a.mjs': CODE }, docs: { 'x.md': '`FLOOR_A = 99`\n' } })
        const result = checkGovernanceCounts(root, { enforceScope: false })
        expect(result.issues.map((issue) => issue.code)).toEqual([ISSUE_CODES.mismatch])
        expect(result.issues[0].detail).toContain('10')
    })

    it('同名常量跨文件：命中任一取值即通过', () => {
        const root = createFixture({
            code: { 'a.mjs': 'export const FLOOR_A = 10\n', 'b.mjs': 'export const FLOOR_A = 25\n' },
            docs: { 'x.md': '`FLOOR_A = 25`\n' },
        })
        expect(checkGovernanceCounts(root, { enforceScope: false }).issues).toEqual([])
    })

    it('标注快照的引述跳过（历史记录可保留当时取值）', () => {
        const root = createFixture({
            code: { 'a.mjs': CODE },
            docs: { 'x.md': '预算锚点当时为 `FLOOR_A = 47`，后经扩面调整。\n' },
        })
        const result = checkGovernanceCounts(root, { enforceScope: false })
        expect(result.issues).toEqual([])
        expect(result.cited).toBe(0)
    })

    it('快照标记只看同一行：上一行的标记词不得豁免本行引述', () => {
        const text = '标记词包括 当时 / 快照 / 原为 等。\n另一行的 `FLOOR_A = 99`。'
        const match = /`FLOOR_A = 99`/.exec(text)
        expect(hasSnapshotMarker(text, { index: match.index, '0': match[0] })).toBe(false)
    })

    it('快照标记支持同行后缀标注', () => {
        const text = '`FLOOR_A = 99`（当时）'
        const match = /`FLOOR_A = 99`/.exec(text)
        expect(hasSnapshotMarker(text, { index: match.index, '0': match[0] })).toBe(true)
    })

    it('支持带点号的常量引述（SCOPE_FLOOR.key）', () => {
        const root = createFixture({
            code: { 'a.mjs': 'export const SCOPE_FLOOR = { entries: 1 }\n' },
            docs: { 'x.md': '`SCOPE_FLOOR.entries = 1`\n' },
        })
        const result = checkGovernanceCounts(root, { enforceScope: false })
        expect(result.issues).toEqual([])
        expect(result.cited).toBe(1)
        expect(result.distinctNames).toBe(1)
    })

    it('代码中无同名常量的引述跳过', () => {
        const root = createFixture({ code: { 'a.mjs': CODE }, docs: { 'x.md': '`NOT_IN_CODE = 3`\n' } })
        const result = checkGovernanceCounts(root, { enforceScope: false })
        expect(result.issues).toEqual([])
        expect(result.cited).toBe(0)
    })

    it('受检面下界：可比对的「不同常量名」数低于下界判 scope-narrowed', () => {
        const root = createFixture({ code: { 'a.mjs': CODE }, docs: { 'x.md': '`FLOOR_A = 10`\n' } })
        const result = checkGovernanceCounts(root, { minCited: 5 })
        expect(result.issues.map((issue) => issue.code)).toEqual([ISSUE_CODES.scopeNarrowed])
        expect(MIN_CITED_CONSTANTS).toBeGreaterThan(0)
    })

    it('enforceScope=false 时不下受检面断言', () => {
        const root = createFixture({ code: { 'a.mjs': CODE }, docs: { 'x.md': '`FLOOR_A = 10`\n' } })
        expect(checkGovernanceCounts(root, { enforceScope: false }).issues).toEqual([])
    })
})

describe('checkIndexReadingResidue（sweep 防复发）', () => {
    it('索引含命令输出总量读数即判 index-reading-residue', () => {
        const root = createFixture({ docs: { 'design/governance/index.md': '- 条目：`pnpm verify` exit 0（120 文件 / 2384 例）。\n' } })
        const issues = checkIndexReadingResidue(root)
        expect(issues.map((issue) => issue.code)).toEqual([ISSUE_CODES.indexResidue])
    })

    it('悬空残句（= tests）同样命中', () => {
        const root = createFixture({ docs: { 'design/governance/index.md': '- 条目：5 用例 × 3 视口 = tests。\n' } })
        expect(checkIndexReadingResidue(root).map((issue) => issue.code)).toEqual([ISSUE_CODES.indexResidue])
    })

    it('索引不存在时不报错', () => {
        const root = createFixture({ docs: { 'other.md': '# x\n' } })
        expect(checkIndexReadingResidue(root)).toEqual([])
    })
})

describe('CLI', () => {
    it('一致夹具 exit 0（受检面须超过下界）', () => {
        // 下界按「不同常量名」计，防静默收窄：夹具以 MIN_CITED_CONSTANTS + 1 个不同常量名覆盖最小可比面。
        const names = Array.from({ length: MIN_CITED_CONSTANTS + 1 }, (_, i) => `FLOOR_N${i}`)
        const code = { 'a.mjs': `${names.map((n) => `export const ${n} = 10`).join('\n')}\n` }
        const docs = { 'x.md': `${names.map((n) => `\`${n} = 10\``).join('；')}\n` }
        const root = createFixture({ code, docs })
        const result = runCli(['--root', root])
        expect(result.status).toBe(0)
    })

    it('不符夹具 exit 1', () => {
        const root = createFixture({ code: { 'a.mjs': CODE }, docs: { 'x.md': '`FLOOR_A = 11`\n' } })
        const result = runCli(['--root', root])
        expect(result.status).toBe(1)
        expect(result.stderr).toContain(ISSUE_CODES.mismatch)
    })

    it('未知名参数 exit 2', () => {
        expect(runCli(['--bogus']).status).toBe(2)
    })

    it('`--root` 缺值 exit 2', () => {
        expect(runCli(['--root']).status).toBe(2)
    })

    it('目标目录不存在 exit 2', () => {
        expect(runCli(['--root', join(tmpdir(), 'no-such-dir-xyz')]).status).toBe(2)
    })
})
