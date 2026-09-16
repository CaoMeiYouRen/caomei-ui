import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { CaomeiBadge } from './index'

describe('CaomeiBadge', () => {
    it('value 为 null 时按无值处理，不渲染徽标', () => {
        const wrapper = mount(CaomeiBadge, { props: { value: null } })
        expect(wrapper.find('.caomei-badge').exists()).toBe(false)
    })

    it('无 value 且非圆点时不渲染徽标', () => {
        const wrapper = mount(CaomeiBadge)
        expect(wrapper.find('.caomei-badge').exists()).toBe(false)
    })

    it('渲染数值并应用默认色调、变体与尺寸', () => {
        const wrapper = mount(CaomeiBadge, { props: { value: 5 } })

        const badge = wrapper.get('.caomei-badge')
        expect(badge.text()).toBe('5')
        expect(badge.classes()).toContain('caomei-badge--danger')
        expect(badge.classes()).toContain('caomei-badge--solid')
        expect(badge.classes()).toContain('caomei-badge--md')
    })

    it('value 为 0 时仍渲染', () => {
        const wrapper = mount(CaomeiBadge, { props: { value: 0 } })
        expect(wrapper.get('.caomei-badge').text()).toBe('0')
    })

    it('超过 max 时显示 max+', () => {
        const wrapper = mount(CaomeiBadge, { props: { value: 100, max: 99 } })
        expect(wrapper.get('.caomei-badge').text()).toBe('99+')
    })

    it('未超过 max 时显示原值', () => {
        const wrapper = mount(CaomeiBadge, { props: { value: 99, max: 99 } })
        expect(wrapper.get('.caomei-badge').text()).toBe('99')
    })

    it('支持字符串值', () => {
        const wrapper = mount(CaomeiBadge, { props: { value: 'NEW' } })
        expect(wrapper.get('.caomei-badge').text()).toBe('NEW')
    })

    it.each(['neutral', 'primary', 'success', 'warning', 'danger'] as const)(
        '应用色调 %s',
        (tone) => {
            const wrapper = mount(CaomeiBadge, { props: { value: 1, tone } })
            expect(wrapper.get('.caomei-badge').classes()).toContain(`caomei-badge--${tone}`)
        },
    )

    it.each(['soft', 'solid', 'outline'] as const)('应用变体 %s', (variant) => {
        const wrapper = mount(CaomeiBadge, { props: { value: 1, variant } })
        expect(wrapper.get('.caomei-badge').classes()).toContain(`caomei-badge--${variant}`)
    })

    it.each(['sm', 'md', 'lg'] as const)('应用尺寸 %s', (size) => {
        const wrapper = mount(CaomeiBadge, { props: { value: 1, size } })
        expect(wrapper.get('.caomei-badge').classes()).toContain(`caomei-badge--${size}`)
    })

    it('数值字符串不参与 max 截断', () => {
        const wrapper = mount(CaomeiBadge, { props: { value: '100', max: 99 } })
        expect(wrapper.get('.caomei-badge').text()).toBe('100')
    })

    it('负数正常显示', () => {
        const wrapper = mount(CaomeiBadge, { props: { value: -1 } })
        expect(wrapper.get('.caomei-badge').text()).toBe('-1')
    })

    it('NaN 不渲染徽标', () => {
        const wrapper = mount(CaomeiBadge, { props: { value: Number.NaN } })
        expect(wrapper.find('.caomei-badge').exists()).toBe(false)
    })

    it('圆点模式渲染圆点且无文本', () => {
        const wrapper = mount(CaomeiBadge, { props: { dot: true } })

        const badge = wrapper.get('.caomei-badge')
        expect(badge.classes()).toContain('caomei-badge--dot')
        expect(badge.text()).toBe('')
    })

    it('圆点模式未提供 label 时对辅助技术隐藏', () => {
        const wrapper = mount(CaomeiBadge, { props: { dot: true } })
        expect(wrapper.get('.caomei-badge').attributes('aria-hidden')).toBe('true')
    })

    it('圆点模式提供 label 时映射 aria-label', () => {
        const wrapper = mount(CaomeiBadge, { props: { dot: true, label: '有新消息' } })

        const badge = wrapper.get('.caomei-badge')
        expect(badge.attributes('aria-label')).toBe('有新消息')
        expect(badge.attributes('role')).toBe('img')
        expect(badge.attributes('aria-hidden')).toBeUndefined()
    })

    it('提供默认插槽时为叠加模式', () => {
        const wrapper = mount(CaomeiBadge, {
            props: { value: 3 },
            slots: { default: '<span data-test="child">消息</span>' },
        })

        expect(wrapper.find('.caomei-badge-wrapper').exists()).toBe(true)
        expect(wrapper.find('[data-test="child"]').exists()).toBe(true)
        expect(wrapper.get('.caomei-badge').text()).toBe('3')
    })

    it('叠加模式无 value 时保留插槽且不渲染徽标', () => {
        const wrapper = mount(CaomeiBadge, {
            slots: { default: '<span data-test="child">消息</span>' },
        })

        expect(wrapper.find('.caomei-badge-wrapper').exists()).toBe(true)
        expect(wrapper.find('[data-test="child"]').exists()).toBe(true)
        expect(wrapper.find('.caomei-badge').exists()).toBe(false)
    })

    it('合并透传的 class 与属性', () => {
        const wrapper = mount(CaomeiBadge, {
            props: { value: 1 },
            attrs: { class: 'custom-badge', 'data-test': 'badge' },
        })

        const badge = wrapper.get('.caomei-badge')
        expect(badge.classes()).toContain('custom-badge')
        expect(badge.attributes('data-test')).toBe('badge')
    })
})
