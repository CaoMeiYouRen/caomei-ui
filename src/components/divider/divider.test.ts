import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { CaomeiDivider } from './index'

describe('CaomeiDivider', () => {
    it('默认渲染水平实线分隔线', () => {
        const wrapper = mount(CaomeiDivider)
        const root = wrapper.get('.caomei-divider')

        expect(root.attributes('role')).toBe('separator')
        expect(root.attributes('aria-orientation')).toBe('horizontal')
        expect(root.classes()).toContain('caomei-divider--horizontal')
        expect(root.classes()).toContain('caomei-divider--solid')
    })

    it.each(['solid', 'dashed', 'dotted'] as const)('应用线条样式 %s', (variant) => {
        const wrapper = mount(CaomeiDivider, { props: { variant } })
        expect(wrapper.get('.caomei-divider').classes()).toContain(`caomei-divider--${variant}`)
    })

    it('插槽渲染内容并标记 with-content', () => {
        const wrapper = mount(CaomeiDivider, { slots: { default: '分节' } })
        const root = wrapper.get('.caomei-divider')

        expect(root.classes()).toContain('caomei-divider--with-content')
        expect(wrapper.get('.caomei-divider__content').text()).toBe('分节')
    })

    it.each(['left', 'center', 'right'] as const)('应用内容对齐 %s', (align) => {
        const wrapper = mount(CaomeiDivider, { props: { align }, slots: { default: '文本' } })
        expect(wrapper.get('.caomei-divider').classes()).toContain(`caomei-divider--align-${align}`)
    })

    it('无内容时不输出 align 类', () => {
        const wrapper = mount(CaomeiDivider, { props: { align: 'right' } })
        const classes = wrapper.get('.caomei-divider').classes()
        expect(classes.some((name) => name.startsWith('caomei-divider--align-'))).toBe(false)
    })

    it('垂直方向设置 aria-orientation 且不渲染内容', () => {
        const wrapper = mount(CaomeiDivider, {
            props: { orientation: 'vertical' },
            slots: { default: '文本' },
        })
        const root = wrapper.get('.caomei-divider')

        expect(root.attributes('aria-orientation')).toBe('vertical')
        expect(root.classes()).toContain('caomei-divider--vertical')
        expect(wrapper.find('.caomei-divider__content').exists()).toBe(false)
    })

    it('合并透传的 class 与属性', () => {
        const wrapper = mount(CaomeiDivider, {
            attrs: { class: 'custom-divider', 'data-test': 'divider' },
        })
        const root = wrapper.get('.caomei-divider')

        expect(root.classes()).toContain('custom-divider')
        expect(root.attributes('data-test')).toBe('divider')
    })
})
