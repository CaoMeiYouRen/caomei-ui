import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { h } from 'vue'
import { CaomeiMessage } from '../message'
import { CaomeiAlert } from './index'

function mountAlert(props: Record<string, unknown> = {}, slots: Record<string, unknown> = {}) {
    return mount(CaomeiAlert, {
        props,
        slots: { default: () => '描述文本', ...slots },
        attachTo: document.body,
    })
}

describe('CaomeiAlert', () => {
    it('复用 CaomeiMessage 的外观层并挂 caomei-alert 钩子', () => {
        const wrapper = mountAlert()

        const root = wrapper.get('.caomei-alert')
        expect(root.classes()).toContain('caomei-message')
        expect(root.classes()).toContain('caomei-message--soft')
        expect(root.classes()).toContain('caomei-message--neutral')
        expect(wrapper.findComponent(CaomeiMessage).exists()).toBe(true)

        wrapper.unmount()
    })

    it('静态档：内容层不渲染 role，整体不构成 live region', () => {
        const wrapper = mountAlert({ title: '标题' })

        const body = wrapper.get('.caomei-message__body')
        expect(body.attributes('role')).toBeUndefined()
        expect(wrapper.find('[role]').exists()).toBe(false)
        expect(wrapper.find('[aria-live]').exists()).toBe(false)

        wrapper.unmount()
    })

    it('tone 与 variant 透传到外观层', () => {
        const wrapper = mountAlert({ tone: 'danger', variant: 'outline' })

        const root = wrapper.get('.caomei-alert')
        expect(root.classes()).toContain('caomei-message--danger')
        expect(root.classes()).toContain('caomei-message--outline')

        wrapper.unmount()
    })

    it('渲染标题与描述（不传默认插槽时取 description）', () => {
        const wrapper = mount(CaomeiAlert, {
            props: { title: '环境提示', description: '当前为沙箱环境。' },
            attachTo: document.body,
        })

        expect(wrapper.get('.caomei-message__title').text()).toBe('环境提示')
        expect(wrapper.get('.caomei-message__content').text()).toBe('当前为沙箱环境。')

        wrapper.unmount()
    })

    it('默认插槽优先于 description', () => {
        const wrapper = mountAlert({ description: '被插槽覆盖' })

        expect(wrapper.get('.caomei-message__content').text()).toBe('描述文本')

        wrapper.unmount()
    })

    it('icon=false 时不渲染图标；#icon 插槽优先', () => {
        const off = mountAlert({ icon: false })
        expect(off.find('.caomei-message__icon').exists()).toBe(false)
        off.unmount()

        const custom = mountAlert({}, { icon: () => h('span', { class: 'demo-icon' }, '!') })
        expect(custom.find('.caomei-message__icon .demo-icon').exists()).toBe(true)
        custom.unmount()
    })

    it('closable 渲染关闭按钮并转发 close 事件', async () => {
        const wrapper = mountAlert({ closable: true })

        const close = wrapper.get('.caomei-message__close')
        await close.trigger('click')

        expect(wrapper.emitted('close')).toHaveLength(1)

        wrapper.unmount()
    })

    it('未提供 #actions 时不渲染操作区容器', () => {
        const wrapper = mountAlert()
        expect(wrapper.find('.caomei-message__actions').exists()).toBe(false)
        wrapper.unmount()
    })

    it('#actions 存在时渲染操作区并转发插槽内容', () => {
        const wrapper = mountAlert({}, { actions: () => h('button', { type: 'button' }, '了解更多') })

        expect(wrapper.get('.caomei-message__actions').text()).toContain('了解更多')

        wrapper.unmount()
    })

    it('size 不透传（不在 Alert 收敛 API 内，须显式过滤）', () => {
        const wrapper = mountAlert({ size: 'lg' })

        const root = wrapper.get('.caomei-alert')
        expect(root.classes()).not.toContain('caomei-message--lg')
        expect(wrapper.findComponent(CaomeiMessage).props('size')).toBe('md')

        wrapper.unmount()
    })

    it('$attrs 透传到外观层根节点', () => {
        const wrapper = mountAlert({ id: 'env-alert' })

        expect(wrapper.get('.caomei-alert').attributes('id')).toBe('env-alert')

        wrapper.unmount()
    })
})
