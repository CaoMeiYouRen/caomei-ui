import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { CaomeiTag } from './index'

describe('CaomeiTag', () => {
    it('渲染 span 并应用默认色调、变体、尺寸与内容', () => {
        const wrapper = mount(CaomeiTag, { slots: { default: '默认' } })

        const root = wrapper.get('.caomei-tag')
        expect(root.element.tagName).toBe('SPAN')
        expect(root.classes()).toContain('caomei-tag--neutral')
        expect(root.classes()).toContain('caomei-tag--soft')
        expect(root.classes()).toContain('caomei-tag--md')
        expect(root.text()).toBe('默认')
    })

    it.each(['neutral', 'primary', 'success', 'warning', 'danger'] as const)(
        '应用色调 %s',
        (tone) => {
            const wrapper = mount(CaomeiTag, { props: { tone } })
            expect(wrapper.get('.caomei-tag').classes()).toContain(`caomei-tag--${tone}`)
        },
    )

    it.each(['soft', 'solid', 'outline'] as const)('应用变体 %s', (variant) => {
        const wrapper = mount(CaomeiTag, { props: { variant } })
        expect(wrapper.get('.caomei-tag').classes()).toContain(`caomei-tag--${variant}`)
    })

    it.each(['sm', 'md', 'lg'] as const)('应用尺寸 %s', (size) => {
        const wrapper = mount(CaomeiTag, { props: { size } })
        expect(wrapper.get('.caomei-tag').classes()).toContain(`caomei-tag--${size}`)
    })

    it('不可关闭时不渲染关闭按钮', () => {
        const wrapper = mount(CaomeiTag, { slots: { default: '标签' } })
        expect(wrapper.find('.caomei-tag__close').exists()).toBe(false)
    })

    it('可关闭时渲染关闭按钮并使用默认可访问标签', () => {
        const wrapper = mount(CaomeiTag, { props: { closable: true }, slots: { default: '标签' } })

        const close = wrapper.get('.caomei-tag__close')
        expect(close.attributes('type')).toBe('button')
        expect(close.attributes('aria-label')).toBe('删除')
    })

    it('点击关闭按钮抛出 close 事件', async () => {
        const wrapper = mount(CaomeiTag, { props: { closable: true } })
        await wrapper.get('.caomei-tag__close').trigger('click')

        expect(wrapper.emitted('close')).toHaveLength(1)
    })

    it('禁用时关闭按钮不可用且点击不抛出 close', async () => {
        const wrapper = mount(CaomeiTag, { props: { closable: true, disabled: true } })

        const root = wrapper.get('.caomei-tag')
        const close = wrapper.get('.caomei-tag__close')
        expect(root.classes()).toContain('caomei-tag--disabled')
        expect(close.attributes('disabled')).toBeDefined()

        await close.trigger('click')
        expect(wrapper.emitted('close')).toBeUndefined()
    })

    it('关闭按钮可访问标签可被覆盖', () => {
        const wrapper = mount(CaomeiTag, {
            props: { closable: true, closeLabel: '移除标签' },
        })
        expect(wrapper.get('.caomei-tag__close').attributes('aria-label')).toBe('移除标签')
    })

    it('渲染 icon 插槽', () => {
        const wrapper = mount(CaomeiTag, {
            slots: {
                default: '标签',
                icon: '<svg data-test="icon" />',
            },
        })

        expect(wrapper.find('.caomei-tag__icon').exists()).toBe(true)
        expect(wrapper.find('[data-test="icon"]').exists()).toBe(true)
    })

    it('合并透传的 class 与属性', () => {
        const wrapper = mount(CaomeiTag, {
            attrs: { class: 'custom-tag', 'data-test': 'tag' },
        })

        const root = wrapper.get('.caomei-tag')
        expect(root.classes()).toContain('custom-tag')
        expect(root.attributes('data-test')).toBe('tag')
    })
})
