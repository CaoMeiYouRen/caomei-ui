import { DOMWrapper, enableAutoUnmount, mount } from '@vue/test-utils'
import { h, nextTick } from 'vue'
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
    CaomeiDropdownMenu,
    CaomeiDropdownMenuCheckboxItem,
    CaomeiDropdownMenuContent,
    CaomeiDropdownMenuGroup,
    CaomeiDropdownMenuItem,
    CaomeiDropdownMenuLabel,
    CaomeiDropdownMenuRadioGroup,
    CaomeiDropdownMenuRadioItem,
    CaomeiDropdownMenuSeparator,
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

function createRichSlots(handlers: Record<string, (event: Event) => void> = {}) {
    return {
        default: () => [
            h(CaomeiDropdownMenuTrigger, {}, { default: () => '操作' }),
            h(CaomeiDropdownMenuContent, {}, {
                default: () => [
                    h(CaomeiDropdownMenuLabel, {}, { default: () => '分组标题' }),
                    h(CaomeiDropdownMenuGroup, {}, {
                        default: () => [
                            h(CaomeiDropdownMenuItem, { shortcut: '⌘E', onSelect: handlers.onEdit }, { default: () => '编辑' }),
                            h(CaomeiDropdownMenuItem, { disabled: true, onSelect: handlers.onDisabled }, { default: () => '删除' }),
                        ],
                    }),
                    h(CaomeiDropdownMenuSeparator),
                    h(CaomeiDropdownMenuCheckboxItem, { onSelect: handlers.onCheckbox }, { default: () => '显示隐藏项' }),
                    h(CaomeiDropdownMenuRadioGroup, {}, {
                        default: () => [
                            h(CaomeiDropdownMenuRadioItem, { value: 'a', onSelect: handlers.onRadioA }, { default: () => '选项 A' }),
                            h(CaomeiDropdownMenuRadioItem, { value: 'b', onSelect: handlers.onRadioB }, { default: () => '选项 B' }),
                        ],
                    }),
                ],
            }),
        ],
    }
}

function mountRich(
    handlers: Record<string, (event: Event) => void> = {},
    props: Record<string, unknown> = {},
) {
    return mount(CaomeiDropdownMenu, {
        props,
        slots: createRichSlots(handlers),
        attachTo: document.body,
    })
}

async function openMenu(wrapper: ReturnType<typeof mountRich>) {
    await wrapper.get('.caomei-dropdown-menu__trigger').trigger('click')
    await flush()
}

function menuItems() {
    return Array.from(document.body.querySelectorAll<HTMLElement>('.caomei-dropdown-menu__item'))
}

async function clickElement(element: Element) {
    await new DOMWrapper(element).trigger('click')
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

    it('渲染条目 / 分组 / 标签 / 分隔线与快捷键提示', async () => {
        const wrapper = mountRich()
        await openMenu(wrapper)

        const content = getContent()!
        expect(content.querySelectorAll('[role="menuitem"]')).toHaveLength(2)
        expect(content.querySelectorAll('[role="menuitemcheckbox"]')).toHaveLength(1)
        expect(content.querySelectorAll('[role="menuitemradio"]')).toHaveLength(2)
        expect(content.querySelectorAll('[role="separator"]')).toHaveLength(1)
        expect(content.querySelector('.caomei-dropdown-menu__label')?.textContent).toContain('分组标题')
        expect(content.textContent).toContain('⌘E')
    })

    it('点击条目触发 select 并关闭菜单', async () => {
        const onEdit = vi.fn()
        const wrapper = mountRich({ onEdit })
        await openMenu(wrapper)

        await clickElement(menuItems()[0])
        await flush()

        expect(onEdit).toHaveBeenCalledTimes(1)
        expect(getContent()).toBeNull()
    })

    it('禁用条目不触发 select 且菜单保持打开', async () => {
        const onDisabled = vi.fn()
        const wrapper = mountRich({ onDisabled })
        await openMenu(wrapper)

        await clickElement(menuItems()[1])
        await flush()

        expect(onDisabled).not.toHaveBeenCalled()
        expect(getContent()).not.toBeNull()
    })

    it('勾选项在选中与未选中间切换', async () => {
        const wrapper = mountRich({ onCheckbox: (event) => event.preventDefault() })
        await openMenu(wrapper)

        const checkbox = document.body.querySelector<HTMLElement>('[role="menuitemcheckbox"]')!
        expect(checkbox.getAttribute('data-state')).toBe('unchecked')

        await clickElement(checkbox)
        await flush()
        expect(checkbox.getAttribute('data-state')).toBe('checked')

        await clickElement(checkbox)
        await flush()
        expect(checkbox.getAttribute('data-state')).toBe('unchecked')
    })

    it('单选组在选项间切换选中', async () => {
        const wrapper = mountRich({
            onRadioA: (event) => event.preventDefault(),
            onRadioB: (event) => event.preventDefault(),
        })
        await openMenu(wrapper)

        const radios = Array.from(document.body.querySelectorAll<HTMLElement>('[role="menuitemradio"]'))
        expect(radios[0].getAttribute('data-state')).toBe('unchecked')

        await clickElement(radios[0])
        await flush()
        expect(radios[0].getAttribute('data-state')).toBe('checked')

        await clickElement(radios[1])
        await flush()
        expect(radios[1].getAttribute('data-state')).toBe('checked')
        expect(radios[0].getAttribute('data-state')).toBe('unchecked')
    })

    it('键盘打开后聚焦条目并可用方向键在可用条目间移动', async () => {
        const wrapper = mountRich()
        const trigger = getTrigger(wrapper)

        ;(trigger.element as HTMLElement).focus()
        await nextTick()
        await trigger.trigger('keydown', { key: 'ArrowDown' })
        await flush()

        expect(getContent()).not.toBeNull()
        expect(document.activeElement?.getAttribute('role')).toBe('menuitem')

        await new DOMWrapper(document.activeElement as Element).trigger('keydown', { key: 'ArrowDown' })
        await nextTick()

        expect(document.activeElement?.getAttribute('role')).toBe('menuitemcheckbox')
    })
})
