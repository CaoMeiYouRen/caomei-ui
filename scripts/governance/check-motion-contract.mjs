#!/usr/bin/env node

/**
 * check-motion-contract：动效 token 契约守卫。
 *
 * 为什么需要它：动效轴（`data-motion="expressive"`）只有在**所有状态过渡与一次性动画都消费
 * `--caomei-motion-*`** 时才可控；散落的时长字面量会让 `expressive` 只覆盖一部分组件，
 * 也会让 `prefers-reduced-motion` 的压平出现漏网。本守卫把「token 化 + reduce 兜底 + 轴覆盖」
 * 变成可判定门禁，防止后续批次重新引入裸时长。
 *
 * 校验：
 * 1. `src/styles/theme.css` 必须声明默认 token / `[data-motion='expressive']` 覆盖 /
 *    `@media (prefers-reduced-motion: reduce)` 压平三组，且值符合契约；
 * 2. `src/**` 的 `transition` / `animation` / `animation-duration` 不得含裸时长
 *    （加载类循环动画按 `LOADING_ANIMATIONS` 白名单放行）；
 * 3. 禁止 `transition: all`；
 * 4. 被消费的 `--caomei-motion-*` 必须已在默认声明中登记（防拼写漂移）。
 *
 * 边界：只做静态文本校验，不验证真实渲染；时间轴与 reduce 行为由 E2E / 契约测试承担。
 * 受检面下界防止扫描被静默削弱（新增 / 删除组件时同步调整）。
 *
 * 用法：
 *   node scripts/governance/check-motion-contract.mjs   # 有违规 exit 1
 */
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { isDirectExecution } from '../shared/cli.mjs'

export const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..')

/** 主题 token 文件（动效轴与默认值的唯一声明处）。 */
export const THEME_FILE = 'src/styles/theme.css'

/** 默认动效 token 契约（`minimal` = 迁移前现值）。 */
export const DEFAULT_TOKENS = {
    '--caomei-motion-duration-instant': '100ms',
    '--caomei-motion-duration-fast': '120ms',
    '--caomei-motion-duration-base': '150ms',
    '--caomei-motion-duration-emphasis': '180ms',
    '--caomei-motion-duration-slow': '200ms',
    '--caomei-motion-duration-slower': '300ms',
    '--caomei-motion-ease-standard': 'ease',
    '--caomei-motion-ease-out': 'ease-out',
    '--caomei-motion-ease-in-out': 'ease-in-out',
    '--caomei-motion-ease-linear': 'linear',
    '--caomei-motion-distance-sm': '0px',
    '--caomei-motion-distance-md': '0px',
    '--caomei-motion-scale-from': '1',
}

/** `expressive` 轴必须覆盖的 token（值由契约测试锁定，守卫只查存在性）。 */
export const EXPRESSIVE_SELECTOR = '[data-motion=\'expressive\']'

/** `reduce` 下必须归零的 token。 */
export const REDUCE_TOKENS = {
    '--caomei-motion-duration-instant': '0s',
    '--caomei-motion-duration-fast': '0s',
    '--caomei-motion-duration-base': '0s',
    '--caomei-motion-duration-emphasis': '0s',
    '--caomei-motion-duration-slow': '0s',
    '--caomei-motion-duration-slower': '0s',
    '--caomei-motion-distance-sm': '0px',
    '--caomei-motion-distance-md': '0px',
    '--caomei-motion-scale-from': '1',
}

/**
 * 加载类循环动画白名单：这些 `animation` 的时长保留组件级声明。
 *
 * 理由：无限循环没有「终态」，强行归并到单一 loop token 会丢失 spinner / skeleton /
 * progress / image pulse 各自的节奏；reduce 下按组件规则降速（1.6s / 2.4s）。
 */
export const LOADING_ANIMATIONS = new Set([
    'caomei-auto-complete-spin',
    'caomei-button-spin',
    'caomei-image-pulse',
    'caomei-progress-bar-indeterminate',
    'caomei-progress-spinner-spin',
    'caomei-skeleton-pulse',
    'caomei-skeleton-wave',
])

/** 允许 `animation-duration` 字面量的文件与值（仅加载类 reduce 降速）。 */
export const LOADING_DURATION_FILES = {
    'src/components/auto-complete/auto-complete.vue': ['1.6s'],
    'src/components/progress-bar/progress-bar.vue': ['2.4s'],
    'src/components/progress-spinner/progress-spinner.vue': ['1.6s'],
    'src/components/skeleton/skeleton.vue': ['2.4s'],
}

/**
 * 必须显式声明 `prefers-reduced-motion: reduce` 的动效来源。
 *
 * 全局 token 压平已覆盖所有 token 化过渡，但以下来源在迁移前完全缺少 reduce 兜底
 * （共享字段层 + 3 个组件），显式规则保证「整段动效关闭」而非仅时长归零。
 */
export const REQUIRED_REDUCE_FILES = [
    'src/styles/field-shell.css',
    'src/components/multi-select/multi-select.vue',
    'src/components/tags-input/tags-input.vue',
    'src/components/toast/toast.vue',
]

/** 受检面下界（防扫描被静默削弱）。 */
export const SCOPE_FLOOR = {
    files: 25,
    declarations: 60,
}

/** 失败码。 */
export const ISSUE_CODES = {
    ioError: 'io-error',
    bareDuration: 'bare-duration',
    transitionAll: 'transition-all',
    unknownToken: 'unknown-token',
    missingDefault: 'missing-default-token',
    defaultMismatch: 'default-token-mismatch',
    missingExpressive: 'missing-expressive-token',
    missingReduce: 'missing-reduce-token',
    missingReduceCoverage: 'missing-reduce-coverage',
    reduceMismatch: 'reduce-token-mismatch',
    scopeNarrowed: 'scope-narrowed',
}

/** 时长字面量（`0.15s` / `150ms`）；不匹配 `0` 之外的纯数字。 */
const TIME_LITERAL_RE = /(?<![\w-])(?:\d+\.?\d*|\.\d+)(?:ms|s)\b/g

/** `--caomei-motion-*` 名称。 */
const MOTION_TOKEN_RE = /--caomei-motion-[a-z0-9-]+/g

/**
 * 剥离块注释但保留行号：把注释字符替换为空格、换行保留。
 *
 * @param {string} text 原始文本
 * @returns {string} 注释已清空的文本
 */
export function stripComments(text) {
    return text.replace(/\/\*[\s\S]*?\*\//g, (block) => block.replace(/[^\n]/g, ' '))
}

/**
 * 提取指定选择器的规则体（第一个匹配，支持括号 / 方括号嵌套）。
 *
 * @param {string} css 已剥离注释的 CSS 文本
 * @param {string} selector 选择器（字面量）
 * @returns {string | null} 规则体；未找到为 null
 */
export function blockOf(css, selector) {
    const index = css.indexOf(selector)
    if (index === -1) {
        return null
    }
    const open = css.indexOf('{', index + selector.length)
    if (open === -1) {
        return null
    }
    let depth = 0
    for (let i = open; i < css.length; i += 1) {
        if (css[i] === '{') {
            depth += 1
        } else if (css[i] === '}') {
            depth -= 1
            if (depth === 0) {
                return css.slice(open + 1, i)
            }
        }
    }
    return null
}

/**
 * 解析规则体内的 token 声明。
 *
 * @param {string} body 规则体
 * @returns {Map<string, string>} token → 值（已折叠空白）
 */
export function parseTokens(body) {
    const tokens = new Map()
    const re = /(--caomei-motion-[a-z0-9-]+)\s*:\s*([^;]+);/g
    let match
    while ((match = re.exec(body)) !== null) {
        tokens.set(match[1], match[2].trim().replace(/\s+/g, ' '))
    }
    return tokens
}

/**
 * 递归枚举目录下的 `.vue` / `.css` 文件。
 *
 * @param {string} dir 目录
 * @returns {string[]} 绝对路径
 */
export function listStyleFiles(dir) {
    const files = []
    for (const entry of readdirSync(dir)) {
        const path = join(dir, entry)
        if (statSync(path).isDirectory()) {
            files.push(...listStyleFiles(path))
        } else if (entry.endsWith('.vue') || entry.endsWith('.css')) {
            files.push(path)
        }
    }
    return files
}

/** `animation` 关键字（时长在名称之前时，用于跳过缓动 / 方向 / 填充等关键字）。 */
const ANIMATION_KEYWORDS = new Set([
    'alternate',
    'alternate-reverse',
    'backwards',
    'both',
    'ease',
    'ease-in',
    'ease-in-out',
    'ease-out',
    'forwards',
    'infinite',
    'inherit',
    'initial',
    'linear',
    'none',
    'normal',
    'paused',
    'reverse',
    'running',
    'step-end',
    'step-start',
    'unset',
])

/**
 * 从 `animation` 值中取动画名（第一个标识符；`none` 返回 null）。
 *
 * @param {string} value `animation` 声明值
 * @returns {string | null} 动画名
 */
export function animationNameOf(value) {
    const trimmed = value.trim()
    if (!trimmed || trimmed === 'none') {
        return null
    }
    // 时长可以出现在名称之前（`animation: 150ms ease name`）；此时需要跳过关键字。
    if (/^(?:\d|\.)/.test(trimmed)) {
        const candidates = trimmed
            .replace(TIME_LITERAL_RE, ' ')
            .replace(/(?:cubic-bezier|steps)\([^)]*\)/g, ' ')
            .match(/[A-Za-z][\w-]*/g) ?? []
        return candidates.find((candidate) => !ANIMATION_KEYWORDS.has(candidate)) ?? null
    }
    const match = /^([A-Za-z][\w-]*)/.exec(trimmed)
    return match ? match[1] : null
}

/**
 * 按顶层逗号拆分声明值（括号内的逗号不拆，如 `cubic-bezier(0.2, 0, 0, 1)`）。
 *
 * @param {string} value 声明值
 * @returns {string[]} 拆分后的片段
 */
export function splitTopLevelComma(value) {
    const parts = []
    let depth = 0
    let current = ''
    for (const char of value) {
        if (char === '(') {
            depth += 1
        } else if (char === ')') {
            depth -= 1
        }
        if (char === ',' && depth === 0) {
            parts.push(current.trim())
            current = ''
            continue
        }
        current += char
    }
    parts.push(current.trim())
    return parts.filter(Boolean)
}

/**
 * 分析动效契约。
 *
 * @param {{ themeCss: string, files: Map<string, string> }} input 主题 CSS 与源文件（仓库相对路径）
 * @param {{ enforceScopeFloor?: boolean }} [options] 选项（单测可关闭受检面下界）
 * @returns {{ issues: Array<{ code: string, file: string, line?: number, detail: string }>, stats: { files: number, declarations: number } }}
 */
export function analyzeMotionContract({ themeCss, files }, { enforceScopeFloor = true } = {}) {
    const issues = []
    const plainTheme = stripComments(themeCss)

    // 1) 默认 token
    const rootBody = blockOf(plainTheme, ':root')
    const defaults = parseTokens(rootBody ?? '')
    for (const [name, expected] of Object.entries(DEFAULT_TOKENS)) {
        if (!defaults.has(name)) {
            issues.push({ code: ISSUE_CODES.missingDefault, file: THEME_FILE, detail: `缺少默认声明 ${name}` })
        } else if (defaults.get(name) !== expected) {
            issues.push({
                code: ISSUE_CODES.defaultMismatch,
                file: THEME_FILE,
                detail: `${name} 期望 ${expected}，实际 ${defaults.get(name)}`,
            })
        }
    }

    // 2) expressive 轴
    const expressiveBody = blockOf(plainTheme, EXPRESSIVE_SELECTOR)
    const expressive = parseTokens(expressiveBody ?? '')
    for (const name of Object.keys(DEFAULT_TOKENS)) {
        if (!expressive.has(name)) {
            issues.push({ code: ISSUE_CODES.missingExpressive, file: THEME_FILE, detail: `未覆盖 ${name}` })
        }
    }

    // 3) reduce 压平
    const reduceBody = blockOf(plainTheme, '@media (prefers-reduced-motion: reduce)')
    const reduce = parseTokens(reduceBody ?? '')
    for (const [name, expected] of Object.entries(REDUCE_TOKENS)) {
        if (!reduce.has(name)) {
            issues.push({ code: ISSUE_CODES.missingReduce, file: THEME_FILE, detail: `reduce 未声明 ${name}` })
        } else if (reduce.get(name) !== expected) {
            issues.push({
                code: ISSUE_CODES.reduceMismatch,
                file: THEME_FILE,
                detail: `reduce 下 ${name} 期望 ${expected}，实际 ${reduce.get(name)}`,
            })
        }
    }

    // 4) 源文件声明与 token 消费
    const declarationRe = /\b(transition-duration|transition-delay|transition|animation-duration|animation-delay|animation)\s*:\s*([^;}]+)/g
    const isZeroDuration = (value) => /^0(?:\.0+)?(?:ms|s)$/.test(value)
    let declarationCount = 0
    let scannedFiles = 0
    for (const [file, raw] of files) {
        const text = stripComments(raw)
        let fileDeclarations = 0
        for (const match of text.matchAll(declarationRe)) {
            fileDeclarations += 1
            declarationCount += 1
            const property = match[1]
            const value = match[2].trim().replace(/\s+/g, ' ')
            const line = (text.slice(0, match.index).match(/\n/g) ?? []).length + 1
            const literals = (value.match(TIME_LITERAL_RE) ?? []).filter((literal) => !isZeroDuration(literal))

            if (property === 'transition') {
                if (/(?:^|[\s,])all(?:[\s,]|$)/.test(value)) {
                    issues.push({
                        code: ISSUE_CODES.transitionAll,
                        file,
                        line,
                        detail: 'transition 不得使用 all',
                    })
                }
                if (literals.length > 0) {
                    issues.push({
                        code: ISSUE_CODES.bareDuration,
                        file,
                        line,
                        detail: `transition 使用裸时长 ${literals.join(' / ')}：${value}`,
                    })
                }
                continue
            }

            if (property === 'transition-duration' || property === 'transition-delay') {
                if (literals.length > 0) {
                    issues.push({
                        code: ISSUE_CODES.bareDuration,
                        file,
                        line,
                        detail: `${property} 使用裸时长 ${literals.join(' / ')}：${value}`,
                    })
                }
                continue
            }

            if (property === 'animation-duration' || property === 'animation-delay') {
                if (literals.length === 0) {
                    continue
                }
                const allowed = LOADING_DURATION_FILES[file]
                if (!allowed || literals.some((literal) => !allowed.includes(literal))) {
                    issues.push({
                        code: ISSUE_CODES.bareDuration,
                        file,
                        line,
                        detail: `${property} 使用未登记的裸时长 ${literals.join(' / ')}：${value}`,
                    })
                }
                continue
            }

            for (const item of splitTopLevelComma(value)) {
                const itemLiterals = (item.match(TIME_LITERAL_RE) ?? []).filter((literal) => !isZeroDuration(literal))
                if (itemLiterals.length === 0) {
                    continue
                }
                const name = animationNameOf(item)
                if (name !== null && LOADING_ANIMATIONS.has(name)) {
                    continue
                }
                issues.push({
                    code: ISSUE_CODES.bareDuration,
                    file,
                    line,
                    detail: `animation 使用裸时长 ${itemLiterals.join(' / ')}：${item}`,
                })
            }
        }
        if (fileDeclarations > 0) {
            scannedFiles += 1
        }

        for (const token of text.match(MOTION_TOKEN_RE) ?? []) {
            if (!(token in DEFAULT_TOKENS)) {
                issues.push({
                    code: ISSUE_CODES.unknownToken,
                    file,
                    detail: `消费了未登记的动效 token ${token}`,
                })
            }
        }
    }

    // 5) 必选 reduce 来源
    for (const file of REQUIRED_REDUCE_FILES) {
        const content = files.get(file)
        if (content === undefined) {
            issues.push({ code: ISSUE_CODES.ioError, file, detail: '必选 reduce 来源缺失' })
        } else if (!stripComments(content).includes('prefers-reduced-motion: reduce')) {
            issues.push({ code: ISSUE_CODES.missingReduceCoverage, file, detail: '缺少 prefers-reduced-motion: reduce 兜底' })
        }
    }

    // 6) 受检面下界
    if (enforceScopeFloor && (scannedFiles < SCOPE_FLOOR.files || declarationCount < SCOPE_FLOOR.declarations)) {
        issues.push({
            code: ISSUE_CODES.scopeNarrowed,
            file: 'src',
            detail: `受检面收窄：含动效声明文件 ${scannedFiles}（下界 ${SCOPE_FLOOR.files}）/ 声明 ${declarationCount}（下界 ${SCOPE_FLOOR.declarations}）`,
        })
    }

    return { issues, stats: { files: scannedFiles, declarations: declarationCount } }
}

/**
 * 读取仓库并执行校验。
 *
 * @param {string} [root] 仓库根
 * @returns {{ issues: Array<{ code: string, file: string, line?: number, detail: string }>, stats: { files: number, declarations: number } }}
 */
export function checkMotionContract(root = REPO_ROOT) {
    try {
        const themeCss = readFileSync(join(root, THEME_FILE), 'utf8')
        const files = new Map()
        for (const path of listStyleFiles(join(root, 'src'))) {
            files.set(relative(root, path).replaceAll('\\', '/'), readFileSync(path, 'utf8'))
        }
        return analyzeMotionContract({ themeCss, files })
    } catch (error) {
        return {
            issues: [{ code: ISSUE_CODES.ioError, file: '.', detail: `读取失败：${error.message}` }],
            stats: { files: 0, declarations: 0 },
        }
    }
}

if (isDirectExecution(import.meta.url)) {
    const { issues, stats } = checkMotionContract()
    for (const issue of issues) {
        const location = issue.line ? `${issue.file}:${issue.line}` : issue.file
        console.error(`[check-motion-contract][${issue.code}] ${location}：${issue.detail}`)
    }
    if (issues.length > 0) {
        console.error(`[check-motion-contract] ${issues.length} 处问题（文件 ${stats.files} / 声明 ${stats.declarations}）`)
        process.exit(1)
    }
    console.info(`[check-motion-contract] OK：动效 token 契约完整（文件 ${stats.files} / 声明 ${stats.declarations}）`)
}
