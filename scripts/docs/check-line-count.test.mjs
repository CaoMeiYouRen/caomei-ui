import { describe, expect, it } from 'vitest'
import {
    LINE_COUNT_TARGETS,
    MIN_TARGETS,
    classifyLineCount,
    collectLineCountReport,
    countLines,
    inspectTarget,
    parseArgs,
} from './check-line-count.mjs'

describe('countLines', () => {
    it('空内容为 0 行', () => {
        expect(countLines('')).toBe(0)
    })

    it('无换行的单行为 1 行', () => {
        expect(countLines('a')).toBe(1)
        expect(countLines('a\r\nb')).toBe(2)
    })

    it('以换行结尾时按 split 语义多计一行（与 wc -l 不同，属既有口径）', () => {
        expect(countLines('a\n')).toBe(2)
        expect(countLines('a\nb\n')).toBe(3)
    })
})

describe('classifyLineCount', () => {
    const target = { warningLimit: 200, errorLimit: 300 }

    it('等于阈值仍属上一档', () => {
        expect(classifyLineCount(target, 200)).toBe('pass')
        expect(classifyLineCount(target, 300)).toBe('warning')
    })

    it('严格越过阈值才升级', () => {
        expect(classifyLineCount(target, 201)).toBe('warning')
        expect(classifyLineCount(target, 301)).toBe('error')
    })
})

describe('LINE_COUNT_TARGETS', () => {
    it('受检面未低于下界、无重复目标', () => {
        expect(LINE_COUNT_TARGETS.length).toBeGreaterThanOrEqual(MIN_TARGETS)
        const files = LINE_COUNT_TARGETS.map((target) => target.file)
        expect(new Set(files).size).toBe(files.length)
    })

    it('每个目标阈值有序且附理由', () => {
        for (const target of LINE_COUNT_TARGETS) {
            expect(target.errorLimit, target.file).toBeGreaterThan(target.warningLimit)
            expect(target.warningLimit, target.file).toBeGreaterThan(0)
            expect(target.rationale.length, target.file).toBeGreaterThan(0)
        }
    })

    it('关键规划载体在受检面内', () => {
        const files = LINE_COUNT_TARGETS.map((target) => target.file)
        expect(files).toContain('README.md')
        expect(files).toContain('docs/plan/roadmap.md')
        expect(files).toContain('docs/plan/backlog.md')
        expect(files).toContain('docs/standards/planning.md')
    })
})

describe('inspectTarget / collectLineCountReport', () => {
    it('目标文件缺失时 fail-closed', async () => {
        await expect(inspectTarget({ file: '__missing__.md', warningLimit: 1, errorLimit: 2, rationale: 'x' }))
            .rejects
            .toThrow()
    })

    it('仓库现状：全部目标均在 error 阈值内', async () => {
        const report = await collectLineCountReport()
        expect(report.results).toHaveLength(LINE_COUNT_TARGETS.length)
        expect(report.errors).toEqual([])
    })
})

describe('parseArgs', () => {
    it('默认 error 模式', () => {
        expect(parseArgs([])).toEqual({ mode: 'error' })
    })

    it('支持 --mode=warn 与非法值拒绝', () => {
        expect(parseArgs(['--mode=warn'])).toEqual({ mode: 'warn' })
        expect(() => parseArgs(['--mode=loud'])).toThrow(/Unsupported value/)
    })
})
