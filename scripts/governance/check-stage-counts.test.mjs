import { spawnSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { afterAll, describe, expect, it } from 'vitest'
import {
    checkStageCounts,
    ISSUE_CODES,
    parseRoadmap,
    parseTodo,
    SCOPE_FLOOR,
} from './check-stage-counts.mjs'

const SCRIPT = resolve(dirname(fileURLToPath(import.meta.url)), 'check-stage-counts.mjs')

const tempDirs = []

afterAll(() => {
    for (const dir of tempDirs) {
        rmSync(dir, { recursive: true, force: true })
    }
})

const TODO_MARKER = '**当前进行中阶段：Phase 9（示例阶段）**'

/** 生成一份「3 条主线 / 5 条原子条目」的 `todo.md` 夹具。 */
function todoFixture({ counts = '**3 条主线 / 5 条原子条目**', sum = '1 + 2 + 2 = 5', rows = null } = {}) {
    const itemRows = rows ?? [
        '| M1-1 | 条目一 | 已完成 |',
        '| M2-1 | 条目二 | 待执行 |',
        '| M2-2 | 条目三 | 待执行 |',
        '| M3-1 | 条目四 | 待执行 |',
        '| M3-2 | 条目五 | 待执行 |',
    ]
    return [
        '# 待办事项',
        '',
        '## 当前状态',
        '',
        `${TODO_MARKER}，构成 ${counts}（A 1 / B 2 / C 2；构成对账 ${sum}）。**原登记 2 条主线 / 3 条原子条目为 2026-01-01 时点值**。`,
        '',
        '## Phase 9 原子条目',
        '',
        '| 编号 | 条目 | 交付面 | 状态 |',
        '|:---|:---|:---|:---|',
        ...itemRows,
        '',
        '## 未完成项汇总',
        '',
        '- 无',
    ].join('\n')
}

/** 生成一份与 `todoFixture` 对账一致的 `roadmap.md` 夹具。 */
function roadmapFixture({ counts = '**3 条主线 / 5 条原子条目**', sum = '1 + 2 + 2 = 5', state = '**Phase 9 已于 2026-01-01 登记**', extraRow = '' } = {}) {
    return [
        '# 路线图',
        '',
        '## 1. 现状与背景',
        '',
        `- 当前状态：${state}。`,
        '',
        '## 2. 阶段规划',
        '',
        '| 阶段 | 目标 | 核心交付 |',
        '|------|------|----------|',
        `| **Phase 9** | 示例 | 取 **A + B + C**，${counts}（构成对账 ${sum}；**原登记 2 条主线 / 3 条原子条目为时点值**） |`,
        ...(extraRow ? [extraRow] : []),
    ].join('\n')
}

function createFixture(todo = todoFixture(), roadmap = roadmapFixture()) {
    const root = mkdtempSync(join(tmpdir(), 'check-stage-counts-'))
    tempDirs.push(root)
    mkdirSync(join(root, 'docs/plan'), { recursive: true })
    writeFileSync(join(root, 'docs/plan/todo.md'), `${todo}\n`)
    writeFileSync(join(root, 'docs/plan/roadmap.md'), `${roadmap}\n`)
    return root
}

const codes = (root) => checkStageCounts(root).issues.map((issue) => issue.code)

describe('parseTodo', () => {
    it('读取当前阶段、首个计数与对账式，并忽略历史时点值', () => {
        const parsed = parseTodo(todoFixture())
        expect(parsed.phase).toBe(9)
        expect(parsed.mainLines).toBe(3)
        expect(parsed.atomic).toBe(5)
        expect(parsed.sum).toMatchObject({ parts: [1, 2, 2], total: 5, invalid: false })
        expect(parsed.items).toEqual(['M1-1', 'M2-1', 'M2-2', 'M3-1', 'M3-2'])
    })

    it('只取当前阶段的条目段，不误读其它阶段段', () => {
        const text = [
            '# 待办事项',
            '',
            '## 修订记录',
            '',
            '历史摘要曾写 **5 条主线 / 13 条原子条目**（构成对账 5 + 8 = 13）。',
            '',
            '## 当前状态',
            '',
            `${TODO_MARKER}，构成 **1 条主线 / 1 条原子条目**（构成对账 1 = 1）。`,
            '',
            '## Phase 8 原子条目',
            '',
            '| 编号 | 条目 |',
            '|:---|:---|',
            '| M1-1 | 旧条目 |',
            '| M1-2 | 旧条目 |',
            '',
            '## Phase 9 原子条目',
            '',
            '| 编号 | 条目 |',
            '|:---|:---|',
            '| M1-1 | 当前条目 |',
            '',
            '## 未完成项汇总',
        ].join('\n')
        const parsed = parseTodo(text)
        expect(parsed.mainLines).toBe(1)
        expect(parsed.atomic).toBe(1)
        expect(parsed.items).toEqual(['M1-1'])
    })
})

describe('parseRoadmap', () => {
    it('读取当前阶段行与 §1 提及', () => {
        const parsed = parseRoadmap(roadmapFixture(), 9)
        expect(parsed.phaseMentioned).toBe(true)
        expect(parsed.latestPhase).toBe(9)
        expect(parsed.mainLines).toBe(3)
        expect(parsed.atomic).toBe(5)
        expect(parsed.sum).toMatchObject({ parts: [1, 2, 2], total: 5, invalid: false })
    })
})

describe('checkStageCounts（夹具）', () => {
    it('两载体一致时不报问题', () => {
        expect(codes(createFixture())).toEqual([])
    })

    it('计数不一致判 count-mismatch', () => {
        const root = createFixture(todoFixture({ counts: '**3 条主线 / 4 条原子条目**', sum: '1 + 2 + 1 = 4' }), roadmapFixture())
        expect(codes(root)).toContain(ISSUE_CODES.countMismatch)
    })

    it('对账式算错判 sum-mismatch', () => {
        const root = createFixture(todoFixture({ sum: '1 + 2 + 3 = 5' }))
        expect(codes(root)).toContain(ISSUE_CODES.sumMismatch)
    })

    it('对账结果与原子条目数不一致判 sum-mismatch', () => {
        const root = createFixture(undefined, roadmapFixture({ sum: '1 + 2 + 2 = 6' }))
        expect(codes(root)).toContain(ISSUE_CODES.sumMismatch)
    })

    it('条目表行数与声明不一致判 row-count-mismatch', () => {
        const root = createFixture(todoFixture({ rows: ['| M1-1 | 条目一 | 已完成 |'] }))
        expect(codes(root)).toContain(ISSUE_CODES.rowCountMismatch)
    })

    it('主线前缀数与声明不一致判 main-line-mismatch', () => {
        const rows = [
            '| M1-1 | 条目一 | 已完成 |',
            '| M2-1 | 条目二 | 待执行 |',
            '| M2-2 | 条目三 | 待执行 |',
            '| M3-1 | 条目四 | 待执行 |',
            '| M4-1 | 条目五 | 待执行 |',
        ]
        const root = createFixture(todoFixture({ rows }))
        expect(codes(root)).toContain(ISSUE_CODES.mainLineMismatch)
    })

    it('§1 未提及当前阶段判 phase-mismatch', () => {
        const root = createFixture(undefined, roadmapFixture({ state: '**上一阶段已完成**' }))
        expect(codes(root)).toContain(ISSUE_CODES.phaseMismatch)
    })

    it('阶段表最大编号与当前阶段不一致判 phase-mismatch', () => {
        const extraRow = '| **Phase 10** | 下一阶段 | — |'
        const root = createFixture(undefined, roadmapFixture({ extraRow }))
        expect(codes(root)).toContain(ISSUE_CODES.phaseMismatch)
    })

    it('缺少计数声明判 missing-field', () => {
        const root = createFixture('# 待办事项\n\n## 当前状态\n\n**当前进行中阶段：Phase 9**\n')
        expect(codes(root)).toContain(ISSUE_CODES.missingField)
    })

    it('条目表为空时触发受检面下界', () => {
        const root = createFixture(todoFixture({ counts: '**0 条主线 / 0 条原子条目**', sum: '0 = 0', rows: [] }))
        expect(codes(root)).toContain(ISSUE_CODES.scopeNarrowed)
        expect(SCOPE_FLOOR.itemRows).toBeGreaterThan(0)
    })

    it('对账分量与条目表逐主线行数不一致判 part-mismatch', () => {
        const root = createFixture(todoFixture({ sum: '1 + 1 + 3 = 5' }))
        expect(codes(root)).toContain(ISSUE_CODES.partMismatch)
    })

    it('对账式含空分量判 sum-mismatch', () => {
        const rows = ['| M1-1 | 条目一 | 已完成 |', '| M2-1 | 条目二 | 待执行 |', '| M3-1 | 条目三 | 待执行 |']
        const root = createFixture(todoFixture({ counts: '**3 条主线 / 3 条原子条目**', sum: '1 + + 2 = 3', rows }))
        expect(codes(root)).toContain(ISSUE_CODES.sumMismatch)
    })

    it('阶段表缺少当前阶段行时载体数降为 1 并触发受检面下界', () => {
        const root = createFixture(todoFixture(), roadmapFixture().replace('| **Phase 9** |', '| **Phase 8** |'))
        const result = checkStageCounts(root)
        expect(result.carriers).toBe(1)
        expect(result.issues.map((issue) => issue.code)).toContain(ISSUE_CODES.scopeNarrowed)
    })

    it('roadmap 行缺少计数声明判 missing-field', () => {
        const root = createFixture(todoFixture(), roadmapFixture().replace(/取 \*\*A \+ B \+ C\*\*，.*\|$/, '— |'))
        expect(codes(root)).toContain(ISSUE_CODES.missingField)
    })

    it('缺少当前阶段声明判 missing-field', () => {
        const root = createFixture('# 待办事项\n\n## 当前状态\n\n无。\n')
        expect(codes(root)).toContain(ISSUE_CODES.missingField)
    })

    it('载体缺失判 io-error', () => {
        expect(codes(join(tmpdir(), 'check-stage-counts-missing'))).toEqual([ISSUE_CODES.ioError])
    })
})

describe('CLI', () => {
    it('一致时 exit 0，不一致时 exit 1', () => {
        const ok = spawnSync('node', [SCRIPT, '--root', createFixture()], { encoding: 'utf8' })
        expect(ok.status).toBe(0)
        expect(ok.stdout).toContain('OK')

        const bad = spawnSync('node', [SCRIPT, '--root', createFixture(todoFixture({ sum: '9 = 5' }))], { encoding: 'utf8' })
        expect(bad.status).toBe(1)
        expect(bad.stderr).toContain(ISSUE_CODES.sumMismatch)
    })

    it('参数非法或目录不存在时 exit 2', () => {
        expect(spawnSync('node', [SCRIPT, '--nope'], { encoding: 'utf8' }).status).toBe(2)
        expect(spawnSync('node', [SCRIPT, '--root', join(tmpdir(), 'check-stage-counts-missing')], { encoding: 'utf8' }).status).toBe(2)
    })
})
