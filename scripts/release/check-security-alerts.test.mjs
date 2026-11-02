import { existsSync, mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it, vi } from 'vitest'
import {
    DEFAULT_EXEMPTIONS_PATH,
    REPO_ROOT,
    assertSecurityGate,
    evaluateAlerts,
    fetchAlerts,
    fetchAllPages,
    formatReport,
    formatSummary,
    loadExemptions,
    main,
    normalizeCodeScanningAlert,
    normalizeDependabotAlert,
    normalizeSeverity,
    parseNextLink,
    parseRepoFromRemote,
    resolveRepo,
    validateExemptions,
} from './check-security-alerts.mjs'

function dependabotAlert(overrides = {}) {
    return {
        number: 28,
        dependency: { package: { name: 'node-forge' } },
        security_advisory: {
            ghsa_id: 'GHSA-86w9-cpqp-85rv',
            severity: 'high',
            summary: 'node-forge signature forgery',
        },
        security_vulnerability: { vulnerable_version_range: '<= 1.4.0' },
        html_url: 'https://example.test/28',
        ...overrides,
    }
}

function codeScanningAlert(overrides = {}) {
    return {
        number: 5,
        rule: {
            id: 'js/bad-tag-filter',
            security_severity_level: 'high',
            tags: ['security'],
            description: 'Bad HTML filtering regexp',
        },
        most_recent_instance: {
            location: { path: 'scripts/docs/check-example-refs.mjs', start_line: 156 },
            message: { text: 'This regular expression does not match upper case <SCRIPT> tags.' },
        },
        html_url: 'https://example.test/cs/5',
        ...overrides,
    }
}

function jsonResponse(body, status = 200, headers = {}) {
    return {
        status,
        ok: status >= 200 && status < 300,
        headers: { get: (name) => headers[name.toLowerCase()] ?? null },
        json: async () => body,
    }
}

/**
 * 按 `fetchAlerts` 的四次查询顺序（dependabot open / dismissed、code-scanning open / dismissed）构造 mock。
 *
 * @param {{ dependabot?: unknown[], dependabotDismissed?: unknown[], codeScanning?: unknown[], codeScanningDismissed?: unknown[] }} [pages] 各查询的响应体
 * @returns {import('vitest').Mock} fetch mock
 */
function mockAlerts({ dependabot = [], dependabotDismissed = [], codeScanning = [], codeScanningDismissed = [] } = {}) {
    return vi.fn()
        .mockResolvedValueOnce(jsonResponse(dependabot))
        .mockResolvedValueOnce(jsonResponse(dependabotDismissed))
        .mockResolvedValueOnce(jsonResponse(codeScanning))
        .mockResolvedValueOnce(jsonResponse(codeScanningDismissed))
}

describe('normalizeSeverity', () => {
    it('把 moderate 归一为 medium，未知值按 high 兜底', () => {
        expect(normalizeSeverity('moderate')).toBe('medium')
        expect(normalizeSeverity('HIGH')).toBe('high')
        expect(normalizeSeverity('unexpected')).toBe('high')
        expect(normalizeSeverity(undefined)).toBe('high')
    })
})

describe('normalizeDependabotAlert', () => {
    it('提取严重级、包名、受影响区间与 advisory', () => {
        expect(normalizeDependabotAlert(dependabotAlert())).toEqual({
            source: 'dependabot',
            id: 28,
            severity: 'high',
            state: 'open',
            dismissedReason: '',
            package: 'node-forge',
            vulnerableRange: '<= 1.4.0',
            advisory: 'GHSA-86w9-cpqp-85rv',
            summary: 'node-forge signature forgery',
            url: 'https://example.test/28',
        })
    })
})

describe('normalizeCodeScanningAlert', () => {
    it('优先取 security_severity_level', () => {
        expect(normalizeCodeScanningAlert(codeScanningAlert())).toMatchObject({
            source: 'code-scanning',
            id: 5,
            severity: 'high',
            rule: 'js/bad-tag-filter',
            path: 'scripts/docs/check-example-refs.mjs',
            line: 156,
        })
    })

    it('无分级但含 security 标签时按 high 处置', () => {
        const alert = codeScanningAlert()
        alert.rule.security_severity_level = null
        expect(normalizeCodeScanningAlert(alert).severity).toBe('high')
    })

    it('无分级且不含 security 标签时视为 note', () => {
        const alert = codeScanningAlert()
        alert.rule.security_severity_level = null
        alert.rule.tags = ['maintainability']
        expect(normalizeCodeScanningAlert(alert).severity).toBe('note')
    })
})

describe('validateExemptions', () => {
    const valid = {
        exemptions: [{
            source: 'dependabot',
            id: 28,
            category: 'no-fix',
            reason: '上游暂无补丁',
            plannedVersion: '1.1.0',
            tracking: 'docs/plan/backlog.md',
            approvedBy: 'CaoMeiYouRen',
            recordedAt: '2026-10-29',
        }],
    }

    it('接受合法条目并按 source:id 建索引', () => {
        const map = validateExemptions(valid)
        expect(map.get('dependabot:28')?.plannedVersion).toBe('1.1.0')
    })

    it('缺少必填字段时报错', () => {
        expect(() => validateExemptions({ exemptions: [{ ...valid.exemptions[0], plannedVersion: '' }] })).toThrow('plannedVersion')
    })

    it('拒绝重复条目与未知来源', () => {
        expect(() => validateExemptions({ exemptions: [valid.exemptions[0], valid.exemptions[0]] })).toThrow('重复')
        expect(() => validateExemptions({ exemptions: [{ ...valid.exemptions[0], source: 'unknown' }] })).toThrow('source')
    })

    it('顶层结构错误时报错', () => {
        expect(() => validateExemptions({})).toThrow('exemptions')
    })

    it('category 非法时报错', () => {
        expect(() => validateExemptions({ exemptions: [{ ...valid.exemptions[0], category: 'whatever' }] })).toThrow('category')
    })
})

describe('evaluateAlerts', () => {
    it('critical 恒阻塞，high 无豁免时阻塞，其余暂缓', () => {
        const result = evaluateAlerts({
            dependabot: [
                dependabotAlert({ number: 1, security_advisory: { severity: 'critical', ghsa_id: 'GHSA-critical' } }),
                dependabotAlert({ number: 2 }),
            ],
            codeScanning: [codeScanningAlert({ number: 3, rule: { id: 'r', security_severity_level: 'medium' } })],
        })

        expect(result.blocking.map((alert) => alert.id)).toEqual([1, 2])
        expect(result.deferred.map((alert) => alert.id)).toEqual([3])
        expect(result.counts).toMatchObject({ critical: 1, high: 1, medium: 1 })
    })

    it('high 有豁免时转入 exempted，并识别失效豁免', () => {
        const exemptions = validateExemptions({
            exemptions: [{
                source: 'dependabot',
                id: 28,
                category: 'no-fix',
                reason: '上游暂无补丁',
                plannedVersion: '1.1.0',
                tracking: 'docs/plan/backlog.md',
                approvedBy: 'CaoMeiYouRen',
                recordedAt: '2026-10-29',
            }],
        })
        const result = evaluateAlerts({ dependabot: [dependabotAlert()], exemptions, codeScanning: [] })
        expect(result.exempted).toHaveLength(1)
        expect(result.blocking).toEqual([])
        expect(result.staleExemptions).toEqual([])
    })

    it('对 critical 使用豁免直接报错', () => {
        const exemptions = validateExemptions({
            exemptions: [{
                source: 'dependabot',
                id: 1,
                category: 'no-fix',
                reason: 'x',
                plannedVersion: '1.1.0',
                tracking: 'x',
                approvedBy: 'x',
                recordedAt: '2026-10-29',
            }],
        })
        expect(() => evaluateAlerts({
            dependabot: [dependabotAlert({ number: 1, security_advisory: { severity: 'critical' } })],
            exemptions,
        })).toThrow('仅 high')
    })

    it('critical 被 dismiss 仍阻塞，且计入 dismissed 计数', () => {
        const result = evaluateAlerts({
            dependabot: [dependabotAlert({
                number: 9,
                state: 'dismissed',
                dismissed_reason: 'not_used',
                security_advisory: { severity: 'critical' },
            })],
        })
        expect(result.blocking.map((alert) => alert.id)).toEqual([9])
        expect(result.stateCounts).toEqual({ open: 0, dismissed: 1 })
    })

    it('high dismissed 登记 false-positive（reason 含原原因）后放行', () => {
        const exemptions = validateExemptions({
            exemptions: [{
                source: 'dependabot',
                id: 28,
                category: 'false-positive',
                reason: '误报（原 dismiss 原因 not_used）',
                plannedVersion: '1.1.0',
                tracking: 'docs/plan/backlog.md',
                approvedBy: 'CaoMeiYouRen',
                recordedAt: '2026-10-29',
            }],
        })
        const result = evaluateAlerts({
            dependabot: [dependabotAlert({ state: 'dismissed', dismissed_reason: 'not_used' })],
            exemptions,
        })
        expect(result.blocking).toEqual([])
        expect(result.exempted).toHaveLength(1)
    })

    it('high dismissed 用 no-fix / hard-fix 豁免直接报错', () => {
        const exemptions = validateExemptions({
            exemptions: [{
                source: 'dependabot',
                id: 28,
                category: 'no-fix',
                reason: 'x',
                plannedVersion: '1.1.0',
                tracking: 'x',
                approvedBy: 'x',
                recordedAt: '2026-10-29',
            }],
        })
        expect(() => evaluateAlerts({
            dependabot: [dependabotAlert({ state: 'dismissed', dismissed_reason: 'not_used' })],
            exemptions,
        })).toThrow('仅可按 false-positive')
    })

    it('open 告警用 false-positive 豁免直接报错', () => {
        const exemptions = validateExemptions({
            exemptions: [{
                source: 'dependabot',
                id: 28,
                category: 'false-positive',
                reason: '误报',
                plannedVersion: '1.1.0',
                tracking: 'x',
                approvedBy: 'x',
                recordedAt: '2026-10-29',
            }],
        })
        expect(() => evaluateAlerts({ dependabot: [dependabotAlert()], exemptions }))
            .toThrow('仅适用于 dismissed')
    })

    it('false-positive 的 reason 未含原 dismiss 原因时报错', () => {
        const exemptions = validateExemptions({
            exemptions: [{
                source: 'dependabot',
                id: 28,
                category: 'false-positive',
                reason: '误报',
                plannedVersion: '1.1.0',
                tracking: 'x',
                approvedBy: 'x',
                recordedAt: '2026-10-29',
            }],
        })
        expect(() => evaluateAlerts({
            dependabot: [dependabotAlert({ state: 'dismissed', dismissed_reason: 'not_used' })],
            exemptions,
        })).toThrow('必须包含原 dismiss 原因')
    })

    it('dismissed 缺 dismissed_reason 时 false-positive 豁免 fail-closed', () => {
        const exemptions = validateExemptions({
            exemptions: [{
                source: 'dependabot',
                id: 28,
                category: 'false-positive',
                reason: '误报',
                plannedVersion: '1.1.0',
                tracking: 'x',
                approvedBy: 'x',
                recordedAt: '2026-10-29',
            }],
        })
        expect(() => evaluateAlerts({
            dependabot: [dependabotAlert({ state: 'dismissed' })],
            exemptions,
        })).toThrow('缺少 dismissed_reason')
    })

    it('同一告警同时出现在 open 与 dismissed 时报错', () => {
        expect(() => evaluateAlerts({
            dependabot: [dependabotAlert(), dependabotAlert({ state: 'dismissed' })],
        })).toThrow('同时出现在')
    })
})

describe('parseNextLink', () => {
    it('取 rel="next" 的绝对地址', () => {
        expect(parseNextLink('<https://api.github.com/x?after=abc>; rel="next", <https://api.github.com/x?after=z>; rel="last"'))
            .toBe('https://api.github.com/x?after=abc')
        expect(parseNextLink('')).toBeNull()
    })

    it('next 不在首段时仍能识别', () => {
        expect(parseNextLink('<https://api.github.com/x?before=1>; rel="prev", <https://api.github.com/x?after=2>; rel="next"'))
            .toBe('https://api.github.com/x?after=2')
    })
})

describe('默认路径', () => {
    it('REPO_ROOT 指向仓库根，默认豁免文件存在', () => {
        expect(existsSync(join(REPO_ROOT, 'package.json'))).toBe(true)
        expect(existsSync(join(REPO_ROOT, DEFAULT_EXEMPTIONS_PATH))).toBe(true)
    })
})

describe('fetchAlerts', () => {
    it('两类来源各查 open 与 dismissed，共四次', async () => {
        const fetchImpl = mockAlerts()
        await fetchAlerts({ repo: 'o/r', token: 't', fetchImpl })

        const urls = fetchImpl.mock.calls.map(([url]) => url)
        expect(urls).toHaveLength(4)
        expect(urls[0]).toContain('/repos/o/r/dependabot/alerts?state=open')
        expect(urls[1]).toContain('/repos/o/r/dependabot/alerts?state=dismissed')
        expect(urls[2]).toContain('/repos/o/r/code-scanning/alerts?state=open')
        expect(urls[3]).toContain('/repos/o/r/code-scanning/alerts?state=dismissed')
    })

    it('合并两类状态的返回', async () => {
        const fetchImpl = mockAlerts({
            dependabot: [dependabotAlert({ number: 1 })],
            dependabotDismissed: [dependabotAlert({ number: 2, state: 'dismissed' })],
            codeScanning: [codeScanningAlert({ number: 3 })],
            codeScanningDismissed: [codeScanningAlert({ number: 4, state: 'dismissed' })],
        })

        const result = await fetchAlerts({ repo: 'o/r', token: 't', fetchImpl })
        expect(result.dependabot.map((alert) => alert.number)).toEqual([1, 2])
        expect(result.codeScanning.map((alert) => alert.number)).toEqual([3, 4])
    })
})

describe('fetchAllPages', () => {
    it('按 Link 头翻页拉全量并带认证头', async () => {
        const firstPage = Array.from({ length: 100 }, (_, index) => ({ number: index + 1 }))
        const nextUrl = 'https://api.github.com/repos/o/r/dependabot/alerts?state=open&per_page=100&after=abc'
        const fetchImpl = vi.fn()
            .mockResolvedValueOnce(jsonResponse(firstPage, 200, { link: `<${nextUrl}>; rel="next"` }))
            .mockResolvedValueOnce(jsonResponse([{ number: 101 }]))

        const alerts = await fetchAllPages({ path: '/repos/o/r/dependabot/alerts?state=open', token: 't', fetchImpl })

        expect(alerts).toHaveLength(101)
        expect(fetchImpl).toHaveBeenCalledTimes(2)
        const [, init] = fetchImpl.mock.calls[0]
        expect(init.headers.Authorization).toBe('Bearer t')
        expect(fetchImpl.mock.calls[1][0]).toBe(nextUrl)
        expect(fetchImpl.mock.calls[0][0]).not.toMatch(/[?&]page=/)
    })

    it('403 时抛出带权限提示的错误', async () => {
        const fetchImpl = vi.fn().mockResolvedValue(jsonResponse({ message: 'Forbidden' }, 403))
        await expect(fetchAllPages({ path: '/repos/o/r/dependabot/alerts', token: 't', fetchImpl }))
            .rejects.toThrow('SECURITY_ALERTS_TOKEN')
    })

    it('404 按配置错误处理，不静默放行', async () => {
        const fetchImpl = vi.fn().mockResolvedValue(jsonResponse({ message: 'Not Found' }, 404))
        await expect(fetchAllPages({ path: '/repos/o/r/code-scanning/alerts', token: 't', fetchImpl }))
            .rejects.toThrow('未启用')
    })

    it('401 抛出认证错误', async () => {
        const fetchImpl = vi.fn().mockResolvedValue(jsonResponse({ message: 'Bad credentials' }, 401))
        await expect(fetchAllPages({ path: '/repos/o/r/dependabot/alerts', token: 't', fetchImpl }))
            .rejects.toThrow('SECURITY_ALERTS_TOKEN')
    })

    it('分页超过上限时失败', async () => {
        const page = Array.from({ length: 100 }, (_, index) => ({ number: index + 1 }))
        const fetchImpl = vi.fn().mockResolvedValue(jsonResponse(page, 200, { link: '<https://api.github.com/next>; rel="next"' }))
        await expect(fetchAllPages({ path: '/repos/o/r/dependabot/alerts', token: 't', fetchImpl }))
            .rejects.toThrow('上限')
    })
})

describe('loadExemptions', () => {
    it('文件不存在时返回空清单', () => {
        expect(loadExemptions(join(tmpdir(), 'missing-security-exemptions.json')).size).toBe(0)
    })

    it('读取合法文件', () => {
        const dir = mkdtempSync(join(tmpdir(), 'security-exemptions-'))
        const file = join(dir, 'exemptions.json')
        writeFileSync(file, JSON.stringify({
            exemptions: [{
                source: 'code-scanning',
                id: 5,
                category: 'no-fix',
                reason: '规则误报',
                plannedVersion: '1.1.0',
                tracking: 'docs/plan/backlog.md',
                approvedBy: 'CaoMeiYouRen',
                recordedAt: '2026-10-29',
            }],
        }))
        expect(loadExemptions(file).get('code-scanning:5')?.reason).toBe('规则误报')
    })
})

describe('formatReport', () => {
    it('阻塞与豁免均出现在报告中', () => {
        const result = evaluateAlerts({ dependabot: [dependabotAlert()], codeScanning: [codeScanningAlert()] })
        const report = formatReport(result)
        expect(report).toContain('critical 0 / high 2')
        expect(report).toContain('未通过')
        expect(report).toContain('#28')
        expect(report).toContain('#5')
    })
})

describe('formatSummary', () => {
    it('转义表格分隔符，且豁免版本同样转义', () => {
        const result = evaluateAlerts({
            dependabot: [dependabotAlert({ dependency: { package: { name: 'pkg|name' } } })],
            exemptions: validateExemptions({
                exemptions: [{
                    source: 'dependabot',
                    id: 28,
                    category: 'no-fix',
                    reason: '无补丁',
                    plannedVersion: '1.1|0',
                    tracking: 't',
                    approvedBy: 'a',
                    recordedAt: '2026-10-29',
                }],
            }),
        })
        const summary = formatSummary(result)
        expect(summary).toContain('pkg\\|name')
        expect(summary).toContain('1.1\\|0')
        const rows = summary.split('\n').filter((line) => line.startsWith('| dependabot'))
        expect(rows).toHaveLength(1)
        expect(rows.every((line) => line.replaceAll('\\|', '').split('|').length === 8)).toBe(true)
    })
})

describe('main', () => {
    const env = { SECURITY_ALERTS_TOKEN: 'token' }

    it('缺少 token 时返回 2', async () => {
        const exitCode = await main(['--repo=o/r'], { env: {}, fetchImpl: vi.fn() })
        expect(exitCode).toBe(2)
    })

    it('无阻塞项时返回 0', async () => {
        const fetchImpl = mockAlerts()
        await expect(main(['--repo=o/r', '--exemptions=/tmp/not-exist-exemptions.json'], { env, fetchImpl })).resolves.toBe(0)
    })

    it('API 404 时返回 2', async () => {
        const fetchImpl = vi.fn().mockResolvedValue(jsonResponse({ message: 'Not Found' }, 404))
        await expect(main(['--repo=o/r', '--exemptions=/tmp/not-exist-exemptions.json'], { env, fetchImpl })).resolves.toBe(2)
    })

    it('存在 high 时返回 1', async () => {
        const fetchImpl = mockAlerts({ dependabot: [dependabotAlert()] })
        await expect(main(['--repo=o/r', '--exemptions=/tmp/not-exist-exemptions.json'], { env, fetchImpl })).resolves.toBe(1)
    })

    it('dismissed 的 high 仍返回 1', async () => {
        const fetchImpl = mockAlerts({
            dependabotDismissed: [dependabotAlert({ state: 'dismissed', dismissed_reason: 'not_used' })],
        })
        await expect(main(['--repo=o/r', '--exemptions=/tmp/not-exist-exemptions.json'], { env, fetchImpl })).resolves.toBe(1)
    })
})

describe('parseRepoFromRemote', () => {
    it('解析 https / scp / ssh 三种 GitHub remote', () => {
        expect(parseRepoFromRemote('https://github.com/CaoMeiYouRen/caomei-ui.git')).toBe('CaoMeiYouRen/caomei-ui')
        expect(parseRepoFromRemote('https://github.com/CaoMeiYouRen/caomei-ui/')).toBe('CaoMeiYouRen/caomei-ui')
        expect(parseRepoFromRemote('git@github.com:CaoMeiYouRen/caomei-ui.git')).toBe('CaoMeiYouRen/caomei-ui')
        expect(parseRepoFromRemote('ssh://git@github.com/CaoMeiYouRen/caomei-ui.git')).toBe('CaoMeiYouRen/caomei-ui')
    })

    it('非 GitHub / 空值返回 null', () => {
        expect(parseRepoFromRemote('https://gitlab.com/o/r.git')).toBeNull()
        expect(parseRepoFromRemote('')).toBeNull()
        expect(parseRepoFromRemote(undefined)).toBeNull()
    })
})

describe('resolveRepo', () => {
    it('优先级：--repo → GITHUB_REPOSITORY → origin remote', () => {
        expect(resolveRepo('a/b', { env: { GITHUB_REPOSITORY: 'c/d' }, gitRemote: () => 'git@github.com:e/f.git' })).toBe('a/b')
        expect(resolveRepo(undefined, { env: { GITHUB_REPOSITORY: 'c/d' }, gitRemote: () => 'git@github.com:e/f.git' })).toBe('c/d')
        expect(resolveRepo(undefined, { env: {}, gitRemote: () => 'git@github.com:e/f.git' })).toBe('e/f')
    })

    it('三者都不可用时 fail-closed', () => {
        expect(() => resolveRepo(undefined, { env: {}, gitRemote: () => null })).toThrow('缺少仓库标识')
    })
})

describe('assertSecurityGate', () => {
    it('缺少 token 时提示 .env.local 配置方式', async () => {
        await expect(assertSecurityGate({ token: undefined, write: () => {} }))
            .rejects.toThrow('.env.local')
    })

    it('存在 critical / high 时抛错（发布链据此中止）', async () => {
        const fetchImpl = mockAlerts({ dependabot: [dependabotAlert()] })
        await expect(assertSecurityGate({
            repo: 'o/r',
            token: 't',
            exemptionsPath: '/tmp/not-exist-exemptions.json',
            fetchImpl,
            write: () => {},
        })).rejects.toThrow('安全告警门禁未通过')
    })

    it('无阻塞项时返回评估结果', async () => {
        const fetchImpl = mockAlerts()
        const lines = []
        const result = await assertSecurityGate({
            repo: 'o/r',
            token: 't',
            exemptionsPath: '/tmp/not-exist-exemptions.json',
            fetchImpl,
            write: (line) => lines.push(line),
        })
        expect(result.blocking).toHaveLength(0)
        expect(lines[0]).toContain('repo=o/r')
    })

    it('未传 repo 时按 env / gitRemote 解析并打印实际检查的仓库', async () => {
        const fetchImpl = mockAlerts()
        const lines = []
        await assertSecurityGate({
            token: 't',
            env: {},
            gitRemote: () => 'git@github.com:e/f.git',
            exemptionsPath: '/tmp/not-exist-exemptions.json',
            fetchImpl,
            write: (line) => lines.push(line),
        })
        expect(lines[0]).toContain('repo=e/f')
    })
})
