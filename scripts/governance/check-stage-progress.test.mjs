import { spawnSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { afterAll, describe, expect, it } from 'vitest'
import { checkStageProgress, ISSUE_CODES, parseProgressTable } from './check-stage-progress.mjs'

const SCRIPT = resolve(dirname(fileURLToPath(import.meta.url)), 'check-stage-progress.mjs')
const tempDirs = []

afterAll(() => {
    for (const dir of tempDirs) {
        rmSync(dir, { recursive: true, force: true })
    }
})

function fixture({
    progressRows = [
        '| M1 输入 | 1/2 | 进行中 | abc123 | Pass | 2 → 1 |',
        '| M2 展示 | 1/1 | 已闭环 | def456 | Pass | 1 → 1 |',
    ],
    itemRows = [
        '| M1-1 | 条目一 | 已交付 |',
        '| M1-2 | 条目二 | 待执行 |',
        '| M2-1 | 条目三 | 已交付 |',
    ],
    state = '**当前进行中阶段：Phase 9**',
} = {}) {
    return [
        '# 待办事项',
        '',
        '## 当前状态',
        '',
        `${state}，**2 条主线 / 3 条原子条目**（构成对账 2 + 1 = 3）。`,
        '',
        '| 大条目 | 小条目 | 状态 | 提交 | 审计 | 容量 |',
        '|:---|:---|:---|:---|:---|:---|',
        ...progressRows,
        '',
        '## Phase 9 原子条目',
        '',
        '| 编号 | 条目 | 状态 |',
        '|:---|:---|:---|',
        ...itemRows,
        '',
        '## 未完成项汇总',
        '',
        '- 无',
    ].join('\n')
}

function createRoot(todo = fixture()) {
    const root = mkdtempSync(join(tmpdir(), 'check-stage-progress-'))
    tempDirs.push(root)
    mkdirSync(join(root, 'docs/plan'), { recursive: true })
    writeFileSync(join(root, 'docs/plan/todo.md'), `${todo}\n`)
    return root
}

const codes = (todo) => checkStageProgress(createRoot(todo)).issues.map((issue) => issue.code)

describe('parseProgressTable', () => {
    it('只解析当前状态段与阶段条目段之间的 6 列表', () => {
        const parsed = parseProgressTable(fixture(), 9)
        expect(parsed.found).toBe(true)
        expect(parsed.rows).toHaveLength(2)
        expect(parsed.rows[0].cells[0]).toBe('M1 输入')
    })

    it('缺少 6 列表头时 found=false', () => {
        const parsed = parseProgressTable(fixture({ progressRows: [] }).replace('| 大条目 | 小条目 | 状态 | 提交 | 审计 | 容量 |', '| 别的 | 表 |'), 9)
        expect(parsed.found).toBe(false)
    })
})

describe('checkStageProgress', () => {
    it('进度表与条目表一致时通过', () => {
        expect(checkStageProgress(createRoot()).issues).toEqual([])
    })

    it('无进行中阶段时跳过', () => {
        const result = checkStageProgress(createRoot(fixture({ state: '**当前无进行中阶段**' })))
        expect(result.skipped).toBe(true)
        expect(result.issues).toEqual([])
    })

    it('缺少进度表', () => {
        const todo = fixture().replace(/\| 大条目 \|[\s\S]*?\| 2 → 1 \|\n/, '')
        expect(codes(todo)).toContain(ISSUE_CODES.missingTable)
    })

    it('行数与主线数不一致', () => {
        const todo = fixture({ progressRows: ['| M1 输入 | 2/2 | 已闭环 | abc123 | Pass | 2 → 2 |'] })
        expect(codes(todo)).toContain(ISSUE_CODES.rowCountMismatch)
    })

    it('小条目计数与条目表不一致', () => {
        const todo = fixture({
            progressRows: [
                '| M1 输入 | 2/2 | 已闭环 | abc123 | Pass | 2 → 2 |',
                '| M2 展示 | 1/1 | 已闭环 | def456 | Pass | 1 → 1 |',
            ],
        })
        expect(codes(todo)).toContain(ISSUE_CODES.countMismatch)
    })

    it('状态与已闭环数不匹配', () => {
        const todo = fixture({
            progressRows: [
                '| M1 输入 | 1/2 | 已闭环 | abc123 | Pass | 2 → 1 |',
                '| M2 展示 | 1/1 | 已闭环 | def456 | Pass | 1 → 1 |',
            ],
        })
        expect(codes(todo)).toContain(ISSUE_CODES.statusMismatch)
    })

    it('非法状态词', () => {
        const todo = fixture({
            progressRows: [
                '| M1 输入 | 1/2 | 完成 | abc123 | Pass | 2 → 1 |',
                '| M2 展示 | 1/1 | 已闭环 | def456 | Pass | 1 → 1 |',
            ],
        })
        expect(codes(todo)).toContain(ISSUE_CODES.invalidState)
    })

    it('有已交付条目时提交列不得是占位符', () => {
        const todo = fixture({
            progressRows: [
                '| M1 输入 | 1/2 | 进行中 | — | — | 2 → 1 |',
                '| M2 展示 | 1/1 | 已闭环 | def456 | Pass | 1 → 1 |',
            ],
        })
        expect(codes(todo)).toContain(ISSUE_CODES.fieldMissing)
    })

    it('容量列须为「计划 → 实际」', () => {
        const todo = fixture({
            progressRows: [
                '| M1 输入 | 1/2 | 进行中 | abc123 | — | 两个 |',
                '| M2 展示 | 1/1 | 已闭环 | def456 | Pass | 1 → 1 |',
            ],
        })
        expect(codes(todo)).toContain(ISSUE_CODES.fieldMissing)
    })

    it('全部条目交付后主线不得残留未闭环状态', () => {
        const todo = fixture({
            itemRows: [
                '| M1-1 | 条目一 | 已交付 |',
                '| M1-2 | 条目二 | 已交付 |',
                '| M2-1 | 条目三 | 已交付 |',
            ],
            progressRows: [
                '| M1 输入 | 2/2 | 进行中 | abc123 | Pass | 2 → 2 |',
                '| M2 展示 | 1/1 | 已闭环 | def456 | Pass | 1 → 1 |',
            ],
        })
        const issueCodes = codes(todo)
        expect(issueCodes).toContain(ISSUE_CODES.archiveResidue)
        expect(issueCodes).toContain(ISSUE_CODES.statusMismatch)
    })

    it('已阻塞状态单独放行，但仍要求计数一致', () => {
        const todo = fixture({
            progressRows: [
                '| M1 输入 | 1/2 | 已阻塞 | abc123 | Pass | 2 → 1 |',
                '| M2 展示 | 1/1 | 已闭环 | def456 | Pass | 1 → 1 |',
            ],
        })
        expect(checkStageProgress(createRoot(todo)).issues).toEqual([])
    })

    it('CLI：正常仓库 exit 0，缺表 exit 1', () => {
        const ok = spawnSync('node', [SCRIPT, '--root', createRoot()], { encoding: 'utf8' })
        expect(ok.status).toBe(0)

        const broken = fixture().replace(/\| 大条目 \|[\s\S]*?\| 2 → 1 \|\n/, '')
        const bad = spawnSync('node', [SCRIPT, '--root', createRoot(broken)], { encoding: 'utf8' })
        expect(bad.status).toBe(1)
        expect(bad.stderr).toContain(ISSUE_CODES.missingTable)
    })
})
