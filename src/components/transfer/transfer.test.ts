import { mount } from '@vue/test-utils'
import { defineComponent, h, nextTick, ref } from 'vue'
import { describe, expect, it } from 'vitest'
import type { TransferValue } from './types'
import { CaomeiTransfer } from './index'

const dataSource = [
    { label: 'Apple', value: 'apple' },
    { label: 'Banana', value: 'banana' },
    { label: 'Cherry', value: 'cherry', disabled: true },
]

function mountTransfer(initial: TransferValue[] = [], extra: Record<string, unknown> = {}) {
    const model = ref<TransferValue[]>(initial)
    const wrapper = mount(defineComponent({
        setup() {
            return () => h(CaomeiTransfer, {
                modelValue: model.value,
                'onUpdate:modelValue': (value: TransferValue[]) => {
                    model.value = value
                },
                dataSource,
                ...extra,
            })
        },
    }))
    return { wrapper, model }
}

describe('CaomeiTransfer', () => {
    it('按模型拆分左右列表并渲染数量', () => {
        const { wrapper } = mountTransfer(['apple'])

        expect(wrapper.findAll('.caomei-transfer__panel')[0].text()).not.toContain('Apple')
        expect(wrapper.findAll('.caomei-transfer__panel')[1].text()).toContain('Apple')
        expect(wrapper.findAll('.caomei-transfer__count').map((node) => node.text())).toEqual(['2', '1'])
    })

    it('勾选后移到右侧，再勾选移回左侧', async () => {
        const { wrapper, model } = mountTransfer()

        const leftCheckbox = wrapper.findAll('.caomei-transfer__panel')[0].find('input[type="checkbox"]')
        await leftCheckbox.setValue(true)
        await wrapper.findAll('.caomei-transfer__button')[0].trigger('click')
        await nextTick()

        expect(model.value).toEqual(['apple'])

        const rightCheckbox = wrapper.findAll('.caomei-transfer__panel')[1].find('input[type="checkbox"]')
        await rightCheckbox.setValue(true)
        await wrapper.findAll('.caomei-transfer__button')[1].trigger('click')
        await nextTick()

        expect(model.value).toEqual([])
    })

    it('搜索过滤左右列表', async () => {
        const { wrapper } = mountTransfer()

        await wrapper.findAll('.caomei-transfer__search')[0].setValue('ban')
        await nextTick()

        const leftPanel = wrapper.findAll('.caomei-transfer__panel')[0]
        expect(leftPanel.text()).toContain('Banana')
        expect(leftPanel.text()).not.toContain('Apple')
    })

    it('禁用项不可勾选，禁用态下移动按钮不可用', () => {
        const { wrapper } = mountTransfer([], { disabled: true })

        const checkboxes = wrapper.findAll('.caomei-transfer__panel')[0].findAll('input[type="checkbox"]')
        expect(checkboxes.every((node) => node.attributes('disabled') !== undefined)).toBe(true)
        expect(wrapper.findAll('.caomei-transfer__button').every((node) => node.attributes('disabled') !== undefined)).toBe(true)
    })
})
