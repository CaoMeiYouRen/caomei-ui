import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { CaomeiCard } from './index'

describe('CaomeiCard', () => {
    it('默认渲染轮廓变体与中号内边距，并渲染默认插槽', () => {
        const wrapper = mount(CaomeiCard, {
            slots: { default: '内容' },
        })

        const root = wrapper.get('.caomei-card')
        expect(root.element.tagName).toBe('DIV')
        expect(root.classes()).toContain('caomei-card--outlined')
        expect(root.classes()).toContain('caomei-card--padding-md')
        expect(wrapper.get('.caomei-card__body').text()).toBe('内容')
    })

    it.each(['outlined', 'elevated', 'filled'] as const)('应用变体样式 %s', (variant) => {
        const wrapper = mount(CaomeiCard, { props: { variant } })

        expect(wrapper.get('.caomei-card').classes()).toContain(`caomei-card--${variant}`)
    })

    it.each(['none', 'sm', 'md', 'lg'] as const)('应用内边距档位 %s', (padding) => {
        const wrapper = mount(CaomeiCard, { props: { padding } })

        expect(wrapper.get('.caomei-card').classes()).toContain(`caomei-card--padding-${padding}`)
    })

    it('提供 title 与 subtitle 时渲染头部', () => {
        const wrapper = mount(CaomeiCard, {
            props: { title: '卡片标题', subtitle: '补充说明' },
        })

        const header = wrapper.get('.caomei-card__header')
        expect(header.get('.caomei-card__title').text()).toBe('卡片标题')
        expect(header.get('.caomei-card__subtitle').text()).toBe('补充说明')
    })

    it('无标题与头部插槽时不渲染头部', () => {
        const wrapper = mount(CaomeiCard, { slots: { default: '内容' } })

        expect(wrapper.find('.caomei-card__header').exists()).toBe(false)
    })

    it('仅 subtitle 也触发头部渲染', () => {
        const wrapper = mount(CaomeiCard, { props: { subtitle: '仅副标题' } })

        expect(wrapper.find('.caomei-card__header').exists()).toBe(true)
        expect(wrapper.get('.caomei-card__subtitle').text()).toBe('仅副标题')
    })

    it('仅 extra 插槽也触发头部渲染', () => {
        const wrapper = mount(CaomeiCard, {
            slots: { extra: '<button data-test="only-extra">操作</button>' },
        })

        expect(wrapper.find('.caomei-card__header').exists()).toBe(true)
        expect(wrapper.find('[data-test="only-extra"]').exists()).toBe(true)
    })

    it('无默认插槽时头部与底部直接相邻', () => {
        const wrapper = mount(CaomeiCard, {
            props: { title: '仅头部与底部' },
            slots: { footer: '<span data-test="footer">底部</span>' },
        })

        const children = Array.from(wrapper.get('.caomei-card').element.children)
        expect(children.map((node) => node.className)).toEqual([
            'caomei-card__header',
            'caomei-card__footer',
        ])
        expect(wrapper.find('.caomei-card__body').exists()).toBe(false)
    })

    it('title 插槽覆盖 title 属性内容', () => {
        const wrapper = mount(CaomeiCard, {
            props: { title: '属性标题' },
            slots: { title: '<span data-test="custom">插槽标题</span>' },
        })

        expect(wrapper.find('[data-test="custom"]').text()).toBe('插槽标题')
        expect(wrapper.get('.caomei-card__title').text()).not.toContain('属性标题')
    })

    it('header 插槽整体替换默认头部', () => {
        const wrapper = mount(CaomeiCard, {
            props: { title: '属性标题' },
            slots: { header: '<div data-test="header">自定义头部</div>' },
        })

        expect(wrapper.get('.caomei-card__header').text()).toBe('自定义头部')
        expect(wrapper.find('.caomei-card__title').exists()).toBe(false)
    })

    it('extra 插槽渲染在头部右侧', () => {
        const wrapper = mount(CaomeiCard, {
            props: { title: '标题' },
            slots: { extra: '<button data-test="action">操作</button>' },
        })

        expect(wrapper.get('.caomei-card__extra').find('[data-test="action"]').exists()).toBe(true)
    })

    it('footer 插槽渲染底部', () => {
        const wrapper = mount(CaomeiCard, {
            slots: { footer: '<span data-test="footer">底部</span>' },
        })

        expect(wrapper.get('.caomei-card__footer').find('[data-test="footer"]').exists()).toBe(true)
    })

    it('无默认插槽时不渲染内容区', () => {
        const wrapper = mount(CaomeiCard, { props: { title: '仅标题' } })

        expect(wrapper.find('.caomei-card__body').exists()).toBe(false)
    })

    it('as 指定根元素标签', () => {
        const wrapper = mount(CaomeiCard, { props: { as: 'section' } })

        expect(wrapper.get('.caomei-card').element.tagName).toBe('SECTION')
    })

    it('hoverable 开启悬浮反馈类', () => {
        const wrapper = mount(CaomeiCard, { props: { hoverable: true } })

        expect(wrapper.get('.caomei-card').classes()).toContain('caomei-card--hoverable')
    })

    it('透传 class 与原生属性到根元素', () => {
        const wrapper = mount(CaomeiCard, {
            attrs: { class: 'custom', 'data-test': 'card' },
        })

        const root = wrapper.get('.caomei-card')
        expect(root.classes()).toContain('custom')
        expect(root.attributes('data-test')).toBe('card')
    })
})
