import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import {
    DEFAULT_PORT,
    DEFAULT_RULES,
    OPEN_STATE_RULES,
    PAGES,
    evaluateOutcome,
    formatReport,
    openSurface,
    pageRules,
    parseOptions,
    resolveReportPath,
    selectPages,
    splitList,
    validatePages,
    waitForServer,
} from './check-docs-axe.mjs'

const minimalPage = PAGES.find((page) => page.key === 'select-zh')

const projectRoot = join(dirname(fileURLToPath(import.meta.url)), '..', '..')

describe('check-docs-axe 受检面文档同步', () => {
    it('§17 声明的条目数与路径数与 PAGES 实算一致', () => {
        const doc = readFileSync(join(projectRoot, 'docs/design/documentation-site.md'), 'utf8')
        const match = doc.match(/默认矩阵 (\d+) 条目 \/ (\d+) 个页面路径/)
        expect(match, '§17 缺少「默认矩阵 N 条目 / M 个页面路径」声明').not.toBeNull()
        expect(Number(match[1])).toBe(PAGES.length)
        expect(Number(match[2])).toBe(new Set(PAGES.map((page) => page.path)).size)
    })
})

describe('check-docs-axe 参数解析', () => {
    it('缺省取全矩阵且不收窄规则面', () => {
        const options = parseOptions(['node', 'check-docs-axe.mjs'])
        expect(options.pages).toEqual(PAGES)
        // null = 未显式收窄：各页跑「默认 ∪ 页面登记」的全集（收窄会把打开态规则一并剪掉）
        expect(options.rules).toBeNull()
        expect(options.port).toBe(DEFAULT_PORT)
        expect(options.baseUrl).toBeNull()
        expect(options.report).toBeNull()
    })

    it('--pages 支持 key 与站点路径，且保持矩阵顺序', () => {
        expect(selectPages(['showcase-zh', '/components/select'])).toEqual([
            PAGES.find((page) => page.key === 'select-zh'),
            PAGES.find((page) => page.key === 'select-open-zh'),
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
        expect(report).toContain('规则面（本轮）：button-name')
        // 未收窄时表头须覆盖各页实际规则面（默认 ∪ 打开态），否则控制台会低估受检面
        expect(formatReport({ rules: null, entries: [] })).toContain('aria-allowed-attr')
        expect(report).toContain(`${minimalPage.path} → OK`)
        expect(report).toContain('/components/showcase → FAIL（1）')
        expect(report).toContain('规则节点：button-name：通过 0 / 违规 1 / 待复核 0')
        expect(report).toContain('button-name（critical）：button.select')
    })
})

describe('check-docs-axe 打开态', () => {
    const dialogPage = PAGES.find((page) => page.key === 'dialog-open')
    const selectOpenPage = PAGES.find((page) => page.key === 'select-open-zh')

    it('页面规则面 = 默认 ∪ 页面登记，`--rules` 收窄时取交集', () => {
        expect(pageRules(dialogPage)).toEqual([...DEFAULT_RULES, ...OPEN_STATE_RULES])
        expect(pageRules(dialogPage, ['aria-dialog-name'])).toEqual(['aria-dialog-name'])
        expect(pageRules(PAGES.find((page) => page.key === 'data-table'))).toEqual(DEFAULT_RULES)
    })

    it('打开态页面登记了 interact，闭合页面没有', () => {
        expect(dialogPage.interact?.open).toBe('.caomei-dialog__content')
        expect(selectOpenPage.interact?.open).toBe('.caomei-select__content')
        expect(PAGES.find((page) => page.key === 'select-zh').interact).toBeUndefined()
    })

    it('Select 打开态登记 aria-hidden-focus（面板外补 inert，规则不再被排除）', () => {
        expect(selectOpenPage.rules).toContain('aria-hidden-focus')
        expect(dialogPage.rules).toContain('aria-hidden-focus')
    })

    it('矩阵自检拒绝缺 open 的 interact', () => {
        expect(() => validatePages([{ key: 'x', path: '/x', ready: '.x', minSubjects: 1, interact: { trigger: '.x' } }]))
            .toThrow(/必须同时给出 trigger 与 open/)
    })

    it('矩阵自检拒绝「登记规则但没有 interact」的页面', () => {
        expect(() => validatePages([{ key: 'x', path: '/x', ready: '.x', minSubjects: 1, rules: ['aria-dialog-name'] }]))
            .toThrow(/没有 interact/)
    })

    it('矩阵自检拒绝重复 key，但允许同一路径的闭合态与打开态并存', () => {
        expect(() => validatePages([dialogPage, { ...dialogPage }])).toThrow(/key 重复/)
        expect(() => validatePages([PAGES[1], PAGES.find((page) => page.key === 'select-open-zh')])).not.toThrow()
        expect(validatePages()).toBeUndefined()
    })

    it('打开态建立成功时静默返回', async () => {
        const clicked = []
        await openSurface({
            locator: (selector) => ({ first: () => ({ click: async () => clicked.push(selector) }) }),
            waitForSelector: async () => undefined,
            waitForTimeout: async () => undefined,
        }, dialogPage)
        expect(clicked).toEqual([dialogPage.interact.trigger])
    })

    it('打开态未出现时 fail-closed 并点名页面与选择器', async () => {
        await expect(openSurface({
            locator: () => ({ first: () => ({ click: async () => undefined }) }),
            waitForSelector: async () => {
                throw new Error('timeout')
            },
            waitForTimeout: async () => undefined,
        }, dialogPage)).rejects.toThrow(/打开态未建立.*caomei-dialog__content/)
    })

    it('打开态规则的适用节点低于下界即失败', () => {
        const outcome = evaluateOutcome([
            {
                page: dialogPage,
                subjects: dialogPage.minSubjects,
                violations: [],
                passes: { 'button-name': 3, 'aria-allowed-attr': 1, 'aria-dialog-name': 0 },
            },
        ])
        expect(outcome.ok).toBe(false)
        expect(outcome.failures[0]).toContain('aria-dialog-name')
    })

    it('`--rules` 未覆盖打开态规则时跳过其下界（未跑不判定）', () => {
        const outcome = evaluateOutcome(
            [{ page: dialogPage, subjects: dialogPage.minSubjects, violations: [], passes: { 'button-name': 3 } }],
            ['button-name'],
        )
        expect(outcome.ok).toBe(true)
    })

    it('打开态建立时校验「可见」与超时上限（不只等元素挂载）', async () => {
        const calls = []
        await openSurface({
            locator: () => ({ first: () => ({ click: async () => undefined }) }),
            waitForSelector: async (selector, options) => calls.push({ selector, options }),
            waitForTimeout: async () => undefined,
        }, dialogPage)
        expect(calls).toHaveLength(1)
        expect(calls[0].selector).toBe(dialogPage.interact.open)
        expect(calls[0].options).toMatchObject({ state: 'visible' })
        expect(calls[0].options.timeout).toBeGreaterThan(0)
    })

    it('点击失败也归入「打开态未建立」口径并保留原始错误', async () => {
        await expect(openSurface({
            locator: () => ({ first: () => ({ click: async () => {
                throw new Error('not attached')
            } }) }),
            waitForSelector: async () => undefined,
            waitForTimeout: async () => undefined,
        }, dialogPage)).rejects.toThrow(/打开态未建立：点击 .*not attached/)
    })

    it('矩阵为空即 fail-closed（防零页零违规通过）', () => {
        expect(() => validatePages([])).toThrow(/页面矩阵为空/)
    })

    it('path / ready 缺失或 minSubjects 非正整数即 fail-closed', () => {
        expect(() => validatePages([{ key: 'x', path: '', ready: '.x', minSubjects: 1 }]))
            .toThrow(/缺少 path/)
        expect(() => validatePages([{ key: 'x', path: '/x', ready: '', minSubjects: 1 }]))
            .toThrow(/缺少 ready/)
        expect(() => validatePages([{ key: 'x', path: '/x', ready: '.x', minSubjects: 0 }]))
            .toThrow(/minSubjects 必须为正整数/)
    })

    it('rules 含未登记规则 id 即 fail-closed（axe 对未知 id 静默忽略）', () => {
        expect(() => validatePages([
            { key: 'x', path: '/x', ready: '.x', minSubjects: 1, rules: ['aria-dialog-nam'], interact: { trigger: '.t', open: '.o' } },
        ])).toThrow(/含未登记规则/)
    })

    it('minApplies 的值必须是正整数', () => {
        expect(() => validatePages([
            { key: 'x', path: '/x', ready: '.x', minSubjects: 1, minApplies: { 'button-name': 0 } },
        ])).toThrow(/必须为正整数/)
    })

    it('minApplies 登记了本页不跑的规则即 fail-closed', () => {
        expect(() => validatePages([
            { key: 'x', path: '/x', ready: '.x', minSubjects: 1, minApplies: { 'aria-dialog-name': 1 } },
        ])).toThrow(/minApplies 登记了本页不跑的规则：aria-dialog-name/)
    })

    it('页级规则面被 `--rules` 收成空集即 fail-closed', () => {
        expect(() => pageRules(PAGES.find((page) => page.key === 'data-table'), ['aria-dialog-name']))
            .toThrow(/规则面为空/)
    })

    it('报告标出打开态与待复核计入适用节点', () => {
        const report = formatReport({
            rules: null,
            entries: [{
                page: dialogPage,
                subjects: dialogPage.minSubjects,
                violations: [],
                passes: { 'button-name': 3, 'aria-dialog-name': 1 },
                incomplete: { 'aria-hidden-focus': 1 },
            }],
        })
        expect(report).toContain('打开态已建立（打开对话框）')
        expect(report).toContain('aria-hidden-focus：通过 0 / 违规 0 / 待复核 1')
    })
})
