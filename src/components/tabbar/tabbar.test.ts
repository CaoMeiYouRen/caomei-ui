import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import CaomeiTabbar from './tabbar.vue'
import CaomeiTabbarItem from './tabbar-item.vue'
import { CaomeiTabbar as CaomeiTabbarExport, CaomeiTabbarItem as CaomeiTabbarItemExport } from './index'

const global = { components: { CaomeiTabbarItem } }

describe('CaomeiTabbar', () => {
    it('渲染主导航地标并使用语言兜底可访问名', () => {
        const wrapper = mount(CaomeiTabbar, { global })

        const nav = wrapper.get('nav.caomei-tabbar')
        expect(nav.attributes('aria-label')).toBe('主导航')
        expect(wrapper.find('.caomei-tabbar--fixed').exists()).toBe(false)
    })

    it('显式 label 优先于透传 aria-label', () => {
        const wrapper = mount(CaomeiTabbar, {
            props: { label: '底部导航' },
            attrs: { 'aria-label': '透传名' },
            global,
        })

        expect(wrapper.get('nav').attributes('aria-label')).toBe('底部导航')
    })

    it('未提供 label 时保留透传的 aria-label', () => {
        const wrapper = mount(CaomeiTabbar, {
            attrs: { 'aria-label': '透传名' },
            global,
        })

        expect(wrapper.get('nav').attributes('aria-label')).toBe('透传名')
    })

    it('fixed 开关切换吸底类名', () => {
        const wrapper = mount(CaomeiTabbar, { props: { fixed: true }, global })

        expect(wrapper.get('nav').classes()).toContain('caomei-tabbar--fixed')
    })

    it('条目点击后通过 v-model 上报新值', async () => {
        const onUpdate = vi.fn()
        const wrapper = mount(CaomeiTabbar, {
            props: {
                modelValue: 'home',
                'onUpdate:modelValue': onUpdate,
            },
            slots: {
                default: `
                    <CaomeiTabbarItem value="home" label="首页" />
                    <CaomeiTabbarItem value="me" label="我的" />
                `,
            },
            global,
        })

        await wrapper.findAll('.caomei-tabbar-item')[1].trigger('click')
        expect(onUpdate).toHaveBeenCalledWith('me')
    })

    it('同一时刻只有一个条目带 aria-current="page"', () => {
        const wrapper = mount(CaomeiTabbar, {
            props: { modelValue: 'me' },
            slots: {
                default: `
                    <CaomeiTabbarItem value="home" label="首页" />
                    <CaomeiTabbarItem value="me" label="我的" />
                `,
            },
            global,
        })

        const items = wrapper.findAll('.caomei-tabbar-item')
        expect(items[0].attributes('aria-current')).toBeUndefined()
        expect(items[1].attributes('aria-current')).toBe('page')
        expect(wrapper.findAll('[aria-current="page"]')).toHaveLength(1)
    })

    it('禁用条目不触发选择', async () => {
        const onUpdate = vi.fn()
        const wrapper = mount(CaomeiTabbar, {
            props: {
                modelValue: 'home',
                'onUpdate:modelValue': onUpdate,
            },
            slots: {
                default: '<CaomeiTabbarItem value="disabled" label="禁用" disabled />',
            },
            global,
        })

        const item = wrapper.get('.caomei-tabbar-item')
        expect(item.attributes('disabled')).toBeDefined()
        await item.trigger('click')
        expect(onUpdate).not.toHaveBeenCalled()
    })

    it('items 数据驱动渲染，并由 #item 插槽替换文案', () => {
        const wrapper = mount(CaomeiTabbar, {
            props: {
                modelValue: 'b',
                items: [
                    { value: 'a', label: '甲' },
                    { value: 'b', label: '乙', badge: 3 },
                ],
            },
            slots: {
                item: ({ item, active }: { item: { label?: string }, active: boolean }) =>
                    `${item.label}${active ? '*' : ''}`,
            },
            global,
        })

        const items = wrapper.findAll('.caomei-tabbar-item')
        expect(items).toHaveLength(2)
        expect(items[0].text()).toBe('甲')
        expect(items[1].text()).toContain('乙*')
        expect(items[1].get('.caomei-badge').text()).toBe('3')
    })

    it('提供 items 时不渲染默认插槽', () => {
        const wrapper = mount(CaomeiTabbar, {
            props: { items: [{ value: 'a' }] },
            slots: { default: '<span data-test="fallback">兜底</span>' },
            global,
        })

        expect(wrapper.find('[data-test="fallback"]').exists()).toBe(false)
        expect(wrapper.findAll('.caomei-tabbar-item')).toHaveLength(1)
    })
})

describe('CaomeiTabbarItem', () => {
    it('无上下文时渲染为未选中按钮且点击不报错', async () => {
        const wrapper = mount(CaomeiTabbarItem, {
            props: { value: 'x', label: '独立' },
        })

        const item = wrapper.get('button.caomei-tabbar-item')
        expect(item.attributes('aria-current')).toBeUndefined()
        await item.trigger('click')
        expect(item.text()).toBe('独立')
    })

    it('#icon 插槽可自定义图标内容', () => {
        const wrapper = mount(CaomeiTabbarItem, {
            props: { value: 'x', label: '独立' },
            slots: { icon: '<span data-test="icon">i</span>' },
        })

        expect(wrapper.find('[data-test="icon"]').exists()).toBe(true)
    })

    it('入口导出与文件组件同一实现', () => {
        expect(CaomeiTabbarExport).toBe(CaomeiTabbar)
        expect(CaomeiTabbarItemExport).toBe(CaomeiTabbarItem)
    })
})
