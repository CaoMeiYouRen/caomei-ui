import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { CaomeiFloatLabel } from './index'

describe('CaomeiFloatLabel', () => {
    it('默认渲染 over 变体容器', () => {
        const wrapper = mount(CaomeiFloatLabel)
        const root = wrapper.get('.caomei-float-label')

        expect(root.classes()).toContain('caomei-float-label')
        expect(root.classes()).toContain('caomei-float-label--over')
    })

    it('支持 in 变体', () => {
        const wrapper = mount(CaomeiFloatLabel, { props: { variant: 'in' } })
        expect(wrapper.get('.caomei-float-label').classes()).toContain('caomei-float-label--in')
    })

    it('渲染字段与标签插槽', () => {
        const wrapper = mount(CaomeiFloatLabel, {
            slots: {
                default: '<input id="name"><label for="name">姓名</label>',
            },
        })

        expect(wrapper.find('input#name').exists()).toBe(true)
        expect(wrapper.get('label').attributes('for')).toBe('name')
    })

    it('合并透传的 class 与属性', () => {
        const wrapper = mount(CaomeiFloatLabel, {
            attrs: { class: 'custom-field', 'data-test': 'float-label' },
        })
        const root = wrapper.get('.caomei-float-label')

        expect(root.classes()).toContain('custom-field')
        expect(root.attributes('data-test')).toBe('float-label')
    })
})
