import { spawnSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { afterAll, describe, expect, it } from 'vitest'
import {
    checkCandidateAnchors,
    extractCandidatePool,
    ISSUE_CODES,
    MIN_CANDIDATES,
    parseCandidateRows,
} from './check-candidate-anchors.mjs'

const SCRIPT = resolve(dirname(fileURLToPath(import.meta.url)), 'check-candidate-anchors.mjs')

const tempDirs = []

afterAll(() => {
    for (const dir of tempDirs) {
        rmSync(dir, { recursive: true, force: true })
    }
})

/** 建夹具：todo 汇总段表 + backlog §1。 */
function createFixture({ rows, pool }) {
    const root = mkdtempSync(join(tmpdir(), 'check-candidate-anchors-'))
    tempDirs.push(root)
    const write = (relativePath, content) => {
        const file = join(root, relativePath)
        mkdirSync(dirname(file), { recursive: true })
        writeFileSync(file, content)
    }
    const table = ['| 候选 | 触发条件 | Backlog 判别键 |', '|:---|:---|:---|']
        .concat(rows.map(([name, ...keys]) => `| ${name} | 触发 | ${keys.map((k) => `\`${k}\``).join('、')} |`))
        .join('\n')
    write('docs/plan/todo.md', `## 未完成项汇总\n\n- **条件触发候选**：\n\n${table}\n\n- **已发布版本**：x\n`)
    write('docs/plan/backlog.md', `## 1. 候选池（待用户决策）\n\n${pool}\n\n## 2. 维护约定\n\nx\n`)
    return root
}

const ROWS = [['候选甲', 'KEY_A'], ['候选乙', 'KEY_B']]

describe('parseCandidateRows / extractCandidatePool', () => {
    it('抽取表行（跳过表头与分隔行）', () => {
        const root = createFixture({ rows: ROWS, pool: 'KEY_A KEY_B' })
        const rows = parseCandidateRows(readFileSync(join(root, 'docs/plan/todo.md'), 'utf8'))
        expect(rows).toEqual([{ candidate: '候选甲', keys: ['KEY_A'] }, { candidate: '候选乙', keys: ['KEY_B'] }])
    })

    it('候选池只取 §1 段', () => {
        const pool = extractCandidatePool('## 1. 候选池\n\nKEY_A\n\n## 2. 维护约定\n\nKEY_B\n')
        expect(pool).toContain('KEY_A')
        expect(pool).not.toContain('KEY_B')
    })
})

describe('checkCandidateAnchors（夹具）', () => {
    it('键均在候选池时通过', () => {
        const root = createFixture({ rows: ROWS, pool: 'KEY_A 与 KEY_B' })
        const result = checkCandidateAnchors(root, { enforceScope: false })
        expect(result.issues).toEqual([])
        expect(result.checked).toBe(2)
    })

    it('列名而无行判 candidate-anchor-missing', () => {
        const root = createFixture({ rows: ROWS, pool: 'KEY_A' })
        const result = checkCandidateAnchors(root, { enforceScope: false })
        expect(result.issues.map((issue) => issue.code)).toEqual([ISSUE_CODES.missing])
        expect(result.issues[0].detail).toContain('KEY_B')
    })

    it('候选池 §1 之后出现的键不算命中（避免误取 §2/§3）', () => {
        const root = createFixture({ rows: ROWS, pool: 'KEY_A' })
        const withTail = join(root, 'docs/plan/backlog.md')
        writeFileSync(withTail, `${readFileSync(withTail, 'utf8')}\n## 3. 已评估\n\nKEY_B\n`)
        expect(checkCandidateAnchors(root, { enforceScope: false }).issues.map((i) => i.code)).toEqual([ISSUE_CODES.missing])
    })

    it('单元格多键：任一枚缺失即判失败', () => {
        const root = createFixture({ rows: [['候选甲', 'KEY_A', 'KEY_C']], pool: 'KEY_A' })
        const result = checkCandidateAnchors(root, { enforceScope: false })
        expect(result.issues.map((issue) => issue.code)).toEqual([ISSUE_CODES.missing])
        expect(result.issues[0].detail).toContain('KEY_C')
    })

    it('受检面下界：候选行低于下界判 scope-narrowed', () => {
        const root = createFixture({ rows: ROWS, pool: 'KEY_A KEY_B' })
        expect(checkCandidateAnchors(root, { minCandidates: 5 }).issues.map((i) => i.code)).toEqual([ISSUE_CODES.scopeNarrowed])
    })

    it('载缺失判 io-error', () => {
        const root = createFixture({ rows: ROWS, pool: 'KEY_A KEY_B' })
        rmSync(join(root, 'docs/plan/backlog.md'))
        expect(checkCandidateAnchors(root).issues.map((i) => i.code)).toEqual([ISSUE_CODES.ioError])
    })
})

describe('CLI', () => {
    it('通过夹具 exit 0（受检面须超过下界）', () => {
        // 下界防静默收窄：夹具以 MIN_CANDIDATES + 1 行覆盖最小可比面。
        const many = Array.from({ length: MIN_CANDIDATES + 1 }, (_, i) => [`候选${i}`, `KEY_${i}`])
        const root = createFixture({ rows: many, pool: many.map(([, k]) => k).join(' ') })
        const result = spawnSync('node', [SCRIPT, '--root', root], { encoding: 'utf8' })
        expect(result.status).toBe(0)
    })

    it('缺行夹具 exit 1', () => {
        const root = createFixture({ rows: ROWS, pool: 'KEY_A' })
        const result = spawnSync('node', [SCRIPT, '--root', root], { encoding: 'utf8' })
        expect(result.status).toBe(1)
        expect(result.stderr).toContain(ISSUE_CODES.missing)
    })

    it('未知参数 exit 2', () => {
        expect(spawnSync('node', [SCRIPT, '--bogus'], { encoding: 'utf8' }).status).toBe(2)
    })

    it('目标目录不存在 exit 2', () => {
        expect(spawnSync('node', [SCRIPT, '--root', join(tmpdir(), 'nope-xyz')], { encoding: 'utf8' }).status).toBe(2)
    })
})
