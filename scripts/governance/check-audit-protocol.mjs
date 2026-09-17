#!/usr/bin/env node

/**
 * check-audit-protocol：校验 AI 资产未重述审计协议的档位与数值。
 *
 * 审计协议（audit-depth 分级、时间盒、轮次上限）的唯一权威定义在
 * docs/standards/ai-collaboration.md §3.1 / §3.4；其余 AI 入口只应链接引用。
 * 数值被抄写到多处后会静默漂移：本仓曾出现 skill 定义写「默认最多 2 轮」
 * 而权威规范写「默认最多 3 轮」的并存状态，且历经多轮 Review Gate 未被拦截。
 *
 * 检查范围：AGENTS.md、CLAUDE.md、.github/copilot-instructions.md 与
 * .github/agents/*.agent.md、.github/skills 下的全部 .md。
 * 豁免：docs/ 下不检查（规范正文与治理记录承载或引述权威数值）；
 *      围栏代码块内仅轮次标题模板（`## Round N（第 N 轮）`）不计，其余照常判定。
 *
 * 用法：
 *   node scripts/governance/check-audit-protocol.mjs [仓库根目录]
 */
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import { isDirectExecution } from '../shared/cli.mjs'

const REPO_ROOT = join(fileURLToPath(import.meta.url), '..', '..', '..')

/** 位于仓库根或 .github 下的 AI 入口文件（存在才检查）。 */
export const ENTRY_FILES = ['AGENTS.md', 'CLAUDE.md', '.github/copilot-instructions.md']

/** 围栏代码块内允许保留的轮次标题模板形态（如 `## Round 1（第 1 轮）`）。 */
export const TEMPLATE_HEADING = /^#{1,6}\s+Round\s+\d+/i

export const RULES = [
    {
        id: 'review-rounds',
        test: (line) =>
            /\d+(?:\s*[+\-–~至]\s*\d+)?\s*[+\-–~至]?\s*轮/.test(line)
            || /(?:第|共|最多|上限|预算|不超过)[^\n]{0,4}[一二两三四五]\s*轮/.test(line)
            || /\b\d+\s*rounds?\b/i.test(line)
            || /\brounds?\s*\d+/i.test(line)
            || /\bround\s+(?:one|two|three|four|five)\b/i.test(line),
        hint: '轮次上限 / 轮次预算以 AI 协作规范 §3.4 为唯一权威，此处改为链接引用',
    },
    {
        id: 'audit-duration',
        test: (line) => /\d+\s*(?:分钟|minutes?\b)/i.test(line),
        hint: '时间盒与档位时长以 AI 协作规范 §3.1 为唯一权威，此处改为链接引用',
    },
]

/**
 * 收集需要检查的 AI 资产文件：入口文件 + agent 定义 + skill 目录下的全部 markdown。
 *
 * @param {string} repoRoot 仓库根目录
 * @returns {string[]} 绝对路径列表（已排序）
 */
export function collectAssetFiles(repoRoot) {
    const files = []
    for (const entry of ENTRY_FILES) {
        const file = join(repoRoot, entry)
        if (existsSync(file)) {
            files.push(file)
        }
    }
    const agentsDir = join(repoRoot, '.github/agents')
    if (existsSync(agentsDir)) {
        for (const name of readdirSync(agentsDir)) {
            if (name.endsWith('.agent.md')) {
                files.push(join(agentsDir, name))
            }
        }
    }
    const skillsDir = join(repoRoot, '.github/skills')
    if (existsSync(skillsDir)) {
        for (const name of readdirSync(skillsDir)) {
            const skillDir = join(skillsDir, name)
            if (statSync(skillDir).isDirectory()) {
                files.push(...collectMarkdown(skillDir))
            }
        }
    }
    return files.sort()
}

/**
 * 递归收集目录下的 markdown 文件。
 *
 * @param {string} dir 起始目录
 * @returns {string[]} 绝对路径列表
 */
function collectMarkdown(dir) {
    const files = []
    for (const name of readdirSync(dir)) {
        const file = join(dir, name)
        if (statSync(file).isDirectory()) {
            files.push(...collectMarkdown(file))
            continue
        }
        if (name.endsWith('.md')) {
            files.push(file)
        }
    }
    return files
}

/**
 * 逐行扫描文本，跳过围栏代码块；同一行命中多条规则时逐条记录。
 *
 * @param {string} content 文件内容
 * @param {Array<{ id: string, test: (line: string) => boolean, hint: string }>} rules 规则表
 * @returns {Array<{ line: number, ruleId: string, snippet: string, hint: string }>} 命中列表
 */
export function scanContent(content, rules = RULES) {
    const hits = []
    let inFence = false
    content.split(/\r?\n/).forEach((line, index) => {
        if (/^\s*(```|~~~)/.test(line)) {
            inFence = !inFence
            return
        }
        if (inFence && TEMPLATE_HEADING.test(line)) {
            return
        }
        for (const rule of rules) {
            if (rule.test(line)) {
                hits.push({ line: index + 1, ruleId: rule.id, snippet: line.trim(), hint: rule.hint })
            }
        }
    })
    return hits
}

/**
 * 校验命令行传入的目标目录：必须是含 `.github/` 的仓库根，非法参数不得静默放行。
 *
 * @param {string | undefined} arg 位置参数
 * @param {string} fallbackRoot 未传参时的默认根目录
 * @returns {{ root: string | null, error: string | null }} 目标根或错误原因
 */
export function resolveTargetRoot(arg, fallbackRoot = REPO_ROOT) {
    if (!arg) {
        return { root: fallbackRoot, error: null }
    }
    if (arg.startsWith('-')) {
        return { root: null, error: `不支持的参数：${arg}` }
    }
    if (!existsSync(join(arg, '.github'))) {
        return { root: null, error: `目标目录不是仓库根（缺 .github/）：${arg}` }
    }
    return { root: arg, error: null }
}

/**
 * 扫描仓库内全部 AI 资产。
 *
 * @param {string} repoRoot 仓库根目录
 * @returns {Array<{ file: string, hits: Array<{ line: number, ruleId: string, snippet: string, hint: string }> }>} 按文件聚合的命中
 */
export function scanAssets(repoRoot) {
    const results = []
    for (const file of collectAssetFiles(repoRoot)) {
        const hits = scanContent(readFileSync(file, 'utf8'))
        if (hits.length > 0) {
            results.push({ file: relative(repoRoot, file), hits })
        }
    }
    return results
}

if (isDirectExecution(import.meta.url)) {
    const { root: targetRoot, error: rootError } = resolveTargetRoot(process.argv[2])
    const assetFiles = rootError ? [] : collectAssetFiles(targetRoot)
    if (rootError) {
        process.stderr.write(`[check-audit-protocol] ${rootError}\n`)
        process.exitCode = 1
    } else if (assetFiles.length === 0) {
        process.stderr.write(`[check-audit-protocol] 未找到任何 AI 资产文件（目标目录：${targetRoot}）：拒绝以空扫描通过\n`)
        process.exitCode = 1
    } else {
        report(targetRoot)
    }
}

/**
 * 扫描并输出报告，按规则分别计数；存在命中时置退出码 1。
 *
 * @param {string} targetRoot 仓库根目录
 * @returns {void}
 */
function report(targetRoot) {
    const results = scanAssets(targetRoot)
    const counts = new Map()
    for (const { file, hits } of results) {
        for (const hit of hits) {
            process.stderr.write(`${file}:${hit.line}:${hit.ruleId}: ${hit.snippet}\n`)
            process.stderr.write(`  修复方向：${hit.hint}\n`)
            counts.set(hit.ruleId, (counts.get(hit.ruleId) ?? 0) + 1)
        }
    }
    const total = [...counts.values()].reduce((sum, count) => sum + count, 0)
    if (total === 0) {
        process.stdout.write('[check-audit-protocol] 0 处命中：AI 资产未重述审计协议数值\n')
    } else {
        const detail = [...counts.entries()].map(([id, count]) => `${id} ${count} 处`).join(' / ')
        process.stderr.write(`[check-audit-protocol] ${total} 处命中（${results.length} 个文件）：${detail}\n`)
        process.stderr.write('[check-audit-protocol] 审计协议数值须单点声明在 AI 协作规范 §3.1 / §3.4\n')
        process.exitCode = 1
    }
}
