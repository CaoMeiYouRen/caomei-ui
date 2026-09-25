import { mount } from '@vue/test-utils'
import type { Component } from 'vue'
import { describe, expect, it } from 'vitest'
import { caomeiComponents } from '../../src/nuxt/components'
import { auditFixture } from './audit'
import { A11Y_EXCEPTIONS, exceptionKey } from './exceptions'
import { A11Y_FIXTURES, A11Y_FIXTURE_BUDGET, COVERED_BY_FIXTURE, EXCLUDED_COMPONENTS, INTERACTION_ONLY_EXPORTS } from './fixtures'
import { DISABLED_RULES } from './rules'

/**
 * 组件级 a11y 审计（axe-core × happy-dom）。
 *
 * 定位：本文件**消费并机检** `exceptions.ts` 的既有例外清单（逐组件打印违规 / 待复核项供对账），
 * 又守卫**受检面本身**——对外导出穷尽性（对 `caomeiComponents` 机检）、夹具确实渲染、
 * 禁用规则须逐条带理由；并**以已裁定的例外清单为门禁**：例外外零违规，且登记的例外必须仍然命中
 * （防止清单腐烂成永久豁免）。该断言随 `pnpm test` 进入 `pnpm verify` 与 CI 合并门禁。
 */

/** 受检面四组的登记名（穷尽性机检用）。 */
function declaredGroups(): { fixture: string[], covered: string[], interaction: string[], excluded: string[] } {
    return {
        fixture: A11Y_FIXTURES.map((entry) => entry.name),
        covered: COVERED_BY_FIXTURE.map((entry) => entry.name),
        interaction: INTERACTION_ONLY_EXPORTS.map((entry) => entry.name),
        excluded: EXCLUDED_COMPONENTS.map((entry) => entry.name),
    }
}

describe('a11y 受检面', () => {
    it('夹具名唯一且与预算一致', () => {
        const names = A11Y_FIXTURES.map((fixture) => fixture.name)
        expect(new Set(names).size).toBe(names.length)
        expect(names).toHaveLength(A11Y_FIXTURE_BUDGET)
    })

    it('受检面穷尽全部对外导出，四组之间不重复登记', () => {
        const groups = declaredGroups()
        const all = Object.values(groups).flat()
        expect(new Set(all).size).toBe(all.length)

        const missing = caomeiComponents.filter((name) => !all.includes(name))
        expect(missing, `未登记的对外导出：${missing.join(', ')}`).toEqual([])

        // 反向：登记表不得出现非对外导出名（拼错 / 改名会在这里直报，而非靠算术推断）
        const unknown = all.filter((name) => !(caomeiComponents as readonly string[]).includes(name))
        expect(unknown, `登记了非对外导出名：${unknown.join(', ')}`).toEqual([])
    })

    it('「由夹具组合渲染」的声明指向已登记的夹具', () => {
        const fixtureNames = A11Y_FIXTURES.map((fixture) => fixture.name)
        for (const entry of COVERED_BY_FIXTURE) {
            expect(fixtureNames, `${entry.name} 的 fixture 字段未指向已登记夹具`).toContain(entry.fixture)
        }
    })

    it('每个夹具声明根组件，且每项登记都带理由', () => {
        for (const fixture of A11Y_FIXTURES) {
            expect(fixture.root, fixture.name).toBeTruthy()
        }
        for (const entry of [...COVERED_BY_FIXTURE, ...INTERACTION_ONLY_EXPORTS, ...EXCLUDED_COMPONENTS]) {
            expect(entry.name.length).toBeGreaterThan(0)
        }
        for (const entry of [...INTERACTION_ONLY_EXPORTS, ...EXCLUDED_COMPONENTS]) {
            expect(entry.reason.length, entry.name).toBeGreaterThan(0)
        }
    })

    it('例外清单的组件均已登记且键唯一', () => {
        const fixtureNames = A11Y_FIXTURES.map((fixture) => fixture.name)
        const keys = A11Y_EXCEPTIONS.map((entry) => exceptionKey(entry.component, entry.kind, entry.rule))
        expect(new Set(keys).size).toBe(keys.length)
        for (const entry of A11Y_EXCEPTIONS) {
            expect(fixtureNames, `${entry.component} 的例外未指向受检夹具`).toContain(entry.component)
            expect(entry.judgment.length, entry.rule).toBeGreaterThan(0)
        }
    })

    it('禁用规则逐条带理由且不重复', () => {
        const ids = DISABLED_RULES.map((rule) => rule.id)
        expect(new Set(ids).size).toBe(ids.length)
        for (const rule of DISABLED_RULES) {
            expect(rule.reason.length, rule.id).toBeGreaterThan(0)
        }
    })
})

describe('夹具渲染完备性', () => {
    it('每个夹具渲染出根组件与声明的子部件', async () => {
        for (const fixture of A11Y_FIXTURES) {
            const wrapper = mount(fixture.definition as Component, { attachTo: document.body })
            try {
                // 面板类夹具经 Presence / Portal 挂载，部件在挂载后一帧才就位
                await new Promise((resolve) => setTimeout(resolve, 30))
                const rootCount = wrapper.findAllComponents(fixture.root as Component).length
                expect(rootCount, `${fixture.name} 夹具未渲染其根组件`).toBeGreaterThan(0)

                for (const entry of COVERED_BY_FIXTURE.filter((item) => item.fixture === fixture.name)) {
                    const count = wrapper.findAllComponents(entry.component as Component).length
                    expect(count, `${entry.name} 未被 ${fixture.name} 夹具渲染`).toBeGreaterThan(0)
                }

                // 关键元素（面板部件 / 内部交互控件）必须进入审计 DOM（含 portal 挂载面，故按 body 查询）
                for (const selector of fixture.requiredSelectors ?? []) {
                    expect(
                        document.body.querySelector(selector),
                        `${fixture.name} 未渲染关键元素 ${selector}`,
                    ).not.toBeNull()
                }
            } finally {
                wrapper.unmount()
                document.body.innerHTML = ''
            }
        }
    })
})

describe('组件级 axe 审计', () => {
    it.each(A11Y_FIXTURES.map((fixture) => [fixture.name, fixture] as const))('%s', async (name, fixture) => {
        const summary = await auditFixture(fixture)

        console.info(`[a11y] ${name} V=${summary.violations.length} I=${summary.incomplete.length} P=${summary.passes}`)
        for (const finding of summary.violations) {
            console.info(`   V ${finding.id} (${finding.impact}) x${finding.count} :: ${finding.target}`)
        }
        for (const finding of summary.incomplete) {
            console.info(`   I ${finding.id} x${finding.count} :: ${finding.target}`)
        }

        // 审计确实执行（未因挂载失败 / 环境问题空转）；`passes` 只证明 axe 跑过，
        // 「覆盖是否充分」由「夹具渲染完备性」与清单逐条对账承担
        expect(summary.passes, `${name} 未产出任何通过项`).toBeGreaterThan(0)

        // 门禁：例外外零违规 / 零待复核
        const allowed = A11Y_EXCEPTIONS.filter((entry) => entry.component === name)
        for (const [kind, findings] of [['violation', summary.violations], ['incomplete', summary.incomplete]] as const) {
            const unexpected = findings.filter((finding) => !allowed.some((entry) => entry.kind === kind && entry.rule === finding.id))
            expect(
                unexpected.map((finding) => `${finding.id} x${finding.count} :: ${finding.target}`),
                `${name} 出现未登记的 ${kind}（须先裁定并登记例外清单）`,
            ).toEqual([])
        }

        // 反向：登记的例外必须仍然命中，且命中节点数与登记一致（修复落地 / 命中面变化后须重新裁定）
        for (const entry of allowed) {
            const findings = entry.kind === 'violation' ? summary.violations : summary.incomplete
            const matched = findings.find((finding) => finding.id === entry.rule)
            expect(matched, `${name} 的已登记例外 ${entry.rule} 未再命中：请重新裁定并更新例外清单`).toBeTruthy()
            expect(matched?.count, `${name} 的已登记例外 ${entry.rule} 命中节点数由 ${entry.count} 变为 ${matched?.count}：请重新裁定`).toBe(entry.count)
        }
    })
})
