#!/usr/bin/env node

/**
 * check-outdated-major：列出落后一个大版本的直接依赖。
 *
 * 数据源两选一：
 * - `registry`（默认）：遍历 `package.json` 的直接依赖，逐个直连 registry 取 `dist-tags.latest`。
 *   当前版本优先读 `node_modules/<pkg>/package.json`（与 `pnpm outdated` 的 `current` 对齐），
 *   未安装时退回首段版本范围的下界。受检面为数十项时通常在数秒内，供日常巡检与本地核对。
 *   registry 端点跟随 `npm_config_registry` / `pnpm config get registry`，与安装来源保持一致。
 * - `pnpm`（`--source=pnpm`）：沿用 `pnpm outdated --format json`，解析整棵依赖图，耗时随依赖图规模增长；
 *   需要与 pnpm 的 `minimumReleaseAge` 等安装策略完全一致时使用。
 *
 * 两种数据源都只覆盖 `package.json` 里直接声明的依赖；`pnpm-workspace.yaml` 的 overrides
 * 与传递依赖不在其中，那部分归安全告警（`pnpm check:security-alerts`）与 `pnpm why` 覆盖。
 *
 * 判定：
 * - major 不同 → `major`；
 * - `0.x` 之间 minor 不同 → `breaking-zero`（0.x 无稳定 API，minor 等同破坏性变更）；
 * - 其余（patch / minor）不计入。
 *
 * 退出码：
 * - 默认 0：有落后项只打印表格，供人工日常核对；
 * - `--strict`：存在落后项时 exit 1，供发布前门禁使用；
 * - 取值失败（离线、超时、HTTP 异常、缺 `dist-tags.latest`、JSON 解析失败、pnpm 异常退出、
 *   「exit 1 但无可用落后项」）一律 exit 1，不把「查不到」当成「没有」；
 * - registry 源允许部分成功：已取到的落后项照常打印，失败项逐条列出后仍 exit 1；
 * - exit 1 同时表示「`--strict` 命中落后项」与「取值失败」（两者都只用于人工巡检，未接入 CI 门禁），
 *   按日志区分：取值失败会额外输出「N 个依赖取值失败」段。
 *
 * 不接入 `governance:check`：本脚本需要访问 registry，不宜进入离线质量门。
 *
 * 用法：
 *   pnpm check:outdated-major
 *   pnpm check:outdated-major --strict
 *   pnpm check:outdated-major --source=pnpm
 */
import { spawnSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { isDirectExecution, parseCliOptions } from '../shared/cli.mjs'

/** dependencyType 的输出顺序：运行时依赖排在开发依赖之前。 */
export const TYPE_ORDER = ['dependencies', 'optionalDependencies', 'peerDependencies', 'devDependencies']

/** 同名依赖去重时的取值顺序：先取实际安装来源（运行时 / 开发），再看可选与 peer 声明。 */
export const DEDUPE_ORDER = ['dependencies', 'devDependencies', 'optionalDependencies', 'peerDependencies']

/** `pnpm outdated` 的等待上限；冷缓存或慢网下耗时会显著增长，超时按失败处理。 */
export const OUTDATED_TIMEOUT_MS = 300_000

/** registry 源的来源标识与默认端点。 */
export const DEFAULT_REGISTRY = 'https://registry.npmjs.org'

/** registry 源单个 packument 请求的等待上限；单包响应通常在数百毫秒内。 */
export const REGISTRY_TIMEOUT_MS = 15_000

/** registry 源的并发上限，避免一次性打开过多连接。 */
export const REGISTRY_CONCURRENCY = 8

/** 取 abbreviated packument（含 `dist-tags` 与 `versions`），响应体积远小于完整元数据。 */
export const PACKUMENT_ACCEPT = 'application/vnd.npm.install-v1+json'

/** 支持的取值来源。 */
export const OUTDATED_SOURCES = ['registry', 'pnpm']

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
 * 从版本范围的首段取下界版本号。
 *
 * 只用于「未安装依赖」时的兜底：`^1.2.3` / `~1.2` / `>=1.2.3 <2` / `1.2.3 || 2.0.0` 取首段，
 * `workspace:` / `catalog:` / `npm:` 别名 / git / 文件路径无法推出语义版本，返回 null。
 *
 * @param {string} spec 版本范围
 * @returns {string | null} 版本号；无法解析时返回 null
 */
export function stripRange(spec) {
    if (typeof spec !== 'string') {
        return null
    }
    const trimmed = spec.trim()
    if (trimmed === '' || /^(workspace|catalog|file|link|git|github|https?|npm):/.test(trimmed)) {
        return null
    }
    // 取首段中第一个含数字的 token：`>= 1.2.3`（运算符与版本间有空格）与 `1.2.3 - 2.0.0` 都能取到下界
    const first = trimmed
        .split('||')[0]
        .trim()
        .split(/\s+/)
        .find((token) => /\d/.test(token))
    const core = (first ?? '').replace(/^[\^~>=<]+/, '')
    // 单段与 x 通配（`1` / `1.2` / `1.x` / `1.2.x`）在 npm 里是合法范围，补成下界再判定
    const normalized = core
        .replace(/^(\d+)\.x$/i, '$1.0.0')
        .replace(/^(\d+)\.(\d+)\.x$/i, '$1.$2.0')
        .replace(/^(\d+)$/, '$1.0.0')
        .replace(/^(\d+)\.(\d+)$/, '$1.$2.0')
    return parseVersion(normalized) ? normalized : null
}

/**
 * 展开 `package.json` 的直接依赖声明。
 *
 * 同名包同时出现在多处时按 `DEDUPE_ORDER` 取一处：优先运行时 / 开发依赖的声明（与安装来源一致），
 * 避免未安装时把 `peerDependencies` 的宽松下界当作当前版本。
 *
 * @param {Record<string, unknown>} manifest package.json 内容
 * @returns {Array<{ name: string, spec: string, dependencyType: string }>} 直接依赖
 */
export function resolveDirectDependencies(manifest) {
    const seen = new Set()
    const dependencies = []
    for (const dependencyType of DEDUPE_ORDER) {
        const section = manifest?.[dependencyType]
        if (!section || typeof section !== 'object' || Array.isArray(section)) {
            continue
        }
        for (const [name, spec] of Object.entries(section)) {
            if (seen.has(name)) {
                continue
            }
            seen.add(name)
            dependencies.push({ name, spec: typeof spec === 'string' ? spec : '', dependencyType })
        }
    }
    return dependencies
}

/**
 * 解析实际生效的 registry：优先 `npm_config_registry`，其次 `pnpm config get registry`，
 * 都取不到时退回官方端点。
 *
 * `.npmrc` 指向镜像（如 `registry.npmmirror.com`）时，直连官方端点往往超时；这里跟随
 * 包管理器的配置，避免脚本与安装来源不一致。
 *
 * @param {{ env?: Record<string, string | undefined>, exec?: typeof spawnSync }} options 解析参数
 * @returns {string} registry 端点（无尾斜杠）
 */
export function resolveRegistry({ env = process.env, exec = spawnSync } = {}) {
    // 只接受可解析的 http(s) 端点：`https://` 这类半截地址过前缀正则但会让后续解析抛错
    const isHttpUrl = (value) => {
        if (typeof value !== 'string') {
            return false
        }
        const trimmed = value.trim()
        if (!/^https?:\/\//.test(trimmed)) {
            return false
        }
        try {
            new URL(trimmed)
            return true
        } catch {
            return false
        }
    }
    const fromEnv = env.npm_config_registry
    if (isHttpUrl(fromEnv)) {
        return fromEnv.trim().replace(/\/+$/, '')
    }
    const result = exec('pnpm', ['config', 'get', 'registry'], {
        encoding: 'utf8',
        timeout: 15_000,
        shell: process.platform === 'win32',
    })
    const fromConfig = (result?.stdout ?? '').trim()
    if (result?.status === 0 && isHttpUrl(fromConfig)) {
        return fromConfig.replace(/\/+$/, '')
    }
    return DEFAULT_REGISTRY
}

/**
 * 拼接 packument 地址；scoped 包按 npm registry 约定把 `/` 编码为 `%2f`。
 *
 * @param {string} name 包名
 * @param {string} registry registry 端点
 * @returns {string} packument 地址
 */
export function buildPackumentUrl(name, registry = DEFAULT_REGISTRY) {
    const encoded = name.startsWith('@') ? name.replace('/', '%2f') : name
    return `${registry.replace(/\/+$/, '')}/${encoded}`
}

/**
 * 读取 packument 的 `dist-tags.latest`。
 *
 * @param {Record<string, unknown>} packument registry 响应
 * @returns {string} 最新版本
 */
export function parsePackumentLatest(packument) {
    const latest = packument?.['dist-tags']?.latest
    if (typeof latest !== 'string' || parseVersion(latest) === null) {
        throw new TypeError('registry 返回中没有可用的 dist-tags.latest')
    }
    return latest
}

/**
 * 读取已安装版本（`node_modules/<pkg>/package.json`）。
 *
 * 干净克隆或精简安装时读不到，交由首段版本范围兜底；读取失败按「未安装」处理，不抛错。
 *
 * @param {string[]} names 包名
 * @param {string} rootDir 仓库根目录
 * @param {typeof readFileSync} read 读取实现（便于测试注入）
 * @returns {Record<string, string>} 包名到已安装版本的映射
 */
export function readInstalledVersions(names, rootDir = process.cwd(), read = readFileSync) {
    const versions = {}
    for (const name of names) {
        try {
            const manifestPath = path.join(rootDir, 'node_modules', ...name.split('/'), 'package.json')
            const parsed = JSON.parse(read(manifestPath, 'utf8'))
            if (typeof parsed?.version === 'string' && parseVersion(parsed.version)) {
                versions[name] = parsed.version
            }
        } catch {
            // 未安装（干净克隆 / 精简安装）时退回首段范围下界
        }
    }
    return versions
}

/**
 * 解析某个依赖的当前版本：已安装版本优先，缺失时退回首段范围下界。
 *
 * @param {string} name 包名
 * @param {{ spec: string }} dependency 依赖声明
 * @param {Record<string, string>} installed 已安装版本映射
 * @returns {string | null} 当前版本；无法确定时返回 null
 */
export function resolveCurrentVersion(name, dependency, installed) {
    const fromInstalled = installed?.[name]
    if (typeof fromInstalled === 'string' && parseVersion(fromInstalled)) {
        return fromInstalled
    }
    return stripRange(dependency?.spec)
}

/**
 * 直连 registry 收集直接依赖的当前 / 最新版本。
 *
 * 部分失败不清空结果：已取到的项照常返回，失败项进 `failures` 由调用方按失败处理（fail-closed）。
 *
 * @param {{
 *   dependencies: Array<{ name: string, spec: string, dependencyType: string }>,
 *   installed?: Record<string, string>,
 *   fetchImpl?: typeof fetch,
 *   registry?: string,
 *   timeoutMs?: number,
 *   concurrency?: number
 * }} options 取数参数
 * @returns {Promise<{ outdated: Record<string, { current: string, latest: string, dependencyType: string }>, failures: Array<{ name: string, reason: string }> }>} 取数结果
 */
export async function readRegistryOutdated({
    dependencies,
    installed = {},
    fetchImpl = fetch,
    registry = DEFAULT_REGISTRY,
    timeoutMs = REGISTRY_TIMEOUT_MS,
    concurrency = REGISTRY_CONCURRENCY,
} = {}) {
    const outdated = {}
    const failures = []
    // 非法并发值退回默认上限，避免 `Array.from({ length: NaN })` 得到零 worker 的静默空结果
    const safeConcurrency = Number.isInteger(concurrency) && concurrency > 0 ? concurrency : REGISTRY_CONCURRENCY
    const limit = Math.max(1, Math.min(safeConcurrency, dependencies.length || 1))
    let cursor = 0
    let completed = 0
    const inspect = async (dependency) => {
        const current = resolveCurrentVersion(dependency.name, dependency, installed)
        if (!current) {
            failures.push({ name: dependency.name, reason: '无法确定当前版本（未安装且版本范围无下界）' })
            return
        }
        try {
            const response = await fetchImpl(buildPackumentUrl(dependency.name, registry), {
                headers: { accept: PACKUMENT_ACCEPT },
                signal: AbortSignal.timeout(timeoutMs),
            })
            if (!response?.ok) {
                failures.push({ name: dependency.name, reason: `HTTP ${response?.status ?? 'unknown'}` })
                return
            }
            const latest = parsePackumentLatest(await response.json())
            if (latest !== current) {
                outdated[dependency.name] = { current, latest, dependencyType: dependency.dependencyType }
            }
        } catch (error) {
            const reason =
                error?.name === 'TimeoutError' || error?.name === 'AbortError'
                    ? `超时（${timeoutMs / 1000}s）`
                    : (error?.message ?? String(error))
            failures.push({ name: dependency.name, reason })
        }
    }
    const worker = async () => {
        while (cursor < dependencies.length) {
            const dependency = dependencies[cursor]
            cursor += 1
            await inspect(dependency)
            completed += 1
        }
    }
    await Promise.all(Array.from({ length: limit }, () => worker()))
    // 不变量：受检项计数一致，避免 worker 漏访导致「少查几个」被当成通过
    if (completed !== dependencies.length) {
        throw new Error(`受检项未全部处理（${completed}/${dependencies.length}），拒绝给出不完整结论`)
    }
    return { outdated, failures }
}

/**
 * 渲染取数失败清单。
 *
 * @param {Array<{ name: string, reason: string }>} failures 失败项
 * @returns {string} 文本
 */
export function formatFailures(failures) {
    return failures.map((failure) => `  - ${failure.name}：${failure.reason}`).join('\n')
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

/**
 * 执行 registry 源，产出退出码与待打印的行。
 *
 * 把「失败清单必须影响退出码」的判定收在一处，避免调用方漏消费 `failures` 而静默放行。
 *
 * @param {{
 *   dependencies: Array<{ name: string, spec: string, dependencyType: string }>,
 *   installed?: Record<string, string>,
 *   registry?: string,
 *   strict?: boolean,
 *   readRegistry?: typeof readRegistryOutdated,
 *   fetchImpl?: typeof fetch,
 *   concurrency?: number
 * }} options 执行参数
 * @returns {Promise<{ exitCode: number, infoLines: string[], errorLines: string[] }>} 结果
 */
export async function runRegistrySource({
    dependencies,
    installed = {},
    registry = DEFAULT_REGISTRY,
    strict = false,
    readRegistry = readRegistryOutdated,
    fetchImpl,
    concurrency,
} = {}) {
    if (!Array.isArray(dependencies) || dependencies.length === 0) {
        return {
            exitCode: 1,
            infoLines: [],
            errorLines: ['[check-outdated-major] package.json 没有可检查的直接依赖声明'],
        }
    }
    let result
    try {
        result = await readRegistry({ dependencies, installed, registry, fetchImpl, concurrency })
    } catch (error) {
        return { exitCode: 1, infoLines: [], errorLines: [`[check-outdated-major] ${error.message}`] }
    }
    const items = collectMajorItems(result.outdated)
    const infoLines = []
    if (items.length === 0) {
        infoLines.push(
            result.failures.length > 0
                ? '[check-outdated-major] 已知项中无落后大版本'
                : '[check-outdated-major] 无落后大版本的直接依赖',
        )
    } else {
        infoLines.push(
            `[check-outdated-major] 直接依赖落后项 ${items.length} 项（major / 0.x minor）：`,
            formatTable(items),
        )
    }
    const errorLines = []
    if (strict && items.length > 0) {
        errorLines.push('[check-outdated-major] --strict 模式：存在落后项，退出码 1')
    }
    if (result.failures.length > 0) {
        errorLines.push(
            `[check-outdated-major] ${result.failures.length} 个依赖取值失败（按失败处理，退出码 1）：`,
            formatFailures(result.failures),
        )
    }
    const exitCode = result.failures.length > 0 ? 1 : resolveExitCode(items.length, strict)
    return { exitCode, infoLines, errorLines }
}

/**
 * 打印落后项并给出默认 / 严格模式的退出码。
 *
 * @param {Array<{ name: string, current: string, latest: string, dependencyType: string, kind: string }>} items 落后项
 * @param {boolean} strict 是否启用严格模式
 * @returns {number} 退出码
 */
function reportItems(items, strict) {
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

async function main() {
    let options
    try {
        options = parseCliOptions(process.argv, {
            defaults: { strict: false, source: 'registry' },
            flags: { '--strict': { key: 'strict' } },
            values: {
                '--source': {
                    key: 'source',
                    allowedValues: OUTDATED_SOURCES,
                    invalidMessage: (value) => `不支持的来源：${value}（可选 ${OUTDATED_SOURCES.join(' / ')}）`,
                },
            },
        })
    } catch (error) {
        console.error(`[check-outdated-major] ${error.message}`)
        return 1
    }
    const strict = options.strict === true

    if (options.source === 'pnpm') {
        let outdated
        try {
            outdated = readOutdated()
        } catch (error) {
            console.error(`[check-outdated-major] ${error.message}`)
            return 1
        }
        return reportItems(collectMajorItems(outdated), strict)
    }

    let manifest
    try {
        manifest = JSON.parse(readFileSync(path.join(process.cwd(), 'package.json'), 'utf8'))
    } catch (error) {
        console.error(`[check-outdated-major] 无法读取 package.json：${error.message}`)
        return 1
    }
    const dependencies = resolveDirectDependencies(manifest)
    const installed = readInstalledVersions(
        dependencies.map((dependency) => dependency.name),
    )
    const registry = resolveRegistry()
    // 只打印主机名：registry 配置可能带凭据，不把完整 URL 写进日志
    console.info(
        `[check-outdated-major] 来源 registry（${new URL(registry).host}）：检查 ${dependencies.length} 个直接依赖`,
    )
    let result
    try {
        result = await runRegistrySource({ dependencies, installed, registry, strict })
    } catch (error) {
        console.error(`[check-outdated-major] ${error.message}`)
        return 1
    }
    for (const line of result.infoLines) {
        console.info(line)
    }
    for (const line of result.errorLines) {
        console.error(line)
    }
    return result.exitCode
}

if (isDirectExecution(import.meta.url)) {
    process.exitCode = await main()
}
