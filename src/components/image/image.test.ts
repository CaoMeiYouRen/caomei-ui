import { enableAutoUnmount, mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { CaomeiImage } from './index'

enableAutoUnmount(afterEach)

type IOCallback = ConstructorParameters<typeof IntersectionObserver>[0]

class MockIntersectionObserver {
    static instances: MockIntersectionObserver[] = []

    callback: IOCallback
    observe = vi.fn()
    disconnect = vi.fn()
    unobserve = vi.fn()
    root = null
    rootMargin = ''
    thresholds = []

    constructor(callback: IOCallback) {
        this.callback = callback
        MockIntersectionObserver.instances.push(this)
    }

    trigger(isIntersecting: boolean): void {
        this.callback(
            [{ isIntersecting }] as IntersectionObserverEntry[],
            this as unknown as IntersectionObserver,
        )
    }

    takeRecords(): IntersectionObserverEntry[] {
        return []
    }
}

const originalIntersectionObserver = globalThis.IntersectionObserver

beforeEach(() => {
    MockIntersectionObserver.instances = []
    globalThis.IntersectionObserver = MockIntersectionObserver as unknown as typeof IntersectionObserver
})

afterEach(() => {
    globalThis.IntersectionObserver = originalIntersectionObserver
})

function mountImage(props: Record<string, unknown> = {}, options: Record<string, unknown> = {}) {
    return mount(CaomeiImage, {
        props: { src: '/a.png', ...props },
        ...options,
    })
}

/** 临时伪造图片已完成 / 尺寸状态，用于模拟 SSR 直出后水合的场景 */
function stubImageState(complete: boolean, naturalWidth: number): () => void {
    const completeDescriptor = Object.getOwnPropertyDescriptor(HTMLImageElement.prototype, 'complete')
    const naturalWidthDescriptor = Object.getOwnPropertyDescriptor(HTMLImageElement.prototype, 'naturalWidth')
    Object.defineProperty(HTMLImageElement.prototype, 'complete', { configurable: true, get: () => complete })
    Object.defineProperty(HTMLImageElement.prototype, 'naturalWidth', { configurable: true, get: () => naturalWidth })
    return () => {
        if (completeDescriptor) {
            Object.defineProperty(HTMLImageElement.prototype, 'complete', completeDescriptor)
        }
        if (naturalWidthDescriptor) {
            Object.defineProperty(HTMLImageElement.prototype, 'naturalWidth', naturalWidthDescriptor)
        }
    }
}

describe('CaomeiImage', () => {
    it('非懒加载时立即渲染 img 与 alt，并处于加载中状态', () => {
        const wrapper = mountImage({ alt: '示例图' })

        const img = wrapper.get('img')
        expect(img.attributes('src')).toBe('/a.png')
        expect(img.attributes('alt')).toBe('示例图')
        expect(wrapper.get('.caomei-image').classes()).toContain('caomei-image--loading')
        expect(wrapper.find('.caomei-image__placeholder').exists()).toBe(true)
    })

    it('load 后进入已加载状态并移除占位', async () => {
        const wrapper = mountImage()

        await wrapper.get('img').trigger('load')

        expect(wrapper.get('.caomei-image').classes()).toContain('caomei-image--loaded')
        expect(wrapper.find('.caomei-image__placeholder').exists()).toBe(false)
        expect(wrapper.emitted('load')).toHaveLength(1)
    })

    it('error 后显示失败占位并抛出 error', async () => {
        const wrapper = mountImage()

        await wrapper.get('img').trigger('error')

        expect(wrapper.get('.caomei-image').classes()).toContain('caomei-image--error')
        expect(wrapper.find('.caomei-image__placeholder').exists()).toBe(true)
        expect(wrapper.emitted('error')).toHaveLength(1)
    })

    it('ratio 映射容器 aspect-ratio', () => {
        const wrapper = mountImage({ ratio: '16 / 9' })
        expect(wrapper.get('.caomei-image').attributes('style')).toContain('aspect-ratio: 16 / 9')

        const numeric = mountImage({ ratio: 1.5 })
        expect(numeric.get('.caomei-image').attributes('style')).toContain('aspect-ratio: 1.5')
    })

    it('fit 映射图片 object-fit', () => {
        const wrapper = mountImage({ fit: 'contain' })
        expect(wrapper.get('img').attributes('style')).toContain('object-fit: contain')
    })

    it('懒加载时进入视口前不请求图片，进入后渲染 img', async () => {
        const wrapper = mountImage({ lazy: true, ratio: 1 })

        expect(wrapper.find('img').exists()).toBe(false)
        expect(wrapper.find('.caomei-image__placeholder').exists()).toBe(true)
        expect(MockIntersectionObserver.instances).toHaveLength(1)

        MockIntersectionObserver.instances[0].trigger(true)
        await nextTick()

        expect(wrapper.find('img').exists()).toBe(true)
        expect(MockIntersectionObserver.instances[0].disconnect).toHaveBeenCalled()
    })

    it('src 变化时重置为加载中状态', async () => {
        const wrapper = mountImage()
        await wrapper.get('img').trigger('load')
        expect(wrapper.get('.caomei-image').classes()).toContain('caomei-image--loaded')

        await wrapper.setProps({ src: '/b.png' })

        expect(wrapper.get('.caomei-image').classes()).toContain('caomei-image--loading')
    })

    it('loading / error 插槽可自定义占位内容', async () => {
        const wrapper = mount(CaomeiImage, {
            props: { src: '/a.png' },
            slots: {
                loading: '<span class="my-loading">加载中</span>',
                error: '<span class="my-error">加载失败</span>',
            },
        })

        expect(wrapper.get('.my-loading').text()).toBe('加载中')

        await wrapper.get('img').trigger('error')
        expect(wrapper.get('.my-error').text()).toBe('加载失败')
    })

    it('挂载时图片已完成加载则直接进入已加载状态（SSR 水合兜底）', async () => {
        const restore = stubImageState(true, 32)
        try {
            const wrapper = mountImage()
            await nextTick()

            expect(wrapper.get('.caomei-image').classes()).toContain('caomei-image--loaded')
            expect(wrapper.find('.caomei-image__placeholder').exists()).toBe(false)
        } finally {
            restore()
        }
    })

    it('挂载时图片已完成但无尺寸则进入失败状态', async () => {
        const restore = stubImageState(true, 0)
        try {
            const wrapper = mountImage()
            await nextTick()

            expect(wrapper.get('.caomei-image').classes()).toContain('caomei-image--error')
        } finally {
            restore()
        }
    })

    it('class 透传到根元素', () => {
        const wrapper = mountImage({ class: 'custom-image' })
        expect(wrapper.get('.caomei-image').classes()).toContain('custom-image')
    })
})
