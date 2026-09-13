import { enableAutoUnmount, mount } from '@vue/test-utils'
import { h, nextTick } from 'vue'
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
    CaomeiDropdownMenu,
    CaomeiDropdownMenuContent,
    CaomeiDropdownMenuTrigger,
} from './index'

enableAutoUnmount(afterEach)

/** 菜单内容经 Portal 挂载到 body，跨多个 tick 生效 */
async function flush() {
    await nextTick()
    await nextTick()
}

function createSlots(triggerProps: Record<string, unknown> = {}) {
    return {
        default: () => [
            h(CaomeiDropdownMenuTrigger, triggerProps, { default: () => '操作' }),
            h(CaomeiDropdownMenuContent, {}, {
                default: () => h('div', { class: 'test-menu-item' }, '条目'),
            }),
        ],
    }
}

function mountMenu(
    props: Record<string, unknown> = {},
    options: Record<string, unknown> = {},
) {
    return mount(CaomeiDropdownMenu, {
        props,
        slots: createSlots(),
        attachTo: document.body,
        ...options,
    })
}

function getTrigger(wrapper: ReturnType<typeof mountMenu>) {
    return wrapper.get('.caomei-dropdown-menu__trigger')
}

function getContent() {
    return document.body.querySelector('.caomei-dropdown-menu__content')
}

/** 在菜单内容上派发 Escape（冒泡至 window，命中 Reka DismissableLayer 的按键监听） */
function pressEscape() {
    const content = getContent()
    if (!content) {
        throw new Error('菜单内容尚未渲染')
    }
    content.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
}

describe('CaomeiDropdownMenu', () => {
    it('触发器初始为闭合且具备菜单 ARIA', () => {
        const wrapper = mountMenu()
        const trigger = getTrigger(wrapper)

        expect(trigger.element.tagName).toBe('BUTTON')
        expect(trigger.attributes('aria-haspopup')).toBe('menu')
        expect(trigger.attributes('aria-expanded')).toBe('false')
        expect(trigger.attributes('data-state')).toBe('closed')
        expect(getContent()).toBeNull()
    })

    it('点击触发器打开菜单并渲染 role=menu 内容', async () => {
        const wrapper = mountMenu()

        await getTrigger(wrapper).trigger('click')
        await flush()

        expect(getTrigger(wrapper).attributes('aria-expanded')).toBe('true')
        const content = getContent()
        expect(content?.getAttribute('role')).toBe('menu')
        expect(content?.textContent).toContain('条目')
    })

    it('Esc 关闭已打开的菜单', async () => {
        const wrapper = mountMenu()

        await getTrigger(wrapper).trigger('click')
        await flush()
        expect(getContent()).not.toBeNull()

        pressEscape()
        await flush()

        expect(getTrigger(wrapper).attributes('aria-expanded')).toBe('false')
        expect(getContent()).toBeNull()
    })

    it('受控时 Esc 抛出 update:open 且不自行关闭', async () => {
        const wrapper = mountMenu({ open: true, 'onUpdate:open': vi.fn() })
        await flush()
        expect(getContent()).not.toBeNull()

        pressEscape()
        await flush()

        expect(wrapper.emitted('update:open')?.[0]).toEqual([false])
        expect(getContent()).not.toBeNull()
    })

    it('禁用的触发器不打开菜单', async () => {
        const wrapper = mountMenu({}, { slots: createSlots({ disabled: true }) })
        const trigger = getTrigger(wrapper)

        expect(trigger.attributes('disabled')).toBeDefined()
        await trigger.trigger('click')
        await flush()

        expect(getContent()).toBeNull()
    })

    it('键盘 ArrowDown 打开菜单', async () => {
        const wrapper = mountMenu()
        const trigger = getTrigger(wrapper)

        ;(trigger.element as HTMLElement).focus()
        await nextTick()
        await trigger.trigger('keydown', { key: 'ArrowDown' })
        await flush()

        expect(getTrigger(wrapper).attributes('aria-expanded')).toBe('true')
    })

    it('class 透传到触发器', () => {
        const wrapper = mountMenu({}, { slots: createSlots({ class: 'custom-trigger' }) })

        expect(getTrigger(wrapper).classes()).toContain('custom-trigger')
    })
})
