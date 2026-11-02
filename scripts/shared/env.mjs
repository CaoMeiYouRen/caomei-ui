/**
 * 本地环境变量文件加载（无第三方依赖）。
 *
 * 用途：本地手动发布 / 安全门禁需要 `SECURITY_ALERTS_TOKEN`；CI 由 secrets 注入，
 * 本地把该变量写进仓库根的 `.env.local`（已被 `.gitignore` 的 `*.local` 覆盖）即可，
 * 不必每次在 shell 里 export。
 *
 * 规则：
 * - 只读取 `<root>/.env.local`；文件不存在时静默跳过。
 * - **真实环境变量优先**：已存在的键不覆盖（CI 与一次性 `KEY=... pnpm ...` 仍然生效）。
 * - 支持 `KEY=VALUE`、`export KEY=VALUE`、`#` 注释、空行与成对引号。
 * - 不支持行内注释与变量展开：`KEY=a # b` 会把 ` # b` 当作值的一部分，需要注释就另起一行。
 * - 缺 `=` 或键名非法时抛错（fail-closed）：拼错键名不得被静默忽略。
 */
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

/** 本地环境变量文件（相对仓库根）。 */
export const LOCAL_ENV_FILE = '.env.local'

const KEY_PATTERN = /^[A-Za-z_][A-Za-z0-9_]*$/u

/**
 * 解析 `.env` 文本。
 *
 * 错误消息只带行号与键名，**不回显行内容或值**：本文件最常见的失败形态就是
 * 手写 token 时少写 `=` 或引号不配对，回显会把凭据写进 stderr / CI 日志。
 *
 * @param {string} content 文件内容
 * @returns {Record<string, string>} 键值对
 */
export function parseEnv(content) {
    const values = {}
    content.split(/\r?\n/u).forEach((raw, index) => {
        const line = raw.trim()
        if (line === '' || line.startsWith('#')) {
            return
        }
        const normalized = line.startsWith('export ') ? line.slice('export '.length).trim() : line
        const separator = normalized.indexOf('=')
        if (separator <= 0) {
            throw new Error(`${LOCAL_ENV_FILE}:${index + 1} 缺少 KEY=VALUE 形式（该行内容已隐去）`)
        }
        const key = normalized.slice(0, separator).trim()
        if (!KEY_PATTERN.test(key)) {
            throw new Error(`${LOCAL_ENV_FILE}:${index + 1} 键名非法（应为字母 / 下划线开头的标识符）`)
        }
        if (Object.hasOwn(values, key)) {
            throw new Error(`${LOCAL_ENV_FILE}:${index + 1} 键 ${key} 重复出现（不静默覆盖）`)
        }
        values[key] = unwrapQuotes(normalized.slice(separator + 1).trim(), key, index)
    })
    return values
}

/**
 * 去掉成对引号；引号不配对时报错（不回显值）。
 *
 * @param {string} value 原始值
 * @param {string} key 键名（错误消息用）
 * @param {number} index 行下标
 * @returns {string} 去引号后的值
 */
function unwrapQuotes(value, key, index) {
    for (const quote of ['"', '\'']) {
        if (!value.startsWith(quote)) {
            continue
        }
        if (!value.endsWith(quote) || value.length < 2) {
            throw new Error(`${LOCAL_ENV_FILE}:${index + 1} 键 ${key} 的引号不配对（该值已隐去）`)
        }
        return value.slice(1, -1)
    }
    return value
}

/**
 * 读取环境变量文件并写入目标环境（不覆盖已有键）。
 *
 * @param {string} filePath 文件绝对路径
 * @param {{ env?: NodeJS.ProcessEnv }} [options] 目标环境，默认 `process.env`
 * @returns {string[]} 实际写入的键名（不含值，便于日志脱敏）
 */
export function loadEnvFile(filePath, { env = process.env } = {}) {
    if (!existsSync(filePath)) {
        return []
    }
    const applied = []
    for (const [key, value] of Object.entries(parseEnv(readFileSync(filePath, 'utf8')))) {
        if (env[key] !== undefined) {
            continue
        }
        env[key] = value
        applied.push(key)
    }
    return applied
}

/**
 * 读取仓库根的 `.env.local`。
 *
 * @param {string} root 仓库根
 * @param {{ env?: NodeJS.ProcessEnv }} [options] 目标环境，默认 `process.env`
 * @returns {string[]} 实际写入的键名
 */
export function loadLocalEnv(root, options = {}) {
    return loadEnvFile(join(root, LOCAL_ENV_FILE), options)
}
