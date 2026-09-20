#!/usr/bin/env node

/**
 * check-coverage：校验测试覆盖率是否达到阈值。
 *
 * 背景：日常 `pnpm test` / `pnpm verify` 不含覆盖率校验（用户决策：90% 已达标，日常卡收益低）。
 * 覆盖率校验仅在周期性回归任务（regression-weekly.yml）与 release 流程（release.yml）中调用。
 *
 * 用法：
 *   node scripts/governance/check-coverage.mjs
 *   node scripts/governance/check-coverage.mjs --threshold=90
 *   node scripts/governance/check-coverage.mjs --threshold-lines=90 --threshold-branches=80
 */
import { existsSync, readFileSync } from 'node:fs'
import { join, resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { isDirectExecution, parseCliOptions } from '../shared/cli.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
export const projectRoot = resolve(__dirname, '..', '..')
export const coverageSummaryPath = join(projectRoot, 'coverage', 'coverage-summary.json')

/** 默认阈值（基于 2026-09-20 基线：statements 93.99%, branches 85.72%, functions 94.95%, lines 93.41%） */
export const DEFAULT_THRESHOLDS = {
    statements: 90,
    branches: 80,
    functions: 90,
    lines: 90,
}

export function parseArgs(argv = process.argv) {
    return parseCliOptions(argv, {
        defaults: {},
        values: {
            '--threshold': { key: 'globalThreshold', type: 'number' },
            '--threshold-statements': { key: 'statements', type: 'number' },
            '--threshold-branches': { key: 'branches', type: 'number' },
            '--threshold-functions': { key: 'functions', type: 'number' },
            '--threshold-lines': { key: 'lines', type: 'number' },
        },
    })
}

/**
 * 获取阈值配置。
 * @param {Record<string, number | undefined>} args
 * @returns {{ statements: number, branches: number, functions: number, lines: number }}
 */
export function getThresholds(args = parseArgs()) {
    const global = args.globalThreshold
    return {
        statements: args.statements ?? global ?? DEFAULT_THRESHOLDS.statements,
        branches: args.branches ?? global ?? DEFAULT_THRESHOLDS.branches,
        functions: args.functions ?? global ?? DEFAULT_THRESHOLDS.functions,
        lines: args.lines ?? global ?? DEFAULT_THRESHOLDS.lines,
    }
}

/**
 * 读取覆盖率摘要。
 * @param {string} summaryPath
 * @returns {{ statements: number, branches: number, functions: number, lines: number }}
 */
export function readCoverageSummary(summaryPath = coverageSummaryPath) {
    if (!existsSync(summaryPath)) {
        throw new Error(
            `覆盖率摘要文件不存在：${summaryPath}\n`
            + '请先执行 pnpm test:coverage 生成覆盖率报告',
        )
    }

    const content = readFileSync(summaryPath, 'utf8')
    const summary = JSON.parse(content)
    const total = summary.total

    if (!total) {
        throw new Error('覆盖率摘要文件格式错误：缺少 total 字段')
    }

    return {
        statements: total.statements?.pct ?? 0,
        branches: total.branches?.pct ?? 0,
        functions: total.functions?.pct ?? 0,
        lines: total.lines?.pct ?? 0,
    }
}

/**
 * 校验覆盖率是否达到阈值。
 * @param {string} summaryPath
 * @param {ReturnType<typeof getThresholds>} thresholds
 * @returns {{ passed: boolean, errors: string[], actual: Record<string, number> }}
 */
export function checkCoverage(summaryPath = coverageSummaryPath, thresholds = getThresholds()) {
    const actual = readCoverageSummary(summaryPath)
    const errors = []

    for (const [metric, threshold] of Object.entries(thresholds)) {
        const actualValue = actual[metric]
        if (actualValue < threshold) {
            errors.push(
                `${metric}: ${actualValue.toFixed(2)}% < ${threshold}%（阈值）`,
            )
        }
    }

    return {
        passed: errors.length === 0,
        errors,
        actual,
    }
}

function main() {
    const thresholds = getThresholds()

    try {
        const { passed, errors, actual } = checkCoverage(coverageSummaryPath, thresholds)

        // 输出实际覆盖率
        console.info('[check-coverage] 覆盖率报告：')
        console.info(`  Statements: ${actual.statements.toFixed(2)}% (阈值: ${thresholds.statements}%)`)
        console.info(`  Branches:   ${actual.branches.toFixed(2)}% (阈值: ${thresholds.branches}%)`)
        console.info(`  Functions:  ${actual.functions.toFixed(2)}% (阈值: ${thresholds.functions}%)`)
        console.info(`  Lines:      ${actual.lines.toFixed(2)}% (阈值: ${thresholds.lines}%)`)

        if (!passed) {
            console.error('[check-coverage] ✖ 覆盖率未达标：')
            for (const error of errors) {
                console.error(`  - ${error}`)
            }
            process.exit(1)
        }

        console.info('[check-coverage] 通过：覆盖率达到阈值要求')
    } catch (error) {
        console.error(`[check-coverage] ✖ ${error.message}`)
        process.exit(1)
    }
}

if (isDirectExecution(import.meta.url)) {
    main()
}
