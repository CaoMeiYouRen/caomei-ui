import { afterEach, describe, expect, it } from 'vitest'
import { defineComponent, h, nextTick, ref } from 'vue'
import { mount } from '@vue/test-utils'
import { CaomeiSticky } from './index'

/**
 * 吸顶工具的契约：偏移 / 层级、吸附判定（含滚动容器）、容器边界、禁用降级。
 *
 * happy-dom 没有布局：几何一律由 `getBoundingClientRect` 桩驱动，滚动事件手动派发——
 * 与真实浏览器里「容器滚动 → 元素相对位置变化」等价。
 */

interface Geometry {
    /** 吸顶元素相对视口顶部的位置 */
    top: number
    /** 元素高度 */
    height: number
    /** 父容器底边相对视口顶部的位置 */
    parentBottom: number
}

/** 给元素与它的父容器装上几何桩；返回可改写的几何对象 */
function stubGeometry(element: HTMLElement, geometry: Geometry): Geometry {
    const parent = element.parentElement
    // 几何对象在断言之间会被改写（模拟继续滚动），故每次调用都读**当前**值
    element.getBoundingClientRect = () => ({
        top: geometry.top,
        bottom: geometry.top + geometry.height,
        left: 0,
        right: 0,
        width: 100,
        height: geometry.height,
        x: 0,
        y: geometry.top,
        toJSON: () => ({}),
    }) as DOMRect
    if (parent) {
        parent.getBoundingClientRect = () => ({
            top: 0,
            bottom: geometry.parentBottom,
            left: 0,
            right: 0,
            width: 100,
            height: geometry.parentBottom,
            x: 0,
            y: 0,
            toJSON: () => ({}),
        }) as DOMRect
    }
    return geometry
}

const mountedWrappers: { unmount: () => void }[] = []

afterEach(() => {
    for (const wrapper of mountedWrappers.splice(0)) {
        wrapper.unmount()
    }
    document.body.innerHTML = ''
})

async function settle(): Promise<void> {
    await nextTick()
    await nextTick()
}

function mountSticky(options: { offset?: number, zIndex?: number, disabled?: boolean, scroller?: boolean } = {}) {
    const changes: { stuck: boolean, constrained: boolean }[] = []
    const Host = defineComponent({
        setup: () => () => {
            const content = h(CaomeiSticky, {
                offset: options.offset ?? 0,
                zIndex: options.zIndex,
                disabled: options.disabled ?? false,
                onChange: (state: { stuck: boolean, constrained: boolean }) => {
                    changes.push(state)
                },
            }, () => h('span', '工具栏'))
            return options.scroller
                ? h('div', { class: 'scroller', style: 'overflow-y: auto' }, [content])
                : h('div', { class: 'wrapper' }, [content])
        },
    })
    const wrapper = mount(Host, { attachTo: document.body })
    mountedWrappers.push(wrapper)
    return {
        wrapper,
        changes,
        sticky: () => wrapper.find('.caomei-sticky'),
        scroller: () => wrapper.find('.scroller'),
        /** 滚动事件的目标：有内层滚动容器时是容器，否则是 window（组件的回退监听面） */
        scrollTarget: (): HTMLElement | Window => (options.scroller
            ? (wrapper.find('.scroller').element as HTMLElement)
            : window),
    }
}

describe('CaomeiSticky 样式与状态暴露', () => {
    it('默认按基础档位吸顶并把偏移写成 CSS 变量', async () => {
        const { sticky } = mountSticky({ offset: 12 })
        await settle()

        const element = sticky().element as HTMLElement
        expect(element.style.getPropertyValue('--caomei-sticky-offset')).toBe('12px')
        expect(element.style.getPropertyValue('--caomei-sticky-z-index')).toBe('')
        expect(getComputedStyle(element).position).not.toBe('static')
    })

    it('传 zIndex 时写入组件私有层级变量', async () => {
        const { sticky } = mountSticky({ zIndex: 30 })
        await settle()
        expect((sticky().element as HTMLElement).style.getPropertyValue('--caomei-sticky-z-index')).toBe('30')
    })

    it('禁用时退回普通文档流且不暴露吸顶状态', async () => {
        const { sticky } = mountSticky({ disabled: true })
        await settle()

        expect(sticky().classes()).toContain('caomei-sticky--disabled')
        expect(sticky().attributes('data-stuck')).toBeUndefined()
    })
})

describe('CaomeiSticky 吸附判定与容器边界', () => {
    it('元素到达偏移位置时进入吸顶态并派发 change', async () => {
        const { sticky, changes, scrollTarget } = mountSticky({ offset: 0 })
        await settle()

        const element = sticky().element as HTMLElement
        // 远离吸附位置：先把状态推到「未吸住」
        const geometry = stubGeometry(element, { top: 200, height: 40, parentBottom: 600 })
        scrollTarget().dispatchEvent(new Event('scroll'))
        await settle()
        expect(sticky().attributes('data-stuck')).toBeUndefined()

        // 滚动到吸附位置：进入吸顶态
        geometry.top = 0
        scrollTarget().dispatchEvent(new Event('scroll'))
        await settle()
        expect(sticky().attributes('data-stuck')).toBe('true')
        expect(changes.at(-1)).toEqual({ stuck: true, constrained: false })

        // 继续滚回去：取消吸顶
        geometry.top = 120
        scrollTarget().dispatchEvent(new Event('scroll'))
        await settle()
        expect(sticky().attributes('data-stuck')).toBeUndefined()
        expect(changes.at(-1)).toEqual({ stuck: false, constrained: false })
        expect(changes.at(-1)).toEqual({ stuck: false, constrained: false })
    })

    it('父容器底边到达时标记 constrained（容器边界内吸附）', async () => {
        const { sticky, changes, scrollTarget } = mountSticky({ offset: 0 })
        await settle()

        const element = sticky().element as HTMLElement
        const geometry = stubGeometry(element, { top: 0, height: 40, parentBottom: 800 })
        scrollTarget().dispatchEvent(new Event('scroll'))
        await settle()
        expect(sticky().attributes('data-constrained')).toBeUndefined()

        // 容器底边推到元素下方：标记已被边界推走
        geometry.parentBottom = 30
        scrollTarget().dispatchEvent(new Event('scroll'))
        await settle()
        expect(sticky().attributes('data-constrained')).toBe('true')
        expect(changes.at(-1)).toEqual({ stuck: true, constrained: true })

        geometry.parentBottom = 800
        scrollTarget().dispatchEvent(new Event('scroll'))
        await settle()
        expect(sticky().attributes('data-constrained')).toBeUndefined()
    })

    it('位于内层滚动容器时监听该容器而非 window', async () => {
        const { sticky, scroller } = mountSticky({ offset: 0, scroller: true })
        await settle()

        const element = sticky().element as HTMLElement
        stubGeometry(element, { top: 200, height: 40, parentBottom: 500 })
        // 派发到内层滚动容器：若误挂 window，这个事件不会触发重算
        scroller().element.dispatchEvent(new Event('scroll'))
        await settle()
        expect(sticky().attributes('data-stuck')).toBeUndefined()

        // 反向自证：window 上的滚动对该元素无效（容器内滚动才是判定来源）
        stubGeometry(element, { top: 0, height: 40, parentBottom: 500 })
        window.dispatchEvent(new Event('scroll'))
        await settle()
        expect(sticky().attributes('data-stuck'), 'window 滚动不触发内层容器判定').toBeUndefined()

        scroller().element.dispatchEvent(new Event('scroll'))
        await settle()
        expect(sticky().attributes('data-stuck')).toBe('true')
    })

    it('偏移变化后按新偏移重新判定', async () => {
        const offset = ref(0)
        const Host = defineComponent({
            setup: () => () => h(CaomeiSticky, { offset: offset.value }, () => h('span', '工具栏')),
        })
        const wrapper = mount(Host, { attachTo: document.body })
        mountedWrappers.push(wrapper)
        await settle()

        const element = wrapper.find('.caomei-sticky').element as HTMLElement
        stubGeometry(element, { top: 40, height: 40, parentBottom: 600 })

        offset.value = 60
        await settle()
        await settle()
        // top(40) <= offset(60) + 容差 → 吸顶
        expect(wrapper.find('.caomei-sticky').attributes('data-stuck')).toBe('true')
    })
})
