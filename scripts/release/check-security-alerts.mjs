#!/usr/bin/env node

/**
 * check-security-alerts：发布前安全告警门禁。
 *
 * 依据：[安全规范 §2.1](../../docs/standards/security.md) —— critical 必须修复且不得豁免（被 dismiss 也算存在）；
 * high 仅「无可用修复版本 / 修复成本过高 / 误报」可留痕豁免；medium / low 可暂缓。
 *
 * 数据源（每类来源取 `state=open` 与 `state=dismissed`，分页拉全量；`auto_dismissed` 不取）：
 * 1. Dependabot alerts：严重级取 `security_advisory.severity`；
 * 2. Code Scanning alerts：严重级取 `rule.security_severity_level`，为空时含 `security` 标签按 high 处置。
 *
 * 认证：必须提供 `SECURITY_ALERTS_TOKEN`（用户 PAT，需 Dependabot alerts / Code Scanning alerts 读权限）；
 * 仓库默认 `GITHUB_TOKEN` 无法读取 Dependabot 告警，故不提供回退（缺 token 直接失败）。
 * 本地把该变量写入仓库根的 `.env.local`（已 gitignore）即可，真实环境变量优先。
 *
 * 仓库标识：`--repo=owner/repo` → `GITHUB_REPOSITORY` → `git remote get-url origin`（本地回退）。
 *
 * 豁免：`.github/security-alerts-exemptions.json`（仅 high；`category` 为 `no-fix` / `hard-fix` /
 * `false-positive`，open 仅前两类、dismissed 仅 `false-positive` 且 reason 须含原 dismiss 原因）。
 *
 * 判定：critical（含 dismissed）恒阻塞且不得豁免；high 无有效豁免即阻塞；medium / low 暂缓。
 *
 * 用法：
 *   pnpm check:security-alerts
 *   pnpm check:security-alerts --repo=owner/repo --json
 *
 * 退出码：0 通过；1 存在阻塞项；2 配置 / API 错误。
 */
import { spawnSync } from 'node:child_process'
import { existsSync, readFileSync, appendFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { isDirectExecution, parseCliOptions } from '../shared/cli.mjs'
import { LOCAL_ENV_FILE, loadLocalEnv } from '../shared/env.mjs'

export const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..')
export const DEFAULT_API_URL = 'https://api.github.com'
export const DEFAULT_EXEMPTIONS_PATH = '.github/security-alerts-exemptions.json'
export const API_VERSION = '2022-11-28'
export const PAGE_SIZE = 100
export const MAX_PAGES = 20
export const SEVERITIES = ['critical', 'high', 'medium', 'low', 'note']

/** 参与判定的告警状态：`auto_dismissed` 不查询，故不参与。 */
export const ALERT_STATES = ['open', 'dismissed']

/** 豁免分类：open 仅前两类，dismissed 仅 `false-positive`。 */
export const EXEMPTION_CATEGORIES = ['no-fix', 'hard-fix', 'false-positive']

const EXEMPTION_FIELDS = ['source', 'id', 'category', 'reason', 'plannedVersion', 'tracking', 'approvedBy', 'recordedAt']

export class GitHubApiError extends Error {
    constructor(message, status) {
        super(message)
        this.name = 'GitHubApiError'
        this.status = status
    }
}

/**
 * 归一化严重级：`moderate` 归入 `medium`；未知值按 high 兜底（fail-closed）。
 *
 * @param {unknown} raw 原始严重级
 * @returns {'critical'|'high'|'medium'|'low'|'note'}
 */
export function normalizeSeverity(raw) {
    const value = String(raw ?? '').toLowerCase()
    if (value === 'moderate') {
        return 'medium'
    }
    if (SEVERITIES.includes(value)) {
        return value
    }
    return 'high'
}

/**
 * 归一化告警状态：只区分 `open` 与 `dismissed`（`auto_dismissed` 不查询）。
 *
 * @param {unknown} raw 原始状态
 * @returns {'open'|'dismissed'} 归一化状态
 */
export function normalizeState(raw) {
    return String(raw ?? '').toLowerCase() === 'dismissed' ? 'dismissed' : 'open'
}

/**
 * 归一化 Dependabot 告警。
 *
 * @param {Record<string, any>} alert 原始告警
 * @returns {Record<string, any>} 统一形态
 */
export function normalizeDependabotAlert(alert) {
    return {
        source: 'dependabot',
        id: alert.number,
        severity: normalizeSeverity(alert.security_advisory?.severity),
        state: normalizeState(alert.state),
        dismissedReason: alert.dismissed_reason ?? '',
        package: alert.dependency?.package?.name ?? '(unknown)',
        vulnerableRange: alert.security_vulnerability?.vulnerable_version_range ?? '',
        advisory: alert.security_advisory?.ghsa_id ?? alert.security_advisory?.cve_id ?? '',
        summary: alert.security_advisory?.summary ?? '',
        url: alert.html_url ?? '',
    }
}

/**
 * 归一化 Code Scanning 告警。
 *
 * `security_severity_level` 为空时：`rule.tags` 含 `security` 按 high；否则视为 note（不阻塞）。
 *
 * @param {Record<string, any>} alert 原始告警
 * @returns {Record<string, any>} 统一形态
 */
export function normalizeCodeScanningAlert(alert) {
    const raw = alert.rule?.security_severity_level
    const tags = alert.rule?.tags ?? []
    let severity = 'note'
    if (raw) {
        severity = normalizeSeverity(raw)
    } else if (tags.includes('security')) {
        severity = 'high'
    }
    const location = alert.most_recent_instance?.location ?? {}
    return {
        source: 'code-scanning',
        id: alert.number,
        severity,
        state: normalizeState(alert.state),
        dismissedReason: alert.dismissed_reason ?? '',
        rule: alert.rule?.id ?? '(unknown)',
        path: location.path ?? '',
        line: location.start_line ?? null,
        message: alert.most_recent_instance?.message?.text ?? alert.rule?.description ?? '',
        url: alert.html_url ?? '',
    }
}

/**
 * 校验豁免清单并按键索引。
 *
 * @param {{ exemptions?: unknown }} payload 豁免文件内容
 * @returns {Map<string, Record<string, any>>} 键为 `<source>:<id>`
 */
export function validateExemptions(payload) {
    const list = payload?.exemptions
    if (!Array.isArray(list)) {
        throw new Error('豁免文件格式错误：顶层必须是 { "exemptions": [] }')
    }
    const indexed = new Map()
    list.forEach((entry, index) => {
        for (const field of EXEMPTION_FIELDS) {
            if (entry?.[field] === undefined || entry?.[field] === null || String(entry[field]).trim() === '') {
                throw new Error(`exemptions[${index}] 缺少字段 ${field}`)
            }
        }
        if (!['dependabot', 'code-scanning'].includes(entry.source)) {
            throw new Error(`exemptions[${index}].source 必须是 dependabot 或 code-scanning`)
        }
        if (!EXEMPTION_CATEGORIES.includes(entry.category)) {
            throw new Error(`exemptions[${index}].category 必须是 ${EXEMPTION_CATEGORIES.join(' / ')}`)
        }
        if (!Number.isInteger(entry.id) || entry.id <= 0) {
            throw new Error(`exemptions[${index}].id 必须是正整数`)
        }
        if (!/^\d{4}-\d{2}-\d{2}$/u.test(entry.recordedAt)) {
            throw new Error(`exemptions[${index}].recordedAt 必须是 YYYY-MM-DD`)
        }
        const key = `${entry.source}:${entry.id}`
        if (indexed.has(key)) {
            throw new Error(`豁免清单存在重复条目：${key}`)
        }
        indexed.set(key, entry)
    })
    return indexed
}

/**
 * 校验豁免条目与告警状态是否匹配（fail-closed）。
 *
 * - 仅 high 可豁免；
 * - open 仅 `no-fix` / `hard-fix`；
 * - dismissed 仅 `false-positive`，且 reason 必须包含原 dismiss 原因。
 *
 * @param {Record<string, any>} alert 归一化告警
 * @param {Record<string, any>} exemption 豁免条目
 * @param {string} key `<source>:<id>`
 * @returns {void}
 */
function validateExemptionAgainstAlert(alert, exemption, key) {
    if (alert.severity !== 'high') {
        throw new Error(`仅 high 级别可豁免：${key} 当前严重级为 ${alert.severity}`)
    }
    if (exemption.category === 'false-positive') {
        if (alert.state !== 'dismissed') {
            throw new Error(`false-positive 豁免仅适用于 dismissed 告警：${key}`)
        }
        if (!alert.dismissedReason) {
            throw new Error(`dismissed 告警缺少 dismissed_reason，无法核对 false-positive 原因（请在台账手写并复核）：${key}`)
        }
        if (!String(exemption.reason).includes(alert.dismissedReason)) {
            throw new Error(`false-positive 豁免的 reason 必须包含原 dismiss 原因（${alert.dismissedReason}）：${key}`)
        }
        return
    }
    if (alert.state === 'dismissed') {
        throw new Error(`dismissed 告警仅可按 false-positive 豁免：${key}`)
    }
}

/**
 * 评估告警：critical 恒阻塞（open / dismissed 均算，且不得豁免）；
 * high 无有效豁免即阻塞；其余暂缓。
 *
 * @param {{ dependabot?: Record<string, any>[], codeScanning?: Record<string, any>[], exemptions?: Map<string, Record<string, any>> }} input 输入
 * @returns {{ alerts: Record<string, any>[], counts: Record<string, number>, stateCounts: { open: number, dismissed: number }, blocking: Record<string, any>[], exempted: Record<string, any>[], deferred: Record<string, any>[], staleExemptions: string[] }} 评估结果
 */
export function evaluateAlerts({ dependabot = [], codeScanning = [], exemptions = new Map() }) {
    const alerts = [
        ...dependabot.map(normalizeDependabotAlert),
        ...codeScanning.map(normalizeCodeScanningAlert),
    ]
    const counts = Object.fromEntries(SEVERITIES.map((severity) => [severity, 0]))
    const stateCounts = { open: 0, dismissed: 0 }
    const blocking = []
    const exempted = []
    const deferred = []
    const used = new Set()
    const seen = new Map()

    for (const alert of alerts) {
        counts[alert.severity] += 1
        stateCounts[alert.state] += 1
        const key = `${alert.source}:${alert.id}`
        const previous = seen.get(key)
        if (previous) {
            const detail = previous.state === alert.state
                ? `同一状态重复返回（${alert.state}，疑似分页重叠）`
                : `同时出现在 ${previous.state} 与 ${alert.state}（状态在查询期间变化？请重跑门禁）`
            throw new Error(`告警 ${key} ${detail}`)
        }
        seen.set(key, alert)
        const exemption = exemptions.get(key)
        if (exemption) {
            validateExemptionAgainstAlert(alert, exemption, key)
            used.add(key)
            exempted.push({ ...alert, exemption })
            continue
        }
        if (alert.severity === 'critical' || alert.severity === 'high') {
            blocking.push(alert)
        } else {
            deferred.push(alert)
        }
    }

    const staleExemptions = [...exemptions.keys()].filter((key) => !used.has(key))
    return { alerts, counts, stateCounts, blocking, exempted, deferred, staleExemptions }
}

/**
 * 解析 `Link` 头里的 `rel="next"` 地址。
 *
 * Dependabot alerts 不支持 `page` 参数（会 400），必须按 `Link` 头游标翻页；
 * Code Scanning 同样适用，故统一以 `Link` 为准。
 *
 * @param {string | null | undefined} linkHeader Link 头
 * @returns {string | null} 下一页绝对地址
 */
export function parseNextLink(linkHeader) {
    if (!linkHeader) {
        return null
    }
    for (const part of linkHeader.split(',')) {
        const match = part.match(/<([^>]+)>\s*;\s*rel="next"/u)
        if (match) {
            return match[1]
        }
    }
    return null
}

/**
 * 按 `Link` 头分页拉取 GitHub API 列表。
 *
 * @param {{ path: string, token: string, apiUrl?: string, fetchImpl?: typeof fetch }} options 参数
 * @returns {Promise<Record<string, any>[]>} 全量列表
 */
export async function fetchAllPages({ path, token, apiUrl = DEFAULT_API_URL, fetchImpl = globalThis.fetch }) {
    const results = []
    const separator = path.includes('?') ? '&' : '?'
    let url = `${apiUrl}${path}${separator}per_page=${PAGE_SIZE}`

    for (let page = 1; page <= MAX_PAGES; page += 1) {
        const response = await fetchImpl(url, {
            headers: {
                Accept: 'application/vnd.github+json',
                Authorization: `Bearer ${token}`,
                'X-GitHub-Api-Version': API_VERSION,
                'User-Agent': 'caomei-ui-security-alerts',
            },
        })

        if (!response.ok) {
            let hint = '请检查网络或 GitHub API 状态'
            if (response.status === 401 || response.status === 403) {
                hint = '请确认 SECURITY_ALERTS_TOKEN 具备 Dependabot alerts / Code Scanning alerts 读取权限'
            } else if (response.status === 404) {
                hint = '端点不存在或告警未启用；请确认仓库已启用该功能且 PAT 具备读取权限'
            }
            let detail = ''
            try {
                const body = await response.json()
                detail = body?.message ? `（${body.message}）` : ''
            } catch {
                detail = ''
            }
            throw new GitHubApiError(`GitHub API ${response.status}${detail}：${url}；${hint}`, response.status)
        }

        const items = await response.json()
        if (!Array.isArray(items)) {
            throw new Error(`GitHub API 返回非数组：${url}`)
        }
        results.push(...items)

        const next = parseNextLink(response.headers?.get?.('link'))
        if (!next) {
            return results
        }
        url = next
    }
    throw new Error(`GitHub API 分页超过上限 ${MAX_PAGES} 页，疑似分页异常`)
}

/**
 * 拉取两类告警的 open 与 dismissed（`auto_dismissed` 不查询）。
 *
 * 每类来源各查两次状态，合并后由 `evaluateAlerts` 按 `state` 判定。
 *
 * @param {{ repo: string, token: string, apiUrl?: string, fetchImpl?: typeof fetch }} options 参数
 * @returns {Promise<{ dependabot: Record<string, any>[], codeScanning: Record<string, any>[] }>} 两类告警
 */
export async function fetchAlerts({ repo, token, apiUrl = DEFAULT_API_URL, fetchImpl = globalThis.fetch }) {
    const fetchByState = (source) => Promise.all(ALERT_STATES.map((state) => fetchAllPages({
        path: `/repos/${repo}/${source}/alerts?state=${state}`,
        token,
        apiUrl,
        fetchImpl,
    })))
    const [dependabot, codeScanning] = await Promise.all([
        fetchByState('dependabot'),
        fetchByState('code-scanning'),
    ])
    return { dependabot: dependabot.flat(), codeScanning: codeScanning.flat() }
}

/**
 * 读取豁免清单；文件不存在时返回空清单。
 *
 * @param {string} file 文件路径
 * @returns {Map<string, Record<string, any>>} 索引
 */
export function loadExemptions(file) {
    if (!existsSync(file)) {
        return new Map()
    }
    return validateExemptions(JSON.parse(readFileSync(file, 'utf8')))
}

/**
 * 渲染文本报告。
 *
 * @param {ReturnType<typeof evaluateAlerts>} result 评估结果
 * @returns {string} 报告
 */
export function formatReport(result) {
    const lines = [
        `[security-alerts] critical ${result.counts.critical} / high ${result.counts.high} / medium ${result.counts.medium} / low ${result.counts.low} / note ${result.counts.note}（open ${result.stateCounts.open} / dismissed ${result.stateCounts.dismissed}）`,
    ]
    for (const alert of result.blocking) {
        const state = alert.state === 'dismissed' ? ` dismissed(${alert.dismissedReason || '未记录原因'})` : ''
        lines.push(`  ✖ ${alert.source} #${alert.id} ${alert.severity}${state} ${alert.package ?? alert.rule} ${alert.advisory ?? ''} ${alert.vulnerableRange ?? alert.path ?? ''} ${alert.url}`.trim())
    }
    for (const alert of result.exempted) {
        lines.push(`  ○ 豁免 ${alert.source} #${alert.id} ${alert.package ?? alert.rule} [${alert.exemption.category}] → ${alert.exemption.plannedVersion}（${alert.exemption.reason}）`)
    }
    if (result.staleExemptions.length > 0) {
        lines.push(`  ! 失效豁免（对应告警已不在 open / dismissed 列表）：${result.staleExemptions.join(', ')}；请删除对应条目`)
    }
    if (result.blocking.length > 0) {
        lines.push(`[security-alerts] 未通过：${result.blocking.length} 项 critical / high 阻塞`)
    } else {
        lines.push(`[security-alerts] 通过：无 critical / high 阻塞（${result.deferred.length} 项可暂缓，${result.exempted.length} 项豁免）`)
    }
    return lines.join('\n')
}

/**
 * 渲染 GitHub Actions job summary。
 *
 * @param {ReturnType<typeof evaluateAlerts>} result 评估结果
 * @returns {string} Markdown
 */
export function formatSummary(result) {
    const rows = result.alerts.map((alert) => {
        const exempt = result.exempted.find((item) => item.source === alert.source && item.id === alert.id)
        let verdict = '暂缓'
        if (exempt) {
            verdict = `豁免 [${exempt.exemption.category}] → ${String(exempt.exemption.plannedVersion).replaceAll('|', '\\|')}`
        } else if (alert.severity === 'critical' || alert.severity === 'high') {
            verdict = '阻塞'
        }
        const name = String(alert.package ?? alert.rule).replaceAll('|', '\\|')
        return `| ${alert.source} | #${alert.id} | ${alert.severity} | ${alert.state} | ${name} | ${verdict} |`
    })
    return [
        '## Security alerts gate',
        '',
        `critical ${result.counts.critical} / high ${result.counts.high} / medium ${result.counts.medium} / low ${result.counts.low} / note ${result.counts.note}（open ${result.stateCounts.open} / dismissed ${result.stateCounts.dismissed}）`,
        '',
        '| Source | Alert | Severity | State | Package / rule | Verdict |',
        '| --- | --- | --- | --- | --- | --- |',
        ...rows,
        '',
    ].join('\n')
}

/**
 * 从 git remote 地址解析 `owner/repo`（仅 GitHub）。
 *
 * 支持 `https://github.com/o/r(.git)`、`git@github.com:o/r(.git)`、
 * `ssh://git@github.com/o/r(.git)` 三种形态；非 GitHub 或无法解析时返回 `null`。
 *
 * @param {string | null | undefined} remote remote 地址
 * @returns {string | null} `owner/repo`
 */
export function parseRepoFromRemote(remote) {
    const cleaned = String(remote ?? '').trim().replace(/\/+$/u, '').replace(/\.git$/u, '')
    if (cleaned === '') {
        return null
    }
    const patterns = [
        /^https?:\/\/github\.com\/([^/]+)\/([^/]+)$/u,
        /^git@github\.com:([^/]+)\/([^/]+)$/u,
        /^ssh:\/\/git@github\.com\/([^/]+)\/([^/]+)$/u,
    ]
    for (const pattern of patterns) {
        const match = cleaned.match(pattern)
        if (match) {
            return `${match[1]}/${match[2]}`
        }
    }
    return null
}

/**
 * 读取 `origin` 的 remote 地址（本地回退用）。
 *
 * @param {string} root 仓库根
 * @returns {string | null} remote 地址；git 不可用或未配置时返回 `null`
 */
function readOriginRemote(root) {
    const result = spawnSync('git', ['remote', 'get-url', 'origin'], { cwd: root, encoding: 'utf8' })
    if (result.status !== 0) {
        return null
    }
    return result.stdout?.trim() || null
}

/**
 * 解析仓库标识。
 *
 * 优先级：`--repo` → `GITHUB_REPOSITORY` → `origin` remote（本地回退）。
 *
 * @param {string | undefined} argvRepo `--repo` 参数
 * @param {{ root?: string, env?: NodeJS.ProcessEnv, gitRemote?: () => string | null }} [options] 运行环境
 * @returns {string} `owner/repo`
 */
export function resolveRepo(argvRepo, { root = REPO_ROOT, env = process.env, gitRemote = () => readOriginRemote(root) } = {}) {
    if (argvRepo) {
        return argvRepo
    }
    if (env.GITHUB_REPOSITORY) {
        return env.GITHUB_REPOSITORY
    }
    const fromRemote = parseRepoFromRemote(gitRemote())
    if (fromRemote) {
        return fromRemote
    }
    throw new Error('缺少仓库标识：请传 --repo=owner/repo、设置 GITHUB_REPOSITORY，或在仓库内配置 origin remote')
}

/**
 * 发布前安全告警门禁（供 `manual-release` 复用）。
 *
 * 与 CLI 同口径，但以抛错表达阻塞：调用方（发布链）不需要处理退出码。
 * token 缺失时给出本地配置路径（`.env.local`），避免只报「缺少变量」。
 *
 * @param {{
 *   root?: string,
 *   repo?: string,
 *   token?: string,
 *   exemptionsPath?: string,
 *   apiUrl?: string,
 *   env?: NodeJS.ProcessEnv,
 *   gitRemote?: () => string | null,
 *   fetchImpl?: typeof fetch,
 *   write?: (line: string) => void,
 * }} [options] 参数
 * @returns {Promise<ReturnType<typeof evaluateAlerts>>} 评估结果
 */
export async function assertSecurityGate({
    root = REPO_ROOT,
    repo,
    token,
    exemptionsPath = join(root, DEFAULT_EXEMPTIONS_PATH),
    apiUrl = DEFAULT_API_URL,
    env = process.env,
    gitRemote,
    fetchImpl,
    write = (line) => process.stdout.write(`${line}\n`),
} = {}) {
    if (!token) {
        throw new Error(
            '缺少 SECURITY_ALERTS_TOKEN：Dependabot 告警只能用具备 security_events 权限的用户 PAT 读取。'
            + `请在仓库根创建 ${LOCAL_ENV_FILE} 写入 SECURITY_ALERTS_TOKEN=<pat>（已 gitignore），或临时 export 该变量`,
        )
    }
    const resolvedRepo = repo ?? resolveRepo(undefined, { root, env, gitRemote })
    const exemptions = loadExemptions(exemptionsPath)
    const alerts = await fetchAlerts({ repo: resolvedRepo, token, apiUrl, fetchImpl })
    const result = evaluateAlerts({ ...alerts, exemptions })
    write(`[security-alerts] repo=${resolvedRepo}`)
    write(formatReport(result))
    if (result.blocking.length > 0) {
        throw new Error(`安全告警门禁未通过：${result.blocking.length} 项 critical / high 阻塞（明细见上）`)
    }
    return result
}

/**
 * CLI 入口。
 *
 * @param {string[]} argv 参数
 * @param {{ fetchImpl?: typeof fetch, env?: NodeJS.ProcessEnv }} [runtime] 运行环境
 * @returns {Promise<number>} 退出码
 */
export async function main(argv = process.argv, runtime = {}) {
    const options = parseCliOptions(argv, {
        flags: {
            '--json': { key: 'json' },
        },
        values: {
            '--repo': { key: 'repo' },
            '--api-url': { key: 'apiUrl' },
            '--exemptions': { key: 'exemptions' },
        },
        defaults: {
            apiUrl: DEFAULT_API_URL,
            exemptions: join(REPO_ROOT, DEFAULT_EXEMPTIONS_PATH),
        },
    })

    try {
        // 测试注入 runtime.env 时不读本地文件，避免读取开发者机器的 `.env.local`。
        let env = runtime.env
        if (!env) {
            env = { ...process.env }
            loadLocalEnv(REPO_ROOT, { env })
        }
        const token = env.SECURITY_ALERTS_TOKEN
        if (!token) {
            throw new Error(`缺少 SECURITY_ALERTS_TOKEN；Dependabot 告警只能用具备 security_events 权限的用户 PAT 读取（本地可写入 ${LOCAL_ENV_FILE}）`)
        }
        const repo = resolveRepo(options.repo, { env })
        const exemptions = loadExemptions(options.exemptions)
        const alerts = await fetchAlerts({ repo, token, apiUrl: options.apiUrl, fetchImpl: runtime.fetchImpl })
        const result = evaluateAlerts({ ...alerts, exemptions })

        if (options.json) {
            console.info(JSON.stringify({ repo, counts: result.counts, stateCounts: result.stateCounts, blocking: result.blocking, exempted: result.exempted, staleExemptions: result.staleExemptions }, null, 2))
        } else {
            console.info(`[security-alerts] repo=${repo}`)
            console.info(formatReport(result))
        }
        if (env.GITHUB_STEP_SUMMARY) {
            appendFileSync(env.GITHUB_STEP_SUMMARY, `${formatSummary(result)}\n`)
        }
        return result.blocking.length > 0 ? 1 : 0
    } catch (error) {
        console.error(`[security-alerts] ${error.message}`)
        return 2
    }
}

if (isDirectExecution(import.meta.url)) {
    process.exitCode = await main()
}
