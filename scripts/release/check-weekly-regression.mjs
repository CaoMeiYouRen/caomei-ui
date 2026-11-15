#!/usr/bin/env node

/**
 * check-weekly-regression：发布前的「周回归门禁」机检。
 *
 * 依据：[发布指南 §1](../../docs/guide/release.md) —— 触发 `Release` 前，以发布当周最近一次
 * `Weekly Regression` 运行（含手动触发）结论为绿为准；非 `success` 或查询失败即中止发布。
 *
 * 为什么需要机器检查：该门禁此前只写在指南里，靠人工核对 run 列表；漏看一次就会把未经回归的
 * 代码发出去。本脚本把「最近一次运行」的结论收成退出码，`release.yml` 在发布前调用一次即可。
 *
 * 判定（fail-closed）：
 * - 查询失败（网络 / 非 2xx / 缺 token / 缺仓库标识 / 参数非法）→ exit 2；
 * - 没有任何已完成的运行 → exit 1；
 * - 最近一次运行结论不是 `success`（`failure` / `cancelled` / `timed_out` / `skipped` / `action_required` / `neutral` / `stale` / 未知值）→ exit 1。
 *
 * 边界：本脚本只校验「最近一次已完成运行的结论」；「发布当周」与「该次运行不早于待发布代码」
 * 仍由发布者按发布指南 §1 人工核对（脚本在非 `--json` 模式下打印运行创建时间便于判断）。
 *
 * 认证：需要 `GITHUB_TOKEN`（Actions 内建，权限 `actions: read`）或 `GH_TOKEN` / `GITHUB_TOKEN`
 * 环境变量；本地可写入仓库根的 `.env.local`。缺 token 直接失败，不回退到匿名请求
 * （匿名请求对私有仓库会 404，容易把「查不到」误当成「没有运行」）。
 *
 * 用法：
 *   pnpm check:weekly-regression
 *   pnpm check:weekly-regression --repo=owner/repo --branch=master --json
 *
 * 退出码：0 通过；1 结论非绿 / 无运行；2 配置或 API 错误。
 */
import { spawnSync } from 'node:child_process'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { isDirectExecution, parseCliOptions } from '../shared/cli.mjs'
import { LOCAL_ENV_FILE, loadLocalEnv } from '../shared/env.mjs'

export const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..')
export const DEFAULT_API_URL = 'https://api.github.com'
export const DEFAULT_WORKFLOW = 'regression-weekly.yml'
export const DEFAULT_BRANCH = 'master'
export const API_VERSION = '2022-11-28'
/** 只接受该结论；其余一律视为未通过。 */
export const PASSING_CONCLUSION = 'success'

export class GitHubApiError extends Error {
    constructor(message, status) {
        super(message)
        this.name = 'GitHubApiError'
        this.status = status
    }
}

/**
 * 从运行列表里取「最近一次已完成运行」并判定。
 *
 * 显式按 `created_at` 倒序（同一时间按 id 倒序）后再取第一条，不依赖接口返回顺序；脚本显式忽略仍在
 * 排队 / 进行中的运行——它们还没有结论，不能当作绿。
 *
 * @param {{ workflow_runs?: Array<Record<string, unknown>> }} payload Actions runs 接口响应
 * @returns {{ ok: boolean, reason: string, run: { id: number, conclusion: string, status: string, url: string, createdAt: string, displayTitle: string } | null }}
 */
export function evaluateLatestRun(payload) {
    const runs = Array.isArray(payload?.workflow_runs) ? payload.workflow_runs : []
    const completed = runs
        .filter((run) => String(run?.status ?? '') === 'completed')
        // 不依赖接口返回顺序：显式按创建时间倒序（同一时间按 id 倒序），避免代理 / 镜像改写顺序时取到旧结论
        .sort((left, right) => {
            const byTime = String(right?.created_at ?? '').localeCompare(String(left?.created_at ?? ''))
            return byTime === 0 ? Number(right?.id ?? 0) - Number(left?.id ?? 0) : byTime
        })
    if (completed.length === 0) {
        return {
            ok: false,
            reason: runs.length === 0
                ? '没有任何 Weekly Regression 运行记录'
                : `最近 ${runs.length} 次运行都尚未完成（无可用结论）`,
            run: null,
        }
    }
    const latest = completed[0]
    const conclusion = String(latest.conclusion ?? 'unknown')
    const run = {
        id: Number(latest.id ?? 0),
        conclusion,
        status: String(latest.status ?? ''),
        url: String(latest.html_url ?? ''),
        createdAt: String(latest.created_at ?? ''),
        displayTitle: String(latest.display_title ?? ''),
    }
    if (conclusion !== PASSING_CONCLUSION) {
        return { ok: false, reason: `最近一次运行结论为 ${conclusion}（要求 ${PASSING_CONCLUSION}）`, run }
    }
    return { ok: true, reason: `最近一次运行结论为 ${conclusion}`, run }
}

/**
 * 拉取最近一次已完成运行的判定结果。
 *
 * @param {{ repo: string, token: string, apiUrl?: string, workflow?: string, branch?: string, fetchImpl?: typeof fetch }} options
 * @returns {Promise<ReturnType<typeof evaluateLatestRun>>}
 */
export async function fetchLatestRun(options) {
    const {
        repo,
        token,
        apiUrl = DEFAULT_API_URL,
        workflow = DEFAULT_WORKFLOW,
        branch = DEFAULT_BRANCH,
        fetchImpl = fetch,
    } = options
    if (!repo || !/^[^/]+\/[^/]+$/u.test(repo)) {
        throw new GitHubApiError(`仓库标识非法：${repo}（应为 owner/repo）`, 0)
    }
    if (!token) {
        throw new GitHubApiError('缺少 GITHUB_TOKEN（需要 actions: read 权限）', 0)
    }
    const url = new URL(`${apiUrl.replace(/\/$/u, '')}/repos/${repo}/actions/workflows/${encodeURIComponent(workflow)}/runs`)
    url.searchParams.set('branch', branch)
    url.searchParams.set('per_page', '20')
    const response = await fetchImpl(url, {
        headers: {
            accept: 'application/vnd.github+json',
            authorization: `Bearer ${token}`,
            'x-github-api-version': API_VERSION,
        },
    })
    if (!response.ok) {
        // 403 可能是权限不足 / 限流 / 企业策略；带出 GitHub 的错误说明才可行动（错误体不含凭据）
        const detail = await readErrorDetail(response)
        throw new GitHubApiError(`Actions runs 查询失败：HTTP ${response.status}${detail}`, response.status)
    }
    return evaluateLatestRun(await response.json())
}

/**
 * 读取错误响应体里的 `message`（截断，避免把整页 HTML 写进日志）。
 *
 * @param {{ text?: () => Promise<string> }} response fetch 响应
 * @returns {Promise<string>} 形如 `（message）`，取不到时为空串
 */
async function readErrorDetail(response) {
    try {
        if (typeof response.text !== 'function') {
            return ''
        }
        const raw = await response.text()
        const message = String(JSON.parse(raw)?.message ?? '').trim()
        return message ? `（${message.slice(0, 200)}）` : ''
    } catch {
        return ''
    }
}

/**
 * 解析仓库标识：显式参数 → `GITHUB_REPOSITORY` → `origin` 远端。
 *
 * @param {string | null} explicit 显式 `--repo`
 * @param {Record<string, string | undefined>} env 环境变量
 * @returns {string} `owner/repo`
 */
export function resolveRepo(explicit, env = process.env) {
    if (explicit) {
        return explicit
    }
    if (env.GITHUB_REPOSITORY) {
        return env.GITHUB_REPOSITORY
    }
    const remote = spawnSync('git', ['remote', 'get-url', 'origin'], { cwd: REPO_ROOT, encoding: 'utf8' })
    const raw = remote.status === 0 ? remote.stdout.trim() : ''
    const match = raw.match(/github\.com[/:]([^/]+)\/([^/]+?)(?:\.git)?$/u)
    if (!match) {
        throw new GitHubApiError('无法解析仓库标识：请显式传 --repo=owner/repo', 0)
    }
    return `${match[1]}/${match[2]}`
}

/**
 * 运行门禁并返回退出码。
 *
 * @param {string[]} argv 原始 argv（含 node / 脚本名）
 * @param {{ env?: Record<string, string | undefined>, fetchImpl?: typeof fetch, log?: (message: string) => void }} [deps]
 * @returns {Promise<number>}
 */
export async function runGate(argv, deps = {}) {
    // 测试注入 env 时不读本地文件，避免把开发者机器的 `.env.local` 带进断言。
    let env = deps.env
    if (!env) {
        env = { ...process.env }
        loadLocalEnv(REPO_ROOT, { env })
    }
    const log = deps.log ?? ((message) => console.info(message))
    let options
    try {
        options = parseCliOptions(argv, {
            values: {
                '--repo': { key: 'repo' },
                '--branch': { key: 'branch' },
                '--workflow': { key: 'workflow' },
                '--api-url': { key: 'apiUrl' },
            },
            flags: { '--json': { key: 'json' } },
        })
    } catch (error) {
        // 参数解析失败属配置错误（exit 2）；共享解析器的消息会回显原始参数，这里把 `=` 之后的值隐去
        const message = String(error.message ?? error).replace(/(--[A-Za-z-]+)=[^\s]*/gu, '$1=***')
        log(`[weekly-regression] ERROR：参数解析失败（${message}）`)
        return 2
    }
    try {
        if (options.repo === '') {
            throw new GitHubApiError('--repo 不能为空（应为 owner/repo）', 0)
        }
        const repo = resolveRepo(options.repo ?? null, env)
        const token = env.GITHUB_TOKEN ?? env.GH_TOKEN ?? ''
        const result = await fetchLatestRun({
            repo,
            token,
            apiUrl: options.apiUrl ?? DEFAULT_API_URL,
            workflow: options.workflow ?? DEFAULT_WORKFLOW,
            branch: options.branch ?? DEFAULT_BRANCH,
            fetchImpl: deps.fetchImpl,
        })
        if (options.json) {
            log(JSON.stringify({ repo, ...result }, null, 2))
        } else {
            log(`[weekly-regression] ${repo} ${result.reason}${result.run?.url ? `：${result.run.url}` : ''}`)
            if (result.run?.createdAt) {
                // 「当周」与「不早于待发布代码」仍为人工前置核对（见发布指南 §1），这里给出运行时间便于判断
                log(`[weekly-regression] 运行创建时间：${result.run.createdAt}`)
            }
        }
        if (result.ok) {
            return 0
        }
        log('[weekly-regression] FAIL：发布前置要求最近一次周回归结论为 success')
        return 1
    } catch (error) {
        // `--json` 声明的机器可读输出在失败路径同样成立
        if (options.json) {
            log(JSON.stringify({ ok: false, reason: String(error.message ?? error) }, null, 2))
        } else {
            log(`[weekly-regression] ERROR：${error.message}`)
        }
        return 2
    }
}

if (isDirectExecution(import.meta.url)) {
    process.exitCode = await runGate(process.argv)
}
