import { mount, type VueWrapper } from '@vue/test-utils'
import { DialogContent } from 'reka-ui'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { computed, defineComponent, h, nextTick } from 'vue'
import { caomeiLocaleKey } from '../../composables/use-locale'
import { caomeiLocales } from '../../locale'
import { CaomeiTooltipProvider } from '../tooltip'
import type { DialogProps } from './types'
import { CaomeiDialog } from './index'

function getDialog(): HTMLElement | null {
    return document.querySelector('[role="dialog"]')
}

/** 用例统一登记挂载实例：不卸载会把 portal 容器与提示接线留给后续用例（body 清空后补丁会落到空容器） */
const mounted: VueWrapper[] = []

function mountTracked(component: Parameters<typeof mount>[0], options?: Parameters<typeof mount>[1]): VueWrapper {
    const wrapper = mount(component, options) as VueWrapper
    mounted.push(wrapper)
    return wrapper
}

afterEach(() => {
    while (mounted.length > 0) {
        mounted.pop()?.unmount()
    }
    document.body.innerHTML = ''
})

describe('CaomeiDialog', () => {
    it('关闭时不渲染对话框，触发插槽仍渲染', () => {
        const wrapper = mountTracked(CaomeiDialog, {
            props: { title: '标题' },
            slots: {
                trigger: '<button data-test="trigger">打开</button>',
                default: '内容',
            },
        })

        expect(getDialog()).toBeNull()
        expect(wrapper.find('[data-test="trigger"]').exists()).toBe(true)
    })

    it('点击 trigger 抛出 update:open=true', async () => {
        const wrapper = mountTracked(CaomeiDialog, {
            props: { title: '标题' },
            slots: { trigger: '<button data-test="trigger">打开</button>' },
        })

        await wrapper.get('[data-test="trigger"]').trigger('click')
        await nextTick()

        expect(wrapper.emitted('update:open')?.[0]).toEqual([true])
    })

    it('打开时渲染标题、描述与关闭按钮并建立 aria 关联', async () => {
        mountTracked(CaomeiDialog, {
            props: { title: '标题', description: '描述', open: true },
            slots: { default: '正文' },
        })
        await nextTick()

        const dialog = getDialog()
        expect(dialog).not.toBeNull()
        expect(dialog?.textContent).toContain('标题')
        expect(dialog?.textContent).toContain('描述')
        expect(dialog?.textContent).toContain('正文')

        const labelledby = dialog?.getAttribute('aria-labelledby')
        const describedby = dialog?.getAttribute('aria-describedby')
        expect(labelledby).toBeTruthy()
        expect(document.getElementById(labelledby as string)?.textContent).toBe('标题')
        expect(document.getElementById(describedby as string)?.textContent).toBe('描述')
        expect(dialog?.getAttribute('aria-modal')).toBe('true')
    })

    it('modal 为 false 时不标注 aria-modal', async () => {
        mountTracked(CaomeiDialog, { props: { title: '标题', open: true, modal: false } })
        await nextTick()

        expect(getDialog()?.getAttribute('aria-modal')).toBeNull()
    })

    it('closable 为 false 时不渲染关闭按钮', async () => {
        mountTracked(CaomeiDialog, { props: { title: '标题', open: true, closable: false } })
        await nextTick()

        expect(document.querySelector('.caomei-dialog__close')).toBeNull()
    })

    it('关闭按钮可访问标签可被覆盖', async () => {
        mountTracked(CaomeiDialog, {
            props: { title: '标题', open: true, closeLabel: '关闭对话框' },
        })
        await nextTick()

        expect(document.querySelector('.caomei-dialog__close')?.getAttribute('aria-label')).toBe(
            '关闭对话框',
        )
    })

    it('关闭按钮默认可访问名取内建文案', async () => {
        mountTracked(CaomeiDialog, { props: { title: '标题', open: true } })
        await nextTick()

        expect(document.querySelector('.caomei-dialog__close')?.getAttribute('aria-label')).toBe(
            '关闭',
        )
    })

    it.each(['sm', 'md', 'lg'] as const)('应用尺寸样式 %s', async (size) => {
        mountTracked(CaomeiDialog, { props: { title: '标题', open: true, size } })
        await nextTick()

        expect(getDialog()?.classList.contains(`caomei-dialog__content--${size}`)).toBe(true)
    })

    it('点击关闭按钮抛出 update:open=false', async () => {
        const wrapper = mountTracked(CaomeiDialog, { props: { title: '标题', open: true } })
        await nextTick()

        ;(document.querySelector('.caomei-dialog__close') as HTMLElement).click()
        await nextTick()

        expect(wrapper.emitted('update:open')?.[0]).toEqual([false])
    })

    it('渲染 footer 插槽', async () => {
        mountTracked(CaomeiDialog, {
            props: { title: '标题', open: true },
            slots: { footer: '<button data-test="confirm">确定</button>' },
        })
        await nextTick()

        expect(document.querySelector('[data-test="confirm"]')).not.toBeNull()
    })

    it('透传原生属性到对话框内容', async () => {
        mountTracked(CaomeiDialog, {
            props: { title: '标题', open: true },
            attrs: { 'data-test': 'dialog' },
        })
        await nextTick()

        expect(getDialog()?.getAttribute('data-test')).toBe('dialog')
    })

    it('modal 为 false 时不渲染遮罩', async () => {
        mountTracked(CaomeiDialog, { props: { title: '标题', open: true, modal: false } })
        await nextTick()

        expect(document.querySelector('.caomei-dialog__overlay')).toBeNull()
    })

    it('关闭按钮使用注入 locale 的文案', async () => {
        mountTracked(CaomeiDialog, {
            props: { title: '标题', open: true },
            global: {
                provide: { [caomeiLocaleKey]: computed(() => caomeiLocales['en-US']) },
            },
        })
        await nextTick()

        expect(document.querySelector('.caomei-dialog__close')?.getAttribute('aria-label')).toBe(
            'Close',
        )
    })

    it.each([
        [true, false],
        [false, true],
    ] as const)('closeOnEsc=%s 时 preventDefault 调用=%s', async (closeOnEsc, prevented) => {
        const wrapper = mountTracked(CaomeiDialog, { props: { title: '标题', open: true, closeOnEsc } })
        await nextTick()

        const event = { preventDefault: vi.fn() }
        wrapper.findComponent(DialogContent).vm.$emit('escapeKeyDown', event)

        expect(event.preventDefault).toHaveBeenCalledTimes(prevented ? 1 : 0)
    })

    it.each([
        [true, false],
        [false, true],
    ] as const)(
        'closeOnOverlay=%s 时 preventDefault 调用=%s',
        async (closeOnOverlay, prevented) => {
            const wrapper = mountTracked(CaomeiDialog, {
                props: { title: '标题', open: true, closeOnOverlay },
            })
            await nextTick()

            const event = { preventDefault: vi.fn() }
            wrapper.findComponent(DialogContent).vm.$emit('pointerDownOutside', event)

            expect(event.preventDefault).toHaveBeenCalledTimes(prevented ? 1 : 0)
        },
    )

    it('title 缺省时回退内建文案作为不可见可访问名，不产生空标题', async () => {
        mountTracked(CaomeiDialog, { props: { open: true } })
        await nextTick()

        const dialog = getDialog()
        const labelledby = dialog?.getAttribute('aria-labelledby')
        const titleElement = document.getElementById(labelledby as string)
        expect(titleElement?.textContent).toBe('对话框')
        expect(titleElement?.classList.contains('caomei-dialog__title--hidden')).toBe(true)
    })

    it('title 缺省时使用注入 locale 的可访问名文案', async () => {
        mountTracked(CaomeiDialog, {
            props: { open: true },
            global: {
                provide: { [caomeiLocaleKey]: computed(() => caomeiLocales['en-US']) },
            },
        })
        await nextTick()

        const labelledby = getDialog()?.getAttribute('aria-labelledby')
        expect(document.getElementById(labelledby as string)?.textContent).toBe('Dialog')
    })

    it('showHeader=false 时不渲染头部与关闭按钮，标题转为不可见可访问名', async () => {
        mountTracked(CaomeiDialog, {
            props: { title: '标题', description: '描述', open: true, showHeader: false },
        })
        await nextTick()

        const dialog = getDialog()
        expect(document.querySelector('.caomei-dialog__header')).toBeNull()
        expect(document.querySelector('.caomei-dialog__close')).toBeNull()

        const labelledby = dialog?.getAttribute('aria-labelledby')
        const titleElement = document.getElementById(labelledby as string)
        expect(titleElement?.textContent).toBe('标题')
        expect(titleElement?.classList.contains('caomei-dialog__title--hidden')).toBe(true)

        const describedby = dialog?.getAttribute('aria-describedby')
        expect(document.getElementById(describedby as string)?.textContent).toBe('描述')
    })

    it('open 由真转假时抛出 hide，初始与打开时不触发', async () => {
        const wrapper = mountTracked(CaomeiDialog, { props: { title: '标题', open: false } })
        await nextTick()
        expect(wrapper.emitted('hide')).toBeUndefined()

        await wrapper.setProps({ open: true })
        await nextTick()
        expect(wrapper.emitted('hide')).toBeUndefined()

        await wrapper.setProps({ open: false })
        await nextTick()
        expect(wrapper.emitted('hide')).toEqual([[]])
    })

    it('点击关闭按钮同时抛出 update:open=false 与 hide', async () => {
        const wrapper = mountTracked(CaomeiDialog, { props: { title: '标题', open: true } })
        await nextTick()

        ;(document.querySelector('.caomei-dialog__close') as HTMLElement).click()
        await nextTick()

        expect(wrapper.emitted('update:open')?.[0]).toEqual([false])
        expect(wrapper.emitted('hide')).toEqual([[]])
    })

    it('未提供 breakpoints 时不注入断点样式', async () => {
        mountTracked(CaomeiDialog, { props: { title: '标题', open: true } })
        await nextTick()

        const dialog = getDialog()
        expect(dialog?.hasAttribute('data-caomei-dialog-breakpoint')).toBe(false)
        expect(dialog?.querySelector('style')).toBeNull()
    })

    it('提供 breakpoints 时按实例选择器注入媒体查询，窄档在后', async () => {
        mountTracked(CaomeiDialog, {
            props: {
                title: '标题',
                open: true,
                breakpoints: { '1199px': '85vw', '575px': '95vw' },
            },
        })
        await nextTick()

        const dialog = getDialog()
        const id = dialog?.getAttribute('data-caomei-dialog-breakpoint')
        expect(id).toBeTruthy()

        const css = dialog?.querySelector('style')?.textContent ?? ''
        expect(css).toContain(`.caomei-dialog__content[data-caomei-dialog-breakpoint="${id}"]`)
        expect(css).toContain('@media (width <= 1199px)')
        expect(css).toContain('@media (width <= 575px)')
        expect(css).toContain('width: 85vw;')
        expect(css).toContain('width: 95vw;')
        expect(css.indexOf('575px')).toBeGreaterThan(css.indexOf('1199px'))
    })

    it('提供 title 时标题不隐藏', async () => {
        mountTracked(CaomeiDialog, { props: { title: '标题', open: true } })
        await nextTick()

        const titleElement = document.querySelector('.caomei-dialog__title')
        expect(titleElement?.textContent).toBe('标题')
        expect(titleElement?.classList.contains('caomei-dialog__title--hidden')).toBe(false)
    })

    it('非法断点条目被忽略，全部非法时不注入样式', async () => {
        const partial = mountTracked(CaomeiDialog, {
            props: {
                title: '标题',
                open: true,
                breakpoints: { '1199px': '85vw', small: '90vw', '640px': 'expression(alert(1))' },
            },
        })
        await nextTick()

        const css = getDialog()?.querySelector('style')?.textContent ?? ''
        expect(css).toContain('@media (width <= 1199px)')
        expect(css).not.toContain('640px')
        expect(css).not.toContain('small')
        partial.unmount()

        mountTracked(CaomeiDialog, {
            props: { title: '标题', open: true, breakpoints: { small: '90vw' } },
        })
        await nextTick()

        const dialog = getDialog()
        expect(dialog?.hasAttribute('data-caomei-dialog-breakpoint')).toBe(false)
        expect(dialog?.querySelector('style')).toBeNull()
    })

    it('breakpoints 变更后实例属性与样式同步增删', async () => {
        const wrapper = mountTracked(CaomeiDialog, { props: { title: '标题', open: true } })
        await nextTick()
        expect(getDialog()?.querySelector('style')).toBeNull()

        await wrapper.setProps({ breakpoints: { '640px': '100vw' } })
        await nextTick()
        expect(getDialog()?.querySelector('style')?.textContent).toContain(
            '@media (width <= 640px)',
        )

        await wrapper.setProps({ breakpoints: { '768px': '90vw' } })
        await nextTick()
        const updated = getDialog()?.querySelector('style')?.textContent ?? ''
        expect(updated).toContain('@media (width <= 768px)')
        expect(updated).not.toContain('640px')

        await wrapper.setProps({ breakpoints: {} })
        await nextTick()
        expect(getDialog()?.hasAttribute('data-caomei-dialog-breakpoint')).toBe(false)
        expect(getDialog()?.querySelector('style')).toBeNull()
    })
})

describe('CaomeiDialog 关闭按钮内建提示', () => {
    /** 指针进入走 Provider 的延迟；这里把延迟归零，避免用例依赖真实 700ms 计时 */
    function mountWithFastTooltip(props: Partial<DialogProps> & { open?: boolean }) {
        return mountTracked(defineComponent({
            render: () => h(CaomeiTooltipProvider, { delayDuration: 0 }, {
                default: () => h(CaomeiDialog, props),
            }),
        }))
    }

    /**
     * 关闭按钮在打开时被自动聚焦，提示刻意设为「仅键盘焦点」，故指针路径才是默认可见路径。
     */
    async function openTooltip(element: Element): Promise<string | null> {
        element.dispatchEvent(new MouseEvent('pointermove', { bubbles: true }))
        await vi.waitFor(() => {
            expect(document.querySelector('[role="tooltip"]')).not.toBeNull()
        })
        return document.querySelector('[role="tooltip"]')?.textContent?.trim() ?? null
    }

    /** 把 `:focus-visible` 的匹配结果改为可控，模拟键盘 / 非键盘焦点 */
    function stubFocusVisible(value: () => boolean) {
        const descriptor = Object.getOwnPropertyDescriptor(Element.prototype, 'matches')
        expect(descriptor?.value).toBeTypeOf('function')
        const original = descriptor?.value as (this: Element, selector: string) => boolean
        const spy = vi.spyOn(Element.prototype, 'matches').mockImplementation(function (this: Element, selector: string) {
            return selector === ':focus-visible' ? value() : original.call(this, selector)
        })
        return spy
    }

    it('默认开启：指针悬停关闭按钮显示提示，内容取可访问名且可访问名不变', async () => {
        mountWithFastTooltip({ title: '标题', open: true })
        await nextTick()

        const close = document.querySelector('.caomei-dialog__close') as HTMLElement
        expect(close.getAttribute('aria-label')).toBe('关闭')
        expect(await openTooltip(close)).toBe('关闭')
    })

    it('程序化聚焦不弹提示，键盘焦点（:focus-visible）仍显示', async () => {
        // happy-dom 未实现 `:focus-visible` 启发式（默认恒真），这里显式模拟两种焦点来源
        let keyboardFocus = false
        const spy = stubFocusVisible(() => keyboardFocus)
        try {
            mountWithFastTooltip({ title: '标题', open: true })
            await nextTick()
            await nextTick()

            const close = document.querySelector('.caomei-dialog__close') as HTMLElement
            expect(document.activeElement).toBe(close)
            expect(document.querySelector('.caomei-tooltip__content[data-state*="open"]')).toBeNull()

            keyboardFocus = true
            close.dispatchEvent(new FocusEvent('focus'))
            await nextTick()
            await nextTick()
            expect(document.querySelector('.caomei-tooltip__content[data-state*="open"]')).not.toBeNull()
        } finally {
            spy.mockRestore()
        }
    })

    it('提示面板挂在 portal 中、不在内容内部（层级不被面板遮挡）', async () => {
        mountWithFastTooltip({ title: '标题', open: true })
        await nextTick()

        await openTooltip(document.querySelector('.caomei-dialog__close') as HTMLElement)
        const panel = document.querySelector('.caomei-tooltip__content')
        const content = document.querySelector('.caomei-dialog__content')

        expect(panel).not.toBeNull()
        expect(content?.contains(panel)).toBe(false)
    })

    it('自定义 closeLabel 同步到提示内容', async () => {
        mountWithFastTooltip({ title: '标题', open: true, closeLabel: '关闭对话框' })
        await nextTick()

        expect(await openTooltip(document.querySelector('.caomei-dialog__close') as HTMLElement)).toBe('关闭对话框')
    })
})
