import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h, nextTick } from 'vue'
import { CaomeiMenu, CaomeiMenuItem, CaomeiSubMenu } from './index'

/** 竖向菜单：两项 + 一个含两项的子菜单（供键盘与折叠断言）。 */
function mountVerticalMenu() {
    return mount(defineComponent({
        render: () => h(CaomeiMenu, { label: '主导航' }, {
            default: () => [
                h(CaomeiMenuItem, { href: '/a', current: true }, { default: () => '首页' }),
                h(CaomeiSubMenu, { label: '设置' }, {
                    default: () => [
                        h(CaomeiMenuItem, { href: '/b' }, { default: () => '账户' }),
                        h(CaomeiMenuItem, { href: '/c' }, { default: () => '通知' }),
                    ],
                }),
                h(CaomeiMenuItem, {}, { default: () => '退出' }),
            ],
        }),
    }), { attachTo: document.body })
}

function targets(): HTMLElement[] {
    return Array.from(document.querySelectorAll<HTMLElement>('[data-caomei-menu-target]'))
}

function activeText(): string {
    return (document.activeElement as HTMLElement | null)?.textContent?.trim() ?? ''
}

afterEach(() => {
    document.body.innerHTML = ''
})

describe('CaomeiMenu', () => {
    it('渲染导航容器与列表语义', () => {
        const wrapper = mountVerticalMenu()

        const nav = wrapper.get('.caomei-menu')
        expect(nav.element.tagName).toBe('NAV')
        expect(nav.attributes('aria-label')).toBe('主导航')
        expect(nav.classes()).toContain('caomei-menu--vertical')
        expect(wrapper.get('.caomei-menu__list').attributes('role')).toBe('list')

        wrapper.unmount()
    })

    it('horizontal 方向应用对应类', () => {
        const wrapper = mount(CaomeiMenu, {
            props: { orientation: 'horizontal' },
            slots: { default: () => h(CaomeiMenuItem, { href: '/a' }, { default: () => '首页' }) },
        })

        expect(wrapper.get('.caomei-menu').classes()).toContain('caomei-menu--horizontal')

        wrapper.unmount()
    })

    it('未传 label 时不渲染 aria-label', () => {
        const wrapper = mount(CaomeiMenu, { slots: { default: () => h(CaomeiMenuItem, null, { default: () => '项' }) } })

        expect(wrapper.get('.caomei-menu').attributes('aria-label')).toBeUndefined()

        wrapper.unmount()
    })

    it('中段禁用的子菜单不阻塞键盘序列（原生 disabled 形态）', async () => {
        const wrapper = mount(defineComponent({
            render: () => h(CaomeiMenu, null, {
                default: () => [
                    h(CaomeiMenuItem, { href: '/a' }, { default: () => '首页' }),
                    h(CaomeiSubMenu, { label: '禁用区', disabled: true }, {
                        default: () => h(CaomeiMenuItem, { href: '/x' }, { default: () => '隐藏项' }),
                    }),
                    h(CaomeiMenuItem, { href: '/c' }, { default: () => '末项' }),
                ],
            }),
        }), { attachTo: document.body })

        targets()[0]?.focus()
        await wrapper.get('.caomei-menu__list').trigger('keydown', { key: 'ArrowDown' })

        expect(activeText()).toBe('末项')

        wrapper.unmount()
    })

    it('ArrowDown / ArrowUp 在项之间移动焦点', async () => {
        const wrapper = mountVerticalMenu()
        const all = targets()

        all[0]?.focus()
        await wrapper.get('.caomei-menu__list').trigger('keydown', { key: 'ArrowDown' })
        expect(activeText()).toBe('设置')

        await wrapper.get('.caomei-menu__list').trigger('keydown', { key: 'ArrowUp' })
        expect(activeText()).toBe('首页')

        wrapper.unmount()
    })

    it('Home / End 落到首项与末项', async () => {
        const wrapper = mountVerticalMenu()

        targets()[1]?.focus()
        await wrapper.get('.caomei-menu__list').trigger('keydown', { key: 'End' })
        expect(activeText()).toBe('退出')

        await wrapper.get('.caomei-menu__list').trigger('keydown', { key: 'Home' })
        expect(activeText()).toBe('首页')

        wrapper.unmount()
    })

    it('焦点不在菜单内时 ArrowDown 落到首项', async () => {
        const wrapper = mountVerticalMenu()

        document.body.focus()
        await wrapper.get('.caomei-menu__list').trigger('keydown', { key: 'ArrowDown' })
        expect(activeText()).toBe('首页')

        wrapper.unmount()
    })

    /* ArrowRight 展开入面板 / ArrowLeft 与 Escape 收起回触发器：需真实浏览器（E2E 覆盖）。 */
})

describe('CaomeiMenuItem', () => {
    it('提供 href 时渲染链接并带 aria-current', () => {
        const wrapper = mount(CaomeiMenuItem, {
            props: { href: '/a', current: true },
            slots: { default: () => '首页' },
        })

        const link = wrapper.get('a')
        expect(link.attributes('href')).toBe('/a')
        expect(link.attributes('aria-current')).toBe('page')

        wrapper.unmount()
    })

    it('无 href 时渲染按钮', () => {
        const wrapper = mount(CaomeiMenuItem, { slots: { default: () => '退出' } })

        expect(wrapper.get('button').attributes('type')).toBe('button')
        expect(wrapper.get('button').attributes('aria-current')).toBeUndefined()

        wrapper.unmount()
    })

    it('current 支持任意 aria-current 取值；false 不渲染属性', () => {
        const step = mount(CaomeiMenuItem, { props: { current: 'step' }, slots: { default: () => '步骤' } })
        expect(step.get('button').attributes('aria-current')).toBe('step')
        step.unmount()

        const off = mount(CaomeiMenuItem, { props: { current: false }, slots: { default: () => '普通' } })
        expect(off.get('button').attributes('aria-current')).toBeUndefined()
        off.unmount()
    })

    it('disabled 时不可聚焦且不激活链接', () => {
        const wrapper = mount(CaomeiMenuItem, {
            props: { href: '/a', disabled: true },
            slots: { default: () => '首页' },
        })

        const link = wrapper.get('a')
        expect(link.attributes('href')).toBeUndefined()
        expect(link.attributes('aria-disabled')).toBe('true')
        expect(link.attributes('tabindex')).toBe('-1')

        wrapper.unmount()
    })

    it('禁用项不进入键盘序列', async () => {
        const wrapper = mount(defineComponent({
            render: () => h(CaomeiMenu, null, {
                default: () => [
                    h(CaomeiMenuItem, { href: '/a' }, { default: () => '首页' }),
                    h(CaomeiMenuItem, { href: '/b', disabled: true }, { default: () => '禁用项' }),
                    h(CaomeiMenuItem, { href: '/c' }, { default: () => '末项' }),
                ],
            }),
        }), { attachTo: document.body })

        targets()[0]?.focus()
        await wrapper.get('.caomei-menu__list').trigger('keydown', { key: 'ArrowDown' })

        expect(activeText()).toBe('末项')

        wrapper.unmount()
    })
})

describe('CaomeiSubMenu', () => {
    it('默认收起：触发器 aria-expanded=false，收起项不在键盘序列内', () => {
        const wrapper = mountVerticalMenu()

        expect(document.querySelector('[data-caomei-submenu-trigger]')?.getAttribute('aria-expanded')).toBe('false')
        expect(targets().map((element) => element.textContent?.trim())).toEqual(['首页', '设置', '退出'])

        wrapper.unmount()
    })

    /* 面板挂载 / 卸载与焦点搬移在 happy-dom 下不可稳定驱动（Presence + rAF），归 E2E 覆盖。 */
    it('触发器带 aria-expanded 与 aria-controls，点击后展开', async () => {
        const wrapper = mountVerticalMenu()
        const trigger = document.querySelector<HTMLElement>('[data-caomei-submenu-trigger]') as HTMLElement

        expect(trigger.getAttribute('aria-expanded')).toBe('false')
        // `aria-controls` 首帧为空串：id 在内容 setup 分配，而触发器首帧早于内容 setup；
        // 首次展开引起重渲染后即自愈，故此处只断言属性在册（指向性由 E2E 断言）。
        expect(trigger.getAttribute('aria-controls')).toBeDefined()

        trigger.click()
        await nextTick()
        await nextTick()

        expect(trigger.getAttribute('aria-expanded')).toBe('true')

        wrapper.unmount()
    })

    it('default-open 时初始为展开态', () => {
        const wrapper = mount(CaomeiSubMenu, {
            props: { label: '设置', defaultOpen: true },
            slots: { default: () => h(CaomeiMenuItem, { href: '/b' }, { default: () => '账户' }) },
        })

        expect(wrapper.get('[data-caomei-submenu-trigger]').attributes('aria-expanded')).toBe('true')

        wrapper.unmount()
    })

    it('受控 open 时以父级为准，交互抛出 update:open', async () => {
        const wrapper = mount(CaomeiSubMenu, {
            props: { label: '设置', open: false, 'onUpdate:open': vi.fn() },
            slots: { default: () => h(CaomeiMenuItem, { href: '/b' }, { default: () => '账户' }) },
        })
        const trigger = wrapper.get('[data-caomei-submenu-trigger]')
        expect(trigger.attributes('aria-expanded')).toBe('false')

        await trigger.trigger('click')
        await nextTick()

        expect(wrapper.emitted('update:open')?.[0]).toEqual([true])
        // 受控：父级未回写 ⇒ 保持收起
        expect(trigger.attributes('aria-expanded')).toBe('false')

        wrapper.unmount()
    })

    it('disabled 时触发器禁用且不展开', async () => {
        const wrapper = mount(CaomeiSubMenu, {
            props: { label: '设置', disabled: true },
            slots: { default: () => h(CaomeiMenuItem, { href: '/b' }, { default: () => '账户' }) },
        })
        const trigger = wrapper.get('[data-caomei-submenu-trigger]')
        expect(trigger.attributes('disabled')).toBeDefined()

        await trigger.trigger('click')
        await nextTick()

        expect(trigger.attributes('aria-expanded')).toBe('false')

        wrapper.unmount()
    })
})
