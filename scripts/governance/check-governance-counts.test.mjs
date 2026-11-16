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
    evaluateChain,
    findArithmeticIssues,
    checkRecordCounts,
    hasSnapshotMarker,
    inspectFileFace,
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

describe('findArithmeticIssues（记录内算式）', () => {
    it('成立的减法 / 加法恒等式不报问题', () => {
        expect(findArithmeticIssues('实测 10 − 3 = 7（表内求和）\n贡献 5 + 2 + 3 = 10')).toEqual([])
    })

    it('加减混排按从左到右求值', () => {
        expect(evaluateChain('32 − 4 + 1')).toBe(29)
        expect(findArithmeticIssues('复算 32 − 4 + 1 = 29')).toEqual([])
        expect(findArithmeticIssues('复算 32 − 4 + 1 = 30')).toHaveLength(1)
    })

    it('行内代码里的算例（含负向语料）不参与判定', () => {
        expect(findArithmeticIssues('反例：`10 − 4 = 7` 会被判红')).toEqual([])
    })

    it('减法不成立时报行号与原文', () => {
        const issues = findArithmeticIssues('第一行\n实测 10 − 4 = 7')
        expect(issues).toHaveLength(1)
        expect(issues[0]).toContain('第 2 行')
        expect(issues[0]).toContain('10 − 4 = 7')
    })

    it('加法链不成立时报出实际求和', () => {
        const issues = findArithmeticIssues('贡献 5 + 2 + 4 = 10')
        expect(issues).toHaveLength(1)
        expect(issues[0]).toContain('11')
    })

    it('条目编号形态不被当作减法', () => {
        expect(findArithmeticIssues('X1-2 = 10；X3-1 4 / X3-2 5')).toEqual([])
    })

    it('围栏代码块与表格行不在受检面', () => {
        const text = ['```', '10 - 4 = 7', '```', '| 10 - 4 = 7 | x |'].join('\n')
        expect(findArithmeticIssues(text)).toEqual([])
    })

    it('围栏之后的报错行号与原文一致', () => {
        const text = ['```', '10 - 4 = 7', '```', '中间行', '实测 10 − 4 = 7'].join('\n')
        const issues = findArithmeticIssues(text)
        expect(issues).toHaveLength(1)
        expect(issues[0]).toContain('第 5 行')
    })

    it('千分位与负结果按数值判定', () => {
        expect(findArithmeticIssues('总量 1,000 − 200 = 800')).toEqual([])
        expect(findArithmeticIssues('差值 1 − 2 = -1')).toEqual([])
    })
})

describe('inspectFileFace（§1 文件面模板）', () => {
    const table = (paths) => ['| 面 | 文件 |', '|:---|:---|', ...paths.map((p) => `| 面 | \`${p}\` |`)].join('\n')

    it('未声明文件数时返回 null', () => {
        expect(inspectFileFace(`## 1. 交付面\n${table(['src/a.ts'])}`)).toBeNull()
    })

    it('声明数等于表内仓库相对路径去重数时一致', () => {
        const face = inspectFileFace(`## 1. 交付面（2 文件）\n${table(['src/a.ts', 'src/b.ts', 'src/a.ts'])}`)
        expect(face).toEqual({ declared: 2, counted: 2, paths: ['src/a.ts', 'src/b.ts'] })
    })

    it('表内路径数与声明不符时给出两读数', () => {
        const face = inspectFileFace(`## 1. 交付面（3 文件）\n${table(['src/a.ts', 'docs/b.md'])}`)
        expect(face?.declared).toBe(3)
        expect(face?.counted).toBe(2)
    })

    it('非仓库相对路径（链接、brace 展开）不计入', () => {
        const section = ['## 1. 交付面（1 文件）', '| 面 | 文件 |', '|:---|:---|', '| a | [链接](../x.md) |', '| b | `src/{a,b}.ts` |', '| c | `src/ok.ts` |'].join('\n')
        expect(inspectFileFace(section)?.counted).toBe(1)
    })
})

describe('checkRecordCounts（记录级机检）', () => {
    const faceRecord = (declared, paths) => [
        `## 1. 交付面（${declared} 文件）`,
        '',
        '| 面 | 文件 |',
        '|:---|:---|',
        ...paths.map((path) => `| 面 | \`${path}\` |`),
        '',
    ].join('\n')

    it('新记录的文件面声明与表内路径数不符时判 record-file-face-mismatch', () => {
        const root = createFixture({ docs: { 'design/governance/2026-11-16-x.md': faceRecord(3, ['src/a.ts']) } })
        const issues = checkRecordCounts(root)
        expect(issues.map((issue) => issue.code)).toContain(ISSUE_CODES.fileFaceMismatch)
    })

    it('cutover 之前的记录不走文件面模板（存量不回改）', () => {
        const root = createFixture({ docs: { 'design/governance/2026-11-15-x.md': faceRecord(3, ['src/a.ts']) } })
        expect(checkRecordCounts(root)).toEqual([])
    })

    it('记录内算式不成立时判 record-arithmetic-mismatch', () => {
        const root = createFixture({ docs: { 'plan/todo.md': '实测 10 − 4 = 7' } })
        const issues = checkRecordCounts(root)
        expect(issues.map((issue) => issue.code)).toContain(ISSUE_CODES.arithmeticMismatch)
    })

    it('用例数读数缺同行命令时判 record-count-unattributed', () => {
        const root = createFixture({ docs: { 'design/governance/2026-11-16-x.md': '单测 10 passed\n命令 `npx vitest run` → 10 passed' } })
        const issues = checkRecordCounts(root)
        expect(issues.filter((issue) => issue.code === ISSUE_CODES.countUnattributed)).toHaveLength(1)
    })
})
