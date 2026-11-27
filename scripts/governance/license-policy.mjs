#!/usr/bin/env node

/**
 * license-policy：直接依赖 / peer 依赖的 SPDX 许可证策略判定（纯函数，无 IO）。
 *
 * 分档口径见 `docs/design/governance/2026-11-26-dependency-license-policy-evaluation.md` §4：
 * - 阻断：`GPL-*` / `AGPL-*` / `SSPL*` / `BUSL*` / `Elastic-*` / `CC-BY-NC-*`；`UNLICENSED` /
 *   `SEE LICENSE IN ...` / `LicenseRef-*` / 无 `license` 字段；以及**未识别标识**（fail-closed，
 *   防拼写变体绕过）；
 * - 告警：`MPL-*` / `LGPL-*` / `EPL-*` / `CC-BY-*` / `Artistic-*` / `Python-*`（弱 copyleft 与
 *   署名类义务，本库不内联依赖源码，取告警）；
 * - 通过：`MIT` / `ISC` / `Apache-2.0` / `BSD-*` / `BlueOak-1.0.0` / `Unlicense` 等宽松许可，
 *   完整清单见 `ALLOWED_LICENSES`（含 `MIT` 与 `BSD` 的零条款变体）。
 *
 * 判定顺序：`EXTRA_ALLOWED_LICENSES`（人工确认后的放行清单）→ 阻断档 → 告警档 → 通过档 →
 * 未识别（阻断）。放行清单先于档位匹配，使 `UNLICENSED` / `LicenseRef-*` 这类本会落在阻断档
 * 的标识存在经 Review Gate 确认后的放行路径。
 *
 * 表达式求值：`OR` 取**最宽松**分支（消费方可择其一，`MIT OR GPL-2.0` 应通过），`AND` 取**最
 * 严格**分支（`MIT AND GPL-2.0` 必须阻断）；括号与 `WITH` 子句参与解析，不当作未知标识硬失败。
 *
 * 用法：
 *   node -e "import('./scripts/governance/license-policy.mjs').then((m) => console.log(m.evaluateLicense('MIT OR GPL-2.0')))"
 */

/** 档位权重：越大越严格。 */
const LEVELS = { pass: 0, warn: 1, blocked: 2 }
const LEVEL_NAMES = ['pass', 'warn', 'blocked']

/**
 * 人工放行清单：先于档位匹配。
 *
 * 每条须带行内注释写明协议全称与放行理由；新增条目随改动走 Review Gate（不得自行放行）。
 */
export const EXTRA_ALLOWED_LICENSES = [
    // 示例（当前为空）：{ id: 'LicenseRef-Proprietary-Example', reason: '某某内部包，已获分发授权（YYYY-MM-DD 确认）' }
]

/** 阻断档。 */
export const BLOCKED_PATTERNS = [
    { pattern: /^A?GPL-/u, reason: '强 copyleft 会传染本库的分发形态' },
    { pattern: /^SSPL/u, reason: 'SSPL 对提供服务的使用方式附加 copyleft 义务' },
    { pattern: /^BUSL/u, reason: 'BUSL 为商业限制许可，非开源' },
    { pattern: /^Elastic-/u, reason: 'Elastic License 禁止以托管服务方式提供' },
    { pattern: /^CC-BY-NC/u, reason: 'NonCommercial 禁止商业使用' },
    { pattern: /^UNLICENSED$/u, reason: '未授权许可（UNLICENSED）' },
    { pattern: /^SEE LICENSE IN /u, reason: '许可证正文外置声明，须人工确认' },
    { pattern: /^LicenseRef-/u, reason: '自定义许可证引用，须人工确认' },
]

/** 告警档。 */
export const WARN_PATTERNS = [
    { pattern: /^MPL-/u, reason: 'MPL 为文件级 copyleft，修改过的文件须开源' },
    { pattern: /^LGPL-/u, reason: 'LGPL 为弱 copyleft，动态链接场景需保留替换能力' },
    { pattern: /^EPL-/u, reason: 'EPL 为弱 copyleft' },
    { pattern: /^CC-BY-/u, reason: 'CC-BY 要求署名' },
    { pattern: /^Artistic-/u, reason: 'Artistic 许可含回馈义务' },
    { pattern: /^Python-/u, reason: 'Python 许可含 PSF 条款' },
]

/** 通过档（精确标识）。 */
export const ALLOWED_LICENSES = [
    'MIT',
    'ISC',
    'Apache-2.0',
    '0BSD',
    'MIT-0',
    'CC0-1.0',
    'BlueOak-1.0.0',
    'Unlicense',
]

/** 通过档（前缀标识）。 */
const ALLOWED_PREFIXES = [/^BSD-\d/u]

const OPERATORS = new Set(['AND', 'OR', 'WITH'])

/**
 * 切分 SPDX 表达式。
 *
 * @param {string} expression SPDX 表达式
 * @returns {string[]} token 序列（括号、运算符、标识）
 */
export function tokenize(expression) {
    return expression
        .replace(/([()])/gu, ' $1 ')
        .split(/\s+/u)
        .filter((token) => token !== '')
}

/**
 * 把 SPDX 表达式解析为语法树。
 *
 * 文法：`expr := and (OR and)*`、`and := primary (AND primary)*`、
 * `primary := '(' expr ')' | IDENT (WITH IDENT)?`。
 *
 * @param {string} expression SPDX 表达式
 * @returns {{ type: string, id?: string, exception?: string, left?: object, right?: object }}
 */
export function parseExpression(expression) {
    const tokens = tokenize(expression)
    let index = 0

    const peek = () => tokens[index]
    const next = () => tokens[index++]

    function parseOr() {
        let node = parseAnd()
        while (peek() === 'OR') {
            next()
            node = { type: 'OR', left: node, right: parseAnd() }
        }
        return node
    }

    function parseAnd() {
        let node = parsePrimary()
        while (peek() === 'AND') {
            next()
            node = { type: 'AND', left: node, right: parsePrimary() }
        }
        return node
    }

    function parsePrimary() {
        const token = next()
        if (token === undefined) {
            throw new Error('表达式不完整')
        }
        if (token === '(') {
            const node = parseOr()
            if (next() !== ')') {
                throw new Error('括号未闭合')
            }
            return node
        }
        if (token === ')' || OPERATORS.has(token)) {
            throw new Error(`意外的 token：${token}`)
        }
        if (peek() === 'WITH') {
            next()
            const exception = next()
            if (exception === undefined) {
                throw new Error('WITH 子句缺少例外标识')
            }
            return { type: 'ID', id: token, exception }
        }
        return { type: 'ID', id: token }
    }

    const ast = parseOr()
    if (index !== tokens.length) {
        throw new Error(`无法解析的表达式片段：${tokens.slice(index).join(' ')}`)
    }
    return ast
}

/**
 * 判定单个许可证标识的档位。
 *
 * @param {string} identifier SPDX 标识
 * @returns {{ level: 'pass' | 'warn' | 'blocked', reason: string }}
 */
export function classifyIdentifier(identifier) {
    const extra = EXTRA_ALLOWED_LICENSES.find((entry) => entry.id === identifier)
    if (extra !== undefined) {
        return { level: 'pass', reason: `人工放行：${extra.reason}` }
    }
    for (const entry of BLOCKED_PATTERNS) {
        if (entry.pattern.test(identifier)) {
            return { level: 'blocked', reason: entry.reason }
        }
    }
    for (const entry of WARN_PATTERNS) {
        if (entry.pattern.test(identifier)) {
            return { level: 'warn', reason: entry.reason }
        }
    }
    if (ALLOWED_LICENSES.includes(identifier) || ALLOWED_PREFIXES.some((pattern) => pattern.test(identifier))) {
        return { level: 'pass', reason: '允许档' }
    }
    return { level: 'blocked', reason: '未识别的许可证标识（fail-closed，须人工确认后加入放行清单）' }
}

function evaluateNode(node) {
    if (node.type === 'ID') {
        const verdict = classifyIdentifier(node.id)
        return {
            level: verdict.level,
            reason: verdict.reason,
            identifier: node.id,
            exception: node.exception,
            identifiers: [node.id],
        }
    }

    const left = evaluateNode(node.left)
    const right = evaluateNode(node.right)
    const identifiers = [...left.identifiers, ...right.identifiers]
    // OR 取最宽松分支（消费方可择其一），AND 取最严格分支（全部义务同时适用）。
    const counterparts = node.type === 'OR'
        ? [left, right].reduce((a, b) => (LEVELS[a.level] <= LEVELS[b.level] ? a : b))
        : [left, right].reduce((a, b) => (LEVELS[a.level] >= LEVELS[b.level] ? a : b))

    return {
        level: counterparts.level,
        reason: `${node.type} 表达式按${node.type === 'OR' ? '最宽松' : '最严格'}分支判定：${counterparts.reason}`,
        identifier: counterparts.identifier,
        identifiers,
    }
}

/**
 * 判定一条 `license` 字段（可为 SPDX 表达式）。
 *
 * @param {string | undefined | null} license package.json 的 `license` 字段
 * @returns {{ level: 'pass' | 'warn' | 'blocked', reason: string, expression: string, identifiers: string[] }}
 */
export function evaluateLicense(license) {
    const expression = typeof license === 'string' ? license.trim() : ''
    if (expression === '') {
        return {
            level: 'blocked',
            reason: 'package.json 未声明 license 字段',
            expression: '',
            identifiers: [],
        }
    }

    let ast
    try {
        ast = parseExpression(expression)
    } catch (error) {
        return {
            level: 'blocked',
            reason: `无法解析的许可证表达式（${error.message}）`,
            expression,
            identifiers: [],
        }
    }

    const verdict = evaluateNode(ast)
    return {
        level: verdict.level,
        reason: verdict.reason,
        expression,
        identifiers: verdict.identifiers,
    }
}

/** 档位名（供调用方拼装文案）。 */
export function levelName(level) {
    return LEVEL_NAMES[LEVELS[level]]
}
