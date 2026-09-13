import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { CaomeiButton } from './index'

describe('CaomeiButton', () => {
    it('渲染原生 button 并应用默认变体、尺寸与插槽内容', () => {
        const wrapper = mount(CaomeiButton, {
            slots: { default: '确定' },
        })

        const button = wrapper.get('button')
        expect(button.attributes('type')).toBe('button')
        expect(button.classes()).toContain('caomei-button--primary')
        expect(button.classes()).toContain('caomei-button--md')
        expect(button.text()).toBe('确定')
    })

    it.each(['primary', 'secondary', 'ghost'] as const)('应用变体样式 %s', (variant) => {
        const wrapper = mount(CaomeiButton, { props: { variant } })
        expect(wrapper.get('button').classes()).toContain(`caomei-button--${variant}`)
    })

    it.each(['sm', 'md', 'lg'] as const)('应用尺寸样式 %s', (size) => {
        const wrapper = mount(CaomeiButton, { props: { size } })
        expect(wrapper.get('button').classes()).toContain(`caomei-button--${size}`)
    })

    it.each(['button', 'submit', 'reset'] as const)('透传原生 type=%s', (type) => {
        const wrapper = mount(CaomeiButton, { props: { type } })
        expect(wrapper.get('button').attributes('type')).toBe(type)
    })

    it('点击时抛出 click 事件并携带 MouseEvent', async () => {
        const wrapper = mount(CaomeiButton)
        await wrapper.get('button').trigger('click')

        const emitted = wrapper.emitted('click')
        expect(emitted).toHaveLength(1)
        expect(emitted?.[0][0]).toBeInstanceOf(MouseEvent)
    })

    it('禁用时不抛出 click 事件', async () => {
        const wrapper = mount(CaomeiButton, { props: { disabled: true } })
        const button = wrapper.get('button')

        expect(button.attributes('disabled')).toBeDefined()
        await button.trigger('click')
        expect(wrapper.emitted('click')).toBeUndefined()
    })

    it('加载态下渲染 spinner、标记 aria-busy 并禁用交互', async () => {
        const wrapper = mount(CaomeiButton, { props: { loading: true } })
        const button = wrapper.get('button')

        expect(button.attributes('disabled')).toBeDefined()
        expect(button.attributes('aria-busy')).toBe('true')
        expect(wrapper.find('.caomei-button__spinner').exists()).toBe(true)

        await button.trigger('click')
        expect(wrapper.emitted('click')).toBeUndefined()
    })

    it('block 时撑满宽度', () => {
        const wrapper = mount(CaomeiButton, { props: { block: true } })
        expect(wrapper.get('button').classes()).toContain('caomei-button--block')
    })

    it('渲染 icon 插槽', () => {
        const wrapper = mount(CaomeiButton, {
            slots: {
                default: '按钮',
                icon: '<svg data-test="icon" />',
            },
        })

        expect(wrapper.find('.caomei-button__icon').exists()).toBe(true)
        expect(wrapper.find('[data-test="icon"]').exists()).toBe(true)
    })

    it('icon-only 时通过 label 提供可访问名', () => {
        const wrapper = mount(CaomeiButton, {
            props: { label: '设置' },
            slots: { icon: '<svg data-test="icon" />' },
        })

        expect(wrapper.get('button').attributes('aria-label')).toBe('设置')
    })

    it('合并透传的 class 与属性', () => {
        const wrapper = mount(CaomeiButton, {
            attrs: { class: 'custom-button', 'data-test': 'button' },
        })

        const button = wrapper.get('button')
        expect(button.classes()).toContain('caomei-button')
        expect(button.classes()).toContain('custom-button')
        expect(button.attributes('data-test')).toBe('button')
    })

    it('未设置 tone 时不输出 tone class', () => {
        const wrapper = mount(CaomeiButton)
        expect(wrapper.get('button').classes().some((name) => name.startsWith('caomei-button--tone-'))).toBe(false)
    })

    it.each(['neutral', 'primary', 'success', 'warning', 'danger'] as const)('应用语义色调 %s', (tone) => {
        const wrapper = mount(CaomeiButton, { props: { tone } })
        expect(wrapper.get('button').classes()).toContain(`caomei-button--tone-${tone}`)
    })

    it('rounded 输出胶囊圆角 class', () => {
        const wrapper = mount(CaomeiButton, { props: { rounded: true } })
        expect(wrapper.get('button').classes()).toContain('caomei-button--rounded')
    })

    it('iconPosition 控制图标相对文本的位置', () => {
        const start = mount(CaomeiButton, {
            props: { iconPosition: 'start' },
            slots: { default: '确定', icon: '<svg data-test="icon" />' },
        })
        const end = mount(CaomeiButton, {
            props: { iconPosition: 'end' },
            slots: { default: '确定', icon: '<svg data-test="icon" />' },
        })

        const children = (wrapper: typeof start) =>
            wrapper.get('button').element.children[0]?.classList.contains('caomei-button__icon')
        expect(children(start)).toBe(true)
        expect(children(end)).toBe(false)
        expect(end.get('button').element.children[1]?.classList.contains('caomei-button__icon')).toBe(true)
    })

    it('loading 时即使提供 icon 插槽也不渲染图标', () => {
        const wrapper = mount(CaomeiButton, {
            props: { loading: true },
            slots: { icon: '<svg data-test="icon" />' },
        })

        expect(wrapper.find('.caomei-button__icon').exists()).toBe(false)
        expect(wrapper.find('.caomei-button__spinner').exists()).toBe(true)
    })

    it('tone 与 secondary 组合同时输出两类 class', () => {
        const wrapper = mount(CaomeiButton, {
            props: { tone: 'danger', variant: 'secondary' },
        })

        expect(wrapper.get('button').classes()).toContain('caomei-button--tone-danger')
        expect(wrapper.get('button').classes()).toContain('caomei-button--secondary')
    })
})
