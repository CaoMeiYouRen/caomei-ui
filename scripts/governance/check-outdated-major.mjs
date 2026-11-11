#!/usr/bin/env node

/**
 * check-outdated-major：列出落后一个大版本的直接依赖。
 *
 * 数据源是 `pnpm outdated --format json`，因此受检面只有 `package.json` 里直接声明的依赖；
 * `pnpm-workspace.yaml` 的 overrides 与传递依赖不在其中，那部分归安全告警（`pnpm check:security-alerts`）
 * 与 `pnpm why` 覆盖。
 *
 * 判定：
 * - major 不同 → `major`；
 * - `0.x` 之间 minor 不同 → `breaking-zero`（0.x 无稳定 API，minor 等同破坏性变更）；
 * - 其余（patch / minor）不计入。
 *
 * 退出码：
 * - 默认 0：有落后项只打印表格，供人工日常核对；
 * - `--strict`：存在落后项时 exit 1，供发布前门禁使用；
 * - 取值失败（离线、超时、JSON 解析失败、pnpm 异常退出、「exit 1 但无可用落后项」）一律 exit 1，
 *   不把「查不到」当成「没有」。
 *
 * 不接入 `governance:check`：本脚本需要访问 registry，通常 1～2 分钟，不宜进入离线质量门。
 *
 * 用法：
 *   pnpm check:outdated-major
 *   pnpm check:outdated-major --strict
 */
import { spawnSync } from 'node:child_process'
import process from 'node:process'
import { isDirectExecution, parseCliOptions } from '../shared/cli.mjs'

/** dependencyType 的输出顺序：运行时依赖排在开发依赖之前。 */
export const TYPE_ORDER = ['dependencies', 'optionalDependencies', 'peerDependencies', 'devDependencies']

/** `pnpm outdated` 的等待上限；实测常态 1～2 分钟，冷缓存或慢网更久，超时按失败处理。 */
export const OUTDATED_TIMEOUT_MS = 300_000

/**
 * 解析版本号，返回 major / minor / patch。
 *
 * @param {string} version 版本号（允许 `v` 前缀与预发布后缀）
 * @returns {{ major: number, minor: number, patch: number } | null} 解析结果；非法版本返回 null
 */
export function parseVersion(version) {
    if (typeof version !== 'string') {
        return null
    }
    const core = version.trim().replace(/^v/, '').split('-')[0]
    const parts = core.split('.')
    if (parts.length < 2) {
        return null
    }
    const [major, minor, patch = '0'] = parts
    const parsed = [major, minor, patch].map(Number)
    if (parsed.some((value) => !Number.isInteger(value) || value < 0)) {
        return null
    }
    return { major: parsed[0], minor: parsed[1], patch: parsed[2] }
}

/**
 * 判断一个落后项是否属于破坏性变更。
 *
 * @param {string} current 当前版本
 * @param {string} latest 最新版本
 * @returns {'major' | 'breaking-zero' | null} 分类；非破坏性变更返回 null
 */
export function classifyUpdate(current, latest) {
    const from = parseVersion(current)
    const to = parseVersion(latest)
    if (!from || !to) {
        return null
    }
    if (to.major > from.major) {
        return 'major'
    }
    if (to.major === from.major && to.major === 0 && to.minor > from.minor) {
        return 'breaking-zero'
    }
    return null
}

/**
 * 解析 `pnpm outdated --format json` 的 stdout。
 *
 * @param {string} stdout 命令输出
 * @returns {Record<string, { current?: string, latest?: string, dependencyType?: string }>} 依赖映射
 */
export function parseOutdatedJson(stdout) {
    const text = (stdout ?? '').trim()
    if (text === '') {
        return {}
    }
    // pnpm 可能在 JSON 前打印提示行，从第一个 `{` 起才是数据；找不到即视为异常输出
    const start = text.indexOf('{')
    if (start === -1) {
        throw new TypeError(`pnpm outdated 输出中没有 JSON：${text.slice(0, 120)}`)
    }
    const parsed = JSON.parse(text.slice(start))
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
        throw new TypeError('pnpm outdated 输出不是对象')
    }
    return parsed
}

/**
 * 汇总落后项并按类型分组排序。
 *
 * @param {Record<string, { current?: string, latest?: string, dependencyType?: string }>} outdated 依赖映射
 * @returns {Array<{ name: string, current: string, latest: string, dependencyType: string, kind: 'major' | 'breaking-zero' }>} 落后项
 */
export function collectMajorItems(outdated) {
    const items = []
    for (const [name, info] of Object.entries(outdated)) {
        if (!info?.current || !info.latest) {
            continue
        }
        const kind = classifyUpdate(info.current, info.latest)
        if (!kind) {
            continue
        }
        items.push({
            name,
            current: info.current,
            latest: info.latest,
            dependencyType: info.dependencyType ?? 'unknown',
            kind,
        })
    }
    const typeRank = (type) => {
        const index = TYPE_ORDER.indexOf(type)
        return index === -1 ? TYPE_ORDER.length : index
    }
    return items.sort((left, right) => {
        const byType = typeRank(left.dependencyType) - typeRank(right.dependencyType)
        return byType === 0 ? left.name.localeCompare(right.name) : byType
    })
}

/**
 * 计算终端显示宽度：CJK 与全角字符按两列计。
 *
 * @param {string} text 文本
 * @returns {number} 显示宽度
 */
export function displayWidth(text) {
    let width = 0
    for (const char of text) {
        width += /[\u1100-\u115F\u2E80-\uA4CF\uAC00-\uD7A3\uF900-\uFAFF\uFE30-\uFE4F\uFF00-\uFF60\uFFE0-\uFFE6]/.test(
            char,
        )
            ? 2
            : 1
    }
    return width
}

/**
 * 生成对齐的文本表格（按显示宽度对齐，中英文混排不错列）。
 *
 * @param {Array<{ name: string, current: string, latest: string, dependencyType: string, kind: string }>} items 落后项
 * @returns {string} 表格文本
 */
export function formatTable(items) {
    const headers = ['依赖', '当前', '最新', '类型', '范围']
    const rows = items.map((item) => [
        item.name,
        item.current,
        item.latest,
        item.kind === 'breaking-zero' ? '0.x（需人工确认）' : 'major',
        item.dependencyType,
    ])
    const widths = headers.map((header, column) =>
        Math.max(displayWidth(header), ...rows.map((row) => displayWidth(row[column]))),
    )
    const render = (row) =>
        row
            .map((cell, column) => cell + ' '.repeat(Math.max(0, widths[column] - displayWidth(cell))))
            .join('  ')
    return [render(headers), ...rows.map(render)].join('\n')
}

/**
 * 读取 `pnpm outdated --format json`。
 *
 * @param {typeof spawnSync} exec spawn 实现（便于测试注入）
 * @returns {Record<string, { current?: string, latest?: string, dependencyType?: string }>} 依赖映射
 */
export function readOutdated(exec = spawnSync) {
    const result = exec('pnpm', ['outdated', '--format', 'json'], {
        encoding: 'utf8',
        timeout: OUTDATED_TIMEOUT_MS,
        shell: process.platform === 'win32',
    })
    if (result.error) {
        const reason =
            result.error.code === 'ETIMEDOUT'
                ? `超时（${OUTDATED_TIMEOUT_MS / 1000}s），registry 无响应或网络过慢`
                : result.error.message
        throw new Error(`无法执行 pnpm outdated：${reason}`)
    }
    // pnpm 在有落后项时以 1 退出，属正常语义，只有其它退出码才是失败
    if (result.status !== 0 && result.status !== 1) {
        const detail = (result.stderr ?? '').trim().split(/\r?\n/).slice(-3).join(' ')
        throw new Error(`pnpm outdated 异常退出（${result.status}）：${detail}`)
    }
    const outdated = parseOutdatedJson(result.stdout)
    // exit 1 必然伴随可用的落后项；空结果或缺 current / latest 说明是参数 / 配置 / 命令问题
    if (result.status === 1) {
        const usable = Object.values(outdated).some((info) => info?.current && info.latest)
        if (!usable) {
            const detail = (result.stderr ?? '').trim().split(/\r?\n/).slice(-3).join(' ')
            throw new Error(`pnpm outdated 以 1 退出但未返回可用的落后项，疑似参数、配置错误或命令不可用：${detail}`)
        }
    }
    return outdated
}

/**
 * 计算退出码。
 *
 * @param {number} itemCount 落后项数量
 * @param {boolean} strict 是否启用严格模式
 * @returns {number} 退出码
 */
export function resolveExitCode(itemCount, strict) {
    return strict && itemCount > 0 ? 1 : 0
}

function main() {
    let options
    try {
        options = parseCliOptions(process.argv, {
            defaults: { strict: false },
            flags: { '--strict': { key: 'strict' } },
        })
    } catch (error) {
        console.error(`[check-outdated-major] ${error.message}`)
        return 1
    }
    const strict = options.strict === true
    let outdated
    try {
        outdated = readOutdated()
    } catch (error) {
        console.error(`[check-outdated-major] ${error.message}`)
        return 1
    }
    const items = collectMajorItems(outdated)
    if (items.length === 0) {
        console.info('[check-outdated-major] 无落后大版本的直接依赖')
        return 0
    }
    console.info(`[check-outdated-major] 直接依赖落后项 ${items.length} 项（major / 0.x minor）：`)
    console.info(formatTable(items))
    if (strict) {
        console.error('[check-outdated-major] --strict 模式：存在落后项，退出码 1')
    }
    return resolveExitCode(items.length, strict)
}

if (isDirectExecution(import.meta.url)) {
    process.exitCode = main()
}
