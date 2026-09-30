#!/usr/bin/env node

/**
 * check-class-prefix：类名前缀拼写守卫。
 *
 * 为什么需要它：2026-09-29 的拼写缺陷修复批次（`docs/design/governance/2026-09-29-caumei-selector-typo-fix-and-release-registration.md`）
 * 实测同一根因（`caomei` 误拼为 `caumei`）4 处——规则选择器写错前缀后
 * **永不命中**，样式静默失效（`Button` 的 `iconOnly` 方形几何、`Select` 的非法态聚焦色），
 * 且当时全部现有守卫都不校验类名前缀拼写。0.4.0 已修复缺陷，本守卫补上机检面。
 *
 * 规则（T1~T4）：
 * - T1 `prefix-typo`——`<style>` 区 / `.css` `.scss` 文件中的选择器类名令牌，**以 `ca` 开头但不以
 *   `caomei-` 开头**即违规（`caumei-` / `caum-` / `caomei`（缺连字符）等拼写错误一律命中）。
 * - T2 `allowlist-rot`——允许名单**反向校验**：名单项须为合法令牌形态，且不再出现于受检面时须移除，
 *   防止误报豁免腐烂成永久豁免（形态对齐 `check:overlay-z-index` 的允许名单守卫）。
 * - T3 `scope-narrowed`——受检面下界（文件数 / 样式区数 / `ca` 前缀令牌出现次数），防静默收窄。
 * - T4 `sentinel-missing`——**哨兵文件身份断言**（`src/styles/theme.css` 等必须在受检面内）：
 *   数量下界挡不住「把受检根收窄到子目录」（实测 `src/components` 仍高于三项下界）。
 *
 * 受检面与边界（显式声明，避免被误读为「全仓类名拼写都受检」）：
 * - 只扫描 `src/**` 的**样式区**（`.vue` 的 `<style>` 块与整份 `.css` / `.scss`）；`docs/**` 示例、
 *   `playground/**`、模板 `class="…"` 属性与 `scripts/**` 内的选择器**不在面内**。
 * - 只对「以 `ca` 开头」的令牌施加前缀要求：`.card` / `.caret` 等第三方或原生类名虽也以 `ca` 开头，
 *   仍会被判为违规——这是**有意**的（受检面内实测为 0），确需使用时须登记进 `ALLOWED_TOKENS` 并写明理由。
 * - 以其它字母开头的拼写错误（如 `comei-`）不在本规则面内：前缀守卫的固有边界，见条目记录。
 * - 模板侧拼写（`class="caumei-x"` 且样式同步写错）不在面内：反向校验「样式令牌须在模板出现」
 *   实测 303 处误报（档位 / 变体类由模板动态拼接），已判定不实施，理由见条目记录。
 * - CSS 注释与字符串已剥离，避免「文档化反例」被误报。
 *
 * 实测口径（2026-09-30）：受检面 90 文件 / 81 样式区 / `ca` 前缀令牌出现 914 次，
 * 其中非 `caomei-` 前缀 0 次——故当前零误报、零例外。
 *
 * CLI 的**不带参数**调用（`governance:check` 链内）执行全部规则；仅显式 `--fixture <dir>` 才跳过下界与哨兵
 * （仅供受检面构造测试，会打印醒目提示；非 `--fixture` 的位置参数直接 exit 2），因此不存在静默绕过通道。
 *
 * 用法：
 *   node scripts/governance/check-class-prefix.mjs                 # 受检仓库 src/；有违规 exit 1
 *   node scripts/governance/check-class-prefix.mjs --fixture <dir> # 受检面构造测试（跳过下界与哨兵，exit 2 = 参数错）
 */
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { isDirectExecution } from '../shared/cli.mjs'

const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..')
const SRC_DIR = join(REPO_ROOT, 'src')

/** 库类名的唯一合法前缀。 */
export const CLASS_PREFIX = 'caomei-'

/** 需要施加前缀要求的首段（`ca` 开头者必须命中 `caomei-`）。 */
export const TOKEN_PREFIX = 'ca'

/**
 * 允许的非 `caomei-` 前缀令牌清单（小写令牌形态）。
 *
 * 当前为空——受检面内实测 0 处。新增一条须在条目记录中写明理由（第三方类名 / 原生类名），
 * 且受 T2 反向校验：条目不再出现在受检面时即报错。
 */
export const ALLOWED_TOKENS = []

/**
 * 受检面下界（防静默收窄；实测 90 文件 / 81 样式区 / 914 次 `ca` 前缀令牌，取下界留余量）。
 * 数量下界不足以单独防腐：另设 T4 哨兵文件断言（见 SENTINEL_FILES）。
 */
export const MIN_SCANNED_FILES = 70
export const MIN_STYLE_REGIONS = 65
export const MIN_PREFIXED_TOKEN_OCCURRENCES = 700

/**
 * 哨兵文件（必须出现在受检面内）：数量下界挡不住「把受检根收窄到子目录」这类根改动
 * ——实测 `checkClassPrefix('src/components')` 仍高于三项数量下界，故加**身份断言**兜底。
 */
export const SENTINEL_FILES = [
    'src/styles/theme.css',
    'src/styles/field-shell.css',
    'src/components/button/button.vue',
]

/** 类名令牌形态（允许名单项须同形）。 */
export const TOKEN_SHAPE_RE = /^-?[_a-zA-Z][_a-zA-Z0-9-]*$/

/** 选择器中的类名令牌；要求 `.` 后为合法标识符起始（排除 `.5em` 这类数值）。 */
export const CLASS_TOKEN_RE = /\.(-?[_a-zA-Z][_a-zA-Z0-9-]*)/g

const STYLE_EXT_RE = /\.(vue|css|scss)$/

const toRel = (file) => relative(REPO_ROOT, file).split('\\').join('/')

const countLines = (text) => text.split('\n').length

/**
 * 抽取文件的样式区。`.vue` 取全部 `<style>` 块（记录块体起始行号），
 * `.css` / `.scss` 取整份文件（起始行号 1）。
 *
 * @returns {Array<{ body: string, startLine: number }>}
 */
export function extractStyleRegions(file, text) {
    if (!file.endsWith('.vue')) {
        return [{ body: text, startLine: 1 }]
    }
    const regions = []
    const re = /<style[^>]*>([\s\S]*?)<\/style>/g
    let match
    while ((match = re.exec(text)) !== null) {
        const bodyOffset = match.index + match[0].indexOf(match[1])
        regions.push({ body: match[1], startLine: countLines(text.slice(0, bodyOffset)) })
    }
    return regions
}

/**
 * 剥离 CSS 注释与字符串（保留换行以维持行号），避免把「文档化反例」误判为选择器。
 */
export function stripNonSelectorText(region) {
    return (
        region
            .replace(/\/\*[\s\S]*?\*\//g, (block) => block.replace(/[^\n]/g, ' '))
            // 先剥字符串，避免字符串 / `url(//cdn/…)` 内的 `//` 被当成行注释而截断整行
            .replace(/"[^"]*"|'[^']*'/g, '""')
            // SCSS 行注释仅在「行首 / 空白 / ; { }」之后起算，排除 `https://`、`url(//…)` 等取值场景
            .replace(/(^|[;{}\s])\/\/.*$/gm, '$1')
    )
}

/**
 * 扫描单份源码的样式区，返回违规与统计。
 *
 * @returns {{
 *   violations: Array<{ file: string, line: number, token: string }>,
 *   occurrences: { prefixed: number, total: number },
 *   nonPrefixedTokens: Set<string>,
 * }}
 */
export function scanSource(source, { file = '<inline>', allowlist = ALLOWED_TOKENS } = {}) {
    const violations = []
    const occurrences = { prefixed: 0, total: 0 }
    const nonPrefixedTokens = new Set()
    const allowed = new Set(allowlist.map((token) => token.toLowerCase()))

    for (const region of extractStyleRegions(file, source)) {
        const lines = stripNonSelectorText(region.body).split('\n')
        lines.forEach((lineText, index) => {
            for (const match of lineText.matchAll(CLASS_TOKEN_RE)) {
                const token = match[1]
                const lower = token.toLowerCase()
                if (!lower.startsWith(TOKEN_PREFIX)) {
                    continue
                }
                occurrences.total += 1
                if (lower.startsWith(CLASS_PREFIX)) {
                    occurrences.prefixed += 1
                    continue
                }
                nonPrefixedTokens.add(lower)
                if (allowed.has(lower)) {
                    continue
                }
                violations.push({ file: toRel(file), line: region.startLine + index, token })
            }
        })
    }

    return { violations, occurrences, nonPrefixedTokens }
}

/**
 * 允许名单反向校验：名单项须为合法令牌形态，且仍出现于受检面。
 *
 * @param {string[]} allowlist 登记名单
 * @param {Set<string>} seenTokens 受检面内实际出现的非 `caomei-` 前缀令牌（小写）
 */
export function findAllowlistRot(allowlist, seenTokens) {
    const errors = []
    for (const entry of allowlist) {
        const shapeOk = TOKEN_SHAPE_RE.test(entry)
        const prefixOk = entry.startsWith(TOKEN_PREFIX) && !entry.startsWith(CLASS_PREFIX)
        if (!shapeOk || entry !== entry.toLowerCase() || !prefixOk) {
            errors.push(
                `允许名单项「${entry}」形态非法：须为小写类名令牌（以 ${TOKEN_PREFIX} 开头、非 ${CLASS_PREFIX}、同 ${String(TOKEN_SHAPE_RE)}）`,
            )
            continue
        }
        if (!seenTokens.has(entry)) {
            errors.push(`允许名单项「${entry}」在受检面内不再出现：请移除该豁免（防永久豁免）`)
        }
    }
    return errors
}

/** 受检面下界校验。 */
export function findScopeIssues(
    counts,
    bounds = {
        files: MIN_SCANNED_FILES,
        regions: MIN_STYLE_REGIONS,
        occurrences: MIN_PREFIXED_TOKEN_OCCURRENCES,
    },
) {
    if (bounds === null) {
        // 自定义受检根（受检面构造测试）：显式跳过下界与哨兵，调用方须自行承担范围责任
        return []
    }
    const errors = []
    if (counts.files < bounds.files) {
        errors.push(`受检文件数 ${counts.files} 低于下界 ${bounds.files}：怀疑受检面被静默收窄`)
    }
    if (counts.regions < bounds.regions) {
        errors.push(`受检样式区数 ${counts.regions} 低于下界 ${bounds.regions}：怀疑受检面被静默收窄`)
    }
    if (counts.occurrences < bounds.occurrences) {
        errors.push(
            `\`${TOKEN_PREFIX}\` 前缀令牌出现次数 ${counts.occurrences} 低于下界 ${bounds.occurrences}：怀疑受检面被静默收窄`,
        )
    }
    return errors
}

/** 哨兵文件存在性校验（身份断言，防受检根被收窄）。 */
export function findSentinelIssues(files, sentinels = SENTINEL_FILES) {
    const scanned = new Set(files.map((file) => toRel(file)))
    return sentinels
        .filter((file) => !scanned.has(file))
        .map((file) => `哨兵文件 ${file} 不在受检面内：受检根疑似被收窄（数量下界不足以拦截）`)
}

function walk(dir, acc = []) {
    for (const name of readdirSync(dir)) {
        const path = join(dir, name)
        if (statSync(path).isDirectory()) {
            walk(path, acc)
        } else if (STYLE_EXT_RE.test(name)) {
            acc.push(path)
        }
    }
    return acc
}

/**
 * 执行校验，返回 `{ ok, errors, details }`。
 *
 * @param {string} root 受检根目录
 * @param {{ bounds?: object, enforceSentinels?: boolean }} [options] 受检面下界与哨兵断言
 *   （合成受检面测试用；缺省取仓库下界，且仅当受检根为仓库 `src` 时启用哨兵断言）
 */
export function checkClassPrefix(root = SRC_DIR, { bounds, enforceSentinels = root === SRC_DIR } = {}) {
    const errors = []
    const files = walk(root)
    const seenTokens = new Set()
    const counts = { files: files.length, regions: 0, occurrences: 0 }

    for (const file of files) {
        const source = readFileSync(file, 'utf8')
        counts.regions += extractStyleRegions(file, source).length
        const { violations, occurrences, nonPrefixedTokens } = scanSource(source, { file })
        counts.occurrences += occurrences.total
        for (const token of nonPrefixedTokens) {
            seenTokens.add(token)
        }
        for (const violation of violations) {
            errors.push(
                `${violation.file}:${violation.line} 类名「.${violation.token}」前缀拼写可疑：`
                + `须为 \`${CLASS_PREFIX}\`（当前形如拼写错误，规则将永不命中）；`
                + `确为第三方 / 原生类名时登记进 ALLOWED_TOKENS 并写明理由`,
            )
        }
    }

    if (enforceSentinels) {
        errors.push(...findSentinelIssues(files))
    }
    errors.push(...findAllowlistRot(ALLOWED_TOKENS, seenTokens))
    errors.push(...findScopeIssues(counts, bounds))

    return { ok: errors.length === 0, errors, details: { ...counts, allowlisted: [...seenTokens] } }
}

if (isDirectExecution(import.meta.url)) {
    const args = process.argv.slice(2)
    const fixtureMode = args[0] === '--fixture'
    const unexpected = fixtureMode ? args.slice(2) : args.slice(1)
    if (!fixtureMode && args.length > 0) {
        process.stderr.write(
            `[check-class-prefix] 不支持的参数：${args.join(' ')}；用法：check-class-prefix [--fixture <受检根>]\n`,
        )
        process.exit(2)
    }
    if (fixtureMode && (unexpected.length > 0 || !args[1])) {
        process.stderr.write('[check-class-prefix] --fixture 须且仅须跟一个受检根目录\n')
        process.exit(2)
    }
    if (fixtureMode) {
        process.stderr.write(
            '[check-class-prefix] 注意：--fixture 模式已跳过受检面下界与哨兵断言（仅供受检面构造测试；gate 链不带参数调用）\n',
        )
    }
    const result = fixtureMode
        ? checkClassPrefix(resolve(args[1]), { bounds: null, enforceSentinels: false })
        : checkClassPrefix()
    if (result.ok) {
        console.info(
            `[check-class-prefix] 通过：${result.details.files} 文件 / ${result.details.regions} 样式区 / `
            + `${result.details.occurrences} 次 \`${TOKEN_PREFIX}\` 前缀令牌，无前缀拼写违规`,
        )
        process.exit(0)
    }
    for (const error of result.errors) {
        console.error(`[check-class-prefix][error] ${error}`)
    }
    process.exit(1)
}
