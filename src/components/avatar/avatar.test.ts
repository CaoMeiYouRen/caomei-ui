import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import { CaomeiAvatar } from './index'

/** 可控的 Image 替身：令 happy-dom 无法真实触发的 load / error 变得可注入 */
class FakeImage {
    static instances: FakeImage[] = []

    complete = false

    naturalWidth = 0

    src = ''

    referrerPolicy = ''

    crossOrigin: string | null = null

    private listeners = new Map<string, Set<() => void>>()

    constructor() {
        FakeImage.instances.push(this)
    }

    addEventListener(type: string, handler: () => void): void {
        const set = this.listeners.get(type) ?? new Set()
        set.add(handler)
        this.listeners.set(type, set)
    }

    removeEventListener(type: string, handler: () => void): void {
        this.listeners.get(type)?.delete(handler)
    }

    dispatch(type: 'load' | 'error'): void {
        if (type === 'load') {
            this.complete = true
            this.naturalWidth = 1
        }
        this.listeners.get(type)?.forEach((handler) => handler())
    }
}

function lastImage(): FakeImage {
    return FakeImage.instances[FakeImage.instances.length - 1]
}

function getRoot(wrapper: ReturnType<typeof mount>) {
    return wrapper.get('.caomei-avatar')
}

describe('CaomeiAvatar', () => {
    beforeEach(() => {
        FakeImage.instances = []
        vi.stubGlobal('Image', FakeImage)
    })

    afterEach(() => {
        vi.unstubAllGlobals()
        vi.useRealTimers()
    })

    it('默认渲染回退态与 md / circle 档位', () => {
        const wrapper = mount(CaomeiAvatar)

        const root = getRoot(wrapper)
        expect(root.element.tagName).toBe('SPAN')
        expect(root.classes()).toContain('caomei-avatar--md')
        expect(root.classes()).toContain('caomei-avatar--circle')
        expect(wrapper.find('.caomei-avatar__image').exists()).toBe(false)
        expect(wrapper.find('.caomei-avatar__fallback').exists()).toBe(true)
    })

    it('提供 src 时渲染图片并透传 alt', () => {
        const wrapper = mount(CaomeiAvatar, {
            props: { src: 'https://example.com/a.png', alt: '头像' },
        })

        const image = wrapper.get('.caomei-avatar__image')
        expect(image.element.tagName).toBe('IMG')
        expect(image.attributes('src')).toBe('https://example.com/a.png')
        expect(image.attributes('alt')).toBe('头像')
        expect(image.attributes('role')).toBe('img')
    })

    it('无 src 时不渲染图片', () => {
        const wrapper = mount(CaomeiAvatar, { props: { alt: '头像' } })

        expect(wrapper.find('.caomei-avatar__image').exists()).toBe(false)
    })

    it('图片加载成功后隐藏回退内容', async () => {
        const wrapper = mount(CaomeiAvatar, {
            props: { src: 'https://example.com/a.png', alt: 'Alice' },
        })
        await nextTick()

        lastImage().dispatch('load')
        await nextTick()

        expect(wrapper.find('.caomei-avatar__fallback').exists()).toBe(false)
    })

    it('图片加载失败后显示回退内容', async () => {
        const wrapper = mount(CaomeiAvatar, {
            props: { src: 'https://example.com/a.png', alt: 'Alice' },
        })
        await nextTick()

        lastImage().dispatch('error')
        await nextTick()

        const fallback = wrapper.get('.caomei-avatar__fallback')
        expect(fallback.text()).toBe('A')
        expect(fallback.attributes('aria-label')).toBe('Alice')
    })

    it('加载成功后 src 置空时回退内容重新出现', async () => {
        const wrapper = mount(CaomeiAvatar, {
            props: { src: 'https://example.com/a.png', alt: 'Alice' },
        })
        await nextTick()
        lastImage().dispatch('load')
        await nextTick()
        expect(wrapper.find('.caomei-avatar__fallback').exists()).toBe(false)

        await wrapper.setProps({ src: '' })
        await nextTick()

        expect(wrapper.find('.caomei-avatar__image').exists()).toBe(false)
        expect(wrapper.get('.caomei-avatar__fallback').text()).toBe('A')
    })

    it('fallback 属性渲染回退文本', () => {
        const wrapper = mount(CaomeiAvatar, { props: { fallback: 'CM' } })

        expect(wrapper.get('.caomei-avatar__fallback').text()).toBe('CM')
    })

    it('缺省时取 alt 首字符并大写', () => {
        const wrapper = mount(CaomeiAvatar, { props: { alt: 'alice' } })

        expect(wrapper.get('.caomei-avatar__fallback').text()).toBe('A')
    })

    it('fallback 属性优先于 alt 推导', () => {
        const wrapper = mount(CaomeiAvatar, { props: { alt: 'alice', fallback: 'AL' } })

        expect(wrapper.get('.caomei-avatar__fallback').text()).toBe('AL')
    })

    it('fallback 插槽自定义回退内容', () => {
        const wrapper = mount(CaomeiAvatar, {
            props: { alt: 'alice' },
            slots: { fallback: '<span data-test="f">自定义</span>' },
        })

        expect(wrapper.get('.caomei-avatar__fallback').find('[data-test="f"]').exists()).toBe(true)
    })

    it('有 alt 时回退内容暴露 role=img 与 aria-label', () => {
        const wrapper = mount(CaomeiAvatar, { props: { alt: '头像' } })

        const fallback = wrapper.get('.caomei-avatar__fallback')
        expect(fallback.attributes('role')).toBe('img')
        expect(fallback.attributes('aria-label')).toBe('头像')
    })

    it('无 alt 时回退内容不输出 role 与 aria-label', () => {
        const wrapper = mount(CaomeiAvatar)

        const fallback = wrapper.get('.caomei-avatar__fallback')
        expect(fallback.attributes('role')).toBeUndefined()
        expect(fallback.attributes('aria-label')).toBeUndefined()
    })

    it('使用回退插槽时不覆盖其语义', () => {
        const wrapper = mount(CaomeiAvatar, {
            props: { alt: '头像' },
            slots: { fallback: '<button type="button">操作</button>' },
        })

        const fallback = wrapper.get('.caomei-avatar__fallback')
        expect(fallback.attributes('role')).toBeUndefined()
        expect(fallback.attributes('aria-label')).toBeUndefined()
        expect(fallback.find('button').exists()).toBe(true)
    })

    it('delayMs 延迟渲染回退内容', async () => {
        vi.useFakeTimers()
        const wrapper = mount(CaomeiAvatar, { props: { alt: 'A', delayMs: 100 } })

        expect(wrapper.find('.caomei-avatar__fallback').exists()).toBe(false)

        vi.advanceTimersByTime(100)
        await nextTick()

        expect(wrapper.find('.caomei-avatar__fallback').exists()).toBe(true)
    })

    it('delayMs 为 0 时立即渲染回退内容', () => {
        const wrapper = mount(CaomeiAvatar, { props: { alt: 'A', delayMs: 0 } })

        expect(wrapper.get('.caomei-avatar__fallback').text()).toBe('A')
    })

    it.each(['sm', 'md', 'lg'] as const)('应用尺寸类 %s', (size) => {
        const wrapper = mount(CaomeiAvatar, { props: { size } })

        expect(getRoot(wrapper).classes()).toContain(`caomei-avatar--${size}`)
    })

    it('square 形状应用对应类', () => {
        const wrapper = mount(CaomeiAvatar, { props: { shape: 'square' } })

        expect(getRoot(wrapper).classes()).toContain('caomei-avatar--square')
    })

    it('class 与其余属性透传到根元素', () => {
        const wrapper = mount(CaomeiAvatar, {
            attrs: { class: 'custom', 'data-test': 'avatar' },
        })

        const root = getRoot(wrapper)
        expect(root.classes()).toContain('custom')
        expect(root.attributes('data-test')).toBe('avatar')
    })
})
