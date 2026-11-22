import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { CaomeiNavBar } from './index'

describe('CaomeiNavBar', () => {
    it('渲染 nav landmark、标题与默认返回按钮', () => {
        const wrapper = mount(CaomeiNavBar, { props: { title: '设置' } })

        const nav = wrapper.get('nav')
        expect(nav.attributes('aria-label')).toBe('导航栏')
        expect(wrapper.get('.caomei-nav-bar__title').text()).toBe('设置')

        const back = wrapper.get('.caomei-nav-bar__back')
        expect(back.attributes('type')).toBe('button')
        expect(back.attributes('aria-label')).toBe('返回')
        expect(back.classes()).toContain('caomei-hit-target')
        wrapper.unmount()
    })

    it('点击返回按钮抛出 back；禁用时不抛', async () => {
        const wrapper = mount(CaomeiNavBar, { props: { title: '设置' } })
        await wrapper.get('.caomei-nav-bar__back').trigger('click')
        expect(wrapper.emitted('back')).toHaveLength(1)

        await wrapper.setProps({ backDisabled: true })
        const back = wrapper.get('.caomei-nav-bar__back')
        expect(back.attributes('disabled')).toBeDefined()
        await back.trigger('click')
        expect(wrapper.emitted('back')).toHaveLength(1)
        wrapper.unmount()
    })

    it('back=false 时不渲染返回按钮，可由 start 插槽替换', () => {
        const hidden = mount(CaomeiNavBar, { props: { title: '设置', back: false } })
        expect(hidden.find('.caomei-nav-bar__back').exists()).toBe(false)
        hidden.unmount()

        const slotted = mount(CaomeiNavBar, {
            props: { title: '设置' },
            slots: { start: '<button data-test="custom-back">自定义</button>' },
        })
        expect(slotted.find('.caomei-nav-bar__back').exists()).toBe(false)
        expect(slotted.find('[data-test="custom-back"]').exists()).toBe(true)
        slotted.unmount()
    })

    it('吸顶与安全区通过类名表达，尾部操作经 end 插槽渲染', () => {
        const wrapper = mount(CaomeiNavBar, {
            props: { title: '设置', sticky: true },
            slots: { end: '<button data-test="action">保存</button>' },
        })

        const nav = wrapper.get('nav')
        expect(nav.classes()).toContain('caomei-nav-bar--sticky')
        expect(nav.classes()).toContain('caomei-nav-bar--safe-area')
        expect(wrapper.get('[data-test="action"]').text()).toBe('保存')

        const plain = mount(CaomeiNavBar, { props: { title: '设置', safeArea: false } })
        expect(plain.get('nav').classes()).not.toContain('caomei-nav-bar--safe-area')
        plain.unmount()
        wrapper.unmount()
    })

    it('显式 label / backLabel 与透传 aria-label 优先', () => {
        const wrapper = mount(CaomeiNavBar, {
            props: { title: '设置', label: '页头', backLabel: '返回上一页' },
        })
        expect(wrapper.get('nav').attributes('aria-label')).toBe('页头')
        expect(wrapper.get('.caomei-nav-bar__back').attributes('aria-label')).toBe('返回上一页')
        wrapper.unmount()

        const forwarded = mount(CaomeiNavBar, {
            props: { title: '设置' },
            attrs: { 'aria-label': '透传页头' },
        })
        expect(forwarded.get('nav').attributes('aria-label')).toBe('透传页头')
        forwarded.unmount()
    })
})
