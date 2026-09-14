import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { CaomeiInputGroup } from './index'

describe('CaomeiInputGroup', () => {
    it('默认渲染水平组合容器', () => {
        const wrapper = mount(CaomeiInputGroup)
        const root = wrapper.get('.caomei-input-group')

        expect(root.classes()).toContain('caomei-input-group')
        expect(root.classes()).toContain('caomei-input-group--horizontal')
    })

    it('支持垂直方向', () => {
        const wrapper = mount(CaomeiInputGroup, { props: { orientation: 'vertical' } })
        expect(wrapper.get('.caomei-input-group').classes()).toContain('caomei-input-group--vertical')
    })

    it('渲染默认插槽内容', () => {
        const wrapper = mount(CaomeiInputGroup, {
            slots: { default: '<input class="native-input"><button class="native-button">Go</button>' },
        })

        expect(wrapper.find('.native-input').exists()).toBe(true)
        expect(wrapper.get('.native-button').text()).toBe('Go')
    })

    it('合并透传的 class 与属性', () => {
        const wrapper = mount(CaomeiInputGroup, {
            attrs: { class: 'custom-group', 'data-test': 'input-group' },
        })
        const root = wrapper.get('.caomei-input-group')

        expect(root.classes()).toContain('custom-group')
        expect(root.attributes('data-test')).toBe('input-group')
    })
})
