import { mount, type VueWrapper } from '@vue/test-utils'
import { DialogContent } from 'reka-ui'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { computed, defineComponent, h, nextTick } from 'vue'
import { caomeiLocaleKey } from '../../composables/use-locale'
import { caomeiLocales } from '../../locale'
import { CaomeiTooltipProvider } from '../tooltip'
import type { DrawerProps } from './types'
import { CaomeiDrawer } from './index'

function getDrawer(): HTMLElement | null {
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

describe('CaomeiDrawer', () => {
    it('关闭时不渲染抽屉，触发插槽仍渲染', () => {
        const wrapper = mountTracked(CaomeiDrawer, {
            slots: {
                trigger: '<button data-test="trigger">打开</button>',
                default: '内容',
            },
        })

        expect(getDrawer()).toBeNull()
        expect(wrapper.find('[data-test="trigger"]').exists()).toBe(true)
    })

    it('点击 trigger 抛出 update:open=true', async () => {
        const wrapper = mountTracked(CaomeiDrawer, {
            slots: { trigger: '<button data-test="trigger">打开</button>' },
        })

        await wrapper.get('[data-test="trigger"]').trigger('click')
        await nextTick()

        expect(wrapper.emitted('update:open')?.[0]).toEqual([true])
    })

    it('打开时渲染标题、描述、正文与关闭按钮并建立 aria 关联', async () => {
        mountTracked(CaomeiDrawer, {
            props: { title: '标题', description: '描述', open: true },
            slots: { default: '正文' },
        })
        await nextTick()

        const drawer = getDrawer()
        expect(drawer).not.toBeNull()
        expect(drawer?.textContent).toContain('标题')
        expect(drawer?.textContent).toContain('描述')
        expect(drawer?.textContent).toContain('正文')

        const labelledby = drawer?.getAttribute('aria-labelledby')
        const describedby = drawer?.getAttribute('aria-describedby')
        expect(labelledby).toBeTruthy()
        expect(document.getElementById(labelledby as string)?.textContent).toBe('标题')
        expect(document.getElementById(describedby as string)?.textContent).toBe('描述')
        expect(drawer?.getAttribute('aria-modal')).toBe('true')
    })

    it.each(['left', 'right', 'top', 'bottom'] as const)('应用方向 %s 与数据属性', async (position) => {
        mountTracked(CaomeiDrawer, { props: { title: '标题', open: true, position } })
        await nextTick()

        const drawer = getDrawer()
        expect(drawer?.classList.contains(`caomei-drawer__content--${position}`)).toBe(true)
        expect(drawer?.getAttribute('data-position')).toBe(position)
    })

    it('默认方向为 left', async () => {
        mountTracked(CaomeiDrawer, { props: { title: '标题', open: true } })
        await nextTick()

        expect(getDrawer()?.classList.contains('caomei-drawer__content--left')).toBe(true)
    })

    it.each(['sm', 'md', 'lg'] as const)('应用尺寸 %s', async (size) => {
        mountTracked(CaomeiDrawer, { props: { title: '标题', open: true, size } })
        await nextTick()

        expect(getDrawer()?.classList.contains(`caomei-drawer__content--${size}`)).toBe(true)
    })

    it('closable 为 false 时不渲染关闭按钮', async () => {
        mountTracked(CaomeiDrawer, { props: { title: '标题', open: true, closable: false } })
        await nextTick()

        expect(document.querySelector('.caomei-drawer__close')).toBeNull()
    })

    it('关闭按钮默认可访问名取内建文案', async () => {
        mountTracked(CaomeiDrawer, { props: { title: '标题', open: true } })
        await nextTick()

        expect(document.querySelector('.caomei-drawer__close')?.getAttribute('aria-label')).toBe(
            '关闭',
        )
    })

    it('关闭按钮可访问标签可被覆盖', async () => {
        mountTracked(CaomeiDrawer, { props: { title: '标题', open: true, closeLabel: '关闭抽屉' } })
        await nextTick()

        expect(document.querySelector('.caomei-drawer__close')?.getAttribute('aria-label')).toBe(
            '关闭抽屉',
        )
    })

    it('关闭按钮使用注入 locale 的文案', async () => {
        mountTracked(CaomeiDrawer, {
            props: { title: 'Title', open: true },
            global: {
                provide: { [caomeiLocaleKey]: computed(() => caomeiLocales['en-US']) },
            },
        })
        await nextTick()

        expect(document.querySelector('.caomei-drawer__close')?.getAttribute('aria-label')).toBe(
            'Close',
        )
    })

    it('点击关闭按钮抛出 update:open=false', async () => {
        const wrapper = mountTracked(CaomeiDrawer, { props: { title: '标题', open: true } })
        await nextTick()

        ;(document.querySelector('.caomei-drawer__close') as HTMLElement).click()
        await nextTick()

        expect(wrapper.emitted('update:open')?.[0]).toEqual([false])
    })

    it('未提供 title 时回退内建文案作为可访问名且标题视觉隐藏', async () => {
        mountTracked(CaomeiDrawer, { props: { open: true } })
        await nextTick()

        const labelledby = getDrawer()?.getAttribute('aria-labelledby')
        expect(document.getElementById(labelledby as string)?.textContent).toBe('抽屉')
        expect(
            document.querySelector('.caomei-drawer__title')?.classList.contains(
                'caomei-drawer__title--hidden',
            ),
        ).toBe(true)
    })

    it('title 为空串时回退内建文案（不产生空可访问名）', async () => {
        mountTracked(CaomeiDrawer, { props: { title: '', open: true } })
        await nextTick()

        const labelledby = getDrawer()?.getAttribute('aria-labelledby')
        expect(document.getElementById(labelledby as string)?.textContent).toBe('抽屉')
        expect(
            document.querySelector('.caomei-drawer__title')?.classList.contains(
                'caomei-drawer__title--hidden',
            ),
        ).toBe(true)
    })

    it('closeLabel 为空串时回退内建文案', async () => {
        mountTracked(CaomeiDrawer, { props: { title: '标题', closeLabel: '', open: true } })
        await nextTick()

        expect(document.querySelector('.caomei-drawer__close')?.getAttribute('aria-label')).toBe(
            '关闭',
        )
    })

    it('提供 title 时标题可见', async () => {
        mountTracked(CaomeiDrawer, { props: { title: '标题', open: true } })
        await nextTick()

        expect(
            document.querySelector('.caomei-drawer__title')?.classList.contains(
                'caomei-drawer__title--hidden',
            ),
        ).toBe(false)
    })

    it('提供自定义头部时保留可访问名并将标题转为视觉隐藏', async () => {
        mountTracked(CaomeiDrawer, {
            props: { title: '自定义标题', open: true },
            slots: { header: '<span data-test="custom-header">自定义头部</span>' },
        })
        await nextTick()

        expect(document.querySelector('[data-test="custom-header"]')).not.toBeNull()
        const title = document.querySelector('.caomei-drawer__title')
        expect(title?.classList.contains('caomei-drawer__title--hidden')).toBe(true)

        const labelledby = getDrawer()?.getAttribute('aria-labelledby')
        expect(document.getElementById(labelledby as string)?.textContent).toBe('自定义标题')
    })

    it('自定义头部渲染在描述之前', async () => {
        mountTracked(CaomeiDrawer, {
            props: { title: '标题', description: '描述', open: true },
            slots: { header: '<span data-test="custom-header">头部</span>' },
        })
        await nextTick()

        const heading = document.querySelector('.caomei-drawer__heading')
        const slot = heading?.querySelector('.caomei-drawer__header-slot')
        const description = heading?.querySelector('.caomei-drawer__description')
        expect(slot).not.toBeNull()
        expect(description).not.toBeNull()
        // 头部插槽应位于描述之前（插槽承载标题区域）
        const order = slot && description ? slot.compareDocumentPosition(description) : 0
        expect(order & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    })

    // 真实 Esc / 外部点击的端到端关闭行为可在 happy-dom 断言（事件须 cancelable: true，
    // 否则 preventDefault() 不置 defaultPrevented，Reka 会照常 dismiss）。
    it.each([
        [true, true],
        [false, false],
    ] as const)('closeOnEsc=%s 时真实 Esc 关闭=%s', async (closeOnEsc, shouldClose) => {
        const wrapper = mountTracked(CaomeiDrawer, { props: { title: '标题', open: true, closeOnEsc } })
        await nextTick()

        document.dispatchEvent(
            new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }),
        )
        await nextTick()

        if (shouldClose) {
            expect(wrapper.emitted('update:open')?.[0]).toEqual([false])
        } else {
            expect(wrapper.emitted('update:open')).toBeUndefined()
        }
    })

    it.each([
        [true, true],
        [false, false],
    ] as const)('closeOnOverlay=%s 时点击外部关闭=%s', async (closeOnOverlay, shouldClose) => {
        const wrapper = mountTracked(CaomeiDrawer, {
            props: { title: '标题', open: true, closeOnOverlay },
        })
        await nextTick()
        // pointerdown 监听在 setTimeout(0) 后注册，需先等一个宏任务
        await new Promise((resolve) => setTimeout(resolve, 0))

        document.body.dispatchEvent(
            new Event('pointerdown', { bubbles: true, cancelable: true }),
        )
        // pointerDownOutside 在 dismiss 前有一个 nextTick，需要多等一轮
        await nextTick()
        await nextTick()

        if (shouldClose) {
            expect(wrapper.emitted('update:open')?.[0]).toEqual([false])
        } else {
            expect(wrapper.emitted('update:open')).toBeUndefined()
        }
    })

    it('渲染 footer 插槽', async () => {
        mountTracked(CaomeiDrawer, {
            props: { title: '标题', open: true },
            slots: { footer: '<button data-test="confirm">确定</button>' },
        })
        await nextTick()

        expect(document.querySelector('[data-test="confirm"]')).not.toBeNull()
    })

    it('透传原生属性与 class / style 到抽屉内容', async () => {
        mountTracked(CaomeiDrawer, {
            props: { title: '标题', open: true },
            attrs: { 'data-test': 'drawer', class: 'custom-drawer', style: 'width: 600px' },
        })
        await nextTick()

        const drawer = getDrawer()
        expect(drawer?.getAttribute('data-test')).toBe('drawer')
        expect(drawer?.classList.contains('custom-drawer')).toBe(true)
        expect(drawer?.getAttribute('style')).toContain('width: 600px')
    })

    it('modal 为 false 时不渲染遮罩且不标注 aria-modal', async () => {
        mountTracked(CaomeiDrawer, { props: { title: '标题', open: true, modal: false } })
        await nextTick()

        expect(document.querySelector('.caomei-drawer__overlay')).toBeNull()
        expect(getDrawer()?.getAttribute('aria-modal')).toBeNull()
    })

    it.each([
        [true, false],
        [false, true],
    ] as const)('closeOnEsc=%s 时 preventDefault 调用=%s', async (closeOnEsc, prevented) => {
        const wrapper = mountTracked(CaomeiDrawer, { props: { title: '标题', open: true, closeOnEsc } })
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
            const wrapper = mountTracked(CaomeiDrawer, {
                props: { title: '标题', open: true, closeOnOverlay },
            })
            await nextTick()

            const event = { preventDefault: vi.fn() }
            wrapper.findComponent(DialogContent).vm.$emit('pointerDownOutside', event)

            expect(event.preventDefault).toHaveBeenCalledTimes(prevented ? 1 : 0)
        },
    )
})

describe('CaomeiDrawer 关闭按钮内建提示', () => {
    /** 指针进入走 Provider 的延迟；这里把延迟归零，避免用例依赖真实 700ms 计时 */
    function mountWithFastTooltip(props: Partial<DrawerProps> & { open?: boolean }) {
        return mountTracked(defineComponent({
            render: () => h(CaomeiTooltipProvider, { delayDuration: 0 }, {
                default: () => h(CaomeiDrawer, props),
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

        const close = document.querySelector('.caomei-drawer__close') as HTMLElement
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

            const close = document.querySelector('.caomei-drawer__close') as HTMLElement
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

        await openTooltip(document.querySelector('.caomei-drawer__close') as HTMLElement)
        const panel = document.querySelector('.caomei-tooltip__content')
        const content = document.querySelector('.caomei-drawer__content')

        expect(panel).not.toBeNull()
        expect(content?.contains(panel)).toBe(false)
    })

    it('自定义 closeLabel 同步到提示内容', async () => {
        mountWithFastTooltip({ title: '标题', open: true, closeLabel: '关闭抽屉' })
        await nextTick()

        expect(await openTooltip(document.querySelector('.caomei-drawer__close') as HTMLElement)).toBe('关闭抽屉')
    })
})
