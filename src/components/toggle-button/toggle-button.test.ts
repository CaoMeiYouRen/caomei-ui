import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { CaomeiToggleButton } from './index'

function controlledProps(value: boolean) {
    return { modelValue: value, 'onUpdate:modelValue': vi.fn() }
}

describe('CaomeiToggleButton', () => {
    it('默认渲染未按下状态的按钮', () => {
        const wrapper = mount(CaomeiToggleButton)

        const button = wrapper.get('.caomei-toggle-button')
        expect(button.element.tagName).toBe('BUTTON')
        expect(button.attributes('type')).toBe('button')
        expect(button.attributes('aria-pressed')).toBe('false')
        expect(button.attributes('data-state')).toBe('off')
        expect(button.classes()).toContain('caomei-toggle-button--md')
    })

    it('未绑定 v-model 时点击切换内部按下态', async () => {
        const wrapper = mount(CaomeiToggleButton)

        await wrapper.get('.caomei-toggle-button').trigger('click')

        const button = wrapper.get('.caomei-toggle-button')
        expect(button.attributes('aria-pressed')).toBe('true')
        expect(button.attributes('data-state')).toBe('on')
        expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([true])
    })

    it('受控时点击抛出 update:modelValue', async () => {
        const wrapper = mount(CaomeiToggleButton, { props: controlledProps(false) })

        await wrapper.get('.caomei-toggle-button').trigger('click')

        expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([true])
    })

    it('受控为按下态时输出 aria-pressed=true', () => {
        const wrapper = mount(CaomeiToggleButton, { props: controlledProps(true) })

        const button = wrapper.get('.caomei-toggle-button')
        expect(button.attributes('aria-pressed')).toBe('true')
        expect(button.attributes('data-state')).toBe('on')
    })

    it('受控未回写时 DOM 保持原状', async () => {
        const wrapper = mount(CaomeiToggleButton, { props: controlledProps(false) })

        await wrapper.get('.caomei-toggle-button').trigger('click')

        expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([true])
        expect(wrapper.get('.caomei-toggle-button').attributes('aria-pressed')).toBe('false')
    })

    it('再次点击可从按下态切回', async () => {
        const wrapper = mount(CaomeiToggleButton, { props: controlledProps(true) })

        await wrapper.get('.caomei-toggle-button').trigger('click')

        expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([false])
    })

    it('禁用时设置 disabled 且点击不更新', async () => {
        const wrapper = mount(CaomeiToggleButton, { props: { disabled: true } })

        const button = wrapper.get('.caomei-toggle-button')
        expect(button.attributes('disabled')).toBeDefined()
        expect(button.attributes('data-disabled')).toBeDefined()

        await button.trigger('click')
        expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    })

    it.each(['sm', 'md', 'lg'] as const)('应用尺寸类 %s', (size) => {
        const wrapper = mount(CaomeiToggleButton, { props: { size } })

        expect(wrapper.get('.caomei-toggle-button').classes()).toContain(`caomei-toggle-button--${size}`)
    })

    it('label 属性映射 aria-label', () => {
        const wrapper = mount(CaomeiToggleButton, { props: { label: '加粗' } })

        expect(wrapper.get('.caomei-toggle-button').attributes('aria-label')).toBe('加粗')
    })

    it('未提供 label 时不输出 aria-label', () => {
        const wrapper = mount(CaomeiToggleButton, {
            slots: { default: '加粗' },
        })

        expect(wrapper.get('.caomei-toggle-button').attributes('aria-label')).toBeUndefined()
    })

    it('label 属性优先于透传的 aria-label', () => {
        const wrapper = mount(CaomeiToggleButton, {
            props: { label: '属性名' },
            attrs: { 'aria-label': '透传名' },
        })

        expect(wrapper.get('.caomei-toggle-button').attributes('aria-label')).toBe('属性名')
    })

    it('渲染默认插槽内容', () => {
        const wrapper = mount(CaomeiToggleButton, {
            slots: { default: '<span data-test="icon">B</span>' },
        })

        expect(wrapper.find('[data-test="icon"]').exists()).toBe(true)
    })

    it('class 留在根元素，其余属性透传到根元素', () => {
        const wrapper = mount(CaomeiToggleButton, {
            attrs: { class: 'custom', 'data-test': 'toggle' },
        })

        const button = wrapper.get('.caomei-toggle-button')
        expect(button.classes()).toContain('custom')
        expect(button.attributes('data-test')).toBe('toggle')
    })
})
