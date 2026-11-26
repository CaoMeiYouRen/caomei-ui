import { mount } from '@vue/test-utils'
import { defineComponent, nextTick, reactive } from 'vue'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { CaomeiWatermark } from './index'

interface FakeContext {
    font: string
    fillStyle: string
    globalAlpha: number
    textAlign: string
    textBaseline: string
    scale: ReturnType<typeof vi.fn>
    translate: ReturnType<typeof vi.fn>
    rotate: ReturnType<typeof vi.fn>
    fillText: ReturnType<typeof vi.fn>
    drawImage: ReturnType<typeof vi.fn>
    measureText: ReturnType<typeof vi.fn>
}

/**
 * 每次 `getContext` 返回**新**上下文并带默认字体：
 * 真实 canvas 在设置 width/height 后会重置 2D 状态，替身按此语义建，
 * 否则「字体设在尺寸之前」这类缺陷永远测不出来。
 */
function createContext(): FakeContext {
    return {
        font: '10px sans-serif',
        fillStyle: '',
        globalAlpha: 1,
        textAlign: '',
        textBaseline: '',
        scale: vi.fn(),
        translate: vi.fn(),
        rotate: vi.fn(),
        fillText: vi.fn(),
        drawImage: vi.fn(),
        measureText: vi.fn((text: string) => ({ width: text.length * 8 })),
    }
}

let contexts: FakeContext[] = []
let dataUrlCalls = 0

const tileContext = (): FakeContext => contexts[contexts.length - 1] as FakeContext

beforeEach(() => {
    contexts = []
    dataUrlCalls = 0
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(() => {
        const context = createContext()
        contexts.push(context)
        return context as never
    })
    vi.spyOn(HTMLCanvasElement.prototype, 'toDataURL').mockImplementation(() => {
        dataUrlCalls += 1
        return 'data:image/png;base64,WATERMARK'
    })
})

afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
    document.body.innerHTML = ''
})

function mountWatermark(initial: Record<string, unknown> = {}) {
    const props = reactive<Record<string, unknown>>({ ...initial })
    const Host = defineComponent({
        components: { CaomeiWatermark },
        setup: () => ({ props }),
        template: '<CaomeiWatermark v-bind="props"><span class="content">正文内容</span></CaomeiWatermark>',
    })
    const wrapper = mount(Host, { attachTo: document.body })
    return { wrapper, props }
}

describe('CaomeiWatermark', () => {
    it('遮罩 aria-hidden，插槽内容保持可访问', async () => {
        const { wrapper } = mountWatermark({ content: '内部资料' })
        await nextTick()

        const root = wrapper.get('.caomei-watermark')
        expect(root.attributes('aria-hidden')).toBeUndefined()
        expect(root.get('.caomei-watermark__overlay').attributes('aria-hidden')).toBe('true')
        expect(root.get('.content').text()).toBe('正文内容')
    })

    it('按文本内容与字号绘制平铺图并写入遮罩', async () => {
        const { wrapper } = mountWatermark({ content: '内部资料', fontSize: 20 })
        await nextTick()

        expect(tileContext().fillText).toHaveBeenCalledWith('内部资料', 0, 0)
        expect(tileContext().font).toContain('20px')
        expect(wrapper.get('.caomei-watermark__overlay').attributes('style')).toContain('data:image/png;base64,WATERMARK')
        expect(dataUrlCalls).toBeGreaterThan(0)
    })

    it('旋转、透明度、颜色、间距、偏移与层级落到绘制与遮罩', async () => {
        const { wrapper } = mountWatermark({
            content: '内部资料',
            rotate: 45,
            opacity: 0.5,
            color: 'rgb(1, 2, 3)',
            gap: [20, 30],
            offset: [4, 6],
            zIndex: 12,
        })
        await nextTick()

        // 文本 32 × 23 旋转 45° → 包围盒各边 39，加间距后 59 × 69
        const style = wrapper.get('.caomei-watermark__overlay').attributes('style') ?? ''
        expect(style).toContain('background-size: 59px 69px')
        expect(style).toContain('background-position: 4px 6px')
        expect(style).toContain('--caomei-watermark-z-index: 12')

        expect(tileContext().rotate).toHaveBeenCalledWith(Math.PI / 4)
        expect(tileContext().globalAlpha).toBe(0.5)
        expect(tileContext().fillStyle).toBe('rgb(1, 2, 3)')
    })

    it('内容变化后重新绘制', async () => {
        const { wrapper, props } = mountWatermark({ content: '内部资料' })
        await nextTick()
        const before = dataUrlCalls

        props.content = '机密'
        await vi.waitFor(() => {
            expect(dataUrlCalls).toBeGreaterThan(before)
        })
        expect(tileContext().fillText).toHaveBeenCalledWith('机密', 0, 0)
        expect(wrapper.get('.caomei-watermark__overlay').attributes('style')).toContain('data:image/png')
    })

    it('子节点、属性与文本内容变化后重建', async () => {
        const { wrapper } = mountWatermark({ content: '内部资料' })
        await nextTick()
        const root = wrapper.get('.caomei-watermark').element

        let before = dataUrlCalls
        const added = document.createElement('span')
        added.textContent = '附加'
        root.appendChild(added)
        await vi.waitFor(() => {
            expect(dataUrlCalls).toBeGreaterThan(before)
        })

        before = dataUrlCalls
        root.setAttribute('data-probe', '1')
        await vi.waitFor(() => {
            expect(dataUrlCalls).toBeGreaterThan(before)
        })

        before = dataUrlCalls
        const text = root.querySelector('.content')?.firstChild as Text
        text.nodeValue = '改过的正文'
        await vi.waitFor(() => {
            expect(dataUrlCalls).toBeGreaterThan(before)
        })

        before = dataUrlCalls
        added.remove()
        await vi.waitFor(() => {
            expect(dataUrlCalls).toBeGreaterThan(before)
        })
    })

    it('同一帧内的多次变更只重建一次', async () => {
        const { wrapper } = mountWatermark({ content: '内部资料' })
        await nextTick()
        const before = dataUrlCalls
        const root = wrapper.get('.caomei-watermark').element

        for (let index = 0; index < 3; index += 1) {
            const added = document.createElement('span')
            added.textContent = `附加 ${index}`
            root.appendChild(added)
            // 逐次跨微任务，确保三次变更各自投递一次，再验证被合并成一次重建
            await Promise.resolve()
        }

        await vi.waitFor(() => {
            expect(dataUrlCalls).toBeGreaterThan(before)
        })
        expect(dataUrlCalls - before).toBe(1)
    })

    it('容器尺寸变化后重建', async () => {
        const callbacks: (() => void)[] = []
        class FakeResizeObserver {
            constructor(callback: () => void) {
                callbacks.push(callback)
            }

            observe(): void {
                // 测试替身：只记录回调，不实际观察
            }

            disconnect(): void {
                // 测试替身：无需释放
            }

            unobserve(): void {
                // 测试替身：无需释放
            }
        }
        vi.stubGlobal('ResizeObserver', FakeResizeObserver)

        mountWatermark({ content: '内部资料' })
        await nextTick()
        const before = dataUrlCalls
        expect(callbacks.length).toBeGreaterThan(0)

        callbacks[0]?.()
        await vi.waitFor(() => {
            expect(dataUrlCalls).toBeGreaterThan(before)
        })
    })

    it('卸载时断开观察者，之后不再重建', async () => {
        const disconnect = vi.spyOn(MutationObserver.prototype, 'disconnect')

        const { wrapper } = mountWatermark({ content: '内部资料' })
        await nextTick()
        const element = wrapper.get('.caomei-watermark').element
        wrapper.unmount()

        expect(disconnect).toHaveBeenCalled()
        const after = dataUrlCalls

        const added = document.createElement('span')
        added.textContent = '卸载后'
        element.appendChild(added)
        await new Promise((resolve) => {
            setTimeout(resolve, 30)
        })

        expect(dataUrlCalls).toBe(after)
    })

    it('图片水印绘制图片，加载完成后写入遮罩', async () => {
        class FakeImage {
            onload: (() => void) | null = null
            onerror: (() => void) | null = null
            crossOrigin = ''
            private source = ''

            set src(value: string) {
                this.source = value
                queueMicrotask(() => {
                    this.onload?.()
                })
            }

            get src(): string {
                return this.source
            }
        }
        vi.stubGlobal('Image', FakeImage)

        const { wrapper } = mountWatermark({ image: '/logo.png' })
        await vi.waitFor(() => {
            expect(tileContext().drawImage).toHaveBeenCalled()
        })
        expect(wrapper.get('.caomei-watermark__overlay').attributes('style')).toContain('data:image/png;base64,WATERMARK')
    })

    it('无文本与图片时不写入背景并清空层级', async () => {
        const { props, wrapper } = mountWatermark({ content: '内部资料' })
        await nextTick()

        props.content = undefined as unknown as string
        await vi.waitFor(() => {
            expect(wrapper.get('.caomei-watermark__overlay').attributes('style') ?? '').not.toContain('background-image')
        })

        const style = wrapper.get('.caomei-watermark__overlay').attributes('style') ?? ''
        expect(style).not.toContain('--caomei-watermark-z-index')
        expect(style).not.toContain('background-size')
        expect(style).not.toContain('background-position')
    })
})
