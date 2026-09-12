import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import { nextTick } from 'vue'
import { CaomeiSelect } from './index'

afterEach(() => {
    document.body.style.overflow = ''
    document.body.style.pointerEvents = ''
    document.body.style.paddingRight = ''
    document.body.style.marginRight = ''
})

const options = [
    { label: '苹果', value: 'apple' },
    { label: '香蕉', value: 'banana' },
    { label: '樱桃', value: 'cherry', disabled: true },
]

describe('CaomeiSelect', () => {
    it('无值时显示占位文本', () => {
        const wrapper = mount(CaomeiSelect, {
            props: { options, placeholder: '请选择' },
        })

        expect(wrapper.get('.caomei-select').text()).toContain('请选择')
    })

    it('有值时显示对应选项文本', () => {
        const wrapper = mount(CaomeiSelect, {
            props: { options, modelValue: 'banana', placeholder: '请选择' },
        })

        expect(wrapper.get('.caomei-select').text()).toContain('香蕉')
    })

    it('值不在选项中时回退到占位文本', () => {
        const wrapper = mount(CaomeiSelect, {
            props: { options, modelValue: 'unknown', placeholder: '请选择' },
        })

        expect(wrapper.get('.caomei-select').text()).toContain('请选择')
    })

    it.each(['sm', 'md', 'lg'] as const)('应用尺寸样式 %s', (size) => {
        const wrapper = mount(CaomeiSelect, { props: { options, size } })
        expect(wrapper.get('.caomei-select').classes()).toContain(`caomei-select--${size}`)
    })

    it('invalid 时标注 aria-invalid 并应用错误样式', () => {
        const wrapper = mount(CaomeiSelect, { props: { options, invalid: true } })

        const trigger = wrapper.get('.caomei-select')
        expect(trigger.attributes('aria-invalid')).toBe('true')
        expect(trigger.classes()).toContain('caomei-select--invalid')
    })

    it('disabled 时禁用触发器并应用禁用样式', () => {
        const wrapper = mount(CaomeiSelect, { props: { options, disabled: true } })

        const trigger = wrapper.get('.caomei-select')
        expect(trigger.attributes('disabled')).toBeDefined()
        expect(trigger.classes()).toContain('caomei-select--disabled')
    })

    it('label 映射为 aria-label', () => {
        const wrapper = mount(CaomeiSelect, { props: { options, label: '水果' } })
        expect(wrapper.get('.caomei-select').attributes('aria-label')).toBe('水果')
    })

    it('透传 id 与原生属性', () => {
        const wrapper = mount(CaomeiSelect, {
            props: { options, id: 'fruit-select' },
            attrs: { 'data-test': 'select' },
        })

        const trigger = wrapper.get('.caomei-select')
        expect(trigger.attributes('id')).toBe('fruit-select')
        expect(trigger.attributes('data-test')).toBe('select')
    })

    it('合并透传的 class', () => {
        const wrapper = mount(CaomeiSelect, {
            props: { options },
            attrs: { class: 'custom-select' },
        })

        expect(wrapper.get('.caomei-select').classes()).toContain('custom-select')
    })

    it('options 为空时不渲染任何选项且不报错', () => {
        const wrapper = mount(CaomeiSelect, { props: { options: [] } })
        expect(wrapper.find('[role="option"]').exists()).toBe(false)
    })

    it('透传 name 生成用于表单提交的原生 select', () => {
        const wrapper = mount(CaomeiSelect, { props: { options, name: 'fruit' } })
        expect(wrapper.find('select[name="fruit"]').exists()).toBe(true)
    })

    it('展开后渲染选项并标记禁用项', async () => {
        const wrapper = mount(CaomeiSelect, {
            props: { options },
            attachTo: document.body,
        })

        await wrapper.get('.caomei-select').trigger('keydown', { key: 'Enter' })
        await nextTick()

        const rendered = document.querySelectorAll('[role="option"]')
        expect(rendered).toHaveLength(3)
        expect(rendered[0].textContent).toContain('苹果')
        expect(rendered[2].hasAttribute('data-disabled')).toBe(true)

        wrapper.unmount()
    })

    it('展开时默认不锁定页面滚动', async () => {
        const wrapper = mount(CaomeiSelect, {
            props: { options },
            attachTo: document.body,
        })

        await wrapper.get('.caomei-select').trigger('keydown', { key: 'Enter' })
        await nextTick()
        await nextTick()

        expect(document.body.style.overflow).not.toBe('hidden')

        wrapper.unmount()
    })

    it('bodyLock 开启时锁定页面滚动', async () => {
        const wrapper = mount(CaomeiSelect, {
            props: { options, bodyLock: true },
            attachTo: document.body,
        })

        await wrapper.get('.caomei-select').trigger('keydown', { key: 'Enter' })
        await nextTick()
        await nextTick()

        expect(document.body.style.overflow).toBe('hidden')

        wrapper.unmount()
    })

    it('v-model 与 SelectRoot 双向绑定', async () => {
        const wrapper = mount(CaomeiSelect, { props: { options } })

        wrapper.findComponent({ name: 'SelectRoot' }).vm.$emit('update:modelValue', 'apple')
        await nextTick()

        expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['apple'])
    })
})
