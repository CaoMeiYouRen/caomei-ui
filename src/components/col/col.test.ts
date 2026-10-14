import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { CaomeiCol } from './index'

describe('CaomeiCol', () => {
    it('默认渲染满宽列（span 24）', () => {
        const wrapper = mount(CaomeiCol)
        const root = wrapper.get('.caomei-col')

        expect(root.element.tagName).toBe('DIV')
        expect(root.attributes('style')).toContain('--caomei-col-span: 24')
    })

    it('span / offset / order 写入对应变量', () => {
        const wrapper = mount(CaomeiCol, { props: { span: 8, offset: 4, order: 2 } })
        const style = wrapper.get('.caomei-col').attributes('style') ?? ''

        expect(style).toContain('--caomei-col-span: 8')
        expect(style).toContain('--caomei-col-offset: 4')
        expect(style).toContain('--caomei-col-order: 2')
    })

    it('offset / order 为默认值时不写入变量', () => {
        const wrapper = mount(CaomeiCol, { props: { span: 12 } })
        const style = wrapper.get('.caomei-col').attributes('style') ?? ''

        expect(style).not.toContain('--caomei-col-offset')
        expect(style).not.toContain('--caomei-col-order')
    })

    it('断点数字等价于只设置 span', () => {
        const wrapper = mount(CaomeiCol, { props: { sm: 12 } })
        const style = wrapper.get('.caomei-col').attributes('style') ?? ''

        expect(style).toContain('--caomei-col-sm-span: 12')
        expect(style).not.toContain('--caomei-col-sm-offset')
    })

    it('断点对象写入 span / offset / order', () => {
        const wrapper = mount(CaomeiCol, {
            props: { md: { span: 6, offset: 2, order: 1 }, lg: 18 },
        })
        const style = wrapper.get('.caomei-col').attributes('style') ?? ''

        expect(style).toContain('--caomei-col-md-span: 6')
        expect(style).toContain('--caomei-col-md-offset: 2')
        expect(style).toContain('--caomei-col-md-order: 1')
        expect(style).toContain('--caomei-col-lg-span: 18')
    })

    it('三个断点互不覆盖', () => {
        const wrapper = mount(CaomeiCol, { props: { sm: 24, md: 16, lg: 12 } })
        const style = wrapper.get('.caomei-col').attributes('style') ?? ''

        expect(style).toContain('--caomei-col-sm-span: 24')
        expect(style).toContain('--caomei-col-md-span: 16')
        expect(style).toContain('--caomei-col-lg-span: 12')
    })

    it('渲染默认插槽内容', () => {
        const wrapper = mount(CaomeiCol, { slots: { default: '内容' } })
        expect(wrapper.get('.caomei-col').text()).toBe('内容')
    })

    it('as 指定根元素标签', () => {
        const wrapper = mount(CaomeiCol, { props: { as: 'article' } })
        expect(wrapper.get('.caomei-col').element.tagName).toBe('ARTICLE')
    })

    it('合并透传的 class 与属性', () => {
        const wrapper = mount(CaomeiCol, {
            attrs: { class: 'custom-col', 'data-test': 'col' },
        })
        const root = wrapper.get('.caomei-col')

        expect(root.classes()).toContain('custom-col')
        expect(root.attributes('data-test')).toBe('col')
    })
})
