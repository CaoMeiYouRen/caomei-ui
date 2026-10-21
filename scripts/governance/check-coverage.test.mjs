import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterAll, describe, expect, it } from 'vitest'
import {
    DEFAULT_THRESHOLDS,
    checkCoverage,
    getThresholds,
    parseArgs,
    readCoverageSummary,
} from './check-coverage.mjs'

const tempDirs = []

afterAll(() => {
    for (const dir of tempDirs) {
        rmSync(dir, { recursive: true, force: true })
    }
})

/** 写一份覆盖率摘要夹具，返回文件路径。 */
function createSummaryFile(summary) {
    const dir = mkdtempSync(join(tmpdir(), 'check-coverage-'))
    tempDirs.push(dir)
    const file = join(dir, 'coverage-summary.json')
    writeFileSync(file, JSON.stringify(summary))
    return file
}

/** 生成四指标齐全的摘要。 */
function summaryWith(pct) {
    return {
        total: {
            statements: { pct: pct.statements },
            branches: { pct: pct.branches },
            functions: { pct: pct.functions },
            lines: { pct: pct.lines },
        },
    }
}

const PASSING = { statements: 95, branches: 85, functions: 95, lines: 95 }

describe('parseArgs / getThresholds', () => {
    it('默认无覆盖项', () => {
        expect(parseArgs([])).toEqual({})
    })

    it('--threshold 解析为数字', () => {
        expect(parseArgs(['--threshold=85'])).toEqual({ globalThreshold: 85 })
        expect(parseArgs(['--threshold-lines=90.5'])).toEqual({ lines: 90.5 })
    })

    it('非数字阈值 fail-closed', () => {
        expect(() => parseArgs(['--threshold=abc'])).toThrow(/期望有限数字/)
        expect(() => parseArgs(['--threshold='])).toThrow(/期望有限数字/)
        expect(() => parseArgs(['--threshold=Infinity'])).toThrow(/期望有限数字/)
    })

    it('默认阈值为四指标', () => {
        const thresholds = getThresholds(parseArgs([]))
        expect(Object.keys(thresholds).sort()).toEqual(['branches', 'functions', 'lines', 'statements'])
        for (const [metric, value] of Object.entries(thresholds)) {
            expect(Number.isFinite(value), metric).toBe(true)
            expect(value).toBeGreaterThan(0)
            expect(value).toBeLessThanOrEqual(100)
        }
        expect(thresholds).toEqual(DEFAULT_THRESHOLDS)
    })

    it('全局阈值覆盖默认，单项阈值优先于全局', () => {
        expect(getThresholds(parseArgs(['--threshold=70']))).toEqual({
            statements: 70,
            branches: 70,
            functions: 70,
            lines: 70,
        })
        expect(getThresholds(parseArgs(['--threshold=70', '--threshold-branches=60']))).toEqual({
            statements: 70,
            branches: 60,
            functions: 70,
            lines: 70,
        })
    })

    it('阈值越界 fail-closed', () => {
        expect(() => getThresholds(parseArgs(['--threshold=-1']))).toThrow(/阈值/)
        expect(() => getThresholds(parseArgs(['--threshold=101']))).toThrow(/阈值/)
        expect(getThresholds(parseArgs(['--threshold=0']))).toEqual({
            statements: 0,
            branches: 0,
            functions: 0,
            lines: 0,
        })
    })
})

describe('readCoverageSummary', () => {
    it('读取四指标百分比', () => {
        const file = createSummaryFile(summaryWith(PASSING))
        expect(readCoverageSummary(file)).toEqual(PASSING)
    })

    it('缺失文件抛错（提示先生成覆盖率）', () => {
        expect(() => readCoverageSummary(join(tmpdir(), 'definitely-missing-coverage.json')))
            .toThrow(/覆盖率摘要文件不存在/)
    })

    it('缺少 total 抛错', () => {
        const file = createSummaryFile({})
        expect(() => readCoverageSummary(file)).toThrow(/缺少 total 字段/)
    })

    it('缺失指标按 0 处理（fail-closed）', () => {
        const file = createSummaryFile({ total: { statements: { pct: 95 } } })
        expect(readCoverageSummary(file)).toEqual({
            statements: 95,
            branches: 0,
            functions: 0,
            lines: 0,
        })
    })
})

describe('checkCoverage', () => {
    it('恰好等于阈值时通过（不要求严格大于）', () => {
        const file = createSummaryFile(summaryWith(PASSING))
        const result = checkCoverage(file, { ...PASSING })
        expect(result.passed).toBe(true)
        expect(result.errors).toEqual([])
    })

    it('低于阈值时失败并逐指标报告', () => {
        const file = createSummaryFile(summaryWith({ ...PASSING, branches: 79.99 }))
        const result = checkCoverage(file, { ...PASSING })
        expect(result.passed).toBe(false)
        expect(result.errors).toHaveLength(1)
        expect(result.errors[0]).toContain('branches')
        expect(result.errors[0]).toContain('79.99')
    })

    it('缺失指标按 0 参与比较（默认阈值下失败）', () => {
        const file = createSummaryFile({ total: { statements: { pct: 95 } } })
        const result = checkCoverage(file, { statements: 90, branches: 80, functions: 90, lines: 90 })
        expect(result.passed).toBe(false)
    })
})
