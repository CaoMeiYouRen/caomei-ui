#!/usr/bin/env node

/**
 * check-security-alerts：发布前安全告警门禁。
 *
 * 依据：[安全规范 §2.1](../../docs/standards/security.md) —— critical 必须修复且不得豁免；
 * high 仅「无可用修复版本 / 修复成本过高」可留痕豁免；medium / low 可暂缓。
 *
 * 数据源（均取 `state=open`，分页拉全量）：
 * 1. Dependabot alerts：严重级取 `security_advisory.severity`；
 * 2. Code Scanning alerts：严重级取 `rule.security_severity_level`，为空时含 `security` 标签按 high 处置。
 *
 * 认证：必须提供 `SECURITY_ALERTS_TOKEN`（用户 PAT，需 Dependabot alerts / Code Scanning alerts 读权限）；
 * 仓库默认 `GITHUB_TOKEN` 无法读取 Dependabot 告警，故不提供回退（缺 token 直接失败）。
 *
 * 豁免：`.github/security-alerts-exemptions.json`（仅 high，字段见 `validateExemptions`）。
 *
 * 用法：
 *   SECURITY_ALERTS_TOKEN=<pat> pnpm check:security-alerts
 *   pnpm check:security-alerts --repo=owner/repo --json
 *
 * 退出码：0 通过；1 存在阻塞项；2 配置 / API 错误。
 */
import { existsSync, readFileSync, appendFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { isDirectExecution, parseCliOptions } from '../shared/cli.mjs'

export const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..')
export const DEFAULT_API_URL = 'https://api.github.com'
export const DEFAULT_EXEMPTIONS_PATH = '.github/security-alerts-exemptions.json'
export const API_VERSION = '2022-11-28'
export const PAGE_SIZE = 100
export const MAX_PAGES = 20
export const SEVERITIES = ['critical', 'high', 'medium', 'low', 'note']

const EXEMPTION_FIELDS = ['source', 'id', 'reason', 'plannedVersion', 'tracking', 'approvedBy', 'recordedAt']

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
 * 评估告警：critical 恒阻塞（不得豁免）；high 无有效豁免即阻塞；其余暂缓。
 *
 * @param {{ dependabot?: Record<string, any>[], codeScanning?: Record<string, any>[], exemptions?: Map<string, Record<string, any>> }} input 输入
 * @returns {{ alerts: Record<string, any>[], counts: Record<string, number>, blocking: Record<string, any>[], exempted: Record<string, any>[], deferred: Record<string, any>[], staleExemptions: string[] }} 评估结果
 */
export function evaluateAlerts({ dependabot = [], codeScanning = [], exemptions = new Map() }) {
    const alerts = [
        ...dependabot.map(normalizeDependabotAlert),
        ...codeScanning.map(normalizeCodeScanningAlert),
    ]
    const counts = Object.fromEntries(SEVERITIES.map((severity) => [severity, 0]))
    const blocking = []
    const exempted = []
    const deferred = []
    const used = new Set()

    for (const alert of alerts) {
        counts[alert.severity] += 1
        const key = `${alert.source}:${alert.id}`
        const exemption = exemptions.get(key)
        if (exemption) {
            if (alert.severity !== 'high') {
                throw new Error(`仅 high 级别可豁免：${key} 当前严重级为 ${alert.severity}`)
            }
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
    return { alerts, counts, blocking, exempted, deferred, staleExemptions }
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
 * 拉取两类 open 告警。
 *
 * @param {{ repo: string, token: string, apiUrl?: string, fetchImpl?: typeof fetch }} options 参数
 * @returns {Promise<{ dependabot: Record<string, any>[], codeScanning: Record<string, any>[] }>} 两类告警
 */
export async function fetchAlerts({ repo, token, apiUrl = DEFAULT_API_URL, fetchImpl = globalThis.fetch }) {
    const dependabot = await fetchAllPages({
        path: `/repos/${repo}/dependabot/alerts?state=open`,
        token,
        apiUrl,
        fetchImpl,
    })
    const codeScanning = await fetchAllPages({
        path: `/repos/${repo}/code-scanning/alerts?state=open`,
        token,
        apiUrl,
        fetchImpl,
    })
    return { dependabot, codeScanning }
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
        `[security-alerts] critical ${result.counts.critical} / high ${result.counts.high} / medium ${result.counts.medium} / low ${result.counts.low} / note ${result.counts.note}`,
    ]
    for (const alert of result.blocking) {
        lines.push(`  ✖ ${alert.source} #${alert.id} ${alert.severity} ${alert.package ?? alert.rule} ${alert.advisory ?? ''} ${alert.vulnerableRange ?? alert.path ?? ''} ${alert.url}`.trim())
    }
    for (const alert of result.exempted) {
        lines.push(`  ○ 豁免 ${alert.source} #${alert.id} ${alert.package ?? alert.rule} → ${alert.exemption.plannedVersion}（${alert.exemption.reason}）`)
    }
    if (result.staleExemptions.length > 0) {
        lines.push(`  ! 失效豁免（对应告警已不在 open 列表）：${result.staleExemptions.join(', ')}；请删除对应条目`)
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
            verdict = `豁免 → ${String(exempt.exemption.plannedVersion).replaceAll('|', '\\|')}`
        } else if (alert.severity === 'critical' || alert.severity === 'high') {
            verdict = '阻塞'
        }
        const name = String(alert.package ?? alert.rule).replaceAll('|', '\\|')
        return `| ${alert.source} | #${alert.id} | ${alert.severity} | ${name} | ${verdict} |`
    })
    return [
        '## Security alerts gate',
        '',
        `critical ${result.counts.critical} / high ${result.counts.high} / medium ${result.counts.medium} / low ${result.counts.low} / note ${result.counts.note}`,
        '',
        '| Source | Alert | Severity | Package / rule | Verdict |',
        '| --- | --- | --- | --- | --- |',
        ...rows,
        '',
    ].join('\n')
}

function resolveRepo(argvRepo) {
    if (argvRepo) {
        return argvRepo
    }
    const repo = process.env.GITHUB_REPOSITORY
    if (!repo) {
        throw new Error('缺少仓库标识：请传 --repo=owner/repo 或设置 GITHUB_REPOSITORY')
    }
    return repo
}

/**
 * CLI 入口。
 *
 * @param {string[]} argv 参数
 * @param {{ fetchImpl?: typeof fetch, env?: NodeJS.ProcessEnv }} [runtime] 运行环境
 * @returns {Promise<number>} 退出码
 */
export async function main(argv = process.argv, runtime = {}) {
    const env = runtime.env ?? process.env
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
        const token = env.SECURITY_ALERTS_TOKEN
        if (!token) {
            throw new Error('缺少 SECURITY_ALERTS_TOKEN；Dependabot 告警只能用具备 security_events 权限的用户 PAT 读取')
        }
        const repo = resolveRepo(options.repo)
        const exemptions = loadExemptions(options.exemptions)
        const alerts = await fetchAlerts({ repo, token, apiUrl: options.apiUrl, fetchImpl: runtime.fetchImpl })
        const result = evaluateAlerts({ ...alerts, exemptions })

        if (options.json) {
            console.info(JSON.stringify({ counts: result.counts, blocking: result.blocking, exempted: result.exempted, staleExemptions: result.staleExemptions }, null, 2))
        } else {
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
