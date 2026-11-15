import { mount } from '@vue/test-utils'
import { createSSRApp, h, nextTick, type DefineComponent } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { BackTopProps } from './types'
import { CaomeiBackTop } from './index'

const BackTop = CaomeiBackTop as unknown as DefineComponent<BackTopProps>

/** 造一个可滚动的容器：元素目标避免依赖 `window.scrollY` 在 happy-dom 下的实现。 */
function makeScroller(): HTMLElement {
    const element = document.createElement('div')
    document.body.append(element)
    return element
}

function setScrollTop(element: HTMLElement, value: number): void {
    element.scrollTop = value
    element.dispatchEvent(new Event('scroll'))
}

/** 取根按钮（`v-show` 隐藏时元素仍在 DOM 中）。 */
function rootButton(wrapper: ReturnType<typeof mount>) {
    return wrapper.get('.caomei-back-top')
}

/** `v-show` 的显隐判据：直接看内联 `display`（happy-dom 的 `getComputedStyle` 不合并内联样式）。 */
function isShown(wrapper: ReturnType<typeof mount>): boolean {
    return !rootButton(wrapper).attributes('style')?.includes('display: none')
}

afterEach(() => {
    document.body.innerHTML = ''
    vi.restoreAllMocks()
})

describe('CaomeiBackTop 显隐与回顶', () => {
    it('默认隐藏，超过阈值显示，回落隐藏', async () => {
        const target = makeScroller()
        const wrapper = mount(BackTop, { props: { label: '回到顶部', target } })

        expect(isShown(wrapper), '初始应隐藏').toBe(false)

        setScrollTop(target, 201)
        await nextTick()
        expect(isShown(wrapper), '超过默认阈值 200 后应显示').toBe(true)

        setScrollTop(target, 120)
        await nextTick()
        expect(isShown(wrapper), '回落到阈值以下应隐藏').toBe(false)

        wrapper.unmount()
    })

    it('阈值等值边界：等于阈值时隐藏，超过 1px 才显示', async () => {
        const target = makeScroller()
        const wrapper = mount(BackTop, { props: { label: '回到顶部', target, threshold: 100 } })

        setScrollTop(target, 100)
        await nextTick()
        expect(isShown(wrapper), '等于阈值应隐藏').toBe(false)

        setScrollTop(target, 101)
        await nextTick()
        expect(isShown(wrapper), '超过阈值 1px 应显示').toBe(true)

        wrapper.unmount()
    })

    it('自定义阈值生效', async () => {
        const target = makeScroller()
        const wrapper = mount(BackTop, { props: { label: '回到顶部', target, threshold: 10 } })

        setScrollTop(target, 11)
        await nextTick()
        expect(isShown(wrapper)).toBe(true)

        wrapper.unmount()
    })

    it('点击回顶：滚动到顶部、优先平滑并抛出 click', async () => {
        const target = makeScroller()
        const scrollTo = vi.fn()
        target.scrollTo = scrollTo
        vi.spyOn(window, 'matchMedia').mockReturnValue({ matches: false } as MediaQueryList)
        const wrapper = mount(BackTop, { props: { label: '回到顶部', target } })

        setScrollTop(target, 500)
        await nextTick()
        await rootButton(wrapper).trigger('click')

        expect(scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' })
        expect(wrapper.emitted('click')).toHaveLength(1)
        wrapper.unmount()
    })

    it('prefers-reduced-motion 下改为瞬时跳转', async () => {
        const target = makeScroller()
        const scrollTo = vi.fn()
        target.scrollTo = scrollTo
        vi.spyOn(window, 'matchMedia').mockReturnValue({ matches: true } as MediaQueryList)
        const wrapper = mount(BackTop, { props: { label: '回到顶部', target } })

        setScrollTop(target, 500)
        await nextTick()
        await rootButton(wrapper).trigger('click')

        expect(scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'auto' })
        wrapper.unmount()
    })

    it('字符串目标按选择器解析；无匹配时回退 window 且不报错', async () => {
        const target = makeScroller()
        target.id = 'back-top-scroller'
        const wrapper = mount(BackTop, { props: { label: '回到顶部', target: '#back-top-scroller' } })

        setScrollTop(target, 300)
        await nextTick()
        expect(isShown(wrapper), '选择器命中时应使用该元素').toBe(true)
        wrapper.unmount()

        const fallback = mount(BackTop, { props: { label: '回到顶部', target: '#missing-scroller' } })
        expect(() => fallback.get('.caomei-back-top')).not.toThrow()
        fallback.unmount()
    })

    it('默认 target = window：按 scrollY 显隐，点击调用 window.scrollTo', async () => {
        const scrollY = vi.spyOn(window, 'scrollY', 'get').mockReturnValue(0)
        const addSpy = vi.spyOn(window, 'addEventListener')
        const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined)
        vi.spyOn(window, 'matchMedia').mockReturnValue({ matches: false } as MediaQueryList)
        const wrapper = mount(BackTop, { props: { label: '回到顶部' } })
        expect(addSpy).toHaveBeenCalledWith('scroll', expect.any(Function), { passive: true })

        scrollY.mockReturnValue(500)
        window.dispatchEvent(new Event('scroll'))
        await nextTick()
        expect(isShown(wrapper), 'window.scrollY 超过阈值应显示').toBe(true)

        await rootButton(wrapper).trigger('click')
        expect(scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' })
        wrapper.unmount()
    })

    it('非法选择器与 null 目标都不抛错（回退 window）', () => {
        const invalidSelector = () => mount(BackTop, { props: { label: '回到顶部', target: '#123-panel' } })
        expect(invalidSelector).not.toThrow()
        invalidSelector().unmount()

        const malformedSelector = () => mount(BackTop, { props: { label: '回到顶部', target: '[a' } })
        expect(malformedSelector).not.toThrow()
        malformedSelector().unmount()

        const nullTarget = () => mount(BackTop, { props: { label: '回到顶部', target: null as unknown as HTMLElement } })
        expect(nullTarget).not.toThrow()
        nullTarget().unmount()
    })

    it('切换 target：旧目标失效、新目标生效，且解绑次数与重挂一致', async () => {
        const first = makeScroller()
        const second = makeScroller()
        second.scrollTop = 300
        const removeFirst = vi.spyOn(first, 'removeEventListener')
        const addSecond = vi.spyOn(second, 'addEventListener')
        const wrapper = mount(BackTop, { props: { label: '回到顶部', target: first } })

        setScrollTop(first, 300)
        await nextTick()
        expect(isShown(wrapper)).toBe(true)

        await wrapper.setProps({ target: second })
        expect(removeFirst).toHaveBeenCalledWith('scroll', expect.any(Function))
        expect(addSecond).toHaveBeenCalledWith('scroll', expect.any(Function), { passive: true })
        expect(isShown(wrapper), '新目标挂载后立即按其滚动位置重算').toBe(true)

        setScrollTop(first, 0)
        await nextTick()
        expect(isShown(wrapper), '旧目标不应再影响显隐').toBe(true)

        setScrollTop(second, 0)
        await nextTick()
        expect(isShown(wrapper), '新目标生效').toBe(false)
        wrapper.unmount()
    })

    it('threshold 变化后立即按当前滚动位置重算', async () => {
        const target = makeScroller()
        const wrapper = mount(BackTop, { props: { label: '回到顶部', target, threshold: 10 } })

        setScrollTop(target, 300)
        await nextTick()
        expect(isShown(wrapper)).toBe(true)

        await wrapper.setProps({ threshold: 500 })
        expect(isShown(wrapper), '阈值提高后应立即隐藏').toBe(false)
        wrapper.unmount()
    })

    it('未提供 label 时取当前语言的内置文案', () => {
        const wrapper = mount(BackTop, { props: { target: makeScroller() } })
        expect(rootButton(wrapper).attributes('aria-label')).toBe('回到顶部')
        wrapper.unmount()
    })

    it('可访问名取 label，且默认内容为内建图标', () => {
        const wrapper = mount(BackTop, { props: { label: '回到顶部', target: makeScroller() } })
        expect(rootButton(wrapper).attributes('aria-label')).toBe('回到顶部')
        expect(rootButton(wrapper).find('svg').exists(), '默认渲染内建图标').toBe(true)
        wrapper.unmount()
    })

    it('卸载时移除滚动监听', () => {
        const target = makeScroller()
        const removeSpy = vi.spyOn(target, 'removeEventListener')
        const wrapper = mount(BackTop, { props: { label: '回到顶部', target } })
        wrapper.unmount()
        expect(removeSpy).toHaveBeenCalledWith('scroll', expect.any(Function))
    })

    it('SSR 渲染不触碰 window（移除全局 window 后仍可渲染）', async () => {
        const app = createSSRApp({
            render: () => h(BackTop, { label: '回到顶部' }),
        })
        vi.stubGlobal('window', undefined)
        const html = await renderToString(app)
        vi.unstubAllGlobals()
        expect(html).toContain('caomei-back-top')
        expect(html).toContain('aria-label="回到顶部"')
    })
})
