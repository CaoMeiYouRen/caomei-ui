import { describe, expect, it } from 'vitest'
import {
    DEFAULT_PORT,
    DEFAULT_RULES,
    PAGES,
    evaluateOutcome,
    formatReport,
    parseOptions,
    resolveReportPath,
    selectPages,
    splitList,
    waitForServer,
} from './check-docs-axe.mjs'

const minimalPage = PAGES.find((page) => page.key === 'select-zh')

describe('check-docs-axe 参数解析', () => {
    it('缺省取全矩阵与两条 WCAG 规则', () => {
        const options = parseOptions(['node', 'check-docs-axe.mjs'])
        expect(options.pages).toEqual(PAGES)
        expect(options.rules).toEqual(DEFAULT_RULES)
        expect(options.port).toBe(DEFAULT_PORT)
        expect(options.baseUrl).toBeNull()
        expect(options.report).toBeNull()
    })

    it('--pages 支持 key 与站点路径，且保持矩阵顺序', () => {
        expect(selectPages(['showcase-zh', '/components/select'])).toEqual([
            PAGES.find((page) => page.key === 'select-zh'),
            PAGES.find((page) => page.key === 'showcase-zh'),
        ])
    })

    it('未知页面 fail-closed 并给出可选清单', () => {
        expect(() => selectPages(['nope'])).toThrow(/未知页面：nope/)
        expect(() => selectPages(['nope'])).toThrow(/select-zh/)
    })

    it('空清单 fail-closed（防受检面静默归零）', () => {
        expect(() => splitList('', DEFAULT_RULES, '--rules')).toThrow(/不得为空/)
        expect(() => splitList(', ,', DEFAULT_RULES, '--rules')).toThrow(/不得为空/)
    })

    it('清单去空白、去重并保持输入顺序', () => {
        expect(splitList(' button-name, button-name ,scrollable-region-focusable ', [], '--rules')).toEqual([
            'button-name',
            'scrollable-region-focusable',
        ])
    })

    it('端口与 base-url 非法时抛错', () => {
        expect(() => parseOptions(['node', 'x', '--port=abc'])).toThrow()
        expect(() => parseOptions(['node', 'x', '--port=70000'])).toThrow(/--port 非法/)
        expect(() => parseOptions(['node', 'x', '--base-url=ftp://example.com'])).toThrow(/http\(s\)/)
    })

    it('base-url 去掉尾部斜杠', () => {
        expect(parseOptions(['node', 'x', '--base-url=http://127.0.0.1:4173/']).baseUrl).toBe('http://127.0.0.1:4173')
    })
})

describe('check-docs-axe 判定', () => {
    it('零违规且受检面达标时通过', () => {
        const outcome = evaluateOutcome([{ page: minimalPage, subjects: minimalPage.minSubjects, violations: [], passes: { 'button-name': 17 } }])
        expect(outcome).toEqual({ ok: true, violations: 0, failures: [] })
    })

    it('违规即失败并汇总条数', () => {
        const outcome = evaluateOutcome([
            {
                page: minimalPage,
                subjects: minimalPage.minSubjects,
                violations: [{ id: 'button-name', impact: 'critical', targets: ['button'] }],
                passes: { 'button-name': 17 },
            },
        ])
        expect(outcome.ok).toBe(false)
        expect(outcome.violations).toBe(1)
        expect(outcome.failures[0]).toBe('1 项 axe 违规')
    })

    it('受检面低于下界即失败（防示例被删 / 页面未渲染被静默通过）', () => {
        const outcome = evaluateOutcome([{ page: minimalPage, subjects: minimalPage.minSubjects - 1, violations: [], passes: { 'button-name': 17 } }])
        expect(outcome.ok).toBe(false)
        expect(outcome.failures[0]).toContain('受检面收窄')
        expect(outcome.failures[0]).toContain(String(minimalPage.minSubjects))
    })

    it('违规节点同样计入适用节点（不误报「规则未生效」）', () => {
        const outcome = evaluateOutcome([
            {
                page: minimalPage,
                subjects: minimalPage.minSubjects,
                violations: [{ id: 'button-name', impact: 'critical', targets: ['button'] }],
                passes: { 'button-name': 4 },
                violationNodes: { 'button-name': 17 },
            },
        ])
        expect(outcome.ok).toBe(false)
        expect(outcome.failures).toEqual(['1 项 axe 违规'])
        expect(outcome.failures.join('')).not.toContain('规则未生效')
    })

    it('--rules 收窄时跳过未审计规则的下界', () => {
        const dataTable = PAGES.find((page) => page.key === 'data-table')
        const outcome = evaluateOutcome(
            [{ page: dataTable, subjects: dataTable.minSubjects, violations: [], passes: {} }],
            ['button-name'],
        )
        expect(outcome.ok).toBe(true)
    })

    it('登记规则适用节点低于下界即失败（防规则不适用被当成零违规）', () => {
        const outcome = evaluateOutcome([{ page: minimalPage, subjects: minimalPage.minSubjects, violations: [], passes: { 'button-name': 0 } }])
        expect(outcome.ok).toBe(false)
        expect(outcome.failures[0]).toContain('规则未生效')
        expect(outcome.failures[0]).toContain('button-name')
    })
})

describe('check-docs-axe 预览服务器与报告路径', () => {
    it('waitForServer 轮询直到探测成功', async () => {
        let attempts = 0
        await waitForServer('http://127.0.0.1:1', {
            timeoutMs: 1_000,
            probe: async () => {
                attempts += 1
                if (attempts < 3) {
                    throw new Error('not ready')
                }
            },
            sleep: async () => {},
        })
        expect(attempts).toBe(3)
    })

    it('waitForServer 超时 fail-closed', async () => {
        await expect(waitForServer('http://127.0.0.1:1', {
            timeoutMs: 20,
            probe: async () => {
                throw new Error('not ready')
            },
            sleep: async () => {
                await new Promise((resolvePromise) => setTimeout(resolvePromise, 5))
            },
        })).rejects.toThrow(/未就绪/)
    })

    it('--report 允许仓库内路径、拒绝越界路径', () => {
        expect(resolveReportPath('/repo', 'test-results/docs-axe/report.json')).toBe('/repo/test-results/docs-axe/report.json')
        expect(resolveReportPath('/repo', '..foo/report.json')).toBe('/repo/..foo/report.json')
        expect(() => resolveReportPath('/repo', '../outside.json')).toThrow(/必须落在仓库内/)
        expect(() => resolveReportPath('/repo', '/tmp/outside.json')).toThrow(/必须落在仓库内/)
    })
})

describe('check-docs-axe 报告', () => {
    it('按页输出状态、受检元素数与违规目标', () => {
        const report = formatReport({
            rules: ['button-name'],
            entries: [
                { page: minimalPage, subjects: minimalPage.minSubjects, violations: [] },
                {
                    page: PAGES.find((page) => page.key === 'showcase-zh'),
                    subjects: 9,
                    violations: [{ id: 'button-name', impact: 'critical', targets: ['button.select'] }],
                    violationNodes: { 'button-name': 1 },
                },
            ],
        })
        expect(report).toContain('规则面：button-name')
        expect(report).toContain(`${minimalPage.path} → OK`)
        expect(report).toContain('/components/showcase → FAIL（1）')
        expect(report).toContain('规则节点：button-name：通过 0 / 违规 1 / 待复核 0')
        expect(report).toContain('button-name（critical）：button.select')
    })
})
