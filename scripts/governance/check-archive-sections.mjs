#!/usr/bin/env node

/**
 * check-archive-sections：阶段归档块的**必填小节**机检。
 *
 * 为什么需要它：归档块曾整体缺「未覆盖边界」一节，而这份缺口只能靠人工回扫发现——
 * 归档块的字段是知识载体（未覆盖面、遗留候选、质量门口径），缺一节即等于把「哪些没做」
 * 静默丢失。本守卫把这 6 项变成机检，防复发。
 *
 * ## 受检面（显式块清单）
 *
 * 只检查**字段口径生效之后归档的块**（下界见 `MIN_PHASE`，口径来源与例外见下方「豁免」），来源两处：
 * 1. 主窗口 `docs/plan/todo-archive.md` 内的 `## Phase <n>：…` 块（近线窗口）；
 * 2. `docs/plan/archive/todo-archive-phases-*.md` 内的同名块（深度归档）。
 *
 * 更早的块（见 `docs/plan/archive/todo-archive-phases-00-06.md` 起的同族文件）不在受检面：
 * 这些块成文于字段口径确定之前，回改会破坏「归档正文逐字保留」的迁移契约。口径下界见
 * `MIN_PHASE`，新增归档块自动纳入，无需登记。
 *
 * ## 6 项必填
 *
 * | # | 项 | 判定 | 字段位置 |
 * |:--|:--|:--|:--|
 * | 1 | 阶段标题 | `## Phase <n>：…` 且标题含「完成并归档」状态标记 | 块首行 |
 * | 2 | 元信息三条 | `- 时间：` / `- 范围与授权：` / `- 非目标：` 各至少 1 行 | 块首、**第一个 `###` 之前** |
 * | 3 | 主线小节 | 至少 1 个 `### M<数字> …` 小节 | `###` 层 |
 * | 4 | 质量门与 Review Gate 口径 | `### 阶段总结` 且含「质量门」；块内至少一处 `RG` / `Review Gate` 结论 | `###` 层 + 逐条行内 |
 * | 5 | 未覆盖边界 | `### 未覆盖边界` 且正文 ≥ 1 条 bullet | `###` 层 |
 * | 6 | 遗留与后续候选 | `### 遗留与后续候选` 且正文 ≥ 1 条 bullet | `###` 层 |
 *
 * ## 豁免（有意不检，写在此处以免被当成漏检）
 *
 * - **`### 回扫口径（三段式）`**：已有归档块中存在未设该节的先例（回扫结论并入阶段总结），故不列为必填；
 *   该节出现时不做额外校验。
 * - **质量门与逐条 Review Gate 的位置**：早期块把质量门写在「阶段总结」、把逐条 RG 结论写在
 *   各主线条目的行内（每条以 `RG <模式> \`Pass\`` 结尾），其后两段都写在阶段总结；两种形态
 *   均合规，故守卫只要求「阶段总结含质量门」+「块内至少一处 RG 结论」，不校验 RG 行数
 *   （逐条对账由 `check:archive-rg-counts` 承担）。
 * - **迁移说明行**：各深度归档文件顶部的「正文逐字保留」注记不参与校验；补节属例外，
 *   须在同一注记内写明（`docs/plan/archive/todo-archive-phases-39.md` 已按该口径补注）。
 *
 * 用法：
 *   node scripts/governance/check-archive-sections.mjs   # 有问题 exit 1
 */
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { isDirectExecution } from '../shared/cli.mjs'

export const REPO_ROOT = join(fileURLToPath(import.meta.url), '..', '..', '..')

/** 受检面下界：字段口径自该批次起生效（口径载体见模块注释「豁免」）。 */
export const MIN_PHASE = 39

/** 主窗口（近线窗口）与深度归档目录相对仓库根的路径。 */
export const MAIN_ARCHIVE = join('docs', 'plan', 'todo-archive.md')
export const DEEP_ARCHIVE_DIR = join('docs', 'plan', 'archive')

/** 元信息三条的字段前缀（须出现在块首、第一个 `###` 之前）。 */
export const META_FIELDS = ['时间：', '范围与授权：', '非目标：']

/** `###` 层必填小节（顺序不作要求，位置 = `###` 层任意处）。 */
export const REQUIRED_SUBSECTIONS = ['阶段总结', '未覆盖边界', '遗留与后续候选']

const PHASE_HEADING_RE = /^## Phase\s+(\d+)：(.+)$/u

/**
 * 从一份归档文件正文中切出全部 `## Phase <n>：…` 块。
 *
 * @param {string} content 文件正文
 * @param {string} source 相对路径（错误文案用）
 * @returns {{ phase: number, title: string, body: string, source: string }[]}
 */
export function splitPhaseBlocks(content, source) {
    const lines = content.split(/\r?\n/u)
    const blocks = []
    let current = null
    for (const line of lines) {
        const match = line.match(PHASE_HEADING_RE)
        if (match) {
            if (current) {
                blocks.push(current)
            }
            current = { phase: Number(match[1]), title: match[2], body: '', source }
            continue
        }
        if (current) {
            current.body += `${line}\n`
        }
    }
    if (current) {
        blocks.push(current)
    }
    return blocks
}

/** 截取某个 `### <name>` 小节的正文（到下一个 `### ` / `## ` 或文末）。 */
export function extractSubsection(body, name) {
    const lines = body.split(/\r?\n/u)
    const heading = `### ${name}`
    const start = lines.findIndex((line) => line.trim() === heading)
    if (start === -1) {
        return undefined
    }
    const end = lines.findIndex((line, index) => index > start && /^#{2,3}\s/u.test(line))
    const section = end === -1 ? lines.slice(start + 1) : lines.slice(start + 1, end)
    return section.join('\n')
}

/** 统计非空 bullet 行数。 */
export function countBullets(text) {
    return text
        .split(/\r?\n/u)
        .filter((line) => /^-\s+\S/u.test(line)).length
}

/**
 * 校验单个阶段块。
 *
 * @param {{ phase: number, title: string, body: string, source: string }} block 阶段块
 * @returns {string[]} 问题清单（空数组 = 通过）
 */
export function checkBlock(block) {
    const problems = []
    const label = `${block.source} @ Phase ${block.phase}`

    if (!block.title.includes('完成并归档')) {
        problems.push(`${label}：阶段标题缺少「完成并归档」状态标记`)
    }

    // 元信息必须出现在块首（第一个 `###` 之前），否则会被当成主线内容而非阶段元信息
    const firstSubsection = block.body.indexOf('\n### ')
    const head = firstSubsection === -1 ? block.body : block.body.slice(0, firstSubsection)
    for (const field of META_FIELDS) {
        if (!new RegExp(`^-\\s*${field}`, 'mu').test(head)) {
            problems.push(`${label}：缺少元信息「${field}」（须在第一个 ### 之前）`)
        }
    }

    if (!/^### M\d+/mu.test(block.body)) {
        problems.push(`${label}：缺少主线小节（### M<数字> …）`)
    }

    const summary = extractSubsection(block.body, '阶段总结')
    if (summary !== undefined && !/质量门/u.test(summary)) {
        problems.push(`${label}：阶段总结未写明质量门结论`)
    }
    if (!/\bRG\b|Review Gate/u.test(block.body)) {
        problems.push(`${label}：块内没有任何 Review Gate（RG）结论`)
    }

    for (const name of REQUIRED_SUBSECTIONS) {
        const section = extractSubsection(block.body, name)
        if (section === undefined) {
            problems.push(`${label}：缺少必填小节「### ${name}」`)
            continue
        }
        if (countBullets(section) < 1) {
            problems.push(`${label}：小节「### ${name}」没有任何条目（仅标题不算完成）`)
        }
    }

    return problems
}

/** 收集全部受检块（主窗口 + 深度归档，仅 Phase >= 39）。 */
export function collectBlocks(root = REPO_ROOT) {
    const files = [MAIN_ARCHIVE]
    let deepFiles = []
    try {
        deepFiles = readdirSync(join(root, DEEP_ARCHIVE_DIR))
            .filter((name) => name.endsWith('.md'))
            .sort()
            .map((name) => join(DEEP_ARCHIVE_DIR, name))
    } catch {
        deepFiles = []
    }

    const blocks = []
    for (const relativePath of [...files, ...deepFiles]) {
        let content
        try {
            content = readFileSync(join(root, relativePath), 'utf8')
        } catch {
            continue
        }
        blocks.push(
            ...splitPhaseBlocks(content, relativePath.split('\\').join('/'))
                .filter((block) => block.phase >= MIN_PHASE),
        )
    }
    return blocks
}

/**
 * 执行校验，返回 { ok, errors, checked }。
 *
 * @param {string} root 仓库根（测试可注入夹具目录）
 */
export function checkArchiveSections(root = REPO_ROOT) {
    const blocks = collectBlocks(root)
    if (blocks.length === 0) {
        return {
            ok: false,
            errors: [`受检面为空：Phase ${MIN_PHASE} 起没有任何归档块（疑似受检面被静默收窄）`],
            checked: 0,
        }
    }

    const errors = blocks.flatMap((block) => checkBlock(block))
    return { ok: errors.length === 0, errors, checked: blocks.length }
}

if (isDirectExecution(import.meta.url)) {
    const result = checkArchiveSections()
    if (result.ok) {
        console.info(`[check-archive-sections] 通过：${result.checked} 个归档块（Phase ${MIN_PHASE} 起）均含 6 项必填`)
        process.exit(0)
    }
    for (const error of result.errors) {
        console.error(`[check-archive-sections][error] ${error}`)
    }
    process.exit(1)
}
