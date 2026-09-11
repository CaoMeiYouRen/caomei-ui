#!/usr/bin/env node

/**
 * check-standards-redundant：扫描 docs/standards/ 下"为什么 / 教训 / 经验"类关键词。
 *
 * 设计原则：
 * - 规范文件应只写"做什么 / 不做什么"，不混入"为什么 / 教训 / 经验"等长段实证内容；
 * - 本脚本只定位需剥离位置，不自动修改；
 * - 跳过 fenced code block 与行内代码。
 *
 * 用法：
 *   node scripts/governance/check-standards-redundant.mjs            # 报告模式，exit 0
 *   node scripts/governance/check-standards-redundant.mjs --strict   # 任一命中 exit 1
 */
import { readFileSync, readdirSync } from 'node:fs'
import { join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import { isDirectExecution } from '../shared/cli.mjs'

const REPO_ROOT = join(fileURLToPath(import.meta.url), '..', '..', '..')

export const DEFAULT_KEYWORDS = ['教训', '经验', '实证', '实战', '背景']
export const OPTIONAL_KEYWORDS = ['沉淀']

export function scanFile(file, keywords = DEFAULT_KEYWORDS) {
    const lines = readFileSync(file, 'utf8').split(/\r?\n/)
    const hits = []
    let inCode = false
    lines.forEach((line, idx) => {
        if (/^\s*```/.test(line)) {
            inCode = !inCode
            return
        }
        if (inCode) {
            return
        }
        const clean = line.replace(/`[^`]*`/g, '')
        for (const kw of keywords) {
            const re = new RegExp(kw, 'g')
            let m
            while ((m = re.exec(clean)) !== null) {
                const start = Math.max(0, m.index - 10)
                const end = Math.min(clean.length, m.index + kw.length + 20)
                hits.push({
                    line: idx + 1,
                    col: m.index + 1,
                    keyword: kw,
                    snippet: clean.slice(start, end).trim(),
                })
            }
        }
    })
    return hits
}

export function scanStandards(repoRoot, options = {}) {
    const standardsDir = join(repoRoot, 'docs/standards')
    const keywords = options.includeSediment
        ? [...DEFAULT_KEYWORDS, ...OPTIONAL_KEYWORDS]
        : DEFAULT_KEYWORDS
    const files = readdirSync(standardsDir)
        .filter((f) => f.endsWith('.md'))
        .map((f) => join(standardsDir, f))
    const results = []
    for (const file of files) {
        const hits = scanFile(file, keywords)
        if (hits.length > 0) {
            results.push({ file: relative(repoRoot, file), hits })
        }
    }
    return results
}

if (isDirectExecution(import.meta.url)) {
    const strict = process.argv.includes('--strict')
    const includeSediment = process.argv.includes('--include-sediment')
    const results = scanStandards(REPO_ROOT, { includeSediment })
    let total = 0
    for (const { file, hits } of results) {
        for (const hit of hits) {
            process.stderr.write(`${file}:${hit.line}:${hit.col}: ${hit.keyword} - ${hit.snippet}\n`)
        }
        total += hits.length
    }
    const kwMsg = includeSediment ? '（含"沉淀"）' : ''
    if (total === 0) {
        process.stdout.write(`[check-standards-redundant] 0 处命中${kwMsg}：docs/standards/ 规范文件无"教训/经验/实证/实战/背景"关键词\n`)
        process.exit(0)
    }
    process.stdout.write(`[check-standards-redundant] ${total} 处命中${kwMsg}（${results.length} 个文件）\n`)
    if (strict) {
        process.stderr.write('[check-standards-redundant] --strict 模式：任一命中即 exit 1\n')
        process.exit(1)
    }
    process.stdout.write('[check-standards-redundant] 默认模式：仅报告，不阻断（用 --strict 启用严格模式）\n')
    process.exit(0)
}
