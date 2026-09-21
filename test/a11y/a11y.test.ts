import { mount } from '@vue/test-utils'
import type { Component } from 'vue'
import { describe, expect, it } from 'vitest'
import { caomeiComponents } from '../../src/nuxt/components'
import { auditFixture } from './audit'
import { A11Y_FIXTURES, A11Y_FIXTURE_BUDGET, COVERED_BY_FIXTURE, EXCLUDED_COMPONENTS, INTERACTION_ONLY_EXPORTS } from './fixtures'
import { DISABLED_RULES } from './rules'

/**
 * 组件级 a11y 审计（axe-core × happy-dom）。
 *
 * 定位：本文件既产出**既有例外清单**（逐组件打印违规 / 待复核项，供治理记录登记），
 * 又守卫**受检面本身**——对外导出穷尽性（对 `caomeiComponents` 机检）、夹具确实渲染、
 * 禁用规则须逐条带理由。「例外外零违规」的门禁断言由后续条目在例外清单登记完成后补上。
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

    it('禁用规则逐条带理由且不重复', () => {
        const ids = DISABLED_RULES.map((rule) => rule.id)
        expect(new Set(ids).size).toBe(ids.length)
        for (const rule of DISABLED_RULES) {
            expect(rule.reason.length, rule.id).toBeGreaterThan(0)
        }
    })
})

describe('夹具渲染完备性', () => {
    it('每个夹具渲染出根组件与声明的子部件', () => {
        for (const fixture of A11Y_FIXTURES) {
            const wrapper = mount(fixture.definition as Component, { attachTo: document.body })
            try {
                const rootCount = wrapper.findAllComponents(fixture.root as Component).length
                expect(rootCount, `${fixture.name} 夹具未渲染其根组件`).toBeGreaterThan(0)

                for (const entry of COVERED_BY_FIXTURE.filter((item) => item.fixture === fixture.name)) {
                    const count = wrapper.findAllComponents(entry.component as Component).length
                    expect(count, `${entry.name} 未被 ${fixture.name} 夹具渲染`).toBeGreaterThan(0)
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
    })
})
