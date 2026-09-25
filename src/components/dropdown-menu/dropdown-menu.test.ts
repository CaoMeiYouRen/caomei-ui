import { DOMWrapper, enableAutoUnmount, mount } from '@vue/test-utils'
import { defineComponent, h, nextTick } from 'vue'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { DropdownMenuCommandEvent, DropdownMenuModelItem } from './types'
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

/** 数据驱动项模型：`model` 作为 prop 传入 Content */
function mountModel(model: DropdownMenuModelItem[], slotContent?: () => unknown) {
    return mount(CaomeiDropdownMenu, {
        attachTo: document.body,
        slots: {
            default: () => [
                h(CaomeiDropdownMenuTrigger, {}, { default: () => '操作' }),
                h(CaomeiDropdownMenuContent, { model }, { default: slotContent }),
            ],
        },
    })
}

/** 触发器外观豁免场景：`as-child` 复用带自身样式的自定义按钮 */
function mountCustomTrigger(triggerProps: Record<string, unknown> = {}) {
    return mount(CaomeiDropdownMenu, {
        attachTo: document.body,
        slots: {
            default: () => [
                h(CaomeiDropdownMenuTrigger, { asChild: true, ...triggerProps }, {
                    default: () => h('button', { class: 'demo-custom-trigger' }, '自定义按钮'),
                }),
                h(CaomeiDropdownMenuContent, {}, { default: () => h('p', '内容') }),
            ],
        },
    })
}

function getCustomTrigger(): HTMLButtonElement {
    return document.body.querySelector('.demo-custom-trigger') as HTMLButtonElement
}

async function openModelMenu(wrapper: ReturnType<typeof mountModel>) {
    await wrapper.get('.caomei-dropdown-menu__trigger').trigger('click')
    await flush()
}

const modelIcon = defineComponent({
    name: 'ModelIcon',
    render: () => h('svg', { 'data-test': 'model-icon' }),
})

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

    it('关闭态不输出空 aria-controls，开启态指向面板 id', async () => {
        const wrapper = mountMenu()
        const trigger = getTrigger(wrapper)

        // 关闭态省略引用型属性；开启态取值由预注册的面板 id 保证（契约见 _shared/panel-idref）
        expect(trigger.attributes('aria-controls')).toBeUndefined()

        await trigger.trigger('click')
        await flush()

        const content = getContent()
        expect(content?.id).toBeTruthy()
        expect(trigger.attributes('aria-controls')).toBe(content?.id)
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

    it('model 渲染条目并在选中时调用 command（载荷含条目与原始事件）', async () => {
        const onEdit = vi.fn<(event: DropdownMenuCommandEvent) => void>()
        const wrapper = mountModel([{ label: '编辑', command: onEdit }])
        await openModelMenu(wrapper)

        expect(menuItems()).toHaveLength(1)
        expect(menuItems()[0].textContent).toContain('编辑')

        await clickElement(menuItems()[0])
        await flush()

        expect(onEdit).toHaveBeenCalledTimes(1)
        const payload = onEdit.mock.calls[0][0]
        expect(payload.item.label).toBe('编辑')
        expect(payload.originalEvent).toBeInstanceOf(Event)
        // 选中后按既有语义关闭菜单
        expect(getContent()).toBeNull()
    })

    it('model 的 separator 渲染为分隔线且不计入条目', async () => {
        const wrapper = mountModel([{ label: 'A' }, { separator: true }, { label: 'B' }])
        await openModelMenu(wrapper)

        const content = getContent() as HTMLElement
        expect(content.querySelectorAll('[role="separator"]')).toHaveLength(1)
        expect(menuItems()).toHaveLength(2)
        expect(menuItems().map((item) => item.textContent?.trim())).toEqual(['A', 'B'])
    })

    it('separator 忽略其余字段，同时给 command 也不触发', async () => {
        const onCommand = vi.fn()
        const wrapper = mountModel([
            { separator: true, label: '不应渲染的文本', command: onCommand },
            { label: '唯一条目' },
        ])
        await openModelMenu(wrapper)

        expect(menuItems()).toHaveLength(1)
        expect(getContent()?.textContent).not.toContain('不应渲染的文本')
        expect(onCommand).not.toHaveBeenCalled()
    })

    it('model 的 disabled 条目不触发 command 且菜单保持打开', async () => {
        const onDelete = vi.fn()
        const wrapper = mountModel([{ label: '删除', disabled: true, command: onDelete }])
        await openModelMenu(wrapper)

        expect(menuItems()[0].getAttribute('data-disabled')).toBeDefined()
        await clickElement(menuItems()[0])
        await flush()

        expect(onDelete).not.toHaveBeenCalled()
        expect(getContent()).not.toBeNull()
    })

    it('model 的 icon 渲染为图标组件', async () => {
        const wrapper = mountModel([{ label: '编辑', icon: modelIcon }])
        await openModelMenu(wrapper)

        expect(getContent()?.querySelector('[data-test="model-icon"]')).not.toBeNull()
    })

    it('model 与默认插槽共存且 model 渲染在前', async () => {
        const wrapper = mountModel(
            [{ label: '模型条目' }],
            () => h(CaomeiDropdownMenuItem, {}, { default: () => '插槽条目' }),
        )
        await openModelMenu(wrapper)

        expect(menuItems().map((item) => item.textContent?.trim())).toEqual(['模型条目', '插槽条目'])
    })

    it('未传 model 时仅渲染插槽内容', async () => {
        const wrapper = mountMenu()
        await wrapper.get('.caomei-dropdown-menu__trigger').trigger('click')
        await flush()

        expect(menuItems()).toHaveLength(0)
        expect(getContent()?.textContent).toContain('条目')
    })

    it('弹出面板经 Portal 挂载于 body 并带锚点方向属性', async () => {
        const wrapper = mountMenu()
        const trigger = getTrigger(wrapper).element as HTMLElement
        await getTrigger(wrapper).trigger('click')
        await flush()

        const content = getContent() as HTMLElement
        expect(document.body.contains(content)).toBe(true)
        // 面板不在触发器子树内，证明经 Portal 弹出而非就地渲染
        expect(trigger.contains(content)).toBe(false)
        expect(content.getAttribute('data-side')).toBe('bottom')
    })

    it('as-child 复用自定义按钮时默认会把内建触发器外观类合并到子元素', () => {
        const wrapper = mountCustomTrigger()

        expect(getCustomTrigger().classList.contains('caomei-dropdown-menu__trigger')).toBe(true)

        wrapper.unmount()
    })

    it('unstyled 为 true 时不再合并内建触发器外观类且开合不受影响', async () => {
        const wrapper = mountCustomTrigger({ unstyled: true })

        const trigger = getCustomTrigger()
        expect(trigger.classList.contains('caomei-dropdown-menu__trigger')).toBe(false)
        expect(trigger.classList.contains('demo-custom-trigger')).toBe(true)
        expect(trigger.getAttribute('aria-haspopup')).toBe('menu')

        await new DOMWrapper(trigger).trigger('click')
        await flush()
        expect(getContent()).not.toBeNull()

        wrapper.unmount()
    })

    it('渲染条目 / 分组 / 标签 / 分隔线与快捷键提示', async () => {
        const wrapper = mountRich()
        await openMenu(wrapper)

        const content = getContent() as HTMLElement
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
        const wrapper = mountRich({ onCheckbox: (event) => {
            event.preventDefault()
        } })
        await openMenu(wrapper)

        const checkbox = document.body.querySelector<HTMLElement>('[role="menuitemcheckbox"]') as HTMLElement
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
            onRadioA: (event) => {
                event.preventDefault()
            },
            onRadioB: (event) => {
                event.preventDefault()
            },
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

        // 焦点移动经 Reka 的 roving focus 异步落位：用条件轮询替代固定 tick 数，不假设调度时序
        await vi.waitFor(() => {
            expect(document.activeElement?.getAttribute('role')).toBe('menuitemcheckbox')
        })
    })
})
