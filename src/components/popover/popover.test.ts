import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h, nextTick, ref } from 'vue'
import {
    CaomeiPopover,
    CaomeiPopoverArrow,
    CaomeiPopoverClose,
    CaomeiPopoverContent,
    CaomeiPopoverTrigger,
} from './index'

function contentSlot() {
    return [
        h('p', { class: 'demo-body' }, '浮层内容'),
        h(CaomeiPopoverArrow),
        h(CaomeiPopoverClose, { label: '关闭' }, { default: () => '关闭' }),
    ]
}

/** 非受控：不传 open，点击后由组件内部模型驱动 */
function mountPopover(props: Record<string, unknown> = {}, contentProps: Record<string, unknown> = {}) {
    const wrapper = mount(CaomeiPopover, {
        props,
        attachTo: document.body,
        slots: {
            default: () => [
                h(CaomeiPopoverTrigger, { 'aria-label': '打开浮层' }, { default: () => '打开' }),
                h(CaomeiPopoverContent, contentProps, { default: contentSlot }),
            ],
        },
    })
    return wrapper
}

/** 受控：由父级 ref 回写 open，验证关闭行为 */
function mountControlled(initialOpen: boolean, contentProps: Record<string, unknown> = {}) {
    const open = ref(initialOpen)
    const wrapper = mount(defineComponent({
        setup() {
            return () => h(
                CaomeiPopover,
                {
                    open: open.value,
                    'onUpdate:open': (value: boolean) => {
                        open.value = value
                    },
                },
                {
                    default: () => [
                        h(CaomeiPopoverTrigger, { 'aria-label': '打开浮层' }, { default: () => '打开' }),
                        h(CaomeiPopoverContent, contentProps, { default: contentSlot }),
                    ],
                },
            )
        },
    }), { attachTo: document.body })
    return { wrapper, open }
}

function getTrigger(): HTMLElement | null {
    return document.querySelector('.caomei-popover__trigger')
}

function getContent(): HTMLElement | null {
    return document.querySelector('.caomei-popover__content')
}

/**
 * 触发器外观豁免场景：`as-child` 复用带自身样式的自定义按钮。
 * 断言子元素是否被合并内建外观类（`.caomei-popover__trigger`）。
 */
function mountCustomTrigger(triggerProps: Record<string, unknown> = {}) {
    return mount(CaomeiPopover, {
        attachTo: document.body,
        slots: {
            default: () => [
                h(CaomeiPopoverTrigger, { asChild: true, ...triggerProps }, {
                    default: () => h('button', { class: 'demo-custom-trigger' }, '自定义按钮'),
                }),
                h(CaomeiPopoverContent, { default: () => h('p', '浮层内容') }),
            ],
        },
    })
}

function getCustomTrigger(): HTMLButtonElement {
    return document.querySelector('.demo-custom-trigger') as HTMLButtonElement
}

afterEach(() => {
    document.body.innerHTML = ''
})

describe('CaomeiPopover', () => {
    it('默认关闭时仅渲染触发器并输出折叠语义', () => {
        const wrapper = mountPopover()

        expect(getTrigger()?.getAttribute('aria-haspopup')).toBe('dialog')
        expect(getTrigger()?.getAttribute('aria-expanded')).toBe('false')
        expect(getTrigger()?.getAttribute('data-state')).toBe('closed')
        expect(getContent()).toBeNull()

        wrapper.unmount()
    })

    it('点击触发器打开面板并输出对话框语义', async () => {
        const wrapper = mountPopover()

        ;(getTrigger() as HTMLElement).click()
        await nextTick()
        await nextTick()

        const trigger = getTrigger() as HTMLElement
        const content = getContent() as HTMLElement
        expect(content).not.toBeNull()
        expect(content.getAttribute('role')).toBe('dialog')
        expect(content.getAttribute('aria-labelledby')).toBe(trigger.id)
        expect(trigger.getAttribute('aria-expanded')).toBe('true')
        expect(trigger.getAttribute('data-state')).toBe('open')
        expect(trigger.getAttribute('aria-controls')).toBe(content.id)

        wrapper.unmount()
    })

    it('受控时点击抛出 update:open', async () => {
        const wrapper = mountPopover({ open: false, 'onUpdate:open': vi.fn() })

        ;(getTrigger() as HTMLElement).click()
        await nextTick()

        expect(wrapper.emitted('update:open')?.[0]).toEqual([true])

        wrapper.unmount()
    })

    it('点击关闭按钮关闭面板', async () => {
        const { wrapper, open } = mountControlled(true)
        await nextTick()

        expect(getContent()).not.toBeNull()
        ;(document.querySelector('.caomei-popover__close') as HTMLElement).click()
        await nextTick()
        await nextTick()

        expect(open.value).toBe(false)
        expect(getTrigger()?.getAttribute('aria-expanded')).toBe('false')
        expect(getTrigger()?.getAttribute('data-state')).toBe('closed')

        wrapper.unmount()
    })

    it('Escape 关闭面板', async () => {
        const { wrapper, open } = mountControlled(true)
        await nextTick()

        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
        await nextTick()
        await nextTick()

        expect(open.value).toBe(false)
        expect(getTrigger()?.getAttribute('aria-expanded')).toBe('false')

        wrapper.unmount()
    })

    it('禁用触发器不打开面板', async () => {
        const wrapper = mount(CaomeiPopover, {
            attachTo: document.body,
            slots: {
                default: () => [
                    h(CaomeiPopoverTrigger, { disabled: true }, { default: () => '打开' }),
                    h(CaomeiPopoverContent, {}, { default: () => '内容' }),
                ],
            },
        })

        const trigger = getTrigger() as HTMLElement
        expect(trigger.hasAttribute('disabled')).toBe(true)

        trigger.click()
        await nextTick()
        expect(getContent()).toBeNull()

        wrapper.unmount()
    })

    it('side 与 align 传到面板 data 属性', async () => {
        const { wrapper } = mountControlled(true, { side: 'top', align: 'start' })
        await nextTick()

        const content = getContent() as HTMLElement
        expect(content.getAttribute('data-side')).toBe('top')
        expect(content.getAttribute('data-align')).toBe('start')

        wrapper.unmount()
    })

    it('as-child 复用自定义按钮时默认会把内建触发器外观类合并到子元素', () => {
        const wrapper = mountCustomTrigger()

        expect(getCustomTrigger().classList.contains('caomei-popover__trigger')).toBe(true)

        wrapper.unmount()
    })

    it('unstyled 为 true 时不再合并内建触发器外观类', () => {
        const wrapper = mountCustomTrigger({ unstyled: true })

        expect(getCustomTrigger().classList.contains('caomei-popover__trigger')).toBe(false)
        expect(getCustomTrigger().classList.contains('demo-custom-trigger')).toBe(true)

        wrapper.unmount()
    })

    it('unstyled 仅去掉外观类，开合与无障碍接线保持', async () => {
        const wrapper = mountCustomTrigger({ unstyled: true })
        await nextTick()

        const trigger = getCustomTrigger()
        expect(trigger.getAttribute('aria-haspopup')).toBe('dialog')
        expect(trigger.getAttribute('aria-expanded')).toBe('false')

        trigger.click()
        await nextTick()

        expect(trigger.getAttribute('aria-expanded')).toBe('true')
        expect(getContent()).not.toBeNull()

        wrapper.unmount()
    })

    it('渲染箭头与关闭按钮', async () => {
        const { wrapper } = mountControlled(true)
        await nextTick()

        expect(document.querySelector('svg.caomei-popover__arrow')).not.toBeNull()
        const close = document.querySelector('.caomei-popover__close')
        expect(close).not.toBeNull()
        expect(close?.getAttribute('aria-label')).toBe('关闭')

        wrapper.unmount()
    })

    it('强制挂载时关闭状态也渲染面板', async () => {
        const wrapper = mountPopover({}, { forceMount: true })
        await nextTick()

        expect(getContent()).not.toBeNull()
        expect(getContent()?.getAttribute('data-state')).toBe('closed')

        wrapper.unmount()
    })
})
