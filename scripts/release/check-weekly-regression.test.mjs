import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import {
    DEFAULT_BRANCH,
    DEFAULT_WORKFLOW,
    GitHubApiError,
    REPO_ROOT,
    evaluateLatestRun,
    fetchLatestRun,
    runGate,
} from './check-weekly-regression.mjs'

/** 构造一条 Actions run。 */
function run(overrides = {}) {
    return {
        id: 1,
        status: 'completed',
        conclusion: 'success',
        html_url: 'https://github.com/o/r/actions/runs/1',
        created_at: '2026-11-14T12:00:00Z',
        display_title: 'Weekly Regression',
        ...overrides,
    }
}

describe('check-weekly-regression 判定', () => {
    it('最近一次 completed 且 success → 通过', () => {
        const result = evaluateLatestRun({ workflow_runs: [run()] })
        expect(result.ok).toBe(true)
        expect(result.run?.conclusion).toBe('success')
    })

    it.each(['failure', 'cancelled', 'timed_out', 'skipped', 'action_required', 'neutral', 'stale', 'unknown'])(
        '结论 %s 一律不通过（fail-closed）',
        (conclusion) => {
            const result = evaluateLatestRun({ workflow_runs: [run({ conclusion })] })
            expect(result.ok).toBe(false)
            expect(result.reason).toContain(conclusion)
        },
    )

    it('没有运行记录 → 不通过并点名原因', () => {
        expect(evaluateLatestRun({ workflow_runs: [] })).toMatchObject({ ok: false, run: null })
        expect(evaluateLatestRun({}).reason).toContain('没有任何')
    })

    it('只有未完成的运行 → 不通过（不能把进行中当绿）', () => {
        const result = evaluateLatestRun({
            workflow_runs: [run({ status: 'in_progress', conclusion: null }), run({ id: 2, status: 'queued', conclusion: null })],
        })
        expect(result.ok).toBe(false)
        expect(result.reason).toContain('尚未完成')
    })

    it('跳过未完成的运行，取最近一次已完成运行', () => {
        const result = evaluateLatestRun({
            workflow_runs: [run({ id: 9, status: 'in_progress', conclusion: null }), run({ id: 8, conclusion: 'failure' })],
        })
        expect(result.ok).toBe(false)
        expect(result.run?.id).toBe(8)
    })

    it('响应乱序时按 created_at 取最新，而不是取数组第一条', () => {
        const result = evaluateLatestRun({
            workflow_runs: [
                run({ id: 1, conclusion: 'failure', created_at: '2026-11-01T12:00:00Z' }),
                run({ id: 3, conclusion: 'success', created_at: '2026-11-14T12:00:00Z' }),
                run({ id: 2, conclusion: 'failure', created_at: '2026-11-07T12:00:00Z' }),
            ],
        })
        expect(result.ok).toBe(true)
        expect(result.run?.id).toBe(3)
    })
})

describe('release.yml 接线', () => {
    const workflow = readFileSync(join(REPO_ROOT, '.github/workflows/release.yml'), 'utf8')
    /** 切片：`release` job 体（到下一个顶级 job 之前）。 */
    const releaseJob = workflow.slice(workflow.indexOf('\n  release:'), workflow.indexOf('\n  dispatch-downstream:'))
    /** 切片：门禁步骤体（到下一个步骤之前）。 */
    const gateStep = releaseJob.slice(
        releaseJob.indexOf('- name: Weekly regression gate'),
        releaseJob.indexOf('- name: Security alert gate'),
    )

    it('周回归门禁步骤在依赖安装之后、安全告警之前，并调用 check:weekly-regression', () => {
        const install = releaseJob.indexOf('pnpm i --frozen-lockfile')
        const gate = releaseJob.indexOf('- name: Weekly regression gate')
        const security = releaseJob.indexOf('- name: Security alert gate')
        const release = releaseJob.indexOf('- name: Release')
        expect(install).toBeGreaterThan(-1)
        expect(gate).toBeGreaterThan(install)
        expect(security).toBeGreaterThan(gate)
        expect(release).toBeGreaterThan(security)
        expect(gateStep).toContain('pnpm check:weekly-regression')
    })

    it('门禁步骤自带 GITHUB_TOKEN（否则每次发布都会以 exit 2 阻塞）', () => {
        expect(gateStep).toContain('GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}')
    })

    it('release job 具备 actions: read（查询 Actions runs 所需）', () => {
        const permissions = releaseJob.slice(releaseJob.indexOf('permissions:'), releaseJob.indexOf('outputs:'))
        expect(permissions).toMatch(/\n\s+actions: read\b/u)
    })
})

describe('check-weekly-regression 请求', () => {
    it('按 workflow / branch 构造请求并带鉴权头', async () => {
        const calls = []
        const fetchImpl = async (url, init) => {
            calls.push({ url: String(url), init })
            return { ok: true, json: async () => ({ workflow_runs: [run()] }) }
        }
        const result = await fetchLatestRun({ repo: 'o/r', token: 't', fetchImpl })
        expect(result.ok).toBe(true)
        expect(calls).toHaveLength(1)
        expect(calls[0].url).toContain(`/repos/o/r/actions/workflows/${encodeURIComponent(DEFAULT_WORKFLOW)}/runs`)
        expect(calls[0].url).toContain(`branch=${DEFAULT_BRANCH}`)
        expect(calls[0].url).toContain('per_page=20')
        expect(calls[0].init.headers.authorization).toBe('Bearer t')
    })

    it('非 2xx → 抛 GitHubApiError 并带状态码', async () => {
        await expect(fetchLatestRun({
            repo: 'o/r',
            token: 't',
            fetchImpl: async () => ({ ok: false, status: 404, json: async () => ({}) }),
        })).rejects.toMatchObject({ name: 'GitHubApiError', status: 404 })
    })

    it('非 2xx 时带出响应体 message（403 可区分权限 / 限流）', async () => {
        await expect(fetchLatestRun({
            repo: 'o/r',
            token: 't',
            fetchImpl: async () => ({
                ok: false,
                status: 403,
                text: async () => JSON.stringify({ message: 'Resource not accessible by integration' }),
            }),
        })).rejects.toThrow(/HTTP 403（Resource not accessible by integration）/u)
    })

    it('200 但响应体不是 JSON → 抛错（由 runGate 归为 exit 2）', async () => {
        await expect(fetchLatestRun({
            repo: 'o/r',
            token: 't',
            fetchImpl: async () => ({ ok: true, json: async () => { throw new SyntaxError('bad json') } }),
        })).rejects.toBeInstanceOf(SyntaxError)
    })

    it('缺 token / 非法仓库标识 → 直接失败（不回退匿名请求）', async () => {
        await expect(fetchLatestRun({ repo: 'o/r', token: '', fetchImpl: async () => ({ ok: true, json: async () => ({}) }) }))
            .rejects.toThrow(/缺少 GITHUB_TOKEN/)
        await expect(fetchLatestRun({ repo: 'r', token: 't', fetchImpl: async () => ({ ok: true, json: async () => ({}) }) }))
            .rejects.toBeInstanceOf(GitHubApiError)
    })
})

describe('check-weekly-regression 退出码', () => {
    const env = { GITHUB_TOKEN: 't', GITHUB_REPOSITORY: 'o/r' }

    it('绿 → 0；红 → 1；查询失败 → 2', async () => {
        const okGate = await runGate(['node', 'x'], {
            env,
            log: () => {},
            fetchImpl: async () => ({ ok: true, json: async () => ({ workflow_runs: [run()] }) }),
        })
        expect(okGate).toBe(0)

        const redGate = await runGate(['node', 'x'], {
            env,
            log: () => {},
            fetchImpl: async () => ({ ok: true, json: async () => ({ workflow_runs: [run({ conclusion: 'failure' })] }) }),
        })
        expect(redGate).toBe(1)

        const errorGate = await runGate(['node', 'x'], {
            env,
            log: () => {},
            fetchImpl: async () => {
                throw new Error('network down')
            },
        })
        expect(errorGate).toBe(2)
    })

    it('缺 token → 2（配置错误与红态用不同退出码）', async () => {
        const code = await runGate(['node', 'x'], {
            env: { GITHUB_REPOSITORY: 'o/r' },
            log: () => {},
            fetchImpl: async () => ({ ok: true, json: async () => ({ workflow_runs: [run()] }) }),
        })
        expect(code).toBe(2)
    })

    it('非法参数 / `--repo=` 空值 → 2，且不回显参数值', async () => {
        const logs = []
        const parseError = await runGate(['node', 'x', '--bogus=secret-value'], {
            env,
            log: (message) => logs.push(message),
        })
        expect(parseError).toBe(2)
        expect(logs.join('\n')).not.toContain('secret-value')

        const emptyRepo = await runGate(['node', 'x', '--repo='], {
            env,
            log: () => {},
            fetchImpl: async () => ({ ok: true, json: async () => ({ workflow_runs: [run()] }) }),
        })
        expect(emptyRepo).toBe(2)
    })

    it('`--json` 失败路径也是机器可读结构', async () => {
        const logs = []
        const code = await runGate(['node', 'x', '--json'], {
            env: { GITHUB_REPOSITORY: 'o/r' },
            log: (message) => logs.push(message),
        })
        expect(code).toBe(2)
        expect(JSON.parse(logs.at(-1))).toMatchObject({ ok: false })
    })
})
