import { mount } from '@vue/test-utils'
import axe from 'axe-core'
import type { Component } from 'vue'
import type { A11yFixture } from './fixtures'
import { buildRuleOptions, summarizeResults, type A11yAuditSummary } from './rules'

/** 挂载后的稳定等待：部分组件在挂载后一帧才渲染 portal / 动画容器。 */
const SETTLE_MS = 30

/**
 * 挂载单个组件夹具 → 跑 axe → 卸载，返回审计摘要。
 *
 * 审计范围是 `document.body`（含 portal 挂载的浮层），并在每次审计后清空 DOM，
 * 避免上一个夹具的残留影响下一个组件的判定。
 */
export async function auditFixture(fixture: A11yFixture, settleMs: number = SETTLE_MS): Promise<A11yAuditSummary> {
    const wrapper = mount(fixture.definition as Component, { attachTo: document.body })
    try {
        await new Promise((resolve) => setTimeout(resolve, settleMs))
        const results = await axe.run(document.body, buildRuleOptions())
        return summarizeResults(fixture.name, results)
    } finally {
        wrapper.unmount()
        document.body.innerHTML = ''
    }
}

/** 逐组件审计并返回全部摘要（顺序与受检面声明一致）。 */
export async function auditAll(fixtures: A11yFixture[]): Promise<A11yAuditSummary[]> {
    const summaries: A11yAuditSummary[] = []
    for (const fixture of fixtures) {
        summaries.push(await auditFixture(fixture))
    }
    return summaries
}
