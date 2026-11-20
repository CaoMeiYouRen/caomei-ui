import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { CaomeiCell, CaomeiCellGroup } from './index'

describe('CaomeiCell', () => {
    it('默认渲染为 div，并展示标题、描述与右值', () => {
        const wrapper = mount(CaomeiCell, {
            props: { title: '标题', description: '描述', value: '右值' },
        })

        const root = wrapper.get('.caomei-cell')
        expect(root.element.tagName).toBe('DIV')
        expect(root.classes()).toContain('caomei-cell--div')
        expect(wrapper.get('.caomei-cell__title').text()).toBe('标题')
        expect(wrapper.get('.caomei-cell__description').text()).toBe('描述')
        expect(wrapper.get('.caomei-cell__value').text()).toBe('右值')
        expect(wrapper.find('.caomei-cell__arrow').exists()).toBe(false)
    })

    it('value 为 0 时仍渲染右值', () => {
        const wrapper = mount(CaomeiCell, { props: { title: '数量', value: 0 } })

        expect(wrapper.get('.caomei-cell__value').text()).toBe('0')
    })

    it('as="button" 渲染原生按钮，默认 type 为 button，并承载点击语义', async () => {
        const onClick = vi.fn()
        const wrapper = mount(CaomeiCell, {
            props: { as: 'button', title: '打开' },
            attrs: { onClick },
        })

        const root = wrapper.get('button.caomei-cell')
        expect(root.attributes('type')).toBe('button')
        await root.trigger('click')
        expect(onClick).toHaveBeenCalledTimes(1)
    })

    it('as="button" 时 type 可切换为 submit', () => {
        const wrapper = mount(CaomeiCell, { props: { as: 'button', type: 'submit' } })

        expect(wrapper.get('button.caomei-cell').attributes('type')).toBe('submit')
    })

    it('as="a" 渲染链接并透传 href 与 target', () => {
        const wrapper = mount(CaomeiCell, {
            props: { as: 'a', href: '/detail', target: '_blank', title: '详情' },
        })

        const root = wrapper.get('a.caomei-cell')
        expect(root.attributes('href')).toBe('/detail')
        expect(root.attributes('target')).toBe('_blank')
        expect(root.attributes('type')).toBeUndefined()
    })

    it('arrow 开启后渲染进入指示且对辅助技术隐藏', () => {
        const wrapper = mount(CaomeiCell, { props: { arrow: true } })

        const arrow = wrapper.get('.caomei-cell__arrow')
        expect(arrow.attributes('aria-hidden')).toBe('true')
        expect(wrapper.get('.caomei-cell').classes()).toContain('caomei-cell--arrow')
    })

    it('前后插槽与内容插槽覆盖属性文案', () => {
        const wrapper = mount(CaomeiCell, {
            props: { title: '属性标题', value: '属性值' },
            slots: {
                prefix: '<span data-test="prefix">前</span>',
                title: '<span data-test="title">插槽标题</span>',
                value: '<span data-test="value">插槽值</span>',
                suffix: '<span data-test="suffix">后</span>',
            },
        })

        expect(wrapper.find('[data-test="prefix"]').exists()).toBe(true)
        expect(wrapper.find('[data-test="suffix"]').exists()).toBe(true)
        expect(wrapper.get('.caomei-cell__title').text()).toBe('插槽标题')
        expect(wrapper.get('.caomei-cell__value').text()).toBe('插槽值')
    })

    it('无标题、描述与插槽时不渲染对应节点', () => {
        const wrapper = mount(CaomeiCell)

        expect(wrapper.find('.caomei-cell__title').exists()).toBe(false)
        expect(wrapper.find('.caomei-cell__description').exists()).toBe(false)
        expect(wrapper.find('.caomei-cell__value').exists()).toBe(false)
        expect(wrapper.find('.caomei-cell__prefix').exists()).toBe(false)
        expect(wrapper.find('.caomei-cell__suffix').exists()).toBe(false)
    })
})

describe('CaomeiCellGroup', () => {
    it('带标题时以 role=group + aria-labelledby 关联标题', () => {
        const wrapper = mount(CaomeiCellGroup, {
            props: { title: '账户' },
            slots: { default: '<div class="caomei-cell">内容</div>' },
        })

        const root = wrapper.get('[role="group"]')
        const title = wrapper.get('.caomei-cell-group__title')
        expect(title.text()).toBe('账户')
        expect(root.attributes('aria-labelledby')).toBe(title.attributes('id'))
    })

    it('无标题时不输出 aria-labelledby', () => {
        const wrapper = mount(CaomeiCellGroup, {
            slots: { default: '<div class="caomei-cell">内容</div>' },
        })

        expect(wrapper.get('[role="group"]').attributes('aria-labelledby')).toBeUndefined()
        expect(wrapper.find('.caomei-cell-group__title').exists()).toBe(false)
    })

    it('标题插槽覆盖 title 属性', () => {
        const wrapper = mount(CaomeiCellGroup, {
            props: { title: '属性标题' },
            slots: { title: '<span data-test="title">插槽标题</span>' },
        })

        expect(wrapper.find('[data-test="title"]').exists()).toBe(true)
        expect(wrapper.get('.caomei-cell-group__title').text()).toBe('插槽标题')
    })
})
