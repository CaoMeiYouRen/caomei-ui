import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { h } from 'vue'
import { CaomeiResult } from './index'

describe('CaomeiResult', () => {
    it('默认 info 状态输出 role=status、标题与描述', () => {
        const wrapper = mount(CaomeiResult, {
            props: { title: '操作完成', description: '结果已保存。' },
        })

        expect(wrapper.attributes('role')).toBe('status')
        expect(wrapper.attributes('aria-live')).toBe('polite')
        expect(wrapper.classes()).toContain('caomei-result--info')
        expect(wrapper.get('.caomei-result__title').text()).toBe('操作完成')
        expect(wrapper.get('.caomei-result__description').text()).toBe('结果已保存。')
        expect(wrapper.get('.caomei-result__icon').attributes('aria-hidden')).toBe('true')
    })

    it.each([
        'success',
        'info',
        'warning',
        'danger',
        '403',
        '404',
        '500',
    ] as const)('状态 %s 输出对应色调类', (status) => {
        const wrapper = mount(CaomeiResult, { props: { status } })
        expect(wrapper.classes()).toContain(`caomei-result--${status}`)
        expect(wrapper.find('.caomei-result__icon').exists()).toBe(true)
    })

    it('icon=null 隐藏图标，自定义 icon 渲染传入组件', () => {
        const hidden = mount(CaomeiResult, { props: { icon: null } })
        expect(hidden.find('.caomei-result__icon').exists()).toBe(false)

        const custom = mount(CaomeiResult, {
            props: { icon: () => h('svg', { class: 'demo-result-icon' }) },
        })
        expect(custom.find('.demo-result-icon').exists()).toBe(true)
    })

    it('插槽覆盖标题、描述与操作区', () => {
        const wrapper = mount(CaomeiResult, {
            slots: {
                title: () => h('span', { class: 'demo-title' }, '自定义标题'),
                description: () => h('em', { class: 'demo-description' }, '自定义描述'),
                extra: () => h('button', { class: 'demo-action' }, '重试'),
            },
        })

        expect(wrapper.find('.demo-title').exists()).toBe(true)
        expect(wrapper.find('.demo-description').exists()).toBe(true)
        expect(wrapper.find('.demo-action').text()).toBe('重试')
    })

    it('size 与 as 映射到类名与根标签', () => {
        const wrapper = mount(CaomeiResult, { props: { size: 'lg', as: 'section' } })

        expect((wrapper.element as HTMLElement).tagName).toBe('SECTION')
        expect(wrapper.classes()).toContain('caomei-result--lg')
    })

    it('live=false 时不输出 live region 语义', () => {
        const wrapper = mount(CaomeiResult, { props: { live: false } })

        expect(wrapper.attributes('role')).toBeUndefined()
        expect(wrapper.attributes('aria-live')).toBeUndefined()
    })
})
