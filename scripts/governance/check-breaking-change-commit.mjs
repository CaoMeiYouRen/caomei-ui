#!/usr/bin/env node

/**
 * check-breaking-change-commit：破坏性提交人工审查记录守卫（**commit-msg 钩子**）。
 *
 * 目的：破坏性提交（头部 `!` 或 `BREAKING CHANGE:` footer）进入本地历史**之前**，必须有
 * 项目所有者或授权人确认后写入的 `Breaking-Review:` footer。AI 自查与 Review Gate 都不替代
 * 这道人工确认；本守卫只校验记录存在、格式、位置与配套 footer，无法验证「人真的看过」。
 *
 * 判别规则（受检面 = 提交消息全文）：
 * - T1 `hyphenated-breaking-change`——出现 `BREAKING-CHANGE:`（发布链的 `noteKeywords` 只识别
 *   空格形式，连字符会被静默降级）；
 * - T2 `stray-breaking-review`——非破坏性提交出现 `Breaking-Review:`；
 * - T3 `missing-breaking-review`——破坏性提交缺少 `Breaking-Review:`；
 * - T4 `duplicate-breaking-review`——同一提交出现多条 `Breaking-Review:`；
 * - T5 `malformed-breaking-review`——记录不匹配
 *   `Breaking-Review: <标识> <YYYY-MM-DD> <approved|approved-with-migration>[@<哈希>]`；
 * - T6 `invalid-breaking-review-date`——日期不是真实日历日期；
 * - T7 `invalid-breaking-review-reviewer`——确认人标识不是 GitHub 登录名；
 * - T8 `missing-breaking-change-footer`——头部含 `!` 但没有 `BREAKING CHANGE:` footer；
 * - T9 `misplaced-breaking-review`——`Breaking-Review:` 位于第一个 `BREAKING CHANGE:` 之后；
 * - T10 `breaking-review-not-in-footer`——`Breaking-Review:` 未与正文以空行分隔，未落在 footer 区；
 * - T11 `empty-breaking-change-note`——`BREAKING CHANGE:` 没有说明文本。
 *
 * 已知边界：`approved-with-migration` 是否真的给出迁移路径、确认人是否真的审过，均无法机检，
 * 由人工审查记录与 Review Gate 核对。历史提交不回补记录，本守卫只在新提交消息上生效。
 *
 * 用法：
 *   node scripts/governance/check-breaking-change-commit.mjs .git/COMMIT_EDITMSG
 *   node scripts/governance/check-breaking-change-commit.mjs <任意消息文件>
 */
import { readFileSync } from 'node:fs'
import { isDirectExecution } from '../shared/cli.mjs'

/** 供机器读取的失败码全集（单测据此断言，避免用字符串散落比对）。 */
export const ISSUE_CODES = {
    readError: 'read-error',
    hyphenBreaking: 'hyphenated-breaking-change',
    strayReview: 'stray-breaking-review',
    missingReview: 'missing-breaking-review',
    duplicateReview: 'duplicate-breaking-review',
    malformedReview: 'malformed-breaking-review',
    invalidDate: 'invalid-breaking-review-date',
    invalidReviewer: 'invalid-breaking-review-reviewer',
    missingBreakingFooter: 'missing-breaking-change-footer',
    misplacedReview: 'misplaced-breaking-review',
    reviewNotInFooter: 'breaking-review-not-in-footer',
    emptyBreakingNote: 'empty-breaking-change-note',
}

/** `Breaking-Review:` footer 的合法格式；确认人标识另由 `GITHUB_LOGIN_PATTERN` 与保留集校验。 */
export const BREAKING_REVIEW_PATTERN = /^Breaking-Review: ([^\s@]+) (\d{4})-(\d{2})-(\d{2}) (approved|approved-with-migration)(?: @([0-9a-f]{7,40}))?$/

/** GitHub 登录名：1-39 位字母数字或连字符，不以连字符开头 / 结尾。 */
export const GITHUB_LOGIN_PATTERN = /^[A-Za-z0-9](?:[A-Za-z0-9-]{0,37}[A-Za-z0-9])?$/

/** 形似登录名但语义为占位符的标识；不得作为确认人。 */
export const RESERVED_REVIEWER_IDENTIFIERS = new Set(['owner', 'todo', 'tbd', 'me', 'self', 'unknown', 'n/a'])

/** 头部 `!`：`type!:` 或 `type(scope)!:`。 */
export const BREAKING_HEADER_PATTERN = /^[A-Za-z]+(?:\([^)]*\))?!:/

/**
 * 发布链可抽取的 breaking note 形态。
 *
 * `conventional-commits-parser` 6.x / 7.x 均按大小写不敏感匹配，且允许前导空白 / `*` / `|`；
 * 6.x 还接受 `BREAKING CHANGE` 后只跟空白。守卫取两者并集，避免「parser 认、守卫不认」的漏放。
 */
export const BREAKING_NOTE_PATTERN = /^[\s|*]*BREAKING CHANGE[:\s]+(.*)$/i

/** 连字符形式：发布链的 `noteKeywords` 不识别，一律拒绝。 */
export const HYPHEN_BREAKING_PATTERN = /^[\s|*]*BREAKING-CHANGE[:\s]/i

/** footer token，用于判断 `Breaking-Review:` 前一行是否仍处于 footer 区；排除 URL 的 `https:`。 */
const FOOTER_TOKEN_PATTERN = /^(?!https?:)[A-Za-z][A-Za-z-]*(?: [A-Z]+)?:/i

/** 明确结束 note 的 footer token；`Refs|Closes|Fixes` 只在 `: #` 或 ` #` 后成立，避免误杀冒号 prose。 */
const NOTE_END_PATTERN = /^(?:[\s|*]*(?:BREAKING CHANGE|BREAKING-CHANGE)(?::|\s)|[\s|*]*Breaking-Review:|[\s|*]*(?:Refs|Closes|Fixes)(?::\s*#|\s+#)|[\s|*]*(?:Signed-off-by|Reviewed-by|Co-authored-by):)/i

/**
 * 校验 `YYYY-MM-DD` 是否为真实日历日期。
 *
 * @param {string} year 四位年份
 * @param {string} month 两位月份
 * @param {string} day 两位日期
 * @returns {boolean}
 */
export function isValidReviewDate(year, month, day) {
    const numericYear = Number(year)
    const numericMonth = Number(month)
    const numericDay = Number(day)
    if (numericYear < 1000 || numericMonth < 1 || numericMonth > 12 || numericDay < 1 || numericDay > 31) {
        return false
    }
    const date = new Date(Date.UTC(numericYear, numericMonth - 1, numericDay))
    return date.getUTCFullYear() === numericYear
        && date.getUTCMonth() === numericMonth - 1
        && date.getUTCDate() === numericDay
}

/**
 * 校验一条提交消息。
 *
 * @param {string} message 提交消息全文
 * @returns {{ isBreaking: boolean, errors: Array<{ code: string, message: string }>, review: ({ reviewer: string, date: string, conclusion: string, hash: string | null, line: number }) | null }}
 */
export function checkMessage(message) {
    const text = String(message).replace(/\r\n?/g, '\n')
    const lines = text.split('\n')
    const errors = []
    const header = lines[0] ?? ''
    const headerBreaking = BREAKING_HEADER_PATTERN.test(header)
    const noteIndexes = []
    const hyphenIndexes = []
    const reviewIndexes = []

    lines.forEach((line, index) => {
        if (BREAKING_NOTE_PATTERN.test(line)) {
            noteIndexes.push(index)
        }
        if (HYPHEN_BREAKING_PATTERN.test(line)) {
            hyphenIndexes.push(index)
        }
        if (line.startsWith('Breaking-Review:')) {
            reviewIndexes.push(index)
        }
    })

    for (const index of hyphenIndexes) {
        errors.push({
            code: ISSUE_CODES.hyphenBreaking,
            message: `第 ${index + 1} 行：禁用 BREAKING-CHANGE:，请改用 BREAKING CHANGE:（发布链只识别空格形式）`,
        })
    }

    const isBreaking = headerBreaking || noteIndexes.length > 0
    if (!isBreaking) {
        for (const index of reviewIndexes) {
            errors.push({
                code: ISSUE_CODES.strayReview,
                message: `第 ${index + 1} 行：非破坏性提交不应包含 Breaking-Review:`,
            })
        }
        return { isBreaking, errors, review: null }
    }

    if (reviewIndexes.length === 0) {
        errors.push({
            code: ISSUE_CODES.missingReview,
            message: '破坏性提交缺少 Breaking-Review: footer（格式与时机见 docs/standards/git.md §2/§3）',
        })
    } else if (reviewIndexes.length > 1) {
        errors.push({
            code: ISSUE_CODES.duplicateReview,
            message: `破坏性提交只能包含一条 Breaking-Review:，当前 ${reviewIndexes.length} 条`,
        })
    }

    if (headerBreaking && noteIndexes.length === 0) {
        errors.push({
            code: ISSUE_CODES.missingBreakingFooter,
            message: '头部含 ! 时必须在 footer 写 BREAKING CHANGE:，说明破坏面与迁移方式',
        })
    }

    let review = null
    if (reviewIndexes.length === 1) {
        const index = reviewIndexes[0]
        const match = lines[index].match(BREAKING_REVIEW_PATTERN)
        if (!match) {
            errors.push({
                code: ISSUE_CODES.malformedReview,
                message: `第 ${index + 1} 行：Breaking-Review: 格式应为 <确认人标识> <YYYY-MM-DD> <approved|approved-with-migration> [@<7-40 位小写十六进制>]`,
            })
        } else {
            const [, reviewer, year, month, day, conclusion, hash] = match
            if (!GITHUB_LOGIN_PATTERN.test(reviewer) || RESERVED_REVIEWER_IDENTIFIERS.has(reviewer.toLowerCase())) {
                errors.push({
                    code: ISSUE_CODES.invalidReviewer,
                    message: `第 ${index + 1} 行：确认人标识必须是 GitHub 登录名（1-39 位字母数字或连字符，不以连字符开头 / 结尾），且不得使用占位标识：${reviewer}`,
                })
            }
            if (!isValidReviewDate(year, month, day)) {
                errors.push({
                    code: ISSUE_CODES.invalidDate,
                    message: `第 ${index + 1} 行：Breaking-Review: 日期不是真实日历日期：${year}-${month}-${day}`,
                })
            }
            review = {
                reviewer,
                date: `${year}-${month}-${day}`,
                conclusion,
                hash: hash ?? null,
                line: index + 1,
            }
        }

        if (noteIndexes.length > 0 && index > noteIndexes[0]) {
            errors.push({
                code: ISSUE_CODES.misplacedReview,
                message: `第 ${index + 1} 行：Breaking-Review: 必须位于第一个 BREAKING CHANGE:（第 ${noteIndexes[0] + 1} 行）之前`,
            })
        }

        if (index > 0 && lines[index - 1].trim() !== '' && !FOOTER_TOKEN_PATTERN.test(lines[index - 1])) {
            errors.push({
                code: ISSUE_CODES.reviewNotInFooter,
                message: `第 ${index + 1} 行：Breaking-Review: 必须与正文以空行分隔，位于 footer 区`,
            })
        }
    }

    for (const noteIndex of noteIndexes) {
        const noteMatch = lines[noteIndex].match(BREAKING_NOTE_PATTERN)
        const sameLine = (noteMatch?.[1] ?? '').trim()
        if (sameLine) {
            continue
        }
        const nextContentIndex = lines.findIndex((line, index) => index > noteIndex && line.trim() !== '')
        const nextLine = nextContentIndex === -1 ? '' : lines[nextContentIndex]
        if (!nextLine || NOTE_END_PATTERN.test(nextLine)) {
            errors.push({
                code: ISSUE_CODES.emptyBreakingNote,
                message: `第 ${noteIndex + 1} 行：BREAKING CHANGE: 的说明不能为空`,
            })
        }
    }

    return { isBreaking, errors, review }
}

/**
 * 把错误列表格式化为多行文本。
 *
 * @param {Array<{ code: string, message: string }>} errors 错误列表
 * @returns {string}
 */
export function formatErrors(errors) {
    return errors.map((error) => `[${error.code}] ${error.message}`).join('\n')
}

/**
 * CLI 入口。
 *
 * @param {string[]} argv 参数列表（不含 node / 脚本名）
 * @returns {number} 进程退出码
 */
export function main(argv = process.argv.slice(2)) {
    if (argv.length !== 1 || argv[0].startsWith('--')) {
        console.error('用法：node scripts/governance/check-breaking-change-commit.mjs <commit-msg-file>')
        return 1
    }

    let message
    try {
        message = readFileSync(argv[0], 'utf8')
    } catch (error) {
        console.error(`[${ISSUE_CODES.readError}] 无法读取提交消息文件 ${argv[0]}：${error.message}`)
        return 1
    }

    const { errors } = checkMessage(message)
    if (errors.length > 0) {
        console.error(formatErrors(errors))
        return 1
    }
    return 0
}

if (isDirectExecution(import.meta.url)) {
    process.exitCode = main()
}
