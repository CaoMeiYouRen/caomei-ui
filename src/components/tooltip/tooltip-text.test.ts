import { mount, type VueWrapper } from '@vue/test-utils'
import { renderToString } from 'vue/server-renderer'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createSSRApp, defineComponent, h, nextTick, ref } from 'vue'
import { resetResizeObserverStub, ResizeObserverStub, setElementMetrics, triggerMeasurement } from '../../../test/helpers/resize-observer'
import { CaomeiTooltipText } from './index'

function getTextElement(): HTMLElement {
    const element = document.querySelector('.caomei-tooltip-text')
    if (!element) {
        throw new Error('未渲染文本元素')
    }
    return element as HTMLElement
}

/**
 * 提示面板的可访问描述元素：Reka 把可见文本与 `role="tooltip"` 的隐藏描述都放在同一面板里，
 * 故内容断言取隐藏描述，而不是面板整体的 `textContent`（后者会重复一份）。
 */
function getDescriptionText(): string | null {
    return document.querySelector('[role="tooltip"]')?.textContent?.trim() ?? null
}

function getPanel(): HTMLElement | null {
    return document.querySelector('.caomei-tooltip__content') as HTMLElement | null
}

/** 触发器的 focus 立即打开提示 */
async function openByFocus(element: HTMLElement): Promise<void> {
    element.dispatchEvent(new FocusEvent('focus'))
    await nextTick()
    await nextTick()
}

const mounted: VueWrapper[] = []

function mountAttached(options: Parameters<typeof mount>[1]): VueWrapper {
    const wrapper = mount(CaomeiTooltipText, { ...options, attachTo: document.body }) as VueWrapper
    mounted.push(wrapper)
    return wrapper
}

beforeEach(() => {
    resetResizeObserverStub()
    vi.stubGlobal('ResizeObserver', ResizeObserverStub)
})

afterEach(() => {
    while (mounted.length > 0) {
        mounted.pop()?.unmount()
    }
    document.body.innerHTML = ''
    vi.unstubAllGlobals()
})

describe('CaomeiTooltipText', () => {
    it('默认 auto：未溢出时不挂载提示面板，元素上也没有 aria-describedby', async () => {
        mountAttached({ slots: { default: '短文本' } })
        await nextTick()

        expect(getPanel()).toBeNull()
        expect(getTextElement().hasAttribute('aria-describedby')).toBe(false)
        expect(getTextElement().getAttribute('data-state')).toBe('closed')
    })

    it('auto 模式在溢出后挂载提示，内容取可见文本', async () => {
        const wrapper = mountAttached({ slots: { default: '一段被容器截断的长文本' } })
        await nextTick()

        setElementMetrics(getTextElement(), 320, 120)
        triggerMeasurement()
        await nextTick()

        expect(wrapper.find('.caomei-tooltip-text').text()).toBe('一段被容器截断的长文本')

        await openByFocus(getTextElement())
        expect(getDescriptionText()).toBe('一段被容器截断的长文本')
    })

    it('auto 模式在宽度恢复后收起提示并撤下描述关联', async () => {
        mountAttached({ slots: { default: '先截断后完整' } })
        await nextTick()

        setElementMetrics(getTextElement(), 320, 120)
        triggerMeasurement()
        await nextTick()

        await openByFocus(getTextElement())
        expect(getDescriptionText()).toBe('先截断后完整')

        setElementMetrics(getTextElement(), 120, 120)
        triggerMeasurement()
        await nextTick()
        await nextTick()

        expect(getTextElement().getAttribute('data-state')).toBe('closed')
        expect(getTextElement().hasAttribute('aria-describedby')).toBe(false)
    })

    it('mode="always" 不依赖溢出即挂载提示', async () => {
        mountAttached({ props: { mode: 'always' }, slots: { default: '始终提示' } })
        await nextTick()

        await openByFocus(getTextElement())
        expect(getDescriptionText()).toBe('始终提示')
    })

    it('content 覆盖提示内容而不改变元素内的可见文本', async () => {
        const wrapper = mountAttached({
            props: { mode: 'always', content: '完整说明' },
            slots: { default: '可见文本' },
        })
        await nextTick()

        expect(wrapper.text()).toBe('可见文本')

        await openByFocus(getTextElement())
        expect(getDescriptionText()).toBe('完整说明')
    })

    it('disabled 时不挂载提示接线', async () => {
        mountAttached({ props: { mode: 'always', disabled: true }, slots: { default: '不可提示' } })
        await nextTick()

        await openByFocus(getTextElement())
        expect(getPanel()).toBeNull()
        expect(getTextElement().hasAttribute('aria-describedby')).toBe(false)
    })

    it('透传 class / style / data-* 与 aria-* 到根元素', async () => {
        const wrapper = mountAttached({
            props: { mode: 'always' },
            attrs: { class: 'custom-text', style: 'max-width: 120px', 'data-test': 'text', 'aria-live': 'polite' },
            slots: { default: '带属性的文本' },
        })
        await nextTick()

        const element = getTextElement()
        expect(element.classList.contains('custom-text')).toBe(true)
        expect(element.getAttribute('style')).toContain('max-width: 120px')
        expect(element.getAttribute('data-test')).toBe('text')
        expect(element.getAttribute('aria-live')).toBe('polite')

        wrapper.unmount()
    })

    it('无可显示内容时不挂载提示', async () => {
        mountAttached({ props: { mode: 'always' } })
        await nextTick()

        expect(getPanel()).toBeNull()
    })

    it('文本变化触发重测并更新提示内容', async () => {
        const wrapper = mount(defineComponent({
            components: { CaomeiTooltipText },
            setup: () => ({ text: ref('初始文本') }),
            template: '<CaomeiTooltipText mode="always">{{ text }}</CaomeiTooltipText>',
        }), { attachTo: document.body }) as VueWrapper
        mounted.push(wrapper)
        await nextTick()

        await openByFocus(getTextElement())
        expect(getDescriptionText()).toBe('初始文本')

        ;(wrapper.vm as unknown as { text: string }).text = '更新后的文本'
        await nextTick()

        await vi.waitFor(() => {
            expect(getDescriptionText()).toBe('更新后的文本')
        })
    })

    it('服务端渲染不输出提示面板与描述关联', async () => {
        const html = await renderToString(createSSRApp({
            render: () => h(CaomeiTooltipText, { mode: 'always' }, { default: () => '服务端文本' }),
        }))

        expect(html).toContain('服务端文本')
        expect(html).not.toContain('caomei-tooltip__content')
        expect(html).not.toContain('aria-describedby')
    })
})
