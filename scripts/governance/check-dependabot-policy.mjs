#!/usr/bin/env node

/**
 * check-dependabot-policy：断言「小版本自动、大版本人工」的依赖升级策略在配置层成立。
 *
 * 规则载体是 docs/standards/github-collaboration.md §3 的策略描述，机检面是配置文件本身：
 * 1. `.github/dependabot.yml` 的每个 package-ecosystem 条目必须声明 `allow.update-types`，
 *    且只含 `version-update:semver-patch` / `version-update:semver-minor`；
 *    出现 `version-update:semver-major` 即失败（大版本应转人工，不得进入自动合并路径）。
 * 2. `.github/mergify.yml` 必须排除 `release.config.js` 与 `.github/workflows/release.yml`，
 *    避免发布链路配置被自动合并改写。
 * 3. `.github/mergify.yml` 的 `check-success` 条件须与 `.github/workflows/test.yml` 的 job name
 *    集合**双向一致**（Test 新增 / 改名 job 未同步条件即失败），避免依赖升级绕过某些 CI 项目
 *    ——典型是视觉回归（`Visual`）：Playwright / Chromium 升级会改变栅格化结果。
 *
 * 受检面下界：ecosystem 条目数低于 `MIN_ECOSYSTEMS` 时失败，避免「配置被删 ⇒ 零命中通过」。
 * 不解析完整 YAML：本仓这两份配置结构稳定，正则切块足够定位「某条 ecosystem 缺 allow」，
 * 代价是只在块内匹配关键字——新增嵌套结构时须同步复核本脚本。
 *
 * 用法：
 *   node scripts/governance/check-dependabot-policy.mjs [仓库根目录]
 */
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { isDirectExecution } from '../shared/cli.mjs'

export const REPO_ROOT = join(fileURLToPath(import.meta.url), '..', '..', '..')

/** 受检面下界：当前为 npm + github-actions 两个 ecosystem。 */
export const MIN_ECOSYSTEMS = 2

/** 允许进入自动合并的更新级别。 */
export const ALLOWED_UPDATE_TYPES = [
    'version-update:semver-patch',
    'version-update:semver-minor',
]

/** 必须人工处理的更新级别。 */
export const FORBIDDEN_UPDATE_TYPE = 'version-update:semver-major'

/** Mergify 必须排除的文件（正则条件原文）。 */
export const MERGIFY_FILE_EXCLUSIONS = [
    '-files~=^release\\.config\\.js$',
    '-files~=^\\.github/workflows/release\\.yml$',
]

/**
 * 按 `- package-ecosystem:` 把 dependabot.yml 切成条目块。
 *
 * @param {string} text 配置原文
 * @returns {Array<{ ecosystem: string, body: string }>} 条目块
 */
export function splitEcosystems(text) {
    const blocks = []
    let current = null
    for (const line of text.split(/\r?\n/)) {
        const match = /^\s*-\s*package-ecosystem:\s*(\S+)/.exec(line)
        if (match) {
            current = { ecosystem: match[1], lines: [] }
            blocks.push(current)
            continue
        }
        current?.lines.push(line)
    }
    return blocks.map(({ ecosystem, lines }) => ({ ecosystem, body: lines.join('\n') }))
}

/**
 * 去掉 YAML 注释行（用于避免「注释停用条件」被当成仍然生效）。
 *
 * @param {string} text 配置原文
 * @returns {string} 去注释后的文本
 */
export function stripComments(text) {
    return text
        .split(/\r?\n/)
        .filter((line) => !/^\s*#/.test(line))
        .join('\n')
}

/**
 * 取出 `allow:` 子树（按缩进判定边界），避免把 `ignore:` 段的 update-types 误判为放行。
 *
 * @param {string} body 单个 ecosystem 块文本
 * @returns {string | null} allow 子树文本；不存在时为 null
 */
export function extractAllowBlock(body) {
    const lines = body.split(/\r?\n/)
    const index = lines.findIndex((line) => /^\s*allow:\s*$/.test(line))
    if (index === -1) {
        return null
    }
    const baseIndent = lines[index].match(/^\s*/)[0].length
    const block = [lines[index]]
    for (let i = index + 1; i < lines.length; i += 1) {
        const line = lines[i]
        if (line.trim() === '') {
            continue
        }
        if (line.match(/^\s*/)[0].length <= baseIndent) {
            break
        }
        block.push(line)
    }
    return block.join('\n')
}

/**
 * 校验 dependabot.yml 的版本更新限制。
 *
 * @param {string} text 配置原文
 * @returns {string[]} 问题清单（空数组表示通过）
 */
export function checkDependabot(text) {
    const blocks = splitEcosystems(stripComments(text))
    const problems = []
    if (blocks.length < MIN_ECOSYSTEMS) {
        problems.push(`package-ecosystem 条目 ${blocks.length} 个，低于下界 ${MIN_ECOSYSTEMS}`)
    }
    for (const { ecosystem, body } of blocks) {
        const allowBlock = extractAllowBlock(body)
        if (!allowBlock) {
            problems.push(`${ecosystem}: 缺少 allow（版本更新未限制到 patch / minor）`)
            continue
        }
        if (!/^\s*update-types:\s*$/m.test(allowBlock)) {
            problems.push(`${ecosystem}: allow 缺少 update-types`)
            continue
        }
        if (allowBlock.includes(FORBIDDEN_UPDATE_TYPE)) {
            problems.push(`${ecosystem}: allow 仍放行 ${FORBIDDEN_UPDATE_TYPE}，大版本须转人工`)
        }
        const declared = [...allowBlock.matchAll(/version-update:semver-\w+/g)].map((m) => m[0])
        const unexpected = declared.filter((type) => !ALLOWED_UPDATE_TYPES.includes(type))
        if (unexpected.length > 0) {
            problems.push(`${ecosystem}: 出现未允许的更新级别 ${[...new Set(unexpected)].join(', ')}`)
        }
        const missing = ALLOWED_UPDATE_TYPES.filter((type) => !declared.includes(type))
        if (missing.length > 0) {
            problems.push(`${ecosystem}: allow.update-types 缺少 ${missing.join(', ')}`)
        }
    }
    return problems
}

/**
 * 按规则切分 mergify.yml，只返回带 `merge:` 动作的规则块。
 *
 * @param {string} text 配置原文
 * @returns {string[]} 规则块文本
 */
export function splitMergeRules(text) {
    const lines = stripComments(text).split(/\r?\n/)
    const dashIndents = lines
        .filter((line) => /^\s*-\s/.test(line))
        .map((line) => line.match(/^\s*/)[0].length)
    if (dashIndents.length === 0) {
        return []
    }
    const ruleIndent = Math.min(...dashIndents)
    const blocks = []
    let current = null
    for (const line of lines) {
        const indent = line.match(/^\s*/)[0].length
        if (/^\s*-\s/.test(line) && indent === ruleIndent) {
            current = [line]
            blocks.push(current)
            continue
        }
        current?.push(line)
    }
    return blocks.map((block) => block.join('\n')).filter((block) => /^\s*merge:\s*$/m.test(block))
}

/**
 * 去掉包裹在标量外的引号。
 *
 * @param {string} value 原始标量
 * @returns {string} 去引号后的值
 */
function unquote(value) {
    return value.replace(/^(['"])(.*)\1$/u, '$2').trim()
}

/**
 * 从 GitHub Actions 工作流提取 job name 集合（`jobs.<id>.name`）。
 *
 * @param {string} text 工作流原文
 * @returns {string[]} job name 清单
 */
export function extractWorkflowJobNames(text) {
    const lines = stripComments(text).split(/\r?\n/)
    const jobsIndex = lines.findIndex((line) => /^jobs:\s*$/u.test(line))
    if (jobsIndex === -1) {
        return []
    }
    const jobs = []
    let current = null
    for (let index = jobsIndex + 1; index < lines.length; index += 1) {
        const line = lines[index]
        if (line !== '' && !/^\s/u.test(line)) {
            break
        }
        const jobMatch = /^ {2}(['"]?)([A-Za-z0-9_-]+)\1:\s*(?:#.*)?$/u.exec(line)
        if (jobMatch) {
            current = { id: jobMatch[2], name: null }
            jobs.push(current)
            continue
        }
        if (!current || current.name) {
            continue
        }
        const nameMatch = /^ {4}name:\s*(.+?)\s*$/u.exec(line)
        if (nameMatch) {
            // 标量取到行尾注释之前（仅当 `#` 前有空白），再剥引号。
            current.name = unquote(nameMatch[1].split(/\s+#/u)[0])
        }
    }
    // 未声明 name 的 job 以 job id 作为 check 名（GitHub 语义），不得静默漏放。
    return jobs.map((job) => job.name ?? job.id)
}

/**
 * 校验 mergify.yml 的 `check-success` 条件与 Test 工作流 job 集合双向一致。
 *
 * @param {string} mergifyText mergify.yml 原文
 * @param {string} workflowText test.yml 原文
 * @returns {string[]} 问题清单（空数组表示通过）
 */
export function checkMergifyJobSync(mergifyText, workflowText) {
    const rules = splitMergeRules(mergifyText).filter((block) => block.includes('dependabot[bot]'))
    if (rules.length === 0) {
        return ['mergify.yml 未找到 dependabot 自动合并规则（策略已失效，需人工确认）']
    }
    const jobs = extractWorkflowJobNames(workflowText)
    if (jobs.length === 0) {
        return ['未从 Test 工作流解析到任何 job name（守卫失效，需人工确认）']
    }
    const problems = []
    rules.forEach((rule, index) => {
        const prefix = rules.length > 1 ? `第 ${index + 1} 条 dependabot 合并规则：` : ''
        // 条件值取到行尾注释之前（仅当 `#` 前有空白），避免注释被当成 check 名；
        // 代价是 check 名内部含 ` #` 的极端写法会被截断，本仓 job name 不含该形态。
        const required = [...rule.matchAll(/check-success\s*=\s*([^\n]+)/gu)].map((match) =>
            match[1].split(/\s+#/u)[0].trim())
        for (const name of required) {
            if (!jobs.includes(name)) {
                problems.push(`${prefix}check-success = ${name} 在 Test 工作流中不存在（job 改名后未同步？）`)
            }
        }
        for (const job of jobs) {
            if (!required.includes(job)) {
                problems.push(`${prefix}Test 工作流的 job「${job}」未进入自动合并条件（条件须与 Test CI 项目一致）`)
            }
        }
    })
    return problems
}

/**
 * 校验 mergify.yml：每条自动合并 dependabot PR 的规则都必须排除发布链路文件。
 *
 * @param {string} text 配置原文
 * @returns {string[]} 问题清单（空数组表示通过）
 */
export function checkMergify(text) {
    const autoMergeRules = splitMergeRules(text).filter((block) => block.includes('dependabot[bot]'))
    if (autoMergeRules.length === 0) {
        return ['mergify.yml 未找到 dependabot 自动合并规则（策略已失效，需人工确认）']
    }
    const problems = []
    autoMergeRules.forEach((block, index) => {
        for (const rule of MERGIFY_FILE_EXCLUSIONS) {
            if (!block.includes(rule)) {
                problems.push(`mergify.yml 第 ${index + 1} 条 dependabot 合并规则缺少条件 ${rule}`)
            }
        }
    })
    return problems
}

/**
 * 读取仓库内两份配置并汇总问题。
 *
 * @param {string} repoRoot 仓库根目录
 * @returns {string[]} 问题清单（空数组表示通过）
 */
export function checkRepo(repoRoot = REPO_ROOT) {
    const dependabot = readFileSync(join(repoRoot, '.github/dependabot.yml'), 'utf8')
    const mergify = readFileSync(join(repoRoot, '.github/mergify.yml'), 'utf8')
    const testWorkflow = readFileSync(join(repoRoot, '.github/workflows/test.yml'), 'utf8')
    return [
        ...checkDependabot(dependabot),
        ...checkMergify(mergify),
        ...checkMergifyJobSync(mergify, testWorkflow),
    ]
}

function main() {
    const problems = checkRepo(process.argv[2] ?? REPO_ROOT)
    if (problems.length === 0) {
        console.info('[check-dependabot-policy] OK：依赖升级仅 patch / minor 进入自动合并，发布链路配置已排除')
        return 0
    }
    console.error('[check-dependabot-policy] 发现策略与配置不一致：')
    for (const problem of problems) {
        console.error(`  - ${problem}`)
    }
    console.error('策略定义见 docs/standards/github-collaboration.md §3。')
    return 1
}

if (isDirectExecution(import.meta.url)) {
    process.exitCode = main()
}
