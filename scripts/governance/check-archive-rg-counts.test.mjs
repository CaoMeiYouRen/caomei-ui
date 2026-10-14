import { spawnSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { afterAll, describe, expect, it } from 'vitest'
import {
    checkArchiveRgCounts,
    extractCounts,
    ISSUE_CODES,
    listArchiveFiles,
    parseEntryLine,
    parseRounds,
    reviewGateSections,
} from './check-archive-rg-counts.mjs'

const SCRIPT = resolve(dirname(fileURLToPath(import.meta.url)), 'check-archive-rg-counts.mjs')

const tempDirs = []

afterAll(() => {
    for (const dir of tempDirs) {
        rmSync(dir, { recursive: true, force: true })
    }
})

/** 建夹具仓库（写入归档载体与治理记录）。 */
function createFixture({ archive, deepArchive = {}, records = {} }) {
    const root = mkdtempSync(join(tmpdir(), 'check-archive-rg-counts-'))
    tempDirs.push(root)
    const write = (relativePath, content) => {
        const file = join(root, relativePath)
        mkdirSync(dirname(file), { recursive: true })
        writeFileSync(file, content)
    }
    if (archive !== null) {
        write('docs/plan/todo-archive.md', archive)
    }
    for (const [name, content] of Object.entries(deepArchive)) {
        write(`docs/plan/archive/${name}`, content)
    }
    for (const [name, content] of Object.entries(records)) {
        write(`docs/design/governance/${name}`, content)
    }
    return root
}

function runCli(root) {
    return spawnSync('node', [SCRIPT, '--root', root], { encoding: 'utf8' })
}

const RECORD = [
    '# 记录 A',
    '',
    '## 7. Review Gate',
    '',
    '### 7.1 结论',
    '',
    '- R1 `standard` **`Pass`**（0 blocker / 0 warning / 3 suggest）。',
    '',
    '## 8. 未覆盖边界',
    '',
    '- 无。',
].join('\n')

describe('extractCounts', () => {
    it('识别带标签形态', () => {
        expect(extractCounts('（1 blocker / 3 warning / 2 suggest）')).toEqual({
            blocker: 1,
            warning: 3,
            suggest: 2,
        })
    })

    it('识别缺项形态（只写 blocker / suggest）', () => {
        expect(extractCounts('（1 blocker / 2 suggest）')).toEqual({ blocker: 1, suggest: 2 })
    })

    it('识别裸三元组', () => {
        expect(extractCounts('**Pass**（0 / 0 / 4）。')).toEqual({ blocker: 0, warning: 0, suggest: 4 })
    })

    it('括号外的计数不算数（轮次标签 `R1 suggest` 不得被读成 suggest=1）', () => {
        expect(extractCounts('- **R1 suggest**：RG-S1（不采纳）。')).toBeNull()
        expect(extractCounts('- **R1 warning**：较宽。')).toBeNull()
    })

    it('无全角括号时返回空', () => {
        expect(extractCounts('0 blocker / 0 warning / 3 suggest')).toBeNull()
    })
})

describe('parseRounds', () => {
    it('切分 R1 / R2 并保留各自计数', () => {
        const rounds = parseRounds('R1 `deep` **Reject**（1 blocker：残留证据；3 warning）→ 修复 → R2 `deep` **Pass**（0 / 0 / 1）。')
        expect(rounds.R1).toEqual({ blocker: 1, warning: 3 })
        expect(rounds.R2).toEqual({ blocker: 0, warning: 0, suggest: 1 })
    })

    it('未标轮次的计数归入 FINAL', () => {
        expect(parseRounds('RG `standard` **Pass**（0 / 0 / 3）。')).toEqual({
            FINAL: { blocker: 0, warning: 0, suggest: 3 },
        })
    })

    it('同一轮次重复出现时保留首个非空取值', () => {
        const rounds = parseRounds('R1 `standard` **Pass**（0 blocker / 0 warning / 3 suggest）。\n- **R1 suggest**：RG-S1（不采纳）。')
        expect(rounds.R1).toEqual({ blocker: 0, warning: 0, suggest: 3 })
    })

    it('无任何计数时返回空对象', () => {
        expect(parseRounds('RG `deep` **Pass**。')).toEqual({})
    })

    it('多位轮次按整体识别（R10 不得切成 R1）', () => {
        const rounds = parseRounds('R10 `standard` **Pass**（0 / 0 / 2）。')
        expect(rounds.R10).toEqual({ blocker: 0, warning: 0, suggest: 2 })
        expect(rounds.R1).toBeUndefined()
    })

    it('非轮次语境的 R<数字> 不误命中（如 AR1 不得被当作轮次）', () => {
        const rounds = parseRounds('AR1 是构件编号，其计数（0 / 0 / 1）。')
        expect(rounds.R1).toBeUndefined()
        expect(rounds.FINAL).toEqual({ blocker: 0, warning: 0, suggest: 1 })
    })
})

describe('reviewGateSections', () => {
    it('父章节含子标题时正文不丢失', () => {
        const section = reviewGateSections(RECORD)
        expect(section).toContain('0 blocker / 0 warning / 3 suggest')
    })

    it('排除非 Review Gate 章节', () => {
        const section = reviewGateSections(RECORD)
        expect(section).not.toContain('未覆盖边界')
    })

    it('无 Review Gate 章节时返回空串', () => {
        expect(reviewGateSections('# 标题\n\n## 1. 结论\n\n- 无。')).toBe('')
    })
})

describe('parseEntryLine', () => {
    it('接受带编号且含 RG 的条目行', () => {
        const parsed = parseEntryLine('- **M1-1 摘要**：说明。RG `standard` **Pass**（0 / 0 / 3）。记录见 [M1-1](../design/governance/a.md)。')
        expect(parsed).not.toBeNull()
        expect(parsed.rg.startsWith('RG')).toBe(true)
        expect(parsed.records).toEqual(['../design/governance/a.md'])
    })

    it('拒绝非条目行 / 无 RG 行 / 非治理记录链接', () => {
        expect(parseEntryLine('- **M1-1 摘要**：无审计结论段。')).toBeNull()
        expect(parseEntryLine('正文里提到 RG 但没有编号锚点。')).toBeNull()
        const parsed = parseEntryLine('- **M1-1 摘要**：RG `Pass`。见 [Backlog](../plan/backlog.md)。')
        expect(parsed.records).toEqual([])
    })

    it('不把 `RGETS` 之类词内命中当作 RG', () => {
        expect(parseEntryLine('- **M1-1 摘要**：`RGETS = 31`。')).toBeNull()
    })
})

describe('listArchiveFiles', () => {
    it('列出主窗口与深度归档目录', () => {
        const root = createFixture({
            archive: '# 归档\n',
            deepArchive: { 'phase-01.md': '# 深度归档\n' },
        })
        expect(listArchiveFiles(root)).toEqual(['docs/plan/todo-archive.md', 'docs/plan/archive/phase-01.md'])
    })

    it('主窗口缺失时不报错', () => {
        const root = createFixture({ archive: null })
        expect(listArchiveFiles(root)).toEqual([])
    })
})

describe('checkArchiveRgCounts（夹具）', () => {
    const consistentArchive = '- **M1-1 摘要**：说明。RG `standard` **Pass**（0 / 0 / 3）。记录见 [M1-1](../design/governance/a.md)。\n'
    const records = { 'a.md': RECORD }

    it('两处一致时不报问题', () => {
        const root = createFixture({ archive: consistentArchive, records })
        const result = checkArchiveRgCounts(root, { enforceScope: false })
        expect(result.issues).toEqual([])
        expect(result.entries).toBe(1)
        expect(result.compared).toBe(1)
        expect(result.reconciled).toBe(3)
    })

    it('串写计数判 rg-count-mismatch', () => {
        const root = createFixture({
            archive: consistentArchive.replace('（0 / 0 / 3）', '（0 / 0 / 4）'),
            records,
        })
        const result = checkArchiveRgCounts(root, { enforceScope: false })
        expect(result.issues.map((issue) => issue.code)).toEqual([ISSUE_CODES.mismatch])
        expect(result.issues[0].detail).toContain('suggest')
    })

    it('记录侧串写同样判失败（方向对称）', () => {
        const root = createFixture({
            archive: consistentArchive,
            records: { 'a.md': RECORD.replace('3 suggest', '5 suggest') },
        })
        const result = checkArchiveRgCounts(root, { enforceScope: false })
        expect(result.issues.map((issue) => issue.code)).toEqual([ISSUE_CODES.mismatch])
    })

    it('两处都缺该字段时跳过（不判失败也不计入比对）', () => {
        const root = createFixture({
            archive: '- **M1-1 摘要**：RG `standard` **Pass**（0 blocker）。记录见 [M1-1](../design/governance/a.md)。\n',
            records: { 'a.md': RECORD.replace('（0 blocker / 0 warning / 3 suggest）', '（0 blocker）') },
        })
        const result = checkArchiveRgCounts(root, { enforceScope: false })
        expect(result.issues).toEqual([])
        expect(result.reconciled).toBe(1)
    })

    it('条目无计数时不计入比对', () => {
        const root = createFixture({
            archive: '- **M1-1 摘要**：RG `deep` **Pass**。记录见 [M1-1](../design/governance/a.md)。\n',
            records,
        })
        const result = checkArchiveRgCounts(root, { enforceScope: false })
        expect(result.entries).toBe(1)
        expect(result.compared).toBe(0)
        expect(result.reconciled).toBe(0)
    })

    it('条目无候选记录时跳过', () => {
        const root = createFixture({ archive: consistentArchive })
        const result = checkArchiveRgCounts(root, { enforceScope: false })
        expect(result.compared).toBe(0)
        expect(result.issues).toEqual([])
    })

    it('多记录链接：任一份一致即该字段通过', () => {
        const root = createFixture({
            archive: '- **M1-1 摘要**：RG：R1 **Reject**（1 blocker）→ R2 **Pass**。记录见 [M1-1](../design/governance/a.md)；[初版](../design/governance/b.md)。\n',
            records: {
                'a.md': '## 7. Review Gate\n\nR1 `standard` **`Reject`**（1 blocker / 3 warning）→ R2 `standard` **`Pass`**。\n',
                'b.md': '## 7. Review Gate\n\nR1 `standard` **`Reject`**（0 blocker / 2 warning）。\n',
            },
        })
        const result = checkArchiveRgCounts(root, { enforceScope: false })
        expect(result.issues).toEqual([])
    })

    it('多记录链接：全部矛盾时判失败并列出各读数', () => {
        const root = createFixture({
            archive: '- **M1-1 摘要**：RG：R1 **Reject**（5 blocker）→ R2 **Pass**。记录见 [M1-1](../design/governance/a.md)；[初版](../design/governance/b.md)。\n',
            records: {
                'a.md': '## 7. Review Gate\n\nR1 `standard` **`Reject`**（1 blocker）。\n',
                'b.md': '## 7. Review Gate\n\nR1 `standard` **`Reject`**（0 blocker）。\n',
            },
        })
        const result = checkArchiveRgCounts(root, { enforceScope: false })
        expect(result.issues.map((issue) => issue.code)).toEqual([ISSUE_CODES.mismatch])
        expect(result.issues[0].detail).toContain('a.md 1')
        expect(result.issues[0].detail).toContain('b.md 0')
    })

    it('未标轮次的条目计数与记录最后一轮比对', () => {
        const root = createFixture({
            archive: '- **M1-1 摘要**：RG `standard` **Pass**（0 / 0 / 2）。记录见 [M1-1](../design/governance/a.md)。\n',
            records: {
                'a.md': '## 7. Review Gate\n\nR1 `standard` **`Reject`**（1 blocker）→ R2 `standard` **`Pass`**（0 blocker / 0 warning / 2 suggest）。\n',
            },
        })
        const result = checkArchiveRgCounts(root, { enforceScope: false })
        expect(result.issues).toEqual([])
    })

    it('受检面下界：可比对字段低于下界判 scope-narrowed', () => {
        const root = createFixture({ archive: consistentArchive, records })
        const result = checkArchiveRgCounts(root, { enforceScope: true, minReconciled: 10 })
        expect(result.issues.map((issue) => issue.code)).toEqual([ISSUE_CODES.scopeNarrowed])
    })

    it('enforceScope=false 时不下受检面断言', () => {
        const root = createFixture({ archive: consistentArchive, records })
        const result = checkArchiveRgCounts(root, { enforceScope: false })
        expect(result.issues).toEqual([])
    })

    it('深度归档目录一并受检', () => {
        const root = createFixture({
            archive: '# 主窗口\n',
            deepArchive: {
                'phase-01.md': consistentArchive
                    .replace('（0 / 0 / 3）', '（0 / 0 / 9）')
                    .replace('(../design/governance/a.md)', '(../../design/governance/a.md)'),
            },
            records,
        })
        const result = checkArchiveRgCounts(root, { enforceScope: false })
        expect(result.issues.map((issue) => issue.code)).toEqual([ISSUE_CODES.mismatch])
        expect(result.issues[0].detail).toContain('archive/phase-01.md')
    })
})

describe('CLI', () => {
    it('一致夹具 exit 0（受检面须超过下界）', () => {
        // 下界 MIN_RECONCILED 为 25：夹具以 10 条目 × 3 字段 = 30 覆盖真实体量的最小可比面。
        const bigArchive = `${Array.from(
            { length: 10 },
            (_, i) => `- **M1-${i + 1} 摘要**：RG \`standard\` **Pass**（0 / 0 / 3）。记录见 [M1-${i + 1}](../design/governance/a.md)。`,
        ).join('\n')}\n`
        const root = createFixture({ archive: bigArchive, records: { 'a.md': RECORD } })
        const result = runCli(root)
        expect(result.status).toBe(0)
        expect(result.stdout).toContain('OK')
    })

    it('串写夹具 exit 1', () => {
        const root = createFixture({
            archive: '- **M1-1 摘要**：RG `standard` **Pass**（0 / 0 / 9）。记录见 [M1-1](../design/governance/a.md)。\n',
            records: { 'a.md': RECORD },
        })
        const result = runCli(root)
        expect(result.status).toBe(1)
        expect(result.stderr).toContain(ISSUE_CODES.mismatch)
    })

    it('受检面收窄夹具 exit 1（下界生效）', () => {
        const root = createFixture({ archive: '- **M1-1 摘要**：RG `deep` **Pass**。\n' })
        const result = spawnSync('node', [SCRIPT, '--root', root], { encoding: 'utf8' })
        expect(result.status).toBe(1)
        expect(result.stderr).toContain(ISSUE_CODES.scopeNarrowed)
    })

    it('未知参数 exit 2', () => {
        const result = spawnSync('node', [SCRIPT, '--bogus'], { encoding: 'utf8' })
        expect(result.status).toBe(2)
    })

    it('`--root` 缺值 exit 2', () => {
        const result = spawnSync('node', [SCRIPT, '--root'], { encoding: 'utf8' })
        expect(result.status).toBe(2)
    })

    it('目标目录不存在 exit 2', () => {
        const result = spawnSync('node', [SCRIPT, '--root', join(tmpdir(), 'no-such-dir-xyz')], { encoding: 'utf8' })
        expect(result.status).toBe(2)
    })
})
