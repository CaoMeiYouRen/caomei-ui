import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h, nextTick, ref } from 'vue'
import { TooltipRoot } from 'reka-ui'
import {
    CaomeiTooltip,
    CaomeiTooltipArrow,
    CaomeiTooltipContent,
    CaomeiTooltipProvider,
    CaomeiTooltipTrigger,
} from './index'

/** Reka 的 `TooltipRoot` 在缺 `TooltipProvider` 时会抛错，故夹具统一包一层 Provider。 */
function withProvider(children: () => unknown) {
    return defineComponent({
        render: () => h(CaomeiTooltipProvider, null, { default: children }),
    })
}

/** 非受控：不传 open，由组件内部模型驱动 */
function mountTooltip(props: Record<string, unknown> = {}, contentProps: Record<string, unknown> = {}) {
    return mount(withProvider(() => h(
        CaomeiTooltip,
        props,
        {
            default: () => [
                h(CaomeiTooltipTrigger, { 'aria-label': '查看提示' }, { default: () => '提示' }),
                h(CaomeiTooltipContent, contentProps, { default: () => '提示内容' }),
            ],
        },
    )), { attachTo: document.body })
}

/** 受控：由父级 ref 回写 open，验证开合接线 */
function mountControlled(initialOpen: boolean, contentProps: Record<string, unknown> = {}) {
    const open = ref(initialOpen)
    const wrapper = mount(withProvider(() => h(
        CaomeiTooltip,
        {
            open: open.value,
            'onUpdate:open': (value: boolean) => {
                open.value = value
            },
        },
        {
            default: () => [
                h(CaomeiTooltipTrigger, { 'aria-label': '查看提示' }, { default: () => '提示' }),
                h(CaomeiTooltipContent, contentProps, { default: () => '提示内容' }),
            ],
        },
    )), { attachTo: document.body })
    return { wrapper, open }
}

function getTrigger(): HTMLElement | null {
    return document.querySelector('.caomei-tooltip__trigger')
}

function getContent(): HTMLElement | null {
    return document.querySelector('.caomei-tooltip__content')
}

/**
 * 工具提示的可访问描述元素。
 *
 * Reka 的契约：`role="tooltip"` 落在面板内一个**视觉隐藏**元素上（其 `id` 即触发器
 * `aria-describedby` 的指向），可见文本同时作为它的可访问内容。
 */
function getDescription(): HTMLElement | null {
    return document.querySelector('[role="tooltip"]')
}

/** `as-child` 复用自定义控件的场景：断言内建外观类是否被合并到子元素。 */
function mountCustomTrigger(triggerProps: Record<string, unknown> = {}) {
    return mount(withProvider(() => h(
        CaomeiTooltip,
        null,
        {
            default: () => [
                h(CaomeiTooltipTrigger, { asChild: true, ...triggerProps }, {
                    default: () => h('button', { class: 'demo-custom-trigger' }, '自定义触发器'),
                }),
                h(CaomeiTooltipContent, null, { default: () => '提示内容' }),
            ],
        },
    )), { attachTo: document.body })
}

function getCustomTrigger(): HTMLButtonElement {
    return document.querySelector('.demo-custom-trigger') as HTMLButtonElement
}

afterEach(() => {
    document.body.innerHTML = ''
})

describe('CaomeiTooltip', () => {
    it('默认关闭：只渲染触发器，无面板、无描述关联', () => {
        const wrapper = mountTooltip()

        expect(getTrigger()?.tagName).toBe('BUTTON')
        expect(getTrigger()?.getAttribute('data-state')).toBe('closed')
        expect(getContent()).toBeNull()
        expect(getTrigger()?.hasAttribute('aria-describedby')).toBe(false)

        wrapper.unmount()
    })

    it('展开时面板输出 role=tooltip，触发器经 aria-describedby 关联描述元素', async () => {
        const { wrapper } = mountControlled(true)
        await nextTick()

        const trigger = getTrigger() as HTMLElement
        const description = getDescription()
        expect(description).not.toBeNull()
        expect(description?.textContent).toBe('提示内容')
        expect(trigger.getAttribute('aria-describedby')).toBe(description?.id)
        // Reka 在「打开且无过渡延迟」时输出 `instant-open`，故按包含判定而非全等
        expect(trigger.getAttribute('data-state')).toContain('open')

        wrapper.unmount()
    })

    it('不构成焦点陷阱：展开不移动焦点、面板不是对话框语义', async () => {
        const { wrapper } = mountControlled(true)
        await nextTick()

        const content = getContent() as HTMLElement
        expect(content.getAttribute('role')).not.toBe('dialog')
        expect(getDescription()?.getAttribute('role')).toBe('tooltip')
        // 与 Popover 不同：工具提示不把焦点移入面板（面板为纯描述性内容）
        expect(document.activeElement).not.toBe(content)
        expect(content.contains(document.activeElement)).toBe(false)

        wrapper.unmount()
    })

    it('受控时打开抛出 update:open', async () => {
        const wrapper = mountTooltip({ open: false, 'onUpdate:open': vi.fn() })

        ;(getTrigger() as HTMLElement).focus()
        await nextTick()

        expect(wrapper.findComponent(CaomeiTooltip).emitted('update:open')?.[0]).toEqual([true])

        wrapper.unmount()
    })

    it('Escape 关闭面板', async () => {
        const { wrapper, open } = mountControlled(true)
        await nextTick()

        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
        await nextTick()
        await nextTick()

        expect(open.value).toBe(false)
        expect(getTrigger()?.getAttribute('data-state')).toBe('closed')

        wrapper.unmount()
    })

    it('disabled 时不打开面板', async () => {
        const { wrapper } = mountControlled(false)
        wrapper.unmount()
        document.body.innerHTML = ''

        const disabledWrapper = mount(withProvider(() => h(
            CaomeiTooltip,
            { disabled: true },
            {
                default: () => [
                    h(CaomeiTooltipTrigger, { 'aria-label': '查看提示' }, { default: () => '提示' }),
                    h(CaomeiTooltipContent, null, { default: () => '提示内容' }),
                ],
            },
        )), { attachTo: document.body })

        ;(getTrigger() as HTMLElement).focus()
        await nextTick()
        await nextTick()

        expect(getContent()).toBeNull()

        disabledWrapper.unmount()
    })

    it('side 与 align 传到面板 data 属性', async () => {
        const { wrapper } = mountControlled(true, { side: 'bottom', align: 'start' })
        await nextTick()

        const content = getContent() as HTMLElement
        expect(content.getAttribute('data-side')).toBe('bottom')
        expect(content.getAttribute('data-align')).toBe('start')

        wrapper.unmount()
    })

    it('ariaLabel 覆盖描述元素的可访问内容', async () => {
        const { wrapper } = mountControlled(true, { ariaLabel: '更多说明' })
        await nextTick()

        expect(getDescription()?.textContent).toBe('更多说明')

        wrapper.unmount()
    })

    it('渲染箭头', async () => {
        const wrapper = mount(withProvider(() => h(
            CaomeiTooltip,
            { open: true },
            {
                default: () => [
                    h(CaomeiTooltipTrigger, { 'aria-label': '查看提示' }, { default: () => '提示' }),
                    h(CaomeiTooltipContent, null, {
                        default: () => [h('span', '提示内容'), h(CaomeiTooltipArrow)],
                    }),
                ],
            },
        )), { attachTo: document.body })
        await nextTick()

        expect(document.querySelector('svg.caomei-tooltip__arrow')).not.toBeNull()

        wrapper.unmount()
    })

    it('as-child 复用自定义控件时默认合并内建外观类', () => {
        const wrapper = mountCustomTrigger()

        expect(getCustomTrigger().classList.contains('caomei-tooltip__trigger')).toBe(true)

        wrapper.unmount()
    })

    it('unstyled 为 true 时不再合并内建外观类，但接线保持', async () => {
        const wrapper = mountCustomTrigger({ unstyled: true })
        await nextTick()

        const trigger = getCustomTrigger()
        expect(trigger.classList.contains('caomei-tooltip__trigger')).toBe(false)
        expect(trigger.classList.contains('demo-custom-trigger')).toBe(true)
        expect(trigger.getAttribute('data-state')).toBe('closed')

        wrapper.unmount()
    })

    it('强制挂载时关闭状态也渲染面板', async () => {
        const wrapper = mountTooltip({}, { forceMount: true })
        await nextTick()

        expect(getContent()).not.toBeNull()
        expect(getContent()?.getAttribute('data-state')).toBe('closed')

        wrapper.unmount()
    })
})

describe('CaomeiTooltipProvider', () => {
    it('不渲染自有 DOM，仅透传插槽', () => {
        const wrapper = mount(withProvider(() => h('span', { class: 'probe' }, '内容')), { attachTo: document.body })

        expect(wrapper.html()).toBe('<span class="probe">内容</span>')

        wrapper.unmount()
    })

    /*
     * 回归锚点（Review Gate 抓出的 Provider 兜底缺陷）：Reka 的 `TooltipRoot` 只在「根未传」时才
     * 回落到 Provider，故 `CaomeiTooltip` 一旦为这五项设具名默认值（或让布尔型 prop 缺 `default` 键
     * 而被 Vue 布尔转换解析为 `false`），Provider 级配置就会被静默压掉。
     */
    it('根未传五项配置时不向 Reka 传具体值（Provider 才能兜底）', () => {
        const wrapper = mountTooltip()
        const root = wrapper.findComponent(TooltipRoot)

        expect(root.props('delayDuration')).toBeUndefined()
        expect(root.props('disabled')).toBeUndefined()
        expect(root.props('disableHoverableContent')).toBeUndefined()
        expect(root.props('disableClosingTrigger')).toBeUndefined()
        expect(root.props('ignoreNonKeyboardFocus')).toBeUndefined()

        wrapper.unmount()
    })

    it('单条传入时覆盖 Provider 值', () => {
        const wrapper = mountTooltip({ delayDuration: 0, disabled: true })
        const root = wrapper.findComponent(TooltipRoot)

        expect(root.props('delayDuration')).toBe(0)
        expect(root.props('disabled')).toBe(true)

        wrapper.unmount()
    })

    it('Provider 级 disabled 对未传该 prop 的后代生效', async () => {
        const wrapper = mount(defineComponent({
            render: () => h(CaomeiTooltipProvider, { disabled: true }, {
                default: () => h(CaomeiTooltip, null, {
                    default: () => [
                        h(CaomeiTooltipTrigger, { 'aria-label': '查看提示' }, { default: () => '提示' }),
                        h(CaomeiTooltipContent, null, { default: () => '提示内容' }),
                    ],
                }),
            }),
        }), { attachTo: document.body })

        ;(getTrigger() as HTMLElement).focus()
        await nextTick()
        await nextTick()

        expect(getContent()).toBeNull()

        wrapper.unmount()
    })

    it('缺 Provider 时抛错并点名 Provider（Provider 为必需项）', () => {
        expect(() => mount(CaomeiTooltip, {
            attachTo: document.body,
            slots: {
                default: () => [
                    h(CaomeiTooltipTrigger, { 'aria-label': '查看提示' }, { default: () => '提示' }),
                    h(CaomeiTooltipContent, null, { default: () => '提示内容' }),
                ],
            },
        })).toThrow(/TooltipProvider/)
    })

    /*
     * 约束载体（防「文档声称 Provider 兜底、实现上不可达」的同类漂移）：五项兜底配置必须在
     * Provider 与根组件上**同名可选**，否则 Provider 侧无从设置、兜底链失去意义。
     */
    it('五项兜底配置在 Provider 与根组件上同名可选', () => {
        const propNames = (component: unknown): string[] =>
            Object.keys((component as { props?: Record<string, unknown> }).props ?? {})
        const rootProps = propNames(CaomeiTooltip)
        const providerProps = propNames(CaomeiTooltipProvider)

        for (const name of ['delayDuration', 'disabled', 'disableHoverableContent', 'disableClosingTrigger', 'ignoreNonKeyboardFocus']) {
            expect(rootProps, `CaomeiTooltip 缺少兜底配置 ${name}`).toContain(name)
            expect(providerProps, `CaomeiTooltipProvider 缺少兜底配置 ${name}`).toContain(name)
        }
    })
})
