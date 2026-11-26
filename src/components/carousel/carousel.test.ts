import { mount } from '@vue/test-utils'
import { defineComponent, nextTick, ref } from 'vue'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { resolveCarouselIndex } from './context'
import { CaomeiCarousel, CaomeiCarouselSlide } from './index'

/**
 * 顶层库在 happy-dom 下没有布局尺寸，真实 embla 量不出 snap；
 * 这里用可控替身驱动状态与事件，几何面由文档站的浏览器回归承接。
 */
const embla = vi.hoisted(() => {
    const listeners = new Map<string, Set<() => void>>()
    const state = {
        selected: 0,
        snaps: 3,
        canPrev: true,
        canNext: true,
        scrollToCalls: [] as number[],
        scrollNextCalls: 0,
        scrollPrevCalls: 0,
        options: undefined as Record<string, unknown> | undefined,
        node: { clientWidth: 800, clientHeight: 640 },
    }

    function emit(event: string): void {
        for (const callback of listeners.get(event) ?? []) {
            callback()
        }
    }

    const api = {
        scrollTo(index: number): void {
            state.scrollToCalls.push(index)
            state.selected = index
            emit('select')
        },
        scrollNext(): void {
            state.scrollNextCalls += 1
        },
        scrollPrev(): void {
            state.scrollPrevCalls += 1
        },
        rootNode: () => state.node,
        selectedScrollSnap: (): number => state.selected,
        scrollSnapList: (): number[] => Array.from({ length: state.snaps }, (_, index) => index),
        canScrollPrev: (): boolean => state.canPrev,
        canScrollNext: (): boolean => state.canNext,
        on(event: string, callback: () => void): void {
            if (!listeners.has(event)) {
                listeners.set(event, new Set())
            }
            listeners.get(event)?.add(callback)
        },
        off(event: string, callback: () => void): void {
            listeners.get(event)?.delete(callback)
        },
        destroy(): void {
            listeners.clear()
        },
    }

    /** 记录组件传入的 embla 选项（组件传的是 computed，取值后再断言） */
    function recordOptions(options: unknown): void {
        const value = options !== null && typeof options === 'object' && 'value' in (options as Record<string, unknown>)
            ? (options as { value: Record<string, unknown> }).value
            : options
        state.options = value as Record<string, unknown> | undefined
    }

    function reset(): void {
        listeners.clear()
        state.selected = 0
        state.snaps = 3
        state.canPrev = true
        state.canNext = true
        state.scrollToCalls = []
        state.scrollNextCalls = 0
        state.scrollPrevCalls = 0
        state.options = undefined
        state.node.clientWidth = 800
        state.node.clientHeight = 640
    }

    return { api, state, emit, recordOptions, reset }
})

vi.mock('embla-carousel-vue', async () => {
    const { shallowRef } = await import('vue')
    return {
        default: (options: unknown) => {
            embla.recordOptions(options)
            return [shallowRef(null), shallowRef(embla.api)]
        },
    }
})

const wrappers: ReturnType<typeof mount>[] = []

function mountCarousel(options: {
    props?: Record<string, unknown>
    pages?: string[]
    withInput?: boolean
    index?: number
    named?: boolean
} = {}) {
    const pages = options.pages ?? ['第一页', '第二页']
    const Host = defineComponent({
        components: { CaomeiCarousel, CaomeiCarouselSlide },
        setup() {
            return {
                current: ref(options.index ?? 0),
                carouselProps: options.props ?? {},
                pages,
                withInput: options.withInput ?? false,
                named: options.named ?? true,
            }
        },
        template: `
            <CaomeiCarousel v-model:index="current" v-bind="carouselProps" :label="named ? '相册' : undefined">
                <CaomeiCarouselSlide v-for="page in pages" :key="page">
                    <input v-if="withInput" class="probe" />
                    {{ page }}
                </CaomeiCarouselSlide>
            </CaomeiCarousel>
        `,
    })
    const wrapper = mount(Host, { attachTo: document.body })
    wrappers.push(wrapper as unknown as ReturnType<typeof mount>)
    return wrapper
}

async function flush(): Promise<void> {
    for (let index = 0; index < 4; index++) {
        await nextTick()
    }
}

afterEach(() => {
    for (const wrapper of wrappers.splice(0)) {
        wrapper.unmount()
    }
    document.body.innerHTML = ''
})

beforeEach(() => {
    embla.reset()
})

describe('resolveCarouselIndex', () => {
    it('非循环时钳位到有效区间', () => {
        expect(resolveCarouselIndex(5, 3, false)).toBe(2)
        expect(resolveCarouselIndex(-2, 3, false)).toBe(0)
        expect(resolveCarouselIndex(1.8, 3, false)).toBe(1)
    })

    it('循环时双向取模', () => {
        expect(resolveCarouselIndex(4, 3, true)).toBe(1)
        expect(resolveCarouselIndex(-1, 3, true)).toBe(2)
    })

    it('非法输入与空页数落到 0', () => {
        expect(resolveCarouselIndex(Number.NaN, 3, false)).toBe(0)
        expect(resolveCarouselIndex(Number.POSITIVE_INFINITY, 3, false)).toBe(0)
        expect(resolveCarouselIndex(2, 0, true)).toBe(0)
    })
})

describe('CaomeiCarousel', () => {
    it('渲染轮播区域并暴露可访问名', async () => {
        const wrapper = mountCarousel()
        await flush()

        const region = wrapper.get('[role="region"]')
        expect(region.attributes('aria-roledescription')).toBe('carousel')
        expect(region.attributes('aria-label')).toBe('相册')
    })

    it('每个子页声明 slide 语义并按序号生成可访问名', async () => {
        const wrapper = mountCarousel()
        await flush()

        const slides = wrapper.findAll('[aria-roledescription="slide"]')
        expect(slides).toHaveLength(2)
        expect(slides[0]?.attributes('aria-label')).toBe('第 1 张，共 2 张')
        expect(slides[1]?.attributes('aria-label')).toBe('第 2 张，共 2 张')
    })

    it('上一页 / 下一页按钮调用 embla 并带可访问名', async () => {
        const wrapper = mountCarousel()
        await flush()

        await wrapper.get('[aria-label="下一张"]').trigger('click')
        expect(embla.state.scrollNextCalls).toBe(1)

        await wrapper.get('[aria-label="上一张"]').trigger('click')
        expect(embla.state.scrollPrevCalls).toBe(1)
    })

    it('到达边界时禁用对应按钮', async () => {
        embla.state.canPrev = false
        embla.state.canNext = false
        const wrapper = mountCarousel()
        await flush()

        expect(wrapper.get('[aria-label="上一张"]').attributes('disabled')).toBeDefined()
        expect(wrapper.get('[aria-label="下一张"]').attributes('disabled')).toBeDefined()
    })

    it('方向键按轮播方向翻页，Home / End 直达首末页', async () => {
        const wrapper = mountCarousel()
        await flush()
        const region = wrapper.get('[role="region"]')

        await region.trigger('keydown', { key: 'ArrowRight' })
        expect(embla.state.scrollNextCalls).toBe(1)
        await region.trigger('keydown', { key: 'ArrowLeft' })
        expect(embla.state.scrollPrevCalls).toBe(1)

        await region.trigger('keydown', { key: 'End' })
        expect(embla.state.scrollToCalls.at(-1)).toBe(2)
        await region.trigger('keydown', { key: 'Home' })
        expect(embla.state.scrollToCalls.at(-1)).toBe(0)
    })

    it('垂直方向使用上下方向键，忽略左右', async () => {
        const wrapper = mountCarousel({ props: { orientation: 'vertical' } })
        await flush()
        const region = wrapper.get('[role="region"]')

        await region.trigger('keydown', { key: 'ArrowRight' })
        expect(embla.state.scrollNextCalls).toBe(0)

        await region.trigger('keydown', { key: 'ArrowDown' })
        expect(embla.state.scrollNextCalls).toBe(1)
        await region.trigger('keydown', { key: 'ArrowUp' })
        expect(embla.state.scrollPrevCalls).toBe(1)
    })

    it('页内输入控件不触发键盘翻页', async () => {
        const wrapper = mountCarousel({ withInput: true })
        await flush()

        await wrapper.get('.probe').trigger('keydown', { key: 'ArrowRight' })
        expect(embla.state.scrollNextCalls).toBe(0)
    })

    it('挂载即按初始索引定位，回读不覆盖受控初值', async () => {
        const wrapper = mountCarousel({ index: 2 })
        await flush()

        expect(embla.state.scrollToCalls.at(-1)).toBe(2)
        expect((wrapper.vm as unknown as { current: number }).current).toBe(2)
        expect(wrapper.get('[aria-current="true"]').attributes('aria-label')).toBe('3 / 3')
    })

    it('初始索引越界时收敛到末页并回写模型', async () => {
        const wrapper = mountCarousel({ index: 9 })
        await flush()

        expect(embla.state.scrollToCalls.at(-1)).toBe(2)
        expect((wrapper.vm as unknown as { current: number }).current).toBe(2)
    })

    it('已在末页时越界写入把模型钳回，模型与页不分叉', async () => {
        const wrapper = mountCarousel({ index: 2 })
        await flush()

        ;(wrapper.vm as unknown as { current: number }).current = 9
        await flush()
        expect((wrapper.vm as unknown as { current: number }).current).toBe(2)
    })

    it('退化测量时不覆盖受控初值，恢复布局后重新定位', async () => {
        embla.state.node.clientWidth = 0
        embla.state.snaps = 1
        const wrapper = mountCarousel({ index: 2 })
        await flush()

        expect((wrapper.vm as unknown as { current: number }).current).toBe(2)
        expect(embla.state.scrollToCalls).toEqual([])

        embla.state.snaps = 3
        embla.state.node.clientWidth = 800
        embla.emit('reInit')
        await flush()

        expect((wrapper.vm as unknown as { current: number }).current).toBe(2)
        expect(embla.state.scrollToCalls.at(-1)).toBe(2)
    })

    it('loop 与方向落到 embla 选项', async () => {
        mountCarousel({ props: { loop: true, orientation: 'vertical' } })
        await flush()

        expect(embla.state.options).toMatchObject({ axis: 'y', loop: true, containScroll: false })
    })

    it('embla 翻页后回写 v-model:index', async () => {
        const wrapper = mountCarousel()
        await flush()

        embla.state.selected = 2
        embla.emit('select')
        await flush()

        expect((wrapper.vm as unknown as { current: number }).current).toBe(2)
    })

    it('指示点数量跟随 snap 数，标签为页码且点击翻到对应页', async () => {
        const wrapper = mountCarousel()
        await flush()

        const dots = wrapper.findAll('.caomei-carousel__dot')
        expect(dots).toHaveLength(3)
        expect(dots[0]?.attributes('aria-current')).toBe('true')
        expect(dots[1]?.attributes('aria-label')).toBe('2 / 3')

        const third = dots[2]
        expect(third).toBeDefined()
        await third?.trigger('click')
        expect(embla.state.scrollToCalls.at(-1)).toBe(2)
    })

    it('关闭 controls 时不渲染内置控件', async () => {
        const wrapper = mountCarousel({ props: { controls: false } })
        await flush()

        expect(wrapper.find('[aria-label="下一张"]').exists()).toBe(false)
        expect(wrapper.find('.caomei-carousel__dots').exists()).toBe(false)
        expect(wrapper.text()).toContain('第一页')
    })

    it('slidesPerView 与 gap 落到根元素变量', async () => {
        const wrapper = mountCarousel({ props: { slidesPerView: 2, gap: 16 } })
        await flush()

        const style = wrapper.get('[role="region"]').attributes('style') ?? ''
        expect(style).toContain('--caomei-carousel-slides-per-view: 2')
        expect(style).toContain('--caomei-carousel-gap: 16px')
    })

    it('slidesPerView 为 auto 时不写页数变量，改由 class 接管宽度', async () => {
        const wrapper = mountCarousel({ props: { slidesPerView: 'auto' } })
        await flush()

        const root = wrapper.get('[role="region"]')
        expect(root.classes()).toContain('caomei-carousel--auto')
        expect(root.attributes('style') ?? '').not.toContain('--caomei-carousel-slides-per-view')
    })

    it('未提供 label 时降级为 group，避免无名地标', async () => {
        const wrapper = mountCarousel({ named: false })
        await flush()

        const root = wrapper.get('[aria-roledescription="carousel"]')
        expect(root.attributes('role')).toBe('group')
        expect(root.attributes('aria-label')).toBeUndefined()
    })

    it('关闭内置控件时根节点仍可聚焦并按键翻页', async () => {
        const wrapper = mountCarousel({ props: { controls: false } })
        await flush()

        const root = wrapper.get('[role="region"]')
        expect(root.attributes('tabindex')).toBe('0')
        ;(root.element as HTMLElement).focus()
        expect(document.activeElement).toBe(root.element)
        await root.trigger('keydown', { key: 'ArrowRight' })
        expect(embla.state.scrollNextCalls).toBe(1)
    })
})
