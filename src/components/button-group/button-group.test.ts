import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { CaomeiButtonGroup } from './index'

describe('CaomeiButtonGroup', () => {
    it('默认渲染水平按钮组', () => {
        const wrapper = mount(CaomeiButtonGroup)
        const root = wrapper.get('.caomei-button-group')

        expect(root.classes()).toContain('caomei-button-group')
        expect(root.classes()).toContain('caomei-button-group--horizontal')
    })

    it('支持垂直方向', () => {
        const wrapper = mount(CaomeiButtonGroup, { props: { orientation: 'vertical' } })
        expect(wrapper.get('.caomei-button-group').classes()).toContain('caomei-button-group--vertical')
    })

    it('渲染默认插槽内容', () => {
        const wrapper = mount(CaomeiButtonGroup, {
            slots: { default: '<button class="native-button">A</button><button class="native-button">B</button>' },
        })

        expect(wrapper.findAll('.native-button')).toHaveLength(2)
    })

    it('单成员与空插槽正常渲染', () => {
        const single = mount(CaomeiButtonGroup, {
            slots: { default: '<button class="only">Only</button>' },
        })
        const empty = mount(CaomeiButtonGroup)

        expect(single.findAll('.only')).toHaveLength(1)
        expect(empty.get('.caomei-button-group').element.childElementCount).toBe(0)
    })

    it('合并透传的 class 与属性', () => {
        const wrapper = mount(CaomeiButtonGroup, {
            attrs: { class: 'custom-group', 'data-test': 'button-group' },
        })
        const root = wrapper.get('.caomei-button-group')

        expect(root.classes()).toContain('custom-group')
        expect(root.attributes('data-test')).toBe('button-group')
    })
})
