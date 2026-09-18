import { enableAutoUnmount, mount } from '@vue/test-utils'
import { computed, defineComponent, h, markRaw, nextTick } from 'vue'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { caomeiLocaleKey } from '../../composables/use-locale'
import { caomeiLocales } from '../../locale'
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
    document.body.innerHTML = ''
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

/** 加载图片，把组件推进到可点击预览的已加载状态 */
async function loadImage(wrapper: ReturnType<typeof mountImage>): Promise<void> {
    await wrapper.get('img').trigger('load')
    await nextTick()
}

function getPreviewDialog(): HTMLElement | null {
    return document.querySelector('[role="dialog"]')
}

/** 预览遮罩经 Reka Presence 挂载 / 卸载，需多等一拍让状态落地 */
async function settle(): Promise<void> {
    await nextTick()
    await nextTick()
}

async function openPreview(wrapper: ReturnType<typeof mountImage>): Promise<void> {
    await loadImage(wrapper)
    await wrapper.get('.caomei-image__preview-trigger').trigger('click')
    await settle()
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

describe('CaomeiImage preview', () => {
    it('未开启 preview 时不渲染预览入口与遮罩', () => {
        const wrapper = mountImage()

        expect(wrapper.find('.caomei-image__preview-trigger').exists()).toBe(false)
        expect(getPreviewDialog()).toBeNull()
    })

    it('加载成功前不渲染预览入口，加载后才出现', async () => {
        const wrapper = mountImage({ preview: true })

        expect(wrapper.find('.caomei-image__preview-trigger').exists()).toBe(false)
        expect(wrapper.get('.caomei-image').classes()).toContain('caomei-image--loading')

        await loadImage(wrapper)

        expect(wrapper.find('.caomei-image__preview-trigger').exists()).toBe(true)
    })

    it('加载失败时不渲染预览入口', async () => {
        const wrapper = mountImage({ preview: true })

        await wrapper.get('img').trigger('error')
        await nextTick()

        expect(wrapper.find('.caomei-image__preview-trigger').exists()).toBe(false)
    })

    it('点击预览入口打开遮罩、抛出 show，并在放大图中沿用 src 与 alt', async () => {
        const wrapper = mountImage({ preview: true, alt: '示例图' })

        await openPreview(wrapper)

        expect(wrapper.emitted('show')).toEqual([[]])
        const dialog = getPreviewDialog()
        expect(dialog).not.toBeNull()
        expect(dialog?.getAttribute('aria-modal')).toBe('true')
        expect(document.querySelector('.caomei-image__preview-overlay')).not.toBeNull()
        const enlarged = dialog?.querySelector('.caomei-image__preview-img')
        expect(enlarged?.getAttribute('src')).toBe('/a.png')
        expect(enlarged?.getAttribute('alt')).toBe('示例图')
    })

    it('预览入口与关闭按钮使用内建 locale 可访问名', async () => {
        const wrapper = mountImage({ preview: true, alt: '示例图' })
        await loadImage(wrapper)

        expect(wrapper.get('.caomei-image__preview-trigger').attributes('aria-label')).toBe('预览图片')

        await wrapper.get('.caomei-image__preview-trigger').trigger('click')
        await settle()

        expect(document.querySelector('.caomei-image__preview-close')?.getAttribute('aria-label')).toBe('关闭')
    })

    it('预览遮罩的可访问名取内建 locale 文案', async () => {
        const wrapper = mountImage({ preview: true })

        await openPreview(wrapper)

        const labelledby = getPreviewDialog()?.getAttribute('aria-labelledby')
        expect(document.getElementById(labelledby as string)?.textContent).toBe('图片预览')
    })

    it('使用注入 locale 的预览文案', async () => {
        const wrapper = mountImage({ preview: true }, {
            global: {
                provide: { [caomeiLocaleKey]: computed(() => caomeiLocales['en-US']) },
            },
        })

        await openPreview(wrapper)

        expect(wrapper.get('.caomei-image__preview-trigger').attributes('aria-label')).toBe('Preview image')
        const labelledby = getPreviewDialog()?.getAttribute('aria-labelledby')
        expect(document.getElementById(labelledby as string)?.textContent).toBe('Image preview')
    })

    it('点击关闭按钮关闭遮罩并抛出 hide', async () => {
        const wrapper = mountImage({ preview: true })

        await openPreview(wrapper)
        ;(document.querySelector('.caomei-image__preview-close') as HTMLElement).click()
        await settle()

        expect(getPreviewDialog()).toBeNull()
        expect(wrapper.emitted('hide')).toEqual([[]])
    })

    it('按下 Escape 关闭遮罩', async () => {
        const wrapper = mountImage({ preview: true })

        await openPreview(wrapper)
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
        await settle()

        expect(getPreviewDialog()).toBeNull()
        expect(wrapper.emitted('hide')).toEqual([[]])
    })

    it('preview 由真转假时收回已打开的遮罩', async () => {
        const wrapper = mountImage({ preview: true })

        await openPreview(wrapper)
        expect(getPreviewDialog()).not.toBeNull()

        await wrapper.setProps({ preview: false })
        await settle()

        expect(getPreviewDialog()).toBeNull()
        expect(wrapper.emitted('hide')).toEqual([[]])
    })

    it('位移指示器使用默认 Eye 图标，可用 previewIcon 覆盖', async () => {
        const CustomIcon = markRaw(defineComponent({
            name: 'CustomPreviewIcon',
            render: () => h('span', { class: 'custom-preview-icon' }),
        }))

        const withDefault = mountImage({ preview: true })
        await loadImage(withDefault)
        expect(withDefault.find('.caomei-image__preview-trigger svg').exists()).toBe(true)
        withDefault.unmount()

        const withCustom = mountImage({ preview: true, previewIcon: CustomIcon })
        await loadImage(withCustom)
        expect(withCustom.find('.custom-preview-icon').exists()).toBe(true)
        expect(withCustom.find('.caomei-image__preview-trigger svg').exists()).toBe(false)
    })

    it('indicatoricon 插槽整体替换指示器内容', async () => {
        const wrapper = mountImage({ preview: true }, {
            slots: { indicatoricon: '<span class="my-indicator">放大</span>' },
        })

        expect(wrapper.find('.my-indicator').exists()).toBe(false)

        await loadImage(wrapper)

        expect(wrapper.get('.my-indicator').text()).toBe('放大')
        expect(wrapper.find('.caomei-image__preview-trigger svg').exists()).toBe(false)
    })

    it('关闭后焦点回到预览入口（覆盖打开前入口未获焦的路径）', async () => {
        const wrapper = mountImage({ preview: true }, { attachTo: document.body })
        await loadImage(wrapper)

        const trigger = wrapper.get('.caomei-image__preview-trigger')
        expect(document.activeElement).not.toBe(trigger.element)

        await trigger.trigger('click')
        await settle()

        ;(document.querySelector('.caomei-image__preview-close') as HTMLElement).click()
        await settle()

        expect(document.activeElement).toBe(trigger.element)
    })
})
