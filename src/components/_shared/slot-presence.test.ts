import { Fragment, h } from 'vue'
import { describe, expect, it } from 'vitest'
import { slotContainsComponent } from './slot-presence'

const Target = { name: 'Target', render: () => h('span') }
const Other = { name: 'Other', render: () => h('span') }

describe('slotContainsComponent', () => {
    it('槽缺席时返回 false', () => {
        expect(slotContainsComponent(undefined, Target)).toBe(false)
    })

    it('直系命中目标组件', () => {
        const slot = () => [h(Other), h(Target)]
        expect(slotContainsComponent(slot, Target)).toBe(true)
    })

    it('目标缺席时返回 false', () => {
        const slot = () => [h(Other), h('div')]
        expect(slotContainsComponent(slot, Target)).toBe(false)
    })

    it('Fragment 展平后仍可命中', () => {
        const slot = () => [h(Fragment, [h(Other), h(Target)])]
        expect(slotContainsComponent(slot, Target)).toBe(true)
    })

    it('带 key 的目标仍可命中', () => {
        const slot = () => [h(Target, { key: 'k' })]
        expect(slotContainsComponent(slot, Target)).toBe(true)
    })
})
