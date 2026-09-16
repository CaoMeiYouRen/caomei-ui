#!/usr/bin/env node

/**
 * check-line-count：监控关键文档的体量，避免规范 / 规划主文档无限膨胀。
 *
 * 每个目标有 warningLimit 与 errorLimit：
 * - 超过 warningLimit：输出 warning，不阻断；
 * - 超过 errorLimit：默认（error 模式）exit 1；warn 模式仅报告。
 *
 * 用法：
 *   node scripts/docs/check-line-count.mjs
 *   node scripts/docs/check-line-count.mjs --mode=warn
 */
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { isDirectExecution, parseCliOptions } from '../shared/cli.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
export const projectRoot = path.resolve(__dirname, '..', '..')
export const DEFAULT_MODE = 'error'

export const LINE_COUNT_TARGETS = [
    {
        file: 'README.md',
        warningLimit: 200,
        errorLimit: 300,
        rationale: 'README 应保持门户摘要形态，细节下沉到 docs/。',
    },
    {
        file: 'docs/standards/development.md',
        warningLimit: 300,
        errorLimit: 400,
        rationale: '开发规范只保留规则，示例与决策背景下沉到 docs/design/。',
    },
    {
        file: 'docs/standards/ai-collaboration.md',
        warningLimit: 250,
        errorLimit: 350,
        rationale: 'AI 协作规范只保留流程与门禁，细则链接引用。',
    },
    {
        file: 'docs/standards/ai-governance.md',
        warningLimit: 200,
        errorLimit: 300,
        rationale: 'AI 资产治理应保持规则索引形态。',
    },
    {
        file: 'docs/standards/planning.md',
        warningLimit: 250,
        errorLimit: 350,
        rationale: '规划规范只保留流程与阈值，阶段正文回写 roadmap / backlog。',
    },
    {
        file: 'docs/plan/roadmap.md',
        warningLimit: 300,
        errorLimit: 450,
        rationale: '路线图主文档只保留近线阶段窗口与索引，旧阶段应归档。',
    },
    {
        file: 'docs/plan/backlog.md',
        warningLimit: 300,
        errorLimit: 450,
        rationale: 'backlog 只保留候选摘要，详细设计应下沉到 docs/design/。',
    },
    {
        file: 'docs/plan/todo-archive.md',
        warningLimit: 400,
        errorLimit: 600,
        rationale: '待办归档主窗口只保留近线阶段窗口与归档索引。',
    },
    {
        file: 'docs/plan/recurring.md',
        warningLimit: 200,
        errorLimit: 300,
        rationale: '长期任务台账只保留任务 / 批次摘要与执行记录，细则下沉到规范与设计文档。',
    },
]

export function parseArgs(argv = process.argv) {
    return parseCliOptions(argv, {
        defaults: { mode: DEFAULT_MODE },
        values: {
            '--mode': { allowedValues: ['error', 'warn'], key: 'mode' },
        },
    })
}

export function countLines(content) {
    if (content.length === 0) {
        return 0
    }
    return content.split(/\r?\n/u).length
}

export async function inspectTarget(target) {
    const absolutePath = path.join(projectRoot, target.file)
    const content = await readFile(absolutePath, 'utf8')
    const lines = countLines(content)

    if (lines > target.errorLimit) {
        return { ...target, lines, severity: 'error' }
    }
    if (lines > target.warningLimit) {
        return { ...target, lines, severity: 'warning' }
    }
    return { ...target, lines, severity: 'pass' }
}

export async function collectLineCountReport() {
    const results = await Promise.all(LINE_COUNT_TARGETS.map(inspectTarget))
    return {
        errors: results.filter((item) => item.severity === 'error'),
        results,
        warnings: results.filter((item) => item.severity === 'warning'),
    }
}

export async function main(argv = process.argv) {
    const { mode } = parseArgs(argv)
    const { errors, results, warnings } = await collectLineCountReport()

    for (const result of results) {
        let prefix = '[docs-line-count] ok'
        if (result.severity === 'error') {
            prefix = '[docs-line-count] error'
        } else if (result.severity === 'warning') {
            prefix = '[docs-line-count] warning'
        }
        console.info(`${prefix}: ${result.file} -> ${result.lines} lines (warn>${result.warningLimit}, error>${result.errorLimit})`)
    }

    if (warnings.length > 0) {
        console.warn('\n[docs-line-count] warning summary:')
        for (const warning of warnings) {
            console.warn(`- ${warning.file}: ${warning.lines} lines. ${warning.rationale}`)
        }
    }

    if (errors.length > 0) {
        const writer = mode === 'error' ? console.error : console.warn
        writer('\n[docs-line-count] error summary:')
        for (const error of errors) {
            writer(`- ${error.file}: ${error.lines} lines. ${error.rationale}`)
        }
        if (mode === 'error') {
            process.exitCode = 1
            return
        }
        console.warn('\n[docs-line-count] completed in warn mode: error-threshold breaches are reported only.')
        return
    }

    console.info('\n[docs-line-count] passed: no document exceeded the error threshold.')
}

if (isDirectExecution(import.meta.url)) {
    await main()
}
