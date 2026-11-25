import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { AnchorItem } from './types'
import { CaomeiAnchor } from './index'

const wrappers: ReturnType<typeof mount>[] = []

const ITEMS: AnchorItem[] = [
    { key: 'intro', title: '介绍' },
    {
        key: 'guide',
        title: '指南',
        children: [
            { key: 'install', title: '安装' },
            { key: 'usage', title: '用法' },
        ],
    },
]

function makeHeading(id: string, top: number): HTMLElement {
    const element = document.createElement('h2')
    element.id = id
    element.textContent = id
    element.getBoundingClientRect = () => ({
        top,
        left: 0,
        width: 100,
        height: 20,
        right: 100,
        bottom: top + 20,
        x: 0,
        y: top,
        toJSON: () => ({}),
    }) as DOMRect
    element.scrollIntoView = vi.fn()
    document.body.append(element)
    return element
}

async function flush(): Promise<void> {
    for (let index = 0; index < 6; index++) {
        await nextTick()
    }
    await new Promise((resolve) => {
        setTimeout(resolve, 30)
    })
}

afterEach(() => {
    for (const wrapper of wrappers.splice(0)) {
        wrapper.unmount()
    }
    document.body.innerHTML = ''
    history.replaceState(null, '', `${window.location.pathname}${window.location.search}`)
    vi.restoreAllMocks()
})

describe('CaomeiAnchor', () => {
    it('渲染嵌套条目并标记当前项', async () => {
        const wrapper = mount(CaomeiAnchor, {
            props: { items: ITEMS, active: 'install' },
            attachTo: document.body,
        })
        wrappers.push(wrapper)
        await flush()

        const nav = document.querySelector('.caomei-anchor')
        expect(nav?.getAttribute('aria-label')).toBe('锚点导航')
        const links = [...document.querySelectorAll<HTMLAnchorElement>('.caomei-anchor__link')]
        expect(links).toHaveLength(4)
        expect(links[0]?.getAttribute('href')).toBe('#intro')
        expect(links[2]?.getAttribute('href')).toBe('#install')
        expect(links[2]?.getAttribute('aria-current')).toBe('location')
        const items = [...document.querySelectorAll<HTMLElement>('.caomei-anchor__item')]
        expect(items[2]?.style.getPropertyValue('--caomei-anchor-depth')).toBe('1')
    })

    it('scroll-spy 取顶部越过判定线的最后一个标题', async () => {
        makeHeading('intro', -120)
        makeHeading('guide', -40)
        makeHeading('install', 5)
        makeHeading('usage', 80)

        const wrapper = mount(CaomeiAnchor, {
            props: { items: ITEMS, offset: 12 },
            attachTo: document.body,
        })
        wrappers.push(wrapper)
        await flush()

        expect(wrapper.emitted('update:active')?.at(-1)).toEqual(['install'])
        const current = document.querySelector('.caomei-anchor__link[aria-current="location"]')
        expect(current?.getAttribute('href')).toBe('#install')
    })

    it('判定线边界：标题恰好落在偏移线上时激活', async () => {
        makeHeading('intro', -200)
        makeHeading('guide', 12)
        makeHeading('install', 12.5)

        const wrapper = mount(CaomeiAnchor, {
            props: { items: ITEMS, offset: 12 },
            attachTo: document.body,
        })
        wrappers.push(wrapper)
        await flush()

        expect(wrapper.emitted('update:active')?.at(-1)).toEqual(['guide'])
    })

    it('滚动后重新计算激活项', async () => {
        makeHeading('intro', -300)
        makeHeading('guide', -200)
        makeHeading('install', -100)
        const usage = makeHeading('usage', 400)

        const wrapper = mount(CaomeiAnchor, {
            props: { items: ITEMS },
            attachTo: document.body,
        })
        wrappers.push(wrapper)
        await flush()
        expect(wrapper.emitted('update:active')?.at(-1)).toEqual(['install'])

        // 内容下移：usage 越过判定线
        usage.getBoundingClientRect = () => ({
            top: -20, left: 0, width: 100, height: 20, right: 100, bottom: 0, x: 0, y: -20, toJSON: () => ({}),
        }) as DOMRect
        window.dispatchEvent(new Event('scroll'))
        await flush()

        expect(wrapper.emitted('update:active')?.at(-1)).toEqual(['usage'])
    })

    it('点击条目写回模型、更新 hash 并滚动', async () => {
        makeHeading('intro', -100)
        makeHeading('install', 50)
        makeHeading('guide', 20)
        makeHeading('usage', 200)
        const scrollTo = vi.fn()
        window.scrollTo = scrollTo as unknown as typeof window.scrollTo

        const wrapper = mount(CaomeiAnchor, {
            props: { items: ITEMS },
            attachTo: document.body,
        })
        wrappers.push(wrapper)
        await flush()

        const link = document.querySelector<HTMLAnchorElement>('.caomei-anchor__link[href="#install"]')
        link?.click()
        await flush()

        expect(wrapper.emitted('update:active')?.at(-1)).toEqual(['install'])
        expect(window.location.hash).toBe('#install')
        expect(scrollTo).toHaveBeenCalled()
    })

    it('hashchange 同步激活项', async () => {
        makeHeading('intro', -100)
        makeHeading('guide', 10)
        makeHeading('install', 100)
        makeHeading('usage', 200)

        const wrapper = mount(CaomeiAnchor, {
            props: { items: ITEMS },
            attachTo: document.body,
        })
        wrappers.push(wrapper)
        await flush()

        window.location.hash = '#usage'
        window.dispatchEvent(new HashChangeEvent('hashchange'))
        await flush()

        expect(wrapper.emitted('update:active')?.at(-1)).toEqual(['usage'])
    })

    it('容器元素的滚动与相对判定线生效', async () => {
        const scroller = document.createElement('div')
        scroller.getBoundingClientRect = () => ({
            top: 100, left: 0, width: 400, height: 300, right: 400, bottom: 400, x: 0, y: 100, toJSON: () => ({}),
        }) as DOMRect
        document.body.append(scroller)

        makeHeading('intro', 90)
        const guide = makeHeading('guide', 108)
        makeHeading('install', 160)

        const wrapper = mount(CaomeiAnchor, {
            props: { items: ITEMS, container: scroller, offset: 12 },
            attachTo: document.body,
        })
        wrappers.push(wrapper)
        await flush()

        // 判定线 = 100 + 12 = 112：guide(108) 越过，install(160) 未越过
        expect(wrapper.emitted('update:active')?.at(-1)).toEqual(['guide'])

        guide.getBoundingClientRect = () => ({
            top: 120, left: 0, width: 100, height: 20, right: 100, bottom: 140, x: 0, y: 120, toJSON: () => ({}),
        }) as DOMRect
        scroller.dispatchEvent(new Event('scroll'))
        await flush()

        expect(wrapper.emitted('update:active')?.at(-1)).toEqual(['intro'])
    })

    it('所有目标都未渲染时保留受控值', async () => {
        const wrapper = mount(CaomeiAnchor, {
            props: { items: ITEMS, active: 'guide' },
            attachTo: document.body,
        })
        wrappers.push(wrapper)
        await flush()

        expect(wrapper.emitted('update:active')).toBeUndefined()
        expect(document.querySelector('.caomei-anchor__link[href="#guide"]')?.getAttribute('aria-current')).toBe('location')
    })

    it('首个目标缺失时回退到首个已解析条目', async () => {
        makeHeading('guide', 5)
        makeHeading('install', 80)
        makeHeading('usage', 200)

        const wrapper = mount(CaomeiAnchor, {
            props: { items: ITEMS, offset: 12 },
            attachTo: document.body,
        })
        wrappers.push(wrapper)
        await flush()

        expect(wrapper.emitted('update:active')?.at(-1), '不得指向未渲染的 intro').toEqual(['guide'])
    })

    it('内容晚于锚点挂载时，滚动仍能解析并激活', async () => {
        const wrapper = mount(CaomeiAnchor, {
            props: { items: ITEMS },
            attachTo: document.body,
        })
        wrappers.push(wrapper)
        await flush()
        expect(wrapper.emitted('update:active')).toBeUndefined()

        makeHeading('intro', -100)
        makeHeading('guide', 10)
        makeHeading('install', 100)
        makeHeading('usage', 200)
        window.dispatchEvent(new Event('scroll'))
        await flush()

        expect(wrapper.emitted('update:active')?.at(-1)).toEqual(['guide'])
    })

    it('目标缺失时点击走原生锚点兜底且不抛异常', async () => {
        makeHeading('intro', -100)

        const wrapper = mount(CaomeiAnchor, {
            props: { items: ITEMS },
            attachTo: document.body,
        })
        wrappers.push(wrapper)
        await flush()

        expect(() => {
            document.querySelector<HTMLAnchorElement>('.caomei-anchor__link[href="#usage"]')?.click()
        }).not.toThrow()
        await flush()
        // 目标未渲染时保留原生 <a href="#id"> 行为：hash 更新由浏览器完成
        expect(window.location.hash).toBe('#usage')
        expect(wrapper.emitted('update:active')?.at(-1)).toEqual(['usage'])
    })

    it('自定义可访问名与禁用 hash 同步', async () => {
        makeHeading('intro', -100)
        const wrapper = mount(CaomeiAnchor, {
            props: { items: ITEMS, label: '目录', hashSync: false },
            attachTo: document.body,
        })
        wrappers.push(wrapper)
        await flush()

        expect(document.querySelector('.caomei-anchor')?.getAttribute('aria-label')).toBe('目录')
        document.querySelector<HTMLAnchorElement>('.caomei-anchor__link[href="#intro"]')?.click()
        await flush()
        expect(window.location.hash).not.toBe('#intro')
    })
})
