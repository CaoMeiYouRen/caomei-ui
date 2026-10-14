import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { CaomeiRow } from './index'

describe('CaomeiRow', () => {
    it('默认渲染栅格容器并带默认对齐类', () => {
        const wrapper = mount(CaomeiRow)
        const root = wrapper.get('.caomei-row')

        expect(root.element.tagName).toBe('DIV')
        expect(root.classes()).toContain('caomei-row--align-stretch')
    })

    it('gutter 数字只设置横向间距', () => {
        const wrapper = mount(CaomeiRow, { props: { gutter: 16 } })
        const style = wrapper.get('.caomei-row').attributes('style') ?? ''

        expect(style).toContain('--caomei-row-gutter-x: 16px')
        expect(style).not.toContain('--caomei-row-gutter-y')
    })

    it('gutter 元组同时设置横向与纵向间距', () => {
        const wrapper = mount(CaomeiRow, { props: { gutter: [16, 8] } })
        const style = wrapper.get('.caomei-row').attributes('style') ?? ''

        expect(style).toContain('--caomei-row-gutter-x: 16px')
        expect(style).toContain('--caomei-row-gutter-y: 8px')
    })

    it('未提供 gutter 时不写入间距变量', () => {
        const wrapper = mount(CaomeiRow)
        expect(wrapper.get('.caomei-row').attributes('style')).toBeUndefined()
    })

    it.each(['start', 'center', 'end', 'stretch', 'baseline'] as const)('应用对齐类 %s', (align) => {
        const wrapper = mount(CaomeiRow, { props: { align } })
        expect(wrapper.get('.caomei-row').classes()).toContain(`caomei-row--align-${align}`)
    })

    it('渲染默认插槽内容', () => {
        const wrapper = mount(CaomeiRow, { slots: { default: '<span class="cell">列</span>' } })
        expect(wrapper.get('.caomei-row .cell').text()).toBe('列')
    })

    it('as 指定根元素标签', () => {
        const wrapper = mount(CaomeiRow, { props: { as: 'section' } })
        expect(wrapper.get('.caomei-row').element.tagName).toBe('SECTION')
    })

    it('合并透传的 class 与属性', () => {
        const wrapper = mount(CaomeiRow, {
            attrs: { class: 'custom-row', 'data-test': 'row' },
        })
        const root = wrapper.get('.caomei-row')

        expect(root.classes()).toContain('custom-row')
        expect(root.attributes('data-test')).toBe('row')
    })
})
